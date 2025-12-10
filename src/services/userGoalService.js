import axiosClient from "./axiosClient";

const userGoalService = {
  // Tạo một mục tiêu mới cho người dùng
  createUserGoal: async (goalData) => {
    try {
      const response = await axiosClient.post("/user-goals", goalData);
      return response;
    } catch (error) {
      console.error("Lỗi khi tạo mục tiêu người dùng:", error);
      throw error;
    }
  },

  // Lấy mục tiêu của người dùng theo ID
  getUserGoalByUserId: async (userId) => {
    try {
      const response = await axiosClient.get(`/user-goals/by-user/${userId}`);
      return response;
    } catch (error) {
      console.error(`Lỗi khi lấy mục tiêu của người dùng ${userId}:`, error);
      throw error;
    }
  },

  // Kiểm tra người dùng đã có mục tiêu chưa
  hasUserGoalWithUserId: async (userId) => {
    try {
      const response = await axiosClient.get(
        `/user-goal/has-user-goal/${userId}`
      );
      return response;
    } catch (error) {
      console.error(
        `Lỗi khi kiểm tra mục tiêu của người dùng ${userId}:`,
        error
      );
      throw error;
    }
  },

  // Cập nhật mục tiêu của người dùng
  updateUserGoalByUserId: async (userId, goalData) => {
    try {
      const response = await axiosClient.put(`/user-goals/${userId}`, goalData);
      return response;
    } catch (error) {
      console.error(`Lỗi khi cập nhật mục tiêu người dùng ${userId}:`, error);
      throw error;
    }
  },

  // Xóa mục tiêu người dùng
  deleteUserGoalByUserId: async (userId) => {
    try {
      const response = await axiosClient.delete(`/user-goals/${userId}`);
      return response;
    } catch (error) {
      console.error(`Lỗi khi xóa mục tiêu người dùng ${userId}:`, error);
      throw error;
    }
  },

  // Lấy thống kê tiến độ mục tiêu
  getUserGoalProgress: async (userId) => {
    try {
      const response = await axiosClient.get(`/user-goals/progress/${userId}`);
      return response;
    } catch (error) {
      console.error(
        `Lỗi khi lấy tiến độ mục tiêu người dùng ${userId}:`,
        error
      );
      throw error;
    }
  },
};

export default userGoalService;
