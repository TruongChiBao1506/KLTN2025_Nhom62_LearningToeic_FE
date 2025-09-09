import axiosClient from "./axiosClient";

class GrammarService {
  constructor(baseUrl = "/grammars") {
    this.baseUrl = baseUrl;
  }

  async create(data) {
    const response = await axiosClient.post(`${this.baseUrl}`, data, {
      // headers: {
      //   "Content-Type": "multipart/form-data",
      // },
    });
    return response;
  }

  async all() {
    const response = await axiosClient.get(`${this.baseUrl}`);
    return response;
  }

  async getAllEnabled() {
    const response = await axiosClient.get(`${this.baseUrl}/enabled`);
    return response;
  }

  async getById(id) {
    const response = await axiosClient.get(`${this.baseUrl}/${id}`);
    return response;
  }

  async get(id) {
    const response = await axiosClient.get(`${this.baseUrl}/${id}`);
    return response;
  }

  async update(id, data) {
    const response = await axiosClient.put(`${this.baseUrl}/${id}`, data, {
      // headers: {
      //   "Content-Type": "multipart/form-data",
      // },
    });
    return response;
  }

  async delete(id) {
    const response = await axiosClient.delete(`${this.baseUrl}/${id}`);
    return response;
  }

  async updateStatus(grammarId, newStatus) {
    const response = await axiosClient.put(
      `${this.baseUrl}/${grammarId}/status`,
      {
        status: newStatus,
      }
    );
    return response;
  }
}

const grammarService = new GrammarService();
export default grammarService;
