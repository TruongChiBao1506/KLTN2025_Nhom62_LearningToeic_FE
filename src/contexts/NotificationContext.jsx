import React, { createContext, useContext, useState, useCallback } from 'react';
import { NotificationService } from '../services/notificationService';

const NotificationContext = createContext();
const notificationService = new NotificationService();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications từ API (có thể gọi từ LearnerLayout khi cần)
  const fetchNotifications = useCallback(async (userId) => {
    if (!userId) return;
    setLoading(true);
    try {
      const result = await notificationService.getUserNotifications(userId);
      if (result.success) {
        setNotifications(result.data);
        setUnreadCount(result.data.filter(n => !n.isRead).length);
      }
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Thêm notification mới (cho local use)
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      type: 'achievement',
      isRead: false,
      timestamp: new Date(),
      ...notification,
    };
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, []);

  // Đánh dấu đã đọc
  const markAsRead = useCallback(async (id) => {
    try {
      setNotifications(prev => prev.map(n =>
        (n.id === id || n._id === id) ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
      await notificationService.markAsRead(id);
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  }, []);

  // Đánh dấu tất cả đã đọc
  const markAllAsRead = useCallback(async (userId) => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      if (userId) {
        await notificationService.markAllAsRead(userId);
        await fetchNotifications(userId);
      }
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
    }
  }, [fetchNotifications]);

  // Xóa notification
  const removeNotification = useCallback(async (id) => {
    try {
      setNotifications(prev => {
        const notification = prev.find(n => n.id === id || n._id === id);
        if (notification && !notification.isRead) {
          setUnreadCount(count => Math.max(0, count - 1));
        }
        return prev.filter(n => n.id !== id && n._id !== id);
      });
      await notificationService.deleteNotification(id);
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
    }
  }, []);

  // Lấy notifications theo loại
  const getNotificationsByType = useCallback((type) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      getNotificationsByType,
      fetchNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => useContext(NotificationContext);