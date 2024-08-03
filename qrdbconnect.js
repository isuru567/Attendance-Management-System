// Import connectDB function
const mongoose = require('mongoose');

const connectDBqr = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected for genarate');
  } catch (err) {
    console.error('Error connecting to MongoDB for genarate:', err);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDBqr;




















