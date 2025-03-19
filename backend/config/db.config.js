const mongoose = require("mongoose");
require("dotenv").config();  // ✅ Load biến môi trường từ `.env`

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
};

module.exports = connectDB;  // ✅ Dùng `module.exports` thay vì `export default`
