<template>
  <div>
    <h1>Quản Lý Sách</h1>
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
  </div>
</template>

<script>
import { ref } from "vue";
import axios from "axios";

export default {
  setup() {
    const form = ref({
      tenSach: "",
      donGia: null,
      soQuyen: null,
      nguonGocTacGia: "",
      nhaXuatBan: "",
    });
    const file = ref(null);
    const fileInput = ref(null); // Thêm ref cho input file
    const error = ref("");
    const success = ref("");

    const handleFileChange = (event) => {
      file.value = event.target.files[0];
    };

    const submitBook = async () => {
      try {
        error.value = "";
        success.value = "";

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Bạn cần đăng nhập để thêm sách!");
        }

        // Bước 1: Tạo sách mới
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

        // Bước 2: Upload ảnh nếu có file
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

        // Reset form
        form.value = {
          tenSach: "",
          donGia: null,
          soQuyen: null,
          nguonGocTacGia: "",
          nhaXuatBan: "",
        };
        file.value = null;
        if (fileInput.value) fileInput.value.value = ""; // Reset input file
      } catch (err) {
        error.value = err.response?.data?.error || err.message || "Lỗi không xác định";
        console.error("Error adding book:", err);
      }
    };

    return { form, file, fileInput, error, success, submitBook, handleFileChange };
  },
};
</script>

<style scoped>
.add-book-form {
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

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.submit-btn {
  background-color: #333;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
}

.submit-btn:hover {
  background-color: #555;
}

.error {
  color: red;
  margin-top: 10px;
}

.success {
  color: green;
  margin-top: 10px;
}
</style>