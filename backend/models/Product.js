const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: String, required: true }, // Can store as String for ETH
  image: { type: String, required: true },
  owner: { type: String, required: true },
  category: { type: String, required: true }
});

// Create a Product model
const Product = mongoose.model("Product", productSchema);

module.exports = Product;
