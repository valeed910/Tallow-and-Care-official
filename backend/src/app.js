import express from "express";
import cors from "cors";
import contactRoute from "./routes/contact.js";
import rateLimit from "express-rate-limit";
import adminRoutes from "./routes/admin.js";
const app = express();

app.set("trust proxy", 1);

// middleware
app.use(cors({
  origin: "*"
}));

app.use(express.json());
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  res.json({ token: "ok" });
});

app.use("/api/admin", adminRoutes);


const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ error: "Too many requests, slow down" });
  }
});


app.use("/api/contact", contactLimiter);

// routes
app.use("/api/contact", contactRoute);

// TEMP test data (ok for now)
const products = [
  { id: 1, name: "Tallow Dog Soap", price: 199 },
  { id: 2, name: "Tallow Animal Shampoo", price: 249 }
];

app.get("/", (req, res) => {
  res.send("API is running");
});
export default app;