/**
 * Dashboard — loads user profile and wallet balance.
 */
document.addEventListener('DOMContentLoaded', async () => {
  if (!(await SportingUI.requireLogin())) return;

  const logoutBtn = document.getElementById('logout-btn');
  logoutBtn?.addEventListener('click', async () => {
    await SportingAPI.logout();
    window.location.href = '/sporting/login.html';
  });

  const [userRes, walletRes] = await Promise.all([
    SportingAPI.getUser(),
    SportingAPI.getWallet(),
  ]);

  if (!userRes.ok) {
    window.location.href = '/sporting/login.html';
    return;
  }

  const user = userRes.data.user;
  document.getElementById('welcome-name').textContent = user.firstName;
  document.getElementById('stat-username').textContent = user.username;
  document.getElementById('stat-phone').textContent = user.phone;
  document.getElementById('stat-status').textContent =
    user.accountStatus.charAt(0).toUpperCase() + user.accountStatus.slice(1);

  if (walletRes.ok) {
    document.getElementById('stat-balance').textContent = SportingUI.formatMoney(walletRes.data.balance);
  }
});
