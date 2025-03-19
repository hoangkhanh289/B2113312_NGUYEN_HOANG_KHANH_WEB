const express = require("express");
const cors = require("cors");

const userRoutes = require("../routes/user.routes.js");
const bookRoutes = require("../routes/book.routes.js");
const loanRoutes = require("../routes/loan.routes.js");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/loans", loanRoutes);

module.exports = app;  // ✅ Đổi từ `export default` sang `module.exports`
