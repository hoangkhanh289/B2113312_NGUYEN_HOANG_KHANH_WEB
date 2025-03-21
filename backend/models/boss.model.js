const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // Thay bcrypt thành bcryptjs

const bossSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

bossSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("Boss", bossSchema);