import mongoose from "mongoose";

const loanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  loanDate: { type: Date, default: Date.now },
  returnDate: { type: Date },
});

export default mongoose.model("Loan", loanSchema);
