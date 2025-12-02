import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import authService from "../services/authService";

const AdminProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // ✅ Check sessionStorage instead of localStorage
        const adminToken = sessionStorage.getItem("adminToken");
        const adminUser = localStorage.getItem("user"); // User data stays in localStorage
        
        console.log("🔍 AdminProtectedRoute checking:", {
          adminToken: !!adminToken,
          adminUser: !!adminUser
        });

        // ✅ Nếu không có token, redirect ngay
        if (!adminToken || !adminUser) {
          console.log("❌ No admin tokens found");
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        try {
          const userObj = JSON.parse(adminUser);
          const hasAdminRole = userObj.roles && userObj.roles.some(role => 
            typeof role === 'string' ? role === 'ROLE_ADMIN' : role.name === 'ROLE_ADMIN'
          );
          
          console.log("👑 Has admin role:", hasAdminRole);
          
          if (!hasAdminRole) {
            console.log("❌ User doesn't have admin role");
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
          }

          // ✅ Chỉ check token validity 1 lần, không retry
          console.log("🔑 Checking admin token validity...");
          const isValid = await authService.checkTokensValidity('admin');
          console.log("🔑 Admin token valid:", isValid);
          
          // ✅ Nếu token không hợp lệ, clear storage và redirect
          if (!isValid) {
            console.log("❌ Token invalid, clearing storage...");
            authService.clearTokens('admin');
            localStorage.removeItem('user');
            setIsAuthenticated(false);
          } else {
            setIsAuthenticated(true);
          }
          
          setIsLoading(false);
        } catch (error) {
          console.error("Error parsing admin user data:", error);
          authService.clearTokens('admin');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra xác thực admin:", error);
        authService.clearTokens('admin');
        localStorage.removeItem('user');
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
    return <Navigate to="/auth/admin/signin" state={{ from: location }} replace />;
  }

  return children;
};

export default AdminProtectedRoute;