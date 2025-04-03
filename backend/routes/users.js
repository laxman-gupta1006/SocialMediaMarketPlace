const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const pick = require('lodash.pick');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Post = require('../models/Post');

// Configure multer for profile photo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/profiles');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image file.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// @route   POST /api/users/profile-photo
// @desc    Upload profile photo
// @access  Private
router.post('/profile-photo', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a photo.' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete old profile photo if it exists and isn't the default
    if (user.profileImage && user.profileImage !== '/default-profile.png') {
      const oldPhotoPath = path.join(__dirname, '..', user.profileImage);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    // Update user's profile image path
    const relativePhotoPath = '/uploads/profiles/' + req.file.filename;
    user.profileImage = relativePhotoPath;
    await user.save();

    res.json({
      message: 'Profile photo updated successfully',
      profileImage: relativePhotoPath
    });
  } catch (error) {
    console.error('Profile photo upload error:', error);
    res.status(500).json({ error: 'Error uploading profile photo' });
  }
});

// Helper function to validate MongoDB ID
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// @route   GET /api/users/user/:userId
// @desc    Get user profile and posts
// @access  Private
// router.get('/user/:userId', authMiddleware, async (req, res) => {
//   try {
//     if (!isValidObjectId(req.params.userId)) {
//       return res.status(400).json({ error: 'Invalid user ID format' });
//     }

//     const user = await User.findById(req.params.userId)
//       .select('-password -__v -refreshTokens')
//       .populate('followers following', 'username profileImage')
//       .lean();

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     // Get user posts with visibility check
//     const posts = await Post.find({
//       userId: req.params.userId,
//       $or: [
//         { visibility: 'public' },
//         { 
//           visibility: 'private', 
//           authorizedUsers: { $in: [req.userId] }
//         }
//       ]
//     })
//     .sort({ createdAt: -1 })
//     .lean();

//     // Check if current user follows this user
//     const isFollowing = user.followers.some(follower => 
//       follower._id.toString() === req.userId
//     );

//     res.json({
//       ...user,
//       postsCount: posts.length,
//       isFollowing,
//       posts: posts.map(post => ({
//         ...post,
//         likesCount: post.likes.length,
//         commentsCount: post.comments.length,
//         hasLiked: post.likes.includes(req.userId)
//       }))
//     });
//   } catch (error) {
//     console.error('Error fetching user profile:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });


// @route   GET /api/users/user/:userId
// @desc    Get user profile and posts
// @access  Private
// router.get('/user/:userId', authMiddleware, async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const currentUserId = req.userId;

//     if (!isValidObjectId(userId)) {
//       return res.status(400).json({ error: 'Invalid user ID format' });
//     }

//     const isCurrentUser = userId === currentUserId;

//     let user;
//     let posts = [];
//     let isFollowing = false;

//     if (isCurrentUser) {
//       // Handle current user's own profile
//       user = await User.findById(userId)
//         .select('-password -__v -refreshTokens')
//         .lean();

//       if (!user) return res.status(404).json({ error: 'User not found' });

//       posts = await Post.find({ userId })
//         .sort({ createdAt: -1 })
//         .lean();
//     } else {
//       // Handle other users' profiles
//       const userCheck = await User.findById(userId)
//         .select('privacySettings.profileVisibility followers')
//         .lean();

//       if (!userCheck) return res.status(404).json({ error: 'User not found' });

//       const followers = userCheck.followers || []; // Ensure it's an array
// isFollowing = followers.some(follower => follower?.userId?.toString() === currentUserId);

//       if (userCheck.privacySettings.profileVisibility === 'private') {
//         const privateUser = await User.findById(userId)
//           .select('username profileImage followersCount followingCount postsCount')
//           .lean();

//         return res.json({
//           username: privateUser.username,
//           profileImage: privateUser.profileImage,
//           followersCount: privateUser.followersCount,
//           followingCount: privateUser.followingCount,
//           postsCount: privateUser.postsCount,
//           isFollowing
//         });
//       }

//       // Public profile
//       user = await User.findById(userId)
//         .select('-password -__v -refreshTokens')
//         .lean();

//       posts = await Post.find({
//         userId,
//         $or: [
//           { visibility: 'public' },
//           { 
//             visibility: 'private', 
//             authorizedUsers: { $in: [currentUserId] }
//           }
//         ]
//       })
//       .sort({ createdAt: -1 })
//       .lean();
//     }

//     const response = {
//       ...user,
//       postsCount: posts.length,
//       isFollowing,
//       posts: posts.map(post => ({
//         ...post,
//         likesCount: post.likes.length,
//         commentsCount: post.comments.length,
//         hasLiked: post.likes.includes(currentUserId)
//       }))
//     };

//     res.json(response);

//   } catch (error) {
//     console.error('Error fetching user profile:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });
// router.get('/user/:userId', authMiddleware, async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const currentUserId = req.userId;

//     if (!isValidObjectId(userId)) {
//       return res.status(400).json({ error: 'Invalid user ID format' });
//     }

//     const isCurrentUser = userId === currentUserId;

//     // Always get these basic fields for any profile
//     const user = await User.findById(userId)
//       .select('username profileImage fullName bio website privacySettings followers following followersCount followingCount postsCount')
//       .lean();

//     if (!user) return res.status(404).json({ error: 'User not found' });

//     let posts = [];
//     let isFollowing = false;
//     let isPrivate = false;

//     if (!isCurrentUser) {
//       isFollowing = user.followers.some(f => f?.userId?.toString() === currentUserId);
//       isPrivate = user.privacySettings?.profileVisibility === 'private';
      
//       if (isPrivate) {
//         // For private accounts, we'll return limited data but with counts
//         return res.json({
//           _id: user._id,
//           username: user.username,
//           profileImage: user.profileImage,
//           fullName: user.fullName,
//           bio: user.bio,
//           website: user.website,
//           followersCount: user.followersCount,
//           followingCount: user.followingCount,
//           postsCount: user.postsCount,
//           isFollowing,
//           isPrivate: true,
//           privacySettings: user.privacySettings
//         });
//       }
//     }

//     // For current user or public profiles, get posts
//     posts = await Post.find({
//       userId,
//       ...(!isCurrentUser && {
//         $or: [
//           { visibility: 'public' },
//           { visibility: 'private', authorizedUsers: { $in: [currentUserId] } }
//         ]
//       })
//     })
//     .sort({ createdAt: -1 })
//     .lean();

//     res.json({
//       ...user,
//       postsCount: posts.length,
//       isFollowing,
//       isPrivate: false,
//       posts: posts.map(post => ({
//         ...post,
//         likesCount: post.likes.length,
//         commentsCount: post.comments.length,
//         hasLiked: post.likes.includes(currentUserId)
//       }))
//     });

//   } catch (error) {
//     console.error('Error fetching user profile:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.userId;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const isCurrentUser = userId === currentUserId;

    // Get base user data
    const user = await User.findById(userId)
      .select('username profileImage fullName bio website privacySettings followers following followersCount followingCount postsCount')
      .lean();

    if (!user) return res.status(404).json({ error: 'User not found' });

    let posts = [];
    let isFollowing = false;
    let isPrivate = user.privacySettings?.profileVisibility === 'private';

    if (!isCurrentUser) {
      isFollowing = user.followers.some(f => f?.userId?.toString() === currentUserId);
      
      if (isPrivate && !isFollowing) {
        return res.json({
          _id: user._id,
          username: user.username,
          profileImage: user.profileImage,
          fullName: user.fullName,
          bio: user.bio,
          website: user.website,
          followersCount: user.followersCount,
          followingCount: user.followingCount,
          postsCount: user.postsCount,
          isFollowing,
          isPrivate: true,
          privacySettings: user.privacySettings,
          posts: [] // Ensure no posts are returned
        });
      }
    }

    // Get posts for current user or followed accounts
    posts = await Post.find({
      userId,
      ...(!isCurrentUser && {
        $or: [
          { visibility: 'public' },
          { visibility: 'private', authorizedUsers: { $in: [currentUserId] } }
        ]
      })
    })
    .sort({ createdAt: -1 })
    .lean();

    return res.json({
      ...user,
      postsCount: posts.length,
      isFollowing,
      isPrivate: isPrivate && !isCurrentUser && !isFollowing,
      posts: posts.map(post => ({
        ...post,
        likesCount: post.likes.length,
        commentsCount: post.comments.length,
        hasLiked: post.likes.includes(currentUserId)
      }))
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
// @route   PUT /api/users/visibility
// @desc    Update profile visibility
// @access  Private
router.put('/visibility', authMiddleware, async (req, res) => {
  try {
    const { profileVisibility } = req.body;
    
    if (!['public', 'private'].includes(profileVisibility)) {
      return res.status(400).json({ error: 'Invalid visibility value' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { 'privacySettings.profileVisibility': profileVisibility },
      { 
        new: true,
        select: '-password -__v -refreshTokens'
      }
    ).populate('followers following', 'username profileImage');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      message: 'Visibility updated successfully',
      profileVisibility: user.privacySettings.profileVisibility
    });
  } catch (error) {
    console.error('Visibility update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/users/update
// @desc    Update user profile
// @access  Private
router.put('/update', authMiddleware, async (req, res) => {
  try {
    const allowedFields = [
      'fullName', 
      'username', 
      'bio', 
      'website', 
      'email',
      'profileImage',
      'privacySettings'
    ];

    const updates = pick(req.body, allowedFields);

    // Validate username uniqueness
    if (updates.username) {
      const existingUser = await User.findOne({ username: updates.username });
      if (existingUser && !existingUser._id.equals(req.userId)) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    // Validate email uniqueness
    if (updates.email) {
      const existingEmail = await User.findOne({ email: updates.email });
      if (existingEmail && !existingEmail._id.equals(req.userId)) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { 
        new: true, 
        runValidators: true,
        select: '-password -__v -refreshTokens'
      }
    ).populate('followers following', 'username profileImage');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Profile update error:', error);
    
    if (error instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/users/search
// @desc    Global search for users by username or full name
// @access  Private
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }
    

    const currentUser = await User.findById(req.userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const searchResults = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { fullName: { $regex: query, $options: 'i' } }
      ],
      _id: { $ne: req.userId },
      $or: [
        { 'privacySettings.profileVisibility': 'public' },
        {
          'privacySettings.profileVisibility': 'private',
          _id: { $in: currentUser.following }
        }
      ]
    })
    .select('username fullName profileImage privacySettings followers following')
    .limit(20)
    .lean();

    const resultsWithStatus = searchResults.map(user => ({
      ...user,
      isFollowing: currentUser.following.some(
        followingUser => followingUser.userId && followingUser.userId.toString() === user._id.toString()
      ),      
      followersCount: user.followers.length,
      isPrivate: user.privacySettings?.profileVisibility === 'private'
    }));


    res.json(resultsWithStatus);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Updated follow route with error handling
router.post('/follow/:userId', authMiddleware, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.userId).lean();
    const currentUser = await User.findById(req.userId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Ensure following array exists
    if (!Array.isArray(currentUser.following)) {
      currentUser.following = [];
    }

    // Check if already following (prevent undefined userId errors)
    const isAlreadyFollowing = currentUser.following.some((followingUser) => {
      return followingUser?.userId && followingUser.userId.toString() === req.params.userId;
    });

    if (isAlreadyFollowing) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    // Add to current user's following list
    await User.findByIdAndUpdate(req.userId, {
      $addToSet: {
        following: {
          userId: targetUser._id,
          username: targetUser.username,
          profileImage: targetUser.profileImage,
        },
      },
    });

    // Add to target user's followers list
    await User.findByIdAndUpdate(targetUser._id, {
      $addToSet: {
        followers: {
          userId: currentUser._id,
          username: currentUser.username,
          profileImage: currentUser.profileImage,
        },
      },
    });

    const updatedUser = await User.findById(targetUser._id).lean();

    res.json({
      success: true,
      followersCount: updatedUser?.followers?.length || 0,
      isFollowing: true,
    });
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
});


// Updated unfollow route
router.post('/unfollow/:userId', authMiddleware, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.userId);
    
    const currentUser = await User.findById(req.userId);
    const isFollowing = Array.isArray(currentUser.following) && currentUser.following.some(
      followingUser => followingUser.userId && followingUser.userId.toString() === req.params.userId
    );
    
    if (!isFollowing) {
      return res.status(400).json({ error: 'Not following this user' });
    }

    if (!targetUser || !currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove from current user's following
    await User.findByIdAndUpdate(req.userId, {
      $pull: { following: { userId: targetUser._id } }
    });

    // Remove from target user's followers
    await User.findByIdAndUpdate(targetUser._id, {
      $pull: { followers: { userId: currentUser._id } }
    });

    const updatedUser = await User.findById(targetUser._id);
    
    res.json({
      success: true,
      followersCount: updatedUser.followers.length,
      isFollowing: false,
      
    });
  } catch (error) {
    console.error('Unfollow error:', error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});






// @route   GET /api/users/follow-status/:userId
// @desc    Check follow status between users
// @access  Private
router.get('/follow-status/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const currentUser = await User.findById(req.userId);
    const isFollowing = currentUser.following.some(
      followingUser => followingUser.userId.toString() === userId
    );

    res.json({ isFollowing });
  } catch (error) {
    console.error('Follow status error:', error);
    res.status(500).json({ error: 'Failed to check follow status' });
  }
});

//Add Remove Follower Endpoint):
 // Add this to your users.js routes
 // Correct remove-follower endpoint
 router.delete('/remove-follower/:userId', authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.userId;
    const followerId = req.params.userId;

    // 1. Remove from current user's followers
    const currentUser = await User.findByIdAndUpdate(
      currentUserId,
      { $pull: { followers: { userId: followerId } }},
      { new: true }
    );

    // 2. Remove from follower's following
    await User.findByIdAndUpdate(
      followerId,
      { $pull: { following: { userId: currentUserId } }}
    );

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      success: true,
      newFollowersCount: currentUser.followers.length
    });
  } catch (error) {
    console.error('Remove follower error:', error);
    
    // Add automatic cleanup for failed operations
    if (currentUser) {
      await User.findByIdAndUpdate(currentUserId, {
        $addToSet: { followers: { userId: followerId } }
      });
    }

    res.status(500).json({ error: 'Failed to remove follower' });
  }
});
// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('-password -__v -refreshTokens')
      .populate('followers following', 'username profileImage')
      .lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;