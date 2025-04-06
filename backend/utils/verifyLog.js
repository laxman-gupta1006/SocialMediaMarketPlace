// utils/verifyLog.js
const AdminLog = require('../models/AdminLog');
const crypto = require('crypto');

const verifyLog = async () => {
  const logs = await AdminLog.find().sort('timestamp').lean();
  for (let i = 1; i < logs.length; i++) {
    const prev = logs[i - 1];
    const curr = logs[i];
    const expectedPrevHash = prev.hash;
    const dataToHash = `${curr.admin}${curr.action}${curr.targetUser || ''}${JSON.stringify(curr.details)}${curr.timestamp}${expectedPrevHash}`;
    const recalculatedHash = crypto.createHash('sha256').update(dataToHash).digest('hex');

    if (curr.prevHash !== expectedPrevHash || curr.hash !== recalculatedHash) {
      return { valid: false, tamperedIndex: i };
    }
  }
  return { valid: true };
};

module.exports = { verifyLog };
