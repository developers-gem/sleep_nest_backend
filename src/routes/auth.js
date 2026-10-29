const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');
const router = express.Router();

// Registration endpoint
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, passwordHash, isVerified: true });
    await user.save();
    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});
//Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    // No email verification required
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ userId: user._id, email: user.email }, config.JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token, message: "Login successful" });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
