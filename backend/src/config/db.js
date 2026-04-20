const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rehab-ai';

    // Mongoose 7+ removed useNewUrlParser and useUnifiedTopology options
    // Using 127.0.0.1 instead of localhost avoids IPv6 resolution issues
    const conn = await mongoose.connect(mongoURI);

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);

    // Provide helpful hints based on error type
    if (error.message.includes('ECONNREFUSED')) {
      console.error('   → Make sure MongoDB is running locally on port 27017');
      console.error('   → Or set a valid MONGODB_URI in your .env file (e.g., mongodb+srv://...)');
    } else if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
      console.error('   → Check your MongoDB username and password in MONGODB_URI');
    } else if (error.message.includes('Invalid scheme')) {
      console.error('   → MONGODB_URI must start with mongodb:// or mongodb+srv://');
    }

    process.exit(1);
  }
};

module.exports = connectDB;
