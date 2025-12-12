import axiosClient from './axiosClient';

// Export class để tránh webpack issues
export class NotificationService {
  constructor() {
    this.baseUrl = '/notifications';
  }

  // Lấy danh sách thông báo của user
  async getUserNotifications(userId) {
    try {
      const response = await axiosClient.get(`${this.baseUrl}/${userId}`);
      console.log('✅ Fetched notifications:', response.data);
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch notifications',
        data: []
      };
    }
  }

  // Đánh dấu thông báo đã đọc
  async markAsRead(notificationId) {
    try {
      const response = await axiosClient.put(`${this.baseUrl}/${notificationId}/read`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to mark as read'
      };
    }
  }

  // Đánh dấu tất cả thông báo đã đọc
  async markAllAsRead(userId) {
    try {
      const response = await axiosClient.put(`${this.baseUrl}/${userId}/read-all`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to mark all as read'
      };
    }
  }

  // Xóa thông báo
  async deleteNotification(notificationId) {
    try {
      const response = await axiosClient.delete(`${this.baseUrl}/${notificationId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete notification'
      };
    }
  }

  // Lấy số lượng thông báo chưa đọc
  async getUnreadCount(userId) {
    try {
      const response = await axiosClient.get(`${this.baseUrl}/${userId}/unread-count`);
      return {
        success: true,
        count: response.data?.count || 0
      };
    } catch (error) {
      console.error('❌ Error fetching unread count:', error);
      return {
        success: false,
        count: 0
      };
    }
  }
}

const notificationService = new NotificationService();
export default notificationService;