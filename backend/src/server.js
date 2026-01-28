import app from "./app.js";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const PORT = process.env.PORT || 10000;


mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("DB connected");
    app.listen(PORT, "0.0.0.0", () => {
      console.log("Server started on port", PORT);
    });
  })
  .catch(err => {
    console.error("DB connection failed", err);
    process.exit(1);
  });