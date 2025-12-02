import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../../services/authService';
import SignInForm from '../../../components/Admin/AdminSignInForm';
import { useAuthStore } from '../../../hooks/useAuthStore';

const AdminSignIn = () => {
  const navigate = useNavigate();
  const { setInfo, setIsAuthenticated, setRole } = useAuthStore();
  const [message, setMessage] = useState('');

  useEffect(() => {
    document.title = "Admin/Teacher - SignIn";
  }, []);

  useEffect(() => {
    // Force light theme for signin page
    document.documentElement.setAttribute('data-bs-theme', 'light');
    localStorage.setItem('theme', 'light');
  }, []);

  useEffect(() => {
    // Check if already logged in
    const checkExistingSession = async () => {
      console.log('🔍 Checking existing session...');
      
      const adminToken = localStorage.getItem('adminToken');
      const teacherToken = localStorage.getItem('teacherToken');
      const userStr = localStorage.getItem('user');
      
      if ((adminToken || teacherToken) && userStr) {
        try {
          const user = JSON.parse(userStr);
          console.log('Existing user:', user);
          console.log('User role:', user?.role);
          
          // Verify token validity before redirecting
          const userType = adminToken ? 'admin' : 'teacher';
          const isValid = await AuthService.checkTokensValidity(userType);
          
          if (isValid && (user.role === 'admin' || user.role === 'teacher')) {
            console.log('✅ Valid session found, redirecting...');
            navigate('/admin/dashboard', { replace: true });
          } else {
            console.log('❌ Invalid session, clearing tokens...');
            AuthService.clearTokens(userType);
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Error checking session:', error);
          // Clear invalid data
          if (adminToken) {
            AuthService.clearTokens('admin');
          }
          if (teacherToken) {
            AuthService.clearTokens('teacher');
          }
          localStorage.removeItem('user');
        }
      }
    };
    
    checkExistingSession();
  }, [navigate]);

  const checkRefreshTokenValidity = (userType) => {
    const refreshTokenKey = userType === 'admin' ? 'adminRefreshToken' : 'teacherRefreshToken';
    const refreshExpireKey = userType === 'admin' ? 'adminRefreshTokenExpirationTime' : 'teacherRefreshTokenExpirationTime';
    
    const refreshToken = localStorage.getItem(refreshTokenKey);
    const refreshTokenExpireTime = Number(localStorage.getItem(refreshExpireKey));
    const currentTime = Date.now();

    if (refreshToken && refreshTokenExpireTime && refreshTokenExpireTime < currentTime) {
      console.log(`Refresh Token đã hết hạn (${userType}). Đăng xuất người dùng.`);
      AuthService.signOut();
      AuthService.clearTokens(userType);
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      navigate('/auth/admin/signin');
      return false;
    }

    return true;
  };

  const submitSignIn = async (data) => {
    try {
      console.log('🔐 Attempting login...');

      const result = await AuthService.signIn(data);
      console.log('📥 Login response:', result);

      // Handle wrapped response
      let responseData;
      if (result.success) {
        responseData = result.data;
      } else {
        throw new Error(result.error?.message || 'Login failed');
      }

      console.log('📦 Response data:', responseData);
      console.log('🖼️ Avatar fields in response:', {
        image: responseData.image,
        avatar: responseData.avatar,
        profileImage: responseData.profileImage,
        profileImageUrl: responseData.profileImageUrl
      });

      const token = responseData.token;
      const roles = responseData.roles; // Array like ['ROLE_ADMIN'] or ['ROLE_TEACHER']
      const refreshToken = responseData.refreshToken;
      const jwtExpirationTime = responseData.jwtExpirationTime;
      const refreshTokenExpirationTime = responseData.refreshTokenExpirationTime;

      console.log('👤 User roles:', roles);

      // Check if user has admin or teacher role
      const hasAdminRole = roles && roles.includes('ROLE_ADMIN');
      const hasTeacherRole = roles && roles.includes('ROLE_TEACHER');

      if (!hasAdminRole && !hasTeacherRole) {
        console.log('⛔ Access denied - no admin or teacher role');
        setMessage('Bạn không có quyền truy cập trang quản trị. Chỉ Admin và Teacher mới được phép.');
        return;
      }

      // Determine user role and save appropriate tokens
      // Priority: ADMIN > TEACHER (nếu có cả 2 role thì ưu tiên admin)
      let userRole = 'teacher'; // default to teacher
      let tokenType = 'teacher'; // for saving tokens
      
      if (hasAdminRole) {
        userRole = 'admin';
        tokenType = 'admin';
      }

      console.log('🎯 User role:', userRole, 'Token type:', tokenType);

      // Check refresh token validity for the determined user type
      if (!checkRefreshTokenValidity(tokenType)) {
        return;
      }

      // Create user object to store in localStorage
      const user = {
        _id: responseData.id,
        id: responseData.id,
        username: responseData.username,
        email: responseData.email,
        fullName: responseData.name,
        name: responseData.name,
        role: userRole, // 'admin' or 'teacher'
        roles: roles // Keep original roles array
      };

      console.log('💾 Storing user data:', user);

      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(user));

      // Lưu thông tin admin vào Redux store
      const adminInfo = {
        id: responseData.id,
        username: responseData.username,
        email: responseData.email,
        name: responseData.name,
        roles: responseData.roles,
        avatar: responseData.image || responseData.avatar || responseData.profileImage || null, // ✅ Add avatar field
      };
      
      console.log('💾 Saving to Redux store with avatar:', adminInfo.avatar);
      
      setInfo(adminInfo);
      setIsAuthenticated(true);
      setRole(userRole); // Set role as 'admin' or 'teacher'

      // ✅ Chuẩn hóa: Sử dụng saveToken với userType tương ứng
      await AuthService.saveToken(
        token, 
        refreshToken, 
        jwtExpirationTime, 
        refreshTokenExpirationTime, 
        tokenType // 'admin' or 'teacher'
      );

      console.log('✅ Login successful!');
      
      // ✅ Fetch user profile to get avatar
      try {
        const userService = (await import('../../../services/userService')).default;
        const userProfile = await userService.getCurrentUser();
        
        console.log('📥 Fetched user profile:', userProfile);
        
        if (userProfile) {
          const avatarUrl = userProfile.image || userProfile.avatar || userProfile.profileImage || null;
          console.log('🖼️ Avatar URL from profile:', avatarUrl);
          
          // ✅ Update Redux store with complete user info including avatar
          setInfo({
            id: userProfile.id || userProfile._id,
            username: userProfile.username,
            email: userProfile.email,
            name: userProfile.name || userProfile.fullName,
            roles: userProfile.roles || responseData.roles,
            avatar: avatarUrl, // ✅ Avatar from profile API
          });
          
          console.log('✅ Redux store updated with avatar from profile API');
        }
      } catch (profileError) {
        console.warn('⚠️ Failed to fetch user profile, avatar may not display:', profileError);
        // Don't block login flow if profile fetch fails
      }
      
      console.log('🚀 Navigating to dashboard...');
      
      if (hasAdminRole) {
        console.log('Xin chào Admin');
      } else if (hasTeacherRole) {
        console.log('Xin chào Teacher');
      }

      navigate('/admin/dashboard');
      
    } catch (error) {
      console.error('❌ Login error:', error);
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