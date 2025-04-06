// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { requireAdmin, hasPermission } = require('../middleware/admin');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Admin = require('../models/Admins');
const AdminLog = require('../models/AdminLog');
const Post = require('../models/Post')
const { verifyLog } = require('../utils/verifyLog');

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

// ------------------- Verification Request Routes -------------------

// Get pending verification requests
router.get('/verification/requests',
  authMiddleware,
  requireAdmin,
  hasPermission('manage_users'),
  async (req, res) => {
    try {
      const requests = await User.find({ 'verification.verificationRequested': true })
        .select('username fullName email verification');
      res.json(requests);
    } catch (error) {
      console.error('Get verification requests error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Approve a verification request
router.put('/verification/approve/:id',
  authMiddleware,
  requireAdmin,
  hasPermission('manage_users'),
  async (req, res) => {
    try {
      // Update the verification fields
      const user = await User.findByIdAndUpdate(
        req.params.id,
        {
          'verification.adminVerified': true,
          'verification.verificationRequested': false
        },
        { new: true }
      );
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Add an admin note indicating approval
      user.adminNotes.push({
        content: 'Your verification request has been approved.',
        createdBy: {
          userId: req.userId,
          username: 'Admin', // Replace with actual admin username if available
          profileImage: ''   // Optionally include admin's profile image URL
        },
        action: 'verification_approved',
        timestamp: new Date()
      });
      await user.save();

      // Log the approval action in AdminLog
      await new AdminLog({
        admin: req.userId,
        action: 'verification_approved',
        targetUser: user._id,
        details: { message: 'Verification request approved' }
      }).save();

      res.json({ message: 'User verification approved successfully', user });
    } catch (error) {
      console.error('Approve verification error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Reject a verification request
router.put('/verification/reject/:id',
  authMiddleware,
  requireAdmin,
  hasPermission('manage_users'),
  async (req, res) => {
    try {
      // Update the verification fields to reject the request
      const user = await User.findByIdAndUpdate(
        req.params.id,
        {
          'verification.verificationRequested': false,
          'verification.document': ''
        },
        { new: true }
      );
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Add an admin note indicating rejection
      user.adminNotes.push({
        content: 'Your verification request has been rejected.',
        createdBy: {
          userId: req.userId,
          username: 'Admin', // Replace with actual admin username if available
          profileImage: ''   // Optionally include admin's profile image URL
        },
        action: 'verification_rejected',
        timestamp: new Date()
      });
      await user.save();

      // Log the rejection action in AdminLog
      await new AdminLog({
        admin: req.userId,
        action: 'verification_rejected',
        targetUser: user._id,
        details: { message: 'Verification request rejected' }
      }).save();

      res.json({ message: 'User verification request rejected successfully', user });
    } catch (error) {
      console.error('Reject verification error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);


// Get reported posts with pagination and filters
router.get('/posts',
  authMiddleware,
  requireAdmin,
  hasPermission('manage_content'),
  async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 50, 
        search = '',
        sort = '-createdAt',
        mediaType
      } = req.query;

      const skip = (page - 1) * limit;
      const query = {
        $and: [
          { 'reports.0': { $exists: true } }, // Posts with at least 1 report
          { $or: [
            { caption: new RegExp(search, 'i') },
            { 'author.username': new RegExp(search, 'i') }
          ]}
        ]
      };

      if (mediaType) query.mediaType = mediaType;

      const [posts, total] = await Promise.all([
        Post.find(query)
          .populate('userId', 'username profileImage')
          .populate('reports.userId', 'username email')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Post.countDocuments(query)
      ]);

      res.json({
        posts: posts.map(post => ({
          ...post,
          author: post.userId,
          reportsCount: post.reports.length
        })),
        totalPages: Math.ceil(total / limit),
        currentPage: page
      });
    } catch (error) {
      console.error('Get reported posts error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Delete a post
router.delete('/posts/:id',
  authMiddleware,
  requireAdmin,
  hasPermission('manage_content'),
  async (req, res) => {
    try {
      const post = await Post.findByIdAndDelete(req.params.id);
      if (!post) return res.status(404).json({ error: 'Post not found' });

      await new AdminLog({
        admin: req.userId,
        action: 'post_delete',
        details: {
          postId: post._id,
          reportsCount: post.reports.length
        }
      }).save();

      res.json({ message: 'Post deleted successfully' });
    } catch (error) {
      console.error('Delete post error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Clear post reports
router.delete('/posts/:id/reports',
  authMiddleware,
  requireAdmin,
  hasPermission('manage_content'),
  async (req, res) => {
    try {
      const post = await Post.findByIdAndUpdate(
        req.params.id,
        { $set: { reports: [] } },
        { new: true }
      );

      await new AdminLog({
        admin: req.userId,
        action: 'post_clear_reports',
        targetPost: post._id,
        details: {
          clearedReports: post.reports.length
        }
      }).save();

      res.json({ message: 'Reports cleared successfully' });
    } catch (error) {
      console.error('Clear reports error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Add to routes/adminRoutes.js
router.get('/logs/verify',
  authMiddleware,
  requireAdmin,
  hasPermission('manage_users'),
  async (req, res) => {
    try {
      const result = await verifyLog();
      res.json(result);
    } catch (error) {
      console.error('Verify logs error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);


// Add these near the top with other model imports
const Product = require('../models/Product');
const Purchase = require('../models/Purchase');

// ------------------- Marketplace Routes -------------------
// Get paginated products with filters
router.get('/marketplace/products',
  authMiddleware,
  requireAdmin,
  hasPermission('manage_marketplace'),
  async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = '',
        category = 'all',
        status = 'all',
        minPrice = 0,
        maxPrice = 100000
      } = req.query;

      const skip = (page - 1) * limit;
      const query = {
        $and: [
          { 
            $or: [
              { title: new RegExp(search, 'i') },
              { description: new RegExp(search, 'i') }
            ]
          },
          { price: { $gte: minPrice, $lte: maxPrice } }
        ]
      };

      if (category !== 'all') query.category = category;
      if (status !== 'all') query.status = status;

      const [products, total] = await Promise.all([
        Product.find(query)
          .populate('owner', 'username profileImage')
          .skip(skip)
          .limit(limit)
          .lean(),
        Product.countDocuments(query)
      ]);

      res.json({
        products: products.map(p => ({
          ...p,
          ownerUsername: p.owner.username,
          ownerProfileImage: p.owner.profileImage
        })),
        total
      });
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Delete product
router.delete('/marketplace/products/:id',
  authMiddleware,
  requireAdmin,
  hasPermission('manage_marketplace'),
  async (req, res) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) return res.status(404).json({ error: 'Product not found' });

      await new AdminLog({
        admin: req.userId,
        action: 'product_delete',
        details: {
          title: product.title,
          owner: product.owner
        }
      }).save();

      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Updated purchase route
router.get('/marketplace/purchases',
  authMiddleware,
  requireAdmin,
  hasPermission('manage_marketplace'),
  async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status = 'all' 
      } = req.query;

      const skip = (page - 1) * limit;
      const query = status !== 'all' ? { status } : {};

      const [purchases, total] = await Promise.all([
        Purchase.find(query)
          .populate('product', 'title images') // Only populate product
          .skip(skip)
          .limit(limit)
          .lean(),
        Purchase.countDocuments(query)
      ]);

      res.json({ 
        purchases: purchases.map(p => ({
          ...p,
          productTitle: p.product?.title || 'Deleted Product',
          productImage: p.product?.images?.[0] || '',
          // Use direct username fields from purchase schema
          buyerUsername: p.buyerUsername,
          sellerUsername: p.productOwnerUsername
        })),
        total 
      });
    } catch (error) {
      console.error('Get purchases error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update purchase status
router.put('/marketplace/purchases/:id/status',
  authMiddleware,
  requireAdmin,
  hasPermission('manage_marketplace'),
  async (req, res) => {
    try {
      const { status } = req.body;
      const purchase = await Purchase.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      ).populate('product buyer productOwner');

      if (!purchase) return res.status(404).json({ error: 'Purchase not found' });

      await new AdminLog({
        admin: req.userId,
        action: 'purchase_update',
        details: {
          purchaseId: purchase._id,
          newStatus: status,
          previousStatus: purchase.history.slice(-1)[0]?.status
        }
      }).save();

      // Add status change to history
      purchase.history.push({
        status,
        changedBy: req.userId,
        changedAt: new Date()
      });
      await purchase.save();

      res.json({ 
        message: 'Purchase status updated',
        purchase: {
          ...purchase.toObject(),
          productTitle: purchase.product.title,
          buyerUsername: purchase.buyer.username,
          sellerUsername: purchase.productOwner.username
        }
      });
    } catch (error) {
      console.error('Update purchase error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

module.exports = router;