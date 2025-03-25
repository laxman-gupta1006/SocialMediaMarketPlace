const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  fullName: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  bio: { 
    type: String,
    trim: true,
    maxlength: 150
  },
  profileImage: { 
    type: String,
    default: '/default-profile.png'
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: true 
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  postsCount: { 
    type: Number, 
    default: 0 
  },
  privacySettings: {
    profileVisibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual fields for counts
userSchema.virtual('followersCount').get(function() {
  return this.followers.length;
});

userSchema.virtual('followingCount').get(function() {
  return this.following.length;
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Indexes for better performance
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ followers: 1 });
userSchema.index({ following: 1 });

const User = mongoose.model("User", userSchema);
module.exports = User;