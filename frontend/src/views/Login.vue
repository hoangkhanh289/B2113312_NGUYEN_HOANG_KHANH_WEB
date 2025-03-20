<template>
    <div>
        <h2>Đăng nhập</h2>
        <form @submit.prevent="handleLogin">
            <input v-model="username" placeholder="Tài khoản" required />
            <input v-model="password" type="password" placeholder="Mật khẩu" required />
            <button type="submit">Đăng nhập</button>
        </form>
        <p v-if="errorMessage" style="color: red">{{ errorMessage }}</p>
    </div>
</template>

<script>
import { ref } from "vue";
import userApi from "@/api/userApi";
import { useRouter } from "vue-router";

export default {
    setup() {
        const username = ref("");
        const password = ref("");
        const errorMessage = ref("");
        const router = useRouter();

        const handleLogin = async () => {
            try {
                const response = await userApi.login({
                    username: username.value,
                    password: password.value,
                });

                localStorage.setItem("token", response.data.token);
                router.push("/user"); // Chuyển hướng sau khi đăng nhập thành công
            } catch (error) {
                console.error("Lỗi đăng nhập:", error.response?.data || error.message);
                errorMessage.value = error.response?.data?.message || "Đăng nhập thất bại!";
            }
        };

        return { username, password, handleLogin, errorMessage };
    },
};
</script>
