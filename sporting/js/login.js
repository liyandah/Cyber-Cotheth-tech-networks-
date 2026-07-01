/**
 * Login form — creates session and redirects to dashboard.
 */
document.addEventListener('DOMContentLoaded', async () => {
  if (await SportingUI.redirectIfLoggedIn()) return;

  const form = document.getElementById('login-form');
  const errorsEl = document.getElementById('form-errors');
  const btn = document.getElementById('login-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    SportingUI.clearErrors(errorsEl);
    btn.disabled = true;

    const { ok, data } = await SportingAPI.login({
      username: form.username.value,
      password: form.password.value,
    });

    btn.disabled = false;

    if (!ok) {
      SportingUI.showErrors(errorsEl, data.errors || data.error);
      return;
    }

    window.location.href = data.redirect || '/sporting/dashboard.html';
  });
});
