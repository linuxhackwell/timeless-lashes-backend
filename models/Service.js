const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
  },
  price: {
    type: Number,
    required: [true, 'Service price is required'],
  },
  image: {
    type: String, // Path to the uploaded image
    required: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
