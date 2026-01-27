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
  key_id: "rzp_test_RREPD8PGJzogfo",
  key_secret: "OSlQjgs28tvax5HwrY3tIo1W",
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.post("/order", async (req, res) => {
  try {
    const amount = parseInt(req.body.amount);
    if (!amount || amount <= 0) {
      return res.status(400).json({ msg: "Invalid amount" });
    }

    const options = {
      amount: 500,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    console.log("Creating order with options:", options);

    const order = await razorpay.orders.create(options);

    console.log("Order response from Razorpay:", order);

    res.json(order);
  } catch (err) {
    console.error("Order creation error:", err.response ? err.response.data : err);
    res.status(500).json({ message: "Failed to create order", error: err });
  }
});


app.post("/order/validate", (req, res) => {
  console.log("hello2");
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const sha = crypto.createHmac("sha256", "SuLySkdtuGhm1bAuqdz2cf5w");
  sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);

  const digest = sha.digest("hex");

  if (digest !== razorpay_signature) {
    return res.status(400).json({ msg: "Transaction not legitimate!" });
  }

  res.json({
    msg: "Payment Successful",
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
  });
});