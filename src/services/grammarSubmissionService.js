import axiosClient from './axiosClient';

const grammarSubmissionService = {
  // ==================== TEACHER ENDPOINTS ====================
  
  /**
   * Get teacher's own grammars with optional filter
   * @param {string} filterType - 'all' | 'draft' | 'pending' | 'published' | 'rejected'
   */
  getMyGrammars: (filterType) => {
    const url = '/grammar-submission/my-grammars';
    return axiosClient.get(url, {
      params: filterType ? { filterType } : {}
    });
  },

  /**
   * Validate grammar before submission
   * @param {string} grammarId - Grammar ID to validate
   */
  validateGrammar: (grammarId) => {
    const url = `/grammar-submission/validate/${grammarId}`;
    return axiosClient.get(url);
  },

  /**
   * Submit grammar for admin approval
   * @param {string} grammarId - Grammar ID to submit
   */
  submitGrammar: (grammarId) => {
    const url = `/grammar-submission/submit/${grammarId}`;
    return axiosClient.post(url);
  },

  /**
   * Withdraw grammar submission (only when pending)
   * @param {string} grammarId - Grammar ID to withdraw
   */
  withdrawSubmission: (grammarId) => {
    const url = `/grammar-submission/withdraw/${grammarId}`;
    return axiosClient.post(url);
  },

  // ==================== ADMIN ENDPOINTS ====================
  
  /**
   * Admin get all pending grammars
   */
  getPendingGrammars: () => {
    const url = '/grammar-submission/pending';
    return axiosClient.get(url);
  },

  /**
   * Admin approve grammar
   * @param {string} grammarId - Grammar ID to approve
   */
  approveGrammar: (grammarId) => {
    const url = `/grammar-submission/approve/${grammarId}`;
    return axiosClient.post(url);
  },

  /**
   * Admin reject grammar with reason
   * @param {string} grammarId - Grammar ID to reject
   * @param {object} data - { rejectionReason: string }
   */
  rejectGrammar: (grammarId, data) => {
    const url = `/grammar-submission/reject/${grammarId}`;
    return axiosClient.post(url, data);
  },
};

export default grammarSubmissionService;
