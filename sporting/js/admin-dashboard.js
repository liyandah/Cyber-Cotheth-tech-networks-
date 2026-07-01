/**
 * Admin dashboard — accounts, transactions, and summary stats.
 */
let allUsers = [];
let txFilter = 'all';

function renderUsers(users) {
  const tbody = document.getElementById('users-body');

  if (!users.length) {
    tbody.innerHTML = '<tr><td colspan="8" class="admin-empty">No accounts found.</td></tr>';
    return;
  }

  tbody.innerHTML = users
    .map(
      (user) => `<tr>
        <td>#${user.id}</td>
        <td>${user.fullName}</td>
        <td>${user.username}</td>
        <td>${user.phone}</td>
        <td>${user.nationalId}</td>
        <td>${AdminUI.formatMoney(user.balance)}</td>
        <td>${AdminUI.statusBadge(user.status)}</td>
        <td>${AdminUI.formatDate(user.createdAt)}</td>
      </tr>`
    )
    .join('');
}

function renderTransactions(transactions) {
  const tbody = document.getElementById('transactions-body');

  if (!transactions.length) {
    tbody.innerHTML = '<tr><td colspan="8" class="admin-empty">No transactions found.</td></tr>';
    return;
  }

  tbody.innerHTML = transactions
    .map(
      (tx) => `<tr>
        <td>#${tx.id}</td>
        <td>${tx.username || tx.firstName + ' ' + tx.surname}</td>
        <td>${AdminUI.typeBadge(tx.type)}</td>
        <td>${tx.provider}</td>
        <td>${tx.phone}</td>
        <td>${AdminUI.formatMoney(tx.amount)}</td>
        <td>${AdminUI.statusBadge(tx.status)}</td>
        <td>${AdminUI.formatDate(tx.createdAt)}</td>
      </tr>`
    )
    .join('');
}

function filterUsers(query) {
  const q = query.trim().toLowerCase();
  if (!q) {
    renderUsers(allUsers);
    return;
  }

  const filtered = allUsers.filter((user) => {
    const haystack = [
      user.fullName,
      user.username,
      user.phone,
      user.nationalId,
      user.status,
      String(user.id),
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });

  renderUsers(filtered);
}

async function loadStats() {
  const { ok, data } = await AdminAPI.getStats();
  if (!ok) return;

  const stats = data.stats;
  document.getElementById('stat-users').textContent = stats.totalUsers;
  document.getElementById('stat-active').textContent = stats.activeUsers;
  document.getElementById('stat-pending').textContent = stats.pendingUsers;
  document.getElementById('stat-transactions').textContent = stats.totalTransactions;
  document.getElementById('stat-completed').textContent = stats.completedTransactions;
  document.getElementById('stat-failed').textContent = stats.failedTransactions;
}

async function loadUsers() {
  const { ok, data } = await AdminAPI.getUsers();
  if (!ok) return;
  allUsers = data.users || [];
  renderUsers(allUsers);
}

async function loadTransactions() {
  const { ok, data } = await AdminAPI.getTransactions(txFilter);
  if (!ok) return;
  renderTransactions(data.transactions || []);
}

document.addEventListener('DOMContentLoaded', async () => {
  if (!(await AdminUI.requireAdmin())) return;

  document.getElementById('logout-btn')?.addEventListener('click', async () => {
    await AdminAPI.logout();
    window.location.href = '/sporting/admin/login.html';
  });

  document.getElementById('user-search')?.addEventListener('input', (e) => {
    filterUsers(e.target.value);
  });

  document.querySelectorAll('.admin-filter').forEach((btn) => {
    btn.addEventListener('click', async () => {
      document.querySelectorAll('.admin-filter').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      txFilter = btn.dataset.status;
      await loadTransactions();
    });
  });

  await Promise.all([loadStats(), loadUsers(), loadTransactions()]);
});
