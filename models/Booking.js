const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  service: {
    name: { type: String, required: true },
    price: { type: String, required: true },
    description: { type: String },
  },
  employee: {
    name: { type: String, required: true },
    fee: { type: Number, required: false },
  },
  status: {
    type: String,
    enum: ["Pending", "Confirmed", "Cancelled"],
    default: "Pending",
  },
  date: { type: String, required: true },
  timeSlot: { type: String, required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },
  numberOfPeople: { type: Number, required: true },
  message: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Booking", bookingSchema);
