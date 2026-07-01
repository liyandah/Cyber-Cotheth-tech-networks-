/**
 * Test bet Wallet — overview, deposit, withdraw, history (simulated payments).
 */

const PAYMENT_METHODS = [
  {
    id: 'Voucher',
    logoClass: 'voucher',
    label: 'Voucher',
    range: '$1 - $100',
    meta: 'Buy a Test bet voucher and top up your wallet with the code.',
  },
  { id: 'InnBucks', logoClass: 'innbucks', label: 'InnBucks', range: '$1 - $500' },
  { id: 'Omari', logoClass: 'omari', label: 'Omari', range: '$1 - $500' },
  { id: 'EcoCash', logoClass: 'ecocash', label: 'EcoCash', range: '$1 - $500' },
  { id: 'OneMoney', logoClass: 'onemoney', label: 'OneMoney', range: '$1 - $500' },
];

const WITHDRAW_METHODS = PAYMENT_METHODS
  .filter((method) => method.id !== 'Voucher')
  .map((method) => ({ ...method, range: '$2 - $500' }));

const PROVIDER_NAMES = new Set(PAYMENT_METHODS.map((m) => m.id));

let currentBalance = 0;
let selectedDepositProvider = '';
let selectedWithdrawProvider = '';

function renderProviderLogo(method) {
  if (method.logoClass === 'voucher') {
    return '<div class="w-pay-card__logo w-pay-card__logo--voucher"><i class="fas fa-ticket"></i></div>';
  }
  if (method.logoClass === 'innbucks') {
    return '<div class="w-pay-card__logo w-pay-card__logo--innbucks"><span></span><span></span><span></span><span></span></div>';
  }
  if (method.logoClass === 'omari') {
    return '<div class="w-pay-card__logo w-pay-card__logo--omari">O</div>';
  }
  if (method.logoClass === 'ecocash') {
    return '<div class="w-pay-card__logo w-pay-card__logo--ecocash">ECO</div>';
  }
  return '<div class="w-pay-card__logo w-pay-card__logo--onemoney">ONE</div>';
}

function buildMethodCard(method, group) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'w-pay-card';
  btn.dataset.provider = method.id;
  btn.dataset.group = group;
  btn.innerHTML = `
    ${renderProviderLogo(method)}
    <div class="w-pay-card__info">
      <span class="w-pay-card__name">${method.label}</span>
      <span class="w-pay-card__meta">${method.meta || method.range + ' · Processing time varies'}</span>
    </div>
    <span class="w-pay-card__range">${method.range}</span>
    <span class="w-pay-card__badge">ZW</span>
  `;
  return btn;
}

function showAlert(message, type = 'success') {
  const el = document.getElementById('wallet-alert');
  el.textContent = message;
  el.className = 'w-alert w-alert--' + type;
  el.hidden = false;
}

function hideAlert() {
  document.getElementById('wallet-alert').hidden = true;
}

function switchTab(panelName) {
  document.querySelectorAll('.wallet-tab').forEach((t) => {
    t.classList.toggle('active', t.dataset.panel === panelName);
  });
  document.querySelectorAll('.wallet-panel').forEach((p) => {
    p.classList.toggle('active', p.id === 'panel-' + panelName);
  });
  hideAlert();
}

function resetDepositFlow() {
  selectedDepositProvider = '';
  document.getElementById('deposit-step-methods').classList.add('active');
  document.getElementById('deposit-step-form').classList.remove('active');
  document.getElementById('deposit-next').disabled = true;
  document.querySelectorAll('#deposit-methods .w-pay-card').forEach((c) => c.classList.remove('selected'));
  document.getElementById('deposit-form').reset();
}

function resetWithdrawFlow() {
  selectedWithdrawProvider = '';
  document.getElementById('withdraw-step-methods').classList.add('active');
  document.getElementById('withdraw-step-form').classList.remove('active');
  document.getElementById('withdraw-next').disabled = true;
  document.querySelectorAll('#withdraw-methods .w-pay-card').forEach((c) => c.classList.remove('selected'));
  document.getElementById('withdraw-form').reset();
}

function updateBalanceUI(balance) {
  currentBalance = balance;
  const formatted = SportingUI.formatMoney(balance);
  const amountOnly = balance.toFixed(2);

  document.getElementById('wallet-balance').textContent = amountOnly;
  document.getElementById('header-balance').textContent = formatted;
  document.getElementById('withdraw-available').textContent = formatted;
  document.getElementById('withdraw-max').textContent = formatted;
}

function computeBreakdown(transactions, balance) {
  let depositTotal = 0;
  let winTotal = 0;

  transactions.forEach((tx) => {
    if (tx.type === 'deposit') {
      if (PROVIDER_NAMES.has(tx.provider)) {
        depositTotal += tx.amount;
      } else {
        winTotal += tx.amount;
      }
    } else if (tx.type === 'withdrawal') {
      winTotal -= tx.amount;
    }
  });

  if (winTotal < 0) winTotal = 0;
  const check = Math.round((depositTotal + winTotal) * 100) / 100;
  if (Math.abs(check - balance) > 0.01) {
    winTotal = Math.max(0, Math.round((balance - depositTotal) * 100) / 100);
  }

  document.getElementById('stat-deposits').textContent = SportingUI.formatMoney(depositTotal);
  document.getElementById('stat-wins').textContent = SportingUI.formatMoney(winTotal);
}

function renderTransactions(transactions) {
  const tbody = document.getElementById('transactions-body');

  if (!transactions.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="w-empty">No transactions yet.</td></tr>';
    return;
  }

  tbody.innerHTML = transactions
    .map((tx) => {
      const isDeposit = tx.type === 'deposit';
      const badgeClass = isDeposit ? 'w-tx-badge--deposit' : 'w-tx-badge--withdrawal';
      const typeLabel = isDeposit ? 'Deposit' : 'Withdrawal';
      return `<tr>
        <td>${SportingUI.formatDate(tx.createdAt)}</td>
        <td><span class="w-tx-badge ${badgeClass}">${typeLabel}</span></td>
        <td>${tx.provider}</td>
        <td>${tx.phone}</td>
        <td>${SportingUI.formatMoney(tx.amount)}</td>
        <td>${tx.status}</td>
      </tr>`;
    })
    .join('');
}

async function refreshWallet() {
  const [walletRes, txRes] = await Promise.all([
    SportingAPI.getWallet(),
    SportingAPI.getTransactions(),
  ]);

  if (walletRes.ok) {
    updateBalanceUI(walletRes.data.balance);
  }

  const transactions = txRes.ok ? txRes.data.transactions : [];
  computeBreakdown(transactions, currentBalance);
  renderTransactions(transactions);
}

document.addEventListener('DOMContentLoaded', async () => {
  if (!(await SportingUI.requireLogin())) return;

  const depositList = document.getElementById('deposit-methods');
  const withdrawList = document.getElementById('withdraw-methods');

  PAYMENT_METHODS.forEach((method) => {
    depositList.appendChild(buildMethodCard(method, 'deposit'));
  });

  WITHDRAW_METHODS.forEach((method) => {
    withdrawList.appendChild(buildMethodCard(method, 'withdraw'));
  });

  document.getElementById('logout-btn')?.addEventListener('click', async () => {
    await SportingAPI.logout();
    window.location.href = '/sporting/login.html';
  });

  document.getElementById('wallet-close')?.addEventListener('click', () => {
    window.location.href = '/sporting/dashboard.html';
  });

  document.querySelectorAll('.wallet-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      switchTab(tab.dataset.panel);
      if (tab.dataset.panel === 'deposit') resetDepositFlow();
      if (tab.dataset.panel === 'withdraw') resetWithdrawFlow();
    });
  });

  document.querySelectorAll('[data-goto]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.goto;
      if (target === 'history') {
        switchTab('history');
        document.querySelectorAll('.wallet-tab').forEach((t) => t.classList.remove('active'));
      } else {
        switchTab(target);
        if (target === 'deposit') resetDepositFlow();
        if (target === 'withdraw') resetWithdrawFlow();
      }
    });
  });

  document.querySelector('[data-goto-tab="overview"]')?.addEventListener('click', () => {
    switchTab('overview');
    document.querySelector('.wallet-tab[data-panel="overview"]')?.classList.add('active');
  });

  depositList.addEventListener('click', (e) => {
    const card = e.target.closest('.w-pay-card');
    if (!card) return;
    selectedDepositProvider = card.dataset.provider;
    depositList.querySelectorAll('.w-pay-card').forEach((c) => c.classList.remove('selected'));
    card.classList.add('selected');
    document.getElementById('deposit-next').disabled = false;
  });

  withdrawList.addEventListener('click', (e) => {
    const card = e.target.closest('.w-pay-card');
    if (!card) return;
    selectedWithdrawProvider = card.dataset.provider;
    withdrawList.querySelectorAll('.w-pay-card').forEach((c) => c.classList.remove('selected'));
    card.classList.add('selected');
    document.getElementById('withdraw-next').disabled = false;
  });

  document.getElementById('deposit-next')?.addEventListener('click', () => {
    if (!selectedDepositProvider) return;
    document.getElementById('deposit-selected-label').innerHTML =
      '<i class="fas fa-mobile-screen"></i> Depositing via <strong>' + selectedDepositProvider + '</strong>';
    document.getElementById('deposit-step-methods').classList.remove('active');
    document.getElementById('deposit-step-form').classList.add('active');
  });

  document.getElementById('withdraw-next')?.addEventListener('click', () => {
    if (!selectedWithdrawProvider) return;
    document.getElementById('withdraw-selected-label').innerHTML =
      '<i class="fas fa-mobile-screen"></i> Withdrawing via <strong>' + selectedWithdrawProvider + '</strong>';
    document.getElementById('withdraw-step-methods').classList.remove('active');
    document.getElementById('withdraw-step-form').classList.add('active');
  });

  document.getElementById('deposit-back')?.addEventListener('click', () => {
    document.getElementById('deposit-step-form').classList.remove('active');
    document.getElementById('deposit-step-methods').classList.add('active');
  });

  document.getElementById('withdraw-back')?.addEventListener('click', () => {
    document.getElementById('withdraw-step-form').classList.remove('active');
    document.getElementById('withdraw-step-methods').classList.add('active');
  });

  document.querySelectorAll('[data-cancel]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.dataset.cancel === 'deposit') resetDepositFlow();
      if (btn.dataset.cancel === 'withdraw') resetWithdrawFlow();
      switchTab('overview');
      document.querySelectorAll('.wallet-tab').forEach((t) => {
        t.classList.toggle('active', t.dataset.panel === 'overview');
      });
    });
  });

  document.getElementById('deposit-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;

    const { ok, data } = await SportingAPI.deposit({
      provider: selectedDepositProvider,
      phone: document.getElementById('deposit-phone').value,
      amount: document.getElementById('deposit-amount').value,
    });

    btn.disabled = false;

    if (!ok) {
      showAlert(
        Array.isArray(data.errors) ? data.errors.join(' ') : data.error || 'Deposit failed.',
        'error'
      );
      return;
    }

    showAlert(data.message, 'success');
    resetDepositFlow();
    switchTab('overview');
    document.querySelectorAll('.wallet-tab').forEach((t) => {
      t.classList.toggle('active', t.dataset.panel === 'overview');
    });
    await refreshWallet();
  });

  document.getElementById('withdraw-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;

    const { ok, data } = await SportingAPI.withdraw({
      provider: selectedWithdrawProvider,
      phone: document.getElementById('withdraw-phone').value,
      amount: document.getElementById('withdraw-amount').value,
    });

    btn.disabled = false;

    if (!ok) {
      showAlert(
        Array.isArray(data.errors) ? data.errors.join(' ') : data.error || 'Withdrawal failed.',
        'error'
      );
      return;
    }

    showAlert(data.message, 'success');
    resetWithdrawFlow();
    switchTab('overview');
    document.querySelectorAll('.wallet-tab').forEach((t) => {
      t.classList.toggle('active', t.dataset.panel === 'overview');
    });
    await refreshWallet();
  });

  await refreshWallet();
});
