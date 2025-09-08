import axiosClient from "./axiosClient";

const commentService = {
  // Tạo một bình luận mới
  createComment: async (commentData) => {
    try {
      console.log("Sending comment data to API:", commentData); // Debug
      const response = await axiosClient.post("/comments", commentData);
      console.log("API response:", response); // Debug
      return response;
    } catch (error) {
      console.error("Lỗi khi tạo bình luận:", error);
      console.error("Error response:", error.response); // Debug error response
      throw error;
    }
  },

  // Lấy tất cả bình luận
  getAllComments: async () => {
    try {
      const response = await axiosClient.get("/comments");
      return response;
    } catch (error) {
      console.error("Lỗi khi lấy tất cả bình luận:", error);
      throw error;
    }
  },

  // Lấy tất cả bình luận của một người dùng
  getUserComments: async (userId) => {
    try {
      const response = await axiosClient.get(
        `/comments/user/${userId}/rootComments`
      );
      return response;
    } catch (error) {
      console.error(`Lỗi khi lấy bình luận của người dùng ${userId}:`, error);
      throw error;
    }
  },

  // Lấy tất cả bình luận cho một tài liệu cụ thể
  getCommentsByResource: async (resourceType, resourceId) => {
    try {
      const response = await axiosClient.get(
        `/comments/${resourceType}/${resourceId}`
      );
      return response;
    } catch (error) {
      console.error(
        `Lỗi khi lấy bình luận cho ${resourceType} ID ${resourceId}:`,
        error
      );
      throw error;
    }
  },

  // Xóa bình luận
  deleteComment: async (commentId) => {
    try {
      const response = await axiosClient.delete(`/comments/${commentId}`);
      return response;
    } catch (error) {
      console.error(`Lỗi khi xóa bình luận ${commentId}:`, error);
      throw error;
    }
  },

  // Cập nhật bình luận
  updateComment: async (commentId, commentData) => {
    try {
      const response = await axiosClient.put(
        `/comments/${commentId}`,
        commentData
      );
      return response;
    } catch (error) {
      console.error(`Lỗi khi cập nhật bình luận ${commentId}:`, error);
      throw error;
    }
  },
};

export default commentService;
