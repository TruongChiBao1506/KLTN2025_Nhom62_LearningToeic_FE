import axiosClient from './axiosClient';

class LessonService {
    constructor(baseUrl = '/lessons') {
        this.baseUrl = baseUrl;
    }

    async create(sectionId, data) {
        // Add sectionId to data
        data.sectionId = sectionId;
        const response = await axiosClient.post(`${this.baseUrl}`, data);
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
        const response = await axiosClient.put(`${this.baseUrl}/${id}`, data);
        return response;
    }

    async delete(id) {
        const response = await axiosClient.delete(`${this.baseUrl}/${id}`);
        return response;
    }

    async getLessonsBySection(sectionId) {
        const response = await axiosClient.get(`${this.baseUrl}/by-section/${sectionId}`);
        return response;
    }

    async updateStatus(lessonId, newStatus) {
        const response = await axiosClient.put(`${this.baseUrl}/${lessonId}/status`, {
            newStatus: newStatus
        });
        return response.data;
    }
}

export default new LessonService();