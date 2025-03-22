const express = require("express");
const router = express.Router();
const {
  login,
  registerAdmin,
  registerUser,
  getUsersAndAdmins,
  getUsers,
  updateUserOrAdmin,
  updateUserByAdmin,
  getProfile,
  updateAdmin,
  updateUser,
  deleteUserOrAdmin, // Giữ lại ở đây
  deleteUser,
} = require("../controllers/auth.controller");
const { authenticateToken, isAdmin, isBoss } = require("../middleware/auth");

// API: Login
router.post("/auth/login", login);

// API: Register Admin (Boss only)
router.post("/auth/register-admin", authenticateToken, isBoss, registerAdmin);

// API: Register User (Admin or Boss)
router.post(
  "/auth/register-user",
  authenticateToken,
  (req, res, next) => {
    if (!req.user || (req.user.role !== "admin" && req.user.role !== "boss")) {
      return res.status(403).json({ error: "Yêu cầu quyền admin hoặc boss" });
    }
    next();
  },
  registerUser
);

// API: Get Users and Admins (Boss only)
router.get("/boss/users-admins", authenticateToken, isBoss, getUsersAndAdmins);

// API: Get Users (Admin or Boss)
router.get("/admin/users", authenticateToken, isAdmin, getUsers);

// API: Update User/Admin (Boss only)
router.put("/boss/update", authenticateToken, isBoss, updateUserOrAdmin);

// API: Update User (Admin only)
router.put("/admin/update", authenticateToken, isAdmin, updateUserByAdmin);

// API: Get Profile
router.get("/profile", authenticateToken, getProfile);

// API: Update Admin (Admin only)
router.put("/admin/update-admin", authenticateToken, updateAdmin);

// API: Update User (User only)
router.put("/user/update-user", authenticateToken, updateUser);

// API: Delete User/Admin (Boss only)
router.delete("/boss/users/:id", authenticateToken, isBoss, deleteUserOrAdmin);

// API: Delete User (Admin only)
router.delete("/admin/users/:id", authenticateToken, isAdmin, deleteUser);

module.exports = router;