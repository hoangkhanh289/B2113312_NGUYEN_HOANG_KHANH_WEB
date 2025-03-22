const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const mongoose = require("mongoose");
const Boss = require("../models/boss.model");
const Admin = require("../models/admin.model");
const User = require("../models/user.model");

// API: Login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    let user, role;

    // Tìm Boss theo username
    user = await Boss.findOne({ username });
    if (user) {
      role = "boss";
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Sai password" });
      }
    } else {
      // Tìm Admin theo MSNV
      user = await Admin.findOne({ MSNV: username });
      if (user) {
        role = "admin";
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(401).json({ message: "Sai password" });
        }
      } else {
        // Tìm User theo MaDocGia
        user = await User.findOne({ MaDocGia: username });
        if (user) {
          role = "user";
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return res.status(401).json({ message: "Sai password" });
          }
        } else {
          return res.status(404).json({ message: "User not found" });
        }
      }
    }

    // Tạo token
    const token = jwt.sign(
      {
        username: role === "boss" ? user.username : (role === "admin" ? user.MSNV : user.MaDocGia),
        role,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
};

// API: Register Admin (Boss only)
const registerAdmin = async (req, res) => {
  try {
    const { MSNV, HoTenNV, password, ChucVu, DiaChi, SoDienThoai } = req.body;

    if (!MSNV || !HoTenNV || !password || !ChucVu || !DiaChi || !SoDienThoai) {
      return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin" });
    }

    const existingAdmin = await Admin.findOne({ $or: [{ MSNV }, { SoDienThoai }] });
    if (existingAdmin) {
      return res.status(400).json({ error: "MSNV hoặc số điện thoại đã tồn tại" });
    }

    const newAdmin = new Admin({
      MSNV,
      HoTenNV,
      password,
      ChucVu,
      DiaChi,
      SoDienThoai,
    });

    await newAdmin.save();
    // console.log("✅ Admin created:", newAdmin);
    res.status(201).json({ message: "Admin created successfully!", admin: newAdmin });
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    res.status(500).json({ error: "Lỗi máy chủ", details: error.message });
  }
};

// API: Register User (Admin or Boss)
const registerUser = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    const { MaDocGia, HoLot, Ten, NgaySinh, Phai, DiaChi, DienThoai, password } = req.body;

    if (!MaDocGia || !HoLot || !Ten || !NgaySinh || !Phai || !DiaChi || !DienThoai || !password) {
      return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin" });
    }

    const existingUser = await User.findOne({ $or: [{ MaDocGia }, { DienThoai }] });
    if (existingUser) {
      return res.status(400).json({ error: "Mã độc giả hoặc số điện thoại đã tồn tại" });
    }

    const newUser = new User({
      MaDocGia,
      HoLot,
      Ten,
      NgaySinh,
      Phai,
      DiaChi,
      DienThoai,
      password,
    });

    await newUser.save();
    console.log("✅ User created:", newUser);
    res.status(201).json({ message: "User created successfully!", user: newUser });
  } catch (error) {
    console.error("❌ Error creating user:", error);
    res.status(500).json({ error: "Lỗi máy chủ", details: error.message });
  }
};

// API: Get Users and Admins (Boss only)
const getUsersAndAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("MSNV HoTenNV SoDienThoai password ChucVu DiaChi");
    const users = await User.find().select("MaDocGia HoLot Ten NgaySinh Phai DiaChi DienThoai password");
    res.json({ admins, users });
  } catch (error) {
    console.error("❌ Error fetching admins/users:", error);
    res.status(500).json({ error: "Lỗi máy chủ", details: error.message });
  }
};

// API: Get Users (Admin or Boss)
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("MaDocGia HoLot Ten NgaySinh Phai DiaChi DienThoai password");
    res.json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ error: "Lỗi máy chủ", details: error.message });
  }
};

// API: Update User/Admin (Boss only)
const updateUserOrAdmin = async (req, res) => {
  try {
    const { username, role, updateData } = req.body;
    let userToUpdate;

    if (role === "admin") {
      userToUpdate = await Admin.findOne({ MSNV: username });
      if (!userToUpdate) return res.status(404).json({ message: "Admin not found" });

      const { MSNV, HoTenNV, Password, ChucVu, DiaChi, SoDienThoai } = updateData;
      if (MSNV) userToUpdate.MSNV = MSNV;
      if (HoTenNV) userToUpdate.HoTenNV = HoTenNV;
      if (ChucVu) userToUpdate.ChucVu = ChucVu;
      if (DiaChi) userToUpdate.DiaChi = DiaChi;
      if (SoDienThoai) userToUpdate.SoDienThoai = SoDienThoai;
      if (Password) userToUpdate.password = Password;
    } else if (role === "user") {
      userToUpdate = await User.findOne({ MaDocGia: username });
      if (!userToUpdate) return res.status(404).json({ message: "User not found" });

      const { MaDocGia, HoLot, Ten, NgaySinh, Phai, DiaChi, DienThoai, Password } = updateData;
      if (MaDocGia) userToUpdate.MaDocGia = MaDocGia;
      if (HoLot) userToUpdate.HoLot = HoLot;
      if (Ten) userToUpdate.Ten = Ten;
      if (NgaySinh) userToUpdate.NgaySinh = NgaySinh;
      if (Phai) userToUpdate.Phai = Phai;
      if (DiaChi) userToUpdate.DiaChi = DiaChi;
      if (DienThoai) userToUpdate.DienThoai = DienThoai;
      if (Password) userToUpdate.password = Password;
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    await userToUpdate.save();
    res.json({ message: "User/Admin updated successfully", user: userToUpdate });
  } catch (error) {
    console.error("❌ Error updating user/admin:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// API: Update User (Admin only)
const updateUserByAdmin = async (req, res) => {
  try {
    const { username, role, updateData } = req.body;
    let userToUpdate;

    if (role === "user") {
      userToUpdate = await User.findOne({ MaDocGia: username });
      if (!userToUpdate) return res.status(404).json({ message: "User not found" });

      const { MaDocGia, HoLot, Ten, NgaySinh, Phai, DiaChi, DienThoai, Password } = updateData;
      if (MaDocGia) userToUpdate.MaDocGia = MaDocGia;
      if (HoLot) userToUpdate.HoLot = HoLot;
      if (Ten) userToUpdate.Ten = Ten;
      if (NgaySinh) userToUpdate.NgaySinh = NgaySinh;
      if (Phai) userToUpdate.Phai = Phai;
      if (DiaChi) userToUpdate.DiaChi = DiaChi;
      if (DienThoai) userToUpdate.DienThoai = DienThoai;
      if (Password) userToUpdate.password = Password;
    } else {
      return res.status(400).json({ message: "Invalid role. Admin can only update users." });
    }

    await userToUpdate.save();
    res.json({ message: "User updated successfully", user: userToUpdate });
  } catch (error) {
    console.error("❌ Error updating user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// API: Get Profile
const getProfile = async (req, res) => {
  try {
    let profile;
    if (req.user.role === "admin") {
      profile = await Admin.findOne({ MSNV: req.user.username });
      if (!profile) return res.status(404).json({ message: "Admin not found" });
    } else if (req.user.role === "user") {
      profile = await User.findOne({ MaDocGia: req.user.username });
      if (!profile) return res.status(404).json({ message: "User not found" });
    } else {
      return res.status(403).json({ message: "Unauthorized role" });
    }
    res.json({ profile });
  } catch (error) {
    console.error("❌ Error fetching profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// API: Update Admin (Admin only)
const updateAdmin = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can update this information" });
    }

    const { HoTenNV, DiaChi, SoDienThoai, oldPassword, newPassword } = req.body;
    let admin = await Admin.findOne({ MSNV: req.user.username });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    if (oldPassword) {
      const isMatch = await bcrypt.compare(oldPassword, admin.password);
      if (!isMatch) return res.status(401).json({ message: "Incorrect old password" });
      if (newPassword) admin.password = newPassword;
    }

    if (HoTenNV) admin.HoTenNV = HoTenNV;
    if (DiaChi) admin.DiaChi = DiaChi;
    if (SoDienThoai) admin.SoDienThoai = SoDienThoai;

    await admin.save();
    res.json({ message: "Admin updated successfully", admin });
  } catch (error) {
    console.error("❌ Error updating admin:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// API: Update User (User only)
const updateUser = async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Only users can update this information" });
    }

    const { HoLot, Ten, NgaySinh, Phai, DiaChi, DienThoai, oldPassword, newPassword } = req.body;
    let user = await User.findOne({ MaDocGia: req.user.username });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (oldPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) return res.status(401).json({ message: "Incorrect old password" });
      if (newPassword) user.password = newPassword;
    }

    if (HoLot) user.HoLot = HoLot;
    if (Ten) user.Ten = Ten;
    if (NgaySinh) user.NgaySinh = NgaySinh;
    if (Phai) user.Phai = Phai;
    if (DiaChi) user.DiaChi = DiaChi;
    if (DienThoai) user.DienThoai = DienThoai;

    await user.save();
    res.json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("❌ Error updating user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// API: Delete User/Admin (Boss only)
const deleteUserOrAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra xem ID có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    // Xóa người dùng hoặc admin từ collection tương ứng
    const user = await mongoose.model("User").findByIdAndDelete(id);
    const admin = await mongoose.model("Admin").findByIdAndDelete(id);

    if (!user && !admin) {
      return res.status(404).json({ message: "Không tìm thấy người dùng hoặc admin" });
    }

    res.status(200).json({ message: "Xóa thành công" });
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    res.status(500).json({ message: "Lỗi server khi xóa" });
  }
};

// API: Delete User (Admin only)
const deleteUser = async (req, res) => {
  try {
    const userIdToDelete = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(userIdToDelete)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const deletedUser = await User.findByIdAndDelete(userIdToDelete);
    if (deletedUser) {
      return res.json({ message: "User deleted successfully" });
    }
    return res.status(404).json({ message: "User not found" });
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  login,
  registerAdmin,
  registerUser,
  getUsersAndAdmins,
  getUsers,
  updateUserOrAdmin,
  updateUserByAdmin,
  getProfile,
  updateAdmin,
  updateUser,
  deleteUserOrAdmin,
  deleteUser,
};