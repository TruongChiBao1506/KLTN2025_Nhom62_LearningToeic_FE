import axiosClient from "./axiosClient";

class GrammarContentService {
  constructor(baseUrl = "/grammar-contents") {
    this.baseUrl = baseUrl;
  }

  async create(data) {
    try {
      console.log("🚀 Creating grammar content:", data);

      // Determine content type based on data type
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
      console.log("✅ Grammar content created:", response);
      return response;
    } catch (error) {
      console.error("❌ Error creating grammar content:", error);
      throw error;
    }
  }

  async all() {
    try {
      console.log("🔍 Getting all grammar contents");
      const response = await axiosClient.get(`${this.baseUrl}`);
      console.log("✅ All grammar contents retrieved:", response);
      return response;
    } catch (error) {
      console.error("❌ Error getting all grammar contents:", error);
      throw error;
    }
  }
  async get(id) {
    try {
      console.log("🔍 Getting grammar content with ID:", id);
      const response = await axiosClient.get(`${this.baseUrl}/${id}`);
      console.log("✅ Grammar content retrieved:", response);
      return response;
    } catch (error) {
      console.error("❌ Error getting grammar content:", error);
      throw error;
    }
  }

  async getByGrammarId(grammarId) {
    try {
      console.log("🔍 Getting grammar content by grammar ID:", grammarId);
      const response = await axiosClient.get(
        `${this.baseUrl}/grammar/${grammarId}`
      );
      console.log("✅ Grammar content retrieved by grammar ID:", response);
      return response;
    } catch (error) {
      console.error("❌ Error getting grammar content by grammar ID:", error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      console.log("🔄 Updating grammar content:", id);
      console.log("🔄 Data to send:", data);

      // Determine content type based on data type
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
      console.log("✅ Grammar content updated:", response);
      return response;
    } catch (error) {
      console.error("❌ Error updating grammar content:", error);
      throw error;
    }
  }

  async delete(id) {
    try {
      console.log("🗑️ Deleting grammar content:", id);
      const response = await axiosClient.delete(`${this.baseUrl}/${id}`);
      console.log("✅ Grammar content deleted:", response);
      return response;
    } catch (error) {
      console.error("❌ Error deleting grammar content:", error);
      throw error;
    }
  }

  async getGrammarContentsByGrammar(grammarId) {
    try {
      console.log("🔍 Getting grammar contents for grammar:", grammarId);
      const response = await axiosClient.get(
        `${this.baseUrl}/by-grammar/${grammarId}`
      );
      console.log("✅ Grammar contents retrieved:", response);
      return response;
    } catch (error) {
      console.error("❌ Error getting grammar contents by grammar:", error);

      // Handle 404 as empty data instead of error
      if (error.response?.status === 404) {
        console.log(
          "📝 No grammar contents found for this grammar - returning empty array"
        );
        return []; // Return empty array instead of throwing error
      }

      throw error;
    }
  }

  async getEnableGrammarContentsByGrammar(grammarId) {
    try {
      console.log(
        "🔍 Getting enabled grammar contents for grammar:",
        grammarId
      );
      const response = await axiosClient.get(
        `${this.baseUrl}/by-grammar/${grammarId}/enable`
      );
      console.log("✅ Enabled grammar contents retrieved:", response);
      return response;
    } catch (error) {
      console.error(
        "❌ Error getting enabled grammar contents by grammar:",
        error
      );

      // Handle 404 as empty data instead of error
      if (error.response?.status === 404) {
        console.log(
          "📝 No enabled grammar contents found for this grammar - returning empty array"
        );
        return []; // Return empty array instead of throwing error
      }

      throw error;
    }
  }

  async updateStatus(grammarContentId, newStatus) {
    try {
      console.log(
        "🔄 Updating grammar content status:",
        grammarContentId,
        newStatus
      );
      const response = await axiosClient.put(
        `${this.baseUrl}/${grammarContentId}/status`,
        {
          status: newStatus,
        }
      );
      console.log("✅ Grammar content status updated:", response);
      return response;
    } catch (error) {
      console.error("❌ Error updating grammar content status:", error);
      throw error;
    }
  }

  async search(query) {
    try {
      console.log("🔍 Searching grammar contents:", query);
      const response = await axiosClient.get(
        `${this.baseUrl}/search?q=${encodeURIComponent(query)}`
      );
      console.log("✅ Search results:", response);
      return response;
    } catch (error) {
      console.error("❌ Error searching grammar contents:", error);

      // Handle 404 as empty search results
      if (error.response?.status === 404) {
        console.log("📝 No search results found - returning empty array");
        return [];
      }

      throw error;
    }
  }

  async exportTemplate() {
    try {
      console.log("📥 Exporting grammar content template");
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
      link.setAttribute("download", "grammar_content_template.xlsx");
      document.body.appendChild(link);
      link.click();

      // Clean up the temporary URL and link element
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
      console.log("📥 Exporting grammar contents for grammar:", grammarId);
      const response = await axiosClient.get(
        `${this.baseUrl}/export/${grammarId}`,
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
      link.setAttribute("download", `grammar_contents_${grammarId}.xlsx`);
      document.body.appendChild(link);
      link.click();

      // Clean up the temporary URL and link element
      URL.revokeObjectURL(url);
      document.body.removeChild(link);

      console.log("✅ Contents exported successfully");
      return response;
    } catch (error) {
      console.error("❌ Error exporting contents by grammar:", error);

      // Handle 404 as no data to export
      if (error.response?.status === 404) {
        console.log("📝 No grammar contents to export for this grammar");
        throw new Error("Grammar này chưa có contents để export");
      }

      throw error;
    }
  }

  async importTemplate(file, grammarId) {
    try {
      console.log(
        "📤 Importing grammar contents from file for grammar:",
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
      console.log("✅ Contents imported successfully:", response);
      return response;
    } catch (error) {
      console.error("❌ Error importing template:", error);
      throw error;
    }
  }

  async bulkImport(grammarId, data) {
    try {
      console.log("📤 Bulk importing grammar contents for grammar:", grammarId);
      const response = await axiosClient.post(
        `${this.baseUrl}/bulk-import/${grammarId}`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("✅ Bulk import successful:", response);
      return response;
    } catch (error) {
      console.error("❌ Error bulk importing:", error);
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

  async bulkUpdateStatus(grammarContentIds, newStatus) {
    try {
      console.log(
        "🔄 Bulk updating status for contents:",
        grammarContentIds,
        newStatus
      );
      const response = await axiosClient.put(`${this.baseUrl}/bulk-status`, {
        grammarContentIds,
        status: newStatus,
      });
      console.log("✅ Bulk status update successful:", response);
      return response;
    } catch (error) {
      console.error("❌ Error bulk updating status:", error);
      throw error;
    }
  }

  async duplicate(grammarContentId, targetGrammarId) {
    try {
      console.log(
        "📋 Duplicating grammar content:",
        grammarContentId,
        "to grammar:",
        targetGrammarId
      );
      const response = await axiosClient.post(
        `${this.baseUrl}/${grammarContentId}/duplicate`,
        {
          targetGrammarId,
        }
      );
      console.log("✅ Grammar content duplicated successfully:", response);
      return response;
    } catch (error) {
      console.error("❌ Error duplicating grammar content:", error);
      throw error;
    }
  }

  async bulkDelete(grammarContentIds) {
    try {
      console.log("🗑️ Bulk deleting grammar contents:", grammarContentIds);
      const response = await axiosClient.delete(`${this.baseUrl}/bulk-delete`, {
        data: { grammarContentIds },
      });
      console.log("✅ Bulk delete successful:", response);
      return response;
    } catch (error) {
      console.error("❌ Error bulk deleting:", error);
      throw error;
    }
  }

  async validateContent(content) {
    try {
      console.log("✅ Validating grammar content");
      const response = await axiosClient.post(`${this.baseUrl}/validate`, {
        content,
      });
      console.log("✅ Content validation successful:", response);
      return response;
    } catch (error) {
      console.error("❌ Error validating content:", error);
      throw error;
    }
  }

  async getContentHistory(grammarContentId) {
    try {
      console.log("📜 Getting content history for:", grammarContentId);
      const response = await axiosClient.get(
        `${this.baseUrl}/${grammarContentId}/history`
      );
      console.log("✅ Content history retrieved:", response);
      return response;
    } catch (error) {
      console.error("❌ Error getting content history:", error);
      throw error;
    }
  }

  async restoreVersion(grammarContentId, versionId) {
    try {
      console.log(
        "🔄 Restoring version:",
        versionId,
        "for content:",
        grammarContentId
      );
      const response = await axiosClient.post(
        `${this.baseUrl}/${grammarContentId}/restore/${versionId}`
      );
      console.log("✅ Version restored successfully:", response);
      return response;
    } catch (error) {
      console.error("❌ Error restoring version:", error);
      throw error;
    }
  }
}

export default new GrammarContentService();
