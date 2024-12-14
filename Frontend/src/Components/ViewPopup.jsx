import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, Phone } from "lucide-react";
import { motion } from "framer-motion";

const ViewPopup = ({ onClose, propertyId }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasExistingView, setHasExistingView] = useState(false);

  useEffect(() => {
    checkExistingView();
  }, []);

  const checkExistingView = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (!userData) return;

      const response = await axios.get(
        `http://localhost:4000/api/properties/check-view/${propertyId}/${userData._id}`
      );

      if (response.data.hasViewed) {
        setHasExistingView(true);
        onClose();
      }
    } catch (error) {
      console.error("Error checking existing view:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate phone number
    if (!phoneNumber || phoneNumber.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      setLoading(false);
      return;
    }

    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (!userData) {
        setError("Please login to view property details");
        return;
      }

      await axios.post(
        `http://localhost:4000/api/properties/${propertyId}/views`,
        {
          userId: userData._id,
          phoneNumber: phoneNumber,
        }
      );

      onClose();
    } catch (error) {
      setError(error.response?.data?.error || "Failed to record view");
    } finally {
      setLoading(false);
    }
  };

  if (hasExistingView) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Phone className="text-red-500 w-8 h-8" />
          </div>
          <h2 className="text-xl font-semibold">
            Please Provide Your Contact Number
          </h2>
          <p className="text-gray-600 text-sm mt-2">
            Please provide your contact number to view complete property details
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              pattern="[0-9]{10}"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-400"
              placeholder="Enter your 10-digit number"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center px-4 py-2 rounded-lg text-white transition-colors ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                <span>Processing...</span>
              </div>
            ) : (
              "Continue to Property Details"
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default ViewPopup;
