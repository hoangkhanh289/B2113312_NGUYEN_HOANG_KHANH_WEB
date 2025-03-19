const express = require("express");
const { borrowBook, returnBook } = require("../controllers/loan.controller");

const router = express.Router();

router.post("/borrow", borrowBook);
router.post("/return", returnBook);

module.exports = router;
