import axiosClient from "./axiosClient";

class UserExamQuestionService {
  constructor(baseUrl = "/user-exam-questions") {
    this.baseUrl = baseUrl;
  }

  async createBatch(data) {
    const response = await axiosClient.post(`${this.baseUrl}/submit-all`, data);
    return response;
  }

  async getAll() {
    const response = await axiosClient.get(`${this.baseUrl}`);
    return response;
  }

  async getQuestionsByUserExamId(userExamId) {
    const response = await axiosClient.get(
      `${this.baseUrl}/by-user-exam/${userExamId}`
    );
    return response;
  }

  async getQuestionsByUserExamIdGroupedByType(userExamId) {
    const response = await axiosClient.get(
      `${this.baseUrl}/by-user-exam/${userExamId}/grouped`
    );
    return response;
  }

  async getAccuracyByQuestionTypeForUser(questionPart, userId) {
    const response = await axiosClient.get(
      `${this.baseUrl}/accuracy-by-part/${questionPart}/user/${userId}`
    );
    return response;
  }
}

export default new UserExamQuestionService();
