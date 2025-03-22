<template>
  <div class="manage-admin-user">
    <!-- Màn hình lựa chọn ban đầu -->
    <div v-if="!showAdminTable && !showUserTable" class="button-container">
      <button @click="showAdminTable = true">Mở bảng Admin</button>
      <button @click="showUserTable = true">Mở bảng User</button>
    </div>

    <!-- Bảng Admin -->
    <div v-if="showAdminTable" class="table-container">
      <div class="table-header">
        <h2>Danh sách Admin</h2>
        <div class="header-buttons">
          <button class="add-btn" @click="openAddAdminForm">Thêm</button>
          <button class="close-btn" @click="showAdminTable = false">X</button>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th class="id-column">MSNV</th>
            <th class="position-column">Chức Vụ</th> <!-- Thêm cột Chức Vụ -->
            <th class="phone-column">Số Điện Thoại</th>
            <th>Họ Tên</th>
          </tr>
          <tr class="search-row">
            <td class="id-column">
              <input v-model="searchAdminId" placeholder="Tìm theo MSNV" @input="filterAdmins" />
            </td>
            <td class="position-column">
              <input v-model="searchAdminPosition" placeholder="Tìm theo Chức Vụ" @input="filterAdmins" />
            </td> <!-- Thêm ô tìm kiếm cho Chức Vụ -->
            <td class="phone-column">
              <input v-model="searchAdminPhone" placeholder="Tìm theo Số ĐT" @input="filterAdmins" />
            </td>
            <td>
              <input v-model="searchAdminName" placeholder="Tìm theo Họ tên" @input="filterAdmins" />
            </td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="admin in filteredAdmins" :key="admin.MSNV">
            <td class="id-column">{{ admin.MSNV }}</td>
            <td class="position-column">{{ admin.ChucVu || 'N/A' }}</td> <!-- Hiển thị Chức Vụ -->
            <td class="phone-column">{{ admin.SoDienThoai || 'N/A' }}</td>
            <td>
              <div class="name-with-action">
                <span>{{ admin.HoTenNV }}</span>
                <div class="dropdown">
                  <button class="dropdown-btn">☰</button>
                  <div class="dropdown-content">
                    <a href="#" @click.prevent="editAdmin(admin)">Edit</a>
                    <a href="#" @click.prevent="deleteAdmin(admin)">Delete</a>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Bảng User -->
    <div v-if="showUserTable" class="table-container">
      <div class="table-header">
        <h2>Danh sách User</h2>
        <div class="header-buttons">
          <button class="add-btn" @click="openAddUserForm">Thêm</button>
          <button class="close-btn" @click="showUserTable = false">X</button>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th class="id-column">Mã Độc Giả</th>
            <th class="phone-column">Số Điện Thoại</th>
            <th>Họ Tên</th>
          </tr>
          <tr class="search-row">
            <td class="id-column">
              <input v-model="searchUserId" placeholder="Tìm theo Mã Độc Giả" @input="filterUsers" />
            </td>
            <td class="phone-column">
              <input v-model="searchUserPhone" placeholder="Tìm theo Số ĐT" @input="filterUsers" />
            </td>
            <td>
              <input v-model="searchUserName" placeholder="Tìm theo Họ tên" @input="filterUsers" />
            </td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.MaDocGia">
            <td class="id-column">{{ user.MaDocGia }}</td>
            <td class="phone-column">{{ user.DienThoai || 'N/A' }}</td>
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

    <!-- Modal thêm Admin -->
    <div v-if="showAddAdminForm" class="modal-overlay">
      <div class="modal">
        <h3>Thêm Admin Mới</h3>
        <form @submit.prevent="submitNewAdmin">
          <div class="form-group">
            <label>Họ Tên NV:</label>
            <input v-model="newAdmin.HoTenNV" required />
          </div>
          <div class="form-group">
            <label>Mật Khẩu:</label>
            <input type="password" v-model="newAdmin.password" required />
          </div>
          <div class="form-group">
            <label>Chức Vụ:</label>
            <input v-model="newAdmin.ChucVu" required />
          </div>
          <div class="form-group">
            <label>Địa Chỉ:</label>
            <input v-model="newAdmin.DiaChi" required />
          </div>
          <div class="form-group">
            <label>Số Điện Thoại:</label>
            <input v-model="newAdmin.SoDienThoai" required />
          </div>
          <div class="form-buttons">
            <button type="submit" class="submit-btn">Tạo</button>
            <button type="button" class="cancel-btn" @click="closeAddAdminForm">Hủy</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal xác nhận thêm Admin -->
    <div v-if="showAdminConfirmModal" class="modal-overlay confirm-overlay">
      <div class="modal confirm-modal">
        <h3>Xác Nhận Thông Tin Admin</h3>
        <p>MSNV: {{ newAdmin.MSNV }}</p>
        <p>Họ Tên NV: {{ newAdmin.HoTenNV }}</p>
        <p>Chức Vụ: {{ newAdmin.ChucVu }}</p>
        <p>Địa Chỉ: {{ newAdmin.DiaChi }}</p>
        <p>Số Điện Thoại: {{ newAdmin.SoDienThoai }}</p>
        <div class="confirm-buttons">
          <button @click="confirmAddAdmin">Xác Nhận</button>
          <button @click="cancelAddAdmin">Hủy</button>
        </div>
      </div>
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
        <h3>Xác Nhận Thông Tin User</h3>
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

    <!-- Modal chỉnh sửa Admin -->
    <div v-if="showEditAdminForm" class="modal-overlay">
      <div class="modal">
        <h3>Chỉnh Sửa Admin</h3>
        <form @submit.prevent="submitEditAdmin">
          <div class="form-group">
            <label>MSNV:</label>
            <input v-model="editAdminData.MSNV" disabled />
          </div>
          <div class="form-group">
            <label>Họ Tên NV:</label>
            <input v-model="editAdminData.HoTenNV" required />
          </div>
          <div class="form-group">
            <label>Mật Khẩu (để trống nếu không đổi):</label>
            <input type="password" v-model="editAdminData.Password" />
          </div>
          <div class="form-group">
            <label>Chức Vụ:</label>
            <input v-model="editAdminData.ChucVu" required />
          </div>
          <div class="form-group">
            <label>Địa Chỉ:</label>
            <input v-model="editAdminData.DiaChi" required />
          </div>
          <div class="form-group">
            <label>Số Điện Thoại:</label>
            <input v-model="editAdminData.SoDienThoai" required />
          </div>
          <div class="form-buttons">
            <button type="submit" class="submit-btn">Cập Nhật</button>
            <button type="button" class="cancel-btn" @click="closeEditAdminForm">Hủy</button>
          </div>
        </form>
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

    <!-- Modal xác nhận xóa -->
    <div v-if="showDeleteModal" class="modal-overlay confirm-overlay">
      <div class="modal confirm-modal">
        <h3>Xác Nhận Xóa</h3>
        <p v-if="deleteTarget.role === 'admin'">
          MSNV: {{ deleteTarget.data.MSNV }}<br />
          Họ Tên NV: {{ deleteTarget.data.HoTenNV }}<br />
          Số Điện Thoại: {{ deleteTarget.data.SoDienThoai || 'N/A' }}
        </p>
        <p v-else>
          Mã Độc Giả: {{ deleteTarget.data.MaDocGia }}<br />
          Họ Tên: {{ deleteTarget.data.HoLot + " " + deleteTarget.data.Ten }}<br />
          Số Điện Thoại: {{ deleteTarget.data.DienThoai || 'N/A' }}
        </p>
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
  name: "ManageAdminUser",
  setup() {
    const router = useRouter();
    return { router };
  },
  data() {
    return {
      admins: [],
      users: [],
      filteredAdmins: [],
      filteredUsers: [],
      searchAdminId: "",
      searchAdminPosition: "", // Thêm biến này
      searchAdminPhone: "",
      searchAdminName: "",
      searchUserId: "",
      searchUserPhone: "",
      searchUserName: "",
      showAdminTable: false,
      showUserTable: false,
      showAddAdminForm: false,
      showAdminConfirmModal: false,
      showAddForm: false,
      showConfirmModal: false,
      showEditAdminForm: false,
      showEditUserForm: false,
      showDeleteModal: false,
      newAdmin: {
        MSNV: "",
        HoTenNV: "",
        password: "",
        ChucVu: "",
        DiaChi: "",
        SoDienThoai: "",
      },
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
      editAdminData: {
        MSNV: "",
        HoTenNV: "",
        Password: "",
        ChucVu: "",
        DiaChi: "",
        SoDienThoai: "",
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
        role: "",
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
        const response = await axios.get("http://localhost:3000/api/boss/users-admins", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        this.admins = response.data.admins || [];
        this.users = response.data.users || [];
        this.filteredAdmins = [...this.admins];
        this.filteredUsers = [...this.users];
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Không thể tải dữ liệu: " + (error.response?.data?.message || error.message));
        if (error.response?.status === 403) {
          localStorage.removeItem("token");
          this.router.push("/login");
        }
      }
    },
    filterAdmins() {
      const idQuery = this.searchAdminId.toLowerCase();
      const phoneQuery = this.searchAdminPhone.toLowerCase();
      const nameQuery = this.searchAdminName.toLowerCase();
      const positionQuery = this.searchAdminPosition.toLowerCase();
      this.filteredAdmins = this.admins
        .filter(
          (admin) =>
            admin.MSNV.toLowerCase().includes(idQuery) &&
            (admin.SoDienThoai || "").toLowerCase().includes(phoneQuery) &&
            admin.HoTenNV.toLowerCase().includes(nameQuery)&&
            (admin.ChucVu || "").toLowerCase().includes(positionQuery) 
        )
        .sort((a, b) => a.HoTenNV.toLowerCase().indexOf(nameQuery) - b.HoTenNV.toLowerCase().indexOf(nameQuery));
    },
    filterUsers() {
      const idQuery = this.searchUserId.toLowerCase();
      const phoneQuery = this.searchUserPhone.toLowerCase();
      const nameQuery = this.searchUserName.toLowerCase();
      this.filteredUsers = this.users
        .filter(
          (user) =>
            user.MaDocGia.toLowerCase().includes(idQuery) &&
            (user.DienThoai || "").toLowerCase().includes(phoneQuery) &&
            (user.HoLot + " " + user.Ten).toLowerCase().includes(nameQuery)
        )
        .sort((a, b) =>
          (a.HoLot + " " + a.Ten).toLowerCase().indexOf(nameQuery) - (b.HoLot + " " + b.Ten).toLowerCase().indexOf(nameQuery)
        );
    },
    // Edit Admin
    editAdmin(admin) {
      this.editAdminData = { ...admin, Password: "" };
      this.showEditAdminForm = true;
    },
    closeEditAdminForm() {
      this.showEditAdminForm = false;
      this.resetEditAdminData();
    },
    async submitEditAdmin() {
      try {
        const updateData = { ...this.editAdminData };
        delete updateData._id;
        const response = await axios.put(
          "http://localhost:3000/api/boss/update",
          {
            username: this.editAdminData.MSNV,
            role: "admin",
            updateData,
          },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        const updatedAdmin = response.data.user;
        const index = this.admins.findIndex((a) => a.MSNV === updatedAdmin.MSNV);
        if (index !== -1) this.admins[index] = updatedAdmin;
        this.filteredAdmins = [...this.admins];
        this.showEditAdminForm = false;
        alert("Admin đã được cập nhật thành công!");
      } catch (error) {
        console.error("Error updating admin:", error);
        alert("Lỗi khi cập nhật admin: " + (error.response?.data?.message || error.message));
      }
    },
    resetEditAdminData() {
      this.editAdminData = {
        MSNV: "",
        HoTenNV: "",
        Password: "",
        ChucVu: "",
        DiaChi: "",
        SoDienThoai: "",
      };
    },
    // Edit User
    editUser(user) {
      this.editUserData = {
        ...user,
        NgaySinh: user.NgaySinh ? new Date(user.NgaySinh).toISOString().split("T")[0] : "",
        Password: "",
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
        delete updateData._id;
        const response = await axios.put(
          "http://localhost:3000/api/boss/update",
          {
            username: this.editUserData.MaDocGia,
            role: "user",
            updateData,
          },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
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
    // Delete
    deleteAdmin(admin) {
      this.deleteTarget = { role: "admin", data: admin, id: admin._id };
      this.showDeleteModal = true;
    },
    deleteUser(user) {
      this.deleteTarget = { role: "user", data: user, id: user._id };
      this.showDeleteModal = true;
    },
    async confirmDelete() {
      try {
        const response = await axios.delete(
          `http://localhost:3000/api/boss/users/${this.deleteTarget.id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        if (this.deleteTarget.role === "admin") {
          this.admins = this.admins.filter((a) => a._id !== this.deleteTarget.id);
          this.filteredAdmins = [...this.admins];
        } else {
          this.users = this.users.filter((u) => u._id !== this.deleteTarget.id);
          this.filteredUsers = [...this.users];
        }
        this.showDeleteModal = false;
        alert(response.data.message);
      } catch (error) {
        console.error("Error deleting:", error);
        alert("Lỗi khi xóa: " + (error.response?.data?.message || error.message));
      }
    },
    cancelDelete() {
      this.showDeleteModal = false;
      this.deleteTarget = { role: "", data: {}, id: "" };
    },
    // Add Admin
    openAddAdminForm() {
      this.showAddAdminForm = true;
    },
    closeAddAdminForm() {
      this.showAddAdminForm = false;
      this.resetNewAdmin();
    },
    async generateMSNV() {
      for (let i = 0; i <= 999999; i++) {
        const generatedId = `NV${String(i).padStart(6, "0")}`;
        if (!this.admins.some((admin) => admin.MSNV === generatedId)) return generatedId;
      }
      throw new Error("Không còn MSNV nào khả dụng");
    },
    async submitNewAdmin() {
      try {
        this.newAdmin.MSNV = await this.generateMSNV();
        this.showAddAdminForm = false;
        this.showAdminConfirmModal = true;
      } catch (error) {
        alert("Lỗi khi tạo MSNV: " + error.message);
      }
    },
    async confirmAddAdmin() {
      try {
        const response = await axios.post(
          "http://localhost:3000/api/auth/register-admin",
          this.newAdmin,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        this.admins.push(response.data.admin);
        this.filteredAdmins = [...this.admins];
        this.showAdminConfirmModal = false;
        this.resetNewAdmin();
        alert("Admin đã được tạo thành công!");
      } catch (error) {
        console.error("Error creating admin:", error);
        alert("Lỗi khi tạo admin: " + (error.response?.data?.error || error.message));
      }
    },
    cancelAddAdmin() {
      this.showAdminConfirmModal = false;
      this.resetNewAdmin();
    },
    resetNewAdmin() {
      this.newAdmin = { MSNV: "", HoTenNV: "", password: "", ChucVu: "", DiaChi: "", SoDienThoai: "" };
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
        if (!this.users.some((user) => user.MaDocGia === generatedId)) return generatedId;
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
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        this.users.push(response.data.user);
        this.filteredUsers = [...this.users];
        this.showConfirmModal = false;
        this.resetNewUser();
        alert("User đã được tạo thành công!");
      } catch (error) {
        console.error("Error creating user:", error);
        alert("Lỗi khi tạo user: " + (error.response?.data?.message || error.message));
      }
    },
    cancelAddUser() {
      this.showConfirmModal = false;
      this.resetNewUser();
    },
    resetNewUser() {
      this.newUser = { MaDocGia: "", HoLot: "", Ten: "", NgaySinh: "", Phai: "", DiaChi: "", DienThoai: "", password: "" };
    },
  },
};
</script>

<style scoped>
.manage-admin-user { padding: 20px; }
.button-container { display: flex; justify-content: center; gap: 20px; }
.button-container button { padding: 10px 20px; font-size: 16px; cursor: pointer; }
.table-container { display: flex; flex-direction: column; align-items: center; margin-bottom: 30px; }
.table-header { width: 80%; display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.table-header h2 { margin: 0; flex-grow: 1; text-align: left; }
.header-buttons { display: flex; gap: 10px; }
.close-btn { background: red; color: white; border: none; width: 24px; height: 24px; font-size: 16px; cursor: pointer; line-height: 24px; }
.add-btn { padding: 8px 16px; background-color: #4caf50; color: white; border: none; cursor: pointer; }
table { width: 80%; border-collapse: collapse; }
th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
th { background-color: #f2f2f2; }
.id-column { width: 25%; }
.phone-column { width: 25%; }
.search-row td { padding: 5px; }
.search-row input { width: 100%; padding: 5px; box-sizing: border-box; }
.name-with-action { display: flex; justify-content: space-between; align-items: center; }
.dropdown { position: relative; display: inline-block; margin-left: 10px; }
.dropdown-btn { background: none; border: none; cursor: pointer; font-size: 16px; }
.dropdown-content { display: none; position: absolute; background-color: #f9f9f9; min-width: 100px; box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2); z-index: 1; right: 0; }
.dropdown-content a { color: black; padding: 8px 12px; text-decoration: none; display: block; }
.dropdown-content a:hover { background-color: #f1f1f1; }
.dropdown:hover .dropdown-content { display: block; }
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal { background: white; padding: 20px; border-radius: 5px; width: 400px; max-height: 80vh; overflow-y: auto; }
.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; }
.form-group input, .form-group select { width: 100%; padding: 5px; box-sizing: border-box; }
.form-buttons { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
.submit-btn { padding: 8px 16px; background-color: #4caf50; color: white; border: none; cursor: pointer; }
.cancel-btn { padding: 8px 16px; background-color: #f44336; color: white; border: none; cursor: pointer; }
.confirm-overlay { pointer-events: none; }
.confirm-modal { pointer-events: auto; }
.confirm-buttons { margin-top: 20px; display: flex; justify-content: space-between; }
.confirm-buttons button { padding: 8px 16px; cursor: pointer; }
.confirm-buttons button:first-child { background-color: #4caf50; color: white; border: none; }
.confirm-buttons button:last-child { background-color: #f44336; color: white; border: none; }
</style>