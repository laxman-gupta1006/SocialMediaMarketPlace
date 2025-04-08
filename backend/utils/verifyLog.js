// utils/verifyLog.js
const AdminLog = require('../models/AdminLog');
const crypto = require('crypto');

const verifyLog = async () => {
  const logs = await AdminLog.find().sort('timestamp').lean();
  
  // If there are no logs, return valid
  if (logs.length === 0) return { valid: true, message: "No logs to verify" };

  // Verify the first log (genesis block)
  if (logs.length > 0) {
    const firstLog = logs[0];
    const dataToHash = `${firstLog.admin}${firstLog.action}${firstLog.targetUser || ''}${JSON.stringify(firstLog.details)}${firstLog.timestamp}${firstLog.prevHash}`;
    const recalculatedHash = crypto.createHash('sha256').update(dataToHash).digest('hex');
    
    if (firstLog.hash !== recalculatedHash) {
      return { 
        valid: false, 
        tamperedIndex: 0,
        message: "Genesis block hash mismatch" 
      };
    }
  }

  // Verify subsequent logs
  for (let i = 1; i < logs.length; i++) {
    const prev = logs[i - 1];
    const curr = logs[i];
    
    // First verify previous hash matches
    if (curr.prevHash !== prev.hash) {
      return { 
        valid: false, 
        tamperedIndex: i,
        message: `Previous hash mismatch at index ${i}` 
      };
    }
    
    // Then verify current hash
    const dataToHash = `${curr.admin}${curr.action}${curr.targetUser || ''}${JSON.stringify(curr.details)}${curr.timestamp}${curr.prevHash}`;
    const recalculatedHash = crypto.createHash('sha256').update(dataToHash).digest('hex');
    
    if (curr.hash !== recalculatedHash) {
      return { 
        valid: false, 
        tamperedIndex: i,
        message: `Hash mismatch at index ${i}` 
      };
    }
  }
  
  return { 
    valid: true,
    message: "All logs verified successfully" 
  };
};

module.exports = { verifyLog };
