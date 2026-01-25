import fetch from "node-fetch";
import express from "express";
import { Resend } from "resend";

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

router.post("/", async (req, res) => {
  try {
    // 1️⃣ VERIFY CAPTCHA FIRST
    const { recaptchaToken, name, email, phone, interest, message } = req.body;

    if (!recaptchaToken) {
      return res.status(400).json({ error: "Captcha missing" });
    }

    const googleRes = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${process.env.RECAPTCHA_SECRET}&response=${recaptchaToken}`
      }
    );

    const data = await googleRes.json();

    if (!data.success || data.score < 0.5) {
      return res.status(403).json({ error: "Bot detected" });
    }

    // 2️⃣ NORMAL VALIDATION
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // 3️⃣ SEND EMAIL
    await resend.emails.send({
      from: "Tallow & Care <contact@tallowandcare.in>",
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
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
