import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    port: 8080,
    host:'0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:3000',  // Địa chỉ của backend API của bạn
        changeOrigin: true,  // Thay đổi tiêu đề 'Origin' của yêu cầu
        secure: false,  // Chỉ cần nếu backend của bạn không dùng HTTPS
      },
    },
  },
})
