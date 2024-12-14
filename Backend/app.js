const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, ".env") });

const express = require("express");
const app = express();
const cors = require("cors");

// Middleware
app.use(cors());
app.use(express.json());

// Debug environment variables
console.log("Environment Variables Loaded:", {
  TWO_FACTOR_API_KEY: process.env.TWO_FACTOR_API_KEY ? "Set" : "Not Set",
  NODE_ENV: process.env.NODE_ENV,
});

// Routes
const authRoute = require("./Routes/auth.routes.js");
const propertyRoute = require("./Routes/property.routes.js");
const contactRoute = require("./Routes/contact.routes.js");
const feedbackRoute = require("./Routes/feedback.routes.js");

app.use("/api/auth", authRoute);
app.use("/api/properties", propertyRoute);
app.use("/api/contacts", contactRoute);
app.use("/api/feedback", feedbackRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: err.message || "Something went wrong!",
    details: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

module.exports = app;
