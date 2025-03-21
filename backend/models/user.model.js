const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // Đã đúng

const userSchema = new mongoose.Schema({
  MaDocGia: { type: String, required: true, unique: true },
  HoLot: { type: String, required: true },
  Ten: { type: String, required: true },
  NgaySinh: { type: Date, required: true },
  Phai: { type: String, enum: ["Nam", "Nữ"], required: true },
  DiaChi: { type: String, required: true },
  DienThoai: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("User", userSchema);