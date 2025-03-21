import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import Admin from "../views/Admin.vue";
import User from "../views/User.vue";
import Loan from "../views/Loan.vue";
import ManageUser from "../views/Manage_User.vue";
import ManageBook from "../views/Manage_Book.vue";
import ManageAdminUser from "../views/Manage_Admin_User.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/login", component: Login },
  { path: "/admin", component: Admin },
  { path: "/user", component: User },
  { path: "/loan", component: Loan },
  { path: "/manage-user", component: ManageUser },
  { path: "/manage-book", component: ManageBook },
  { path: "/manage-admin-user", component: ManageAdminUser },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;