/**
 * Admin routes: login, overview, accounts, and transactions.
 */
const express = require('express');
const db = require('../db');
const requireAdmin = require('../middleware/requireAdmin');
const { verifyAdminCredentials } = require('../utils/adminAuth');

const router = express.Router();

const getAllUsers = db.prepare(`
  SELECT
    u.id,
    u.firstName,
    u.surname,
    u.phone,
    u.nationalId,
    u.username,
    u.status,
    u.createdAt,
    COALESCE(w.balance, 0) AS balance
  FROM users u
  LEFT JOIN wallets w ON w.userId = u.id
  ORDER BY datetime(u.createdAt) DESC, u.id DESC
`);

const getAllTransactions = db.prepare(`
  SELECT
    t.id,
    t.userId,
    u.username,
    u.firstName,
    u.surname,
    t.type,
    t.provider,
    t.phone,
    t.amount,
    t.status,
    t.createdAt
  FROM transactions t
  JOIN users u ON u.id = t.userId
  ORDER BY datetime(t.createdAt) DESC, t.id DESC
`);

const getStats = db.prepare(`
  SELECT
    (SELECT COUNT(*) FROM users) AS totalUsers,
    (SELECT COUNT(*) FROM users WHERE status = 'active') AS activeUsers,
    (SELECT COUNT(*) FROM users WHERE status = 'pending') AS pendingUsers,
    (SELECT COUNT(*) FROM transactions) AS totalTransactions,
    (SELECT COUNT(*) FROM transactions WHERE status = 'completed') AS completedTransactions,
    (SELECT COUNT(*) FROM transactions WHERE status = 'failed') AS failedTransactions,
    (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'deposit' AND status = 'completed') AS totalDeposits,
    (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'withdrawal' AND status = 'completed') AS totalWithdrawals
`);

/** Admin login. */
router.post('/admin/login', async (req, res) => {
  try {
    const username = req.body?.username;
    const password = req.body?.password;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password are required.' });
    }

    const valid = await verifyAdminCredentials(username, password);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid admin credentials.' });
    }

    req.session.isAdmin = true;
    delete req.session.userId;
    delete req.session.pendingUserId;

    res.json({
      success: true,
      message: 'Admin login successful.',
      redirect: '/sporting/admin/dashboard.html',
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ success: false, error: 'Admin login failed.' });
  }
});

/** Admin logout. */
router.post('/admin/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Admin logout failed.' });
    }
    res.clearCookie('cctn.sid');
    res.json({ success: true, redirect: '/sporting/admin/login.html' });
  });
});

/** Check admin session. */
router.get('/admin/me', (req, res) => {
  if (!req.session?.isAdmin) {
    return res.status(401).json({ success: false, error: 'Not authenticated as admin.' });
  }

  res.json({
    success: true,
    admin: { username: 'Admin' },
  });
});

/** Dashboard stats. */
router.get('/admin/stats', requireAdmin, (req, res) => {
  try {
    res.json({ success: true, stats: getStats.get() });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ success: false, error: 'Failed to load admin stats.' });
  }
});

/** All registered accounts. */
router.get('/admin/users', requireAdmin, (req, res) => {
  try {
    const users = getAllUsers.all().map((user) => ({
      id: user.id,
      firstName: user.firstName,
      surname: user.surname,
      fullName: `${user.firstName} ${user.surname}`,
      phone: user.phone,
      nationalId: user.nationalId,
      username: user.username || '—',
      status: user.status,
      balance: user.balance,
      createdAt: user.createdAt,
    }));

    res.json({ success: true, users });
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).json({ success: false, error: 'Failed to load accounts.' });
  }
});

/** All transactions (completed and failed). */
router.get('/admin/transactions', requireAdmin, (req, res) => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status.toLowerCase() : 'all';
    let transactions = getAllTransactions.all();

    if (status === 'completed' || status === 'failed') {
      transactions = transactions.filter((tx) => tx.status === status);
    }

    res.json({ success: true, transactions });
  } catch (err) {
    console.error('Admin transactions error:', err);
    res.status(500).json({ success: false, error: 'Failed to load transactions.' });
  }
});

module.exports = router;
