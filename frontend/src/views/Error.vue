<template>
  <div class="error-page">
    <h1>404 - Không tìm thấy trang</h1>
    <p>Rất tiếc, trang bạn truy cập không tồn tại.</p>
    <router-link to="/" class="back-link">Quay lại trang chủ</router-link>
  </div>
</template>

<script>
export default {
  name: "ErrorPage",
};
</script>

<style scoped>
.error-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  background-color: #f5f5f5;
}

h1 {
  color: #d32f2f;
  font-size: 2.5rem;
  margin-bottom: 10px;
}

p {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 20px;
}

.back-link {
  display: inline-block;
  padding: 10px 20px;
  background-color: #333;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.back-link:hover {
  background-color: #555;
}
</style>