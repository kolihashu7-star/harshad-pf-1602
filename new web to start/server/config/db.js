import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Get MongoDB URI from environment or use default
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://Koliharshad:Harshad%401602@chamunda-digital.auwsqre.mongodb.net:27017/?appName=chamunda-digital&retryWrites=true&w=majority';
    
    await mongoose.connect(MONGO_URI);
    
    console.log('MongoDB Connected Successfully!');
    
    // Handle connection events
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB Disconnected');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB Error:', err);
    });
    
    return true;
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    return false;
  }
};

export default connectDB;

