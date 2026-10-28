require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/sleepnest',
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
  EMAIL_FROM: process.env.EMAIL_FROM || 'no-reply@sleepnest.com',
  // For Ethereal test account, credentials will be generated in email utils if not provided.
};
