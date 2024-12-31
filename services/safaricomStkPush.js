const axios = require("axios");
const logger = require("../utils/logger");

const generateToken = async () => {
  const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString("base64");

  try {
    const response = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      { headers: { Authorization: `Basic ${auth}` } }
    );
    logger.info("OAuth Token Generated Successfully");
    return response.data.access_token;
  } catch (error) {
    logger.error("Error Generating OAuth Token:", error.response?.data || error.message);
    throw new Error("Failed to generate access token");
  }
};

const initiateMpesaStkPush = async (phoneNumber, amount, description) => {
  const token = await generateToken();
  const shortcode = process.env.MPESA_LIPA_NA_MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  const timestamp = new Date().toISOString().replace(/[-:.T]/g, "").slice(0, 14);
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");

  const stkPushRequest = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: phoneNumber,
    PartyB: shortcode,
    PhoneNumber: phoneNumber,
    CallBackURL: process.env.MPESA_CALLBACK_URL,
    AccountReference: "George Lashes",
    TransactionDesc: description,
  };

  try {
    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      stkPushRequest,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    logger.info("STK Push Request Sent Successfully:", response.data);
    return response.data;
  } catch (error) {
    logger.error("Error Initiating STK Push:", error.response?.data || error.message);
    throw new Error("Failed to initiate payment request");
  }
};

module.exports = { initiateMpesaStkPush };
