import axiosClient from "./axiosClient";

class SectionService {
  constructor(baseUrl = "/sections") {
    this.baseUrl = baseUrl;
  }

  async create(data) {
    const response = await axiosClient.post(`${this.baseUrl}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
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
    console.log("Updating section with ID:", id, "and data:", data);
    const response = await axiosClient.put(`${this.baseUrl}/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  }

  async delete(id) {
    const response = await axiosClient.delete(`${this.baseUrl}/${id}`);
    return response;
  }

  async updateStatus(sectionId, newStatus) {
    const response = await axiosClient.put(
      `${this.baseUrl}/${sectionId}/status`,
      { status: newStatus }
    );
    return response;
  }

  async getAllEnabled() {
    const response = await axiosClient.get(`${this.baseUrl}/enable`);
    return response;
  }

  async allEnable() {
    const response = await axiosClient.get(`${this.baseUrl}/enable`);
    return response;
  }
}

const sectionService = new SectionService();
export default sectionService;
