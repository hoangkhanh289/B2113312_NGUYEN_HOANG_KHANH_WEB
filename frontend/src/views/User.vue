<template>
  <div class="user-profile">
    <h2>Thông Tin Tài Khoản User</h2>
    <form @submit.prevent="submitUpdate">
      <div class="form-group">
        <label>Họ Lót:</label>
        <input v-model="userData.HoLot" required />
      </div>
      <div class="form-group">
        <label>Tên:</label>
        <input v-model="userData.Ten" required />
      </div>
      <div class="form-group">
        <label>Ngày Sinh:</label>
        <input type="date" v-model="userData.NgaySinh" required />
      </div>
      <div class="form-group">
        <label>Giới Tính:</label>
        <select v-model="userData.Phai" required>
          <option value="Nam">Nam</option>
          <option value="Nữ">Nữ</option>
        </select>
      </div>
      <div class="form-group">
        <label>Địa Chỉ:</label>
        <input v-model="userData.DiaChi" required />
      </div>
      <div class="form-group">
        <label>Số Điện Thoại:</label>
        <input v-model="userData.DienThoai" required />
      </div>
      <div class="form-group">
        <label>Mật Khẩu Cũ (nếu muốn đổi mật khẩu):</label>
        <input type="password" v-model="userData.oldPassword" />
      </div>
      <div class="form-group">
        <label>Mật Khẩu Mới:</label>
        <input type="password" v-model="userData.newPassword" :disabled="!userData.oldPassword" />
      </div>
      <div class="form-group">
        <label>Nhập Lại Mật Khẩu Mới:</label>
        <input
          type="password"
          v-model="userData.confirmNewPassword"
          :disabled="!userData.oldPassword"
        />
      </div>
      <div class="form-buttons">
        <button type="submit" class="submit-btn" :disabled="isSubmitDisabled">Cập Nhật</button>
      </div>
    </form>
  </div>
</template>

<script>
import axios from "axios";
import { useRouter } from "vue-router";
import { jwtDecode } from "jwt-decode";

export default {
  name: "UserProfile",
  setup() {
    const router = useRouter();
    return { router };
  },
  data() {
    return {
      userData: {
        HoLot: "",
        Ten: "",
        NgaySinh: "",
        Phai: "",
        DiaChi: "",
        DienThoai: "",
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      },
    };
  },
  computed: {
    isSubmitDisabled() {
      if (this.userData.oldPassword) {
        return (
          !this.userData.newPassword ||
          this.userData.newPassword !== this.userData.confirmNewPassword
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
        if (decoded.role !== "user") {
          alert("Trang này chỉ dành cho User!");
          this.router.push("/");
          return;
        }
        this.fetchUserData();
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
        this.router.push("/login");
      }
    },
    async fetchUserData() {
      try {
        const response = await axios.get("http://localhost:3000/api/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const { profile } = response.data;
        this.userData = {
          HoLot: profile.HoLot || "",
          Ten: profile.Ten || "",
          NgaySinh: profile.NgaySinh ? new Date(profile.NgaySinh).toISOString().split("T")[0] : "",
          Phai: profile.Phai || "",
          DiaChi: profile.DiaChi || "",
          DienThoai: profile.DienThoai || "",
          oldPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        };
      } catch (error) {
        console.error("Error fetching user data:", error);
        let message = error.response?.data?.message || error.message;
        if (error.response?.status === 404) {
          message = "Không tìm thấy thông tin user!";
        }
        alert("Không thể tải thông tin user: " + message);
        if (error.response?.status === 403 || error.response?.status === 401) {
          localStorage.removeItem("token");
          this.router.push("/login");
        }
      }
    },
    async submitUpdate() {
      try {
        if (
          this.userData.oldPassword &&
          (!this.userData.newPassword || !this.userData.confirmNewPassword)
        ) {
          return alert("Vui lòng nhập mật khẩu mới và xác nhận mật khẩu mới!");
        }

        const updateData = { ...this.userData };
        delete updateData.confirmNewPassword;

        console.log("Sending update request:", updateData);

        const response = await axios.put(
          "http://localhost:3000/api/user/update-user",
          updateData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const updatedUser = response.data.user;
        this.userData.HoLot = updatedUser.HoLot;
        this.userData.Ten = updatedUser.Ten;
        this.userData.NgaySinh = updatedUser.NgaySinh
          ? new Date(updatedUser.NgaySinh).toISOString().split("T")[0]
          : "";
        this.userData.Phai = updatedUser.Phai;
        this.userData.DiaChi = updatedUser.DiaChi;
        this.userData.DienThoai = updatedUser.DienThoai;
        this.userData.oldPassword = "";
        this.userData.newPassword = "";
        this.userData.confirmNewPassword = "";

        alert("Thông tin user đã được cập nhật thành công!");
      } catch (error) {
        console.error("Error updating user:", error);
        alert("Lỗi khi cập nhật user: " + (error.response?.data?.message || error.message));
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
.user-profile {
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

.form-group input,
.form-group select {
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