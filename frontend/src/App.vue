<template>
    <div>
        <!-- Navbar -->
        <nav class="navbar">
            <div class="nav-left">
                <button @click="filterBooks('all')">Tất cả</button>
                <button @click="filterBooks('fiction')">Tiểu thuyết</button>
                <button @click="filterBooks('science')">Khoa học</button>
            </div>
            <div class="nav-right">
                <!-- Đăng nhập/Đăng xuất -->
                <router-link to="/login" v-if="!isLoggedIn">Đăng nhập</router-link>
                <button @click="logout" v-else>Đăng xuất</button>
            </div>
        </nav>

        <!-- Hiển thị các trang khác -->
        <router-view />
    </div>
</template>

<script>
import { ref } from "vue"; // Giữ import này
import { useRouter } from "vue-router";

export default {
    setup() {
        const isLoggedIn = ref(localStorage.getItem("token") !== null); // Kiểm tra trạng thái đăng nhập
        const router = useRouter();

        // Đăng xuất
        const logout = () => {
            localStorage.removeItem("token");
            isLoggedIn.value = false;
            router.push("/login"); // Điều hướng về trang đăng nhập
        };

        // Lọc sách theo thể loại
        const filterBooks = (category) => {
            console.log("Lọc sách theo thể loại:", category);
            // Gọi API hoặc thao tác lọc sách ở đây
        };

        return { isLoggedIn, logout, filterBooks };
    },
};
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background-color: #333;
  color: white;
}

.nav-left button,
.nav-right button,
.nav-right a {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 10px;
}

.nav-right a {
  text-decoration: none;
}
</style>
