import axiosClient from "./axiosClient";

const bookApi = {
    getAllBooks() {
        return axiosClient.get("/books");
    },
    addBook(formData) {
        return axiosClient.post("/books", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
    deleteBook(id) {
        return axiosClient.delete(`/books/${id}`);
    },
    updateBook(id, data) {
        return axiosClient.put(`/books/${id}`, data);
    },
};

export default bookApi;
