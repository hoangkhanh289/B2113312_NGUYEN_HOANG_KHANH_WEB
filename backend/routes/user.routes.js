const express = require("express");
const { register, login } = require("../controllers/user.controller");
const { authenticate, isAdmin } = require("../middlewares/authenticate");

const router = express.Router();

router.post("/register", authenticate, isAdmin, register); // Chỉ admin mới có quyền đăng ký user
router.post("/login", login);

module.exports = router;
