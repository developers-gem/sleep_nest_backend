const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  productId: { type: String },      // string id from Flutter (may differ from ObjectId)
  name:     { type: String, required: true },
  price:    { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  image:    { type: String },
  size:     { type: String },
});

const orderSchema = new mongoose.Schema(
  {
    // Links order to the authenticated user
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },

    orderNumber: {
      type: String,
      required: true,
      unique: true,
      default: () => 'SN-' + Math.floor(100000 + Math.random() * 900000),
    },

    customer: {
      name:    { type: String, required: true },
      email:   { type: String, required: true },
      phone:   { type: String },
      address: {
        street:     { type: String },
        city:       { type: String },
        state:      { type: String },
        postalCode: { type: String },
        country:    { type: String, default: 'India' },
      },
    },

    // Delivery address (from Flutter OrderAddress)
    address: {
      name:    { type: String },
      phone:   { type: String },
      line1:   { type: String },
      city:    { type: String },
      state:   { type: String },
      pincode: { type: String },
    },

    items: [orderItemSchema],

    subtotal:       { type: Number, default: 0 },
    discount:       { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 0 },
    totalAmount:    { type: Number, required: true },

    paymentMethod: {
      type: String,
      default: 'razorpay',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentId: { type: String },

    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'confirmed',
    },

    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
