const express = require("express");
const { registerAdmin, registerUser, loginBoss, loginAdmin, updateProfile } = require("../controllers/auth.controller");
const { authenticateBoss, authenticateAdmin, authenticateToken } = require("../middleware/auth");

const router = express.Router();

// 🟢 Boss thêm Admin
router.post("/register-admin", authenticateBoss, registerAdmin);

// 🟢 Admin thêm User
router.post("/register-user", authenticateAdmin, registerUser);

// 🟢 Đăng nhập Boss
router.post("/login-boss", loginBoss);

// 🟢 Đăng nhập Admin
router.post("/login-admin", loginAdmin);

// 🟢 Cập nhật thông tin cá nhân
router.put("/update-profile", authenticateToken, updateProfile);

module.exports = router;
