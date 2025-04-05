// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { requireAdmin, hasPermission } = require('../middleware/admin');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Admin = require('../models/Admins');
const AdminLog = require('../models/AdminLog');

// Get paginated users with search
router.get('/users',
  authMiddleware,
  requireAdmin,
  hasPermission('manage_users'),
  async (req, res) => {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const skip = (page - 1) * limit;

      const query = {
        $or: [
          { username: new RegExp(search, 'i') },
          { email: new RegExp(search, 'i') },
          { fullName: new RegExp(search, 'i') }
        ]
      };

      const [users, total] = await Promise.all([
        User.find(query)
          .select('-password -securityLogs')
          .skip(skip)
          .limit(limit)
          .lean(),
        User.countDocuments(query)
      ]);

      const usersWithAdminStatus = await Promise.all(
        users.map(async user => ({
          ...user,
          isAdmin: (user.roles || []).includes('admin'),
          permissions: (user.roles || []).includes('admin') 
            ? (await Admin.findOne({ user: user._id }))?.permissions || []
            : []
        }))
      );

      res.json({ users: usersWithAdminStatus, total });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get single user details
router.get('/users/:id',
  authMiddleware,
  requireAdmin,
  hasPermission('manage_users'),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id)
        .select('-password')
        .populate('posts', 'title createdAt')
        .populate('followers following', 'username profileImage');

      if (!user) return res.status(404).json({ error: 'User not found' });

      res.json(user);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Ban user
router.post('/users/:id/ban',
  authMiddleware,
  requireAdmin,
  hasPermission('manage_users'),
  async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { status: 'banned', banned: true },
        { new: true }
      );

      await new AdminLog({
        admin: req.userId,
        action: 'user_ban',
        targetUser: user._id,
        details: {
          reason: req.body.reason,
          previousStatus: user.status
        }
      }).save();

      res.json({ message: 'User banned successfully' });
    } catch (error) {
      console.error('Ban user error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Unban user
router.post('/users/:id/unban',
  authMiddleware,
  requireAdmin,
  hasPermission('manage_users'),
  async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { status: 'active', banned: false },
        { new: true }
      );

      await new AdminLog({
        admin: req.userId,
        action: 'user_unban',
        targetUser: user._id,
        details: {
          reason: req.body.reason,
          previousStatus: user.status
        }
      }).save();

      res.json({ message: 'User unbanned successfully' });
    } catch (error) {
      console.error('Unban user error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Promote user to admin
router.post('/users/:id/promote',
  authMiddleware,
  requireAdmin,
  hasPermission('manage_users'),
  async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { $addToSet: { roles: 'admin' } },
        { new: true }
      );

      const admin = await Admin.findOneAndUpdate(
        { user: user._id },
        { permissions: req.body.permissions || [] },
        { upsert: true, new: true }
      );

      await new AdminLog({
        admin: req.userId,
        action: 'admin_promote',
        targetUser: user._id,
        details: {
          permissions: admin.permissions
        }
      }).save();

      res.json({ 
        message: 'User promoted to admin successfully',
        adminId: admin._id
      });
    } catch (error) {
      console.error('Promote user error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Demote admin
router.post('/users/:id/demote',
  authMiddleware,
  requireAdmin,
  hasPermission('manage_users'),
  async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { $pull: { roles: 'admin' } },
        { new: true }
      );

      await Admin.deleteOne({ user: user._id });

      await new AdminLog({
        admin: req.userId,
        action: 'admin_demote',
        targetUser: user._id
      }).save();

      res.json({ message: 'Admin demoted successfully' });
    } catch (error) {
      console.error('Demote admin error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update admin permissions
router.put('/admins/permissions/:userId',
  authMiddleware,
  requireAdmin,
  hasPermission('full_access'),
  async (req, res) => {
    try {
      const admin = await Admin.findOne({ user: req.params.userId });
      const user = await User.findById(req.params.userId);
      if (!admin) return res.status(404).json({ error: 'Admin not found' });

      const previousPermissions = admin.permissions;
      admin.permissions = req.body.permissions;
      await admin.save();

      await new AdminLog({
        admin: req.userId,
        action: 'update_permissions',
        targetAdmin: user._id,
        details: {
          oldPermissions: previousPermissions,
          newPermissions: admin.permissions
        }
      }).save();

      res.json(admin);
    } catch (error) {
      console.error('Update permissions error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get admin logs
router.get('/logs',
  authMiddleware,
  requireAdmin,
  hasPermission('manage_users'),
  async (req, res) => {
    try {
      const logs = await AdminLog.find()
        .sort('-timestamp')
        .populate('admin', 'username email')
        .populate('targetUser', 'username email')
        .limit(100);

      res.json(logs);
    } catch (error) {
      console.error('Get logs error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Delete user account
router.delete('/users/:id',
  authMiddleware,
  requireAdmin,
  hasPermission('full_access'),
  async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });

      await Admin.deleteOne({ user: user._id });

      await new AdminLog({
        admin: req.userId,
        action: 'user_delete',
        details: {
          username: user.username,
          email: user.email
        }
      }).save();

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

module.exports = router;