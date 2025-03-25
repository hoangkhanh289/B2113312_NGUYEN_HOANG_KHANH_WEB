const Loan = require("../models/loan.model");
const Book = require("../models/book.model");
const User = require("../models/user.model");
const Admin = require("../models/admin.model");

const borrowBook = async (req, res) => {
  try {
    const { bookId, ngayMuon, ngayTra, soLuong } = req.body;
    if (!req.user || !req.user.username || !req.user.role) {
      return res.status(401).json({ message: "Không tìm thấy thông tin người dùng" });
    }

    // Lấy userId dựa trên role và username
    let user;
    if (req.user.role === "user") {
      user = await User.findOne({ MaDocGia: req.user.username });
    } else if (req.user.role === "admin") {
      user = await Admin.findOne({ MSNV: req.user.username });
    } else {
      return res.status(403).json({ message: "Chỉ user hoặc admin mới có thể mượn sách" });
    }
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng trong cơ sở dữ liệu" });
    }
    const userId = user._id; // Lấy _id từ user document

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Không tìm thấy sách" });
    }
    if (book.soQuyen < soLuong) {
      return res.status(400).json({ message: "Số lượng sách không đủ" });
    }

    const currentDate = new Date();
    const borrowDate = new Date(ngayMuon);
    const returnDate = new Date(ngayTra);

    const today = new Date(currentDate.setHours(0, 0, 0, 0));
    const borrowDay = new Date(borrowDate.setHours(0, 0, 0, 0));
    const returnDay = new Date(returnDate.setHours(0, 0, 0, 0));

    if (borrowDay < today) {
      return res.status(400).json({ message: "Ngày mượn phải từ hôm nay trở đi" });
    }
    if (returnDay < borrowDay) {
      return res.status(400).json({ message: "Ngày trả phải sau ngày mượn" });
    }
    const maxReturnDate = new Date(borrowDay);
    maxReturnDate.setDate(borrowDay.getDate() + 30);
    if (returnDay > maxReturnDate) {
      return res.status(400).json({ message: "Ngày trả không được vượt quá 30 ngày kể từ ngày mượn" });
    }

    const previousLoans = await Loan.countDocuments({ userId, bookId });
    const lanMuon = previousLoans + 1;

    const loan = new Loan({
      userId,
      bookId,
      ngayMuon: borrowDate,
      ngayTra: returnDate,
      soLuong,
      lanMuon,
      trangThai: "cho_duyet",
    });
    await loan.save();

    res.status(201).json({ message: "Đăng ký mượn sách thành công, đang chờ duyệt", loan });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Xem danh sách mượn sách của người dùng (User)
const getUserLoans = async (req, res) => {
  try {
    if (!req.user || !req.user.username || !req.user.role) {
      return res.status(401).json({ message: "Không tìm thấy thông tin người dùng" });
    }

    let user;
    if (req.user.role === "user") {
      user = await User.findOne({ MaDocGia: req.user.username });
    } else if (req.user.role === "admin") {
      user = await Admin.findOne({ MSNV: req.user.username });
    } else {
      return res.status(403).json({ message: "Chỉ user hoặc admin mới có thể xem danh sách mượn" });
    }
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    const userId = user._id;

    const loans = await Loan.find({ userId })
      .populate("bookId", "tenSach")
      .populate("userId", "MaDocGia MSNV"); // Hiển thị MaDocGia hoặc MSNV
    res.status(200).json(loans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Xóa yêu cầu mượn sách (User/Admin)
const deleteLoan = async (req, res) => {
  try {
    const { loanId } = req.params;
    if (!req.user || !req.user.username || !req.user.role) {
      return res.status(401).json({ message: "Không tìm thấy thông tin người dùng" });
    }

    let user;
    if (req.user.role === "user") {
      user = await User.findOne({ MaDocGia: req.user.username });
    } else if (req.user.role === "admin") {
      user = await Admin.findOne({ MSNV: req.user.username });
    } else {
      return res.status(403).json({ message: "Chỉ user hoặc admin mới có thể xóa yêu cầu" });
    }
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    const userId = user._id;

    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu mượn sách" });
    }

    if (loan.userId.toString() !== userId.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Không có quyền xóa yêu cầu này" });
    }

    await Loan.findByIdAndDelete(loanId);
    res.status(200).json({ message: "Xóa yêu cầu mượn sách thành công" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Xem tất cả yêu cầu mượn sách (Admin)
const getAllLoans = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Chỉ admin mới có quyền truy cập" });
    }
    const loans = await Loan.find()
      .populate("bookId", "tenSach")
      .populate("userId", "MaDocGia MSNV");
    res.status(200).json(loans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Duyệt yêu cầu mượn sách (Admin)
const approveLoan = async (req, res) => {
  try {
    const { loanId } = req.body;
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Chỉ admin mới có quyền duyệt" });
    }

    const loan = await Loan.findById(loanId);
    if (!loan || loan.trangThai !== "cho_duyet") {
      return res.status(400).json({ message: "Yêu cầu không tồn tại hoặc không thể duyệt" });
    }

    const book = await Book.findById(loan.bookId);
    if (book.soQuyen < loan.soLuong) {
      return res.status(400).json({ message: "Số lượng sách không đủ để duyệt" });
    }

    loan.trangThai = "da_muon";
    loan.approvedBy = req.user.username; // Lưu MSNV của admin duyệt
    book.soQuyen -= loan.soLuong;
    await Promise.all([loan.save(), book.save()]);

    res.status(200).json({ message: "Duyệt mượn sách thành công", loan });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Xác nhận trả sách (Admin)
const returnBook = async (req, res) => {
  try {
    const { loanId } = req.body;
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Chỉ admin mới có quyền xác nhận trả sách" });
    }

    const loan = await Loan.findById(loanId);
    if (!loan || loan.trangThai !== "da_muon") {
      return res.status(400).json({ message: "Yêu cầu không tồn tại hoặc không thể trả" });
    }

    const book = await Book.findById(loan.bookId);
    loan.trangThai = "da_tra";
    loan.ngayTra = new Date();
    book.soQuyen += loan.soLuong;
    await Promise.all([loan.save(), book.save()]);

    res.status(200).json({ message: "Xác nhận trả sách thành công", loan });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  borrowBook,
  getUserLoans,
  deleteLoan,
  getAllLoans,
  approveLoan,
  returnBook,
};