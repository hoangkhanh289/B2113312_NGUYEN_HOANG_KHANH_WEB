const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access denied" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "boss") {
    return res.status(403).json({ message: "Access denied: Admin only" });
  }
  next();
};

const isBoss = (req, res, next) => {
  if (req.user.role !== "boss") {
    return res.status(403).json({ message: "Access denied: Boss only" });
  }
  next();
};

module.exports = { authenticateToken, isAdmin, isBoss };