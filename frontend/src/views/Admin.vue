<template>
  <div class="admin-profile">
    <h2>Thông Tin Tài Khoản Admin</h2>
    <form @submit.prevent="submitUpdate" v-if="adminData">
      <div class="form-group">
        <label>Mã Số Nhân Viên:</label>
        <input v-model="adminData.MSNV" disabled />
      </div>
      <div class="form-group">
        <label>Họ Tên Nhân Viên:</label>
        <input v-model="adminData.HoTenNV" required />
      </div>
      <div class="form-group">
        <label>Địa Chỉ:</label>
        <input v-model="adminData.DiaChi" required />
      </div>
      <div class="form-group">
        <label>Số Điện Thoại:</label>
        <input v-model="adminData.SoDienThoai" required />
      </div>
      <div class="form-group">
        <label>Mật Khẩu Cũ (nếu muốn đổi mật khẩu):</label>
        <input type="password" v-model="adminData.oldPassword" />
      </div>
      <div class="form-group">
        <label>Mật Khẩu Mới:</label>
        <input type="password" v-model="adminData.newPassword" :disabled="!adminData.oldPassword" />
      </div>
      <div class="form-group">
        <label>Nhập Lại Mật Khẩu Mới:</label>
        <input
          type="password"
          v-model="adminData.confirmNewPassword"
          :disabled="!adminData.oldPassword"
        />
      </div>
      <div class="form-buttons">
        <button type="submit" class="submit-btn" :disabled="isSubmitDisabled">Cập Nhật</button>
      </div>
    </form>
    <p v-else>Đang tải thông tin...</p>
  </div>
</template>

<script>
import axios from "axios";
import { useRouter } from "vue-router";
import { jwtDecode } from "jwt-decode";

export default {
  name: "AdminProfile",
  setup() {
    const router = useRouter();
    return { router };
  },
  data() {
    return {
      adminData: null, // Ban đầu là null để kiểm tra tải dữ liệu
    };
  },
  computed: {
    isSubmitDisabled() {
      if (this.adminData?.oldPassword) {
        return (
          !this.adminData.newPassword ||
          this.adminData.newPassword !== this.adminData.confirmNewPassword
        );
      }
      return false;
    },
  },
  mounted() {
    this.checkRoleAndFetchData();
  },
  methods: {
    checkRoleAndFetchData() {
      const token = localStorage.getItem("token");
      if (!token) {
        this.router.push("/login");
        return;
      }
      try {
        const decoded = jwtDecode(token);
        if (decoded.role !== "admin") {
          alert("Trang này chỉ dành cho Admin!");
          this.router.push("/");
          return;
        }
        this.fetchAdminData();
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
        this.router.push("/login");
      }
    },
    async fetchAdminData() {
    try {
        const response = await axios.get("http://localhost:3000/api/profile", {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        });
        const { profile } = response.data;
        this.adminData = {
        MSNV: profile.MSNV || "",
        HoTenNV: profile.HoTenNV || "",
        DiaChi: profile.DiaChi || "",
        SoDienThoai: profile.SoDienThoai || "",
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
        };
    } catch (error) {
        console.error("Error fetching admin data:", error);
        let message = error.response?.data?.message || error.message;
        if (error.response?.status === 404) {
        message = "Không tìm thấy thông tin admin!";
        }
        alert("Không thể tải thông tin admin: " + message);
        if (error.response?.status === 403 || error.response?.status === 401) {
        localStorage.removeItem("token");
        this.router.push("/login");
        }
    }
    },
    async submitUpdate() {
      try {
        if (
          this.adminData.oldPassword &&
          (!this.adminData.newPassword || !this.adminData.confirmNewPassword)
        ) {
          return alert("Vui lòng nhập mật khẩu mới và xác nhận mật khẩu mới!");
        }

        const updateData = { ...this.adminData };
        delete updateData.confirmNewPassword;
        delete updateData.MSNV; // Không gửi MSNV vì không thay đổi

        console.log("Sending update request:", updateData);

        const response = await axios.put(
          "http://localhost:3000/api/admin/update-admin",
          updateData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const updatedAdmin = response.data.admin;
        this.adminData.HoTenNV = updatedAdmin.HoTenNV;
        this.adminData.DiaChi = updatedAdmin.DiaChi;
        this.adminData.SoDienThoai = updatedAdmin.SoDienThoai;
        this.adminData.oldPassword = "";
        this.adminData.newPassword = "";
        this.adminData.confirmNewPassword = "";

        alert("Thông tin admin đã được cập nhật thành công!");
      } catch (error) {
        console.error("Error updating admin:", error);
        alert("Lỗi khi cập nhật admin: " + (error.response?.data?.message || error.message));
        if (error.response?.status === 403 || error.response?.status === 401) {
          localStorage.removeItem("token");
          this.router.push("/login");
        }
      }
    },
  },
};
</script>

<style scoped>
.admin-profile {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.submit-btn {
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>