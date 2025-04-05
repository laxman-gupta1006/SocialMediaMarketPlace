// middleware/requireAdminVerified.js
module.exports = (req, res, next) => {
    // Assuming req.user is set by your auth middleware and contains the user document.
    if (!req.user || !req.user.verification || !req.user.verification.adminVerified) {
      return res.status(403).json({ error: 'Your account is not verified by an admin. Please request verification.' });
    }
    next();
  };
  