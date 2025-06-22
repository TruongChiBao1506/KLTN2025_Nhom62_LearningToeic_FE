import axiosClient from './axiosClient';

class ExamQuestionService {
    constructor(baseUrl = '/exam-questions') {
        this.baseUrl = baseUrl;
    }

    async create(data) {
        try {
            console.log('🚀 Creating exam question:', data);
            
            const isFormData = data instanceof FormData;
            const headers = isFormData ? {
                'Content-Type': 'multipart/form-data'
            } : {
                'Content-Type': 'application/json'
            };
            
            const response = await axiosClient.post(`${this.baseUrl}`, data, { headers });
            console.log('✅ Exam question created:', response);
            return response;
        } catch (error) {
            console.error('❌ Error creating exam question:', error);
            throw error;
        }
    }

    async all() {
        try {
            console.log('🔍 Getting all exam questions');
            const response = await axiosClient.get(`${this.baseUrl}`);
            console.log('✅ All exam questions retrieved:', response);
            return response;
        } catch (error) {
            console.error('❌ Error getting all exam questions:', error);
            throw error;
        }
    }

    async get(id) {
        try {
            console.log('🔍 Getting exam question with ID:', id);
            const response = await axiosClient.get(`${this.baseUrl}/${id}`);
            console.log('✅ Exam question retrieved:', response);
            return response;
        } catch (error) {
            console.error('❌ Error getting exam question:', error);
            throw error;
        }
    }

    async update(id, data) {
        try {
            console.log('🔄 Updating exam question:', id);
            console.log('🔄 Data to send:', data);
            
            const isFormData = data instanceof FormData;
            const headers = isFormData ? {
                'Content-Type': 'multipart/form-data'
            } : {
                'Content-Type': 'application/json'
            };
            
            const response = await axiosClient.put(`${this.baseUrl}/${id}`, data, { headers });
            console.log('✅ Exam question updated:', response);
            return response;
        } catch (error) {
            console.error('❌ Error updating exam question:', error);
            throw error;
        }
    }

    async delete(id) {
        try {
            console.log('🗑️ Deleting exam question:', id);
            const response = await axiosClient.delete(`${this.baseUrl}/${id}`);
            console.log('✅ Exam question deleted:', response);
            return response;
        } catch (error) {
            console.error('❌ Error deleting exam question:', error);
            throw error;
        }
    }

    // ✅ Main method used in component
    async getQuestionsByExamId(examId) {
        try {
            console.log('🔍 Getting exam questions for exam:', examId);
            const response = await axiosClient.get(`${this.baseUrl}/by-exam/${examId}`);
            console.log('✅ Exam questions retrieved:', response);
            
            // ✅ Log để debug response structure
            console.log('📊 Response structure:', {
                hasExamQuestions: !!response.examQuestions,
                questionsLength: response.examQuestions?.length || (Array.isArray(response) ? response.length : 0),
                totalPages: response.totalPages,
                currentPage: response.currentPage,
                total: response.total
            });
            
            return response;
        } catch (error) {
            console.error('❌ Error getting exam questions by exam ID:', error);
            
            // Handle 404 as empty data instead of error
            if (error.response?.status === 404) {
                console.log('📝 No exam questions found for this exam - returning empty structure');
                return {
                    examQuestions: [],
                    totalPages: 1,
                    currentPage: 1,
                    total: 0
                };
            }
            
            throw error;
        }
    }

    // ✅ IMPORT + EXPORT methods
    async exportTemplate() {
        try {
            console.log('📥 Exporting exam question template');
            const response = await axiosClient.get(`${this.baseUrl}/download-template`, {
                responseType: 'blob'
            });
            
            // Handle the file download 
            const blob = new Blob([response], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'exam_question_fulltest_template.xlsx');
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

    async importTemplate(excelFile, examId) {
        try {
            console.log('📋 Importing exam questions template for exam:', examId);
            const formData = new FormData();
            formData.append('file', excelFile);
            formData.append('examId', examId);
            
            const response = await axiosClient.post(`${this.baseUrl}/upload-excel`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log('✅ Import completed successfully:', response);
            return response;
        } catch (error) {
            console.error('❌ Error importing template:', error);
            throw error;
        }
    }

    // ✅ Upload methods
    async uploadExamQuestionImages(imageFiles) {
        try {
            console.log('📸 Uploading exam question images:', imageFiles.name || imageFiles.length);
            const formData = new FormData();
            formData.append('questionImage', imageFiles);
            
            const response = await axiosClient.post(`${this.baseUrl}/upload-image`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log('✅ Images uploaded successfully:', response);
            return response;
        } catch (error) {
            console.error('❌ Error uploading images:', error);
            throw error;
        }
    }

    async uploadExamQuestionAudios(audioFiles) {
        try {
            console.log('🔊 Uploading exam question audios:', audioFiles.name || audioFiles.length);
            const formData = new FormData();
            formData.append('questionAudio', audioFiles);
            
            const response = await axiosClient.post(`${this.baseUrl}/upload-audio`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log('✅ Audios uploaded successfully:', response);
            return response;
        } catch (error) {
            console.error('❌ Error uploading audios:', error);
            throw error;
        }
    }

    // ✅ Status update method
    async updateStatus(examQuestionId, newStatus) {
        try {
            console.log('🔄 Updating exam question status:', examQuestionId, newStatus);
            const response = await axiosClient.put(`${this.baseUrl}/${examQuestionId}/status`, {
                status: newStatus
            });
            console.log('✅ Exam question status updated:', response);
            return response;
        } catch (error) {
            console.error('❌ Error updating exam question status:', error);
            throw error;
        }
    }

    // ✅ Delete all questions by exam ID
    async deleteExamQuestionsByExamId(examId) {
        try {
            console.log('🗑️ Deleting all questions for exam:', examId);
            const response = await axiosClient.delete(`${this.baseUrl}/delete-by-exam/${examId}`);
            console.log('✅ All questions deleted successfully:', response);
            return response;
        } catch (error) {
            console.error('❌ Error deleting all questions:', error);
            throw error;
        }
    }

    // ✅ Additional useful methods
    async getEnabledQuestionsByExamId(examId) {
        try {
            console.log('🔍 Getting enabled exam questions for exam:', examId);
            const response = await axiosClient.get(`${this.baseUrl}/by-exam/${examId}/enabled`);
            console.log('✅ Enabled exam questions retrieved:', response);
            return response;
        } catch (error) {
            console.error('❌ Error getting enabled exam questions:', error);
            
            if (error.response?.status === 404) {
                console.log('📝 No enabled exam questions found');
                return [];
            }
            
            throw error;
        }
    }

    async getQuestionsByType(examId, questionType) {
        try {
            console.log('🔍 Getting questions by type:', examId, questionType);
            const response = await axiosClient.get(`${this.baseUrl}/by-exam/${examId}/type/${questionType}`);
            console.log('✅ Questions by type retrieved:', response);
            return response;
        } catch (error) {
            console.error('❌ Error getting questions by type:', error);
            
            if (error.response?.status === 404) {
                console.log('📝 No questions found for this type');
                return [];
            }
            
            throw error;
        }
    }

    async getQuestionsByPart(examId, partNumber) {
        try {
            console.log('🔍 Getting questions by part:', examId, partNumber);
            const response = await axiosClient.get(`${this.baseUrl}/by-exam/${examId}/part/${partNumber}`);
            console.log('✅ Questions by part retrieved:', response);
            return response;
        } catch (error) {
            console.error('❌ Error getting questions by part:', error);
            
            if (error.response?.status === 404) {
                console.log('📝 No questions found for this part');
                return [];
            }
            
            throw error;
        }
    }

    async uploadAudio(questionId, audioFile) {
        try {
            console.log('📤 Uploading audio for question:', questionId);
            const formData = new FormData();
            formData.append('audio', audioFile);
            
            const response = await axiosClient.post(`${this.baseUrl}/${questionId}/upload-audio`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log('✅ Audio uploaded successfully:', response);
            return response;
        } catch (error) {
            console.error('❌ Error uploading audio:', error);
            throw error;
        }
    }

    async uploadImage(questionId, imageFile) {
        try {
            console.log('📤 Uploading image for question:', questionId);
            const formData = new FormData();
            formData.append('image', imageFile);
            
            const response = await axiosClient.post(`${this.baseUrl}/${questionId}/upload-image`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log('✅ Image uploaded successfully:', response);
            return response;
        } catch (error) {
            console.error('❌ Error uploading image:', error);
            throw error;
        }
    }

    async bulkImport(examId, file) {
        try {
            console.log('📥 Bulk importing questions for exam:', examId);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('examId', examId);
            
            const response = await axiosClient.post(`${this.baseUrl}/bulk-import`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log('✅ Bulk import successful:', response);
            return response;
        } catch (error) {
            console.error('❌ Error bulk importing:', error);
            throw error;
        }
    }

    // ✅ Statistics methods
    async getExamStatistics(examId) {
        try {
            console.log('📊 Getting exam statistics for:', examId);
            const response = await axiosClient.get(`${this.baseUrl}/statistics/${examId}`);
            console.log('✅ Exam statistics retrieved:', response);
            return response;
        } catch (error) {
            console.error('❌ Error getting exam statistics:', error);
            throw error;
        }
    }

    async getQuestionStatistics() {
        try {
            console.log('📊 Getting overall question statistics');
            const response = await axiosClient.get(`${this.baseUrl}/statistics`);
            console.log('✅ Question statistics retrieved:', response);
            return response;
        } catch (error) {
            console.error('❌ Error getting question statistics:', error);
            throw error;
        }
    }
}

export default new ExamQuestionService();