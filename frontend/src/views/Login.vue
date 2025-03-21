<template>
    <div>
        <h2>Đăng nhập</h2>
        <form @submit.prevent="login">
            <input type="text" v-model="username" placeholder="Tên người dùng" required />
            <input type="password" v-model="password" placeholder="Mật khẩu" required />
            <button type="submit">Đăng nhập</button>
        </form>
    </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";

export default {
    setup() {
        const username = ref("");
        const password = ref("");
        const router = useRouter();

        const login = async () => {
            try {
                // Gọi API để đăng nhập (thực tế cần gửi dữ liệu tới backend để xác thực)
                const response = await fetch("http://localhost:3000/api/auth/login", {  // Đảm bảo URL đúng
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username: username.value, password: password.value }),
                });

                if (response.ok) {
                    const data = await response.json();
                    // Lưu token vào localStorage
                    localStorage.setItem("token", data.token);
                    router.push("/"); // Điều hướng về trang chủ sau khi đăng nhập thành công
                } else {
                    alert("Đăng nhập thất bại");
                }
            } catch (error) {
                console.error("Lỗi khi đăng nhập:", error);
            }
        };


        return { username, password, login };
    },
};
</script>
