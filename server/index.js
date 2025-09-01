const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://nunua-mtaani.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Increase body size limit for JSON and URL-encoded data
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Static route to serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect DB
connectDB();

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes")); // ✅ Products
app.use("/api/users", require("./routes/userRoutes"));       // ✅ Users
app.use("/api/shops", require("./routes/shopRoutes"));       // ✅ Shops
app.use("/api/orders", require("./routes/orderRoutes"));     // ✅ Orders

// Server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
