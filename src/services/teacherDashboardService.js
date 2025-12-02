import axiosClient from './axiosClient';

/**
 * Teacher Dashboard Service - Simplified (3 Core APIs)
 * Handles teacher dashboard-related API calls
 */
class TeacherDashboardService {
  constructor() {
    this.baseUrl = '/teacher/dashboard';
  }

  /**
   * Get teacher dashboard statistics
   * @returns {Promise} Statistics data
   */
  async getStats() {
    try {
      const response = await axiosClient.get(`${this.baseUrl}/stats`);
      console.log('📊 Teacher stats response:', response);
      return response.data;
    } catch (error) {
      console.error('Error getting teacher stats:', error);
      throw error;
    }
  }

  /**
   * Get content list with filters and pagination
   * @param {Object} params - Query parameters
   * @param {Number} params.page - Page number (default: 1)
   * @param {Number} params.limit - Items per page (default: 10)
   * @param {String} params.status - Filter: "pending" | "approved" | "rejected" | "draft" | "all"
   * @param {String} params.type - Type: "topic" | "lesson" | "grammar" | "test" | "exam" | "all"
   * @returns {Promise} Content list with pagination
   */
  async getContentList(params = {}) {
    try {
      const response = await axiosClient.get(`${this.baseUrl}/content`, {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          status: params.status || 'all',
          type: params.type || 'all'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting content list:', error);
      throw error;
    }
  }

  /**
   * Get content performance data (ONLY EXAMS with completion data)
   * @param {Number} limit - Number of exams to return (default: 10)
   * @returns {Promise} Performance data sorted by completions
   */
  async getContentPerformance(limit = 10) {
    try {
      const response = await axiosClient.get(`${this.baseUrl}/content-performance`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting content performance:', error);
      throw error;
    }
  }
}

const teacherDashboardService = new TeacherDashboardService();
export default teacherDashboardService;
