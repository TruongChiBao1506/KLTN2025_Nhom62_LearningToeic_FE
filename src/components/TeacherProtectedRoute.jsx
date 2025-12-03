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
        const teacherToken = sessionStorage.getItem("teacherToken");
        const adminToken = sessionStorage.getItem("adminToken");
        const user = localStorage.getItem("user");
        
        console.log("🔍 TeacherProtectedRoute checking:", {
          teacherToken: !!teacherToken,
          adminToken: !!adminToken,
          user: !!user
        });

        if (user) {
          try {
            const userObj = JSON.parse(user);
            
            // ✅ Check if user has ADMIN role (admin can access teacher routes)
            const hasAdminRole = userObj.roles && userObj.roles.some(role => 
              typeof role === 'string' ? role === 'ROLE_ADMIN' : role.name === 'ROLE_ADMIN'
            );
            
            // ✅ Check if user has TEACHER role
            const hasTeacherRole = userObj.roles && userObj.roles.some(role => 
              typeof role === 'string' ? role === 'ROLE_TEACHER' : role.name === 'ROLE_TEACHER'
            );
            
            console.log("👨‍💼 Has admin role:", hasAdminRole);
            console.log("👨‍🏫 Has teacher role:", hasTeacherRole);
            
            // Admin can access teacher routes
            if (hasAdminRole && adminToken) {
              const isValid = await authService.checkTokensValidity('admin');
              console.log("🔑 Admin token valid:", isValid);
              setIsAuthenticated(isValid);
              setIsLoading(false);
              return;
            }
            
            // Teacher can access their routes
            if (hasTeacherRole && teacherToken) {
              const isValid = await authService.checkTokensValidity('teacher');
              console.log("🔑 Teacher token valid:", isValid);
              setIsAuthenticated(isValid);
              setIsLoading(false);
              return;
            }
            
            console.log("❌ User doesn't have required role or token");
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
          } catch (error) {
            console.error("Error parsing user data:", error);
          }
        }

        // Không có token hợp lệ
        console.log("❌ No valid tokens found");
        setIsAuthenticated(false);
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
