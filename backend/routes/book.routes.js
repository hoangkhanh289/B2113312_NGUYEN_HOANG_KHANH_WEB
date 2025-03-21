const express = require("express");
const router = express.Router();
const bookController = require("../controllers/book.controller");
const { authenticateToken, isAdmin } = require("../middleware/auth");

// 🔹 Create Book (Admin or Boss only)
router.post("/", authenticateToken, isAdmin, bookController.addBook);

// 🔹 Upload Book Image (Admin or Boss only)
router.post(
  "/:id/upload",
  authenticateToken,
  isAdmin,
  bookController.upload.single("hinhAnh"),
  bookController.uploadBookImage
);

// 🔹 Get All Books (Public or Authenticated)
router.get("/", bookController.getBooks);

// 🔹 Update Book (Admin or Boss only)
router.put("/:id", authenticateToken, isAdmin, bookController.updateBook);

// 🔹 Delete Book (Admin or Boss only)
router.delete("/:id", authenticateToken, isAdmin, bookController.deleteBook);

module.exports = router;