import axiosClient from './axiosClient';

class VocabularyQuestionService {
    constructor(baseUrl = '/vocabulary-questions') {
        this.baseUrl = baseUrl;
    }

    async create(data) {
        try {
            console.log('🚀 Creating vocabulary question:', data);
            const response = await axiosClient.post(`${this.baseUrl}`, data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('✅ Vocabulary question created:', response);
            return response;
        } catch (error) {
            console.error('❌ Error creating vocabulary question:', error);
            throw error;
        }
    }

    async all() {
        try {
            const response = await axiosClient.get(`${this.baseUrl}`);
            return response;
        } catch (error) {
            console.error('❌ Error getting all vocabulary questions:', error);
            throw error;
        }
    }

    async get(id) {
        try {
            console.log('🔍 Getting vocabulary question with ID:', id);
            const response = await axiosClient.get(`${this.baseUrl}/${id}`);
            console.log('✅ Vocabulary question retrieved:', response);
            return response;
        } catch (error) {
            console.error('❌ Error getting vocabulary question:', error);
            throw error;
        }
    }

    async update(id, data) {
        try {
            console.log('🔄 Updating vocabulary question:', id, data);
            const response = await axiosClient.put(`${this.baseUrl}/${id}`, data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('✅ Vocabulary question updated:', response);
            return response;
        } catch (error) {
            console.error('❌ Error updating vocabulary question:', error);
            throw error;
        }
    }

    async delete(id) {
        try {
            console.log('🗑️ Deleting vocabulary question:', id);
            const response = await axiosClient.delete(`${this.baseUrl}/${id}`);
            console.log('✅ Vocabulary question deleted:', response);
            return response;
        } catch (error) {
            console.error('❌ Error deleting vocabulary question:', error);
            throw error;
        }
    }

    async getVocabularyQuestionsByTopic(topicId) {
        try {
            console.log('🔍 Getting vocabulary questions for topic:', topicId);
            const response = await axiosClient.get(`${this.baseUrl}/by-topic/${topicId}`);
            console.log('✅ Vocabulary questions retrieved:', response);
            return response;
        } catch (error) {
            console.error('❌ Error getting vocabulary questions by topic:', error);
            
            // Handle 404 as empty data instead of error
            if (error.response?.status === 404) {
                console.log('📝 No vocabulary questions found for this topic - returning empty array');
                return []; // Return empty array instead of throwing error
            }
            
            throw error;
        }
    }

    async getEnableVocabularyQuestionsByTopic(topicId) {
        try {
            console.log('🔍 Getting enabled vocabulary questions for topic:', topicId);
            const response = await axiosClient.get(`${this.baseUrl}/by-topic/${topicId}/enable`);
            console.log('✅ Enabled vocabulary questions retrieved:', response);
            return response;
        } catch (error) {
            console.error('❌ Error getting enabled vocabulary questions by topic:', error);
            
            // Handle 404 as empty data instead of error
            if (error.response?.status === 404) {
                console.log('📝 No enabled vocabulary questions found for this topic - returning empty array');
                return []; // Return empty array instead of throwing error
            }
            
            throw error;
        }
    }

    async updateStatus(questionId, newStatus) {
        try {
            console.log('🔄 Updating vocabulary question status:', questionId, newStatus);
            const response = await axiosClient.put(`${this.baseUrl}/${questionId}/status`, {
                status: newStatus
            });
            console.log('✅ Vocabulary question status updated:', response);
            return response;
        } catch (error) {
            console.error('❌ Error updating vocabulary question status:', error);
            throw error;
        }
    }

    // Additional useful methods similar to VocabularyService
    async search(query) {
        try {
            console.log('🔍 Searching vocabulary questions:', query);
            const response = await axiosClient.get(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`);
            console.log('✅ Search results:', response);
            return response;
        } catch (error) {
            console.error('❌ Error searching vocabulary questions:', error);
            
            // Handle 404 as empty search results
            if (error.response?.status === 404) {
                console.log('📝 No search results found - returning empty array');
                return [];
            }
            
            throw error;
        }
    }

    async getStatistics(topicId) {
        try {
            console.log('📊 Getting vocabulary question statistics for topic:', topicId);
            const response = await axiosClient.get(`${this.baseUrl}/statistics/${topicId}`);
            console.log('✅ Statistics retrieved:', response);
            return response;
        } catch (error) {
            console.error('❌ Error getting vocabulary question statistics:', error);
            
            // Handle 404 as empty statistics
            if (error.response?.status === 404) {
                console.log('📝 No statistics found for this topic - returning default stats');
                return {
                    total: 0,
                    enabled: 0,
                    disabled: 0,
                    difficulty: {
                        easy: 0,
                        medium: 0,
                        hard: 0
                    }
                };
            }
            
            throw error;
        }
    }

    async bulkUpdateStatus(questionIds, newStatus) {
        try {
            console.log('🔄 Bulk updating vocabulary question status:', questionIds, newStatus);
            const response = await axiosClient.put(`${this.baseUrl}/bulk-status`, {
                questionIds,
                status: newStatus
            });
            console.log('✅ Bulk status update completed:', response);
            return response;
        } catch (error) {
            console.error('❌ Error bulk updating vocabulary question status:', error);
            throw error;
        }
    }

    async duplicate(questionId, targetTopicId) {
        try {
            console.log('📋 Duplicating vocabulary question:', questionId, 'to topic:', targetTopicId);
            const response = await axiosClient.post(`${this.baseUrl}/${questionId}/duplicate`, {
                targetTopicId
            });
            console.log('✅ Vocabulary question duplicated:', response);
            return response;
        } catch (error) {
            console.error('❌ Error duplicating vocabulary question:', error);
            throw error;
        }
    }

    async exportTemplate() {
        try {
            console.log('📥 Exporting vocabulary question template');
            const response = await axiosClient.get(`${this.baseUrl}/download-template`, {
                responseType: 'blob'
            });
            
            // Handle the file download 
            const blob = new Blob([response], { 
                type: response.headers?.["content-type"] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "vocabulary_question_template.xlsx");
            document.body.appendChild(link);
            link.click();
            
            // Clean up the temporary URL and link element
            URL.revokeObjectURL(url);
            document.body.removeChild(link);
            
            console.log('✅ Template exported successfully');
            return response;
        } catch (error) {
            console.error('❌ Error exporting template:', error);
            throw error;
        }
    }

    async importTemplate(file, topicId) {
        try {
            console.log('📤 Importing vocabulary questions from file for topic:', topicId);
            const formData = new FormData();
            formData.append("file", file);
            formData.append("topicId", topicId);
            
            const response = await axiosClient.post(`${this.baseUrl}/upload`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log('✅ Questions imported successfully:', response);
            return response;
        } catch (error) {
            console.error('❌ Error importing template:', error);
            throw error;
        }
    }

    async exportByTopic(topicId) {
        try {
            console.log('📥 Exporting vocabulary questions for topic:', topicId);
            const response = await axiosClient.get(`${this.baseUrl}/export/${topicId}`, {
                responseType: 'blob'
            });
            
            // Handle the file download 
            const blob = new Blob([response], { 
                type: response.headers?.["content-type"] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `vocabulary_questions_topic_${topicId}.xlsx`);
            document.body.appendChild(link);
            link.click();
            
            // Clean up the temporary URL and link element
            URL.revokeObjectURL(url);
            document.body.removeChild(link);
            
            console.log('✅ Questions exported successfully');
            return response;
        } catch (error) {
            console.error('❌ Error exporting questions by topic:', error);
            
            // Handle 404 as no data to export
            if (error.response?.status === 404) {
                console.log('📝 No vocabulary questions to export for this topic');
                throw new Error('Topic này chưa có vocabulary questions để export');
            }
            
            throw error;
        }
    }

    async bulkImport(topicId, data) {
        try {
            console.log('📤 Bulk importing vocabulary questions for topic:', topicId);
            const response = await axiosClient.post(`${this.baseUrl}/bulk-import/${topicId}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log('✅ Bulk import completed:', response);
            return response;
        } catch (error) {
            console.error('❌ Error bulk importing vocabulary questions:', error);
            throw error;
        }
    }

    async getQuestionsByDifficulty(topicId, difficulty) {
        try {
            console.log('🔍 Getting vocabulary questions by difficulty:', difficulty, 'for topic:', topicId);
            const response = await axiosClient.get(`${this.baseUrl}/by-topic/${topicId}/difficulty/${difficulty}`);
            console.log('✅ Questions by difficulty retrieved:', response);
            return response;
        } catch (error) {
            console.error('❌ Error getting questions by difficulty:', error);
            
            // Handle 404 as empty results
            if (error.response?.status === 404) {
                console.log(`📝 No ${difficulty} difficulty questions found for this topic - returning empty array`);
                return [];
            }
            
            throw error;
        }
    }

    async randomQuestions(topicId, limit = 10) {
        try {
            console.log('🎲 Getting random vocabulary questions for topic:', topicId, 'limit:', limit);
            const response = await axiosClient.get(`${this.baseUrl}/by-topic/${topicId}/random?limit=${limit}`);
            console.log('✅ Random questions retrieved:', response);
            return response;
        } catch (error) {
            console.error('❌ Error getting random questions:', error);
            
            // Handle 404 as empty results
            if (error.response?.status === 404) {
                console.log('📝 No questions available for random selection - returning empty array');
                return [];
            }
            
            throw error;
        }
    }

    async validateQuestion(questionData) {
        try {
            console.log('✅ Validating vocabulary question data:', questionData);
            const response = await axiosClient.post(`${this.baseUrl}/validate`, questionData);
            console.log('✅ Question validation completed:', response);
            return response;
        } catch (error) {
            console.error('❌ Error validating question:', error);
            throw error;
        }
    }
}

export default new VocabularyQuestionService();