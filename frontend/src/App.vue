<template>
  <div>
    <!-- Navbar -->
    <nav class="navbar">
      <div class="nav-center">
        <h1>Quản Lý Mượn Sách</h1>
      </div>
      <div class="nav-right">
        <router-link to="/login" v-if="!isLoggedIn">Đăng nhập</router-link>
        <button @click="logout" v-else>Đăng xuất</button>
      </div>
    </nav>

    <!-- Hiển thị các trang khác -->
    <router-view />
  </div>
</template>

<script>
import { ref, watch } from "vue";
import { useRouter } from "vue-router";

export default {
  setup() {
    const isLoggedIn = ref(localStorage.getItem("token") !== null);
    const router = useRouter();

    // Theo dõi thay đổi token
    watch(() => localStorage.getItem("token"), (newToken) => {
      isLoggedIn.value = newToken !== null;
    });

    const logout = () => {
      localStorage.removeItem("token");
      isLoggedIn.value = false;
      router.push("/login");
    };

    return { isLoggedIn, logout };
  },
};
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #333;
  color: white;
}

.nav-center {
  flex-grow: 1;
  text-align: center;
}

.nav-center h1 {
  margin: 0;
  font-size: 1.5rem;
}

.nav-right {
  display: flex;
  gap: 10px;
}

.nav-right button,
.nav-right a {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 10px;
  text-decoration: none;
}

.nav-right button:hover,
.nav-right a:hover {
  color: #ddd;
}
</style>