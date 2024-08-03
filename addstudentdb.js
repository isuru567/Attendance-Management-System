const mongoose = require('mongoose');

const connectadd = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/studentDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for studentDB');
  } catch (err) {
    console.error('Error connecting to MongoDB for studentDB:', err);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectadd;






















