import axios from "axios";

const API_URL = "http://localhost:3000"; // Địa chỉ backend của bạn

// Lấy tất cả sách
const getAllBooks = () => axios.get(`${API_URL}/api/books`);

// Thêm sách
const addBook = async () => {
  const formData = new FormData();
  formData.append("tenSach", newBook.value.tenSach);
  formData.append("donGia", newBook.value.donGia);
  formData.append("soQuyen", newBook.value.soQuyen);
  formData.append("hinhAnh", file.value);

  try {
    const response = await fetch("/api/books", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      books.value.push(data);
    } else {
      alert("Thêm sách thất bại");
    }
  } catch (error) {
    console.error("Lỗi khi thêm sách:", error);
  }
};


// Cập nhật sách
const updateBook = (bookId, updatedData) =>
  axios.put(`${API_URL}/api/books/${bookId}`, updatedData);

// Xóa sách
const deleteBook = async (bookId) => {
  try {
    await axios.delete(`${API_URL}/api/books/${bookId}`); // Gọi API xóa sách
  } catch (error) {
    console.error("Lỗi khi xóa sách:", error);
  }
};

export default {
  getAllBooks,
  addBook,
  updateBook,
  deleteBook,
};
