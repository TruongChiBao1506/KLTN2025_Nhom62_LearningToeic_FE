import axiosClient from './axiosClient';

class UserExamService {
    constructor(baseUrl = '/user-exams') {
        this.baseUrl = baseUrl;
    }

    async createUserExam(data) {
        const response = await axiosClient.post(`${this.baseUrl}`, data);
        return response;
    }

    async getAllUserExams() {
        const response = await axiosClient.get(`${this.baseUrl}`);
        return response;
    }

    async getUserExamsByExamIdAndUserId(examId, userId) {
        const response = await axiosClient.get(`${this.baseUrl}/user-exams/${examId}/${userId}`);
        return response;
    }

    async getUserExamById(userExamId) {
        const response = await axiosClient.get(`${this.baseUrl}/${userExamId}`);
        return response;
    }

    async hasUserExamsWithExamId(examId, userId) {
        const response = await axiosClient.get(`${this.baseUrl}/has-user-exams/${examId}/${userId}`);
        return response;
    }

    async getAllMaxScoresByExamId() {
        const response = await axiosClient.get(`${this.baseUrl}/max-scores`);
        return response;
    }

    async getMaxScoresByDate() {
        const response = await axiosClient.get(`${this.baseUrl}/max-scores-by-date`);
        return response;
    }

    async getTotalCompletionTimeByUserId(userId) {
        const response = await axiosClient.get(`${this.baseUrl}/total-completion-time/${userId}`);
        return response;
    }

    async getTotalExamCountsByExamNameAndType() {
        const response = await axiosClient.get(`${this.baseUrl}/total-exam-counts`);
        return response;
    }

    async getDailyExamCounts() {
        const response = await axiosClient.get(`${this.baseUrl}/daily-exam-counts`);
        return response;
    }

    async updateStatus(lessonContentId, newStatus) {
        const response = await axiosClient.put(`${this.baseUrl}/${lessonContentId}/status`, newStatus);
        return response;
    }
}

export default new UserExamService();