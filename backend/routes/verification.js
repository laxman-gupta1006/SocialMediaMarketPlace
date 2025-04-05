const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const User = require('../models/User');

// Configure multer storage for identity documents
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/verification');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'verify-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow image files or PDF documents
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Please upload an image or PDF.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

// -------------------------------------------------------------------------
// POST /api/verification/request
// Allows a user to submit a verification request with an identity document
// -------------------------------------------------------------------------
router.post('/request', authMiddleware, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a valid document.' });
    }
    const documentPath = '/uploads/verification/' + req.file.filename;
    
    // Update the user's verification fields: save the document path and mark the request as submitted
    await User.findByIdAndUpdate(req.userId, {
      'verification.document': documentPath,
      'verification.verificationRequested': true
    });
    
    res.json({ message: 'Verification request submitted successfully.', document: documentPath });
  } catch (error) {
    console.error('Verification request error:', error);
    res.status(500).json({ error: 'Error submitting verification request.' });
  }
});

// // -------------------------------------------------------------------------
// // GET /api/verification/requests
// // Allows an admin to fetch all pending verification requests
// // -------------------------------------------------------------------------
// router.get('/requests', authMiddleware, requireAdmin, async (req, res) => {
//   try {
//     const pendingRequests = await User.find({ 'verification.verificationRequested': true })
//       .select('username fullName email verification.document verification.verificationRequested verification.adminVerified');
//     res.json(pendingRequests);
//   } catch (error) {
//     console.error('Error fetching verification requests:', error);
//     res.status(500).json({ error: 'Server error fetching verification requests.' });
//   }
// });

// // -------------------------------------------------------------------------
// // PUT /api/verification/approve/:userId
// // Allows an admin to approve a user's verification request
// // -------------------------------------------------------------------------
// router.put('/approve/:userId', authMiddleware, requireAdmin, async (req, res) => {
//   try {
//     const updatedUser = await User.findByIdAndUpdate(
//       req.params.userId,
//       {
//         'verification.adminVerified': true,
//         'verification.verificationRequested': false
//       },
//       { new: true }
//     );
//     if (!updatedUser) {
//       return res.status(404).json({ error: 'User not found.' });
//     }
//     res.json({ message: 'User verification approved successfully.', user: updatedUser });
//   } catch (error) {
//     console.error('Error approving verification:', error);
//     res.status(500).json({ error: 'Server error approving verification.' });
//   }
// });

// // -------------------------------------------------------------------------
// // PUT /api/verification/reject/:userId
// // Allows an admin to reject a user's verification request
// // -------------------------------------------------------------------------
// router.put('/reject/:userId', authMiddleware, requireAdmin, async (req, res) => {
//   try {
//     const updatedUser = await User.findByIdAndUpdate(
//       req.params.userId,
//       {
//         'verification.verificationRequested': false,
//         'verification.document': ''
//       },
//       { new: true }
//     );
//     if (!updatedUser) {
//       return res.status(404).json({ error: 'User not found.' });
//     }
//     res.json({ message: 'User verification request rejected successfully.', user: updatedUser });
//   } catch (error) {
//     console.error('Error rejecting verification:', error);
//     res.status(500).json({ error: 'Server error rejecting verification.' });
//   }
// });

module.exports = router;
