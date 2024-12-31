const express = require("express");
const Course = require("../models/courseModel");
const router = express.Router();
const nodemailer = require("nodemailer");
const transporter = require("../server.js"); // Adjust the path accordingly


// Get all courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch courses." });
  }
});

// Add a course
router.post("/", async (req, res) => {
  try {
    const newCourse = new Course(req.body);
    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (error) {
    res.status(400).json({ error: "Failed to add course." });
  }
});


router.post("/class-bookings", async (req, res) => {
  const { course, customer, message } = req.body;

  // Validate booking details
  if (
    !course || !course.name || !course.price || 
    !customer || !customer.firstName || !customer.email
  ) {
    console.error("Validation Error: Missing booking details");
    return res.status(400).json({ message: "Missing required booking details" });
  }

  try {
    console.log("Booking details received:", { course, customer, message });

    const emailSubject = `Booking Confirmation for ${course.name}`;
    const emailBody = `
      <p>Dear ${customer.firstName},</p>
      <p>Thank you for booking <strong>${course.name}</strong>.</p>
      <p>Course Price: <strong>$${course.price}</strong></p>
      <p>We will contact you shortly with additional details.</p>
    `;

    // Send email using the shared transporter
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: customer.email,
      subject: emailSubject,
      html: emailBody,
    });

    console.log("Email sent successfully:", info.response);

    // Respond with success
    res.status(201).json({ message: "Booking confirmed successfully. Email sent." });
  } catch (error) {
    console.error("Error during booking:", error.message);
    res.status(500).json({ message: "Booking failed. Unable to send email." });
  }
});

module.exports = router;


// Update a course
router.put("/:id", async (req, res) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updatedCourse);
  } catch (error) {
    res.status(400).json({ error: "Failed to update course." });
  }
});

// Delete a course
router.delete("/:id", async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: "Course deleted successfully." });
  } catch (error) {
    res.status(400).json({ error: "Failed to delete course." });
  }
});

module.exports = router;
