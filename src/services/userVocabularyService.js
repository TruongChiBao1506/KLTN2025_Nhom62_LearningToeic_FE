import axiosClient from "./axiosClient";
import { jwtDecode } from "jwt-decode";

// Hàm helper để lấy userId từ token
const getUserIdFromToken = () => {
  try {
    const token = localStorage.getItem("learnerToken");
    if (token) {
      const decoded = jwtDecode(token);
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
      // Use the endpoint that gets current user's vocabularies
      const response = await axiosClient.get(`/user-vocabularies/user`);
      return response;
    } catch (error) {
      console.error(`Lỗi khi lấy từ vựng của người dùng:`, error);
      throw error;
    }
  },

  // Lấy tất cả từ vựng của một người dùng cụ thể
  getUserVocabulariesById: async (userId) => {
    try {
      const response = await axiosClient.get(`/user-vocabularies/user/${userId}`);
      return response;
    } catch (error) {
      console.error(`Lỗi khi lấy từ vựng của người dùng ${userId}:`, error);
      throw error;
    }
  },

  // Thêm từ vựng vào danh sách của người dùng
  addUserVocabulary: async (vocabData) => {
    try {
      const response = await axiosClient.post("/user-vocabularies", vocabData);
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
        `/user-vocabularies/${userVocabId}`
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
        `/user-vocabularies/${userVocabId}`,
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
        `/user-vocabularies/check/${userId}/${vocabularyId}`
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
        `/user-vocabularies/stats/${userId}`
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
      const response = await axiosClient.post("/user-vocabularies", {
        vocabulary: vocabularyId,
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
      // First get the user's vocabularies to find the userVocabulary ID
      const userVocabs = await axiosClient.get("/user-vocabularies/user");
      const userVocabsList = Array.isArray(userVocabs) ? userVocabs : [];
      
      const userVocab = userVocabsList.find(v => 
        (v.vocabulary?._id === vocabularyId) || 
        (v.vocabularyId === vocabularyId) ||
        (v.vocabulary === vocabularyId)
      );
      
      if (!userVocab) {
        // Don't throw error - just return success with a message
        console.warn("Từ vựng không có trong danh sách của bạn hoặc đã được xóa");
        return { success: true, message: "Từ vựng đã được xóa hoặc không có trong danh sách" };
      }

      const response = await axiosClient.delete(`/user-vocabularies/${userVocab._id}`);
      return response;
    } catch (error) {
      console.error("Lỗi khi xóa từ vựng khỏi danh sách yêu thích:", error);
      throw error;
    }
  },
};

export default userVocabularyService;
