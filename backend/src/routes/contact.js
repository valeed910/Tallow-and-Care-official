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

const assessmentRes = await fetch(
  `https://recaptchaenterprise.googleapis.com/v1/projects/${process.env.GCP_PROJECT_ID}/assessments?key=${process.env.AIzaSyDumZy7jiep4PPYjeuNJBDk-sSDESzCYEE}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      assessment: {
        event: {
          token: recaptchaToken,
          siteKey: process.env.RECAPTCHA_SITE_KEY,
          expectedAction: "contact"
        }
      }
    })
  }
);

const assessment = await assessmentRes.json();

console.log("score:", assessment.riskAnalysis?.score);

if (!assessment.tokenProperties?.valid) {
  return res.status(403).json({ error: "Invalid captcha token" });
}

if ((assessment.riskAnalysis?.score ?? 0) < 0.1) {
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
