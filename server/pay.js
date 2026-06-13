import express from "express";
import cors from "cors";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const app = express();
const port = 5001;

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_RREPD8PGJzogfo",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "OSlQjgs28tvax5HwrY3tIo1W",
});

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn("⚠️  WARNING: Using default Razorpay keys. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env");
}

app.listen(port, () => {
  console.log(`💳 Razorpay Payment Server is running on http://localhost:${port}`);
});

app.post("/order", async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ msg: "Invalid amount" });
    }

    const options = {
      amount: parseInt(amount) * 100, // Convert to paisa (Razorpay uses smallest currency unit)
      currency,
      receipt: receipt || "receipt_" + Date.now(),
    };

    console.log("Creating order with options:", options);

    const order = await razorpay.orders.create(options);

    console.log("Order created successfully:", order.id);

    res.json(order);
  } catch (err) {
    console.error("Order creation error:", err.response ? err.response.data : err.message);
    res.status(500).json({ message: "Failed to create order", error: err.message });
  }
});


app.post("/order/validate", (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ msg: "Missing required payment fields" });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || "OSlQjgs28tvax5HwrY3tIo1W";
    const sha = crypto.createHmac("sha256", secret);
    sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);

    const digest = sha.digest("hex");

    if (digest !== razorpay_signature) {
      console.error("Payment signature mismatch");
      return res.status(400).json({ 
        msg: "Transaction not legitimate!",
        valid: false 
      });
    }

    console.log("Payment validated successfully:", razorpay_payment_id);

    res.json({
      msg: "Payment Successful",
      valid: true,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error("Validation error:", error);
    res.status(500).json({ 
      msg: "Error validating payment",
      error: error.message 
    });
  }
});