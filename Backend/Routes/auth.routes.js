const express = require("express");
const router = express.Router();
const {
  signup,
  signin,
  getusers,
} = require("../controllers/auth.controllers.js");
const { sendOTP, verifyOTP } = require("../services/otpService");

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/users", getusers);
router.post("/send-otp", async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    console.log("Received OTP request for:", phoneNumber);

    const response = await sendOTP(phoneNumber);

    console.log("OTP sent successfully:", response);

    res.json({
      message: "OTP sent successfully",
      sessionId: response.Details,
    });
  } catch (error) {
    console.error("Send OTP Route Error:", error);
    res.status(500).json({
      error: error.message || "Failed to send OTP",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { sessionId, otp } = req.body;

    if (!sessionId || !otp) {
      return res.status(400).json({ error: "Session ID and OTP are required" });
    }

    console.log("Received OTP verification request:", { sessionId, otp });

    const response = await verifyOTP(sessionId, otp);

    console.log("OTP verified successfully:", response);

    res.json({
      message: "OTP verified successfully",
      details: response,
    });
  } catch (error) {
    console.error("Verify OTP Route Error:", error);
    res.status(400).json({
      error: error.message || "Invalid OTP",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});
module.exports = router;
