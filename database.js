const mongoose = require('mongoose');
require('dotenv').config()

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { // Connect to MongoDB
      useNewUrlParser: true, 
      useUnifiedTopology: true, 
      useFindAndModify: false, 
      useCreateIndex: true, 
    });
    console.log('MongoDB connected...');
  } catch (err) {
    console.error(err.message); // Log any errors
    process.exit(1); 
  }
};

module.exports = connectDB; 
