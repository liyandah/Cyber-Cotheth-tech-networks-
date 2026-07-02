/**
 * Authentication routes: register, create-account, login, logout, user profile.
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const runTransaction = require('../utils/transaction');
const requireAuth = require('../middleware/requireAuth');
const {
  validatePersonalDetails,
  validateAccountCreation,
  validateLogin,
} = require('../utils/validation');

const router = express.Router();
const WELCOME_BONUS = 5.0;

const findUserByUsername = db.prepare(
  'SELECT id, username, passwordHash, status FROM users WHERE username = ?'
);
const findUserByPhone = db.prepare('SELECT id FROM users WHERE phone = ?');
const findUserByNationalId = db.prepare('SELECT id FROM users WHERE nationalId = ?');
const findUserById = db.prepare(
  'SELECT id, firstName, surname, phone, nationalId, username, status, createdAt FROM users WHERE id = ?'
);
const insertPendingUser = db.prepare(`
  INSERT INTO users (firstName, surname, phone, nationalId, status)
  VALUES (?, ?, ?, ?, 'pending')
`);
const completeUserAccount = db.prepare(`
  UPDATE users SET username = ?, passwordHash = ?, status = 'active' WHERE id = ? AND status = 'pending'
`);
const createWallet = db.prepare('INSERT INTO wallets (userId, balance) VALUES (?, ?)');
const insertTransaction = db.prepare(`
  INSERT INTO transactions (userId, type, provider, phone, amount, status)
  VALUES (?, ?, ?, ?, ?, 'completed')
`);

/** Step 1: Save personal details before account credentials. */
router.post('/register', (req, res) => {
  try {
    const { errors, data } = validatePersonalDetails(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, errors });
    }

    if (findUserByPhone.get(data.phone)) {
      return res.status(409).json({ success: false, error: 'This phone number is already registered.' });
    }
    if (findUserByNationalId.get(data.nationalId)) {
      return res.status(409).json({ success: false, error: 'This National ID is already registered.' });
    }

    const result = insertPendingUser.run(
      data.firstName,
      data.surname,
      data.phone,
      data.nationalId
    );

    req.session.pendingUserId = result.lastInsertRowid;
    req.session.save((sessionErr) => {
      if (sessionErr) {
        console.error('Register session save error:', sessionErr);
        return res.status(500).json({ success: false, error: 'Registration session failed. Please try again.' });
      }

      res.json({
        success: true,
        message: 'Personal details saved. Continue to create your account.',
        userId: result.lastInsertRowid,
      });
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, error: 'Registration failed. Please try again.' });
  }
});

/** Step 2: Set username/password, create wallet with welcome bonus. */
router.post('/create-account', async (req, res) => {
  try {
    const userId = req.session.pendingUserId || req.body.userId;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'Complete personal details first.' });
    }

    const user = findUserById.get(userId);
    if (!user || user.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Invalid or already completed registration.' });
    }

    const { errors, data } = validateAccountCreation(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, errors });
    }

    if (findUserByUsername.get(data.username)) {
      return res.status(409).json({ success: false, error: 'Username is already taken.' });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    runTransaction(db, () => {
      const updated = completeUserAccount.run(data.username, passwordHash, userId);
      if (updated.changes === 0) {
        throw new Error('Account completion failed.');
      }

      createWallet.run(userId, WELCOME_BONUS);
      insertTransaction.run(
        userId,
        'deposit',
        'Welcome Bonus',
        user.phone,
        WELCOME_BONUS
      );
    });
    delete req.session.pendingUserId;
    req.session.userId = userId;
    req.session.save((sessionErr) => {
      if (sessionErr) {
        console.error('Create account session save error:', sessionErr);
        return res.status(500).json({ success: false, error: 'Account created, but session cleanup failed.' });
      }

      res.json({
        success: true,
        message: 'Account created successfully.',
        redirect: '/sporting/dashboard.html',
      });
    });
  } catch (err) {
    console.error('Create account error:', err);
    res.status(500).json({ success: false, error: 'Account creation failed. Please try again.' });
  }
});

/** Authenticate user and start session. */
router.post('/login', async (req, res) => {
  try {
    const { errors, data } = validateLogin(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, errors });
    }

    const user = findUserByUsername.get(data.username);
    if (!user || user.status !== 'active' || !user.passwordHash) {
      return res.status(401).json({ success: false, error: 'Invalid username or password.' });
    }

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid username or password.' });
    }

    req.session.userId = user.id;
    delete req.session.isAdmin;
    req.session.save((sessionErr) => {
      if (sessionErr) {
        console.error('Login session save error:', sessionErr);
        return res.status(500).json({ success: false, error: 'Login session failed. Please try again.' });
      }

      res.json({
        success: true,
        message: 'Login successful.',
        redirect: '/sporting/dashboard.html',
      });
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Login failed. Please try again.' });
  }
});

/** Destroy session on logout. */
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Logout failed.' });
    }
    res.clearCookie('cctn.sid');
    res.json({ success: true, redirect: '/sporting/login.html' });
  });
});

/** Return current logged-in user profile. */
router.get('/user', requireAuth, (req, res) => {
  try {
    const user = findUserById.get(req.session.userId);
    if (!user || user.status !== 'active') {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    res.json({
      success: true,
      user: {
        firstName: user.firstName,
        surname: user.surname,
        username: user.username,
        phone: user.phone,
        accountStatus: user.status,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('User fetch error:', err);
    res.status(500).json({ success: false, error: 'Failed to load user profile.' });
  }
});

module.exports = router;
