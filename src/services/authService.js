import axiosClient from "./axiosClient";

const getToken = () => {
  return (
    localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")
  );
};

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
    // Clear tokens from all storages
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("user");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRefreshToken");
    localStorage.removeItem("adminAccessTokenExpirationTime");
    localStorage.removeItem("adminRefreshTokenExpirationTime");
    localStorage.removeItem("learnerToken");
    localStorage.removeItem("learnerRefreshToken");
    localStorage.removeItem("learnerAccessTokenExpirationTime");
    localStorage.removeItem("learnerRefreshTokenExpirationTime");
    localStorage.removeItem("learnerAuthenticated");

    try {
      const response = await axiosClient.post(`${this.baseUrl}/signout`);
      return response.data;
    } catch (error) {
      // Even if server call fails, we've cleared local tokens
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
  // Updated to support both admin and user tokens
  async saveToken(
    token,
    refreshToken,
    jwtExpirationTime,
    refreshTokenExpirationTime,
    isAdmin = false
  ) {
    if (isAdmin) {
      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminRefreshToken", refreshToken);
      localStorage.setItem(
        "adminAccessTokenExpirationTime",
        (Date.now() + jwtExpirationTime).toString()
      );
      localStorage.setItem(
        "adminRefreshTokenExpirationTime",
        (Date.now() + refreshTokenExpirationTime).toString()
      );
    } else {
      // For regular users, use sessionStorage by default
      sessionStorage.setItem("accessToken", token);
      sessionStorage.setItem("refreshToken", refreshToken);
      sessionStorage.setItem(
        "accessTokenExpirationTime",
        (Date.now() + jwtExpirationTime).toString()
      );
      sessionStorage.setItem(
        "refreshTokenExpirationTime",
        (Date.now() + refreshTokenExpirationTime).toString()
      );
    }
  }

  // Check token validity for both admin and user
  async checkTokensValidity(isAdmin = false) {
    const tokenKey = isAdmin ? "adminToken" : "accessToken";
    const refreshTokenKey = isAdmin ? "adminRefreshToken" : "refreshToken";
    const accessExpireKey = isAdmin
      ? "adminAccessTokenExpirationTime"
      : "accessTokenExpirationTime";
    const refreshExpireKey = isAdmin
      ? "adminRefreshTokenExpirationTime"
      : "refreshTokenExpirationTime";

    const storage = isAdmin ? localStorage : sessionStorage;

    const accessTokenExpireTime = storage.getItem(accessExpireKey);
    const refreshTokenExpireTime = storage.getItem(refreshExpireKey);

    if (accessTokenExpireTime && Number(accessTokenExpireTime) >= Date.now()) {
      return true;
    } else if (
      refreshTokenExpireTime &&
      Number(refreshTokenExpireTime) >= Date.now()
    ) {
      const refreshToken = storage.getItem(refreshTokenKey);

      try {
        const response = await this.refreshToken({ refreshToken });
        const newAccessToken = response.accessToken;

        storage.setItem(
          accessExpireKey,
          (Date.now() + response.jwtExpirationTime).toString()
        );
        storage.setItem(tokenKey, newAccessToken);
        return true;
      } catch (error) {
        console.log("Error refreshing token:", error);
        return false;
      }
    } else {
      this.signOut();
      return false;
    }
  }
  isAuthenticated() {
    return !!getToken();
  }

  // Kiểm tra learner token
  async checkLearnerTokenValidity() {
    const token = localStorage.getItem("learnerToken");
    const refreshToken = localStorage.getItem("learnerRefreshToken");
    const accessTokenExpirationTime = localStorage.getItem(
      "learnerAccessTokenExpirationTime"
    );
    const refreshTokenExpirationTime = localStorage.getItem(
      "learnerRefreshTokenExpirationTime"
    );

    console.log("🔍 checkLearnerTokenValidity:", {
      hasToken: !!token,
      hasRefreshToken: !!refreshToken,
      accessExpiration: accessTokenExpirationTime ? new Date(Number(accessTokenExpirationTime)).toLocaleString() : "None",
      refreshExpiration: refreshTokenExpirationTime ? new Date(Number(refreshTokenExpirationTime)).toLocaleString() : "None",
      currentTime: new Date().toLocaleString()
    });

    if (
      token &&
      accessTokenExpirationTime &&
      Number(accessTokenExpirationTime) >= Date.now()
    ) {
      console.log("✅ Access token is valid");
      return true;
    } else if (
      refreshToken &&
      refreshTokenExpirationTime &&
      Number(refreshTokenExpirationTime) >= Date.now()
    ) {
      console.log("🔄 Access token expired, trying to refresh...");
      try {
        const response = await this.refreshToken({ refreshToken });
        if (response && response.token) {
          console.log("✅ Token refreshed successfully");
          localStorage.setItem("learnerToken", response.token);
          if (response.refreshToken) {
            localStorage.setItem("learnerRefreshToken", response.refreshToken);
          }
          if (response.jwtExpirationTime) {
            localStorage.setItem(
              "learnerAccessTokenExpirationTime",
              (Date.now() + response.jwtExpirationTime).toString()
            );
          }
          return true;
        }
        console.log("❌ Refresh response invalid");
        return false;
      } catch (error) {
        console.log("❌ Error refreshing learner token:", error);
        return false;
      }
    } else {
      console.log("❌ No valid tokens found, clearing storage");
      localStorage.removeItem("learnerToken");
      localStorage.removeItem("learnerRefreshToken");
      localStorage.removeItem("learnerAccessTokenExpirationTime");
      localStorage.removeItem("learnerRefreshTokenExpirationTime");
      localStorage.removeItem("learnerAuthenticated");
      return false;
    }
  }
}

const authServiceInstance = new AuthService();
export default authServiceInstance;
