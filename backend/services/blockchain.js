const { ethers } = require('ethers');
const AdminLogChain = require('../build/contracts/AdminLogChain.json');

class BlockchainService {
  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC);
    this.wallet = new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY, this.provider);
    this.contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      AdminLogChain.abi,
      this.wallet
    );
  }

  async logToBlockchain(logHash, timestamp) {
    const tx = await this.contract.addLogEntry(logHash, timestamp);
    await tx.wait();
    return tx.hash;
  }
}

module.exports = new BlockchainService();