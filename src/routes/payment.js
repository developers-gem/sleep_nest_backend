const express = require('express');
const router = express.Router();
const config = require('../config');

// Initialize Stripe with secret key
const stripe = config.STRIPE_SECRET_KEY
  ? require('stripe')(config.STRIPE_SECRET_KEY)
  : null;

/**
 * POST /api/payment/create-payment-intent
 * Body: { amount: number, currency?: string, customerEmail?: string, metadata?: object }
 */
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = config.STRIPE_CURRENCY || 'inr', customerEmail, metadata = {} } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, error: 'A valid payment amount is required' });
    }

    if (!stripe) {
      return res.status(500).json({
        success: false,
        error: 'Stripe secret key is not configured. Please set STRIPE_SECRET_KEY in your environment or .env file.',
      });
    }

    // Stripe expects amount in smallest currency unit (e.g. cents for USD, paise for INR)
    const amountInSmallestUnit = Math.round(Number(amount) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSmallestUnit,
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        customerEmail: customerEmail || '',
        ...metadata,
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      publishableKey: config.STRIPE_PUBLISHABLE_KEY,
    });
  } catch (error) {
    console.error('Error creating Stripe PaymentIntent:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create payment intent',
    });
  }
});

/**
 * GET /api/payment/config
 * Returns publishable key
 */
router.get('/config', (req, res) => {
  res.json({
    publishableKey: config.STRIPE_PUBLISHABLE_KEY,
    currency: config.STRIPE_CURRENCY || 'inr',
  });
});

module.exports = router;

