import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import "./style.css";

const Verification = () => {
  const [verificationStatus, setVerificationStatus] = useState({
    loading: true,
    verified: false,
    error: null,
  });

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyAccount = async () => {
      if (!token) {
        setVerificationStatus({
          loading: false,
          verified: false,
          error: "Không tìm thấy token xác thực. Vui lòng kiểm tra lại email của bạn.",
        });
        return;
      }

      try {
        // Gọi API xác thực
        const response = await axios.get(`http://localhost:9004/api/auth/verify?token=${token}`);
        
        if (response.status === 200) {
          setVerificationStatus({
            loading: false,
            verified: true,
            error: null,
          });
        } else {
          throw new Error("Xác thực không thành công");
        }
      } catch (error) {
        setVerificationStatus({
          loading: false,
          verified: false,
          error: error.response?.data?.message || "Đã xảy ra lỗi khi xác thực tài khoản. Vui lòng thử lại sau.",
        });
      }
    };

    verifyAccount();
  }, [token]);

  if (verificationStatus.loading) {
    return (
      <div className="verification-container">
        <div className="verification-box">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang xác thực...</span>
          </div>
          <h3 className="mt-3">Đang xác thực tài khoản của bạn...</h3>
        </div>
      </div>
    );
  }

  if (verificationStatus.error) {
    return (
      <div className="verification-container">
        <div className="verification-box error">
          <div className="error-icon">
            <i className="fas fa-times-circle"></i>
          </div>
          <h3>Xác thực không thành công</h3>
          <p>{verificationStatus.error}</p>
          <div className="mt-4">
            <Link to="/signin" className="btn btn-primary me-3">
              Đăng nhập
            </Link>
            <Link to="/" className="btn btn-outline-secondary">
              Trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="verification-container">
      <div className="verification-box success">
        <div className="success-icon">
          <i className="fas fa-check-circle"></i>
        </div>
        <h3>Xác thực thành công!</h3>
        <p>Tài khoản của bạn đã được xác thực thành công. Bạn có thể đăng nhập ngay bây giờ.</p>
        <div className="mt-4">
          <Link to="/signin" className="btn btn-success me-3">
            Đăng nhập ngay
          </Link>
          <Link to="/" className="btn btn-outline-secondary">
            Trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Verification;
