<template>
  <div class="loan-container">
    <h2>Danh sách mượn sách của bạn</h2>
    <div v-if="loans.length === 0" class="no-loans">Bạn chưa mượn sách nào</div>
    <div v-else class="loan-list">
      <div v-for="loan in loans" :key="loan._id" class="loan-item">
        <p><strong>Tên sách:</strong> {{ loan.bookId.tenSach }}</p>
        <p><strong>Mã độc giả:</strong> {{ loan.userId.MaDocGia }}</p>
        <p><strong>Ngày mượn:</strong> {{ formatDate(loan.ngayMuon) }}</p>
        <p><strong>Ngày trả:</strong> {{ formatDate(loan.ngayTra) }}</p>
        <p><strong>Số lượng:</strong> {{ loan.soLuong }}</p>
        <p><strong>Lần mượn:</strong> {{ loan.lanMuon }}</p>
        <p><strong>Trạng thái:</strong> {{ formatStatus(loan.trangThai) }}</p>
        <p v-if="loan.trangThai === 'da_muon' || loan.trangThai === 'da_tra'">
          <strong>Được duyệt bởi:</strong> {{ loan.approvedBy || "Chưa có thông tin" }}
        </p>
        <button v-if="loan.trangThai === 'cho_duyet'" @click="deleteLoan(loan._id)">Xóa</button>
      </div>
    </div>

    <!-- Form đăng ký mượn sách -->
    <div v-if="showBorrowForm" class="borrow-form">
      <h3>Đăng ký mượn sách: {{ selectedBook.tenSach }}</h3>
      <form @submit.prevent="submitBorrow">
        <div>
          <label>Mã độc giả:</label>
          <input :value="user?.MaDocGia" disabled />
        </div>
        <div>
          <label>Ngày mượn:</label>
          <input type="date" v-model="borrowForm.ngayMuon" :min="today" required />
        </div>
        <div>
          <label>Ngày trả:</label>
          <input type="date" v-model="borrowForm.ngayTra" :min="borrowForm.ngayMuon" :max="maxReturnDate" required />
        </div>
        <div>
          <label>Số lượng:</label>
          <input type="number" v-model.number="borrowForm.soLuong" :max="selectedBook.soQuyen" min="1" required />
        </div>
        <button type="submit">Đăng ký</button>
        <button type="button" @click="showBorrowForm = false">Hủy</button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

export default {
  setup() {
    const router = useRouter();
    const loans = ref([]);
    const showBorrowForm = ref(false);
    const selectedBook = ref(null);
    const user = ref(null);
    const borrowForm = ref({
      ngayMuon: "",
      ngayTra: "",
      soLuong: 1,
    });

    const today = new Date().toISOString().split("T")[0];
    const maxReturnDate = computed(() => {
      if (!borrowForm.value.ngayMuon) return "";
      const maxDate = new Date(borrowForm.value.ngayMuon);
      maxDate.setDate(maxDate.getDate() + 30);
      return maxDate.toISOString().split("T")[0];
    });

    const fetchUserLoans = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found");
        }
        const response = await axios.get("http://localhost:3000/api/loans/my-loans", {
          headers: { Authorization: `Bearer ${token}` },
        });
        loans.value = response.data;
      } catch (error) {
        console.error("Lỗi khi lấy danh sách mượn:", error);
        alert("Lỗi khi tải danh sách mượn: " + (error.response?.data?.message || error.message));
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem("token");
          router.push("/login");
        }
      }
    };

    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found");
        }
        const response = await axios.get("http://localhost:3000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        user.value = response.data.profile;
        console.log("User info:", user.value);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
        alert("Lỗi khi tải thông tin người dùng: " + (error.response?.data?.message || error.message));
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem("token");
          router.push("/login");
        }
      }
    };

    const submitBorrow = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!selectedBook.value) {
          throw new Error("Chưa chọn sách để mượn");
        }
        const response = await axios.post(
          "http://localhost:3000/api/loans/borrow",
          {
            bookId: selectedBook.value._id,
            ngayMuon: borrowForm.value.ngayMuon,
            ngayTra: borrowForm.value.ngayTra,
            soLuong: borrowForm.value.soLuong,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert(response.data.message);
        showBorrowForm.value = false;
        fetchUserLoans();
      } catch (error) {
        console.error("Lỗi khi đăng ký mượn:", error);
        alert("Lỗi: " + (error.response?.data?.message || error.message));
      }
    };

    const deleteLoan = async (loanId) => {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:3000/api/loans/delete/${loanId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Xóa yêu cầu mượn thành công");
        fetchUserLoans();
      } catch (error) {
        console.error("Lỗi khi xóa yêu cầu:", error);
        alert("Lỗi khi xóa: " + (error.response?.data?.message || error.message));
      }
    };

    const formatDate = (date) => new Date(date).toLocaleDateString("vi-VN");
    const formatStatus = (status) => {
      const statusMap = {
        cho_duyet: "Chờ duyệt",
        da_muon: "Đang mượn",
        da_tra: "Đã trả",
      };
      return statusMap[status] || status;
    };

    onMounted(() => {
      fetchUserLoans();
      fetchUserInfo();
    });

    return {
      loans,
      showBorrowForm,
      selectedBook,
      user,
      borrowForm,
      today,
      maxReturnDate,
      submitBorrow,
      deleteLoan,
      formatDate,
      formatStatus,
    };
  },
};
</script>

<style scoped>
.loan-container {
  padding: 20px;
}
.loan-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.loan-item {
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 5px;
  width: 300px;
}
.borrow-form {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.borrow-form form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>