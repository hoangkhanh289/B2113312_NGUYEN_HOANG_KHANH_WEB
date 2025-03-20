import axios from "axios";

const axiosClient = axios.create({
    baseURL: "http://localhost:3000/api", // Đảm bảo API_URL đúng
    headers: {
        "Content-Type": "application/json",
    },
});

// Thêm interceptor để tự động đính kèm token vào request (nếu có)
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosClient;
