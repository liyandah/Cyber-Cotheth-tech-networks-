/**
 * Admin credentials for Test bet back office.
 * Override with ADMIN_USERNAME / ADMIN_PASSWORD_HASH env vars in production.
 */
const bcrypt = require('bcryptjs');

const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || 'Admin').toLowerCase();
const ADMIN_PASSWORD_HASH =
  process.env.ADMIN_PASSWORD_HASH ||
  '$2b$12$rM8j8zWPTDAEyhCcGcgfXeHY43vHSUTQu.TPdOGsrfLX6jNhPxkDi';

function normalizeAdminUsername(username) {
  return typeof username === 'string' ? username.trim().toLowerCase() : '';
}

async function verifyAdminCredentials(username, password) {
  if (normalizeAdminUsername(username) !== ADMIN_USERNAME) {
    return false;
  }
  if (typeof password !== 'string' || !password) {
    return false;
  }
  return bcrypt.compare(password, ADMIN_PASSWORD_HASH);
}

module.exports = {
  ADMIN_USERNAME,
  verifyAdminCredentials,
};
