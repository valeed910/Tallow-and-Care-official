import express from "express";
import { Resend } from "resend";
import axios from "axios";

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

// captcha verify helper
async function verifyCaptcha(token, ip) {
  const res = await axios.post(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET,
      response: token,
      remoteip: ip
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  return res.data.success;
}

router.post("/", async (req, res) => {
  try {
    const { token, name, email, phone, interest, message } = req.body;

    console.log("TOKEN:", token);
    console.log("SECRET:", process.env.TURNSTILE_SECRET ? "OK" : "MISSING");
    console.log("ENV SECRET:", process.env.TURNSTILE_SECRET);


    // // 1. captcha check (FIRST)
    // if (!token) {
    //   return res.status(400).json({ error: "Captcha missing" });
    // }

    // const ok = await verifyCaptcha(token, req.ip);
    // if (!ok) {
    //   return res.status(403).json({ error: "Captcha failed" });
    // }

    // 2. validation
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // 3. send email
    await resend.emails.send({
      from: "Tallow & Care <contact@tallowandcare.in>",
      to: ["tallowandcare@gmail.com"],
      subject: `New Contact: ${interest || "General"}`,
      html: `
        <h3>New Contact Form</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone || "-"}</p>
        <p><b>Interest:</b> ${interest || "-"}</p>
        <p><b>Message:</b> ${message}</p>
      `
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
});

export default router;
