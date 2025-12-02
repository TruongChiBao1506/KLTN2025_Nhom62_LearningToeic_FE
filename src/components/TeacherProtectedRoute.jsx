import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import authService from "../services/authService";

const TeacherProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // ✅ Check sessionStorage instead of localStorage
        const teacherToken = sessionStorage.getItem("teacherToken");
        const adminUser = localStorage.getItem("user"); // Teacher data cũng lưu trong 'user'
        
        console.log("🔍 TeacherProtectedRoute checking:", {
          teacherToken: !!teacherToken,
          adminUser: !!adminUser
        });

        if (teacherToken && adminUser) {
          try {
            const userObj = JSON.parse(adminUser);
            const hasTeacherRole = userObj.roles && userObj.roles.some(role => 
              typeof role === 'string' ? role === 'ROLE_TEACHER' : role.name === 'ROLE_TEACHER'
            );
            
            console.log("�‍� Has teacher role:", hasTeacherRole);
            
            if (hasTeacherRole) {
              // Check teacher token validity
              const isValid = await authService.checkTokensValidity('teacher');
              console.log("🔑 Teacher token valid:", isValid);
              setIsAuthenticated(isValid);
              setIsLoading(false);
              return;
            } else {
              console.log("❌ User doesn't have teacher role");
              setIsAuthenticated(false);
              setIsLoading(false);
              return;
            }
          } catch (error) {
            console.error("Error parsing teacher user data:", error);
          }
        }

        // Không có teacher token hợp lệ
        console.log("❌ No valid teacher tokens found");
        setIsAuthenticated(false);
        setIsLoading(false);
      } catch (error) {
        console.error("Lỗi khi kiểm tra xác thực teacher:", error);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect về trang đăng nhập admin nếu không có quyền
    return <Navigate to="/auth/admin/signin" state={{ from: location }} replace />;
  }

  return children;
};

export default TeacherProtectedRoute;
