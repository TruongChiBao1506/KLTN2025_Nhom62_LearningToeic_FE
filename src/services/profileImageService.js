import axiosClient from './axiosClient';

class ProfileImageService {
    constructor(baseUrl = '/profile-image') {
        this.baseUrl = baseUrl;
    }

    async update(userId, formData) {
        try {
            const response = await axiosClient.put(`${this.baseUrl}/${userId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data || error.message };
        }
    }
}

export default new ProfileImageService();