const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // Đã đúng

const adminSchema = new mongoose.Schema({
  MSNV: { type: String, required: true, unique: true },
  HoTenNV: { type: String, required: true },
  password: { type: String, required: true },
  ChucVu: { type: String, enum: ["admin"], required: true },
  DiaChi: { type: String, required: true },
  SoDienThoai: { type: String, required: true, unique: true }
});

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("Admin", adminSchema);