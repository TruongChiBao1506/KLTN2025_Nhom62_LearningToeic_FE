import axiosClient from './axiosClient';

const BASE_URL = '/exam-submission';

const examSubmissionService = {
  // ==================== TEACHER ENDPOINTS ====================
  
  /**
   * Get teacher's own exams with optional filtering
   * @param {string} filterType - 'all' | 'draft' | 'pending' | 'published' | 'rejected'
   * @returns {Promise} Response with exam list
   */
  getMyExams: async (filterType = 'all') => {
    try {
      const response = await axiosClient.get(`${BASE_URL}/my-exams`, {
        params: { filter: filterType }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching my exams:', error);
      throw error;
    }
  },

  /**
   * Validate exam before submission
   * @param {string} examId - Exam ID to validate
   * @returns {Promise} Validation result with statistics
   */
  validateExam: async (examId) => {
    try {
      const response = await axiosClient.get(`${BASE_URL}/validate/${examId}`);
      return response.data;
    } catch (error) {
      console.error('Error validating exam:', error);
      throw error;
    }
  },

  /**
   * Submit exam for admin approval
   * @param {string} examId - Exam ID to submit
   * @returns {Promise} Updated exam data
   */
  submitExam: async (examId) => {
    try {
      const response = await axiosClient.post(`${BASE_URL}/submit/${examId}`);
      return response.data;
    } catch (error) {
      console.error('Error submitting exam:', error);
      throw error;
    }
  },

  /**
   * Withdraw exam submission (only when pending)
   * @param {string} examId - Exam ID to withdraw
   * @returns {Promise} Updated exam data
   */
  withdrawSubmission: async (examId) => {
    try {
      const response = await axiosClient.post(`${BASE_URL}/withdraw/${examId}`);
      return response.data;
    } catch (error) {
      console.error('Error withdrawing exam submission:', error);
      throw error;
    }
  },

  // ==================== ADMIN ENDPOINTS ====================
  
  /**
   * Admin: Get all pending exams
   * @returns {Promise} List of pending exams
   */
  getPendingExams: async () => {
    try {
      const response = await axiosClient.get(`${BASE_URL}/pending`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pending exams:', error);
      throw error;
    }
  },

  /**
   * Admin: Approve exam
   * @param {string} examId - Exam ID to approve
   * @returns {Promise} Updated exam data
   */
  approveExam: async (examId) => {
    try {
      const response = await axiosClient.post(`${BASE_URL}/approve/${examId}`);
      return response.data;
    } catch (error) {
      console.error('Error approving exam:', error);
      throw error;
    }
  },

  /**
   * Admin: Reject exam with reason
   * @param {string} examId - Exam ID to reject
   * @param {object} data - { rejectionReason: string }
   * @returns {Promise} Updated exam data
   */
  rejectExam: async (examId, data) => {
    try {
      const response = await axiosClient.post(`${BASE_URL}/reject/${examId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error rejecting exam:', error);
      throw error;
    }
  }
};

export default examSubmissionService;
