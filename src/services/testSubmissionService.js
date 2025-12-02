import axiosClient from './axiosClient';

const testSubmissionService = {
  // ==================== TEACHER ENDPOINTS ====================
  
  /**
   * Get teacher's own tests with optional filter
   * @param {string} filterType - 'all' | 'draft' | 'pending' | 'published' | 'rejected'
   */
  getMyTests: (filterType) => {
    const url = '/test-submission/my-tests';
    return axiosClient.get(url, {
      params: filterType ? { filterType } : {}
    });
  },

  /**
   * Validate test before submission
   * @param {string} testId - Test ID to validate
   */
  validateTest: (testId) => {
    const url = `/test-submission/validate/${testId}`;
    return axiosClient.get(url);
  },

  /**
   * Submit test for admin approval
   * @param {string} testId - Test ID to submit
   */
  submitTest: (testId) => {
    const url = `/test-submission/submit/${testId}`;
    return axiosClient.post(url);
  },

  /**
   * Withdraw test submission (only when pending)
   * @param {string} testId - Test ID to withdraw
   */
  withdrawSubmission: (testId) => {
    const url = `/test-submission/withdraw/${testId}`;
    return axiosClient.post(url);
  },

  // ==================== ADMIN ENDPOINTS ====================
  
  /**
   * Admin get all pending tests
   */
  getPendingTests: () => {
    const url = '/test-submission/pending';
    return axiosClient.get(url);
  },

  /**
   * Admin approve test
   * @param {string} testId - Test ID to approve
   */
  approveTest: (testId) => {
    const url = `/test-submission/approve/${testId}`;
    return axiosClient.post(url);
  },

  /**
   * Admin reject test with reason
   * @param {string} testId - Test ID to reject
   * @param {object} data - { rejectionReason: string }
   */
  rejectTest: (testId, data) => {
    const url = `/test-submission/reject/${testId}`;
    return axiosClient.post(url, data);
  },
};

export default testSubmissionService;
