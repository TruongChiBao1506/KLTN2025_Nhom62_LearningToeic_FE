import axiosClient from "./axiosClient";

const noteService = {
  // Tạo một ghi chú mới
  createNote: async (noteData) => {
    try {
      const response = await axiosClient.post("/note", noteData);
      return response;
    } catch (error) {
      console.error("Lỗi khi tạo ghi chú:", error);
      throw error;
    }
  },

  // Lấy tất cả ghi chú của một người dùng
  getAllNotesByUserId: async (userId) => {
    try {
      const response = await axiosClient.get(`/note/user/${userId}`);
      return response;
    } catch (error) {
      console.error(`Lỗi khi lấy ghi chú của người dùng ${userId}:`, error);
      throw error;
    }
  },

  // Cập nhật ghi chú
  update: async (noteId, noteData) => {
    try {
      const response = await axiosClient.put(`/note/${noteId}`, noteData);
      return response;
    } catch (error) {
      console.error(`Lỗi khi cập nhật ghi chú ${noteId}:`, error);
      throw error;
    }
  },

  // Xóa ghi chú
  deleteNote: async (noteId) => {
    try {
      const response = await axiosClient.delete(`/note/${noteId}`);
      return response;
    } catch (error) {
      console.error(`Lỗi khi xóa ghi chú ${noteId}:`, error);
      throw error;
    }
  },

  // Lấy một ghi chú theo ID
  getNoteById: async (noteId) => {
    try {
      const response = await axiosClient.get(`/note/${noteId}`);
      return response;
    } catch (error) {
      console.error(`Lỗi khi lấy ghi chú ${noteId}:`, error);
      throw error;
    }
  },
};

export default noteService;
