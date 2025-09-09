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
      const userId = getUserIdFromToken();
      if (!userId) {
        throw new Error("Không thể lấy thông tin người dùng. Vui lòng đăng nhập lại.");
      }
      
      // Ensure vocabularyId is a valid ObjectId string
      if (!vocabularyId || typeof vocabularyId !== 'string') {
        throw new Error("Vocabulary ID không hợp lệ");
      }
      
      // Use the format required by the backend route
      const requestData = {
        vocabulary: vocabularyId,
      };
      
      console.log("Adding to favorites with data:", requestData);
      console.log("VocabularyId:", vocabularyId);
      
      const response = await axiosClient.post("/user-vocabularies", requestData);
      console.log("Add to favorites response:", response);
      return response;
    } catch (error) {
      console.error("Lỗi khi thêm từ vựng vào danh sách yêu thích:", error);
      console.error("Error details:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error message:", error.message);
      throw error;
    }
  },

  // Xóa từ vựng khỏi danh sách yêu thích
  removeFromFavorites: async (vocabularyId) => {
    try {
      console.log("Removing from favorites with vocabularyId:", vocabularyId);
      
      // Ensure vocabularyId is a valid ObjectId string
      if (!vocabularyId || typeof vocabularyId !== 'string') {
        throw new Error("Vocabulary ID không hợp lệ");
      }
      
      // First get the user's vocabularies to find the userVocabulary ID
      const userVocabsResponse = await axiosClient.get("/user-vocabularies/user");
      console.log("User vocabularies response:", userVocabsResponse);
      
      // Handle different response structures
      let userVocabsList = [];
      if (Array.isArray(userVocabsResponse)) {
        userVocabsList = userVocabsResponse;
      } else if (userVocabsResponse && Array.isArray(userVocabsResponse.data)) {
        userVocabsList = userVocabsResponse.data;
      } else if (userVocabsResponse && userVocabsResponse.userVocabularies) {
        userVocabsList = userVocabsResponse.userVocabularies;
      }
      
      console.log("User vocabularies list:", userVocabsList);
      console.log("Looking for vocabularyId:", vocabularyId);
      
      // Find the userVocabulary record that matches the vocabularyId
      const userVocab = userVocabsList.find(v => {
        console.log("Checking vocabulary:", v);
        console.log("Vocabulary._id:", v.vocabulary?._id);
        console.log("Vocabulary.vocabularyId:", v.vocabularyId);
        console.log("Vocabulary.vocabulary:", v.vocabulary);
        
        return (
          (v.vocabulary?._id === vocabularyId) || 
          (v.vocabularyId === vocabularyId) ||
          (v.vocabulary === vocabularyId) ||
          (typeof v.vocabulary === 'object' && v.vocabulary?._id === vocabularyId) ||
          (typeof v.vocabulary === 'string' && v.vocabulary === vocabularyId)
        );
      });
      
      console.log("Found userVocab:", userVocab);
      
      if (!userVocab) {
        console.warn("Từ vựng không có trong danh sách của bạn hoặc đã được xóa");
        // Return success but with a warning message
        return { success: true, message: "Từ vựng đã được xóa hoặc không có trong danh sách" };
      }

      // Use the userVocabulary._id (not vocabularyId) for the DELETE request
      console.log("Deleting userVocab with userVocabulary._id:", userVocab._id);
      const response = await axiosClient.delete(`/user-vocabularies/${userVocab._id}`);
      console.log("Delete response:", response);
      return response;
    } catch (error) {
      console.error("Lỗi khi xóa từ vựng khỏi danh sách yêu thích:", error);
      console.error("Error details:", error.response?.data);
      console.error("Error status:", error.response?.status);
      throw error;
    }
  },
};

export default userVocabularyService;
