const mongoose = require("mongoose");

const ClassBookingSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bookedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ClassBooking", ClassBookingSchema);
