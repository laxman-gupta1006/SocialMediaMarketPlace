const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true,
    index: true
  },
  image: { 
    type: String, 
    required: true,
    validate: {
      validator: v => /\.(jpe?g|png|gif|webp)$/i.test(v),
      message: props => `${props.value} is not a valid image file!`
    }
  },
  caption: {
    type: String,
    maxlength: 2000,
    trim: true
  },
  likes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }],
  comments: [{
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: true
    },
    username: {
      type: String,
      required: true
    },
    profileImage: {
      type: String,
      required: true
    },
    text: {
      type: String,
      maxlength: 1000,
      trim: true,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  visibility: { 
    type: String, 
    enum: ["public", "private", "followers"], 
    default: "public"
  },
  authorizedUsers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    index: true
  }],
  reports: [{
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: true
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'harassment', 'other'],
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true
  }
});

// Add geospatial index for location-based queries
postSchema.index({ location: '2dsphere' });

// Middleware to automatically populate username when saving comments
postSchema.pre('save', async function(next) {
  if (this.isModified('comments')) {
    const User = mongoose.model('User');
    for (const comment of this.comments) {
      if (!comment.username && comment.userId) {
        const user = await User.findById(comment.userId);
        if (user) {
          comment.username = user.username;
        }
      }
    }
  }
  next();
});

module.exports = mongoose.model("Post", postSchema);