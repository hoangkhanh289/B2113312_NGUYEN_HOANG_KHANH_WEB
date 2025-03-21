const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const path = require("path");
const Boss = require("./models/boss.model");
const Admin = require("./models/admin.model");
const User = require("./models/user.model");
const Book = require("./models/book.model");
const { authenticateToken, isAdmin, isBoss } = require("./middleware/auth"); // Import middleware
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 3000;

dotenv.config();

// Middleware
app.use(express.json());
app.use(cors());
app.use("/Static", express.static(path.join(__dirname, "Static")));
// Routes
app.use("/api/books", require("./routes/book.routes.js"));

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((error) => console.error("❌ MongoDB connection error:", error));

// API: Login
app.post("/api/auth/login", async (req, res) => {
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
      console.log("Boss - Mật khẩu trong MongoDB:", user.password);
      console.log("Boss - Mật khẩu nhập vào:", password);
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        const hashedInput = await bcrypt.hash(password, 10);
        console.log("Boss - Mật khẩu nhập vào sau hash:", hashedInput);
        return res.status(401).json({ message: "Sai password" });
      }
    } else {
      // Tìm Admin theo MSNV
      user = await Admin.findOne({ MSNV: username });
      if (user) {
        role = "admin";
        console.log("Admin - Mật khẩu trong MongoDB:", user.password);
        console.log("Admin - Mật khẩu nhập vào:", password);
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          const hashedInput = await bcrypt.hash(password, 10);
          console.log("Admin - Mật khẩu nhập vào sau hash:", hashedInput);
          return res.status(401).json({ message: "Sai password" });
        }
      } else {
        // Tìm User theo MaDocGia
        user = await User.findOne({ MaDocGia: username });
        if (user) {
          role = "user";
          console.log("User - Mật khẩu trong MongoDB:", user.password);
          console.log("User - Mật khẩu nhập vào:", password);
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            const hashedInput = await bcrypt.hash(password, 10);
            console.log("User - Mật khẩu nhập vào sau hash:", hashedInput);
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
});

// API: Register Admin (Boss only)
app.post("/api/auth/register-admin", authenticateToken, isBoss, async (req, res) => {
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
      password, // Không hash ở đây, để middleware xử lý
      ChucVu,
      DiaChi,
      SoDienThoai,
    });

    await newAdmin.save();
    console.log("✅ Admin created:", newAdmin);
    res.status(201).json({ message: "Admin created successfully!", admin: newAdmin });
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    res.status(500).json({ error: "Lỗi máy chủ", details: error.message });
  }
});

// API: Register User (Admin or Boss)
app.post("/api/auth/register-user", authenticateToken, isAdmin,isBoss, async (req, res) => {
  try {
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
      password, // Không hash ở đây, để middleware xử lý
    });

    await newUser.save();
    console.log("✅ User created:", newUser);
    res.status(201).json({ message: "User created successfully!", user: newUser });
  } catch (error) {
    console.error("❌ Error creating user:", error);
    res.status(500).json({ error: "Lỗi máy chủ", details: error.message });
  }
});

// API: Get Users and Admins (Boss only)
app.get("/api/boss/users-admins", authenticateToken, isBoss, async (req, res) => {
  try {
    const admins = await Admin.find().select("MSNV HoTenNV");
    const users = await User.find().select("MaDocGia HoLot Ten");
    res.json({ admins, users });
  } catch (error) {
    console.error("❌ Error fetching admins/users:", error);
    res.status(500).json({ error: "Lỗi máy chủ", details: error.message });
  }
});

// API: Get Users (Admin or Boss)
app.get("/api/admin/users", authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("MaDocGia HoLot Ten");
    res.json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ error: "Lỗi máy chủ", details: error.message });
  }
});

// API: Get User/Admin by ID (Boss only)
app.get("/api/boss/user-admin/:id", authenticateToken, isBoss, async (req, res) => {
  const { id } = req.params;
  try {
    let result = await Admin.findOne({ MSNV: id }) || await User.findOne({ MaDocGia: id });
    if (!result) {
      return res.status(404).json({ message: "Không tìm thấy Admin hoặc User" });
    }
    res.json(result);
  } catch (error) {
    console.error("❌ Error finding admin/user:", error);
    res.status(500).json({ error: "Lỗi máy chủ", details: error.message });
  }
});

// API: Get User by ID (Admin or Boss)
app.get("/api/admin/user/:id", authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findOne({ MaDocGia: id });
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy User" });
    }
    res.json(user);
  } catch (error) {
    console.error("❌ Error finding user:", error);
    res.status(500).json({ error: "Lỗi máy chủ", details: error.message });
  }
});

// API: Update User/Admin (Boss only)
app.put("/api/boss/update", authenticateToken, isBoss, async (req, res) => {
  try {
    const { username, role, updateData } = req.body;
    let userToUpdate;

    if (role === "admin") {
      userToUpdate = await Admin.findOne({ username });
      if (!userToUpdate) return res.status(404).json({ message: "Admin not found" });

      const { MSNV, HoTenNV, Password, ChucVu, DiaChi, SoDienThoai } = updateData;
      if (MSNV) userToUpdate.MSNV = MSNV;
      if (HoTenNV) userToUpdate.HoTenNV = HoTenNV;
      if (ChucVu) userToUpdate.ChucVu = ChucVu;
      if (DiaChi) userToUpdate.DiaChi = DiaChi;
      if (SoDienThoai) userToUpdate.SoDienThoai = SoDienThoai;
      if (Password) userToUpdate.password = await bcrypt.hash(Password, 10);
    } else if (role === "user") {
      userToUpdate = await User.findOne({ username });
      if (!userToUpdate) return res.status(404).json({ message: "User not found" });

      const { MaDocGia, HoLot, Ten, NgaySinh, Phai, DiaChi, DienThoai } = updateData;
      if (MaDocGia) userToUpdate.MaDocGia = MaDocGia;
      if (HoLot) userToUpdate.HoLot = HoLot;
      if (Ten) userToUpdate.Ten = Ten;
      if (NgaySinh) userToUpdate.NgaySinh = NgaySinh;
      if (Phai) userToUpdate.Phai = Phai;
      if (DiaChi) userToUpdate.DiaChi = DiaChi;
      if (DienThoai) userToUpdate.DienThoai = DienThoai;
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    await userToUpdate.save();
    res.json({ message: "User/Admin updated successfully", user: userToUpdate });
  } catch (error) {
    console.error("❌ Error updating user/admin:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// API: Update Admin (Admin only)
app.put("/api/admin/update", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can update this information" });
    }

    const { HoTenNV, DiaChi, SoDienThoai, oldPassword, newPassword } = req.body;
    let admin = await Admin.findOne({ username: req.user.username });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    if (oldPassword) {
      const isMatch = await bcrypt.compare(oldPassword, admin.password);
      if (!isMatch) return res.status(401).json({ message: "Incorrect old password" });
      if (newPassword) admin.password = await bcrypt.hash(newPassword, 10);
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
});

// API: Update User (User only)
app.put("/api/user/update", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Only users can update this information" });
    }

    const { HoLot, Ten, NgaySinh, Phai, DiaChi, DienThoai, oldPassword, newPassword } = req.body;
    let user = await User.findOne({ username: req.user.username });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (oldPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) return res.status(401).json({ message: "Incorrect old password" });
      if (newPassword) user.password = await bcrypt.hash(newPassword, 10);
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
});

// API: Delete User/Admin (Boss only)
app.delete("/api/admin-users/:id", authenticateToken, isBoss, async (req, res) => {
  try {
    const userIdToDelete = req.params.id;

    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(userIdToDelete)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Thử xóa từ collection Admin trước
    let deletedUser = await Admin.findByIdAndDelete(userIdToDelete);
    if (deletedUser) {
      return res.json({ message: "Admin deleted successfully" });
    }

    // Nếu không tìm thấy trong Admin, thử xóa từ User
    deletedUser = await User.findByIdAndDelete(userIdToDelete);
    if (deletedUser) {
      return res.json({ message: "User deleted successfully" });
    }

    // Nếu không tìm thấy ở cả hai
    return res.status(404).json({ message: "Admin or User not found" });
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
});