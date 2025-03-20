<template>
  <div class="book-list">
    <h1>Danh Sách Sách</h1>

    <!-- Kiểm tra xem có sách nào không -->
    <div v-if="books.length === 0" class="no-books">Không có sách nào để hiển thị</div>

    <!-- Nếu có sách, hiển thị danh sách -->
    <div v-else class="book-cards">
      <div v-for="book in books" :key="book._id" class="book-card">
        <div v-if="book.imagePath" class="book-image">
          <img :src="'http://localhost:3000' + book.imagePath" alt="Ảnh bìa sách" />
        </div>
        <div class="book-info">
          <h3>{{ book.tenSach }}</h3>
          <p class="price">{{ book.donGia }} VNĐ</p>
          <p>{{ book.soQuyen }} Quyển</p>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import { ref, onMounted } from "vue";

export default {
  setup() {
    const books = ref([]);

    // Lấy danh sách sách từ API
    const fetchBooks = async () => {
        try {
            const response = await fetch("http://localhost:3000/api/books");
            const text = await response.text(); // Lấy dữ liệu dưới dạng text
            console.log(text); // In ra phản hồi từ API
            const data = JSON.parse(text); // Chuyển đổi text thành JSON
            books.value = data;
        } catch (error) {
            console.error("Lỗi khi lấy sách:", error);
        }
    };


    // Gọi API khi component đã được mounted
    onMounted(() => {
      fetchBooks();
    });

    return { books };
  },
};
</script>
<style scoped>
.book-list {
  font-family: 'Arial', sans-serif;
  padding: 20px;
  background-color: #f9f9f9;
}

h1 {
  text-align: center;
  color: #333;
}

.no-books {
  text-align: center;
  color: #888;
}

.book-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.book-card {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.book-card:hover {
  transform: translateY(-5px);
}

.book-image img {
  width: 100%;
  height: auto;
  object-fit: cover;
  border-bottom: 1px solid #ddd;
}

.book-info {
  padding: 15px;
  text-align: center;
}

.book-info h3 {
  font-size: 1.2rem;
  margin-bottom: 10px;
  color: #333;
}

.book-info .price {
  font-size: 1.1rem;
  color: #e74c3c;
  margin-bottom: 10px;
}

.book-info p {
  color: #555;
}
</style>
