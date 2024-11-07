const Razorpay = require("razorpay");
const crypto = require("crypto");

let razorpayInstance;
try {
  razorpayInstance = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET,
  });
} catch (error) {
  console.error("Error initializing Razorpay:", error);
  throw new Error("Failed to initialize payment gateway");
}

const createOrder = async (req, res) => {
  try {
    const { amount, userId } = req.body;

    if (!amount || !userId) {
      return res.status(400).json({ error: "Amount and userId are required" });
    }

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_order_${userId}`,
    };
    const order = await razorpayInstance.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ error: "Failed to create payment order" });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { order_id, payment_id, signature, userId, amount } = req.body;

    if (!order_id || !payment_id || !signature || !userId || !amount) {
      return res
        .status(400)
        .json({ error: "Missing required payment details" });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(order_id + "|" + payment_id)
      .digest("hex");

    if (generatedSignature === signature) {
      try {
        const payment = new Payment({
          orderId: order_id,
          paymentId: payment_id,
          signature: signature,
          userId: userId,
          amount: amount,
          currency: "INR",
          status: "Success",
        });
        await payment.save();

        res.json({ status: "Payment Verified and Saved" });
      } catch (error) {
        console.error("Error saving payment details:", error);
        res
          .status(500)
          .json({ error: "Payment verified, but failed to save details" });
      }
    } else {
      res.status(400).json({ error: "Payment signature verification failed" });
    }
  } catch (error) {
    console.error("Error processing payment verification:", error);
    res.status(500).json({ error: "Failed to process payment verification" });
  }
};

module.exports = { createOrder, verifyPayment };
