<template>
    <div>
        <h2>Quản lý sách</h2>
        <form @submit.prevent="addBook">
            <input v-model="newBook.tenSach" placeholder="Tên sách" />
            <input v-model="newBook.donGia" type="number" placeholder="Giá mượn" />
            <input v-model="newBook.soQuyen" type="number" placeholder="Số lượng" />
            <input type="file" @change="handleFileUpload" />
            <button type="submit">Thêm sách</button>
        </form>

        <div v-for="book in books" :key="book.id">
            <h3>{{ book.tenSach }}</h3>
            <button @click="deleteBook(book.id)">Xóa</button>
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from "vue";
import bookApi from "@/api/bookApi";

export default {
    setup() {
        const books = ref([]);
        const newBook = ref({ tenSach: "", donGia: 0, soQuyen: 0 });
        const file = ref(null);

        onMounted(async () => {
            books.value = await bookApi.getAllBooks();
        });

        const handleFileUpload = (event) => {
            file.value = event.target.files[0];
        };

        const addBook = async () => {
            const formData = new FormData();
            formData.append("tenSach", newBook.value.tenSach);
            formData.append("donGia", newBook.value.donGia);
            formData.append("soQuyen", newBook.value.soQuyen);
            formData.append("hinhAnh", file.value);

            await bookApi.addBook(formData);
        };

        const deleteBook = async (id) => {
            await bookApi.deleteBook(id);
        };

        return { books, newBook, file, handleFileUpload, addBook, deleteBook };
    },
};
</script>
