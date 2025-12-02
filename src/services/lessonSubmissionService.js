import axiosClient from './axiosClient';

const lessonSubmissionService = {
  // ==================== TEACHER ENDPOINTS ====================
  
  /**
   * Get teacher's own lessons with optional filter
   * @param {string} filterType - 'all' | 'draft' | 'pending' | 'published' | 'rejected'
   */
  getMyLessons: (filterType) => {
    const url = '/lesson-submission/my-lessons';
    return axiosClient.get(url, {
      params: filterType ? { filterType } : {}
    });
  },

  /**
   * Validate lesson before submission
   * @param {string} lessonId - Lesson ID to validate
   */
  validateLesson: (lessonId) => {
    const url = `/lesson-submission/validate/${lessonId}`;
    return axiosClient.get(url);
  },

  /**
   * Submit lesson for admin approval
   * @param {string} lessonId - Lesson ID to submit
   */
  submitLesson: (lessonId) => {
    const url = `/lesson-submission/submit/${lessonId}`;
    return axiosClient.post(url);
  },

  /**
   * Withdraw lesson submission (only when pending)
   * @param {string} lessonId - Lesson ID to withdraw
   */
  withdrawSubmission: (lessonId) => {
    const url = `/lesson-submission/withdraw/${lessonId}`;
    return axiosClient.post(url);
  },

  // ==================== ADMIN ENDPOINTS ====================
  
  /**
   * Admin get all pending lessons
   */
  getPendingLessons: () => {
    const url = '/lesson-submission/pending';
    return axiosClient.get(url);
  },

  /**
   * Admin approve lesson
   * @param {string} lessonId - Lesson ID to approve
   */
  approveLesson: (lessonId) => {
    const url = `/lesson-submission/approve/${lessonId}`;
    return axiosClient.post(url);
  },

  /**
   * Admin reject lesson with reason
   * @param {string} lessonId - Lesson ID to reject
   * @param {object} data - { rejectionReason: string }
   */
  rejectLesson: (lessonId, data) => {
    const url = `/lesson-submission/reject/${lessonId}`;
    return axiosClient.post(url, data);
  },
};

export default lessonSubmissionService;
