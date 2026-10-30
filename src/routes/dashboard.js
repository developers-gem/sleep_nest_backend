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

// ─── POST ENDPOINTS — Add products to dashboard sections ─────

// POST /api/dashboard/best-sellers — Add a best seller product
router.post('/best-sellers', async (req, res) => {
  try {
    const { name, description, price, originalPrice, image, category, rating, reviewCount, stock } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ success: false, message: 'name, price, and category are required' });
    }

    const product = new Product({
      name,
      description,
      price,
      originalPrice,
      image,
      category,
      isBestSeller: true,
      isNewArrival: false,
      rating: rating || 0,
      reviewCount: reviewCount || 0,
      stock: stock || 0,
    });

    await product.save();
    return res.status(201).json({ success: true, message: 'Best seller product added', data: product });
  } catch (err) {
    console.error('Add best seller error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/dashboard/new-arrivals — Add a new arrival product
router.post('/new-arrivals', async (req, res) => {
  try {
    const { name, description, price, originalPrice, image, category, rating, reviewCount, stock } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ success: false, message: 'name, price, and category are required' });
    }

    const product = new Product({
      name,
      description,
      price,
      originalPrice,
      image,
      category,
      isBestSeller: false,
      isNewArrival: true,
      rating: rating || 0,
      reviewCount: reviewCount || 0,
      stock: stock || 0,
    });

    await product.save();
    return res.status(201).json({ success: true, message: 'New arrival product added', data: product });
  } catch (err) {
    console.error('Add new arrival error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/dashboard/mattresses — Add a mattress product
router.post('/mattresses', async (req, res) => {
  try {
    const { name, description, price, originalPrice, image, isBestSeller, isNewArrival, rating, reviewCount, stock } = req.body;

    if (!name || !price) {
      return res.status(400).json({ success: false, message: 'name and price are required' });
    }

    const product = new Product({
      name,
      description,
      price,
      originalPrice,
      image,
      category: 'mattress',
      isBestSeller: isBestSeller || false,
      isNewArrival: isNewArrival || false,
      rating: rating || 0,
      reviewCount: reviewCount || 0,
      stock: stock || 0,
    });

    await product.save();
    return res.status(201).json({ success: true, message: 'Mattress product added', data: product });
  } catch (err) {
    console.error('Add mattress error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/dashboard/pillows — Add a pillow product
router.post('/pillows', async (req, res) => {
  try {
    const { name, description, price, originalPrice, image, isBestSeller, isNewArrival, rating, reviewCount, stock } = req.body;

    if (!name || !price) {
      return res.status(400).json({ success: false, message: 'name and price are required' });
    }

    const product = new Product({
      name,
      description,
      price,
      originalPrice,
      image,
      category: 'pillow',
      isBestSeller: isBestSeller || false,
      isNewArrival: isNewArrival || false,
      rating: rating || 0,
      reviewCount: reviewCount || 0,
      stock: stock || 0,
    });

    await product.save();
    return res.status(201).json({ success: true, message: 'Pillow product added', data: product });
  } catch (err) {
    console.error('Add pillow error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/dashboard/items — All items
router.get('/items', async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    console.error('All dashboard items fetch error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/dashboard/all-products — All products alias
router.get('/all-products', async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    console.error('All dashboard products fetch error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/dashboard/products/:id and /api/dashboard/product/:id — Product Details API
router.get(['/products/:id', '/product/:id'], async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID format' });
    }

    const item = await Product.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const { formatProductDetails } = require('./items');
    return res.json({ success: true, data: formatProductDetails(item) });
  } catch (err) {
    console.error('Fetch product detail error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
