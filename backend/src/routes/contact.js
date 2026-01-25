
import express from "express";
import { Resend } from "resend";


const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);


router.post("/", async (req, res) => {
  try {
    const { name, email, phone, interest, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Missing fields" });
    }

    await resend.emails.send({
      from: "Tallow & Care <contact@resend.dev>",
      to: ["tallowandcare@gmail.com"],
      subject: `New Contact: ${interest || "General"}`,
      html: `
        <p>Name: ${name}</p>
        <p>Email: ${email}</p>
        <p>Phone: ${phone}</p>
        <p>Interest: ${interest}</p>
        <p>Message: ${message}</p>
      `
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to send email" });
  }
});

export default router;
