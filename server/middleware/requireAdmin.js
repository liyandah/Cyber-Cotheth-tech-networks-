/**
 * Protects admin API endpoints — only authenticated admins may access.
 */
function requireAdmin(req, res, next) {
  if (!req.session || !req.session.isAdmin) {
    return res.status(401).json({ success: false, error: 'Admin authentication required.' });
  }
  next();
}

module.exports = requireAdmin;
