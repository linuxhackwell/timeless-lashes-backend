const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  assignedServices: { type: [String], default: [] },
  profilePicture: { type: String },
});

module.exports = mongoose.model('Employee', employeeSchema);
