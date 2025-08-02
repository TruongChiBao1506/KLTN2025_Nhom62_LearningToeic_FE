import axiosClient from "./axiosClient";

class QuestionService {
  constructor(baseUrl = "/questions") {
    this.baseUrl = baseUrl;
  }

  // Lấy tất cả câu hỏi
  async getAll() {
    const response = await axiosClient.get(`${this.baseUrl}`);
    return response;
  }

  // Lấy chi tiết câu hỏi theo ID
  async getById(id) {
    const response = await axiosClient.get(`${this.baseUrl}/${id}`);
    return response;
  }

  // Tạo câu hỏi mới
  async create(data) {
    const response = await axiosClient.post(`${this.baseUrl}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  }

  // Cập nhật câu hỏi
  async update(id, data) {
    const response = await axiosClient.put(`${this.baseUrl}/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  }

  // Xóa câu hỏi
  async delete(id) {
    const response = await axiosClient.delete(`${this.baseUrl}/${id}`);
    return response;
  }

  // Cập nhật trạng thái câu hỏi
  async updateStatus(questionId, newStatus) {
    const response = await axiosClient.put(
      `${this.baseUrl}/${questionId}/status`,
      newStatus
    );
    return response;
  }

  // Lấy câu hỏi theo bài kiểm tra
  async getQuestionsByTest(testId) {
    const response = await axiosClient.get(`${this.baseUrl}/by-test/${testId}`);
    return response;
  }

  // Lấy câu hỏi theo phần và loại câu hỏi
  async getQuestionsBySectionIdAndType(data) {
    const response = await axiosClient.post(
      `${this.baseUrl}/by-section-and-type`,
      data
    );
    return response;
  }
}

export default new QuestionService();
