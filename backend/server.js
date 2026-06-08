const dotenv = require("dotenv");
dotenv.config(); // Phải chạy trước mọi import khác để env vars sẵn sàng

const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const { initMarketingJobs } = require("./jobs/marketing.cron");
const { errorHandler } = require("./middleware/errorMiddleware");
const { initSocket } = require("./socket");

const app = express();
const server = http.createServer(app);
initSocket(server);

// Connect Database
connectDB();

// Security headers
app.use(helmet());

// Middleware
app.use(cors({
  origin: [
    process.env.CLIENT_URL || "http://localhost:5173",
    "http://localhost:3000",
  ],
  credentials: true,
}));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Rate limiting on auth endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, message: "Quá nhiều yêu cầu, vui lòng thử lại sau 1 phút." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/products", require("./routes/product.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/ai", require("./routes/ai.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/wishlist", require("./routes/wishlist.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));
app.use("/api/admin/discounts", require("./routes/discount.routes"));
app.use("/api/discounts", require("./routes/discount.public.routes"));
app.use("/api/stats", require("./routes/stats.routes"));

// Health check
app.get("/api/health", (req, res) => res.json({ status: "OK", message: "Smart Ecommerce API is running" }));

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);

  // Kiem tra Groq API key luc khoi dong
  const groqKey = (process.env.GROQ_API_KEY || "").trim().replace(/^["']|["']$/g, "");
  if (groqKey.length >= 10) {
    console.log(`✅ Groq API Key: ...${groqKey.slice(-6)} (${groqKey.length} chars)`);
  } else {
    console.warn("⚠️  Groq API Key chua cau hinh (GROQ_API_KEY trong .env)");
  }

  // Init cron jobs after server starts
  initMarketingJobs();
});
