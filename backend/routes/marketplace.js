const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/marketplace');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
    }
  }
});

// Get all products with filters and search
router.get('/products', async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      location,
      condition,
      search,
      sort = 'newest'
    } = req.query;

    let query = { status: 'active' };

    // Apply filters
    if (category) query.category = category;
    if (location) query.location = location;
    if (condition) query.condition = condition;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Apply search
    if (search) {
      query.$text = { $search: search };
    }

    // Apply sorting
    let sortOption = {};
    switch (sort) {
      case 'price_asc':
        sortOption = { price: 1 };
        break;
      case 'price_desc':
        sortOption = { price: -1 };
        break;
      case 'popular':
        sortOption = { likes: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const products = await Product.find(query)
      .sort(sortOption)
      .populate('owner', 'username profileImage')
      .lean();

    res.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Create a new product
router.post('/products', auth, upload.array('images', 5), async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      location,
      condition
    } = req.body;

    // Get file paths for uploaded images
    const imageUrls = req.files.map(file => `/uploads/marketplace/${file.filename}`);

    const product = new Product({
      owner: req.user._id,
      title,
      description,
      price: Number(price),
      category,
      location,
      condition,
      images: imageUrls
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product' });
  }
});

// Get a single product
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('owner', 'username profileImage')
      .populate('likes', 'username profileImage');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Error fetching product' });
  }
});

// Update a product
router.put('/products/:id', auth, upload.array('images', 5), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    const {
      title,
      description,
      price,
      category,
      location,
      condition
    } = req.body;

    // Handle image updates
    let imageUrls = product.images;
    if (req.files && req.files.length > 0) {
      // Delete old images
      product.images.forEach(imageUrl => {
        const imagePath = path.join(__dirname, '..', imageUrl);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });

      // Get new image URLs
      imageUrls = req.files.map(file => `/uploads/marketplace/${file.filename}`);
    }

    product.title = title;
    product.description = description;
    product.price = Number(price);
    product.category = category;
    product.location = location;
    product.condition = condition;
    product.images = imageUrls;

    await product.save();
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product' });
  }
});

// Delete a product
router.delete('/products/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    // Delete images
    product.images.forEach(imageUrl => {
      const imagePath = path.join(__dirname, '..', imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    });

    await product.remove();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
});

// Like/Unlike a product
router.post('/products/:id/like', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const likeIndex = product.likes.indexOf(req.user._id);
    if (likeIndex === -1) {
      product.likes.push(req.user._id);
    } else {
      product.likes.splice(likeIndex, 1);
    }

    await product.save();
    res.json(product);
  } catch (error) {
    console.error('Error updating like status:', error);
    res.status(500).json({ message: 'Error updating like status' });
  }
});

module.exports = router; 