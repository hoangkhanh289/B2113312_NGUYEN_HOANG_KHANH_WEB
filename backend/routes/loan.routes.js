const express = require("express");
const {
  borrowBook,
  getUserLoans,
  deleteLoan,
  getAllLoans,
  approveLoan,
  returnBook,
} = require("../controllers/loan.controller");
const { authenticateToken, isAdmin } = require("../middleware/auth");

const router = express.Router();

// User routes
router.post("/borrow", authenticateToken, borrowBook); // Chỉ cần xác thực token
router.get("/my-loans", authenticateToken, getUserLoans); // Chỉ cần xác thực token
router.delete("/delete/:loanId", authenticateToken, deleteLoan); // Chỉ cần xác thực token

// Admin routes
router.get("/all-loans", authenticateToken, isAdmin, getAllLoans); // Yêu cầu admin
router.post("/approve", authenticateToken, isAdmin, approveLoan); // Yêu cầu admin
router.post("/return", authenticateToken, isAdmin, returnBook); // Yêu cầu admin

module.exports = router;