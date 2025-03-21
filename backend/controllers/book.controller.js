const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Book = require("../models/book.model");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { id } = req.params;
    if (!id) {
      return cb(new Error("Thiếu ID sách"), null);
    }
    const bookDir = path.join(__dirname, "../Static/book", id);
    if (!fs.existsSync(bookDir)) {
      fs.mkdirSync(bookDir, { recursive: true });
    }
    cb(null, bookDir);
  },
  filename: (req, file, cb) => {
    cb(null, "book_cover.png");
  },
});

const upload = multer({ storage });

const addBook = async (req, res) => {
  try {
    console.log("Received request:", {
      method: req.method,
      headers: req.headers,
      body: req.body,
    });

    if (!req.body) {
      return res.status(400).json({ error: "Request body is missing or invalid" });
    }

    const { tenSach, donGia, soQuyen, nguonGocTacGia, nhaXuatBan } = req.body;

    if (!tenSach || !donGia || !soQuyen) {
      return res.status(400).json({ error: "Thiếu thông tin sách: tenSach, donGia, soQuyen là bắt buộc" });
    }

    const duplicateBook = await Book.findOne({ tenSach });
    if (duplicateBook) {
      return res.status(400).json({ error: "Tên sách đã tồn tại!" });
    }

    const book = new Book({
      tenSach,
      donGia,
      soQuyen,
      nguonGocTacGia: nguonGocTacGia || "",
      nhaXuatBan: nhaXuatBan || "",
      image: "/Static/book/default_cover.png",
    });

    await book.save();

    const bookDir = path.join(__dirname, "../Static/book", book._id.toString());
    if (!fs.existsSync(bookDir)) {
      fs.mkdirSync(bookDir, { recursive: true });
    }
    book.image = `/Static/book/${book._id}/book_cover.png`;
    await book.save();

    res.status(201).json({ message: "Sách đã được tạo", book });
  } catch (error) {
    console.error("❌ Error creating book:", error);
    res.status(500).json({ error: "Lỗi khi thêm sách", details: error.message });
  }
};

const uploadBookImage = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ error: "Sách không tồn tại!" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Vui lòng chọn ảnh để upload" });
    }

    book.image = `/Static/book/${id}/book_cover.png`;
    await book.save();

    res.status(200).json({
      message: "Ảnh đã được upload",
      imagePath: book.image,
    });
  } catch (error) {
    console.error("❌ Error uploading book image:", error);
    res.status(500).json({ error: "Lỗi khi upload ảnh", details: error.message });
  }
};

// 🔹 API: Update Book (Admin or Boss only)
const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenSach, donGia, soQuyen, nguonGocTacGia, nhaXuatBan } = req.body;

    // Check if book exists
    const existingBook = await Book.findById(id);
    if (!existingBook) {
      return res.status(404).json({ error: "Sách không tồn tại!" });
    }

    // Update only provided fields
    const updatedBook = await Book.findByIdAndUpdate(
      id,
      {
        tenSach: tenSach || existingBook.tenSach,
        donGia: donGia || existingBook.donGia,
        soQuyen: soQuyen || existingBook.soQuyen,
        nguonGocTacGia: nguonGocTacGia || existingBook.nguonGocTacGia,
        nhaXuatBan: nhaXuatBan || existingBook.nhaXuatBan,
      },
      { new: true } // Return updated document
    );

    res.json({ message: "Sách đã được cập nhật", book: updatedBook });
  } catch (error) {
    console.error("❌ Error updating book:", error);
    res.status(500).json({ error: "Lỗi khi cập nhật sách", details: error.message });
  }
};

// 🔹 API: Delete Book and Image (Admin or Boss only)
const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if book exists
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ error: "Sách không tồn tại!" });
    }

    // Delete book from database
    await book.deleteOne();

    // Remove book image directory
    const bookDir = path.join(__dirname, "../Static/book", id);
    if (fs.existsSync(bookDir)) {
      await fs.promises.rm(bookDir, { recursive: true, force: true });
    }

    res.json({ message: "Sách đã được xóa" });
  } catch (error) {
    console.error("❌ Error deleting book:", error);
    res.status(500).json({ error: "Lỗi khi xóa sách", details: error.message });
  }
};

// 🔹 API: Get All Books (Public or Authenticated)
const getBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    console.error("❌ Error fetching books:", error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách sách", details: error.message });
  }
};

module.exports = { addBook, uploadBookImage, getBooks, updateBook, deleteBook, upload };