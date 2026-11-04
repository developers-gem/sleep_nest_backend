const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

// ─── GET /api/orders/stats — Order analytics (admin, no auth guard) ──
router.get('/stats', async (req, res) => {
  try {
    const totalOrders      = await Order.countDocuments();
    const pendingOrders    = await Order.countDocuments({ orderStatus: 'pending' });
    const processingOrders = await Order.countDocuments({ orderStatus: { $in: ['confirmed', 'processing'] } });
    const deliveredOrders  = await Order.countDocuments({ orderStatus: 'delivered' });
    const cancelledOrders  = await Order.countDocuments({ orderStatus: 'cancelled' });

    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    return res.json({
      success: true,
      data: { totalOrders, pendingOrders, processingOrders, deliveredOrders, cancelledOrders, totalRevenue },
    });
  } catch (err) {
    console.error('Order stats error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
  }
});

// ─── GET /api/orders — List orders for the authenticated user ─────────
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const filter = { userId: req.user.userId };

    if (status && status !== 'all') {
      filter.orderStatus = status;
    }

    const pageNum  = parseInt(page)  || 1;
    const limitNum = parseInt(limit) || 50;
    const skip     = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Order.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (err) {
    console.error('Get orders error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
  }
});

// ─── GET /api/orders/:id — Get single order (must belong to user) ─────
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    return res.json({ success: true, data: order });
  } catch (err) {
    console.error('Get order error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
  }
});

// ─── POST /api/orders — Create a new order ───────────────────────────
//
//  Accepts the Flutter OrderService payload:
//  {
//    items: [{ productId, name, size, quantity, price, image }],
//    address: { name, phone, line1, city, state, pincode },
//    subtotal, discount, deliveryCharge, total,
//    paymentMethod, transactionId
//  }
//
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      items,
      address,
      subtotal      = 0,
      discount      = 0,
      deliveryCharge = 0,
      total,
      paymentMethod = 'razorpay',
      transactionId,
      // legacy fields (from admin dashboard usage)
      customer,
      totalAmount,
    } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'items array is required' });
    }

    // Resolve user info for the customer sub-doc
    let customerName  = address?.name  || customer?.name  || '';
    let customerEmail = customer?.email || '';
    let customerPhone = address?.phone  || customer?.phone || '';

    if (!customerEmail) {
      // Look up email from the user record (always available after auth)
      const userDoc = await User.findById(req.user.userId).select('name email');
      if (userDoc) {
        customerEmail = userDoc.email;
        if (!customerName) customerName = userDoc.name;
      }
    }
    customerEmail = customerEmail || req.user.email || 'customer@sleepnest.com';
    customerName = customerName || 'Customer';

    // Map Flutter items → Mongoose orderItemSchema
    const mappedItems = items.map((item) => ({
      product:   (item.productId && mongoose.Types.ObjectId.isValid(item.productId)) ? item.productId : undefined,
      productId: item.productId || '',
      name:      item.name      || 'Product',
      price:     Number(item.price)    || 0,
      quantity:  Number(item.quantity) || 1,
      image:     item.image || '',
      size:      item.size  || '',
    }));

    const resolvedTotal = Number(total) || Number(totalAmount) ||
      (Number(subtotal) - Number(discount) + Number(deliveryCharge));

    const order = new Order({
      userId: req.user.userId,
      customer: {
        name:  customerName,
        email: customerEmail,
        phone: customerPhone,
        address: {
          street:     address?.line1   || '',
          city:       address?.city    || '',
          state:      address?.state   || '',
          postalCode: address?.pincode || '',
        },
      },
      address: address || {},
      items:          mappedItems,
      subtotal:       Number(subtotal),
      discount:       Number(discount),
      deliveryCharge: Number(deliveryCharge),
      totalAmount:    resolvedTotal,
      paymentMethod:  paymentMethod,
      paymentStatus:  transactionId ? 'paid' : 'pending',
      paymentId:      transactionId || '',
      orderStatus:    'confirmed',
    });

    await order.save();

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (err) {
    console.error('Create order error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
  }
});

// ─── PUT /api/orders/:id/status — Update order status ───────────────
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const { orderStatus, paymentStatus, notes } = req.body;
    const updateData = {};

    if (orderStatus)             updateData.orderStatus  = orderStatus;
    if (paymentStatus)           updateData.paymentStatus = paymentStatus;
    if (notes !== undefined)     updateData.notes        = notes;

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      updateData,
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.json({ success: true, message: 'Order status updated', data: order });
  } catch (err) {
    console.error('Update order status error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
  }
});

module.exports = router;
