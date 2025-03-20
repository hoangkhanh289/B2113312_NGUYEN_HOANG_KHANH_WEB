<template>
    <div>
        <h2>Quản lý sách</h2>
        <!-- Form Thêm Sách -->
        <form @submit.prevent="addBook">
            <input v-model="newBook.tenSach" placeholder="Tên sách" required />
            <input v-model="newBook.donGia" type="number" placeholder="Giá mượn" required />
            <input v-model="newBook.soQuyen" type="number" placeholder="Số lượng" required />
            <input type="file" @change="handleFileUpload" required />
            <button type="submit">Thêm sách</button>
        </form>

        <!-- Danh sách sách -->
        <div v-for="book in books" :key="book._id">
            <h3>{{ book.tenSach }}</h3>
            <p>Giá mượn: {{ book.donGia }}</p>
            <p>Số lượng: {{ book.soQuyen }}</p>
            <img :src="book.hinhAnh" alt="Ảnh sách" width="100" />
            <button @click="deleteBook(book._id)">Xóa</button>
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from "vue";
import bookApi from "@/api/bookApi";  // Giả sử bạn đã có API để làm việc với sách

export default {
    setup() {
        const books = ref([]);
        const newBook = ref({ tenSach: "", donGia: 0, soQuyen: 0 });
        const file = ref(null);

        // Lấy danh sách sách khi component được mounted
        onMounted(async () => {
            books.value = await bookApi.getAllBooks();
        });

        // Xử lý tải lên file
        const handleFileUpload = (event) => {
            file.value = event.target.files[0];
        };

        // Thêm sách mới
        const addBook = async () => {
            const formData = new FormData();
            formData.append("tenSach", newBook.value.tenSach);
            formData.append("donGia", newBook.value.donGia);
            formData.append("soQuyen", newBook.value.soQuyen);
            formData.append("hinhAnh", file.value);

            // Gọi API để thêm sách
            await bookApi.addBook(formData);

            // Cập nhật lại danh sách sách sau khi thêm
            books.value = await bookApi.getAllBooks();
        };

        // Xóa sách
        const deleteBook = async (id) => {
            await bookApi.deleteBook(id);
            books.value = await bookApi.getAllBooks();  // Cập nhật lại danh sách sách
        };

        return { books, newBook, file, handleFileUpload, addBook, deleteBook };
    },
};
</script>
