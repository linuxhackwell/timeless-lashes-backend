// routes/courseRoutes.js
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const initiateStkPush = require("../services/safaricomStkPush");

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  service: "Gmail", // Use Gmail or another email provider
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // App password or email password
  },
});

router.post("/checkout", async (req, res) => {
  try {
    const { phoneNumber, amount, email } = req.body;

    if (!phoneNumber || !amount || !email) {
      return res.status(400).json({ error: "Phone number, amount, and email are required." });
    }

    // Initiate STK Push
    const response = await initiateStkPush({
      phoneNumber,
      amount,
      callbackUrl: `${process.env.BASE_URL}/api/payment/callback`,
      accountReference: "Course Booking",
      transactionDesc: "Deposit for Course Booking",
    });

    // Sending confirmation email
    const mailOptions = {
      from: "your-email@example.com", // Replace with your email
      to: email,
      subject: "Course Booking Confirmation",
      html: `
        <h1>Payment Confirmation</h1>
        <p>Dear Customer,</p>
        <p>We have received your deposit of <strong>KES ${amount}</strong> for the course booking.</p>
        <p>Thank you for choosing our services.</p>
        <p>Best Regards,<br>George Lashes</p>
      `,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error sending email:", err);
        return res.status(500).json({ error: "Payment processed, but email sending failed." });
      }
      console.log("Email sent:", info.response);
    });

    return res.status(200).json({ message: "STK Push initiated and email sent successfully", data: response });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Payment processing failed", details: error.message });
  }
});

module.exports = router;
