import axiosClient from "./axiosClient";

class GrammarQuestionService {
  constructor(baseUrl = "/grammar-questions") {
    this.baseUrl = baseUrl;
  }

  async create(data) {
    try {
      console.log("🚀 Creating grammar question:", data);

      const isFormData = data instanceof FormData;
      const headers = isFormData
        ? {
            "Content-Type": "multipart/form-data",
          }
        : {
            "Content-Type": "application/json",
          };

      const response = await axiosClient.post(`${this.baseUrl}`, data, {
        headers,
      });
      console.log("✅ Grammar question created:", response);
      return response;
    } catch (error) {
      console.error("❌ Error creating grammar question:", error);
      throw error;
    }
  }

  async all() {
    try {
      console.log("🔍 Getting all grammar questions");
      const response = await axiosClient.get(`${this.baseUrl}`);
      console.log("✅ All grammar questions retrieved:", response);
      return response;
    } catch (error) {
      console.error("❌ Error getting all grammar questions:", error);
      throw error;
    }
  }
  async get(id) {
    try {
      console.log("🔍 Getting grammar question with ID:", id);
      const response = await axiosClient.get(`${this.baseUrl}/${id}`);
      console.log("✅ Grammar question retrieved:", response);
      return response;
    } catch (error) {
      console.error("❌ Error getting grammar question:", error);
      throw error;
    }
  }

  async getByGrammarId(grammarId) {
    try {
      console.log("🔍 Getting grammar questions by grammar ID:", grammarId);
      const response = await axiosClient.get(
        `${this.baseUrl}/grammar/${grammarId}`
      );
      console.log("✅ Grammar questions retrieved by grammar ID:", response);
      return response;
    } catch (error) {
      console.error("❌ Error getting grammar questions by grammar ID:", error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      console.log("🔄 Updating grammar question:", id);
      console.log("🔄 Data to send:", data);

      const isFormData = data instanceof FormData;
      const headers = isFormData
        ? {
            "Content-Type": "multipart/form-data",
          }
        : {
            "Content-Type": "application/json",
          };

      const response = await axiosClient.put(`${this.baseUrl}/${id}`, data, {
        headers,
      });
      console.log("✅ Grammar question updated:", response);
      return response;
    } catch (error) {
      console.error("❌ Error updating grammar question:", error);
      throw error;
    }
  }

  async delete(id) {
    try {
      console.log("🗑️ Deleting grammar question:", id);
      const response = await axiosClient.delete(`${this.baseUrl}/${id}`);
      console.log("✅ Grammar question deleted:", response);
      return response;
    } catch (error) {
      console.error("❌ Error deleting grammar question:", error);
      throw error;
    }
  }

  async getGrammarQuestionsByGrammar(grammarId) {
    try {
      console.log("🔍 Getting grammar questions for grammar:", grammarId);
      const response = await axiosClient.get(
        `${this.baseUrl}/by-grammar/${grammarId}`
      );
      console.log("✅ Grammar questions retrieved:", response);
      return response;
    } catch (error) {
      console.error("❌ Error getting grammar questions by grammar:", error);

      // Handle 404 as empty data instead of error
      if (error.response?.status === 404) {
        console.log(
          "📝 No grammar questions found for this grammar - returning empty array"
        );
        return []; // Return empty array instead of throwing error
      }

      throw error;
    }
  }

  async getEnableGrammarQuestionsByGrammar(grammarId) {
    try {
      console.log(
        "🔍 Getting enabled grammar questions for grammar:",
        grammarId
      );
      const response = await axiosClient.get(
        `${this.baseUrl}/by-grammar/${grammarId}/enable`
      );
      console.log("✅ Enabled grammar questions retrieved:", response);
      return response;
    } catch (error) {
      console.error(
        "❌ Error getting enabled grammar questions by grammar:",
        error
      );

      // Handle 404 as empty data instead of error
      if (error.response?.status === 404) {
        console.log(
          "📝 No enabled grammar questions found for this grammar - returning empty array"
        );
        return []; // Return empty array instead of throwing error
      }

      throw error;
    }
  }

  async updateStatus(questionId, newStatus) {
    try {
      console.log(
        "🔄 Updating grammar question status:",
        questionId,
        newStatus
      );
      const response = await axiosClient.put(
        `${this.baseUrl}/${questionId}/status`,
        {
          status: newStatus,
        }
      );
      console.log("✅ Grammar question status updated:", response);
      return response;
    } catch (error) {
      console.error("❌ Error updating grammar question status:", error);
      throw error;
    }
  }

  // ✅ Additional useful methods for enhanced functionality
  async search(query) {
    try {
      console.log("🔍 Searching grammar questions:", query);
      const response = await axiosClient.get(
        `${this.baseUrl}/search?q=${encodeURIComponent(query)}`
      );
      console.log("✅ Search results:", response);
      return response;
    } catch (error) {
      console.error("❌ Error searching grammar questions:", error);

      if (error.response?.status === 404) {
        console.log("📝 No search results found - returning empty array");
        return [];
      }

      throw error;
    }
  }

  async exportTemplate() {
    try {
      console.log("📥 Exporting grammar question template");
      const response = await axiosClient.get(
        `${this.baseUrl}/download-template`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response], {
        type:
          response.headers?.["content-type"] ||
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "grammar_question_template.xlsx");
      document.body.appendChild(link);
      link.click();

      URL.revokeObjectURL(url);
      document.body.removeChild(link);

      console.log("✅ Template exported successfully");
      return response;
    } catch (error) {
      console.error("❌ Error exporting template:", error);
      throw error;
    }
  }

  async exportByGrammar(grammarId) {
    try {
      console.log("📥 Exporting grammar questions for grammar:", grammarId);
      const response = await axiosClient.get(
        `${this.baseUrl}/export/${grammarId}`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response], {
        type:
          response.headers?.["content-type"] ||
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `grammar_questions_${grammarId}.xlsx`);
      document.body.appendChild(link);
      link.click();

      URL.revokeObjectURL(url);
      document.body.removeChild(link);

      console.log("✅ Questions exported successfully");
      return response;
    } catch (error) {
      console.error("❌ Error exporting questions by grammar:", error);

      if (error.response?.status === 404) {
        console.log("📝 No grammar questions to export for this grammar");
        throw new Error("Grammar này chưa có questions để export");
      }

      throw error;
    }
  }

  async importTemplate(file, grammarId) {
    try {
      console.log(
        "📤 Importing grammar questions from file for grammar:",
        grammarId
      );
      const formData = new FormData();
      formData.append("file", file);
      formData.append("grammarId", grammarId);

      const response = await axiosClient.post(
        `${this.baseUrl}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("✅ Questions imported successfully:", response);
      return response;
    } catch (error) {
      console.error("❌ Error importing template:", error);
      throw error;
    }
  }

  async bulkDelete(grammarQuestionIds) {
    try {
      console.log("🗑️ Bulk deleting grammar questions:", grammarQuestionIds);
      const response = await axiosClient.delete(`${this.baseUrl}/bulk-delete`, {
        data: { grammarQuestionIds },
      });
      console.log("✅ Bulk delete successful:", response);
      return response;
    } catch (error) {
      console.error("❌ Error bulk deleting:", error);
      throw error;
    }
  }

  async bulkUpdateStatus(grammarQuestionIds, newStatus) {
    try {
      console.log(
        "🔄 Bulk updating status for questions:",
        grammarQuestionIds,
        newStatus
      );
      const response = await axiosClient.put(`${this.baseUrl}/bulk-status`, {
        grammarQuestionIds,
        status: newStatus,
      });
      console.log("✅ Bulk status update successful:", response);
      return response;
    } catch (error) {
      console.error("❌ Error bulk updating status:", error);
      throw error;
    }
  }

  async getStatistics(grammarId) {
    try {
      console.log("📊 Getting statistics for grammar:", grammarId);
      const response = await axiosClient.get(
        `${this.baseUrl}/statistics/${grammarId}`
      );
      console.log("✅ Statistics retrieved:", response);
      return response;
    } catch (error) {
      console.error("❌ Error getting statistics:", error);
      throw error;
    }
  }

  async validateQuestion(questionData) {
    try {
      console.log("✅ Validating grammar question");
      const response = await axiosClient.post(
        `${this.baseUrl}/validate`,
        questionData
      );
      console.log("✅ Question validation successful:", response);
      return response;
    } catch (error) {
      console.error("❌ Error validating question:", error);
      throw error;
    }
  }

  async getQuestionsByDifficulty(grammarId, difficulty) {
    try {
      console.log("🔍 Getting questions by difficulty:", grammarId, difficulty);
      const response = await axiosClient.get(
        `${this.baseUrl}/by-grammar/${grammarId}/difficulty/${difficulty}`
      );
      console.log("✅ Questions by difficulty retrieved:", response);
      return response;
    } catch (error) {
      console.error("❌ Error getting questions by difficulty:", error);

      if (error.response?.status === 404) {
        console.log("📝 No questions found for this difficulty level");
        return [];
      }

      throw error;
    }
  }

  async duplicateQuestion(questionId) {
    try {
      console.log("📋 Duplicating grammar question:", questionId);
      const response = await axiosClient.post(
        `${this.baseUrl}/${questionId}/duplicate`
      );
      console.log("✅ Question duplicated successfully:", response);
      return response;
    } catch (error) {
      console.error("❌ Error duplicating question:", error);
      throw error;
    }
  }

  async getRandomQuestions(grammarId, count = 10) {
    try {
      console.log(
        "🎲 Getting random questions for grammar:",
        grammarId,
        "count:",
        count
      );
      const response = await axiosClient.get(
        `${this.baseUrl}/by-grammar/${grammarId}/random?count=${count}`
      );
      console.log("✅ Random questions retrieved:", response);
      return response;
    } catch (error) {
      console.error("❌ Error getting random questions:", error);

      if (error.response?.status === 404) {
        console.log("📝 No questions available for random selection");
        return [];
      }

      throw error;
    }
  }
}

export default new GrammarQuestionService();
