/**
 * Wallet routes: balance, live deposits/withdrawals, transaction history.
 */
const express = require('express');
const db = require('../db');
const runTransaction = require('../utils/transaction');
const requireAuth = require('../middleware/requireAuth');
const {
  createDeposit,
  createWithdrawal,
  getPaymentStatus,
  confirmOmariDeposit,
  isConfigured,
  LIVE_DEPOSIT_PROVIDERS,
  LIVE_WITHDRAWAL_PROVIDERS,
} = require('../utils/angwa');
const { validateWalletTransaction } = require('../utils/validation');

const router = express.Router();

const getWallet = db.prepare('SELECT id, balance FROM wallets WHERE userId = ?');
const updateBalance = db.prepare('UPDATE wallets SET balance = ? WHERE userId = ?');
const getUserProfile = db.prepare(`
  SELECT id, firstName, surname, phone, nationalId, username, status
  FROM users
  WHERE id = ?
`);
const insertTransaction = db.prepare(`
  INSERT INTO transactions (userId, type, provider, phone, amount, status, gatewayReference)
  VALUES (?, ?, ?, ?, ?, 'completed', ?)
`);
const insertFailedTransaction = db.prepare(`
  INSERT INTO transactions (userId, type, provider, phone, amount, status, gatewayReference)
  VALUES (?, ?, ?, ?, ?, 'failed', ?)
`);
const getTransactions = db.prepare(`
  SELECT id, type, provider, phone, amount, status, createdAt, gatewayReference
  FROM transactions
  WHERE userId = ?
  ORDER BY datetime(createdAt) DESC, id DESC
`);
const getPendingPayment = db.prepare(`
  SELECT reference, userId, type, provider, phone, amount
  FROM pending_payments
  WHERE reference = ?
`);
const insertPendingPayment = db.prepare(`
  INSERT INTO pending_payments (reference, userId, type, provider, phone, amount)
  VALUES (?, ?, ?, ?, ?, ?)
`);
const deletePendingPayment = db.prepare('DELETE FROM pending_payments WHERE reference = ?');
const getSettledByReference = db.prepare(`
  SELECT id, type, amount, status
  FROM transactions
  WHERE gatewayReference = ? AND userId = ?
`);

function logFailedTransaction(userId, type, payload = {}, reference = null) {
  const amount = Number(payload.amount);
  insertFailedTransaction.run(
    userId,
    type,
    payload.provider || 'Unknown',
    payload.phone || '',
    Number.isFinite(amount) && amount > 0 ? amount : 0,
    reference
  );
}

function extractGatewayMessage(gatewayResponse, fallback) {
  return (
    gatewayResponse?.message ||
    gatewayResponse?.error ||
    gatewayResponse?.providerMessage ||
    fallback
  );
}

function assertLivePaymentsEnabled(res) {
  if (!isConfigured()) {
    res.status(503).json({
      success: false,
      error:
        'Live payments are not configured. Set ANGWA_BASE_URL, ANGWA_API_KEY, ANGWA_API_SECRET, and ANGWA_MERCHANT_DOMAIN.',
    });
    return false;
  }
  return true;
}

function assertLiveProvider(type, provider, res) {
  const allowed =
    type === 'deposit' ? LIVE_DEPOSIT_PROVIDERS : LIVE_WITHDRAWAL_PROVIDERS;
  if (!allowed.includes(provider)) {
    res.status(400).json({
      success: false,
      error: `${provider} is not available for live ${type}.`,
    });
    return false;
  }
  return true;
}

function settlePayment(userId, pending, finalStatus) {
  const wallet = getWallet.get(userId);
  if (!wallet) {
    throw new Error('Wallet not found.');
  }

  const settledAmount =
    Number(finalStatus.amount || finalStatus.requestedAmount || pending.amount) ||
    pending.amount;

  let newBalance = wallet.balance;
  if (pending.type === 'deposit') {
    newBalance = Math.round((wallet.balance + settledAmount) * 100) / 100;
  } else {
    newBalance = Math.round((wallet.balance - settledAmount) * 100) / 100;
  }

  runTransaction(db, () => {
    updateBalance.run(newBalance, userId);
    insertTransaction.run(
      userId,
      pending.type,
      pending.provider,
      pending.phone,
      settledAmount,
      pending.reference
    );
    deletePendingPayment.run(pending.reference);
  });

  return { newBalance, settledAmount };
}

/** Current wallet balance and live payment provider lists. */
router.get('/wallet', requireAuth, (req, res) => {
  try {
    const wallet = getWallet.get(req.session.userId);
    if (!wallet) {
      return res.status(404).json({ success: false, error: 'Wallet not found.' });
    }

    const livePayments = isConfigured();
    res.json({
      success: true,
      balance: wallet.balance,
      livePayments,
      depositProviders: livePayments ? LIVE_DEPOSIT_PROVIDERS : [],
      withdrawProviders: livePayments ? LIVE_WITHDRAWAL_PROVIDERS : [],
    });
  } catch (err) {
    console.error('Wallet fetch error:', err);
    res.status(500).json({ success: false, error: 'Failed to load wallet.' });
  }
});

/** Start live deposit — customer approves on handset; poll /payment/confirm. */
router.post('/deposit', requireAuth, async (req, res) => {
  try {
    if (!assertLivePaymentsEnabled(res)) return;

    const { errors, data } = validateWalletTransaction(req.body);
    if (errors.length) {
      logFailedTransaction(req.session.userId, 'deposit', req.body);
      return res.status(400).json({ success: false, errors });
    }
    if (!assertLiveProvider('deposit', data.provider, res)) return;

    const wallet = getWallet.get(req.session.userId);
    if (!wallet) {
      return res.status(404).json({ success: false, error: 'Wallet not found.' });
    }

    const created = await createDeposit({
      provider: data.provider,
      amount: data.amount,
      phone: data.phone,
    });

    if (!created?.reference) {
      logFailedTransaction(req.session.userId, 'deposit', data);
      return res.status(502).json({
        success: false,
        error: 'Gateway did not return a payment reference for the deposit.',
      });
    }

    insertPendingPayment.run(
      created.reference,
      req.session.userId,
      'deposit',
      data.provider,
      data.phone,
      data.amount
    );

    const isOmari = data.provider === 'Omari';
    res.json({
      success: true,
      processing: true,
      requiresOtp: isOmari,
      reference: created.reference,
      message: isOmari
        ? extractGatewayMessage(created, 'An OTP was sent to your phone. Enter it to complete the deposit.')
        : extractGatewayMessage(created, 'Approve the payment on your phone. Waiting for confirmation…') ||
          'Approve the payment on your phone. Waiting for confirmation…',
    });
  } catch (err) {
    console.error('Deposit error:', err);
    logFailedTransaction(req.session.userId, 'deposit', req.body);
    res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Deposit failed. Please try again.',
    });
  }
});

/** Start live withdrawal — poll /payment/confirm until terminal. */
router.post('/withdraw', requireAuth, async (req, res) => {
  try {
    if (!assertLivePaymentsEnabled(res)) return;

    const { errors, data } = validateWalletTransaction(req.body);
    if (errors.length) {
      logFailedTransaction(req.session.userId, 'withdrawal', req.body);
      return res.status(400).json({ success: false, errors });
    }
    if (!assertLiveProvider('withdrawal', data.provider, res)) return;

    const wallet = getWallet.get(req.session.userId);
    if (!wallet) {
      return res.status(404).json({ success: false, error: 'Wallet not found.' });
    }

    const user = getUserProfile.get(req.session.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User account not found.' });
    }

    if (data.amount > wallet.balance) {
      logFailedTransaction(req.session.userId, 'withdrawal', data);
      return res.status(400).json({
        success: false,
        error: 'Insufficient balance. You cannot withdraw more than your wallet balance.',
      });
    }

    const created = await createWithdrawal({
      provider: data.provider,
      amount: data.amount,
      phone: data.phone,
      user,
    });

    if (!created?.reference) {
      logFailedTransaction(req.session.userId, 'withdrawal', data);
      return res.status(502).json({
        success: false,
        error: 'Gateway did not return a payment reference for the withdrawal.',
      });
    }

    insertPendingPayment.run(
      created.reference,
      req.session.userId,
      'withdrawal',
      data.provider,
      data.phone,
      data.amount
    );

    res.json({
      success: true,
      processing: true,
      reference: created.reference,
      message:
        extractGatewayMessage(created, 'Withdrawal initiated. Waiting for confirmation…') ||
        'Withdrawal initiated. Waiting for confirmation…',
    });
  } catch (err) {
    console.error('Withdraw error:', err);
    logFailedTransaction(req.session.userId, 'withdrawal', req.body);
    res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Withdrawal failed. Please try again.',
    });
  }
});

/** Submit Omari OTP to complete a pending deposit. */
router.post('/payment/omari/confirm', requireAuth, async (req, res) => {
  try {
    if (!assertLivePaymentsEnabled(res)) return;

    const reference = typeof req.body?.reference === 'string' ? req.body.reference.trim() : '';
    const otp = typeof req.body?.otp === 'string' ? req.body.otp.trim() : '';
    const phone = typeof req.body?.phone === 'string' ? req.body.phone.trim() : '';

    if (!reference || !otp) {
      return res.status(400).json({ success: false, error: 'Payment reference and OTP are required.' });
    }

    const pending = getPendingPayment.get(reference);
    if (!pending || pending.userId !== req.session.userId) {
      return res.status(404).json({ success: false, error: 'Payment not found or expired.' });
    }
    if (pending.type !== 'deposit' || pending.provider !== 'Omari') {
      return res.status(400).json({ success: false, error: 'This payment does not require Omari OTP confirmation.' });
    }

    const confirmed = await confirmOmariDeposit({
      reference,
      otp,
      phone: phone || pending.phone,
    });

    res.json({
      success: true,
      message: extractGatewayMessage(confirmed, 'OTP accepted. Waiting for payment confirmation…'),
    });
  } catch (err) {
    console.error('Omari OTP confirm error:', err);
    res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Failed to confirm Omari OTP.',
    });
  }
});

/** Poll gateway status and settle wallet once payment is terminal. */
router.post('/payment/confirm', requireAuth, async (req, res) => {
  try {
    if (!assertLivePaymentsEnabled(res)) return;

    const reference = typeof req.body?.reference === 'string' ? req.body.reference.trim() : '';
    if (!reference) {
      return res.status(400).json({ success: false, error: 'Payment reference is required.' });
    }

    const settled = getSettledByReference.get(reference, req.session.userId);
    if (settled) {
      const wallet = getWallet.get(req.session.userId);
      return res.json({
        success: true,
        completed: true,
        balance: wallet?.balance ?? 0,
        message: `${settled.type === 'deposit' ? 'Deposit' : 'Withdrawal'} already recorded.`,
      });
    }

    const pending = getPendingPayment.get(reference);
    if (!pending || pending.userId !== req.session.userId) {
      return res.status(404).json({ success: false, error: 'Payment not found or expired.' });
    }

    const finalStatus = await getPaymentStatus(reference);
    if (!finalStatus?.terminal) {
      return res.json({
        success: true,
        processing: true,
        status: finalStatus?.status || 'PROCESSING',
        message: extractGatewayMessage(
          finalStatus,
          'Payment is still processing. Approve on your phone if prompted.'
        ),
      });
    }

    if (String(finalStatus.status).toUpperCase() !== 'SUCCESS') {
      deletePendingPayment.run(reference);
      logFailedTransaction(req.session.userId, pending.type, pending, reference);
      return res.status(400).json({
        success: false,
        error: extractGatewayMessage(
          finalStatus,
          `${pending.type === 'deposit' ? 'Deposit' : 'Withdrawal'} failed at the payment gateway.`
        ),
      });
    }

    const { newBalance, settledAmount } = settlePayment(req.session.userId, pending, finalStatus);

    res.json({
      success: true,
      completed: true,
      balance: newBalance,
      amount: settledAmount,
      reference,
      message: extractGatewayMessage(
        finalStatus,
        `${pending.type === 'deposit' ? 'Deposit' : 'Withdrawal'} via ${pending.provider} successful.`
      ),
    });
  } catch (err) {
    console.error('Payment confirm error:', err);
    res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Failed to confirm payment.',
    });
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

