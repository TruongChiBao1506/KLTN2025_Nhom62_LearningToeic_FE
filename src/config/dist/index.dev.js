"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
// Cấu hình API cho toàn bộ ứng dụng
var config = {
  apiUrl: process.env.REACT_APP_API_URL || "".concat(process.env.LOCALHOST, "/api"),
  mediaUrl: process.env.REACT_APP_MEDIA_URL || process.env.LOCALHOST,
  defaultTimeout: 30000 // 30 seconds

};
var _default = config;
exports["default"] = _default;