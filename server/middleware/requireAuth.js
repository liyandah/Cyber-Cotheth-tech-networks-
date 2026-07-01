/**
 * Protects wallet and user endpoints — only logged-in users may access.
 */
function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ success: false, error: 'Authentication required. Please log in.' });
  }
  next();
}

module.exports = requireAuth;
