const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

// GET /api/dashboard — unified dashboard response with all sections
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const [bestSellers, newArrivals, mattresses, pillows] = await Promise.all([
      Product.find({ isBestSeller: true }).limit(limit).sort({ rating: -1 }),
      Product.find({ isNewArrival: true }).limit(limit).sort({ createdAt: -1 }),
      Product.find({ category: 'mattress' }).limit(limit).sort({ createdAt: -1 }),
      Product.find({ category: 'pillow' }).limit(limit).sort({ createdAt: -1 }),
    ]);

    return res.json({
      success: true,
      data: {
        bestSellers,
        newArrivals,
        mattresses,
        pillows,
      },
    });
  } catch (err) {
    console.error('Dashboard fetch error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/dashboard/best-sellers
router.get('/best-sellers', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const products = await Product.find({ isBestSeller: true })
      .limit(limit)
      .sort({ rating: -1 });

    return res.json({ success: true, data: products });
  } catch (err) {
    console.error('Best sellers fetch error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/dashboard/new-arrivals
router.get('/new-arrivals', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const products = await Product.find({ isNewArrival: true })
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: products });
  } catch (err) {
    console.error('New arrivals fetch error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/dashboard/mattresses
router.get('/mattresses', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const products = await Product.find({ category: 'mattress' })
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: products });
  } catch (err) {
    console.error('Mattresses fetch error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/dashboard/pillows
router.get('/pillows', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const products = await Product.find({ category: 'pillow' })
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: products });
  } catch (err) {
    console.error('Pillows fetch error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
