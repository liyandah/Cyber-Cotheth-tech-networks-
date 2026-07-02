/**
 * Reusable API client for Sporting backend — handles JSON, cookies, and errors.
 */
const API = {
  async request(url, options = {}) {
    const config = {
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(url, config);
    let data = {};

    try {
      data = await response.json();
    } catch {
      data = { success: false, error: 'Invalid server response.' };
    }

    if (!response.ok && !data.error && !data.errors) {
      data.error = data.error || 'Request failed.';
    }

    return { ok: response.ok, status: response.status, data };
  },

  register(body) {
    return this.request('/api/register', { method: 'POST', body });
  },

  createAccount(body) {
    return this.request('/api/create-account', { method: 'POST', body });
  },

  login(body) {
    return this.request('/api/login', { method: 'POST', body });
  },

  logout() {
    return this.request('/api/logout', { method: 'POST' });
  },

  getUser() {
    return this.request('/api/user');
  },

  getWallet() {
    return this.request('/api/wallet');
  },

  deposit(body) {
    return this.request('/api/deposit', { method: 'POST', body });
  },

  withdraw(body) {
    return this.request('/api/withdraw', { method: 'POST', body });
  },

  confirmPayment(reference) {
    return this.request('/api/payment/confirm', { method: 'POST', body: { reference } });
  },

  getTransactions() {
    return this.request('/api/transactions');
  },
};

/** Show validation or server errors in a container element. */
function showErrors(container, errors) {
  if (!container) return;
  const list = Array.isArray(errors) ? errors : [errors];
  container.innerHTML = list.map((e) => `<p class="form-error">${e}</p>`).join('');
  container.hidden = false;
}

function clearErrors(container) {
  if (!container) return;
  container.innerHTML = '';
  container.hidden = true;
}

/** Format currency for display. */
function formatMoney(amount) {
  return '$' + Number(amount).toFixed(2);
}

/** Format ISO date for transaction table. */
function formatDate(iso) {
  const d = new Date(iso + 'Z');
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-ZW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Redirect if user is not authenticated (for protected pages). */
async function requireLogin() {
  const { ok } = await API.getUser();
  if (!ok) {
    window.location.href = '/sporting/login.html';
    return false;
  }
  return true;
}

/** Redirect if user is already logged in (for login/register pages). */
async function redirectIfLoggedIn() {
  const { ok } = await API.getUser();
  if (ok) {
    window.location.href = '/sporting/dashboard.html';
    return true;
  }
  return false;
}

window.SportingAPI = API;
window.SportingUI = { showErrors, clearErrors, formatMoney, formatDate, requireLogin, redirectIfLoggedIn };
