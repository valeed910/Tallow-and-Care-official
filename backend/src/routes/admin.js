import express from "express";
import Message from "../models/message.js";

const router = express.Router();

// simple admin auth
router.use((req, res, next) => {
  if (req.headers["x-admin-token"] !== "ok") {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});


// get all messages
router.get("/messages", async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = 10;
  const skip = (page - 1) * limit;

  const messages = await Message.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json(messages);
});

// delete message
router.delete("/messages/:id", async (req, res) => {
  await Message.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

export default router;
