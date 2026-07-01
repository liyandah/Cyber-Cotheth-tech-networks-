/**
 * Two-step registration: personal details then account credentials.
 */
document.addEventListener('DOMContentLoaded', async () => {
  if (await SportingUI.redirectIfLoggedIn()) return;

  const step1 = document.getElementById('step-1');
  const step2 = document.getElementById('step-2');
  const stepInd1 = document.getElementById('step-ind-1');
  const stepInd2 = document.getElementById('step-ind-2');
  const personalForm = document.getElementById('personal-form');
  const accountForm = document.getElementById('account-form');
  const backBtn = document.getElementById('back-btn');
  const errorsEl = document.getElementById('form-errors');
  let pendingUserId = sessionStorage.getItem('sportingPendingUserId');

  function goToStep(n) {
    step1.classList.toggle('active', n === 1);
    step2.classList.toggle('active', n === 2);
    stepInd1.classList.toggle('active', n === 1);
    stepInd2.classList.toggle('active', n === 2);
    SportingUI.clearErrors(errorsEl);
  }

  if (pendingUserId) goToStep(2);

  personalForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    SportingUI.clearErrors(errorsEl);

    const btn = document.getElementById('continue-btn');
    btn.disabled = true;

    const body = {
      firstName: personalForm.firstName.value,
      surname: personalForm.surname.value,
      phone: personalForm.phone.value,
      nationalId: personalForm.nationalId.value,
    };

    const { ok, data } = await SportingAPI.register(body);
    btn.disabled = false;

    if (!ok) {
      SportingUI.showErrors(errorsEl, data.errors || data.error);
      return;
    }

    pendingUserId = data.userId;
    sessionStorage.setItem('sportingPendingUserId', pendingUserId);
    goToStep(2);
  });

  backBtn.addEventListener('click', () => goToStep(1));

  accountForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    SportingUI.clearErrors(errorsEl);

    if (!pendingUserId) {
      SportingUI.showErrors(errorsEl, 'Session expired. Please complete step 1 again.');
      goToStep(1);
      return;
    }

    const btn = document.getElementById('create-btn');
    btn.disabled = true;

    const body = {
      userId: Number(pendingUserId),
      username: accountForm.username.value,
      password: accountForm.password.value,
      confirmPassword: accountForm.confirmPassword.value,
    };

    const { ok, data } = await SportingAPI.createAccount(body);
    btn.disabled = false;

    if (!ok) {
      SportingUI.showErrors(errorsEl, data.errors || data.error);
      return;
    }

    sessionStorage.removeItem('sportingPendingUserId');
    window.location.href = data.redirect || '/sporting/login.html';
  });
});
