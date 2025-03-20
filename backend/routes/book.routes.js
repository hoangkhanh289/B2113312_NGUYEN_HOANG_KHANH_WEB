const express = require("express");
const { addBook, getBooks, updateBook } = require("../controllers/book.controller.js");

const router = express.Router();

router.post("/", addBook);
router.get("/", getBooks);
router.put("/:id", updateBook); // API cập nhật sách

module.exports = router;
