const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3001

// Middleware
// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://nunua-mtaani.vercel.app"
  ],
methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}));


app.use(express.json());

// Static route to serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect DB
connectDB();

// Routes
app.use('/api/payments', paymentsRouter);
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes")); // <-- Add this line
app.use('/api/users', require('./routes/userRoutes')); // ✅ Add this
app.use('/api/shops', require('./routes/shopRoutes')); // ✅ Add this
app.use('/api/orders', require('./routes/orderRoutes')); // ✅ Add this

// Server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
