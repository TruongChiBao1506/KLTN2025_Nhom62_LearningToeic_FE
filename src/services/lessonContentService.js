import axiosClient from "./axiosClient";

class LessonContentService {
  constructor(baseUrl = "/lesson-contents") {
    this.baseUrl = baseUrl;
  }

  async create(lessonId, data) {
    data.lessonId = lessonId;
    const response = await axiosClient.post(`${this.baseUrl}`, data, {
      headers: {
        "Content-Type": "application/json",
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
        "Content-Type": "application/json",
      },
    });
    return response;
  }

  async updateStatus(lessonContentId, newStatus) {
    const response = await axiosClient.put(
      `${this.baseUrl}/${lessonContentId}/status`,
      {
        newStatus: newStatus,
      }
    );
    return response;
  }

  async delete(id) {
    const response = await axiosClient.delete(`${this.baseUrl}/${id}`);
    return response;
  }
  async getLessonContentsByLesson(lessonId) {
    const response = await axiosClient.get(
      `${this.baseUrl}/by-lesson/${lessonId}`
    );
    return response;
  }

  async getEnableLessonContentsByLesson(lessonId) {
    const response = await axiosClient.get(
      `${this.baseUrl}/by-lesson/${lessonId}/enable`
    );
    return response;
  }

  async exportTemplate() {
    try {
      const response = await axiosClient.get(
        `${this.baseUrl}/download-template`,
        {
          responseType: "blob", // Important for file download
        }
      );

      // Handle the file download
      const blob = new Blob([response.data], {
        type:
          response.headers["content-type"] ||
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "lesson_content_template.xlsx");
      document.body.appendChild(link);
      link.click();

      // Clean up the temporary URL and link element
      URL.revokeObjectURL(url);
      document.body.removeChild(link);

      return response;
    } catch (error) {
      console.error("Error downloading template:", error);
      throw error;
    }
  }

  async importTemplate(file) {
    const formData = new FormData();
    formData.append("file", file);

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
}

export default new LessonContentService();
