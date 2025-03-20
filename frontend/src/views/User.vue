<template>
    <div>
        <h1>Trang Người Dùng</h1>
        <button @click="fetchBooks">Xem Sách</button>
        <ul>
            <li v-for="book in books" :key="book._id">{{ book.title }}</li>
        </ul>
    </div>
</template>

<script>
import bookApi from "../api/bookApi";

export default {
    data() {
        return {
            books: [],
        };
    },
    methods: {
        async fetchBooks() {
            const response = await bookApi.getAll();
            this.books = response.data;
        },
    },
};
</script>
