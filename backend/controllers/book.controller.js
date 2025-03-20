const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Book = require("../models/book.model.js");

// Thiết lập multer để xử lý ảnh upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const bookId = req.params.id || 'temp'; // Dùng ID sách nếu có hoặc 'temp' khi chưa có ID
    const dir = path.join(__dirname, `../Static/book/${bookId}`);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir); // Định vị thư mục lưu ảnh
  },
  filename: (req, file, cb) => {
    cb(null, 'book_cover.png'); // Đặt tên tĩnh cho ảnh (có thể thay đổi nếu muốn)
  }
});

const upload = multer({ storage: storage });

// Thêm sách và lưu ảnh (dùng upload ảnh)
const addBook = async (req, res) => {
  try {
    const { tenSach, donGia, soQuyen, nguonGocTacGia, nhaXuatBan } = req.body;
    
    // Thêm sách vào cơ sở dữ liệu
    const book = new Book({ tenSach, donGia, soQuyen, nguonGocTacGia, nhaXuatBan });
    await book.save();
    
    // Tạo thư mục lưu ảnh cho sách
    const bookDir = path.join(__dirname, `../Static/book/${book._id}`);
    if (!fs.existsSync(bookDir)) {
      fs.mkdirSync(bookDir, { recursive: true });
    }

    // Trả về thông tin sách đã tạo, bao gồm đường dẫn ảnh
    const imagePath = `/Static/book/${book._id}/book_cover.png`;  // Đảm bảo đường dẫn ảnh đúng
    res.status(201).json({ ...book.toObject(), imagePath }); // Trả về thông tin sách với imagePath
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình thêm sách" });
  }
};


// Cập nhật thông tin sách
const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenSach, donGia, soQuyen, nguonGocTacGia, nhaXuatBan } = req.body;

    // Kiểm tra xem sách có tồn tại không
    const existingBook = await Book.findById(id);
    if (!existingBook) {
      return res.status(404).json({ error: "Sách không tồn tại!" });
    }

    // Kiểm tra tên sách trùng lặp
    const duplicateBook = await Book.findOne({
      tenSach: { $regex: `^${tenSach}$`, $options: "i" },
      _id: { $ne: id }, // Loại trừ sách đang cập nhật
    });

    if (duplicateBook) {
      return res.status(400).json({ error: "Tên sách đã tồn tại!" });
    }

    // Cập nhật sách
    const updatedBook = await Book.findByIdAndUpdate(
      id,
      { tenSach, donGia, soQuyen, nguonGocTacGia, nhaXuatBan },
      { new: true }
    );

    res.json(updatedBook);
  } catch (error) {
    res.status(500).json({ error: "Failed to update book" });
  }
};

// Xóa sách và thư mục ảnh
const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Tìm sách theo ID và xóa
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ error: "Sách không tồn tại!" });
    }

    await book.remove();

    // Xóa thư mục chứa ảnh
    const bookDir = path.join(__dirname, `../Static/book/${id}`);
    
    if (fs.existsSync(bookDir)) {
      fs.rmSync(bookDir, { recursive: true });
    }

    res.json({ message: "Sách đã được xóa thành công" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi xóa sách" });
  }
};
// Lấy danh sách sách
const getBooks = async (req, res) => {
  try {
    const books = await Book.find();
    
    // Duyệt qua từng sách để thêm đường dẫn ảnh
    const booksWithImages = books.map(book => {
      const imagePath = `/Static/book/${book._id}/book_cover.png`; // Đường dẫn ảnh sẽ được xử lý trên frontend
      return {
        ...book.toObject(),
        imagePath
      };
    });

    res.json(booksWithImages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch books" });
  }
};

module.exports = { addBook, getBooks, updateBook, deleteBook, upload };
