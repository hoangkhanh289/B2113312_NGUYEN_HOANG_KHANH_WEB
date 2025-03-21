const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("../config/db.config.js");  // ✅ Import kết nối DB

const userRoutes = require("../routes/auth.routes.js");
const bookRoutes = require("../routes/book.routes.js");
const loanRoutes = require("../routes/loan.routes.js");

dotenv.config(); // ✅ Đọc biến môi trường
connectDB(); // ✅ Kết nối DB khi server khởi động

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Phục vụ file tĩnh (nếu cần)
app.use("/static", express.static(path.join(__dirname, "../Static")));

// 🔹 Định tuyến API
app.use("/api/auth", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/loans", loanRoutes);

// 🔹 Middleware xử lý lỗi tập trung
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(err.status || 500).json({ error: err.message });
});

module.exports = app;
