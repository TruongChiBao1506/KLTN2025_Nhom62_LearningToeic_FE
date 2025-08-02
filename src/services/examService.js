import axiosClient from "./axiosClient";

class ExamService {
  constructor(baseUrl = "/exam") {
    this.baseUrl = baseUrl;
  }  // Get FullTest exams
  async getFullTest() {
    const response = await axiosClient.get(`${this.baseUrl}/full-tests`);
    return response;
  }

  // Get enabled FullTest exams
  async getEnableFullTest() {
    const response = await axiosClient.get(`${this.baseUrl}/full-tests/enable`);
    return response;
  }

  // Get MiniTest exams
  async getMiniTest() {
    const response = await axiosClient.get(`${this.baseUrl}/mini-tests`);
    return response;
  }

  // Get single exam
  async get(id) {
    const response = await axiosClient.get(`${this.baseUrl}/${id}`);
    return response;
  }

  // Get all exams
  async all() {
    const response = await axiosClient.get(`${this.baseUrl}`);
    return response;
  }

  // Create new exam
  async create(data) {
    const response = await axiosClient.post(`${this.baseUrl}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  }

  // Update exam
  async update(id, data) {
    const response = await axiosClient.put(`${this.baseUrl}/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  }

  // Delete exam
  async delete(id) {
    const response = await axiosClient.delete(`${this.baseUrl}/${id}`);
    return response;
  }

  // Update status
  async updateStatus(examId, newStatus) {
    const response = await axiosClient.put(`${this.baseUrl}/${examId}/status`, {
      status: newStatus,
    });
    return response;
  }

  // Count total exams
  async countTotalExams() {
    const response = await axiosClient.get(`${this.baseUrl}/total`);
    return response;
  }

  // Get exam results
  async getResults(examId) {
    const response = await axiosClient.get(`${this.baseUrl}/${examId}/results`);
    return response;
  }

  // Get exam questions
  async getQuestions(examId) {
    const response = await axiosClient.get(
      `${this.baseUrl}/${examId}/questions`
    );
    return response;
  }

  // Get exam statistics
  async getStats() {
    const response = await axiosClient.get(`${this.baseUrl}/stats`);
    return response;
  }
}

const examService = new ExamService();
export default examService;
