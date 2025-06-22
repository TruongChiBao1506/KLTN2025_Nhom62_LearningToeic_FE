import axiosClient from './axiosClient';

class FreeMaterialService {
    constructor(baseUrl = "/free-materials") {
        this.baseUrl = baseUrl;
    }

    async create(data) {
        return (await axiosClient.post(`${this.baseUrl}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })).data;
    }

    async all() {
        return (await axiosClient.get(`${this.baseUrl}`));
    }

    async get(id) {
        return (await axiosClient.get(`${this.baseUrl}/${id}`));
    }

    async update(id, data) {
        return (await axiosClient.put(`${this.baseUrl}/${id}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })).data;
    }

    async delete(id) {
        return (await axiosClient.delete(`${this.baseUrl}/${id}`));
    }

    async updateStatus(materialId, newStatus) {
        return await axiosClient.put(`${this.baseUrl}/${materialId}/status`, {
            status: newStatus
        });
    }

    async countTotalFreeMaterials() {
        return (await axiosClient.get(`${this.baseUrl}/total`));
    }
}

export default new FreeMaterialService();