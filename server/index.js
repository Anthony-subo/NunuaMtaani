const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");
require("dotenv").config();

// DEBUG
console.log("=================================");
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log(
  "EMAIL_PASS:",
  process.env.EMAIL_PASS ? "Loaded" : "Missing"
);
console.log("CLIENT_URL:", process.env.CLIENT_URL);
console.log("=================================");

const app = express();

app.set("trust proxy", 1);

const port = process.env.PORT || 3001;

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://nunua-mtaani.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}));

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

connectDB();

app.use("/api/payments", require("./routes/payments"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/shops", require("./routes/shopRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/riders", require("./routes/riderRoutes"));
app.use("/api/trips", require("./routes/tripRoutes"));
app.use("/api/settings", require("./routes/settingsRoutes"));

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});