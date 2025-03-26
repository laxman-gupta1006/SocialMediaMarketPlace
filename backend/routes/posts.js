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
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  allowedTypes.includes(file.mimetype) ? cb(null, true) : cb(new Error('Invalid file type'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Create new post
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { caption, visibility = 'public' } = req.body;
    
    // Validate input
    if (!req.file) return res.status(400).json({ error: 'Image is required' });

    // Sanitize content
    const sanitizedCaption = sanitizeHtml(caption, {
      allowedTags: [],
      allowedAttributes: {}
    });

    // Create post
    const newPost = new Post({
      userId: req.userId,
      image: `/uploads/posts/${req.file.filename}`,
      caption: sanitizedCaption,
      visibility
    });

    await newPost.save();

    res.status(201).json({
      message: 'Post created successfully',
      post: {
        id: newPost._id,
        image: newPost.image,
        caption: newPost.caption,
        visibility: newPost.visibility,
        createdAt: newPost.createdAt
      }
    });
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
    const formattedPosts = posts.map(post => ({
      _id: post._id,
      userId: post.userId._id,
      username: post.userId.username,
      profileImage: "https://192.168.2.250:3000"+post.userId.profileImage,
      image: "https://192.168.2.250:3000"+post.image,
      caption: post.caption,
      likes: post.likes,
      comments: post.comments.map(comment => ({
        _id: comment._id,
        userId: comment.userId,
        username: comment.username,
        profileImage: "https://192.168.2.250:3000"+comment.profileImage,
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

// Get posts by user ID with proper visibility checks
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    page = 1, limit = 10;
    const userId = req.params.userId;
    const currentUserId = req.userId;
    console.log(userId+" "+currentUserId)
    // Validate user ID format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    console.log("I am here at 1")
    // Check if current user follows the target user
    const isFollowing = await User.exists({
      _id: userId,
      followers: currentUserId
    });
    console.log("I am here at 2")
    const isOwner = currentUserId === userId;

    // Build post query based on relationship
    const postQuery = {
      userId: userId,
      $or: [
        { visibility: 'public' },
        ...(isOwner ? [{ visibility: 'private' }] : []),
        ...(isOwner || isFollowing ? [{ visibility: 'followers' }] : []),
        { 
          visibility: 'private',
          authorizedUsers: { $in: [currentUserId] }
        }
      ]
    };
    console.log("I am here at 3")
    const posts = await Post.find(postQuery)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('userId', 'username profileImage')
      .lean();
    console.log("I am here at 4")
    // Format response
    const formattedPosts = posts.map(post => ({
      _id: post._id,
      userId: post.userId._id,
      username: post.userId.username,
      profileImage: "https://192.168.2.250:3000"+post.userId.profileImage,
      image: "https://192.168.2.250:3000"+post.image,
      caption: post.caption,
      likes: post.likes,
      comments: post.comments.map(comment => ({
        _id: comment._id,
        userId: comment.userId,
        username: comment.username,
        profileImage: "https://192.168.2.250:3000"+comment.profileImage,
        text: comment.text,
        createdAt: comment.createdAt
      })),
      hasLiked: post.likes.includes(currentUserId),
      createdAt: post.createdAt
    }));
    console.log(formattedPosts);
    console.log("I am here at 5")
    res.json({ posts: formattedPosts });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ error: 'Failed to fetch user posts' });
  }
});
// Like/Unlike post
router.put('/like/:postId', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const userId = req.userId;
    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    res.json({ 
      likesCount: post.likes.length, 
      hasLiked: !post.likes.includes(userId)
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