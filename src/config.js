require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/sleepnest',
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
  EMAIL_FROM: process.env.EMAIL_FROM || 'no-reply@sleepnest.com',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || '',
  STRIPE_CURRENCY: process.env.STRIPE_CURRENCY || 'inr',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
  // For Ethereal test account, credentials will be generated in email utils if not provided.
};
