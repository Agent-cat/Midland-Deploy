import axios from "axios";

const API_KEY = "52e92e0c-ba40-11ef-8b17-0200cd936042";

export const sendOTP = async (phoneNumber) => {
  try {
    const response = await axios.post(
      "http://localhost:4000/api/auth/send-otp",
      { phoneNumber }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to send OTP");
  }
};

export const verifyOTP = async (sessionId, otp) => {
  try {
    const response = await axios.post(
      "http://localhost:4000/api/auth/verify-otp",
      { sessionId, otp }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Invalid OTP");
  }
};
