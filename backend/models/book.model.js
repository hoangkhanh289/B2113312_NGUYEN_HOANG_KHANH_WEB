const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  tenSach: { type: String, required: true },
  donGia: { type: Number, required: true },
  soQuyen: { type: Number, required: true },
  nguonGocTacGia: { type: String },
  nhaXuatBan: { type: String },
  thuMucAnh: { type: String, default: "" },  // Đặt giá trị mặc định cho thuMucAnh
});

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;
