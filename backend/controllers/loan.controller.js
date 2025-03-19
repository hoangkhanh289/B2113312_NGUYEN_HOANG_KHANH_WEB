const Loan = require("../models/loan.model");
const Book = require("../models/book.model");

// Mượn sách
const borrowBook = async (req, res) => {
  try {
    const { userId, bookId } = req.body;

    // Kiểm tra xem sách có sẵn không
    const book = await Book.findById(bookId);
    if (!book || !book.available) {
      return res.status(400).json({ message: "Sách không có sẵn để mượn" });
    }

    // Tạo bản ghi mượn sách
    const loan = new Loan({ userId, bookId });
    await loan.save();

    // Cập nhật trạng thái sách
    book.available = false;
    await book.save();

    res.status(201).json(loan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Trả sách
const returnBook = async (req, res) => {
  try {
    const { loanId } = req.body;

    // Tìm bản ghi mượn sách
    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ message: "Không tìm thấy thông tin mượn sách" });
    }

    // Cập nhật ngày trả sách
    loan.returnDate = new Date();
    await loan.save();

    // Cập nhật trạng thái sách
    const book = await Book.findById(loan.bookId);
    if (book) {
      book.available = true;
      await book.save();
    }

    res.json({ message: "Trả sách thành công" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Export các function
module.exports = { borrowBook, returnBook };
