frontend/
│── public/  
│   ├── index.htmlhtml        
│   ├── style.csscss    
│── src/
│   ├── api/           
│   │   ├── axiosClient.js
│   │   ├── bookApi.js
│   │   ├── userApi.js
│   ├── assets/         
│   ├── components/     
│   ├── views/          
│   │   ├── Home.vue
│   │   ├── BookBook.vue
│   │   ├── Login.vue
│   │   ├── Admin.vue
│   │   ├── User.vue
│   ├── router/         
│   │   ├── index.js
│   ├── store/          
│   ├── App.vue         
│   ├── main.js      
│── package.json      
│── vite.config.js      

tôi muốn khi vào chỉ có nút trên bên phải là login,và bên trái là thanh điều hướng lọc sách theo cấu truc backen đac cài đặt,và ở giữa toàn màn hình là hiển thị hình các loại sách đang có ,phía dưới là tên sách mo tả giá mượn và số lượng còn...khi bấm vào sẽ có lựa chọn đang ký mượn sách nếu còn và chờ được duyệt(phải login tài khoản user trước).Còn khi login với vai trò ad min sẽ có các lựa chọn thêm sửa xóa tài khoản và thêm sách mới sửa số lượng giá mượn...và các chức năng khác