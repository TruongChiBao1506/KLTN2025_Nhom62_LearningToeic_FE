import axiosClient from "./axiosClient";
import jwt_decode from "jwt-decode";

// Hàm helper để lấy userId từ token
const getUserIdFromToken = () => {
  try {
    const token = localStorage.getItem("learnerToken");
    if (token) {
      const decoded = jwt_decode(token);
      return decoded.id;
    }
    return null;
  } catch (error) {
    console.error("Lỗi khi giải mã token:", error);
    return null;
  }
};

const userVocabularyService = {
  // Lấy tất cả từ vựng của người dùng đã đăng nhập
  getUserVocabularies: async () => {
    try {
      const userId = getUserIdFromToken();
      if (!userId) throw new Error("Người dùng chưa đăng nhập");

      const response = await axiosClient.get(`/user-vocabulary/user/${userId}`);
      return response;
    } catch (error) {
      console.error(`Lỗi khi lấy từ vựng của người dùng:`, error);
      throw error;
    }
  },

  // Lấy tất cả từ vựng của một người dùng cụ thể
  getUserVocabulariesById: async (userId) => {
    try {
      const response = await axiosClient.get(`/user-vocabulary/user/${userId}`);
      return response;
    } catch (error) {
      console.error(`Lỗi khi lấy từ vựng của người dùng ${userId}:`, error);
      throw error;
    }
  },

  // Thêm từ vựng vào danh sách của người dùng
  addUserVocabulary: async (vocabData) => {
    try {
      const response = await axiosClient.post("/user-vocabulary", vocabData);
      return response;
    } catch (error) {
      console.error("Lỗi khi thêm từ vựng cho người dùng:", error);
      throw error;
    }
  },

  // Xóa từ vựng khỏi danh sách của người dùng
  removeUserVocabulary: async (userVocabId) => {
    try {
      const response = await axiosClient.delete(
        `/user-vocabulary/${userVocabId}`
      );
      return response;
    } catch (error) {
      console.error(
        `Lỗi khi xóa từ vựng của người dùng ${userVocabId}:`,
        error
      );
      throw error;
    }
  },

  // Cập nhật ghi chú hoặc trạng thái của từ vựng người dùng
  updateUserVocabulary: async (userVocabId, updateData) => {
    try {
      const response = await axiosClient.put(
        `/user-vocabulary/${userVocabId}`,
        updateData
      );
      return response;
    } catch (error) {
      console.error(
        `Lỗi khi cập nhật từ vựng người dùng ${userVocabId}:`,
        error
      );
      throw error;
    }
  },
  // Kiểm tra từ vựng đã được người dùng thêm vào chưa
  checkUserVocabularyExists: async (vocabularyId) => {
    try {
      const userId = getUserIdFromToken();
      if (!userId) throw new Error("Người dùng chưa đăng nhập");

      const response = await axiosClient.get(
        `/user-vocabulary/check/${userId}/${vocabularyId}`
      );
      return response;
    } catch (error) {
      console.error(`Lỗi khi kiểm tra từ vựng ${vocabularyId}:`, error);
      throw error;
    }
  },

  // Lấy thống kê từ vựng đã học của người dùng
  getUserVocabularyStats: async () => {
    try {
      const userId = getUserIdFromToken();
      if (!userId) throw new Error("Người dùng chưa đăng nhập");

      const response = await axiosClient.get(
        `/user-vocabulary/stats/${userId}`
      );
      return response;
    } catch (error) {
      console.error(`Lỗi khi lấy thống kê từ vựng:`, error);
      throw error;
    }
  },

  // Thêm từ vựng vào danh sách yêu thích
  addToFavorites: async (vocabularyId) => {
    try {
      const userId = getUserIdFromToken();
      if (!userId) throw new Error("Người dùng chưa đăng nhập");

      const response = await axiosClient.post("/user-vocabulary/favorites", {
        userId,
        vocabularyId,
      });
      return response;
    } catch (error) {
      console.error("Lỗi khi thêm từ vựng vào danh sách yêu thích:", error);
      throw error;
    }
  },

  // Xóa từ vựng khỏi danh sách yêu thích
  removeFromFavorites: async (vocabularyId) => {
    try {
      const userId = getUserIdFromToken();
      if (!userId) throw new Error("Người dùng chưa đăng nhập");

      const response = await axiosClient.delete(
        `/user-vocabulary/favorites/${userId}/${vocabularyId}`
      );
      return response;
    } catch (error) {
      console.error("Lỗi khi xóa từ vựng khỏi danh sách yêu thích:", error);
      throw error;
    }
  },
};

export default userVocabularyService;
