const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Thêm bcryptjs để mã hóa mật khẩu
const cors = require('cors');

// Khởi tạo dotenv để đọc các biến môi trường từ file .env
dotenv.config();

const app = express();
const port = process.env.PORT || 3000; // Cổng mặc định là 3000 nếu không có trong .env

// Middleware
app.use(express.json()); // Parse dữ liệu JSON từ request body
app.use(cors()); // Cấu hình CORS (nếu cần)

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Tạo mô hình User
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Route mặc định
app.get('/', (req, res) => {
  res.send('Hello, this is the backend server!');
});

// API để tạo JWT (ví dụ cho người dùng đăng nhập)
// Route đăng nhập của người dùng
app.post('/api/users/login', async (req, res) => {
  const { username, password } = req.body;

  // Tìm tài khoản trong database
  const user = await User.findOne({ username });

  // Kiểm tra nếu không tìm thấy tài khoản
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // So sánh mật khẩu đã hash
  const isMatch = await bcrypt.compare(password, user.password);

  if (isMatch) {
    // Tạo JWT token nếu mật khẩu đúng
    const token = jwt.sign({ username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid password' });
  }
});

// Middleware kiểm tra JWT (để bảo vệ các route)
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Một API bảo vệ cần xác thực JWT
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route!', user: req.user });
});

// Api add_bookbook
app.use("/api/books", require("./routes/book.routes.js"));



// Khởi động server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
