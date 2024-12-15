const axios = require("axios");

const sendOTP = async (phoneNumber) => {
  try {
    const API_KEY = process.env.TWO_FACTOR_API_KEY;
    console.log("Environment check:", {
      API_KEY_EXISTS: !!API_KEY,
      NODE_ENV: process.env.NODE_ENV,
    });

    if (!API_KEY) {
      throw new Error(
        "TWO_FACTOR_API_KEY is not configured in environment variables"
      );
    }

    const url = `https://2factor.in/API/V1/${API_KEY}/SMS/${phoneNumber}/AUTOGEN/midland`;

    const response = await axios.get(url);
    console.log("2Factor API Response:", response.data);

    if (
      !response.data ||
      !response.data.Status ||
      response.data.Status !== "Success"
    ) {
      throw new Error(response.data?.Details || "Failed to send OTP");
    }

    return response.data;
  } catch (error) {
    console.error("OTP Service Error:", {
      message: error.message,
      response: error.response?.data,
      stack: error.stack,
    });
    throw error;
  }
};

const verifyOTP = async (sessionId, otp) => {
  try {
    const API_KEY = process.env.TWO_FACTOR_API_KEY;
    console.log("Verifying OTP:", { sessionId, otp });

    if (!API_KEY) {
      throw new Error("TWO_FACTOR_API_KEY is not configured");
    }

    const response = await axios.get(
      `https://2factor.in/API/V1/${API_KEY}/SMS/VERIFY/${sessionId}/${otp}`
    );

    console.log("Verify OTP Response:", response.data);

    if (
      !response.data ||
      !response.data.Status ||
      response.data.Status !== "Success"
    ) {
      throw new Error("Invalid OTP");
    }

    return response.data;
  } catch (error) {
    console.error("OTP Verification Error:", error);
    if (error.response) {
      console.error("API Error Response:", error.response.data);
    }
    throw new Error("Invalid OTP");
  }
};

module.exports = { sendOTP, verifyOTP };
