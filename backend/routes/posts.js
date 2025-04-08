const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');
const sanitizeHtml = require('sanitize-html');
const mongoose = require('mongoose');


// Updated helper function
// Updated secureUrl helper function
function secureUrl(path) {
  if (process.env.NODE_ENV === 'production') {
    return `${process.env.CDN_BASE_URL}${path}`;
  }
  
  // For development, use your explicit backend URL
  return `/{path}`;
}

// Configure secure file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/posts/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/quicktime', 'video/x-msvideo'
  ];
  allowedTypes.includes(file.mimetype) ? cb(null, true) : cb(new Error('Invalid file type'), false);
};

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/posts');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for videos
  }
});

// Create new post
router.post('/', authMiddleware, upload.single('media'), async (req, res) => {
  try {
    const { caption } = req.body;
    
    if (!req.file) return res.status(400).json({ error: 'Media file is required' });

    // Determine media type
    const mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';

    const sanitizedCaption = sanitizeHtml(caption, {
      allowedTags: [],
      allowedAttributes: {}
    });

    const newPost = new Post({
      userId: req.userId,
      media: `/uploads/posts/${req.file.filename}`,
      mediaType,
      caption: sanitizedCaption,
    });

    await newPost.save();

    // Format response
    const formattedPost = {
      _id: newPost._id,
      userId: newPost.userId._id,
      username: newPost.userId.username,
      profileImage: newPost.userId.profileImage,
      media: "/api"+newPost.media,
      mediaType: newPost.mediaType,
      caption: newPost.caption,
      likes: newPost.likes,
      comments: newPost.comments.map(comment => ({
        _id: comment._id,
        userId: comment.userId,
        username: comment.username,
        profileImage: "/api"+comment.profileImage,
        text: comment.text,
        createdAt: comment.createdAt
      })),
      hasLiked: false,
      createdAt: newPost.createdAt
    };

    res.status(201).json(formattedPost);
  } catch (error) {
    console.error('Post creation error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});
// Get posts with updated visibility rules
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10 } = req.query;

    // Get users whose posts are visible
    const [publicUsers, followedPrivateUsers] = await Promise.all([
      User.find({ 'privacySettings.profileVisibility': 'public' }).select('_id'),
      User.find({
        'privacySettings.profileVisibility': 'private',
        'followers.userId': userId
      }).select('_id')
    ]);

    const allowedUserIds = [
      ...publicUsers.map(u => u._id),
      ...followedPrivateUsers.map(u => u._id),
      new mongoose.Types.ObjectId(userId)
    ];

    const posts = await Post.find({ userId: { $in: allowedUserIds } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('userId', 'username profileImage')
      .lean();

    // Format response
    const formattedPosts = posts.map(post => ({
      _id: post._id,
      userId: post.userId._id,
      username: post.userId.username,
      profileImage: post.userId.profileImage 
        ? "/api" + post.userId.profileImage 
        : null,
      media: "/api" + post.media,
      mediaType: post.mediaType,
      caption: post.caption,
      likes: post.likes,
      comments: post.comments.map(comment => ({
        _id: comment._id,
        userId: comment.userId,
        username: comment.username,
        profileImage: comment.profileImage 
          ? "/api" + comment.profileImage 
          : null,
        text: comment.text,
        createdAt: comment.createdAt
      })),
      hasLiked: post.likes.includes(userId),
      createdAt: post.createdAt
    }));

    res.json(formattedPosts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});


// GET /posts/user/:userId
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const targetUserId = req.params.userId;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const targetUser = await User.findById(targetUserId).select('privacySettings followers');

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentUserObjectId = new mongoose.Types.ObjectId(req.userId);
    const isOwner = targetUser._id.equals(currentUserObjectId);
    const isFollowing = targetUser.followers.some(f => f.userId.equals(currentUserObjectId));

    if (targetUser.privacySettings.profileVisibility === 'private' && !isOwner && !isFollowing) {
      return res.status(200).json({
        posts: [],
        total: 0,
        isPrivate: true,
        message: 'This account is private. Follow to see their posts.'
      });
    }

    // Fetch posts if visible
    const posts = await Post.find({ userId: targetUser._id })
      .sort({ createdAt: -1 })
      .populate('userId', 'username profileImage')
      .lean();

    console.log("Found Posts:", posts.length);

    const formattedPosts = posts.map(post => {
      try {
        return {
          _id: post._id?.toString(),
          userId: post.userId?._id?.toString(),
          username: post.userId?.username || 'Unknown User',
          profileImage: post.userId?.profileImage
            ? `/api${post.userId.profileImage}`
            : '/default-profile.png',
          media: post.media
            ? `/api${post.media}`
            : '/default-media.png',
          mediaType: post.mediaType || 'image',
          caption: post.caption || '',
          likes: post.likes || [],
          comments: (post.comments || []).map(comment => ({
            _id: comment._id?.toString(),
            userId: comment.userId?.toString(),
            username: comment.username || 'Unknown User',
            profileImage: comment.profileImage
              ? `/api${comment.profileImage}`
              : '/default-profile.png',
            text: comment.text || '',
            createdAt: comment.createdAt
          })),
          hasLiked: (post.likes || []).some(like =>
            new mongoose.Types.ObjectId(like).equals(currentUserObjectId)
          ),
          createdAt: post.createdAt
        };
      } catch (err) {
        console.error('Post formatting error:', err);
        return null;
      }
    }).filter(post => post !== null);

    res.status(200).json({
      posts: formattedPosts,
      total: formattedPosts.length
    });

  } catch (error) {
    console.error('Get user posts FULL error:', error);
    res.status(500).json({
      error: 'Failed to fetch user posts',
      details: error.message,
      stack: error.stack
    });
  }
});

const checkPostAccess = async (postId, userId) => {
  const post = await Post.findById(postId).populate('userId');
  if (!post) return false;

  const author = post.userId;
  return author.privacySettings.profileVisibility === 'public' ||
    author._id.equals(userId) ||
    author.followers.some(f => f.userId.equals(userId));
};

// Like/Unlike post - Updated version
router.put('/like/:postId', authMiddleware, async (req, res) => {
  const hasAccess = await checkPostAccess(req.params.postId, req.userId);
  if (!hasAccess) return res.status(403).json({ error: 'Not authorized' });
  try {
    const post = await Post.findById(req.params.postId)
      .populate('userId', 'followers');
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const userId = req.userId;
    const isOwner = post.userId._id.equals(userId);
    const isFollowing = post.userId.followers.includes(userId);

    // Check visibility permissions
    if (!isOwner) {
      if (post.visibility === 'private') {
        return res.status(403).json({ error: 'Cannot like private posts' });
      }
      
      if (post.visibility === 'followers' && !isFollowing) {
        return res.status(403).json({ error: 'Must follow user to like this post' });
      }
    }

    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    
    res.json({ 
      likesCount: post.likes.length, 
      hasLiked: post.likes.includes(userId)
    });
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ error: 'Failed to update like status' });
  }
});


router.post('/comment/:postId', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    const sanitizedText = sanitizeHtml(text, {
      allowedTags: [],
      allowedAttributes: {}
    });

    if (!sanitizedText.trim()) return res.status(400).json({ error: 'Comment text required' });

    // Get the current user's info
    const user = await User.findById(req.userId).select('username profileImage');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const post = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $push: {
          comments: {
            userId: req.userId,
            username: user.username,
            profileImage: "/api"+user.profileImage,
            text: sanitizedText,
            createdAt: new Date()
          }
        }
      },
      { new: true }
    );

    if (!post) return res.status(404).json({ error: 'Post not found' });

    // Get the newly added comment
    const newComment = post.comments[post.comments.length - 1];

    // Return the formatted comment
    res.status(201).json({
      _id: newComment._id,
      userId: newComment.userId,
      username: newComment.username,
      profileImage: "/api"+newComment.profileImage,
      text: newComment.text,
      createdAt: newComment.createdAt
    });
  } catch (error) {
    console.error('Comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Delete post
router.delete('/:postId', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.postId,
      userId: req.userId
    });

    if (!post) return res.status(404).json({ error: 'Post not found' });

    // Delete image file
    const fs = require('fs');
    const imagePath = path.join(__dirname, '..', post.image);
    fs.unlink(imagePath, (err) => {
      if (err) console.error('Error deleting image:', err);
    });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Report post
router.post('/report/:postId', authMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;
    const validReasons = ['spam', 'inappropriate', 'harassment', 'other'];

    if (!validReasons.includes(reason)) {
      return res.status(400).json({ error: 'Invalid report reason' });
    }

    const post = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $push: {
          reports: {
            userId: req.userId,
            reason
          }
        }
      },
      { new: true }
    );

    if (!post) return res.status(404).json({ error: 'Post not found' });

    res.json({ message: 'Post reported successfully' });
  } catch (error) {
    console.error('Report error:', error);
    res.status(500).json({ error: 'Failed to report post' });
  }
});

// Helper functions
function secureUrl(path) {
  if (process.env.NODE_ENV === 'production') {
    return `${process.env.CDN_BASE_URL}${path}`;
  }
  return `${req.protocol}://${req.get('host')}${path}`;
}

module.exports = router;