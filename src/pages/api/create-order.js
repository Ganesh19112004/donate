import Razorpay from "razorpay";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
  });

  const { amount } = req.body;

  try {
    const order = await razorpay.orders.create({
      amount: amount * 100, // convert to paise
      currency: "INR",
    });

    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
