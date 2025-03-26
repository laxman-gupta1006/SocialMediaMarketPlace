const mongoose = require('mongoose');

const OTPVerificationSchema = new mongoose.Schema({
  email: { type: String },
  phoneNumber: { type: String },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

// TTL index for auto-deletion after expiration
OTPVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OTPVerification', OTPVerificationSchema);