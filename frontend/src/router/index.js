import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import Admin from "../views/Admin.vue";
import User from "../views/User.vue";

const routes = [
    { path: "/", component: Home },
    { path: "/login", component: Login },
    { path: "/admin", component: Admin },
    { path: "/user", component: User },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
