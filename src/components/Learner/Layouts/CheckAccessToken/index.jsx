import { useEffect } from "react";
import { toast } from "react-toastify";
import authService from "../../../../services/authService";

const CheckAccessToken = () => {
  const checkTokenInterval = 15 * 60 * 1000; // 15 phút - giảm tần suất check

  useEffect(() => {
    // Kiểm tra token khi component được mount
    const checkToken = async () => {
      try {
        // ✅ Xác định loại token cần kiểm tra dựa trên token trong sessionStorage
        const learnerToken = sessionStorage.getItem("learnerToken");
        const teacherToken = sessionStorage.getItem("teacherToken");
        const adminToken = sessionStorage.getItem("adminToken");
        
        let tokenType = 'learner'; // default
        let isTokenValid = false;
        
        // Kiểm tra theo thứ tự ưu tiên: admin -> teacher -> learner
        if (adminToken) {
          tokenType = 'admin';
          isTokenValid = await authService.checkTokensValidity('admin');
        } else if (teacherToken) {
          tokenType = 'teacher';
          isTokenValid = await authService.checkTokensValidity('teacher');
        } else if (learnerToken) {
          tokenType = 'learner';
          isTokenValid = await authService.checkTokensValidity('learner');
        } else {
          // Không có token nào
          console.log("No tokens found, redirecting to signin");
          if (
            !window.location.href.includes("/signin") &&
            !window.location.href.includes("/signup") &&
            !window.location.href.includes("/verification")
          ) {
            window.location.href = "/signin";
          }
          return;
        }

        // Throttle logging để tránh spam - chỉ log khi có vấn đề
        if (!isTokenValid) {
          console.log("🔍 CheckAccessToken - tokenType:", tokenType, "isValid:", isTokenValid);
        }

        // Nếu token không hợp lệ, clear và redirect
        if (!isTokenValid) {
          toast.warning(`Phiên ${tokenType} đã hết hạn. Vui lòng đăng nhập lại.`);
          authService.clearTokens(tokenType);

          // Không chuyển hướng nếu người dùng đang ở trang đăng nhập hoặc đăng ký
          if (
            !window.location.href.includes("/signin") &&
            !window.location.href.includes("/signup") &&
            !window.location.href.includes("/verification")
          ) {
            window.location.href = "/signin";
          }
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra token:", error);
      }
    };

    // Gọi hàm kiểm tra ngay khi component được mount
    checkToken();

    // Thiết lập kiểm tra định kỳ
    const tokenInterval = setInterval(checkToken, checkTokenInterval);

    return () => {
      clearInterval(tokenInterval);
    };
  }, [checkTokenInterval]);

  return null; // Component này không render gì, chỉ chạy logic kiểm tra
};

export default CheckAccessToken;
