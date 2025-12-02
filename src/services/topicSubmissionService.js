import axiosClient from './axiosClient';

const topicSubmissionService = {
  // ==================== TEACHER ENDPOINTS ====================
  
  /**
   * Get teacher's own topics with optional filter
   * @param {string} filterType - 'all' | 'draft' | 'pending' | 'published' | 'rejected'
   */
  getMyTopics: (filterType) => {
    const url = '/topic-submission/my-topics';
    return axiosClient.get(url, {
      params: filterType ? { filterType } : {}
    });
  },

  /**
   * Validate topic before submission
   * @param {string} topicId - Topic ID to validate
   */
  validateTopic: (topicId) => {
    const url = `/topic-submission/validate/${topicId}`;
    return axiosClient.get(url);
  },

  /**
   * Submit topic for admin approval
   * @param {string} topicId - Topic ID to submit
   */
  submitTopic: (topicId) => {
    const url = `/topic-submission/submit/${topicId}`;
    return axiosClient.post(url);
  },

  /**
   * Withdraw topic submission (only when pending)
   * @param {string} topicId - Topic ID to withdraw
   */
  withdrawSubmission: (topicId) => {
    const url = `/topic-submission/withdraw/${topicId}`;
    return axiosClient.post(url);
  },

  // ==================== ADMIN ENDPOINTS ====================
  
  /**
   * Admin get all pending topics
   */
  getPendingTopics: () => {
    const url = '/topic-submission/pending';
    return axiosClient.get(url);
  },

  /**
   * Admin approve topic
   * @param {string} topicId - Topic ID to approve
   */
  approveTopic: (topicId) => {
    const url = `/topic-submission/approve/${topicId}`;
    return axiosClient.post(url);
  },

  /**
   * Admin reject topic with reason
   * @param {string} topicId - Topic ID to reject
   * @param {object} data - { rejectionReason: string }
   */
  rejectTopic: (topicId, data) => {
    const url = `/topic-submission/reject/${topicId}`;
    return axiosClient.post(url, data);
  },
};

export default topicSubmissionService;