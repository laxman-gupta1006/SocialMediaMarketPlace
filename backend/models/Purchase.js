const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['credit', 'upi', 'netbanking']
  },
  paymentDetails: {
    type: Object,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model("Purchase", purchaseSchema);