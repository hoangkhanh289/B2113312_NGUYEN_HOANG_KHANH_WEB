<template>
    <div>
        <nav class="navbar">
            <div class="nav-left">
                <button @click="filterBooks('all')">Tất cả</button>
                <button @click="filterBooks('fiction')">Tiểu thuyết</button>
                <button @click="filterBooks('science')">Khoa học</button>
            </div>
            <div class="nav-right">
                <router-link to="/login" v-if="!isLoggedIn">Đăng nhập</router-link>
                <button @click="logout" v-else>Đăng xuất</button>
            </div>
        </nav>

        <router-view />
    </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";

export default {
    setup() {
        const isLoggedIn = ref(localStorage.getItem("token") !== null);
        const router = useRouter();

        const logout = () => {
            localStorage.removeItem("token");
            isLoggedIn.value = false;
            router.push("/login");
        };

        const filterBooks = (category) => {
            console.log("Lọc sách theo:", category);
        };

        return { isLoggedIn, logout, filterBooks };
    },
};
</script>

