import express from "express";
import Feedback from "../models/feedbackModels.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

router.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20
}));

router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields required" });
    }

    await Feedback.create({ name, email, message });

    res.json({ success: true });

  } catch (err) {
    console.error("Feedback error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
