import Loan from "../models/loan.model.js";

export const borrowBook = async (req, res) => {
  try {
    const loan = new Loan(req.body);
    await loan.save();
    res.status(201).json(loan);
  } catch (error) {
    res.status(500).json({ error: "Failed to borrow book" });
  }
};
