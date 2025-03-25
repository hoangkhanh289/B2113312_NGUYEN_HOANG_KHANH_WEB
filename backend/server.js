const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const bookRoutes = require("./routes/book.routes");
const authRoutes = require("./routes/auth.routes");
const loanRoutes = require("./routes/loan.routes");

const app = express();
const port = process.env.PORT || 3000;
dotenv.config();
// Middleware
app.use(express.json());
app.use(cors());
app.use("/Static", express.static(path.join(__dirname, "Static")));
// Routes
app.use("/api/books", bookRoutes);
app.use("/api", authRoutes);
app.use("/api/loans", loanRoutes);
// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((error) => console.error("❌ MongoDB connection error:", error));
// Start server
// app.listen(port, () => {
//   console.log(`✅ Server is running on http://localhost:${port}`);
// });
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});