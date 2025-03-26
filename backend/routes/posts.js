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
  return `https://192.168.2.250:3000${path}`;
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
    const { caption, visibility = 'public' } = req.body;
    
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
      visibility
    });

    await newPost.save();

    // Format response
    const formattedPost = {
      _id: newPost._id,
      userId: newPost.userId._id,
      username: newPost.userId.username,
      profileImage: "https://192.168.2.250:3000"+newPost.userId.profileImage,
      media: "https://192.168.2.250:3000"+newPost.media,
      mediaType: newPost.mediaType,
      caption: newPost.caption,
      likes: newPost.likes,
      comments: newPost.comments.map(comment => ({
        _id: comment._id,
        userId: comment.userId,
        username: comment.username,
        profileImage: "https://192.168.2.250:3000"+comment.profileImage,
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
// Get posts with visibility rules
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10 } = req.query;

    // Get user's following list
    const currentUser = await User.findById(userId).select('following');
    const followingIds = currentUser.following;

    // Build visibility query
    const query = {
      $or: [
        { visibility: 'public' },
        { 
          $and: [
            { visibility: 'private' },
            { userId: userId } // Only owner sees their private posts
          ]
        },
        {
          $and: [
            { visibility: 'followers' },
            { 
              $or: [
                { userId: { $in: followingIds } }, // Posts from followed users
                { userId: userId }, // Own posts
                { authorizedUsers: { $in: [userId] } } // Explicitly authorized
              ]
            }
          ]
        }
      ]
    };

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('userId', 'username profileImage')
      .lean();

    // Format response
   // In your GET /api/posts route
const formattedPosts = posts.map(post => ({
  _id: post._id,
  userId: post.userId._id,
  username: post.userId.username,
  profileImage: post.userId.profileImage 
    ? "https://192.168.2.250:3000" + post.userId.profileImage 
    : null,
  media: "https://192.168.2.250:3000" + post.media, // Unified media field
  mediaType: post.mediaType, // This should always be set
  caption: post.caption,
  likes: post.likes,
  comments: post.comments.map(comment => ({
    _id: comment._id,
    userId: comment.userId,
    username: comment.username,
    profileImage: comment.profileImage 
      ? "https://192.168.2.250:3000" + comment.profileImage 
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
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;
    const currentUserId = req.userId;
    const page = 1;
    const limit = 10;

    console.log("Incoming User ID:", userId);
    console.log("Current User ID:", currentUserId);

    // Validate user ID format MORE ROBUSTLY
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    // Explicitly convert to ObjectId
    const userObjectId = mongoose.Types.ObjectId.createFromHexString(userId);
    const currentUserObjectId = mongoose.Types.ObjectId.createFromHexString(currentUserId);

    // Find the target user first to ensure they exist
    const targetUser = await User.findById(userObjectId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check following status
    const isFollowing = await User.findOne({
      _id: userObjectId,
      followers: currentUserObjectId
    });

    const isOwner = userObjectId.equals(currentUserObjectId);

    // Construct query with explicit ObjectId comparison
    const postQuery = {
      userId: userObjectId,
      $or: [
        { visibility: 'public' },
        ...(isOwner ? [{ visibility: 'private' }] : []),
        ...(isOwner || isFollowing ? [{ visibility: 'followers' }] : []),
        { 
          visibility: 'private',
          authorizedUsers: { $in: [currentUserObjectId] }
        }
      ]
    };

    console.log("Post Query:", JSON.stringify(postQuery, null, 2));

    const posts = await Post.find(postQuery)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate({
        path: 'userId',
        select: 'username profileImage'
      })
      .lean();

    console.log("Found Posts:", posts.length);

    // Robust formatting with extensive error handling
    const formattedPosts = posts.map(post => {
      try {
        return {
          _id: post._id ? post._id.toString() : null,
          userId: post.userId?._id ? post.userId._id.toString() : null,
          username: post.userId?.username || 'Unknown User',
          profileImage: post.userId?.profileImage 
            ? `https://192.168.2.250:3000${post.userId.profileImage}` 
            : '/default-profile.png',
          media: post.media 
            ? `https://192.168.2.250:3000${post.media}` 
            : '/default-media.png',
          mediaType: post.mediaType || 'image',
          caption: post.caption || '',
          likes: post.likes || [],
          comments: (post.comments || []).map(comment => ({
            _id: comment._id ? comment._id.toString() : null,
            userId: comment.userId ? comment.userId.toString() : null,
            username: comment.username || 'Unknown User',
            profileImage: comment.profileImage 
              ? `https://192.168.2.250:3000${comment.profileImage}` 
              : '/default-profile.png',
            text: comment.text || '',
            createdAt: comment.createdAt
          })),
          hasLiked: (post.likes || []).some(like => 
            mongoose.Types.ObjectId(like).equals(currentUserObjectId)
          ),
          createdAt: post.createdAt
        };
      } catch (formatError) {
        console.error('Post formatting error:', formatError);
        return null;
      }
    }).filter(post => post !== null);

    res.json({ 
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
// Like/Unlike post
// Like/Unlike post - Updated version
router.put('/like/:postId', authMiddleware, async (req, res) => {
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
            profileImage: "https://192.168.2.250:3000"+user.profileImage,
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
      profileImage: "https://192.168.2.250:3000"+newComment.profileImage,
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