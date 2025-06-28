import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../../services/authService';
import SignInForm from '../../../components/Admin/AdminSignInForm';
import { useAdminStore } from '../../../hooks/useAdminStore';

const AdminSignIn = () => {
  const navigate = useNavigate();
  const { setIsAuthenticatedAdmin } = useAdminStore();
  const [message, setMessage] = useState('');

  useEffect(() => {
    document.title = "Admin - SignIn";
  }, []);

  useEffect(() => {
    // Force light theme for signin page
    document.documentElement.setAttribute('data-bs-theme', 'light');
    localStorage.setItem('theme', 'light');
  }, []);

  const checkRefreshTokenValidity = () => {
    const refreshToken = localStorage.getItem('adminRefreshToken');
    const refreshTokenExpireTime = Number(localStorage.getItem('adminRefreshTokenExpirationTime'));
    const currentTime = Date.now();

    if (refreshToken && refreshTokenExpireTime && refreshTokenExpireTime < currentTime) {
      console.log('Refresh Token đã hết hạn. Đăng xuất người dùng.');
      AuthService.signOut();
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminRefreshToken');
      localStorage.removeItem('adminAccessTokenExpirationTime');
      localStorage.removeItem('adminRefreshTokenExpirationTime');
      setIsAuthenticatedAdmin(false);
      navigate('/admin/signin');
      return false;
    }

    return true;
  };

  const submitSignIn = async (data) => {
    try {
      if (!checkRefreshTokenValidity()) {
        return;
      }

      // Sửa từ signIn thành signin và handle response structure
      const result = await AuthService.signIn(data);

      // Handle wrapped response
      let responseData;
      if (result.success) {
        responseData = result.data;
      } else {
        throw new Error(result.error?.message || 'Login failed');
      }

      const token = responseData.token;
      const roles = responseData.roles;
      const refreshToken = responseData.refreshToken;
      const jwtExpirationTime = responseData.jwtExpirationTime;
      const refreshTokenExpirationTime = responseData.refreshTokenExpirationTime;

      setIsAuthenticatedAdmin(true);

      // Lưu token cho admin (isAdmin = true)
      AuthService.saveToken(token, refreshToken, jwtExpirationTime, refreshTokenExpirationTime, true);

      if (roles && roles.includes('ROLE_ADMIN')) {
        console.log('Xin chào Admin');
        navigate('/admin/dashboard');
      } else {
        setMessage('Bạn không có quyền truy cập trang quản trị.');
      }
    } catch (error) {
      console.log(error);
      setMessage('Tài khoản hoặc mật khẩu không đúng. Vui lòng thử lại.');
    }
  };

  return (
    <div className="page" style={{overflow: 'hidden'}}>
      <SignInForm onSubmitSignIn={submitSignIn} message={message}/>
    </div>
  );
};

export default AdminSignIn;