const express = require("express");
const {
  createOrder,
  verifyPayment,
} = require("../controllers/payment.controllers");

const router = express.Router();

router.post("/razorpay/order", createOrder);

router.post("/razorpay/verify", verifyPayment);

module.exports = router;
