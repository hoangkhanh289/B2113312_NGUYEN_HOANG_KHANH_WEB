const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  tenSach: { type: String, required: true },
  donGia: { type: Number, required: true },
  soQuyen: { type: Number, required: true },
  nguonGocTacGia: { type: String },
  nhaXuatBan: { type: mongoose.Schema.Types.ObjectId, ref: "Publisher" },
  thuMucAnh: { type: String, required: true }, // Lưu đường dẫn thư mục ảnh
});

module.exports = mongoose.model("Book", bookSchema);
