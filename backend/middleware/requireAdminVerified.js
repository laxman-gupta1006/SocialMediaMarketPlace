// middleware/requireAdminVerified.js
const User = require('../models/User'); // Adjust path if needed

module.exports = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await User.findById(req.userId).lean();

    if (!user || !user.verification || !user.verification.adminVerified) {
      console.log(`Blocked unverified user: ${req.userId}`);
      return res.status(403).json({ error: 'Your account is not verified by an admin. Please request verification.' });
    }

    // You can optionally attach the full user to req if needed elsewhere
    req.user = user;

    next();
  } catch (err) {
    console.error(`Admin verification middleware error for user ${req.userId}:`, err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
