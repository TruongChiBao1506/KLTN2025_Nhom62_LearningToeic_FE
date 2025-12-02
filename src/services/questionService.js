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
  async updateStatus(questionId, status) {
    const response = await axiosClient.put(
      `${this.baseUrl}/${questionId}/status`,
      {status}
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

  // Lấy câu hỏi theo section
  async getQuestionsBySection(sectionId) {
    const response = await axiosClient.get(`${this.baseUrl}/by-section/${sectionId}`);
    return response;
  }

  // Lấy câu hỏi theo question group  
  async getQuestionsByQuestionGroup(groupId) {
    const response = await axiosClient.get(`${this.baseUrl}/by-question-group/${groupId}`);
    return response;
  }

  // Lấy chi tiết câu hỏi theo ID (alias cho getById)
  async get(id) {
    return this.getById(id);
  }
}

const questionService = new QuestionService();
export default questionService;
