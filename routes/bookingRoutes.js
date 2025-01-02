const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const ClassBooking = require("../models/ClassBooking");
const { body, validationResult } = require('express-validator');
const nodemailer = require("nodemailer");
const mongoose = require('mongoose');
const moment = require('moment-timezone');


// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail', // Change to your email service provider if needed
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app-specific password
  },
  debug: true,
  logger: true,
});


// Create a new booking
router.post(
  "/",
  [
    body('service').notEmpty().withMessage('Service is required'),
    body('employee').notEmpty().withMessage('Employee is required'),
    body('date').notEmpty().withMessage('Date is required'),
    body('timeSlot').notEmpty().withMessage('Time slot is required'),
    body('customerEmail').isEmail().withMessage('Invalid email format'),
    body('customerPhone').isMobilePhone().withMessage('Invalid phone number'),
    body('numberOfPeople').isInt({ min: 1 }).withMessage('Number of people must be a positive integer'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const {
      service,
      employee,
      date,
      timeSlot,
      customerName,
      customerEmail,
      customerPhone,
      numberOfPeople,
      message,
    } = req.body;

    try {
      // Adjust the date to the local timezone
      const normalizedDate = moment.tz(date, "YYYY-MM-DD", "Africa/Nairobi").format("YYYY-MM-DD");

      // Create a new booking
      const newBooking = new Booking({
        service,
        employee,
        date: normalizedDate,
        timeSlot,
        customerName,
        customerEmail,
        customerPhone,
        numberOfPeople,
        message,
      });

      const savedBooking = await newBooking.save();

      // Email Details
      const emailSubject = `Booking Confirmation for ${service.name}`;
      const emailBody = `
        <p>Dear ${customerName},</p>
        <p>Thank you for booking the <strong>${service.name}</strong> service with us.</p>
        <p>Here are your booking details:</p>
        <ul>
          <li><strong>Service:</strong> ${service.name}</li>
          <li><strong>Employee:</strong> ${employee}</li>
          <li><strong>Date:</strong> ${normalizedDate}</li>
          <li><strong>Time Slot:</strong> ${timeSlot}</li>
          <li><strong>Number of People:</strong> ${numberOfPeople}</li>
          <li><strong>Message:</strong> ${message || "No message provided"}</li>
        </ul>
        <p>If you have any questions, feel free to contact us!</p>
      `;

      // Send confirmation email
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: customerEmail,
        subject: emailSubject,
        html: emailBody,
      });

      res.status(201).json({
        message: "Booking created successfully. A confirmation email has been sent to the customer.",
        booking: savedBooking,
      });
    } catch (error) {
      console.error("Error during booking creation or email sending:", error);
      res.status(500).json({ message: "Failed to create booking or send confirmation email", error: error.message });
    }
  }
);



// Get all bookings
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find();
    if (!bookings.length) {
      return res.status(200).json([]); // Return an empty array instead of 404
    }
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/check-availability", async (req, res) => {
  const { date } = req.body;

  if (!date) {
    return res.status(400).json({ error: "Date is required." });
  }

  try {
    // Normalize the provided date to a simple string (YYYY-MM-DD)
    const normalizedDate = new Date(date).toISOString().split("T")[0];

    // Query database using regex to match normalized date (for stored ISO strings)
    const bookings = await Booking.find({
      date: { $regex: `^${normalizedDate}` },
    });

    // Extract booked slots
    const bookedSlots = bookings.map((booking) => booking.timeSlot);

    // Log output for debugging
    console.log("Date:", date, "Normalized Date:", normalizedDate, "Booked Slots:", bookedSlots);

    // Return booked slots as response
    res.status(200).json({ bookedSlots });
  } catch (error) {
    console.error("Error checking availability:", error);
    res.status(500).json({
      error: "Failed to check availability. Please try again later.",
    });
  }
});



// Booking Route with Email Integration
router.post('/class-bookings', async (req, res) => {
  const { course, customer, message } = req.body;

  // Validate input
  if (!course || !customer || !customer.firstName || !customer.lastName || !customer.email || !customer.phone) {
    return res.status(400).json({ message: 'Missing required booking details' });
  }

  try {
    // Save booking to the database
    const newBooking = new ClassBooking({
      course,
      customer,
      message,
    });
    const savedBooking = await newBooking.save();

    // Email Details
    const emailSubject = `Booking Confirmation for ${course.name}`;
    const emailBody = `
      <p>Dear ${customer.firstName} ${customer.lastName},</p>
      <p>Thank you for booking the <strong>${course.name}</strong> course.</p>
      <p>Here are your booking details:</p>
      <ul>
        <li><strong>Course:</strong> ${course.name}</li>
        <li><strong>Price:</strong> $${course.price}</li>
        <li><strong>Message:</strong> ${message || "No message provided"}</li>
      </ul>
      <p>If you have any questions, feel free to contact us!</p>
    `;

    // Send Confirmation Email
    await transporter.sendMail({
      from: process.env.EMAIL_USER, // Your email
      to: customer.email,          // Recipient's email
      subject: emailSubject,       // Email subject
      html: emailBody,             // Email body (HTML format)
    });

    // Respond with success
    res.status(201).json({
      message: 'Booking confirmed successfully. A confirmation email has been sent to the customer.',
      booking: savedBooking, // Return saved booking details
    });
  } catch (err) {
    console.error('Error creating booking or sending email:', err.message);
    res.status(500).json({ message: 'Failed to create booking or send confirmation email' });
  }
});


router.delete("/classBookings/:id", async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid booking ID." });
  }

  try {
    const booking = await Booking.findByIdAndDelete(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    res.status(200).json({ message: "Booking deleted successfully." });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});



// GET /api/bookings - Fetch all bookings
router.get("/classBookings", async (req, res) => {
  try {
    const bookings = await ClassBooking.find(); // Fetch all bookings
    res.status(200).json(bookings); // Send bookings as JSON
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});


// Get appointments by userId (email or phone number)
router.get("/:userId", async (req, res) => {
  const { userId } = req.params; // userId can be email or phone number

  try {
    const bookings = await Booking.find({
      $or: [{ customerEmail: userId }, { customerPhone: userId }],
    });

    if (!bookings.length) {
      return res.status(404).json({ message: "No bookings found for this user" });
    }
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update booking status
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["Pending", "Confirmed", "Cancelled"].includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  try {
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({ message: "Status updated successfully", booking });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});







module.exports = router;
