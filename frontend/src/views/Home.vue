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
            <button class="borrow-card-btn" @click.stop="showBorrowForm(book)">
              Đăng ký mượn
            </button>
            <button class="cancel-card-btn" @click.stop="cancelAction(book._id)">
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Form đăng ký mượn sách -->
    <div v-if="isBorrowFormVisible" class="borrow-form-overlay">
      <div class="borrow-form">
        <h3>Đăng ký mượn sách: {{ selectedBook.tenSach }}</h3>
        <form @submit.prevent="submitBorrow">
          <div class="form-group">
            <label>Tên sách:</label>
            <input :value="selectedBook.tenSach" disabled />
          </div>
          <div class="form-group">
            <label>Ngày mượn:</label>
            <input type="date" v-model="borrowForm.ngayMuon" :min="today" required />
          </div>
          <div class="form-group">
            <label>Ngày trả:</label>
            <input
              type="date"
              v-model="borrowForm.ngayTra"
              :min="borrowForm.ngayMuon"
              :max="maxReturnDate"
              required
            />
          </div>
          <div class="form-group">
            <label>Số lượng (tối đa {{ selectedBook.soQuyen }}):</label>
            <input
              type="number"
              v-model.number="borrowForm.soLuong"
              :max="selectedBook.soQuyen"
              min="1"
              required
            />
          </div>
          <div class="form-buttons">
            <button type="submit" class="submit-form-btn">Đăng ký</button>
            <button type="button" class="cancel-form-btn" @click="isBorrowFormVisible = false">
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from "vue";
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
    const isBorrowFormVisible = ref(false);
    const selectedBook = ref(null);
    const borrowForm = ref({
      ngayMuon: "",
      ngayTra: "",
      soLuong: 1,
    });
    let lastClickTime = null;
    let holdTimer = null;

    const today = new Date().toISOString().split("T")[0];
    const maxReturnDate = computed(() => {
      if (!borrowForm.value.ngayMuon) return "";
      const maxDate = new Date(borrowForm.value.ngayMuon);
      maxDate.setDate(maxDate.getDate() + 30);
      return maxDate.toISOString().split("T")[0];
    });

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

    const handleClick = (bookId) => {
      const currentTime = new Date().getTime();
      if (lastClickTime && currentTime - lastClickTime <= 500) {
        activeBook.value = bookId;
      }
      lastClickTime = currentTime;
    };

    const startHold = (bookId) => {
      holdTimer = setTimeout(() => {
        activeBook.value = bookId;
      }, 1000);
    };

    const endHold = () => {
      clearTimeout(holdTimer);
    };

    const showBorrowForm = (book) => {
      selectedBook.value = book;
      isBorrowFormVisible.value = true;
      activeBook.value = null; // Reset trạng thái activeBook
      borrowForm.value = { ngayMuon: today, ngayTra: "", soLuong: 1 }; // Reset form
    };

    const cancelAction = (bookId) => {
      console.log(`Hủy thao tác với sách ID: ${bookId}`);
      activeBook.value = null;
    };

    const submitBorrow = async () => {
      try {
        const token = localStorage.getItem("token");
        if (selectedBook.value.soQuyen < borrowForm.value.soLuong) {
          throw new Error("Số lượng sách hiện có không đủ để mượn");
        }

        const requestData = {
          bookId: selectedBook.value._id,
          ngayMuon: borrowForm.value.ngayMuon,
          ngayTra: borrowForm.value.ngayTra,
          soLuong: borrowForm.value.soLuong,
        };
        console.log("Request data:", requestData);

        const response = await axios.post(
          "http://localhost:3000/api/loans/borrow",
          requestData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        alert(response.data.message);
        isBorrowFormVisible.value = false;
        fetchBooks();
      } catch (error) {
        console.error("Full error response:", error.response?.data || error);
        const errorMessage = error.response?.data?.message || error.message;
        alert("Lỗi khi đăng ký mượn: " + errorMessage);
      }
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
      router,
      role,
      search,
      activeBook,
      isBorrowFormVisible,
      selectedBook,
      borrowForm,
      today,
      maxReturnDate,
      getImageUrl,
      handleImageError,
      formatPrice,
      searchBooks,
      handleClick,
      startHold,
      endHold,
      showBorrowForm,
      cancelAction,
      submitBorrow,
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
  pointer-events: none;
}

.book-list.locked .book-card.active {
  pointer-events: auto;
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

.borrow-card-btn {
  background-color: #28a745;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.borrow-card-btn:hover {
  background-color: #218838;
}

.cancel-card-btn {
  background-color: #dc3545;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 200px;
}

.cancel-card-btn:hover {
  background-color: #c82333;
}

.borrow-form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.borrow-form {
  background: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.borrow-form .form-group {
  margin-bottom: 15px;
}

.borrow-form label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.borrow-form input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.borrow-form .form-buttons {
  display: flex;
  gap: 10px;
}

.submit-form-btn {
  background-color: #28a745;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-form-btn:hover {
  background-color: #218838;
}

.cancel-form-btn {
  background-color: #dc3545;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-form-btn:hover {
  background-color: #c82333;
}
</style>