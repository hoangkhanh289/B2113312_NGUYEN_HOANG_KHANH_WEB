<template>
  <div class="book-list" :class="{ 'locked': activeBook !== null }">
    <div class="header">
      <div class="search-form">
        <form @submit.prevent="searchBooks" class="search-form-container">
          <div class="form-group">
            <input
              type="text"
              id="tenSach"
              v-model="search.tenSach"
              placeholder="Nhập tên sách"
            />
          </div>
          <div class="form-group">
            <input
              type="text"
              id="tacGia"
              v-model="search.tacGia"
              placeholder="Nhập tác giả"
            />
          </div>
          <div class="form-group">
            <input
              type="text"
              id="nguonGocTacGia"
              v-model="search.nguonGocTacGia"
              placeholder="Nhập nguồn gốc tác giả"
            />
          </div>
          <button type="submit" class="search-btn">Tìm kiếm</button>
        </form>
      </div>
    </div>

    <div v-if="filteredBooks.length === 0" class="no-books">Không có sách nào để hiển thị</div>
    <div v-else class="book-cards">
      <div
        v-for="book in filteredBooks"
        :key="book._id"
        class="book-card"
        @click="handleClick(book._id)"
        @touchstart="startHold(book._id)"
        @touchend="endHold"
        @touchcancel="endHold"
        :class="{ 'active': activeBook === book._id }"
      >
        <div class="book-image">
          <img
            :src="getImageUrl(book.image)"
            :alt="'Ảnh bìa sách: ' + book.tenSach"
            @error="handleImageError"
          />
        </div>
        <div class="book-info">
          <div class="book-details">
            <span class="book-title">{{ book.tenSach }}</span>
            <span class="book-author">{{ book.tacGia }}</span>
            <span class="book-origin">{{ book.nguonGocTacGia }}</span>
          </div>
          <div class="price-container">
            <span class="price">{{ formatPrice(book.donGia) }} VNĐ</span>
            <span class="quantity">Còn {{ book.soQuyen }} quyển</span>
          </div>
          <div v-if="activeBook === book._id" class="button-group">
            <button class="borrow-btn" @click="registerBorrow(book._id)">
              Đăng ký mượn
            </button>
            <button class="cancel-btn" @click="cancelAction(book._id)">
              Hủy phí
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

export default {
  setup() {
    const books = ref([]);
    const filteredBooks = ref([]);
    const router = useRouter();
    const role = ref(null);
    const search = ref({
      tenSach: "",
      tacGia: "",
      nguonGocTacGia: "",
      nhaXuatBan: "",
    });
    const activeBook = ref(null);
    let lastClickTime = null;
    let holdTimer = null;

    const getUserRole = () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          role.value = decoded.role;
          console.log("Role:", role.value);
        } catch (error) {
          console.error("Error decoding token:", error);
          role.value = null;
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
    };

    const fetchBooks = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:3000/api/books", {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        books.value = response.data.map((book) => ({
          ...book,
          image: `/Static/book/${book._id}/book_cover.png`,
        }));
        filteredBooks.value = books.value;
        console.log("Danh sách sách từ API:", books.value);
      } catch (error) {
        console.error("Lỗi khi lấy sách:", error);
        books.value = [];
        filteredBooks.value = [];
      }
    };

    const searchBooks = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:3000/api/books", {
          params: {
            tenSach: search.value.tenSach || undefined,
            tacGia: search.value.tacGia || undefined,
            nguonGocTacGia: search.value.nguonGocTacGia || undefined,
            nhaXuatBan: search.value.nhaXuatBan || undefined,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        filteredBooks.value = response.data.map((book) => ({
          ...book,
          image: `/Static/book/${book._id}/book_cover.png`,
        }));
      } catch (error) {
        console.error("Lỗi khi tìm kiếm sách:", error);
        filteredBooks.value = [];
      }
    };

    const getImageUrl = (imagePath) => {
      const baseUrl = "http://localhost:3000";
      return `${baseUrl}${imagePath}`;
    };

    const handleImageError = (event) => {
      const baseUrl = "http://localhost:3000";
      const fallbackUrl = `${baseUrl}/Static/book/404/404.png`;
      if (event.target.src !== fallbackUrl) {
        event.target.src = fallbackUrl;
      }
    };

    const formatPrice = (price) => {
      return new Intl.NumberFormat("vi-VN").format(price);
    };

    // Xử lý nhấp chuột liên tiếp trong 0.5 giây (dành cho máy tính)
    const handleClick = (bookId) => {
      const currentTime = new Date().getTime();
      if (lastClickTime && currentTime - lastClickTime <= 500) {
        activeBook.value = bookId;
      }
      lastClickTime = currentTime;
    };

    // Xử lý nhấn giữ 1 giây (dành cho điện thoại)
    const startHold = (bookId) => {
      holdTimer = setTimeout(() => {
        activeBook.value = bookId;
      }, 1000); // 1 giây
    };

    const endHold = () => {
      clearTimeout(holdTimer);
    };

    const registerBorrow = (bookId) => {
      console.log(`Đăng ký mượn sách với ID: ${bookId}`);
      activeBook.value = null; // Reset trạng thái
    };

    const cancelAction = (bookId) => {
      console.log(`Hủy phí sách với ID: ${bookId}`);
      activeBook.value = null; // Reset trạng thái
    };

    onMounted(() => {
      getUserRole();
      fetchBooks();
    });

    onUnmounted(() => {
      clearTimeout(holdTimer);
    });

    return {
      books,
      filteredBooks,
      getImageUrl,
      handleImageError,
      formatPrice,
      search,
      searchBooks,
      role,
      activeBook,
      handleClick,
      startHold,
      endHold,
      registerBorrow,
      cancelAction,
    };
  },
};
</script>
<style scoped>
.book-list {
  font-family: "Arial", sans-serif;
  padding: 20px;
  background-color: #e0e0e0;
  min-height: 100vh;
  position: relative;
}

.book-list.locked {
  pointer-events: none; /* Khóa mọi thao tác khi activeBook không null */
}

.book-list.locked .book-card.active {
  pointer-events: auto; /* Chỉ cho phép thao tác trên book-card đang active */
}

.header {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

.search-form {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 1200px;
}

.search-form-container {
  display: flex;
  align-items: flex-end;
  gap: 15px;
}

.form-group {
  flex: 1;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.search-btn {
  background-color: #333;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  height: 36px;
}

.search-btn:hover {
  background-color: #555;
}

.no-books {
  text-align: center;
  color: #888;
}

.book-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  width: 100%;
  justify-content: center;
}

.book-card {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  width: 300px;
  height: 400px;
  position: relative;
}

.book-card.active {
  transform: scale(1.1);
}

/* Chỉ áp dụng hover khi không có class locked */
.book-list:not(.locked) .book-card:hover {
  transform: translateY(-5px);
}
.book-image {
  width: 100%;
  height: 300px;
  overflow: hidden;
}

.book-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-bottom: 1px solid #ddd;
}

.book-info {
  padding: 15px;
  text-align: left;
  height: calc(100% - 300px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}

.book-details {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
}

.book-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
}

.book-author {
  font-size: 1rem;
  color: #555;
}

.book-origin {
  font-size: 1rem;
  color: #555;
}

.price-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
}

.price {
  font-size: 1.3rem;
  font-weight: bold;
  color: #e74c3c;
  margin-bottom: 20px;
}

.quantity {
  font-size: 1rem;
  color: #555;
  margin-left: 10px;
  margin-bottom: 20px;
}

.button-group {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.borrow-btn {
  background-color: #28a745;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.borrow-btn:hover {
  background-color: #218838;
}

.cancel-btn {
  background-color: #dc3545;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 200px;
}

.cancel-btn:hover {
  background-color: #c82333;
}
</style>