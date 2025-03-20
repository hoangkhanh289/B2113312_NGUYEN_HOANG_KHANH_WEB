const express = require("express");
const router = express.Router();
const bookController = require("../controllers/book.controller");

router.post("/", bookController.upload.single('hinhAnh'), bookController.addBook);  // Thêm sách với upload ảnh
router.get("/", bookController.getBooks);        // Lấy danh sách sách
router.put("/:id", bookController.updateBook);   // Cập nhật sách
router.delete("/:id", bookController.deleteBook); // Xóa sách

module.exports = router;
