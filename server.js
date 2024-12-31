require("dotenv").config();
require("./cron/deleteExpiredBookings");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');
const Service = require('./models/Service'); // Corrected import (singular)
const nodemailer = require("nodemailer");

const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const serviceRoutes = require('./routes/serviceRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const paymentRoutes = require("./routes/paymentRoutes");
const classRoutes = require("./routes/classRoutes");
const courseRoutes = require("./routes/courseRoutes");
const logger = require("./utils/logger");


const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL;

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  debug: true,
  logger: true,
});



app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', FRONTEND_URL);
  next();
});


// Middleware
app.use(
  cors({
    origin: [FRONTEND_URL, "https://0d90-41-90-68-194.ngrok-free.app"], // Specify allowed origins
    credentials: true, // Allow cookies to be sent
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
//app.use("/adminUploads", express.static(path.join(__dirname, "adminUploads")));


// Test email function
const testEmail = async () => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL, // Send the test email to yourself
      subject: "Test Email",
      text: "This is a test email from Nodemailer!",
    });
    console.log("Test email sent successfully");
  } catch (error) {
    console.error("Test email failed:", error);
  }
};

//testEmail(); // Call this to test email functionality




// Fixing the function
const updateServiceImagePaths = async () => {
  const services = await Service.find(); // Corrected `Service` usage
  for (const service of services) {
    if (service.image.includes('\\')) {
      service.image = service.image.replace(/\\/g, '/');
      await service.save();
    }
  }
  console.log('Image paths updated successfully');
};

// Call the function
updateServiceImagePaths();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/payment", paymentRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/employees', employeeRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/courses", courseRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  logger.error(err.message);
  res.status(500).json({ message: "Internal Server Error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("Environment Variables:", {
    MPESA_CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY,
    MPESA_PASSKEY: process.env.MPESA_PASSKEY,
  });
  console.log('Email:', process.env.EMAIL_USER);
console.log('Recepient:', process.env.EMAIL);
console.log('Password:', process.env.EMAIL_PASS);
});
