import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import authService from "../../services/authService";
import useAchievementNotifications from "../../hooks/useAchievementNotifications";
import "./Login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { recordLogin } = useAchievementNotifications();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      setLoading(true);
      const response = await authService.signIn({ username, password });

      if (response && response.data) {
        const {
          token,
          refreshToken,
          roles,
          jwtExpirationTime,
          refreshTokenExpirationTime,
        } = response.data;

        // ✅ Chuẩn hóa: Lưu token và thông tin xác thực
        if (roles.includes("ROLE_ADMIN")) {
          await authService.saveToken(
            token,
            refreshToken,
            jwtExpirationTime,
            refreshTokenExpirationTime,
            'admin'
          );
          // Record login achievement for admin
          await recordLogin(response.data.userId || username);
          navigate("/admin/dashboard");
        } else if (roles.includes("ROLE_TEACHER")) {
          await authService.saveToken(
            token,
            refreshToken,
            jwtExpirationTime,
            refreshTokenExpirationTime,
            'teacher'
          );
          // Record login achievement for teacher
          await recordLogin(response.data.userId || username);
          navigate("/admin/dashboard");
        } else if (roles.includes("ROLE_LEARNER")) {
          await authService.saveToken(
            token,
            refreshToken,
            jwtExpirationTime,
            refreshTokenExpirationTime,
            'learner'
          );
          // Record login achievement for learner
          await recordLogin(response.data.userId || username);
          navigate("/learner/dashboard");
        } else {
          toast.error("Bạn không có quyền truy cập hệ thống!");
        }
      }
    } catch (error) {
      console.error("Đăng nhập thất bại:", error);
      toast.error(
        error.response?.data?.message ||
          "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <div className="login-logo">TOEIC</div>
        <h2 className="login-title">Đăng nhập hệ thống</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Tên đăng nhập"
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu"
              className="form-control"
              required
            />
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>
        <div className="login-options">
          <div className="option-item">
            <a href="/learner/signup" className="option-link">
              Đăng ký tài khoản mới
            </a>
          </div>
          <div className="option-item">
            <a href="/forgot-password" className="option-link">
              Quên mật khẩu?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
