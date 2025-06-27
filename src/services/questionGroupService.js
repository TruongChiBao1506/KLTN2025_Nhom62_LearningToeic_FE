import axiosClient from "./axiosClient";

class QuestionGroupService {
    constructor(baseUrl = "/question-groups") {
        this.baseUrl = baseUrl;
    }

    // Create new question group
    async create(data) {
        try {
            const response = await axiosClient.post(this.baseUrl, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response;
        } catch (error) {
            console.error('Create question group error:', error);
            throw error;
        }
    }

    // Get all question groups
    async all() {
        try {
            const response = await axiosClient.get(this.baseUrl);
            return response;
        } catch (error) {
            console.error('Get all question groups error:', error);
            throw error;
        }
    }

    // Get question group by ID
    async get(id) {
        try {
            const response = await axiosClient.get(`${this.baseUrl}/${id}`);
            return response;
        } catch (error) {
            console.error('Get question group error:', error);
            throw error;
        }
    }

    // Update question group
    async update(id, data) {
        try {
            const response = await axiosClient.put(`${this.baseUrl}/${id}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response;
        } catch (error) {
            console.error('Update question group error:', error);
            throw error;
        }
    }

    // Delete question group
    async delete(id) {
        try {
            const response = await axiosClient.delete(`${this.baseUrl}/${id}`);
            return response;
        } catch (error) {
            console.error('Delete question group error:', error);
            throw error;
        }
    }

    // Update question group status
    async updateStatus(questionGroupId, newStatus) {
        try {
            const response = await axiosClient.put(`${this.baseUrl}/${questionGroupId}/status`, newStatus);
            return response;
        } catch (error) {
            console.error('Update question group status error:', error);
            throw error;
        }
    }

    // Additional useful methods for question group management

    // Get question groups with pagination
    async getWithPagination(page = 1, size = 10, sortBy = 'id', sortDir = 'desc') {
        try {
            const response = await axiosClient.get(`${this.baseUrl}/paginated`, {
                params: {
                    page: page - 1, // Backend thường dùng 0-based index
                    size,
                    sortBy,
                    sortDir
                }
            });
            return response;
        } catch (error) {
            console.error('Get paginated question groups error:', error);
            throw error;
        }
    }

    // Search question groups
    async search(searchTerm, filters = {}) {
        try {
            const response = await axiosClient.get(`${this.baseUrl}/search`, {
                params: {
                    q: searchTerm,
                    ...filters
                }
            });
            return response;
        } catch (error) {
            console.error('Search question groups error:', error);
            throw error;
        }
    }

    // Get question groups by section
    async getBySection(sectionId) {
        try {
            const response = await axiosClient.get(`${this.baseUrl}/by-section/${sectionId}`);
            return response;
        } catch (error) {
            console.error('Get question groups by section error:', error);
            throw error;
        }
    }

    // Get question groups by difficulty level
    async getByDifficulty(difficulty) {
        try {
            const response = await axiosClient.get(`${this.baseUrl}/by-difficulty/${difficulty}`);
            return response;
        } catch (error) {
            console.error('Get question groups by difficulty error:', error);
            throw error;
        }
    }

    // Get question groups by type
    async getByType(type) {
        try {
            const response = await axiosClient.get(`${this.baseUrl}/by-type/${type}`);
            return response;
        } catch (error) {
            console.error('Get question groups by type error:', error);
            throw error;
        }
    }

    // Bulk operations
    async bulkDelete(questionGroupIds) {
        try {
            const response = await axiosClient.delete(`${this.baseUrl}/bulk`, {
                data: { questionGroupIds }
            });
            return response;
        } catch (error) {
            console.error('Bulk delete question groups error:', error);
            throw error;
        }
    }

    async bulkUpdateStatus(questionGroupIds, newStatus) {
        try {
            const response = await axiosClient.put(`${this.baseUrl}/bulk/status`, {
                questionGroupIds,
                status: newStatus
            });
            return response;
        } catch (error) {
            console.error('Bulk update status error:', error);
            throw error;
        }
    }

    // Get question group statistics
    async getStatistics() {
        try {
            const response = await axiosClient.get(`${this.baseUrl}/statistics`);
            return response;
        } catch (error) {
            console.error('Get question group statistics error:', error);
            throw error;
        }
    }

    // Get questions count for each group
    async getQuestionsCount(groupId) {
        try {
            const response = await axiosClient.get(`${this.baseUrl}/${groupId}/questions/count`);
            return response;
        } catch (error) {
            console.error('Get questions count error:', error);
            throw error;
        }
    }

    // Duplicate question group
    async duplicate(questionGroupId) {
        try {
            const response = await axiosClient.post(`${this.baseUrl}/${questionGroupId}/duplicate`);
            return response;
        } catch (error) {
            console.error('Duplicate question group error:', error);
            throw error;
        }
    }

    // Reorder question groups
    async reorder(orderData) {
        try {
            const response = await axiosClient.put(`${this.baseUrl}/reorder`, orderData);
            return response;
        } catch (error) {
            console.error('Reorder question groups error:', error);
            throw error;
        }
    }

    // Export question groups
    async export(format = 'excel', filters = {}) {
        try {
            const response = await axiosClient.get(`${this.baseUrl}/export`, {
                params: {
                    format,
                    ...filters
                },
                responseType: 'blob'
            });
            return response;
        } catch (error) {
            console.error('Export question groups error:', error);
            throw error;
        }
    }

    // Import question groups
    async import(file) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axiosClient.post(`${this.baseUrl}/import`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response;
        } catch (error) {
            console.error('Import question groups error:', error);
            throw error;
        }
    }

    // Validate question group data
    async validate(questionGroupData) {
        try {
            const response = await axiosClient.post(`${this.baseUrl}/validate`, questionGroupData);
            return response;
        } catch (error) {
            console.error('Validate question group error:', error);
            throw error;
        }
    }

    // Get question group preview with questions
    async getPreviewWithQuestions(questionGroupId) {
        try {
            const response = await axiosClient.get(`${this.baseUrl}/${questionGroupId}/preview`);
            return response;
        } catch (error) {
            console.error('Get question group preview error:', error);
            throw error;
        }
    }

    // Clone question group to another section
    async cloneToSection(questionGroupId, targetSectionId) {
        try {
            const response = await axiosClient.post(`${this.baseUrl}/${questionGroupId}/clone`, {
                targetSectionId
            });
            return response;
        } catch (error) {
            console.error('Clone question group error:', error);
            throw error;
        }
    }

    // Move question group to another section
    async moveToSection(questionGroupId, targetSectionId) {
        try {
            const response = await axiosClient.put(`${this.baseUrl}/${questionGroupId}/move`, {
                targetSectionId
            });
            return response;
        } catch (error) {
            console.error('Move question group error:', error);
            throw error;
        }
    }

    // Get question group templates
    async getTemplates() {
        try {
            const response = await axiosClient.get(`${this.baseUrl}/templates`);
            return response;
        } catch (error) {
            console.error('Get question group templates error:', error);
            throw error;
        }
    }

    // Create from template
    async createFromTemplate(templateId, customData = {}) {
        try {
            const response = await axiosClient.post(`${this.baseUrl}/create-from-template`, {
                templateId,
                ...customData
            });
            return response;
        } catch (error) {
            console.error('Create question group from template error:', error);
            throw error;
        }
    }

    // Archive question group (soft delete)
    async archive(questionGroupId) {
        try {
            const response = await axiosClient.put(`${this.baseUrl}/${questionGroupId}/archive`);
            return response;
        } catch (error) {
            console.error('Archive question group error:', error);
            throw error;
        }
    }

    // Restore archived question group
    async restore(questionGroupId) {
        try {
            const response = await axiosClient.put(`${this.baseUrl}/${questionGroupId}/restore`);
            return response;
        } catch (error) {
            console.error('Restore question group error:', error);
            throw error;
        }
    }

    // Get archived question groups
    async getArchived() {
        try {
            const response = await axiosClient.get(`${this.baseUrl}/archived`);
            return response;
        } catch (error) {
            console.error('Get archived question groups error:', error);
            throw error;
        }
    }
}

export default new QuestionGroupService();