const express = require("express");
const { addBook, getBooks } = require("../controllers/book.controller.js");

const router = express.Router();

router.post("/", addBook);
router.get("/", getBooks);

module.exports = router;
