import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import Admin from "../views/Admin.vue";
import User from "../views/User.vue";
import Loan from "../views/Loan.vue";
import ManageUser from "../views/Manage_User.vue";
import ManageBook from "../views/Manage_Book.vue";
import ManageAdminUser from "../views/Manage_Admin_User.vue";
import { jwtDecode } from "jwt-decode";

const routes = [
  { path: "/", component: Home, meta: { requiresAuth: true, roles: ["user", "admin", "boss"] } },
  { path: "/login", component: Login },
  { path: "/admin", component: Admin, meta: { requiresAuth: true, roles: ["admin"] } },
  { path: "/user", component: User, meta: { requiresAuth: true, roles: ["user"] } },
  { path: "/loan", component: Loan, meta: { requiresAuth: true, roles: ["user", "admin"] } },
  { path: "/manage-user", component: ManageUser, meta: { requiresAuth: true, roles: ["admin"] } },
  { path: "/manage-book", component: ManageBook, meta: { requiresAuth: true, roles: ["admin", "boss"] } },
  {
    path: "/manage-admin-user",
    component: ManageAdminUser,
    meta: { requiresAuth: true, roles: ["boss"] },
  },
  { path: "/:pathMatch(.*)*", redirect: "/login" }, // Chuyển mọi route không khớp về /login
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Kiểm tra xác thực và quyền trước mỗi route
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");

  // Nếu route yêu cầu xác thực
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!token) {
      // Không có token -> chuyển hướng đến /login
      next({ path: "/login" });
    } else {
      try {
        // Kiểm tra token hợp lệ và lấy role
        const decoded = jwtDecode(token);
        console.log("Token decoded:", decoded);
        const userRole = decoded.role;

        // Kiểm tra quyền truy cập
        const requiredRoles = to.meta.roles;
        if (requiredRoles && !requiredRoles.includes(userRole)) {
          console.warn(`User role ${userRole} not allowed for ${to.path}`);
          next({ path: "/" }); // Chuyển về trang chính nếu không có quyền
        } else {
          next(); // Token hợp lệ và có quyền -> cho phép truy cập
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token"); // Xóa token không hợp lệ
        next({ path: "/login" }); // Token không hợp lệ -> chuyển hướng đến /login
      }
    }
  } else {
    // Route không yêu cầu xác thực (như /login)
    if (to.path === "/login" && token) {
      // Nếu đã đăng nhập mà cố vào /login -> chuyển hướng về trang chính
      try {
        jwtDecode(token);
        next({ path: "/" });
      } catch (error) {
        next(); // Token không hợp lệ -> vẫn cho vào /login
      }
    } else {
      next(); // Tiếp tục vào route không yêu cầu xác thực
    }
  }
});

export default router;