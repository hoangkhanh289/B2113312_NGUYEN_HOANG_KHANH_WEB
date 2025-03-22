<template>
  <div class="login-container">
    <form @submit.prevent="login" class="login-form">
      <div class="input-group">
        <input
          type="text"
          v-model="maDocGia"
          placeholder="Mã nhân viên hoặc mã độc giả"
          required
          class="input-field"
        />
      </div>
      <div class="input-group">
        <input
          type="password"
          v-model="password"
          placeholder="Mật khẩu"
          required
          class="input-field"
        />
      </div>
      <button type="submit" class="login-button">Đăng nhập</button>
    </form>
  </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";

export default {
  setup(props, { emit }) {
    const maDocGia = ref("");
    const password = ref("");
    const router = useRouter();

    const login = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: maDocGia.value, password: password.value }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("token", data.token);
          emit("logged-in");
          router.push("/");
        } else {
          const errorData = await response.json();
          alert("Đăng nhập thất bại: " + errorData.message);
        }
      } catch (error) {
        console.error("Lỗi khi đăng nhập:", error);
        alert("Lỗi khi đăng nhập: " + error.message);
      }
    };

    return { maDocGia, password, login };
  },
};
</script>

<style scoped>
/* Giữ nguyên style */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f0f0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.input-group {
  display: flex;
  flex-direction: column;
}

.input-field {
  width: 100%;
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
}

.login-button {
  padding: 10px;
  font-size: 1rem;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.login-button:hover {
  background-color: #555;
}
</style>