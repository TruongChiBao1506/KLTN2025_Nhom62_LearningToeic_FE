// Cấu hình API cho toàn bộ ứng dụng
const config = {
  apiUrl: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  mediaUrl: process.env.REACT_APP_MEDIA_URL || "http://localhost:5000",
  defaultTimeout: 30000, // 30 seconds
};

export default config;
