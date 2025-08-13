import mongoose from 'mongoose';

let isConnected = false; // Track connection status

const connectDB = async () => {
  if (isConnected) {
    // If already connected, reuse the connection
    return;
  }

  try {
    const conn = await mongoose.connect(`${process.env.MONGODB_URI}/quickshow`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = conn.connections[0].readyState === 1;

    if (isConnected) {
      console.log('✅ MongoDB connected');
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
};

export default connectDB;
