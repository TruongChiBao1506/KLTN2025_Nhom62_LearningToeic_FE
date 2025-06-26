import axiosClient from "./axiosClient";

const learnerProgressService = {
  // Lấy tổng thời gian học
  getTotalStudyTime: async () => {
    try {
      const response = await axiosClient.get(`/learner/progress/study-time`);
      return response;
    } catch (error) {
      console.error("Lỗi khi tải thời gian học:", error);
      throw error;
    }
  },

  // Lấy số lượng chứng chỉ
  getCertificatesCount: async () => {
    try {
      const response = await axiosClient.get(`/learner/progress/certificates`);
      return response;
    } catch (error) {
      console.error("Lỗi khi tải thông tin chứng chỉ:", error);
      throw error;
    }
  },

  // Lấy hiệu suất học tập theo kỹ năng
  getSkillPerformance: async () => {
    try {
      const response = await axiosClient.get(
        `/learner/progress/skill-performance`
      );
      return response;
    } catch (error) {
      console.error("Lỗi khi tải hiệu suất học tập:", error);
      throw error;
    }
  },

  // Cập nhật thời gian học
  updateStudyTime: async (timeData) => {
    try {
      const response = await axiosClient.post(
        `/learner/progress/update-time`,
        timeData
      );
      return response;
    } catch (error) {
      console.error("Lỗi khi cập nhật thời gian học:", error);
      throw error;
    }
  },

  // Lấy lộ trình học tập
  getLearningPath: async () => {
    try {
      const response = await axiosClient.get(`/learner/progress/learning-path`);
      return response;
    } catch (error) {
      console.error("Lỗi khi tải lộ trình học tập:", error);
      throw error;
    }
  },
};

export default learnerProgressService;
