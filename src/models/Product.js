const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  brand: { type: String, trim: true, default: 'SleepNest' },
  description: { type: String, trim: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  discountPrice: { type: Number },
  image: { type: String },
  images: [{ type: String }],
  sizes: [{ type: String }],
  specs: { type: Map, of: String },
  material: { type: String, trim: true },
  tags: [{ type: String }],
  category: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  isBestSeller: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  inStock: { type: Boolean, default: true },
}, { timestamps: true });

// Sync single image with images array and stock with inStock
productSchema.pre('save', function (next) {
  if (this.image && (!this.images || this.images.length === 0)) {
    this.images = [this.image];
  } else if (!this.image && this.images && this.images.length > 0) {
    this.image = this.images[0];
  }
  if (this.stock !== undefined && this.stock !== null) {
    this.inStock = this.stock > 0;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
