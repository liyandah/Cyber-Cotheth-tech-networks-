/**
 * Admin API client and UI helpers for Test bet back office.
 */
const AdminAPI = {
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

    return { ok: response.ok, status: response.status, data };
  },

  login(body) {
    return this.request('/api/admin/login', { method: 'POST', body });
  },

  logout() {
    return this.request('/api/admin/logout', { method: 'POST' });
  },

  me() {
    return this.request('/api/admin/me');
  },

  getStats() {
    return this.request('/api/admin/stats');
  },

  getUsers() {
    return this.request('/api/admin/users');
  },

  getTransactions(status = 'all') {
    const query = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
    return this.request('/api/admin/transactions' + query);
  },
};

const AdminUI = {
  formatMoney(amount) {
    return '$' + Number(amount).toFixed(2);
  },

  formatDate(iso) {
    const d = new Date(iso + 'Z');
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString('en-ZW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  showAlert(container, message) {
    if (!container) return;
    container.textContent = message;
    container.hidden = false;
  },

  clearAlert(container) {
    if (!container) return;
    container.textContent = '';
    container.hidden = true;
  },

  statusBadge(status) {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'active' || normalized === 'completed') {
      return `<span class="admin-badge admin-badge--success">${status}</span>`;
    }
    if (normalized === 'failed') {
      return `<span class="admin-badge admin-badge--danger">${status}</span>`;
    }
    if (normalized === 'pending') {
      return `<span class="admin-badge admin-badge--warning">${status}</span>`;
    }
    return `<span class="admin-badge">${status}</span>`;
  },

  typeBadge(type) {
    const normalized = String(type || '').toLowerCase();
    if (normalized === 'deposit') {
      return '<span class="admin-badge admin-badge--success">Deposit</span>';
    }
    if (normalized === 'withdrawal') {
      return '<span class="admin-badge admin-badge--danger">Withdrawal</span>';
    }
    return `<span class="admin-badge">${type}</span>`;
  },

  async requireAdmin() {
    const { ok } = await AdminAPI.me();
    if (!ok) {
      window.location.href = '/sporting/admin/login.html';
      return false;
    }
    return true;
  },
};

window.AdminAPI = AdminAPI;
window.AdminUI = AdminUI;
