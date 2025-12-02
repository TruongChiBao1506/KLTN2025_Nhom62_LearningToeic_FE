import axiosClient from './axiosClient';

const teacherRequestService = {
  // ==================== USER ENDPOINTS ====================
  
  // User submit teacher request
  submitRequest: (formData) => {
    const url = '/teacher-requests';
    return axiosClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // User get their own request
  getMyRequest: () => {
    const url = '/teacher-requests/my-request';
    return axiosClient.get(url);
  },

  // User cancel their request
  cancelRequest: () => {
    const url = '/teacher-requests/cancel';
    return axiosClient.delete(url);
  },

  // ==================== ADMIN ENDPOINTS ====================
  
  // Admin get all requests with filters
  getAllRequests: (params) => {
    const url = '/teacher-requests/all';
    return axiosClient.get(url, { params });
  },

  // Admin get pending requests
  getPendingRequests: () => {
    const url = '/teacher-requests/pending';
    return axiosClient.get(url);
  },

  // Admin get pending count
  getPendingCount: () => {
    const url = '/teacher-requests/pending/count';
    return axiosClient.get(url);
  },

  // Admin get statistics
  getStatistics: () => {
    const url = '/teacher-requests/statistics';
    return axiosClient.get(url);
  },

  // Admin approve request
  approveRequest: (requestId) => {
    const url = `/teacher-requests/${requestId}/approve`;
    return axiosClient.patch(url);
  },

  // Admin reject request
  rejectRequest: (requestId, data) => {
    const url = `/teacher-requests/${requestId}/reject`;
    return axiosClient.patch(url, data);
  },
};

export default teacherRequestService;
