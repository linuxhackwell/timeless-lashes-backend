const { initiateMpesaStkPush } = require("../services/safaricomStkPush");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const checkout = async (req, res) => {
  try {
    const { phoneNumber, amount, appointments, email } = req.body;

    if (!phoneNumber || !amount || !appointments) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const response = await initiateMpesaStkPush(
      phoneNumber,
      amount,
      "Payment for Appointment"
    );

    await transporter.sendMail({
      from: `"George Lashes" <${process.env.EMAIL_USER}>`,
      to: email || "test@example.com",
      subject: "Payment Confirmation",
      html: `<p>Dear Customer,</p><p>Your payment of KES ${amount} was successful.</p>`,
    });

    return res.status(200).json({ message: "Payment initiated successfully", data: response });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Failed to process payment" });
  }
};

module.exports = { checkout };
