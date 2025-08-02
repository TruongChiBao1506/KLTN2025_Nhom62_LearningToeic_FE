import axiosClient from "./axiosClient";

class UserService {
  constructor(baseUrl = "/users") {
    this.baseUrl = baseUrl;
  }

  async getAllLearners() {
    const response = await axiosClient.get(`${this.baseUrl}`);
    return response;
  }

  async countLearners() {
    const response = await axiosClient.get(`${this.baseUrl}/stats/count`);
    return response;
  }

  async getUserIdByUsername(username) {
    console.log("Fetching user ID for username:", username);
    const url = `${this.baseUrl}/getUserIdByUsername/${username}`;
    console.log("Request URL:", url);
    const response = await axiosClient.get(
      `${this.baseUrl}/getUserIdByUsername/${username}`
    );
    return response;
  }

  async getUserById(userId) {
    const response = await axiosClient.get(`${this.baseUrl}/${userId}`);
    return response;
  }

  async update(userId, data) {
    console.log(data);
    const response = await axiosClient.put(`${this.baseUrl}/${userId}`, data);
    return response;
  }

  async changePassword(userId, data) {
    console.log(data);
    const response = await axiosClient.put(
      `${this.baseUrl}/change-password/${userId}`,
      data
    );
    return response;
  }

  async updateUserStatus(userId, newStatus) {
    const response = await axiosClient.put(
      `${this.baseUrl}/${userId}/status`,
      newStatus
    );
    return response;
  }

  async deleteUser(userId) {
    const response = await axiosClient.delete(`${this.baseUrl}/${userId}`);
    return response;
  }
  // Phương thức kiểm tra email đã tồn tại chưa
  async checkEmailExists(email) {
    const response = await axiosClient.get(`/auth/check-email-exists`, {
      params: { email },
    });
    return response.data;
  }

  // Lấy thông tin profile người dùng hiện tại
  async getCurrentUser() {
    try {
      const response = await axiosClient.get(`/learner/profile`);
      return response;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
      throw error;
    }
  }

  // Cập nhật profile người dùng
  async updateProfile(profileData) {
    try {
      const response = await axiosClient.put(`/learner/profile`, profileData);
      return response;
    } catch (error) {
      console.error("Lỗi khi cập nhật profile:", error);
      throw error;
    }
  }

  // Upload ảnh đại diện
  async uploadProfileImage(imageFile) {
    try {
      const formData = new FormData();
      formData.append('profileImage', imageFile);
      
      const response = await axiosClient.post(`/learner/profile/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      console.error("Lỗi khi upload ảnh:", error);
      throw error;
    }
  }

  // Đổi mật khẩu
  async changeUserPassword(currentPassword, newPassword) {
    try {
      const response = await axiosClient.put(`/learner/profile/change-password`, {
        currentPassword,
        newPassword
      });
      return response;
    } catch (error) {
      console.error("Lỗi khi đổi mật khẩu:", error);
      throw error;
    }
  }

  // Lấy thống kê học tập của người dùng
  async getUserStatistics() {
    try {
      const response = await axiosClient.get(`/learner/statistics`);
      return response;
    } catch (error) {
      console.error("Lỗi khi lấy thống kê:", error);
      throw error;
    }
  }

  // Lấy hoạt động gần đây của người dùng
  async getRecentActivity(limit = 10) {
    try {
      const response = await axiosClient.get(`/learner/activity/recent`, {
        params: { limit }
      });
      return response;
    } catch (error) {
      console.error("Lỗi khi lấy hoạt động gần đây:", error);
      throw error;
    }
  }
}

const userService = new UserService();
export default userService;
