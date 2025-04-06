const Queue = require('bull');
const blockchainService = require('./blockchain');

const blockchainQueue = new Queue('blockchain', process.env.REDIS_URL);

blockchainQueue.process(async (job) => {
  const { logData } = job.data;
  const hash = generateHash(logData);
  const txHash = await blockchainService.logToBlockchain(hash, logData.timestamp);
  return { txHash };
});

function generateHash(logData) {
  const str = `${logData.admin}${logData.action}${logData.targetUser}${JSON.stringify(logData.details)}${logData.timestamp}`;
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(str));
}

module.exports = { blockchainQueue };