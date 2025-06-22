import axiosClient from './axiosClient';

class FeedbackService {
    constructor(baseUrl = '/feedbacks') {
        this.baseUrl = baseUrl;
    }

    // Create new feedback
    async create(data) {
        const response = await axiosClient.post(`${this.baseUrl}`, data);
        return response;
    }

    // Get all feedbacks
    async all() {
        const response = await axiosClient.get(`${this.baseUrl}`);
        return response;
    }

    // Get single feedback
    async get(id) {
        const response = await axiosClient.get(`${this.baseUrl}/${id}`);
        return response;
    }

    // Update feedback
    async update(id, data) {
        const response = await axiosClient.put(`${this.baseUrl}/${id}`, data);
        return response;
    }

    // Delete feedback
    async delete(id) {
        const response = await axiosClient.delete(`${this.baseUrl}/${id}`);
        return response;
    }

    // Count total feedbacks
    async countTotalFeedbacks() {
        const response = await axiosClient.get(`${this.baseUrl}/total`);
        return response;
    }

    // Get feedback percentages by rating
    async getFeedbackPercentagesByRating() {
        const response = await axiosClient.get(`${this.baseUrl}/rating-percentages`);
        return response;
    }

    // Mark as read/unread (thêm methods mới)
    async markAsRead(feedbackId) {
        const response = await axiosClient.patch(`${this.baseUrl}/${feedbackId}/read`);
        return response;
    }

    async markAsUnread(feedbackId) {
        const response = await axiosClient.patch(`${this.baseUrl}/${feedbackId}/unread`);
        return response;
    }

    // Update status
    async updateStatus(feedbackId, newStatus) {
        const response = await axiosClient.put(`${this.baseUrl}/${feedbackId}/status`, {
            status: newStatus
        });
        return response;
    }

    // Get feedback statistics
    async getStats() {
        const response = await axiosClient.get(`${this.baseUrl}/stats`);
        return response;
    }

    // Get feedbacks by rating
    async getByRating(rating) {
        const response = await axiosClient.get(`${this.baseUrl}/rating/${rating}`);
        return response;
    }

    // Get recent feedbacks
    async getRecent(limit = 10) {
        const response = await axiosClient.get(`${this.baseUrl}/recent?limit=${limit}`);
        return response;
    }

    // Get feedbacks by user
    async getByUser(userId) {
        const response = await axiosClient.get(`${this.baseUrl}/user/${userId}`);
        return response;
    }
}

export default new FeedbackService();