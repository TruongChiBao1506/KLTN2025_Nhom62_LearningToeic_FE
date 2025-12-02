import axiosClient from './axiosClient';

/**
 * Admin Dashboard Service - Simplified (6 Core APIs)
 * Handles essential dashboard-related API calls
 */
class AdminDashboardService {
  constructor() {
    this.baseUrl = '/admin/dashboard';
  }

  /**
   * Get system overview statistics (4 core metrics)
   * @returns {Promise} Overview data: totalUsers, totalStudents, totalTeachers, totalContent
   */
  async getOverview() {
    try {
      const response = await axiosClient.get(`${this.baseUrl}/overview`);
      console.log('📦 Overview response:', response);
      return response.data;
    } catch (error) {
      console.error('Error getting overview:', error);
      throw error;
    }
  }

  /**
   * Get pending approvals summary with urgent items (>3 days)
   * @returns {Promise} Pending approvals: totalPending, pendingByType, urgentItems
   */
  async getPendingApprovals() {
    try {
      const response = await axiosClient.get(`${this.baseUrl}/pending-approvals`);
      return response.data;
    } catch (error) {
      console.error('Error getting pending approvals:', error);
      throw error;
    }
  }

  /**
   * Get user statistics by role (simplified - no growth chart)
   * @returns {Promise} User statistics: totalUsers, usersByRole (admins/teachers/learners)
   */
  async getUserStats() {
    try {
      const response = await axiosClient.get(`${this.baseUrl}/user-stats`);
      return response.data;
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  /**
   * Get top performing content by completions (Exams only)
   * @param {Number} limit - Number of items to return (default: 5)
   * @returns {Promise} Top content: id, title, type, author, completions
   */
  async getTopContent(limit = 5) {
    try {
      const response = await axiosClient.get(`${this.baseUrl}/top-content`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting top content:', error);
      throw error;
    }
  }

  /**
   * Get top performing learners and teachers
   * @param {Number} limit - Number of users per category (default: 10)
   * @returns {Promise} Top performers: topLearners (by exam scores), topTeachers (by approved content)
   */
  async getTopPerformers(limit = 10) {
    try {
      const response = await axiosClient.get(`${this.baseUrl}/top-performers`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting top performers:', error);
      throw error;
    }
  }

  /**
   * Get teacher role requests summary and list
   * @param {String} status - Filter: "pending" | "approved" | "rejected" | "all" (default: "pending")
   * @returns {Promise} Teacher requests: totalPending, totalApproved, totalRejected, requests array
   */
  async getTeacherRequests(status = 'pending') {
    try {
      const response = await axiosClient.get(`${this.baseUrl}/teacher-requests`, {
        params: { status }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting teacher requests:', error);
      throw error;
    }
  }
}

const adminDashboardService = new AdminDashboardService();
export default adminDashboardService;
