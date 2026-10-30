const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const router = express.Router();

/**
 * Helper to build filter query from request query params
 */
function buildFilterQuery(queryParams) {
  const filter = {};

  // Category filter (support single or comma-separated, ignore 'all')
  if (queryParams.category && queryParams.category.toLowerCase() !== 'all') {
    const categories = queryParams.category.split(',').map(c => c.trim().toLowerCase());
    filter.category = categories.length > 1 ? { $in: categories } : categories[0];
  }

  // Price range filter
  if (queryParams.minPrice !== undefined || queryParams.maxPrice !== undefined) {
    filter.price = {};
    if (queryParams.minPrice !== undefined && !isNaN(Number(queryParams.minPrice))) {
      filter.price.$gte = Number(queryParams.minPrice);
    }
    if (queryParams.maxPrice !== undefined && !isNaN(Number(queryParams.maxPrice))) {
      filter.price.$lte = Number(queryParams.maxPrice);
    }
  }

  // Search filter (text search across name, description, brand, material, category, tags)
  const searchQuery = queryParams.search || queryParams.q;
  if (searchQuery && searchQuery.trim() !== '') {
    const regex = new RegExp(searchQuery.trim(), 'i');
    filter.$or = [
      { name: regex },
      { description: regex },
      { brand: regex },
      { material: regex },
      { category: regex },
      { tags: regex },
    ];
  }

  // Boolean flags
  if (queryParams.isBestSeller !== undefined) {
    filter.isBestSeller = queryParams.isBestSeller === 'true' || queryParams.isBestSeller === true;
  }
  if (queryParams.isNewArrival !== undefined) {
    filter.isNewArrival = queryParams.isNewArrival === 'true' || queryParams.isNewArrival === true;
  }
  if (queryParams.inStock !== undefined) {
    const inStockBool = queryParams.inStock === 'true' || queryParams.inStock === true;
    if (inStockBool) {
      filter.inStock = true;
    } else {
      filter.inStock = false;
    }
  }

  return filter;
}

/**
 * Helper to build sort object
 */
function buildSortOption(sortParam) {
  switch (sortParam) {
    case 'price_low':
    case 'price_asc':
      return { price: 1 };
    case 'price_high':
    case 'price_desc':
      return { price: -1 };
    case 'rating':
      return { rating: -1, reviewCount: -1 };
    case 'popular':
    case 'reviews':
      return { reviewCount: -1, rating: -1 };
    case 'newest':
    case 'recent':
      return { createdAt: -1 };
    case 'oldest':
      return { createdAt: 1 };
    default:
      return { createdAt: -1 };
  }
}

/**
 * Format product details ensuring name, rating, images, specs, and sizes are present
 */
function formatProductDetails(item) {
  if (!item) return null;
  const doc = item.toObject ? item.toObject() : { ...item };

  const defaultFallbackImage = (category) => {
    switch (category) {
      case 'pillow':
        return 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800';
      case 'mattress':
      default:
        return 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800';
    }
  };

  let images = Array.isArray(doc.images) && doc.images.length > 0 ? [...doc.images] : [];
  if (images.length === 0 && doc.image) {
    images = [doc.image];
  }
  images = images.map((img) =>
    img && !img.includes('example.com') && !img.includes('via.placeholder')
      ? img
      : defaultFallbackImage(doc.category)
  );
  if (images.length === 0) {
    images = [defaultFallbackImage(doc.category)];
  }

  // Ensure default sizes if missing
  let sizes = Array.isArray(doc.sizes) && doc.sizes.length > 0 ? doc.sizes : [];
  if (sizes.length === 0) {
    if (doc.category === 'pillow') {
      sizes = ['Standard (18" x 27")', 'Queen (20" x 30")', 'King (20" x 36")'];
    } else if (doc.category === 'mattress') {
      sizes = ['Single (72" x 36")', 'Queen (78" x 60")', 'King (78" x 72")'];
    } else {
      sizes = ['Standard', 'Custom'];
    }
  }

  // Ensure default specs if missing
  let specs = doc.specs && typeof doc.specs === 'object' && Object.keys(doc.specs).length > 0 ? doc.specs : null;
  if (!specs || Object.keys(specs).length === 0) {
    if (doc.category === 'pillow') {
      specs = {
        'Material': doc.material || 'Premium Breathable Memory Foam',
        'Dimensions': '24 x 16 inches',
        'Firmness': 'Medium Soft',
        'Cover': 'Organic Cotton, Hypoallergenic',
        'Care': 'Machine washable removable cover',
        'Warranty': '1 Year SleepNest Warranty',
      };
    } else if (doc.category === 'mattress') {
      specs = {
        'Material': doc.material || 'Multi-layer High Resilience Orthopedic Foam',
        'Comfort Level': 'Medium Firm',
        'Thickness': '6 to 8 inches',
        'Trial Period': '100 Nights Risk-Free Trial',
        'Cover': 'Breathable Knitted Fabric',
        'Warranty': '10 Years Manufacturer Warranty',
      };
    } else {
      specs = {
        'Material': doc.material || 'Premium Materials',
        'Warranty': '1 Year SleepNest Warranty',
        'Quality': 'Certified Comfort Guarantee',
      };
    }
  }

  return {
    ...doc,
    name: doc.name,
    rating: doc.rating !== undefined && doc.rating !== null ? Number(doc.rating) : 4.5,
    reviewCount: doc.reviewCount !== undefined && doc.reviewCount !== null ? Number(doc.reviewCount) : 0,
    image: images[0],
    images,
    sizes,
    specs,
  };
}

module.exports.formatProductDetails = formatProductDetails;

// ─── GET /api/items (or /api/products) ───────────────────────────
// Returns all items with optional filters, search, sorting, and pagination
router.get('/', async (req, res) => {
  try {
    const filter = buildFilterQuery(req.query);
    const sort = buildSortOption(req.query.sort);

    const hasPagination = req.query.page !== undefined || (req.query.limit !== undefined && req.query.limit !== 'all');
    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const limit = req.query.limit && req.query.limit !== 'all' ? parseInt(req.query.limit) : 0;

    const total = await Product.countDocuments(filter);

    let query = Product.find(filter).sort(sort);
    if (limit > 0) {
      query = query.skip((page - 1) * limit).limit(limit);
    }

    const items = await query.exec();

    return res.json({
      success: true,
      count: items.length,
      total,
      ...(limit > 0 ? {
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      } : {}),
      data: items,
    });
  } catch (err) {
    console.error('Fetch all items error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
  }
});

// ─── GET /api/items/all — Explicit endpoint to get all items ──────
router.get('/all', async (req, res) => {
  try {
    const items = await Product.find({}).sort({ createdAt: -1 });
    return res.json({
      success: true,
      count: items.length,
      total: items.length,
      data: items,
    });
  } catch (err) {
    console.error('Fetch all items (explicit) error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
  }
});

// ─── GET /api/items/categories — List all unique categories ───────
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    return res.json({
      success: true,
      data: categories.map(c => ({ category: c._id, count: c.count })),
    });
  } catch (err) {
    console.error('Fetch categories error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── GET /api/items/:id (or /api/products/:id) — Get single item details by ID ──
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid item ID format' });
    }

    const item = await Product.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    return res.json({ success: true, data: formatProductDetails(item) });
  } catch (err) {
    console.error('Fetch single item error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── POST /api/items — Create a new item ──────────────────────────
router.post('/', async (req, res) => {
  try {
    const {
      name,
      brand,
      description,
      price,
      originalPrice,
      discountPrice,
      image,
      images,
      sizes,
      specs,
      material,
      tags,
      category,
      isBestSeller,
      isNewArrival,
      rating,
      reviewCount,
      stock,
      inStock,
    } = req.body;

    if (!name || price === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: 'name, price, and category are required',
      });
    }

    const product = new Product({
      name,
      brand: brand || 'SleepNest',
      description: description || '',
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      image: image || (images && images.length ? images[0] : ''),
      images: images || (image ? [image] : []),
      sizes: sizes || [],
      specs: specs || {},
      material: material || '',
      tags: tags || [],
      category: category.toLowerCase(),
      isBestSeller: Boolean(isBestSeller),
      isNewArrival: Boolean(isNewArrival),
      rating: rating ? Number(rating) : 0,
      reviewCount: reviewCount ? Number(reviewCount) : 0,
      stock: stock ? Number(stock) : 0,
      inStock: inStock !== undefined ? Boolean(inStock) : (stock ? Number(stock) > 0 : true),
    });

    await product.save();
    return res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: product,
    });
  } catch (err) {
    console.error('Create item error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
  }
});

// ─── PUT /api/items/:id — Update an item ──────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid item ID format' });
    }

    const item = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    return res.json({
      success: true,
      message: 'Item updated successfully',
      data: item,
    });
  } catch (err) {
    console.error('Update item error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
  }
});

// ─── DELETE /api/items/:id — Delete an item ───────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid item ID format' });
    }

    const item = await Product.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    return res.json({
      success: true,
      message: 'Item deleted successfully',
      data: { id: item._id, name: item.name },
    });
  } catch (err) {
    console.error('Delete item error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
  }
});

module.exports = router;
