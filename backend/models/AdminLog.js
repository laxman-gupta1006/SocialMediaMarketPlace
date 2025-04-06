// models/AdminLog.js
const crypto = require('crypto');
const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  details: mongoose.Schema.Types.Mixed,
  timestamp: {
    type: Date,
    default: Date.now
  },
  prevHash: {
    type: String,
    required: false
  },
  hash: {
    type: String,
    required: true
  }
});

adminLogSchema.pre('validate', async function(next) {
  const log = this;
  const lastLog = await mongoose.model('AdminLog').findOne().sort({ timestamp: -1 });

  log.prevHash = lastLog ? lastLog.hash : 'GENESIS';

  const dataToHash = `${log.admin}${log.action}${log.targetUser || ''}${JSON.stringify(log.details)}${log.timestamp}${log.prevHash}`;
  log.hash = crypto.createHash('sha256').update(dataToHash).digest('hex');

  next();
});

module.exports = mongoose.model('AdminLog', adminLogSchema);
