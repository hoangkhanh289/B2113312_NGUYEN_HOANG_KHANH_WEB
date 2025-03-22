<template>
  <div class="manage-user">
    <div class="table-container">
      <div class="table-header">
        <button class="add-btn" @click="openAddUserForm">Thêm</button>
      </div>
      <table>
        <thead>
          <tr>
            <th class="id-column">Mã Độc Giả</th>
            <th>Họ tên</th>
          </tr>
          <tr class="search-row">
            <td class="id-column">
              <input
                v-model="searchUserId"
                placeholder="Tìm theo Mã Độc Giả"
                @input="filterUsers"
              />
            </td>
            <td>
              <input
                v-model="searchUserName"
                placeholder="Tìm theo Họ tên"
                @input="filterUsers"
              />
            </td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.MaDocGia">
            <td class="id-column">{{ user.MaDocGia }}</td>
            <td>
              <div class="name-with-action">
                <span>{{ user.HoLot + " " + user.Ten }}</span>
                <div class="dropdown">
                  <button class="dropdown-btn">☰</button>
                  <div class="dropdown-content">
                    <a href="#" @click.prevent="editUser(user)">Edit</a>
                    <a href="#" @click.prevent="deleteUser(user)">Delete</a>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal thêm User -->
    <div v-if="showAddForm" class="modal-overlay">
      <div class="modal">
        <h3>Thêm User Mới</h3>
        <form @submit.prevent="submitNewUser">
          <div class="form-group">
            <label>Họ Lót:</label>
            <input v-model="newUser.HoLot" required />
          </div>
          <div class="form-group">
            <label>Tên:</label>
            <input v-model="newUser.Ten" required />
          </div>
          <div class="form-group">
            <label>Ngày Sinh:</label>
            <input type="date" v-model="newUser.NgaySinh" required />
          </div>
          <div class="form-group">
            <label>Giới Tính:</label>
            <select v-model="newUser.Phai" required>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>
          <div class="form-group">
            <label>Địa Chỉ:</label>
            <input v-model="newUser.DiaChi" required />
          </div>
          <div class="form-group">
            <label>Điện Thoại:</label>
            <input v-model="newUser.DienThoai" required />
          </div>
          <div class="form-group">
            <label>Mật Khẩu:</label>
            <input type="password" v-model="newUser.password" required />
          </div>
          <div class="form-buttons">
            <button type="submit" class="submit-btn">Tạo</button>
            <button type="button" class="cancel-btn" @click="closeAddUserForm">Hủy</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal xác nhận thêm User -->
    <div v-if="showConfirmModal" class="modal-overlay confirm-overlay">
      <div class="modal confirm-modal">
        <h3>Xác Nhận Thông Tin</h3>
        <p>Mã Độc Giả: {{ newUser.MaDocGia }}</p>
        <p>Họ Tên: {{ newUser.HoLot + " " + newUser.Ten }}</p>
        <p>Ngày Sinh: {{ newUser.NgaySinh }}</p>
        <p>Giới Tính: {{ newUser.Phai }}</p>
        <p>Địa Chỉ: {{ newUser.DiaChi }}</p>
        <p>Điện Thoại: {{ newUser.DienThoai }}</p>
        <div class="confirm-buttons">
          <button @click="confirmAddUser">Xác Nhận</button>
          <button @click="cancelAddUser">Hủy</button>
        </div>
      </div>
    </div>

    <!-- Modal chỉnh sửa User -->
    <div v-if="showEditUserForm" class="modal-overlay">
      <div class="modal">
        <h3>Chỉnh Sửa User</h3>
        <form @submit.prevent="submitEditUser">
          <div class="form-group">
            <label>Mã Độc Giả:</label>
            <input v-model="editUserData.MaDocGia" disabled />
          </div>
          <div class="form-group">
            <label>Họ Lót:</label>
            <input v-model="editUserData.HoLot" required />
          </div>
          <div class="form-group">
            <label>Tên:</label>
            <input v-model="editUserData.Ten" required />
          </div>
          <div class="form-group">
            <label>Ngày Sinh:</label>
            <input type="date" v-model="editUserData.NgaySinh" required />
          </div>
          <div class="form-group">
            <label>Giới Tính:</label>
            <select v-model="editUserData.Phai" required>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>
          <div class="form-group">
            <label>Địa Chỉ:</label>
            <input v-model="editUserData.DiaChi" required />
          </div>
          <div class="form-group">
            <label>Điện Thoại:</label>
            <input v-model="editUserData.DienThoai" required />
          </div>
          <div class="form-group">
            <label>Mật Khẩu (để trống nếu không đổi):</label>
            <input type="password" v-model="editUserData.Password" />
          </div>
          <div class="form-buttons">
            <button type="submit" class="submit-btn">Cập Nhật</button>
            <button type="button" class="cancel-btn" @click="closeEditUserForm">Hủy</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal xác nhận xóa User -->
    <div v-if="showDeleteModal" class="modal-overlay confirm-overlay">
      <div class="modal confirm-modal">
        <h3>Xác Nhận Xóa</h3>
        <p>Mã Độc Giả: {{ deleteTarget.data.MaDocGia }}</p>
        <p>Họ Tên: {{ deleteTarget.data.HoLot + " " + deleteTarget.data.Ten }}</p>
        <p>Điện Thoại: {{ deleteTarget.data.DienThoai || "N/A" }}</p>
        <div class="confirm-buttons">
          <button @click="confirmDelete">Xác Nhận</button>
          <button @click="cancelDelete">Hủy</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { useRouter } from "vue-router";

export default {
  name: "ManageUser",
  setup() {
    const router = useRouter();
    return { router };
  },
  data() {
    return {
      users: [],
      filteredUsers: [],
      searchUserId: "",
      searchUserName: "",
      showAddForm: false,
      showConfirmModal: false,
      showEditUserForm: false,
      showDeleteModal: false,
      newUser: {
        MaDocGia: "",
        HoLot: "",
        Ten: "",
        NgaySinh: "",
        Phai: "",
        DiaChi: "",
        DienThoai: "",
        password: "",
      },
      editUserData: {
        MaDocGia: "",
        HoLot: "",
        Ten: "",
        NgaySinh: "",
        Phai: "",
        DiaChi: "",
        DienThoai: "",
        Password: "",
      },
      deleteTarget: {
        data: {},
        id: "",
      },
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      try {
        const response = await axios.get("http://localhost:3000/api/admin/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        this.users = response.data;
        this.filteredUsers = [...this.users];
      } catch (error) {
        console.error("Error fetching data:", error);
        const errorMessage = error.response?.data?.message || error.message || "Lỗi không xác định";
        alert("Không thể tải dữ liệu: " + errorMessage);
        if (error.response?.status === 403) {
          localStorage.removeItem("token");
          this.router.push("/login");
        }
      }
    },
    filterUsers() {
      const idQuery = this.searchUserId.toLowerCase();
      const nameQuery = this.searchUserName.toLowerCase();
      this.filteredUsers = this.users
        .filter(
          (user) =>
            user.MaDocGia.toLowerCase().includes(idQuery) &&
            (user.HoLot + " " + user.Ten).toLowerCase().includes(nameQuery)
        )
        .sort((a, b) => {
          const aMatch = (a.HoLot + " " + a.Ten).toLowerCase().indexOf(nameQuery);
          const bMatch = (b.HoLot + " " + b.Ten).toLowerCase().indexOf(nameQuery);
          return aMatch - bMatch;
        });
    },
    // Edit User
    editUser(user) {
      this.editUserData = {
        ...user,
        NgaySinh: user.NgaySinh ? new Date(user.NgaySinh).toISOString().split("T")[0] : "",
        Password: "", // Để trống mật khẩu ban đầu
      };
      this.showEditUserForm = true;
    },
    closeEditUserForm() {
      this.showEditUserForm = false;
      this.resetEditUserData();
    },
    async submitEditUser() {
      try {
        const updateData = { ...this.editUserData };
        delete updateData._id; // Xóa _id khỏi dữ liệu gửi đi
        console.log("Sending update user request:", {
          username: this.editUserData.MaDocGia,
          role: "user",
          updateData,
        });
        const response = await axios.put(
          "http://localhost:3000/api/admin/update",
          {
            username: this.editUserData.MaDocGia,
            role: "user",
            updateData,
          },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        const updatedUser = response.data.user;
        const index = this.users.findIndex((u) => u.MaDocGia === updatedUser.MaDocGia);
        if (index !== -1) this.users[index] = updatedUser;
        this.filteredUsers = [...this.users];
        this.showEditUserForm = false;
        alert("User đã được cập nhật thành công!");
      } catch (error) {
        console.error("Error updating user:", error);
        alert("Lỗi khi cập nhật user: " + (error.response?.data?.message || error.message));
      }
    },
    resetEditUserData() {
      this.editUserData = {
        MaDocGia: "",
        HoLot: "",
        Ten: "",
        NgaySinh: "",
        Phai: "",
        DiaChi: "",
        DienThoai: "",
        Password: "",
      };
    },
    // Delete User
    deleteUser(user) {
      this.deleteTarget = { data: user, id: user._id };
      this.showDeleteModal = true;
    },
    async confirmDelete() {
      try {
        const response = await axios.delete(
          `http://localhost:3000/api/admin/users/${this.deleteTarget.id}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        this.users = this.users.filter((u) => u._id !== this.deleteTarget.id);
        this.filteredUsers = [...this.users];
        this.showDeleteModal = false;
        alert(response.data.message);
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Lỗi khi xóa user: " + (error.response?.data?.message || error.message));
      }
    },
    cancelDelete() {
      this.showDeleteModal = false;
      this.deleteTarget = { data: {}, id: "" };
    },
    // Add User
    openAddUserForm() {
      this.showAddForm = true;
    },
    closeAddUserForm() {
      this.showAddForm = false;
      this.resetNewUser();
    },
    async generateMaDocGia() {
      for (let i = 0; i <= 999999; i++) {
        const generatedId = `DG${String(i).padStart(6, "0")}`;
        const exists = this.users.some((user) => user.MaDocGia === generatedId);
        if (!exists) {
          return generatedId;
        }
      }
      throw new Error("Không còn mã độc giả nào khả dụng");
    },
    async submitNewUser() {
      try {
        this.newUser.MaDocGia = await this.generateMaDocGia();
        this.showAddForm = false;
        this.showConfirmModal = true;
      } catch (error) {
        alert("Lỗi khi tạo mã độc giả: " + error.message);
      }
    },
    async confirmAddUser() {
      try {
        const response = await axios.post(
          "http://localhost:3000/api/auth/register-user",
          this.newUser,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        this.users.push(response.data.user);
        this.filteredUsers = [...this.users];
        this.showConfirmModal = false;
        this.resetNewUser();
        alert("User đã được tạo thành công!");
      } catch (error) {
        console.error("Error creating user:", error);
        const errorMessage = error.response?.data?.message || error.message || "Lỗi không xác định";
        alert("Lỗi khi tạo user: " + errorMessage);
        if (error.response?.status === 403) {
          localStorage.removeItem("token");
          this.router.push("/login");
        }
      }
    },
    cancelAddUser() {
      this.showConfirmModal = false;
      this.resetNewUser();
    },
    resetNewUser() {
      this.newUser = {
        MaDocGia: "",
        HoLot: "",
        Ten: "",
        NgaySinh: "",
        Phai: "",
        DiaChi: "",
        DienThoai: "",
        password: "",
      };
    },
  },
};
</script>

<style scoped>
.manage-user {
  padding: 20px;
}

.table-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.table-header {
  width: 80%;
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.add-btn {
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  cursor: pointer;
}

table {
  width: 80%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

th {
  background-color: #f2f2f2;
}

.id-column {
  width: 30%;
}

.search-row td {
  padding: 5px;
}

.search-row input {
  width: 100%;
  padding: 5px;
  box-sizing: border-box;
}

.name-with-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dropdown {
  position: relative;
  display: inline-block;
  margin-left: 10px;
}

.dropdown-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

.dropdown-content {
  display: none;
  position: absolute;
  background-color: #f9f9f9;
  min-width: 100px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
  right: 0;
}

.dropdown-content a {
  color: black;
  padding: 8px 12px;
  text-decoration: none;
  display: block;
}

.dropdown-content a:hover {
  background-color: #f1f1f1;
}

.dropdown:hover .dropdown-content {
  display: block;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 5px;
  width: 400px;
  max-height: 80vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 5px;
  box-sizing: border-box;
}

.form-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.submit-btn {
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  cursor: pointer;
}

.cancel-btn {
  padding: 8px 16px;
  background-color: #f44336;
  color: white;
  border: none;
  cursor: pointer;
}

.confirm-overlay {
  pointer-events: none;
}

.confirm-modal {
  pointer-events: auto;
}

.confirm-buttons {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
}

.confirm-buttons button {
  padding: 8px 16px;
  cursor: pointer;
}

.confirm-buttons button:first-child {
  background-color: #4caf50;
  color: white;
  border: none;
}

.confirm-buttons button:last-child {
  background-color: #f44336;
  color: white;
  border: none;
}
</style>