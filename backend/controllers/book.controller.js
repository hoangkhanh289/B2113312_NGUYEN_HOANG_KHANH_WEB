const Book = require("../models/book.model.js");

const addBook = async (req, res) => {
  try {
    const { tenSach, donGia, soQuyen, nguonGocTacGia, nhaXuatBan, thuMucAnh } = req.body;

    // Kiểm tra xem sách đã tồn tại chưa (không phân biệt hoa thường)
    const existingBook = await Book.findOne({ tenSach: { $regex: `^${tenSach}$`, $options: "i" } });

    if (existingBook) {
      return res.status(400).json({ error: "Sách đã tồn tại!" });
    }

    // Nếu chưa có thì thêm mới
    const book = new Book({ tenSach, donGia, soQuyen, nguonGocTacGia, nhaXuatBan, thuMucAnh });
    await book.save();
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ error: "Failed to add book" });
  }
};

const getBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch books" });
  }
};
const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenSach, donGia, soQuyen, nguonGocTacGia, nhaXuatBan, thuMucAnh } = req.body;

    // Kiểm tra xem sách có tồn tại không
    const existingBook = await Book.findById(id);
    if (!existingBook) {
      return res.status(404).json({ error: "Sách không tồn tại!" });
    }

    // Kiểm tra xem tên sách mới có bị trùng với sách khác không (không phân biệt chữ hoa/thường)
    const duplicateBook = await Book.findOne({
      tenSach: { $regex: `^${tenSach}$`, $options: "i" },
      _id: { $ne: id }, // Loại trừ sách đang chỉnh sửa
    });

    if (duplicateBook) {
      return res.status(400).json({ error: "Tên sách đã tồn tại!" });
    }

    // Cập nhật sách
    const updatedBook = await Book.findByIdAndUpdate(
      id,
      { tenSach, donGia, soQuyen, nguonGocTacGia, nhaXuatBan, thuMucAnh },
      { new: true } // Trả về dữ liệu sau khi cập nhật
    );

    res.json(updatedBook);
  } catch (error) {
    res.status(500).json({ error: "Failed to update book" });
  }
};

module.exports = { addBook, getBooks };
