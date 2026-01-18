import express from "express";
import cors from "cors";
import contactRoute from "./routes/contact.js";

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/api/contact", contactRoute);

// TEMP test data (ok for now)
const products = [
  { id: 1, name: "Tallow Dog Soap", price: 199 },
  { id: 2, name: "Tallow Animal Shampoo", price: 249 }
];

app.get("/api/products", (req, res) => {
  res.json(products);
});

export default app;
