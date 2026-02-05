import xss from "xss";
import express from "express";
import { Resend } from "resend";
import rateLimit from "express-rate-limit";
import Message from "../models/message.js";

async function verifyTurnstile(token, ip) {
  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: ip
      })
    }
  );

  const data = await res.json();
  return data.success === true;
}


const router = express.Router();
router.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10
}));

let resend = null;

if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

router.post("/", async (req, res) => {
  try {
    const { name, email, phone, interest, message, captchaToken } = req.body;

// CAPTCHA check (FIRST)
  if (!captchaToken) {
    return res.status(400).json({ error: "Captcha missing" });
  }

  const isHuman = await verifyTurnstile(
    captchaToken,
    req.ip
  );
  console.log("TURNSTILE RESULT:", isHuman);  
  if (!isHuman) {
    console.log("TOKEN RECEIVED:", captchaToken);
    return res.status(403).json({ error: "Captcha verification failed" });
  }


    // NORMAL VALIDATION
    const cleanName = xss(name);
    const cleanEmail = xss(email);
    const cleanPhone = xss(phone);
    const cleanInterest = xss(interest);
    const cleanMessage = xss(message);

    await Message.create({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      interest: cleanInterest,
      message: cleanMessage
    });


    // SEND EMAIL
    if (resend) {
      await resend.emails.send({
        from: "Tallow & Care <contact@tallowandcare.in>",
        to: ["tallowandcare@gmail.com"],
        subject: `New Contact: ${interest || "General"}`,
        html: `
          <p>Name: ${cleanName}</p>
          <p>Email: ${cleanEmail}</p>
          <p>Phone: ${cleanPhone}</p>
          <p>Interest: ${cleanInterest}</p>
          <p>Message: ${cleanMessage}</p>
        `
      });
    }

    res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

export default router;