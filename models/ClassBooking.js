const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  course: {
    name: { type: String, required: true },
    price: { type: Number, required: true },
  },
  customer: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
  },
  message: { type: String }, // Optional message from the customer
  createdAt: { type: Date, default: Date.now }, // Automatically adds timestamp for when booking was created
});

module.exports = mongoose.model('ClassBooking', BookingSchema);
