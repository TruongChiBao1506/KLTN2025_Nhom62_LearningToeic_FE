import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import authService from "../../../services/authService";

const ProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Kiểm tra cơ bản trước - xem có learner token không
        const learnerToken = localStorage.getItem("learnerToken");
        const learnerAuthenticated = localStorage.getItem(
          "learnerAuthenticated"
        );

        if (!learnerToken || learnerAuthenticated !== "true") {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Kiểm tra token của learner chi tiết
        const isValid = await authService.checkLearnerTokenValidity();

        setIsAuthenticated(isValid);
        setIsLoading(false);
      } catch (error) {
        console.error("Lỗi khi kiểm tra xác thực:", error);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    // Trạng thái đang tải
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect về trang đăng nhập nếu không có xác thực
    return <Navigate to="/auth/signin" state={{ from: location }} replace />;
  }

  // Nếu đã xác thực, hiển thị children
  return children;
};

export default ProtectedRoute;
