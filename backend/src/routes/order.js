import express from "express";
import Order from "../models/orderModel.js";
import { verifyUser } from "../middleware/authMiddleware.js";

const router = express.Router();

/* Create Order */
router.post("/", verifyUser, async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !items.length)
      return res.status(400).json({ error: "Cart is empty" });

    const total = items.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );

    const order = await Order.create({
      user: req.user.id,
      items,
      totalAmount: total
    });

    res.status(201).json({
      message: "Order created",
      order
    });

  } catch (err) {
    res.status(500).json({ error: "Order failed" });
  }
});

/* Get My Orders */
router.get("/my-orders", verifyUser, async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(orders);
});

export default router;