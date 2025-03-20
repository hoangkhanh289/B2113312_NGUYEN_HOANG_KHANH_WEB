<script setup>
import { ref, onMounted } from "vue";
import { api } from "../api"; // Import API

const books = ref([]);

onMounted(async () => {
  try {
    const response = await api.get("/api/books"); // Gọi API backend
    books.value = response.data; // Lưu dữ liệu vào biến books
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sách:", error);
  }
});
</script>

<template>
  <div>
    <h1>Danh sách sách</h1>
    <ul>
      <li v-for="book in books" :key="book.id">{{ book.title }}</li>
    </ul>
  </div>
</template>
