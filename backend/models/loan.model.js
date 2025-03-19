const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  ngayMuon: { type: Date, default: Date.now, required: true },
  ngayTra: { type: Date },
});

module.exports = mongoose.model("Loan", loanSchema);
