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
    // Change password for current logged-in user (uses token, not userId)
    const response = await axiosClient.put(
      `${this.baseUrl}/change-password`,
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
      const response = await axiosClient.get(`/users/profile`);
      console.log("Thông tin người dùng hiện tại:", response);
      return response;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
      throw error;
    }
  }

  // Cập nhật profile người dùng (without image - image is handled by ProfileImageService)
  async updateProfile(profileData) {
    try {
      // Use /users/profile endpoint (matches BE route)
      const response = await axiosClient.put(`/users/profile`, profileData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response;
    } catch (error) {
      console.error("Lỗi khi cập nhật profile:", error);
      throw error;
    }
  }

  // Upload ảnh đại diện (deprecated - use ProfileImageService.updateMyProfile instead)
  async uploadProfileImage(imageFile) {
    try {
      const formData = new FormData();
      formData.append('profileImage', imageFile);
      
      // Use /users/profile endpoint
      const response = await axiosClient.put(`/users/profile`, formData, {
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
      // Use /users/change-password endpoint (matches BE route)
      const response = await axiosClient.put(`/users/change-password`, {
        currentPassword,
        newPassword,
        confirmPassword: newPassword // BE expects confirmPassword
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

  // ==================== TEACHER MANAGEMENT (Admin Only) ====================
  
  // Tạo teacher mới
  async createTeacher(teacherData) {
    try {
      const response = await axiosClient.post(`${this.baseUrl}/teachers/create`, teacherData);
      return response;
    } catch (error) {
      console.error("Lỗi khi tạo teacher:", error);
      throw error;
    }
  }

  // Lấy danh sách tất cả teachers
  async getAllTeachers() {
    try {
      const response = await axiosClient.get(`${this.baseUrl}/teachers/all`);
      return response;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách teachers:", error);
      throw error;
    }
  }

  // Promote user lên teacher
  async promoteToTeacher(userId) {
    try {
      const response = await axiosClient.patch(`${this.baseUrl}/teachers/${userId}/promote`);
      return response;
    } catch (error) {
      console.error("Lỗi khi promote user lên teacher:", error);
      throw error;
    }
  }

  // Demote teacher về learner
  async demoteToLearner(userId) {
    try {
      const response = await axiosClient.patch(`${this.baseUrl}/teachers/${userId}/demote`);
      return response;
    } catch (error) {
      console.error("Lỗi khi demote teacher về learner:", error);
      throw error;
    }
  }
}

const userService = new UserService();
export default userService;
