import express from "express";
import cors from "cors";
import contactRoute from "./routes/contact.js";
import rateLimit from "express-rate-limit";
const app = express();

app.set("trust proxy", 1);

// middleware
app.use(cors());
app.use(express.json());

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20
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
