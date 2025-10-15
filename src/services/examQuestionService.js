import axiosClient from './axiosClient';

class ExamQuestionService {
    constructor(baseUrl = '/exam-questions') {
        this.baseUrl = baseUrl;
    }

    async create(data) {
        try {
            console.log('ExamQuestionService: create');
            
            const isFormData = data instanceof FormData;
            const headers = isFormData ? {
                'Content-Type': 'multipart/form-data'
            } : {
                'Content-Type': 'application/json'
            };
            
            const response = await axiosClient.post(`${this.baseUrl}`, data, { headers });
            // success
            return response;
        } catch (error) {
            console.error('ExamQuestionService: create error', error);
            throw error;
        }
    }

    async all() {
        try {
            // list all
            const response = await axiosClient.get(`${this.baseUrl}`);
            return response;
        } catch (error) {
            console.error('ExamQuestionService: all error', error);
            throw error;
        }
    }

    async get(id) {
        try {
            console.log('ExamQuestionService: get', id);
            const response = await axiosClient.get(`${this.baseUrl}/${id}`);
            return response;
        } catch (error) {
            console.error('ExamQuestionService: get error', error);
            throw error;
        }
    }

    async update(id, data) {
        try {
            console.log('ExamQuestionService: update', id);
            
            const isFormData = data instanceof FormData;
            const headers = isFormData ? {
                'Content-Type': 'multipart/form-data'
            } : {
                'Content-Type': 'application/json'
            };
            
            const response = await axiosClient.put(`${this.baseUrl}/${id}`, data, { headers });
            return response;
        } catch (error) {
            console.error('ExamQuestionService: update error', error);
            throw error;
        }
    }

    async delete(id) {
        try {
            console.log('ExamQuestionService: delete', id);
            const response = await axiosClient.delete(`${this.baseUrl}/${id}`);
            return response;
        } catch (error) {
            console.error('ExamQuestionService: delete error', error);
            throw error;
        }
    }

    //   Main method used in component
    async getQuestionsByExamId(examId) {
        try {
            console.log('ExamQuestionService: get by exam', examId);
            const response = await axiosClient.get(`${this.baseUrl}/by-exam/${examId}`);
            // minimal shape check for debugging
            console.log('ExamQuestionService: get by exam ok, count=', Array.isArray(response?.examQuestions) ? response.examQuestions.length : (Array.isArray(response) ? response.length : 0));
            
            return response;
        } catch (error) {
            console.error('ExamQuestionService: get by exam error', error);
            
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

    //   IMPORT + EXPORT methods
    async exportTemplate() {
        try {
            console.log('ExamQuestionService: export template');
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
            
            return response;
        } catch (error) {
            console.error('ExamQuestionService: export template error', error);
            throw error;
        }
    }

    async importTemplate(excelFile, examId) {
        try {
            console.log('ExamQuestionService: import excel for exam', examId);

            // Clone file into memory to avoid Chrome's net::ERR_UPLOAD_FILE_CHANGED
            let filePart = excelFile;
            try {
                if (excelFile && typeof excelFile.arrayBuffer === 'function') {
                    const buffer = await excelFile.arrayBuffer();
                    const contentType = excelFile.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                    const blob = new Blob([buffer], { type: contentType });
                    filePart = new File([blob], excelFile.name || 'exam_questions.xlsx', { type: contentType });
                }
            } catch (cloneErr) {
                console.warn('⚠️ Could not clone Excel file to memory, sending original File instead.', cloneErr);
            }

            const formData = new FormData();
            // Use filename explicitly for broader backend compatibility
            formData.append('file', filePart, filePart.name || 'exam_questions.xlsx');
            formData.append('examId', examId);
            
            const response = await axiosClient.post(`${this.baseUrl}/upload-excel`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log('ExamQuestionService: import excel completed');
            return response;
        } catch (error) {
            console.error('ExamQuestionService: import excel error', error);
            throw error;
        }
    }

    //   Upload methods
    async uploadExamQuestionImages(imageFiles) {
        try {
            // NOTE: Backend expects the field name to be 'image' for single-image upload
            console.log('ExamQuestionService: upload image', imageFiles?.name || '(no name)');
            const formData = new FormData();
            formData.append('image', imageFiles);

            const response = await axiosClient.post(`${this.baseUrl}/upload-image`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            // success
            return response;
        } catch (error) {
            console.error('ExamQuestionService: upload image error', error);
            throw error;
        }
    }

    async uploadExamQuestionAudios(audioFiles) {
        try {
            // NOTE: Backend expects the field name to be 'audio' for single-audio upload
            console.log('ExamQuestionService: upload audio', audioFiles?.name || '(no name)');
            const formData = new FormData();
            formData.append('audio', audioFiles);

            const response = await axiosClient.post(`${this.baseUrl}/upload-audio`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            // success
            return response;
        } catch (error) {
            console.error('ExamQuestionService: upload audio error', error);
            throw error;
        }
    }

    //   Status update method
    async updateStatus(examQuestionId, newStatus) {
        try {
            console.log('ExamQuestionService: update status', examQuestionId, newStatus);
            const response = await axiosClient.put(`${this.baseUrl}/${examQuestionId}/status`, {
                status: newStatus
            });
            return response;
        } catch (error) {
            console.error('ExamQuestionService: update status error', error);
            throw error;
        }
    }

    //   Delete all questions by exam ID
    async deleteExamQuestionsByExamId(examId) {
        try {
            console.log('ExamQuestionService: delete by exam', examId);
            const response = await axiosClient.delete(`${this.baseUrl}/delete-by-exam/${examId}`);
            return response;
        } catch (error) {
            console.error('ExamQuestionService: delete by exam error', error);
            throw error;
        }
    }

    //   Additional useful methods
    async getEnabledQuestionsByExamId(examId) {
        try {
            console.log('ExamQuestionService: get enabled by exam', examId);
            const response = await axiosClient.get(`${this.baseUrl}/by-exam/${examId}/enabled`);
            return response;
        } catch (error) {
            console.error('ExamQuestionService: get enabled by exam error', error);
            
            if (error.response?.status === 404) {
                console.log('📝 No enabled exam questions found');
                return [];
            }
            
            throw error;
        }
    }

    async getQuestionsByType(examId, questionType) {
        try {
            console.log('ExamQuestionService: get by type', examId, questionType);
            const response = await axiosClient.get(`${this.baseUrl}/by-exam/${examId}/type/${questionType}`);
            return response;
        } catch (error) {
            console.error('ExamQuestionService: get by type error', error);
            
            if (error.response?.status === 404) {
                console.log('📝 No questions found for this type');
                return [];
            }
            
            throw error;
        }
    }

    async getQuestionsByPart(examId, partNumber) {
        try {
            console.log('ExamQuestionService: get by part', examId, partNumber);
            const response = await axiosClient.get(`${this.baseUrl}/by-exam/${examId}/part/${partNumber}`);
            return response;
        } catch (error) {
            console.error('ExamQuestionService: get by part error', error);
            
            if (error.response?.status === 404) {
                console.log('📝 No questions found for this part');
                return [];
            }
            
            throw error;
        }
    }

    async uploadAudio(questionId, audioFile) {
        try {
            console.log('ExamQuestionService: upload audio for question', questionId);
            const formData = new FormData();
            formData.append('audio', audioFile);
            
            const response = await axiosClient.post(`${this.baseUrl}/${questionId}/upload-audio`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response;
        } catch (error) {
            console.error('ExamQuestionService: upload audio for question error', error);
            throw error;
        }
    }

    async uploadImage(questionId, imageFile) {
        try {
            console.log('ExamQuestionService: upload image for question', questionId);
            const formData = new FormData();
            formData.append('image', imageFile);
            
            const response = await axiosClient.post(`${this.baseUrl}/${questionId}/upload-image`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response;
        } catch (error) {
            console.error('ExamQuestionService: upload image for question error', error);
            throw error;
        }
    }

    async bulkImport(examId, file) {
        try {
            console.log('ExamQuestionService: bulk import', examId);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('examId', examId);
            
            const response = await axiosClient.post(`${this.baseUrl}/bulk-import`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response;
        } catch (error) {
            console.error('ExamQuestionService: bulk import error', error);
            throw error;
        }
    }

    //   Statistics methods
    async getExamStatistics(examId) {
        try {
            console.log('ExamQuestionService: get exam stats', examId);
            const response = await axiosClient.get(`${this.baseUrl}/statistics/${examId}`);
            return response;
        } catch (error) {
            console.error('ExamQuestionService: get exam stats error', error);
            throw error;
        }
    }

    async getQuestionStatistics() {
        try {
            console.log('ExamQuestionService: get question stats');
            const response = await axiosClient.get(`${this.baseUrl}/statistics`);
            return response;
        } catch (error) {
            console.error('ExamQuestionService: get question stats error', error);
            throw error;
        }
    }
}

const examQuestionService = new ExamQuestionService();
export default examQuestionService;