/**
 * Wallet routes: balance, simulated deposits/withdrawals, transaction history.
 */
const express = require('express');
const db = require('../db');
const runTransaction = require('../utils/transaction');
const requireAuth = require('../middleware/requireAuth');
const { validateWalletTransaction, PAYMENT_PROVIDERS } = require('../utils/validation');

const router = express.Router();

const getWallet = db.prepare('SELECT id, balance FROM wallets WHERE userId = ?');
const updateBalance = db.prepare('UPDATE wallets SET balance = ? WHERE userId = ?');
const insertTransaction = db.prepare(`
  INSERT INTO transactions (userId, type, provider, phone, amount, status)
  VALUES (?, ?, ?, ?, ?, 'completed')
`);
const insertFailedTransaction = db.prepare(`
  INSERT INTO transactions (userId, type, provider, phone, amount, status)
  VALUES (?, ?, ?, ?, ?, 'failed')
`);
const getTransactions = db.prepare(`
  SELECT id, type, provider, phone, amount, status, createdAt
  FROM transactions
  WHERE userId = ?
  ORDER BY datetime(createdAt) DESC, id DESC
`);

function logFailedTransaction(userId, type, payload = {}) {
  const amount = Number(payload.amount);
  insertFailedTransaction.run(
    userId,
    type,
    payload.provider || 'Unknown',
    payload.phone || '',
    Number.isFinite(amount) && amount > 0 ? amount : 0
  );
}

/** Current wallet balance for logged-in user. */
router.get('/wallet', requireAuth, (req, res) => {
  try {
    const wallet = getWallet.get(req.session.userId);
    if (!wallet) {
      return res.status(404).json({ success: false, error: 'Wallet not found.' });
    }

    res.json({
      success: true,
      balance: wallet.balance,
      providers: PAYMENT_PROVIDERS,
    });
  } catch (err) {
    console.error('Wallet fetch error:', err);
    res.status(500).json({ success: false, error: 'Failed to load wallet.' });
  }
});

/** Simulate instant deposit for testing. */
router.post('/deposit', requireAuth, (req, res) => {
  try {
    const { errors, data } = validateWalletTransaction(req.body);
    if (errors.length) {
      logFailedTransaction(req.session.userId, 'deposit', req.body);
      return res.status(400).json({ success: false, errors });
    }

    const wallet = getWallet.get(req.session.userId);
    if (!wallet) {
      return res.status(404).json({ success: false, error: 'Wallet not found.' });
    }

    const newBalance = Math.round((wallet.balance + data.amount) * 100) / 100;

    runTransaction(db, () => {
      updateBalance.run(newBalance, req.session.userId);
      insertTransaction.run(
        req.session.userId,
        'deposit',
        data.provider,
        data.phone,
        data.amount
      );
    });

    res.json({
      success: true,
      message: `Deposit of $${data.amount.toFixed(2)} via ${data.provider} successful.`,
      balance: newBalance,
    });
  } catch (err) {
    console.error('Deposit error:', err);
    res.status(500).json({ success: false, error: 'Deposit failed. Please try again.' });
  }
});

/** Simulate instant withdrawal with balance validation. */
router.post('/withdraw', requireAuth, (req, res) => {
  try {
    const { errors, data } = validateWalletTransaction(req.body);
    if (errors.length) {
      logFailedTransaction(req.session.userId, 'withdrawal', req.body);
      return res.status(400).json({ success: false, errors });
    }

    const wallet = getWallet.get(req.session.userId);
    if (!wallet) {
      return res.status(404).json({ success: false, error: 'Wallet not found.' });
    }

    if (data.amount > wallet.balance) {
      logFailedTransaction(req.session.userId, 'withdrawal', data);
      return res.status(400).json({
        success: false,
        error: 'Insufficient balance. You cannot withdraw more than your wallet balance.',
      });
    }

    const newBalance = Math.round((wallet.balance - data.amount) * 100) / 100;

    runTransaction(db, () => {
      updateBalance.run(newBalance, req.session.userId);
      insertTransaction.run(
        req.session.userId,
        'withdrawal',
        data.provider,
        data.phone,
        data.amount
      );
    });

    res.json({
      success: true,
      message: `Withdrawal of $${data.amount.toFixed(2)} via ${data.provider} successful.`,
      balance: newBalance,
    });
  } catch (err) {
    console.error('Withdraw error:', err);
    res.status(500).json({ success: false, error: 'Withdrawal failed. Please try again.' });
  }
});

/** Transaction history, newest first. */
router.get('/transactions', requireAuth, (req, res) => {
  try {
    const rows = getTransactions.all(req.session.userId);
    res.json({ success: true, transactions: rows });
  } catch (err) {
    console.error('Transactions fetch error:', err);
    res.status(500).json({ success: false, error: 'Failed to load transactions.' });
  }
});

module.exports = router;
