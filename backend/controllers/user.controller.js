const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Đăng ký tài khoản (chỉ admin mới có quyền đăng ký user khác)
const register = async (req, res) => {
  try {
    const { hoLot, ten, ngaySinh, phai, diaChi, dienThoai, username, password, role } = req.body;

    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Chỉ admin có quyền tạo tài khoản" });
    }

    if (!hoLot || !ten || !ngaySinh || !phai || !diaChi || !dienThoai || !username || !password) {
      return res.status(400).json({ error: "Vui lòng điền đầy đủ thông tin" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ hoLot, ten, ngaySinh, phai, diaChi, dienThoai, username, password: hashedPassword, role: role || "user" });

    await user.save();
    res.status(201).json({ message: "Tạo tài khoản thành công" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Đăng nhập
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Sai tài khoản hoặc mật khẩu" });
    }

    console.log("User found:", user);  // ✅ In ra thông tin user

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);  // ✅ Kiểm tra so sánh mật khẩu

    if (!isMatch) {
      return res.status(400).json({ message: "Sai tài khoản hoặc mật khẩu" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, "secret_key", {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Export các function
module.exports = { register, login };
