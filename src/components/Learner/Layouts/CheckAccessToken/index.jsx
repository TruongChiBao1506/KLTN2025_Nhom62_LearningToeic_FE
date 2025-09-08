import { useEffect } from "react";
import { toast } from "react-toastify";
import authService from "../../../../services/authService";

const CheckAccessToken = () => {
  const checkTokenInterval = 5 * 60 * 1000; // 5 phút

  useEffect(() => {
    // Kiểm tra token khi component được mount
    const checkToken = async () => {
      try {
        // Kiểm tra token của learner
        const isLearnerTokenValid = await authService.checkTokensValidity(
          false
        );

        // Nếu token không hợp lệ và có trang xác thực, chuyển hướng về trang đăng nhập
        if (!isLearnerTokenValid) {
          toast.warning("Phiên học viên đã hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("LearnerAuthenticated");
          localStorage.removeItem("learnerToken");
          localStorage.removeItem("learnerRefreshToken");
          localStorage.removeItem("learnerAccessTokenExpirationTime");
          localStorage.removeItem("learnerRefreshTokenExpirationTime");

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
