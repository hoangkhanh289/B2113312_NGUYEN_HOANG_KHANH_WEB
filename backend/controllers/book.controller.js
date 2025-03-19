import Book from "../models/book.model.js";

export const addBook = async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ error: "Failed to add book" });
  }
};

export const getBooks = async (req, res) => {
  const books = await Book.find();
  res.json(books);
};
