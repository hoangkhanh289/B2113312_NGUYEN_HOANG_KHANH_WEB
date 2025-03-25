<template>
  <div class="admin-loan-container">
    <h2>Danh sách yêu cầu mượn sách</h2>

    <!-- Thanh tìm kiếm và lọc -->
    <div class="search-filter">
      <input v-model="searchQuery.MSNV" placeholder="Tìm theo MSNV (Admin duyệt)" />
      <input v-model="searchQuery.MaDocGia" placeholder="Tìm theo Mã độc giả" />
      <input v-model="searchQuery.tenSach" placeholder="Tìm theo Tên sách" />
      <select v-model="searchQuery.trangThai">
        <option value="">Tất cả trạng thái</option>
        <option value="cho_duyet">Chờ duyệt</option>
        <option value="da_muon">Đang mượn</option>
        <option value="da_tra">Đã trả</option>
      </select>
    </div>

    <div v-if="filteredLoans.length === 0" class="no-loans">Không có yêu cầu nào phù hợp</div>
    <div v-else class="loan-list">
      <div v-for="loan in filteredLoans" :key="loan._id" class="loan-item">
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
        <button v-if="loan.trangThai === 'cho_duyet'" @click="approveLoan(loan._id)">Duyệt</button>
        <button v-if="loan.trangThai === 'da_muon'" @click="returnBook(loan._id)">Xác nhận trả</button>
        <button v-if="loan.trangThai === 'da_tra'" @click="deleteLoan(loan._id)">Xóa</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

export default {
  setup() {
    const router = useRouter();
    const loans = ref([]);
    const searchQuery = ref({
      MSNV: "",
      MaDocGia: "",
      tenSach: "",
      trangThai: "",
    });

    const fetchAllLoans = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found");
        }
        const response = await axios.get("http://localhost:3000/api/loans/all-loans", {
          headers: { Authorization: `Bearer ${token}` },
        });
        loans.value = response.data;
      } catch (error) {
        console.error("Lỗi khi lấy danh sách yêu cầu:", error);
        alert("Lỗi: " + (error.response?.data?.message || error.message));
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem("token");
          router.push("/login");
        }
      }
    };

    const approveLoan = async (loanId) => {
      try {
        const token = localStorage.getItem("token");
        await axios.post(
          "http://localhost:3000/api/loans/approve",
          { loanId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Duyệt yêu cầu thành công");
        fetchAllLoans();
      } catch (error) {
        alert("Lỗi khi duyệt: " + (error.response?.data?.message || error.message));
      }
    };

    const returnBook = async (loanId) => {
      try {
        const token = localStorage.getItem("token");
        await axios.post(
          "http://localhost:3000/api/loans/return",
          { loanId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Xác nhận trả sách thành công");
        fetchAllLoans();
      } catch (error) {
        alert("Lỗi khi xác nhận trả: " + (error.response?.data?.message || error.message));
      }
    };

    const deleteLoan = async (loanId) => {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:3000/api/loans/delete/${loanId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Xóa yêu cầu thành công");
        fetchAllLoans();
      } catch (error) {
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

    // Logic lọc danh sách loans
    const filteredLoans = computed(() => {
      return loans.value.filter((loan) => {
        const matchesMSNV = searchQuery.value.MSNV
          ? loan.approvedBy?.toLowerCase().includes(searchQuery.value.MSNV.toLowerCase())
          : true;
        const matchesMaDocGia = searchQuery.value.MaDocGia
          ? loan.userId.MaDocGia.toLowerCase().includes(searchQuery.value.MaDocGia.toLowerCase())
          : true;
        const matchesTenSach = searchQuery.value.tenSach
          ? loan.bookId.tenSach.toLowerCase().includes(searchQuery.value.tenSach.toLowerCase())
          : true;
        const matchesTrangThai = searchQuery.value.trangThai
          ? loan.trangThai === searchQuery.value.trangThai
          : true;

        return matchesMSNV && matchesMaDocGia && matchesTenSach && matchesTrangThai;
      });
    });

    const filterLoans = () => {
      // Gọi lại để đảm bảo giao diện cập nhật (thực tế computed đã tự động cập nhật)
      fetchAllLoans();
    };

    onMounted(fetchAllLoans);

    return {
      loans,
      searchQuery,
      filteredLoans,
      approveLoan,
      returnBook,
      deleteLoan,
      formatDate,
      formatStatus,
      filterLoans,
    };
  },
};
</script>

<style scoped>
.admin-loan-container {
  padding: 20px;
}

.search-filter {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-filter input,
.search-filter select {
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 3px;
}

.search-filter button {
  padding: 5px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.search-filter button:hover {
  opacity: 0.9;
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

button {
  margin-right: 10px;
  padding: 5px 10px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

button:nth-child(1) {
  background-color: #28a745;
  color: white;
}

button:nth-child(2) {
  background-color: #007bff;
  color: white;
}

button:nth-child(3) {
  background-color: #dc3545;
  color: white;
}

button:hover {
  opacity: 0.9;
}

.no-loans {
  text-align: center;
  color: #888;
}
</style>