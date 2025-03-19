// helpers.js - Các hàm tiện ích dùng chung

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

/**
 * Mã hóa mật khẩu bằng bcrypt
 * @param {string} password - Mật khẩu cần mã hóa
 * @returns {Promise<string>} - Mật khẩu đã được mã hóa
 */
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

/**
 * So sánh mật khẩu nhập vào với mật khẩu đã mã hóa
 * @param {string} password - Mật khẩu nhập vào
 * @param {string} hashedPassword - Mật khẩu đã mã hóa trong DB
 * @returns {Promise<boolean>} - Kết quả so sánh
 */
const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

/**
 * Tạo token JWT cho user
 * @param {object} user - Đối tượng user chứa _id
 * @returns {string} - Chuỗi token JWT
 */
const generateToken = (user) => {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Xuất các hàm để sử dụng ở file khác
module.exports = {
    hashPassword,
    comparePassword,
    generateToken
};
