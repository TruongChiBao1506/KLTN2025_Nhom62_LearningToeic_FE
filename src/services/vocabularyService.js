import axiosClient from "./axiosClient";

class VocabularyService {
  constructor(baseUrl = "/vocabularies") {
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
  async getVocabularyByTopic(topicId) {
    const response = await axiosClient.get(
      `${this.baseUrl}/by-topic/${topicId}`
    );
    return response;
  }

  async getByTopicId(topicId) {
    const response = await axiosClient.get(
      `${this.baseUrl}/by-topic/${topicId}`
    );
    return response;
  }

  async exportTemplate() {
    const response = await axiosClient.get(
      `${this.baseUrl}/download-template`,
      {
        responseType: "blob",
      }
    );

    // Handle the file download
    const blob = new Blob([response], {
      type:
        response.headers?.["content-type"] ||
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "vocabulary_template.xlsx");
    document.body.appendChild(link);
    link.click();

    // Clean up the temporary URL and link element
    URL.revokeObjectURL(url);
    document.body.removeChild(link);

    return response;
  }

  async importTemplate(file, topicId) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("topicId", topicId);

    const response = await axiosClient.post(
      `${this.baseUrl}/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  }

  /**
   * Generate vocabularies for a topic using AI
   * Backend endpoint: POST /vocabularies/generate
   * @param {string} topicId
   * @param {number} count
   */
  async generateWithAI(topicId, count = 20) {
    const response = await axiosClient.post(`${this.baseUrl}/generate`, {
      topicId,
      count,
    });
    return response;
  }

  async updateStatus(vocabularyId, newStatus) {
    const response = await axiosClient.put(
      `${this.baseUrl}/${vocabularyId}/status`,
      {
        status: newStatus,
      }
    );
    return response;
  }

  async search(query) {
    const response = await axiosClient.get(
      `${this.baseUrl}/search?q=${encodeURIComponent(query)}`
    );
    return response;
  }

  async bulkImport(topicId, data) {
    const response = await axiosClient.post(
      `${this.baseUrl}/bulk-import/${topicId}`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  }

  async exportByTopic(topicId) {
    const response = await axiosClient.get(
      `${this.baseUrl}/export/${topicId}`,
      {
        responseType: "blob",
      }
    );
    return response;
  }

  async getStatistics(topicId) {
    const response = await axiosClient.get(
      `${this.baseUrl}/statistics/${topicId}`
    );
    return response;
  }

  async bulkUpdateStatus(vocabularyIds, newStatus) {
    const response = await axiosClient.put(`${this.baseUrl}/bulk-status`, {
      vocabularyIds,
      status: newStatus,
    });
    return response;
  }

  async duplicate(vocabularyId, targetTopicId) {
    const response = await axiosClient.post(
      `${this.baseUrl}/${vocabularyId}/duplicate`,
      {
        targetTopicId,
      }
    );
    return response;
  }
}

export default new VocabularyService();
