import axiosClient from './axiosClient';


class UserService {
    constructor(baseUrl = '/users') {
        this.baseUrl = baseUrl;
    }

    async getAllLearners() {
        const response = await axiosClient.get(`${this.baseUrl}`);
        return response;
    }

    async countLearners() {
        const response = await axiosClient.get(`${this.baseUrl}/stats/count`);
        return response;
    }

    async getUserIdByUsername(username) {
        console.log('Fetching user ID for username:', username);
        const url = `${this.baseUrl}/getUserIdByUsername/${username}`;
        console.log('Request URL:', url);
        const response = await axiosClient.get(`${this.baseUrl}/getUserIdByUsername/${username}`);
        return response;
    }

    async getUserById(userId) {
        const response = await axiosClient.get(`${this.baseUrl}/${userId}`);
        return response;
    }

    async update(userId, data) {
        console.log(data);
        const response = await axiosClient.put(`${this.baseUrl}/${userId}`, data);
        return response;
    }

    async changePassword(userId, data) {
        console.log(data);
        const response = await axiosClient.put(`${this.baseUrl}/change-password/${userId}`, data);
        return response;
    }

    async updateUserStatus(userId, newStatus) {
        const response = await axiosClient.put(`${this.baseUrl}/${userId}/status`, newStatus);
        return response;
    }

    async deleteUser(userId) {
        const response = await axiosClient.delete(`${this.baseUrl}/${userId}`);
        return response;
    }
      // Phương thức kiểm tra email đã tồn tại chưa
    async checkEmailExists(email) {
        const response = await axiosClient.get(`/auth/check-email-exists`, {
            params: { email }
        });
        return response.data;
    }
}

export default new UserService();