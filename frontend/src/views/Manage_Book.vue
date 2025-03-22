<template>
  <div>
    <!-- Form Thêm Sách -->
    <form @submit.prevent="submitBook" class="add-book-form">
      <div class="form-group">
        <label for="tenSach">Tên sách:</label>
        <input
          type="text"
          id="tenSach"
          v-model="form.tenSach"
          placeholder="Nhập tên sách"
          required
        />
      </div>
      <div class="form-group">
        <label for="donGia">Đơn giá (VNĐ):</label>
        <input
          type="number"
          id="donGia"
          v-model.number="form.donGia"
          placeholder="Nhập đơn giá"
          required
        />
      </div>
      <div class="form-group">
        <label for="soQuyen">Số quyển:</label>
        <input
          type="number"
          id="soQuyen"
          v-model.number="form.soQuyen"
          placeholder="Nhập số quyển"
          required
        />
      </div>
      <div class="form-group">
        <label for="nguonGocTacGia">Nguồn gốc tác giả:</label>
        <input
          type="text"
          id="nguonGocTacGia"
          v-model="form.nguonGocTacGia"
          placeholder="Nhập nguồn gốc tác giả (tùy chọn)"
        />
      </div>
      <div class="form-group">
        <label for="nhaXuatBan">Nhà xuất bản:</label>
        <input
          type="text"
          id="nhaXuatBan"
          v-model="form.nhaXuatBan"
          placeholder="Nhập nhà xuất bản (tùy chọn)"
        />
      </div>
      <div class="form-group">
        <label for="hinhAnh">Ảnh bìa sách:</label>
        <input
          type="file"
          id="hinhAnh"
          ref="fileInput"
          @change="handleFileChange"
          accept="image/*"
        />
      </div>
      <button type="submit" class="submit-btn">Thêm sách</button>
      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">{{ success }}</p>
    </form>

    <!-- Form Cập Nhật Sách -->
    <form @submit.prevent="updateBook" class="update-book-form">
      <div class="form-group">
        <label for="selectBook">Chọn sách để cập nhật:</label>
        <select
          id="selectBook"
          v-model="selectedBookId"
          @change="loadBookDetails"
          required
        >
          <option value="">-- Chọn sách --</option>
          <option v-for="book in books" :key="book._id" :value="book._id">
            {{ book.tenSach }}
          </option>
        </select>
      </div>
      <div v-if="selectedBookId" class="form-group">
        <label for="updateTenSach">Tên sách:</label>
        <input
          type="text"
          id="updateTenSach"
          v-model="updateForm.tenSach"
          placeholder="Nhập tên sách"
          required
        />
      </div>
      <div v-if="selectedBookId" class="form-group">
        <label for="updateDonGia">Đơn giá (VNĐ):</label>
        <input
          type="number"
          id="updateDonGia"
          v-model.number="updateForm.donGia"
          placeholder="Nhập đơn giá"
          required
        />
      </div>
      <div v-if="selectedBookId" class="form-group">
        <label for="updateSoQuyen">Số quyển:</label>
        <input
          type="number"
          id="updateSoQuyen"
          v-model.number="updateForm.soQuyen"
          placeholder="Nhập số quyển"
          required
        />
      </div>
      <div v-if="selectedBookId" class="form-group">
        <label for="updateNguonGocTacGia">Nguồn gốc tác giả:</label>
        <input
          type="text"
          id="updateNguonGocTacGia"
          v-model="updateForm.nguonGocTacGia"
          placeholder="Nhập nguồn gốc tác giả (tùy chọn)"
        />
      </div>
      <div v-if="selectedBookId" class="form-group">
        <label for="updateNhaXuatBan">Nhà xuất bản:</label>
        <input
          type="text"
          id="updateNhaXuatBan"
          v-model="updateForm.nhaXuatBan"
          placeholder="Nhập nhà xuất bản (tùy chọn)"
        />
      </div>
      <div v-if="selectedBookId" class="form-group">
        <label for="updateHinhAnh">Ảnh bìa sách (giữ nguyên nếu không chọn):</label>
        <input
          type="file"
          id="updateHinhAnh"
          ref="updateFileInput"
          @change="handleUpdateFileChange"
          accept="image/*"
        />
      </div>
      <button v-if="selectedBookId" type="submit" class="submit-btn">Cập nhật sách</button>
      <p v-if="updateError" class="error">{{ updateError }}</p>
      <p v-if="updateSuccess" class="success">{{ updateSuccess }}</p>
    </form>

    <!-- Form Xóa Sách -->
    <form class="delete-book-form">
      <div class="form-group">
        <label for="deleteBook">Chọn sách để xóa:</label>
        <select
          id="deleteBook"
          v-model="deleteBookId"
          @change="showDeleteConfirmation = false"
          required
        >
          <option value="">-- Chọn sách --</option>
          <option v-for="book in books" :key="book._id" :value="book._id">
            {{ book.tenSach }}
          </option>
        </select>
      </div>
      <div v-if="deleteBookId && !showDeleteConfirmation" class="form-group">
        <button type="button" class="delete-btn" @click="showDeleteConfirmation = true">
          Xóa sách
        </button>
      </div>
      <p v-if="deleteError" class="error">{{ deleteError }}</p>
      <p v-if="deleteSuccess" class="success">{{ deleteSuccess }}</p>
    </form>

    <!-- Modal Xác nhận Xóa -->
    <div v-if="showDeleteConfirmation" class="modal-overlay">
      <div class="modal">
        <p>Bạn có chắc chắn muốn xóa sách này?</p>
        <div class="modal-buttons">
          <button class="confirm-btn" @click="confirmDeleteBook">Xác nhận</button>
          <button class="cancel-btn" @click="cancelDelete">Hủy</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import axios from "axios";

export default {
  setup() {
    // Form Thêm Sách
    const form = ref({
      tenSach: "",
      donGia: null,
      soQuyen: null,
      nguonGocTacGia: "",
      nhaXuatBan: "",
    });
    const file = ref(null);
    const fileInput = ref(null);
    const error = ref("");
    const success = ref("");

    // Form Cập Nhật Sách
    const books = ref([]);
    const selectedBookId = ref("");
    const updateForm = ref({
      tenSach: "",
      donGia: null,
      soQuyen: null,
      nguonGocTacGia: "",
      nhaXuatBan: "",
    });
    const updateFile = ref(null);
    const updateFileInput = ref(null);
    const updateError = ref("");
    const updateSuccess = ref("");

    // Form Xóa Sách
    const deleteBookId = ref("");
    const showDeleteConfirmation = ref(false);
    const deleteError = ref("");
    const deleteSuccess = ref("");

    // Hàm làm mới dữ liệu sách
    const fetchBooks = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/books");
        books.value = response.data;
      } catch (err) {
        console.error("Error fetching books:", err);
      }
    };

    // Lấy danh sách sách khi component được mounted
    onMounted(() => {
      fetchBooks();
    });

    const handleFileChange = (event) => {
      file.value = event.target.files[0];
    };

    const handleUpdateFileChange = (event) => {
      updateFile.value = event.target.files[0];
    };

    const submitBook = async () => {
      try {
        error.value = "";
        success.value = "";

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Bạn cần đăng nhập để thêm sách!");
        }

        const bookResponse = await axios.post(
          "http://localhost:3000/api/books",
          form.value,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const bookId = bookResponse.data.book._id;
        success.value = bookResponse.data.message;

        if (file.value) {
          const formData = new FormData();
          formData.append("hinhAnh", file.value, "book_cover.png");

          const uploadResponse = await axios.post(
            `http://localhost:3000/api/books/${bookId}/upload`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          success.value += " | " + uploadResponse.data.message;
        }

        form.value = {
          tenSach: "",
          donGia: null,
          soQuyen: null,
          nguonGocTacGia: "",
          nhaXuatBan: "",
        };
        file.value = null;
        if (fileInput.value) fileInput.value.value = "";

        await fetchBooks();
      } catch (err) {
        error.value = err.response?.data?.error || err.message || "Lỗi không xác định";
        console.error("Error adding book:", err);
      }
    };

    const updateBook = async () => {
      try {
        updateError.value = "";
        updateSuccess.value = "";

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Bạn cần đăng nhập để cập nhật sách!");
        }

        const updateResponse = await axios.put(
          `http://localhost:3000/api/books/${selectedBookId.value}`,
          updateForm.value,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        updateSuccess.value = updateResponse.data.message;

        if (updateFile.value) {
          const formData = new FormData();
          formData.append("hinhAnh", updateFile.value, "book_cover.png");

          const uploadResponse = await axios.post(
            `http://localhost:3000/api/books/${selectedBookId.value}/upload`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          updateSuccess.value += " | " + uploadResponse.data.message;
        }

        updateForm.value = {
          tenSach: "",
          donGia: null,
          soQuyen: null,
          nguonGocTacGia: "",
          nhaXuatBan: "",
        };
        updateFile.value = null;
        if (updateFileInput.value) updateFileInput.value.value = "";
        selectedBookId.value = "";

        await fetchBooks();
      } catch (err) {
        updateError.value = err.response?.data?.error || err.message || "Lỗi không xác định";
        console.error("Error updating book:", err);
      }
    };

    const loadBookDetails = () => {
      if (!selectedBookId.value) {
        updateForm.value = {
          tenSach: "",
          donGia: null,
          soQuyen: null,
          nguonGocTacGia: "",
          nhaXuatBan: "",
        };
        return;
      }

      const selectedBook = books.value.find((book) => book._id === selectedBookId.value);
      if (selectedBook) {
        updateForm.value = {
          tenSach: selectedBook.tenSach || "",
          donGia: selectedBook.donGia || null,
          soQuyen: selectedBook.soQuyen || null,
          nguonGocTacGia: selectedBook.nguonGocTacGia || "",
          nhaXuatBan: selectedBook.nhaXuatBan || "",
        };
      }
    };

    const confirmDeleteBook = async () => {
      try {
        deleteError.value = "";
        deleteSuccess.value = "";

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Bạn cần đăng nhập để xóa sách!");
        }

        const response = await axios.delete(
          `http://localhost:3000/api/books/${deleteBookId.value}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        deleteSuccess.value = response.data.message;
        deleteBookId.value = "";
        showDeleteConfirmation.value = false;

        await fetchBooks();
      } catch (err) {
        deleteError.value = err.response?.data?.error || err.message || "Lỗi không xác định";
        console.error("Error deleting book:", err);
      }
    };

    const cancelDelete = () => {
      showDeleteConfirmation.value = false;
      deleteBookId.value = "";
      deleteError.value = "";
      deleteSuccess.value = "";
    };

    return {
      form,
      file,
      fileInput,
      error,
      success,
      submitBook,
      handleFileChange,
      books,
      selectedBookId,
      updateForm,
      updateFile,
      updateFileInput,
      updateError,
      updateSuccess,
      loadBookDetails,
      updateBook,
      handleUpdateFileChange,
      deleteBookId,
      showDeleteConfirmation,
      deleteError,
      deleteSuccess,
      confirmDeleteBook,
      cancelDelete,
    };
  },
};
</script>

<style scoped>
.add-book-form,
.update-book-form,
.delete-book-form {
  max-width: 500px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f9f9f9;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.submit-btn,
.delete-btn {
  background-color: #333;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
}

.submit-btn:hover,
.delete-btn:hover {
  background-color: #555;
}

.delete-btn {
  background-color: #dc3545;
}

.delete-btn:hover {
  background-color: #c82333;
}

.error {
  color: red;
  margin-top: 10px;
}

.success {
  color: green;
  margin-top: 10px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8); /* Làm mờ nền 80% */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* Đảm bảo modal ở trên cùng */
}

.modal {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  text-align: center;
  width: 300px;
}

.modal p {
  margin-bottom: 20px;
  font-size: 1.1rem;
}

.modal-buttons {
  display: flex;
  justify-content: space-around;
}

.confirm-btn,
.cancel-btn {
  padding: 8px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.confirm-btn {
  background-color: #28a745;
  color: white;
}

.confirm-btn:hover {
  background-color: #218838;
}

.cancel-btn {
  background-color: #dc3545;
  color: white;
}

.cancel-btn:hover {
  background-color: #c82333;
}
</style>