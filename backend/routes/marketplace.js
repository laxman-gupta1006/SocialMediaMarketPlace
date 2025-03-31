const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const Product = require('../models/Product'); // Critical import

// Configure secure file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/marketplace/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 
    'image/png', 
    'image/webp'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, and WEBP files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5
  }
});

// Create product endpoint
router.post('/AddProduct', auth, upload.array('images', 5), async (req, res) => {
  let uploadedFiles = [];
  
  try {
    // Validate required fields
    const requiredFields = ['title', 'description', 'price', 'category', 'location', 'condition'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // Validate files
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least one image is required' });
    }
    uploadedFiles = req.files;

    // Create product object
    const productData = {
      owner: req.userId,
      title: req.body.title.trim(),
      description: req.body.description.trim(),
      price: parseFloat(req.body.price),
      category: req.body.category,
      location: req.body.location.trim(),
      condition: req.body.condition,
      images: req.files.map(file => 
        path.join('uploads', 'marketplace', file.filename)
      )
    };

    // Validate price
    if (isNaN(productData.price) || productData.price < 0) {
      return res.status(400).json({ error: 'Invalid price value' });
    }

    // Save to database
    const product = new Product(productData);
    const savedProduct = await product.save();

    res.status(201).json(savedProduct);

  } catch (error) {
    // Cleanup uploaded files on error
    if (uploadedFiles.length > 0) {
      await Promise.all(uploadedFiles.map(async (file) => {
        try {
          await fs.unlink(file.path);
          console.log(`Cleaned up file: ${file.path}`);
        } catch (cleanupError) {
          console.error('File cleanup failed:', cleanupError);
        }
      }));
    }

    // Handle errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ errors });
    }
    
    console.error('Product creation error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to create product' 
    });
  }
});

// routes/products.js
router.get('/search', async (req, res) => {
  try {
    // Parse query parameters with validation
    const { 
      q: searchQuery,
      category,
      minPrice,
      maxPrice,
      location,
      condition
    } = req.query;

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));

    // Base filter for active products
    const filter = { status: 'active' };

    // Text search (using MongoDB text index)
    if (searchQuery?.trim()) {
      filter.$text = { $search: searchQuery.trim() };
    }

    // Category filter (supports multiple categories)
    if (category) {
      const categories = Array.isArray(category) ? category : [category];
      filter.category = { 
        $in: categories.filter(c => 
          ['electronics', 'fashion', 'home', 'books', 'sports', 'other'].includes(c)
        )
      };
    }

    // Price range validation
    if (minPrice || maxPrice) {
      filter.price = {};
      const min = parseFloat(minPrice);
      const max = parseFloat(maxPrice);
      
      if (!isNaN(min) && min >= 0) filter.price.$gte = min;
      if (!isNaN(max) && max >= 0) filter.price.$lte = max;
      
      // Remove price filter if invalid
      if (Object.keys(filter.price).length === 0) delete filter.price;
    }

    // Location search with regex sanitization
    if (location?.trim()) {
      const sanitizedLocation = location.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      filter.location = { $regex: new RegExp(sanitizedLocation, 'i') };
    }

    // Condition filter (supports multiple conditions)
    if (condition) {
      const conditions = Array.isArray(condition) ? condition : [condition];
      filter.condition = {
        $in: conditions.filter(c =>
          ['new', 'like_new', 'good', 'fair', 'poor'].includes(c)
        )
      };
    }

    // Execute parallel queries for data and count
    const [products, count] = await Promise.all([
      Product.find(filter)
        .populate('owner', 'username')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter)
    ]);

    // Convert image paths to full URLs
    const baseUrl = `https://localhost:3000`;
// In your search route's projection
const processedProducts = products.map(product => ({
  ...product,
  id: product._id,  // Add this line
  images: product.images.map(img => `${baseUrl}/${img.replace(/\\/g, '/')}`),
  owner: product.owner?.username || 'Unknown Seller'
}));

    res.json({
      products: processedProducts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalResults: count
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: 'Failed to perform search. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;