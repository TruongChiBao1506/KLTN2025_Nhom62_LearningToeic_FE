import axiosClient from "./axiosClient";

class TestService {
  constructor(baseUrl = "/tests") {
    this.baseUrl = baseUrl;
  }

  async create(sectionId, data) {
    // Add sectionId to data
    data.sectionId = sectionId;
    const response = await axiosClient.post(`${this.baseUrl}`, data);
    return response;
  }

  async all() {
    const response = await axiosClient.get(`${this.baseUrl}`);
    return response;
  }

  async get(id) {
    const response = await axiosClient.get(`${this.baseUrl}/${id}`);
    return response;
  }

  async update(id, data) {
    const response = await axiosClient.put(`${this.baseUrl}/${id}`, data);
    return response;
  }

  async delete(id) {
    const response = await axiosClient.delete(`${this.baseUrl}/${id}`);
    return response;
  }

  async getTestsBySection(sectionId) {
    const response = await axiosClient.get(
      `${this.baseUrl}/by-section/${sectionId}`
    );
    return response;
  }

  async updateStatus(testId, newStatus) {
    const response = await axiosClient.put(`${this.baseUrl}/${testId}/status`, {
      status: newStatus,
    });
    return response.data;
  }

  async addOrUpdateQuestionToTest(id, data) {
    const response = await axiosClient.put(
      `${this.baseUrl}/${id}/add-questions`,
      data
    );
    return response;
  }
  async getQuestionsByTestId(testId) {
    const response = await axiosClient.get(
      `${this.baseUrl}/${testId}/questions`
    );
    return response;
  }

  async getEnableTestsBySection(sectionId) {
    const response = await axiosClient.get(
      `${this.baseUrl}/by-section/${sectionId}/enabled`
    );
    return response;
  }
}

export default new TestService();
