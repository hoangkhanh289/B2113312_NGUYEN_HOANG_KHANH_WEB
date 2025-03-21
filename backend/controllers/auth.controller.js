const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Boss = require("../models/boss.model");
const Admin = require("../models/admin.model");
const User = require("../models/user.model");

// 🟢 Cập nhật thông tin tài khoản cá nhân (Boss/Admin/User)
const updateProfile = async (req, res) => {
  try {
    const { username, MSNV, newPassword, ...updateData } = req.body;
    let user;

    // Xác định loại tài khoản
    if (req.user.role === "boss") {
      user = await Boss.findOne({ username: req.user.username });
    } else if (req.user.role === "admin") {
      user = await Admin.findOne({ MSNV: req.user.MSNV });
    } else {
      user = await User.findOne({ MaDocGia: req.user.MaDocGia });
    }

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    // Không cho phép thay đổi MSNV
    delete updateData.MSNV;

    // Nếu có newPassword, hash lại mật khẩu trước khi cập nhật
    if (newPassword) {
      updateData.Password = await bcrypt.hash(newPassword, 10);
    }

    // Cập nhật thông tin tài khoản
    Object.assign(user, updateData);
    await user.save();

    res.json({ message: "Cập nhật tài khoản thành công", user });
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
};
// 🟢 Boss đăng nhập
const loginBoss = async (req, res) => {
  try {
    const { username, password } = req.body;
    const boss = await bosseses.findOne({ username });

    if (!boss || !(await bcrypt.compare(password, bosses.password))) {
      return res.status(400).json({ message: "Sai tài khoản hoặc mật khẩu" });
    }

    const token = jwt.sign({ username: bosses.username, role: "boss" }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🟢 Admin đăng nhập
const loginAdmin = async (req, res) => {
  try {
    const { MSNV, Password } = req.body;
    const admin = await Admin.findOne({ MSNV });

    if (!admin || !(await bcrypt.compare(Password, admin.Password))) {
      return res.status(400).json({ message: "Sai tài khoản hoặc mật khẩu" });
    }

    const token = jwt.sign({ MSNV: admin.MSNV, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🟢 Boss thêm Admin
const registerAdmin = async (req, res) => {
  try {
    if (req.user.role !== "boss") {
      return res.status(403).json({ error: "Chỉ boss có quyền tạo admin" });
    }

    const { username, MSNV, HoTenNV, Password, DiaChi, SoDienThoai } = req.body;

    if (!username || !MSNV || !HoTenNV || !Password || !DiaChi || !SoDienThoai) {
      return res.status(400).json({ error: "Vui lòng điền đầy đủ thông tin" });
    }

    const existingAdmin = await Admin.findOne({ $or: [{ username }, { MSNV }, { SoDienThoai }] });
    if (existingAdmin) {
      return res.status(400).json({ error: "Username, MSNV hoặc số điện thoại đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(Password, 10);
    const newAdmin = new Admin({
      username,
      MSNV,
      HoTenNV,
      Password: hashedPassword,
      ChucVu: "admin",
      DiaChi,
      SoDienThoai
    });

    console.log("Admin chuẩn bị lưu:", newAdmin);  // 🟢 Debug: Kiểm tra admin trước khi lưu

    await newAdmin.save();
    res.status(201).json({ message: "Admin đã được tạo thành công", admin: newAdmin });
  } catch (error) {
    console.error("Lỗi khi tạo admin:", error); // 🟢 Debug: In lỗi ra console
    res.status(500).json({ error: error.message });
  }
};



// 🟢 Admin thêm User (Độc giả)
const registerUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Chỉ admin có quyền tạo user" });
    }

    const { MaDocGia, HoLot, Ten, NgaySinh, Phai, DiaChi, DienThoai } = req.body;

    if (!MaDocGia || !HoLot || !Ten || !NgaySinh || !Phai || !DiaChi || !DienThoai) {
      return res.status(400).json({ error: "Vui lòng điền đầy đủ thông tin" });
    }

    const existingUser = await User.findOne({ $or: [{ MaDocGia }, { DienThoai }] });
    if (existingUser) {
      return res.status(400).json({ error: "Mã độc giả hoặc số điện thoại đã tồn tại" });
    }

    const newUser = new User({ MaDocGia, HoLot, Ten, NgaySinh, Phai, DiaChi, DienThoai });

    await newUser.save();
    res.status(201).json({ message: "Độc giả đã được tạo thành công" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { loginBoss, loginAdmin, registerAdmin, registerUser, updateProfile };