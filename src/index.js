const express = require('express');
const mongoose = require('mongoose');
const config = require('./config');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const itemRoutes = require('./routes/items');
const paymentRoutes = require('./routes/payment');
const razorpayRoutes = require('./routes/razorpay');

const app = express();

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    return res.status(200).json({});
  }
  next();
});

app.use(express.json());

// Connect to MongoDB
mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/products', itemRoutes);
app.use('/api/product', itemRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/payment/razorpay', razorpayRoutes);

// Basic health check
app.get('/', (req, res) => {
  res.send('Sleepnest Auth, Dashboard & Items API is running');
});

app.listen(config.PORT, () => {
  console.log(`Server listening on port ${config.PORT}`);
});
