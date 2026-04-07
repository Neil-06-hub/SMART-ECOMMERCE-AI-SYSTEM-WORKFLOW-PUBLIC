const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { initMarketingJobs } = require("./jobs/marketing.cron");
const { errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors({
  origin: [
    process.env.CLIENT_URL || "http://localhost:5173",
    "http://localhost:3000",
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/products", require("./routes/product.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/ai", require("./routes/ai.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/wishlist", require("./routes/wishlist.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));
app.use("/api/admin/discounts", require("./routes/discount.routes"));

// Health check
app.get("/api/health", (req, res) => res.json({ status: "OK", message: "Smart Ecommerce API is running" }));

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  // Init cron jobs after server starts
  initMarketingJobs();
});
