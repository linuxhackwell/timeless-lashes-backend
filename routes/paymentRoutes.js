const express = require("express");
const router = express.Router();
const { checkout } = require("../controllers/paymentController");

// Route for STK Push
router.post("/checkout", checkout);

module.exports = router;
