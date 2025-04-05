// middleware/admin.js
const Admin = require('../models/Admins');
const User = require('../models/User');

const requireAdmin = async (req, res, next) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
  
      const user = await User.findById(req.userId);
      if (!user || !user.roles.includes('admin')) {
        return res.status(403).json({ error: 'Admin privileges required' });
      }
  
      const adminProfile = await Admin.findOne({ user: req.userId });
      if (!adminProfile) {
        return res.status(403).json({ error: 'Admin profile not found' });
      }
  
      req.admin = {
        permissions: adminProfile.permissions,
        _id: adminProfile._id
      };
  
      next();
    } catch (error) {
      console.error('Admin middleware error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };
  
// Permission checker middleware
const hasPermission = (requiredPermission) => {
  return (req, res, next) => {
    try {
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin verification required' });
      }

      const hasFullAccess = req.admin.permissions.includes('full_access');
      const hasRequired = req.admin.permissions.includes(requiredPermission);
      
      if (!hasFullAccess && !hasRequired) {
        return res.status(403).json({
          error: `Insufficient permissions. Required: ${requiredPermission}`,
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };
};

module.exports = { requireAdmin, hasPermission };