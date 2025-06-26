import axiosClient from "./axiosClient";

const learnerExamService = {
  // Get all exams available for the learner
  getAllExams: async () => {
    try {
      const response = await axiosClient.get(`/learner/exams`);
      return response;
    } catch (error) {
      console.error("Lỗi khi tải tất cả bài thi:", error);
      throw error;
    }
  },

  // Get an exam by ID
  getExamById: async (examId) => {
    try {
      const response = await axiosClient.get(`/learner/exams/${examId}`);
      return response;
    } catch (error) {
      console.error(`Lỗi khi tải bài thi ${examId}:`, error);
      throw error;
    }
  },

  // Submit an exam attempt
  submitExam: async (examId, answers) => {
    try {
      const response = await axiosClient.post(
        `/learner/exams/${examId}/submit`,
        { answers }
      );
      return response;
    } catch (error) {
      console.error("Lỗi khi nộp bài thi:", error);
      throw error;
    }
  },

  // Save progress for an exam (for resuming later)
  saveProgress: async (examId, answers, timeSpent) => {
    try {
      const response = await axiosClient.post(
        `/learner/exams/${examId}/save-progress`,
        {
          answers,
          timeSpent,
        }
      );
      return response;
    } catch (error) {
      console.error("Lỗi khi lưu tiến trình bài thi:", error);
      throw error;
    }
  },

  // Get exam result by attempt ID
  getExamResult: async (attemptId) => {
    try {
      const response = await axiosClient.get(
        `/learner/exam-results/${attemptId}`
      );
      return response;
    } catch (error) {
      console.error("Lỗi khi tải kết quả bài thi:", error);
      throw error;
    }
  },

  // Get all exam results for the learner
  getExamResults: async () => {
    try {
      const response = await axiosClient.get(`/learner/exam-results`);
      return response;
    } catch (error) {
      console.error("Lỗi khi tải kết quả bài thi:", error);
      throw error;
    }
  },

  // Get count of completed exams
  getCompletedExamsCount: async () => {
    try {
      const response = await axiosClient.get(`/learner/exams/completed/count`);
      return response;
    } catch (error) {
      console.error("Lỗi khi tải số lượng bài thi đã hoàn thành:", error);
      throw error;
    }
  },

  // Get average score of all completed exams
  getAverageScore: async () => {
    try {
      const response = await axiosClient.get(`/learner/exams/average-score`);
      return response;
    } catch (error) {
      console.error("Lỗi khi tải điểm trung bình:", error);
      throw error;
    }
  },

  // Get upcoming scheduled exam
  getUpcomingExam: async () => {
    try {
      const response = await axiosClient.get(`/learner/exams/upcoming`);
      return response;
    } catch (error) {
      console.error("Lỗi khi tải bài thi sắp tới:", error);
      throw error;
    }
  },

  // Get recent exam attempts
  getRecentExams: async (limit = 5) => {
    try {
      const response = await axiosClient.get(
        `/learner/exams/recent?limit=${limit}`
      );
      return response;
    } catch (error) {
      console.error("Lỗi khi tải bài thi gần đây:", error);
      throw error;
    }
  },
};

export default learnerExamService;
