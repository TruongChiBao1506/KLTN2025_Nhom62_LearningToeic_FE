// Cấu hình API cho toàn bộ ứng dụng
const config = {
  apiUrl: process.env.REACT_APP_API_URL || `${process.env.LOCALHOST}/api`,
  mediaUrl: process.env.REACT_APP_MEDIA_URL || process.env.LOCALHOST,
  defaultTimeout: 30000, // 30 seconds
};

export default config;
