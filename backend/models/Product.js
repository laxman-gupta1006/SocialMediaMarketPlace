const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ownerUsername: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  description: {
    type: String,
    required: true,
    maxLength: 1000
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['electronics', 'fashion', 'home', 'books', 'sports', 'other'],
  },
  location: {
    type: String,
    required: true
  },
  condition: {
    type: String,
    required: true,
    enum: ['new', 'like_new', 'good', 'fair', 'poor']
  },
  images: {
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return v.length >= 1 && v.length <= 5;
      },
      message: 'Product must have between 1 and 5 images'
    }
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'inactive'],
    default: 'active'
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  versionKey: false
});

// In your Product schema definition
productSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
  }
});

productSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Text index for search
productSchema.index({ 
  title: 'text', 
  description: 'text' 
}, {
  weights: {
    title: 10,
    description: 5
  }
});

module.exports = mongoose.model("Product", productSchema);