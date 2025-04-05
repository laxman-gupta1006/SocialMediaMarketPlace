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
    default: function() {
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.username}`;
    }
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
    required: true,
    minlength: 6
  },
  followers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    profileImage: {
      type: String,
      required: true
    }
  }],
  following: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    profileImage: {
      type: String,
      required: true
    }
  }],
  phoneNumber: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
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
  },
lastActive: {
  type: Date,
  default: Date.now
},
adminNotes: [{
  content: String,
  createdBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    profileImage: {
      type: String,
      default: ''
    }
  },
  action: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
}],
loginHistory: [{
  ip: String,
  device: String,
  location: String,
  timestamp: Date
}],
status: {
  type: String,
  enum: ['active', 'banned', 'suspended', 'deactivated'],
  default: 'active'
},
roles: [{
  type: String,
  enum: ['user', 'admin'],
  default: ['user']
}],
verification: {
  emailVerified: Boolean,
  phoneVerified: Boolean,
  twoFactorEnabled: Boolean,
  adminVerified: Boolean,
  verificationRequested: { type: Boolean, default: false },
  document: { type: String, default: '' }
},
banned: {
  type: Boolean,
  default: false
}
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.virtual('followersCount').get(function() {
  return this.followers ? this.followers.length : 0;
});

userSchema.virtual('followingCount').get(function() {
  return this.following ? this.following.length : 0;
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