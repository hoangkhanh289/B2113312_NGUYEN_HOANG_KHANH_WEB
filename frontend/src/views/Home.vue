<template>
    <div class="book-container">
        <div v-for="book in books" :key="book.id" class="book-card">
            <img :src="book.hinhAnh" alt="Book Image" />
            <h3>{{ book.tenSach }}</h3>
            <p>{{ book.donGia }} VNĐ</p>
            <p>Số lượng: {{ book.soQuyen }}</p>
            <button v-if="isLoggedIn" @click="borrowBook(book)">Mượn sách</button>
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from "vue";
import bookApi from "@/api/bookApi";

export default {
    setup() {
        const books = ref([]);
        const isLoggedIn = ref(localStorage.getItem("token") !== null);

        onMounted(async () => {
            books.value = await bookApi.getAllBooks();
        });

        const borrowBook = (book) => {
            console.log("Mượn sách:", book);
        };

        return { books, isLoggedIn, borrowBook };
    },
};
</script>

<style>
.book-container {
    display: flex;
    flex-wrap: wrap;
}

.book-card {
    width: 200px;
    padding: 10px;
    border: 1px solid gray;
    margin: 10px;
}
</style>
