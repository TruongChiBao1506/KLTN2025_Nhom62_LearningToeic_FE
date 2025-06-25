import React from 'react';
import { Link } from 'react-router-dom';
import './style.css';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="error-code">404</h1>
        <h2 className="error-title">Không tìm thấy trang</h2>
        <p className="error-message">
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
        <Link to="/" className="back-home-btn">
          Trở về trang chủ
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
