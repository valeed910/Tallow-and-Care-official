import express from "express"
import cors from "cors"

const app = express()
app.use(cors())
app.use(express.json())

// TEMP test data
const products = [
  { id: 1, name: "Tallow Dog Soap", price: 199 },
  { id: 2, name: "Tallow Animal Shampoo", price: 249 }
]

app.get("/api/products", (req, res) => {
  res.json(products)
})

export default app
