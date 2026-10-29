/**
 * Seed script — populates the database with sample SleepNest products.
 * Run: node src/scripts/seed.js
 */
const mongoose = require('mongoose');
const config = require('../config');
const Product = require('../models/Product');

const products = [
  // ─── Mattresses ────────────────────────────────────────────
  {
    name: 'SleepNest Ortho Memory Foam Mattress',
    description: 'Premium memory foam mattress with orthopaedic support for spine alignment.',
    price: 12999,
    originalPrice: 18999,
    image: 'https://via.placeholder.com/400x400?text=Ortho+Memory+Foam',
    category: 'mattress',
    isBestSeller: true,
    isNewArrival: false,
    rating: 4.7,
    reviewCount: 342,
    stock: 50,
  },
  {
    name: 'SleepNest Natural Latex Mattress',
    description: 'Eco-friendly natural latex mattress with hypoallergenic properties.',
    price: 19999,
    originalPrice: 27999,
    image: 'https://via.placeholder.com/400x400?text=Natural+Latex',
    category: 'mattress',
    isBestSeller: true,
    isNewArrival: false,
    rating: 4.8,
    reviewCount: 215,
    stock: 30,
  },
  {
    name: 'SleepNest Dual Comfort Mattress',
    description: 'Reversible dual comfort mattress — soft on one side, firm on the other.',
    price: 9999,
    originalPrice: 14999,
    image: 'https://via.placeholder.com/400x400?text=Dual+Comfort',
    category: 'mattress',
    isBestSeller: false,
    isNewArrival: true,
    rating: 4.5,
    reviewCount: 128,
    stock: 75,
  },
  {
    name: 'SleepNest Cool Gel Mattress',
    description: 'Cooling gel-infused foam mattress for temperature regulation during sleep.',
    price: 15999,
    originalPrice: 22999,
    image: 'https://via.placeholder.com/400x400?text=Cool+Gel',
    category: 'mattress',
    isBestSeller: false,
    isNewArrival: true,
    rating: 4.6,
    reviewCount: 89,
    stock: 40,
  },
  {
    name: 'SleepNest Spring Pro Mattress',
    description: 'Pocket spring mattress with individually wrapped coils for zero motion transfer.',
    price: 17499,
    originalPrice: 24999,
    image: 'https://via.placeholder.com/400x400?text=Spring+Pro',
    category: 'mattress',
    isBestSeller: true,
    isNewArrival: false,
    rating: 4.4,
    reviewCount: 176,
    stock: 25,
  },

  // ─── Pillows ───────────────────────────────────────────────
  {
    name: 'SleepNest Memory Foam Pillow',
    description: 'Contoured memory foam pillow with cervical support for neck pain relief.',
    price: 1499,
    originalPrice: 2499,
    image: 'https://via.placeholder.com/400x400?text=Memory+Foam+Pillow',
    category: 'pillow',
    isBestSeller: true,
    isNewArrival: false,
    rating: 4.6,
    reviewCount: 512,
    stock: 200,
  },
  {
    name: 'SleepNest Microfiber Pillow',
    description: 'Ultra-soft microfiber pillow with plush comfort and breathable design.',
    price: 799,
    originalPrice: 1299,
    image: 'https://via.placeholder.com/400x400?text=Microfiber+Pillow',
    category: 'pillow',
    isBestSeller: true,
    isNewArrival: false,
    rating: 4.3,
    reviewCount: 389,
    stock: 300,
  },
  {
    name: 'SleepNest Gel Cooling Pillow',
    description: 'Gel-infused cooling pillow that stays cool throughout the night.',
    price: 1999,
    originalPrice: 2999,
    image: 'https://via.placeholder.com/400x400?text=Gel+Cooling+Pillow',
    category: 'pillow',
    isBestSeller: false,
    isNewArrival: true,
    rating: 4.7,
    reviewCount: 67,
    stock: 100,
  },
  {
    name: 'SleepNest Bamboo Pillow',
    description: 'Natural bamboo fiber pillow with anti-bacterial and moisture-wicking properties.',
    price: 1299,
    originalPrice: 1999,
    image: 'https://via.placeholder.com/400x400?text=Bamboo+Pillow',
    category: 'pillow',
    isBestSeller: false,
    isNewArrival: true,
    rating: 4.5,
    reviewCount: 43,
    stock: 150,
  },
  {
    name: 'SleepNest Latex Pillow',
    description: 'Natural latex pillow with pin-hole design for superior ventilation.',
    price: 2499,
    originalPrice: 3499,
    image: 'https://via.placeholder.com/400x400?text=Latex+Pillow',
    category: 'pillow',
    isBestSeller: false,
    isNewArrival: true,
    rating: 4.8,
    reviewCount: 28,
    stock: 80,
  },
];

async function seed() {
  try {
    await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for seeding');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert seed data
    const inserted = await Product.insertMany(products);
    console.log(`Seeded ${inserted.length} products successfully`);

    await mongoose.disconnect();
    console.log('MongoDB disconnected');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
