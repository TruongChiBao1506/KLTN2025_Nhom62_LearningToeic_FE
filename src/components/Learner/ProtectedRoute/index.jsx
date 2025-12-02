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
        // ✅ Check sessionStorage instead of localStorage for tokens
        const learnerToken = sessionStorage.getItem("learnerToken");
        const teacherToken = sessionStorage.getItem("teacherToken");
        const adminToken = sessionStorage.getItem("adminToken");
        
        // Kiểm tra user data trong localStorage (user data stays)
        const learnerUser = localStorage.getItem("learnerUser");
        const adminUser = localStorage.getItem("user");
        
        console.log("🔍 ProtectedRoute checking tokens:", {
          learnerToken: !!learnerToken,
          teacherToken: !!teacherToken,
          adminToken: !!adminToken,
          learnerUser: !!learnerUser,
          adminUser: !!adminUser
        });

        // Nếu có teacher/admin token và user data, check teacher/admin token validity
        if ((teacherToken || adminToken) && adminUser) {
          try {
            const userObj = JSON.parse(adminUser);
            const hasLearnerRole = userObj.roles && userObj.roles.some(role => 
              typeof role === 'string' ? role === 'ROLE_LEARNER' : role.name === 'ROLE_LEARNER'
            );
            
            console.log("👤 User roles from admin storage:", userObj.roles);
            console.log("🎓 Has learner role:", hasLearnerRole);
            
            if (hasLearnerRole) {
              // User có role learner, check token validity dựa trên loại token họ có
              let tokenType = 'learner';
              if (adminToken) tokenType = 'admin';
              else if (teacherToken) tokenType = 'teacher';
              
              console.log("🔑 Checking token validity for type:", tokenType);
              const isValid = await authService.checkTokensValidity(tokenType);
              setIsAuthenticated(isValid);
              setIsLoading(false);
              return;
            }
          } catch (error) {
            console.error("Error parsing admin user data:", error);
          }
        }

        // Fallback: check learner token nếu có
        if (learnerToken) {
          const learnerAuthenticated = sessionStorage.getItem("learnerAuthenticated");
          if (learnerAuthenticated !== "true") {
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
          }

          const isValid = await authService.checkTokensValidity('learner');
          setIsAuthenticated(isValid);
          setIsLoading(false);
          return;
        }

        // Không có token hợp lệ nào
        console.log("❌ No valid tokens found for learner access");
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
