<template>
  <div>
    <!-- Navbar -->
    <nav class="navbar">
      <div class="nav-center">
        <h1>{{ currentPageTitle }}</h1>
      </div>
      <div class="nav-right">
        <div class="menu-toggle" @click="toggleMenu" v-if="isLoggedIn">
          <span class="hamburger">☰</span>
        </div>
        <div v-if="isMenuOpen" class="dropdown-menu" ref="dropdownMenu">
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
    </nav>

    <router-view @logged-in="checkAuthState" />
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { jwtDecode } from "jwt-decode";

export default {
  setup() {
    const isLoggedIn = ref(localStorage.getItem("token") !== null);
    const isMenuOpen = ref(false);
    const role = ref(null);
    const router = useRouter();
    const route = useRoute();
    const dropdownMenu = ref(null);

    const currentPageTitle = computed(() => {
      switch (route.path) {
        case "/":
          return "Home";
        case "/loan":
          return role.value === "admin" ? "Duyệt Mượn Sách" : "Mượn Sách";
        case "/user":
          return "User";
        case "/admin":
          return "Admin";
        case "/manage-user":
          return "Quản Lý User";
        case "/manage-book":
          return "Quản Lý Sách";
        case "/manage-admin-user":
          return "Quản Lý Admin & User";
        case "/login":
          return "Đăng Nhập";
        default:
          return "Quản Lý Mượn Sách"; // Tiêu đề mặc định
      }
    });

    const updateAuthState = (token) => {
      isLoggedIn.value = token !== null;
      if (token) {
        try {
          const decoded = jwtDecode(token);
          role.value = decoded.role;
          console.log("Updated role:", role.value);
        } catch (err) {
          console.error("Invalid token:", err);
          localStorage.removeItem("token");
          isLoggedIn.value = false;
          role.value = null;
        }
      } else {
        role.value = null;
      }
    };

    const checkAuthState = () => {
      const token = localStorage.getItem("token");
      updateAuthState(token);
      if (token && route.path === "/") {
        isMenuOpen.value = false;
      }
    };

    onMounted(() => {
      checkAuthState();
      document.addEventListener("click", closeMenuOnOutsideClick);
      window.addEventListener("storage", checkAuthState);
    });

    onUnmounted(() => {
      document.removeEventListener("click", closeMenuOnOutsideClick);
      window.removeEventListener("storage", checkAuthState);
    });

    const toggleMenu = () => {
      isMenuOpen.value = !isMenuOpen.value;
    };

    const closeMenuOnOutsideClick = (event) => {
      if (
        isMenuOpen.value &&
        dropdownMenu.value &&
        !dropdownMenu.value.contains(event.target) &&
        !event.target.closest(".menu-toggle")
      ) {
        isMenuOpen.value = false;
      }
    };

    const selectCategory = (category) => {
      isMenuOpen.value = false;
      switch (category) {
        case "Home":
          router.push("/");
          break;
        case "Mượn sách":
          if (role.value === "user" || role.value === "admin") router.push("/loan");
          break;
        case "User":
          if (role.value === "user") router.push("/user");
          break;
        case "Duyệt Mượn sách":
          if (role.value === "admin") router.push("/loan");
          break;
        case "Admin":
          if (role.value === "admin") router.push("/admin");
          break;
        case "Quản lý User":
          if (role.value === "admin") router.push("/manage-user");
          break;
        case "Quản lý Sách":
          if (role.value === "admin" || role.value === "boss") router.push("/manage-book");
          break;
        case "Quản lý Admin&User":
          if (role.value === "boss") router.push("/manage-admin-user");
          break;
        case "Đăng xuất":
          logout();
          break;
        default:
          console.warn("Unknown category:", category);
          router.push("/login");
      }
    };

    const logout = () => {
      localStorage.removeItem("token");
      isLoggedIn.value = false;
      role.value = null;
      router.push("/login");
    };

    return {
      isLoggedIn,
      isMenuOpen,
      role,
      toggleMenu,
      selectCategory,
      logout,
      dropdownMenu,
      checkAuthState,
      currentPageTitle,
    };
  },
};
</script>

<style scoped>
/* Giữ nguyên style */
.navbar {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 20px;
  background-color: #333;
  color: white;
  position: relative;
}

.nav-center {
  flex-grow: 1;
  text-align: center;
}

.nav-center h1 {
  margin: 0;
  font-size: 5rem;
}

.nav-right {
  position: relative;
}

.menu-toggle {
  position: fixed;
  bottom: 20px;
  right: 20px;
  cursor: pointer;
  font-size: 1.5rem;
  padding: 10px;
  background-color: #444;
  border-radius: 50%;
  z-index: 1001;
}

.hamburger {
  color: white;
}

.dropdown-menu {
  position: fixed;
  bottom: 60px;
  right: 20px;
  background-color: #444;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.dropdown-menu ul {
  list-style: none;
  margin: 0;
  padding: 10px;
}

.dropdown-menu li {
  padding: 8px 15px;
  color: white;
  cursor: pointer;
}

.dropdown-menu li:hover {
  background-color: #555;
}

.nav-right a {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 10px;
  text-decoration: none;
}

.nav-right a:hover {
  color: #ddd;
}
</style>