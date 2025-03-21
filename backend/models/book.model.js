const mongoose = require("mongoose");
const bookSchema = new mongoose.Schema({
  tenSach: { type: String, required: true },
  donGia: { type: Number, required: true },
  soQuyen: { type: Number, required: true },
  nguonGocTacGia: { type: String },
  nhaXuatBan: { type: String },
  image: { type: String } // Bỏ default vì sẽ tự động gán sau
});

// Middleware để cập nhật image path trước khi lưu
bookSchema.pre("save", function (next) {
  if (!this.image) {
    this.image = `/Static/book/${this._id}/book_cover.png`;
  }
  next();
});

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;

