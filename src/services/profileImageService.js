import axiosClient from './axiosClient';

class ProfileImageService {
    constructor(baseUrl = '/users') {
        this.baseUrl = baseUrl;
    }

    // Update profile image for current logged-in user
    async updateMyProfile(formData) {
        try {
            const response = await axiosClient.put(`${this.baseUrl}/profile`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data || error.message };
        }
    }

    // Update profile image by userId (admin only)
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