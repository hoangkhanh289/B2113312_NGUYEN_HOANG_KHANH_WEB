const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  hoTenNV: { type: String, required: true },
  password: { type: String, required: true },
  chucVu: { type: String, enum: ["admin", "nhanvien"], required: true },
  diaChi: { type: String, required: true },
  soDienThoai: { type: String, required: true, unique: true },
});

module.exports = mongoose.model("Employee", employeeSchema);
