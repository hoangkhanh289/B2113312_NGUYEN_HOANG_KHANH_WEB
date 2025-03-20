import axiosClient from "./axiosClient";

const userApi = {
    login(user) {
        return axiosClient.post("/users/login", user);
    },
    getUserProfile() {
        return axiosClient.get("/users/profile");
    },
    getAllUsers() {
        return axiosClient.get("/users");
    },
};

export default userApi;
