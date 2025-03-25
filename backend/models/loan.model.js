const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  ngayMuon: { type: Date, required: true },
  ngayTra: { type: Date, required: true },
  soLuong: { type: Number, required: true },
  lanMuon: { type: Number, required: true },
  trangThai: { type: String, enum: ["cho_duyet", "da_muon", "da_tra"], default: "cho_duyet" },
  approvedBy: { type: String, default: null }, // Thêm trường mới để lưu MSNV của admin duyệt
});

module.exports = mongoose.model("Loan", loanSchema);