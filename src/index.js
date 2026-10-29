const express = require('express');
const mongoose = require('mongoose');
const config = require('./config');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
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

// Basic health check
app.get('/', (req, res) => {
  res.send('Sleepnest Auth API is running');
});

app.listen(config.PORT, () => {
  console.log(`Server listening on port ${config.PORT}`);
});
