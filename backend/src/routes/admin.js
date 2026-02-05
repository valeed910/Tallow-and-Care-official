import express from "express";
import Message from "../models/message.js";

const router = express.Router();

// simple admin auth
router.use((req, res, next) => {
  const key = req.headers["x-admin-key"];

  if (!key || key !== "ok") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
});


// get all messages
router.get("/messages", async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = 10;
    const skip = (page - 1) * limit;

    const messages = await Message.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to load messages" });
  }
});

/**
 * DELETE message
 */
router.delete("/messages/:id", async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

export default router;