const express = require("express");
const router = express.Router();
const bookController = require("../controllers/book.controller");
const { authenticateToken, isAdmin } = require("../middleware/auth");

router.post("/", authenticateToken, isAdmin, bookController.addBook);
router.post(
  "/:id/upload",
  authenticateToken,
  isAdmin,
  bookController.upload.single("hinhAnh"),
  bookController.uploadBookImage
);
router.get("/", bookController.getBooks);
router.put("/:id", authenticateToken, isAdmin, bookController.updateBook);
router.delete("/:id", authenticateToken, isAdmin, bookController.deleteBook);

module.exports = router;