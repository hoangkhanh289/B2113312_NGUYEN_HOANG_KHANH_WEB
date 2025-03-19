const express = require("express");
const cors = require("cors");
const contactsRouter = require("./app/routes/contact.routes");
const ApiError = require("./app/api-error");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/contacts", contactsRouter);

// Middleware xử lý lỗi 404
app.use((req, res, next) => {
    return next(new ApiError(404, "Resource not found"));
});

// Middleware xử lý lỗi chung
app.use((err, req, res, next) => {
    return res.status(err.status || 500).json({
        message: err.message || "Internal Server Error",
    });
});

// Route mặc định
app.get("/", (req, res) => {
    res.json({ message: "Welcome to contact book application." });
});

module.exports = app;