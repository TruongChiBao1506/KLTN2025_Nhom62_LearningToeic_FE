import axiosClient from "./axiosClient";

const noteService = {
  // Tạo một ghi chú mới
  create: async (noteData) => {
    try {
      const response = await axiosClient.post("/notes", noteData);
      return response;
    } catch (error) {
      console.error("Lỗi khi tạo ghi chú:", error);
      throw error;
    }
  },

  // Lấy tất cả ghi chú của một người dùng
  getAllNotesByUserId: async (userId) => {
    try {
      const response = await axiosClient.get(`/notes/user/${userId}`);
      return response;
    } catch (error) {
      console.error(`Lỗi khi lấy ghi chú của người dùng ${userId}:`, error);
      throw error;
    }
  },

  // Cập nhật ghi chú
  update: async (noteId, noteData) => {
    try {
      const response = await axiosClient.put(`/notes/${noteId}`, noteData);
      return response;
    } catch (error) {
      console.error(`Lỗi khi cập nhật ghi chú ${noteId}:`, error);
      throw error;
    }
  },

  // Xóa ghi chú
  delete: async (noteId) => {
    try {
      const response = await axiosClient.delete(`/notes/${noteId}`);
      return response;
    } catch (error) {
      console.error(`Lỗi khi xóa ghi chú ${noteId}:`, error);
      throw error;
    }
  },

  // Lấy một ghi chú theo ID
  getNoteById: async (noteId) => {
    try {
      const response = await axiosClient.get(`/notes/${noteId}`);
      return response;
    } catch (error) {
      console.error(`Lỗi khi lấy ghi chú ${noteId}:`, error);
      throw error;
    }
  },
};

export default noteService;
