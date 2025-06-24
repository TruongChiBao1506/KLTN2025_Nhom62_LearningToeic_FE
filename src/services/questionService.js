import axiosClient from "./axiosClient";

class QuestionService {
    constructor(baseUrl = "/api/question") {
        this.baseUrl = baseUrl;
    }

    // Create new question
    async create(data) {
        try {
            const response = await axiosClient.post(this.baseUrl, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response;
        } catch (error) {
            console.error('Create question error:', error);
            throw error;
        }
    }

    // Get all questions
    async all() {
        try {
            const response = await axiosClient.get(this.baseUrl);
            return response;
        } catch (error) {
            console.error('Get all questions error:', error);
            throw error;
        }
    }

    // Get question by ID
    async get(id) {
        try {
            const response = await axiosClient.get(`${this.baseUrl}/${id}`);
            return response;
        } catch (error) {
            console.error('Get question error:', error);
            throw error;
        }
    }

    // Update question
    async update(id, data) {
        try {
            const response = await axiosClient.put(`${this.baseUrl}/${id}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response;
        } catch (error) {
            console.error('Update question error:', error);
            throw error;
        }
    }

    // Delete question
    async delete(id) {
        try {
            const response = await axiosClient.delete(`${this.baseUrl}/${id}`);
            return response;
        } catch (error) {
            console.error('Delete question error:', error);
            throw error;
        }
    }

    // Update question status
    async updateStatus(questionId, newStatus) {
        try {
            const response = await axiosClient.put(`${this.baseUrl}/${questionId}/status`, newStatus);
            return response;
        } catch (error) {
            console.error('Update question status error:', error);
            throw error;
        }
    }

    // Get questions by section
    async getQuestionsBySection(sectionId) {
        try {
            const response = await axiosClient.get(`${this.baseUrl}/by-section/${sectionId}`);
            return response;
        } catch (error) {
            console.error('Get questions by section error:', error);
            throw error;
        }
    }

    // Get questions by question group
    async getQuestionsByQuestionGroup(groupId) {
        try {
            const response = await axiosClient.get(`${this.baseUrl}/by-question-group/${groupId}`);
            return response;
        } catch (error) {
            console.error('Get questions by question group error:', error);
            throw error;
        }
    }

    // Additional useful methods for question management

    // Get questions with pagination
    async getWithPagination(page = 1, size = 10, sortBy = 'id', sortDir = 'desc') {
        try {
            const response = await axiosClient.get(`${this.baseUrl}/paginated`, {
                params: {
                    page: page - 1,
                    size,
                    sortBy,
                    sortDir
                }
            });
            return response;
        } catch (error) {
            console.error('Get paginated questions error:', error);
            throw error;
        }
    }

    // Search questions
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
            console.error('Search questions error:', error);
            throw error;
        }
    }

    // Get questions by difficulty level
    async getByDifficulty(difficulty) {
        try {
            const response = await axiosClient.get(`${this.baseUrl}/by-difficulty/${difficulty}`);
            return response;
        } catch (error) {
            console.error('Get questions by difficulty error:', error);
            throw error;
        }
    }

    // Bulk operations
    async bulkDelete(questionIds) {
        try {
            const response = await axiosClient.delete(`${this.baseUrl}/bulk`, {
                data: { questionIds }
            });
            return response;
        } catch (error) {
            console.error('Bulk delete questions error:', error);
            throw error;
        }
    }

    async bulkUpdateStatus(questionIds, newStatus) {
        try {
            const response = await axiosClient.put(`${this.baseUrl}/bulk/status`, {
                questionIds,
                status: newStatus
            });
            return response;
        } catch (error) {
            console.error('Bulk update status error:', error);
            throw error;
        }
    }

    // Get question statistics
    async getStatistics() {
        try {
            const response = await axiosClient.get(`${this.baseUrl}/statistics`);
            return response;
        } catch (error) {
            console.error('Get question statistics error:', error);
            throw error;
        }
    }

    // Duplicate question
    async duplicate(questionId) {
        try {
            const response = await axiosClient.post(`${this.baseUrl}/${questionId}/duplicate`);
            return response;
        } catch (error) {
            console.error('Duplicate question error:', error);
            throw error;
        }
    }

    // Export questions
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
            console.error('Export questions error:', error);
            throw error;
        }
    }

    // Import questions
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
            console.error('Import questions error:', error);
            throw error;
        }
    }

    // Validate question data
    async validate(questionData) {
        try {
            const response = await axiosClient.post(`${this.baseUrl}/validate`, questionData);
            return response;
        } catch (error) {
            console.error('Validate question error:', error);
            throw error;
        }
    }

    // Get question preview
    async getPreview(questionId) {
        try {
            const response = await axiosClient.get(`${this.baseUrl}/${questionId}/preview`);
            return response;
        } catch (error) {
            console.error('Get question preview error:', error);
            throw error;
        }
    }
}

export default new QuestionService();