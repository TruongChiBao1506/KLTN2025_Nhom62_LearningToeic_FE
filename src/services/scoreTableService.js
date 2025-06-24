import axiosClient from './axiosClient';

class ScoreTableService {
    constructor(baseUrl = '/score-tables') {
        this.baseUrl = baseUrl;
    }

    async getListeningScores() {
        try {
            console.log('Fetching listening scores...');
            const response = await axiosClient.get(`${this.baseUrl}/listening-scores`);
            return response.data || response;
        } catch (error) {
            console.error('Error fetching listening scores:', error);
            throw error;
        }
    }

    async getReadingScores() {
        try {
            console.log('Fetching reading scores...');
            const response = await axiosClient.get(`${this.baseUrl}/reading-scores`);
            return response.data || response;
        } catch (error) {
            console.error('Error fetching reading scores:', error);
            throw error;
        }
    }

    async get(id) {
        try {
            console.log('Getting score table with ID:', id);
            const response = await axiosClient.get(`${this.baseUrl}/${id}`);
            return response.data || response;
        } catch (error) {
            console.error('Error fetching score:', error);
            throw error;
        }
    }

    async all() {
        try {
            console.log('Fetching all score tables...');
            const response = await axiosClient.get(`${this.baseUrl}`);
            return response.data || response;
        } catch (error) {
            console.error('Error fetching all scores:', error);
            throw error;
        }
    }

    async create(data) {
        try {
            console.log('Creating score table:', data);
            const response = await axiosClient.post(`${this.baseUrl}`, data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data || response;
        } catch (error) {
            console.error('Error creating score:', error);
            throw error;
        }
    }

    async update(id, data) {
        try {
            console.log('Updating score table:', id, data);
            const response = await axiosClient.put(`${this.baseUrl}/${id}`, data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data || response;
        } catch (error) {
            console.error('Error updating score:', error);
            throw error;
        }
    }

    async delete(id) {
        try {
            console.log('Deleting score table:', id);
            const response = await axiosClient.delete(`${this.baseUrl}/${id}`);
            return response.data || response;
        } catch (error) {
            console.error('Error deleting score:', error);
            throw error;
        }
    }
}

export default new ScoreTableService();