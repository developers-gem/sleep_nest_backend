const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  image: { type: String },
  category: {
    type: String,
    required: true,
    enum: ['mattress', 'pillow', 'bedsheet', 'topper', 'accessory'],
    lowercase: true,
  },
  isBestSeller: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
