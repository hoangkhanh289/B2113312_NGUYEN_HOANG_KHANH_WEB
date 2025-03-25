import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import Admin from "../views/Admin.vue";
import User from "../views/User.vue";
import Loan from "../views/Loan.vue";
import BrowseBooks from "../views/BrowseBooks.vue";
import ManageUser from "../views/Manage_User.vue";
import ManageBook from "../views/Manage_Book.vue";
import ManageAdminUser from "../views/Manage_Admin_User.vue";
import { jwtDecode } from "jwt-decode";

const routes = [
  { path: "/", component: Home, meta: { requiresAuth: true, roles: ["user", "admin", "boss"] } },
  { path: "/login", component: Login },
  { path: "/admin", component: Admin, meta: { requiresAuth: true, roles: ["admin"] } },
  { path: "/user", component: User, meta: { requiresAuth: true, roles: ["user"] } },
  { path: "/loan", component: Loan, meta: { requiresAuth: true, roles: ["user"] } },
  { path: "/browse-books", component: BrowseBooks, meta: { requiresAuth: true, roles: ["admin"] } }, // Sửa "adminadmin" thành "admin"
  { path: "/manage-user", component: ManageUser, meta: { requiresAuth: true, roles: ["admin"] } },
  { path: "/manage-book", component: ManageBook, meta: { requiresAuth: true, roles: ["admin", "boss"] } },
  {
    path: "/manage-admin-user",
    component: ManageAdminUser,
    meta: { requiresAuth: true, roles: ["boss"] },
  },
  { path: "/:pathMatch(.*)*", redirect: "/login" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!token) {
      next({ path: "/login" });
    } else {
      try {
        const decoded = jwtDecode(token);
        console.log("Token decoded:", decoded);
        const userRole = decoded.role;

        const requiredRoles = to.meta.roles;
        if (requiredRoles && !requiredRoles.includes(userRole)) {
          console.warn(`User role ${userRole} not allowed for ${to.path}`);
          next({ path: "/" });
        } else {
          next();
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
        next({ path: "/login" });
      }
    }
  } else {
    if (to.path === "/login" && token) {
      try {
        jwtDecode(token);
        next({ path: "/" });
      } catch (error) {
        next();
      }
    } else {
      next();
    }
  }
});

export default router;