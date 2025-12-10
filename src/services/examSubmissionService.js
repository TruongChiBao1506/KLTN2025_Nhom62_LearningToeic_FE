import axiosClient from './axiosClient';

const BASE_URL = '/exam-submission';

const examSubmissionService = {
  // ==================== TEACHER ENDPOINTS ====================
  
  /**
   * Get teacher's own exams with optional filtering
   * @param {string} filterType - 'all' | 'draft' | 'pending' | 'published' | 'rejected'
   */
  getMyExams: (filterType = 'all') => {
    const url = `${BASE_URL}/my-exams`;
    return axiosClient.get(url, {
      params: { filter: filterType }
    });
  },

  /**
   * Validate exam before submission
   * @param {string} examId - Exam ID to validate
   */
  validateExam: (examId) => {
    const url = `${BASE_URL}/validate/${examId}`;
    return axiosClient.get(url);
  },

  /**
   * Submit exam for admin approval
   * @param {string} examId - Exam ID to submit
   */
  submitExam: (examId) => {
    const url = `${BASE_URL}/submit/${examId}`;
    return axiosClient.post(url);
  },

  /**
   * Withdraw exam submission (only when pending)
   * @param {string} examId - Exam ID to withdraw
   */
  withdrawSubmission: (examId) => {
    const url = `${BASE_URL}/withdraw/${examId}`;
    return axiosClient.post(url);
  },

  // ==================== ADMIN ENDPOINTS ====================
  
  /**
   * Admin get all pending exams
   */
  getPendingExams: () => {
    const url = `${BASE_URL}/pending`;
    return axiosClient.get(url);
  },

  /**
   * Admin approve exam
   * @param {string} examId - Exam ID to approve
   */
  approveExam: (examId) => {
    const url = `${BASE_URL}/approve/${examId}`;
    return axiosClient.post(url);
  },

  /**
   * Admin reject exam with reason
   * @param {string} examId - Exam ID to reject
   * @param {object} data - { rejectionReason: string }
   */
  rejectExam: (examId, data) => {
    const url = `${BASE_URL}/reject/${examId}`;
    return axiosClient.post(url, data);
  }
};

export default examSubmissionService;
