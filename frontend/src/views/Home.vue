<template>
  <div class="book-list">
    <div class="header">
      <h1>Danh Sách Sách</h1>
      <div class="menu-toggle" @click="toggleMenu" v-if="role">
        <span class="hamburger">☰</span>
      </div>
      <div v-if="isMenuOpen" class="dropdown-menu">
        <ul v-if="role === 'user'">
          <li @click="selectCategory('Home')">Home</li>
          <li @click="selectCategory('Mượn sách')">Mượn sách</li>
          <li @click="selectCategory('User')">User</li>
          <li @click="selectCategory('Đăng xuất')">Đăng xuất</li>
        </ul>
        <ul v-if="role === 'admin'">
          <li @click="selectCategory('Home')">Home</li>
          <li @click="selectCategory('Duyệt Mượn sách')">Duyệt Mượn sách</li>
          <li @click="selectCategory('Admin')">Admin</li>
          <li @click="selectCategory('Quản lý User')">Quản lý User</li>
          <li @click="selectCategory('Quản lý Sách')">Quản lý Sách</li>
          <li @click="selectCategory('Đăng xuất')">Đăng xuất</li>
        </ul>
        <ul v-if="role === 'boss'">
          <li @click="selectCategory('Home')">Home</li>
          <li @click="selectCategory('Quản lý Admin&User')">Quản lý Admin&User</li>
          <li @click="selectCategory('Quản lý Sách')">Quản lý Sách</li>
          <li @click="selectCategory('Đăng xuất')">Đăng xuất</li>
        </ul>
      </div>
    </div>

    <div v-if="books.length === 0" class="no-books">Không có sách nào để hiển thị</div>
    <div v-else class="book-cards">
      <div v-for="book in filteredBooks" :key="book._id" class="book-card">
        <div class="book-image">
          <img
            :src="getImageUrl(book.image)"
            :alt="'Ảnh bìa sách: ' + book.tenSach"
            @error="handleImageError"
          />
        </div>
        <div class="book-info">
          <h3>{{ book.tenSach }}</h3>
          <p class="price">{{ formatPrice(book.donGia) }} VNĐ</p>
          <p>{{ book.soQuyen }} Quyển</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { jwtDecode } from "jwt-decode"; // Sửa thành named import

export default {
  setup() {
    const books = ref([]);
    const filteredBooks = ref([]);
    const isMenuOpen = ref(false);
    const selectedCategory = ref("Tất cả");
    const router = useRouter();
    const role = ref(null);

    const getUserRole = () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode(token); // Giữ nguyên cách gọi hàm
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
        const response = await fetch("http://localhost:3000/api/books", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token && { "Authorization": `Bearer ${token}` }),
          },
        });

        if (!response.ok) {
          throw new Error(`Lỗi HTTP! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Danh sách sách từ API:", data);
        books.value = data.map(book => ({
          ...book,
          image: `/Static/book/${book._id}/book_cover.png`,
          category: book.category || "Tất cả",
        }));
        filterBooks();
      } catch (error) {
        console.error("Lỗi khi lấy sách:", error);
        books.value = [];
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

    const toggleMenu = () => {
      isMenuOpen.value = !isMenuOpen.value;
    };

    const selectCategory = (category) => {
      selectedCategory.value = category;
      isMenuOpen.value = false;

      switch (category) {
        case "Home":
          router.push("/");
          break;
        case "Mượn sách":
          router.push("/loan");
          break;
        case "User":
          router.push("/user");
          break;
        case "Duyệt Mượn sách":
          router.push("/loan");
          break;
        case "Admin":
          router.push("/admin");
          break;
        case "Quản lý User":
          router.push("/manage-user");
          break;
        case "Quản lý Sách":
          router.push("/manage-book");
          break;
        case "Quản lý Admin&User":
          router.push("/manage-admin-user");
          break;
        case "Đăng xuất":
          localStorage.removeItem("token");
          router.push("/login");
          break;
        default:
          filterBooks();
          break;
      }
    };

    const filterBooks = () => {
      if (selectedCategory.value === "Tất cả") {
        filteredBooks.value = books.value;
      } else {
        filteredBooks.value = books.value.filter(
          book => book.category === selectedCategory.value
        );
      }
    };

    onMounted(() => {
      getUserRole();
      fetchBooks();
    });

    return {
      books,
      filteredBooks,
      getImageUrl,
      handleImageError,
      formatPrice,
      isMenuOpen,
      toggleMenu,
      selectCategory,
      role,
    };
  },
};
</script>

<style scoped>
/* Giữ nguyên style của bạn */
.book-list {
  font-family: "Arial", sans-serif;
  padding: 20px;
  background-color: #f9f9f9;
}

.header {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

h1 {
  text-align: center;
  color: #333;
}

.menu-toggle {
  position: absolute;
  right: 20px;
  cursor: pointer;
  font-size: 24px;
}

.hamburger {
  color: #333;
}

.dropdown-menu {
  position: absolute;
  top: 40px;
  right: 20px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.dropdown-menu ul {
  list-style: none;
  margin: 0;
  padding: 10px 0;
}

.dropdown-menu li {
  padding: 10px 20px;
  cursor: pointer;
  color: #333;
}

.dropdown-menu li:hover {
  background-color: #f0f0f0;
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

.book-image {
  width: 100%;
  height: 200px;
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