import axiosClient from "./axiosClient";

class AuthService {
  constructor(baseUrl = "/auth") {
    this.baseUrl = baseUrl;
  }

  async signUp(data) {
    const response = await axiosClient.post(`${this.baseUrl}/signup`, data);
    return { success: true, data: response };
  }

  async signIn(data) {
    const response = await axiosClient.post(`${this.baseUrl}/signin`, data);
    return { success: true, data: response };
  }

  async signOut() {
    // ✅ Clear tokens from sessionStorage (secure storage)
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("user");
    
    // Clear all user types
    ['admin', 'teacher', 'learner'].forEach(type => {
      const prefix = this.getTokenPrefix(type);
      sessionStorage.removeItem(`${prefix}Token`);
      sessionStorage.removeItem(`${prefix}RefreshToken`);
      sessionStorage.removeItem(`${prefix}AccessTokenExpirationTime`);
      sessionStorage.removeItem(`${prefix}RefreshTokenExpirationTime`);
    });
    
    sessionStorage.removeItem("learnerAuthenticated");
    localStorage.removeItem("learnerUser");
    localStorage.removeItem("user");
    
    // ✅ Clean up old localStorage tokens (backward compatibility)
    const oldKeys = [
      'adminToken', 'adminRefreshToken', 'adminAccessTokenExpirationTime', 'adminRefreshTokenExpirationTime',
      'teacherToken', 'teacherRefreshToken', 'teacherAccessTokenExpirationTime', 'teacherRefreshTokenExpirationTime',
      'learnerToken', 'learnerRefreshToken', 'learnerAccessTokenExpirationTime', 'learnerRefreshTokenExpirationTime',
      'learnerAuthenticated'
    ];
    oldKeys.forEach(key => localStorage.removeItem(key));

    try {
      const response = await axiosClient.post(`${this.baseUrl}/signout`);
      return response.data;
    } catch (error) {
      console.log("Signout server call failed, but local tokens cleared");
      return { success: true };
    }
  }

  async refreshToken(data) {
    const response = await axiosClient.post(
      `${this.baseUrl}/refreshtoken`,
      data
    );
    return response.data;
  }

  // ✅ IMPROVED: Save tokens to sessionStorage for better security
  async saveToken(
    token,
    refreshToken,
    jwtExpirationTime,
    refreshTokenExpirationTime,
    userType = 'learner' // 'admin' | 'teacher' | 'learner'
  ) {
    const prefix = this.getTokenPrefix(userType);
    
    // ✅ Use sessionStorage instead of localStorage
    // sessionStorage clears when browser/tab closes = better security
    sessionStorage.setItem(`${prefix}Token`, token);
    sessionStorage.setItem(`${prefix}RefreshToken`, refreshToken);
    sessionStorage.setItem(
      `${prefix}AccessTokenExpirationTime`,
      (Date.now() + jwtExpirationTime).toString()
    );
    sessionStorage.setItem(
      `${prefix}RefreshTokenExpirationTime`,
      (Date.now() + refreshTokenExpirationTime).toString()
    );
    
    // Set authenticated flag for learners
    if (userType === 'learner') {
      sessionStorage.setItem("learnerAuthenticated", "true");
    }
    
    console.log(`✅ Saved ${userType} tokens to sessionStorage (secure)`);
  }

  // ✅ IMPROVED: Check tokens from sessionStorage
  async checkTokensValidity(userType = 'learner') {
    const prefix = this.getTokenPrefix(userType);
    
    const token = sessionStorage.getItem(`${prefix}Token`);
    const refreshToken = sessionStorage.getItem(`${prefix}RefreshToken`);
    const accessTokenExpireTime = sessionStorage.getItem(`${prefix}AccessTokenExpirationTime`);
    const refreshTokenExpireTime = sessionStorage.getItem(`${prefix}RefreshTokenExpirationTime`);

    // Throttle logging để tránh spam - chỉ log 1 lần mỗi 30 giây
    const logKey = `lastTokenCheck_${userType}`;
    const lastLog = parseInt(sessionStorage.getItem(logKey) || '0');
    const now = Date.now();
    const shouldLog = (now - lastLog) > 30000; // 30 seconds

    if (shouldLog) {
      console.log(`🔍 checkTokensValidity (${userType}):`, {
        hasToken: !!token,
        hasRefreshToken: !!refreshToken,
        accessExpiration: accessTokenExpireTime ? new Date(Number(accessTokenExpireTime)).toLocaleString() : "None",
        refreshExpiration: refreshTokenExpireTime ? new Date(Number(refreshTokenExpireTime)).toLocaleString() : "None",
        currentTime: new Date().toLocaleString()
      });
      sessionStorage.setItem(logKey, now.toString());
    }

    // Check if access token is still valid
    if (token && accessTokenExpireTime && Number(accessTokenExpireTime) >= Date.now()) {
      if (shouldLog) {
        console.log(`✅ Access token is valid (${userType})`);
      }
      return true;
    }

    // Try to refresh token
    if (refreshToken && refreshTokenExpireTime && Number(refreshTokenExpireTime) >= Date.now()) {
      if (shouldLog) {
        console.log(`🔄 Access token expired, trying to refresh (${userType})...`);
      }
      try {
        const response = await this.refreshToken({ refreshToken });
        if (response && response.token) {
          if (shouldLog) {
            console.log(`✅ Token refreshed successfully (${userType})`);
          }
          
          // ✅ Save new tokens to sessionStorage
          sessionStorage.setItem(`${prefix}Token`, response.token);
          if (response.refreshToken) {
            sessionStorage.setItem(`${prefix}RefreshToken`, response.refreshToken);
          }
          if (response.jwtExpirationTime) {
            sessionStorage.setItem(
              `${prefix}AccessTokenExpirationTime`,
              (Date.now() + response.jwtExpirationTime).toString()
            );
          }
          if (response.refreshTokenExpirationTime) {
            sessionStorage.setItem(
              `${prefix}RefreshTokenExpirationTime`,
              (Date.now() + response.refreshTokenExpirationTime).toString()
            );
          }
          
          return true;
        }
        if (shouldLog) {
          console.log(`❌ Refresh response invalid (${userType})`);
        }
        // Clear tokens on invalid response
        this.clearTokens(userType);
        return false;
      } catch (error) {
        // ✅ Handle 403 specifically - clear tokens immediately
        if (error.response && error.response.status === 403) {
          console.error(`❌ 403 Forbidden: Refresh token expired or invalid (${userType})`);
          this.clearTokens(userType);
          return false;
        }
        
        if (shouldLog) {
          console.log(`❌ Error refreshing token (${userType}):`, error.message || error);
        }
        
        // Clear tokens on any error to prevent retry loops
        this.clearTokens(userType);
        return false;
      }
    }

    // No valid tokens - clear storage
    if (shouldLog) {
      console.log(`❌ No valid tokens found, clearing storage (${userType})`);
    }
    this.clearTokens(userType);
    return false;
  }

  // ✅ IMPROVED: Clear tokens from sessionStorage
  clearTokens(userType = 'learner') {
    const prefix = this.getTokenPrefix(userType);
    
    sessionStorage.removeItem(`${prefix}Token`);
    sessionStorage.removeItem(`${prefix}RefreshToken`);
    sessionStorage.removeItem(`${prefix}AccessTokenExpirationTime`);
    sessionStorage.removeItem(`${prefix}RefreshTokenExpirationTime`);
    
    if (userType === 'learner') {
      sessionStorage.removeItem('learnerAuthenticated');
      localStorage.removeItem('learnerUser'); // User data can stay in localStorage
    }
    
    console.log(`✅ Cleared ${userType} tokens from sessionStorage`);
  }

  // ✅ IMPROVED: Clear all auth data from both storages
  clearAuth() {
    // Clear user data (keep in localStorage for UX)
    localStorage.removeItem('user');
    localStorage.removeItem('learnerUser');
    
    // Clear all tokens from sessionStorage
    ['admin', 'teacher', 'learner'].forEach(type => {
      this.clearTokens(type);
    });
    
    // Clear old localStorage tokens (backward compatibility)
    const oldKeys = [
      'adminToken', 'adminRefreshToken', 'adminAccessTokenExpirationTime', 'adminRefreshTokenExpirationTime',
      'teacherToken', 'teacherRefreshToken', 'teacherAccessTokenExpirationTime', 'teacherRefreshTokenExpirationTime',
      'learnerToken', 'learnerRefreshToken', 'learnerAccessTokenExpirationTime', 'learnerRefreshTokenExpirationTime',
      'learnerAuthenticated'
    ];
    oldKeys.forEach(key => localStorage.removeItem(key));
    
    console.log('✅ Cleared all authentication data (sessionStorage + localStorage)');
  }

  // ✅ IMPROVED: Check if token is expired (from sessionStorage)
  isTokenExpired(userType = 'learner') {
    const prefix = this.getTokenPrefix(userType);
    const expTime = sessionStorage.getItem(`${prefix}AccessTokenExpirationTime`);
    
    if (!expTime) return true;
    
    return Date.now() >= parseInt(expTime);
  }

  // ✅ NEW: Get token prefix for consistency
  getTokenPrefix(userType = 'learner') {
    if (userType === 'admin') return 'admin';
    if (userType === 'teacher') return 'teacher';
    return 'learner';
  }

  // ✅ IMPROVED: Unified method để check authentication (from sessionStorage)
  isAuthenticated(userType = 'learner') {
    const prefix = this.getTokenPrefix(userType);
    return !!sessionStorage.getItem(`${prefix}Token`);
  }

  // ✅ IMPROVED: Get current user type based on tokens (from sessionStorage)
  getCurrentUserType() {
    if (sessionStorage.getItem('adminToken')) return 'admin';
    if (sessionStorage.getItem('teacherToken')) return 'teacher';
    if (sessionStorage.getItem('learnerToken')) return 'learner';
    return null;
  }

  // ✅ Backward compatibility - keep existing methods
  async checkLearnerTokenValidity() {
    return this.checkTokensValidity('learner');
  }
}

const authServiceInstance = new AuthService();
export default authServiceInstance;