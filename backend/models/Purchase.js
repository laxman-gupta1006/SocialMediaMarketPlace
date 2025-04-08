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
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buyerUsername: {
    type: String,
    required: true
  },
  productOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productOwnerUsername: {
    type: String,
    required: true
  }
}, { timestamps: true });

purchaseSchema.pre('save', function (next) {
  if (
    this.isModified('paymentDetails') &&
    this.paymentMethod === 'credit' &&
    typeof this.paymentDetails === 'object'
  ) {
    const details = this.paymentDetails;

    // Mask card number - show only last 4 digits
    if (details.cardNumber && typeof details.cardNumber === 'string') {
      const last4 = details.cardNumber.slice(-4);
      this.paymentDetails.cardNumber = `**** **** **** ${last4}`;
    }

    // Mask CVV - always ***
    if (details.cvv) {
      this.paymentDetails.cvv = '***';
    }
  }

  next();
});


module.exports = mongoose.model("Purchase", purchaseSchema);