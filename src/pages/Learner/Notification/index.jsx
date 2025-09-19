import React from "react";
import { useNotificationContext } from '../../../contexts/NotificationContext';
import { useAuthStore } from '../../../hooks/useAuthStore';
import "./style.css";

const Notification = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotificationContext();
  const { info } = useAuthStore();

  return (
    <div className="notification-container">
      <div className="notification-card">
        <div className="notification-header">
          <h2 className="notification-title">Thông báo của bạn</h2>
          {notifications.length > 0 && (
            <button
              className="mark-all-btn"
              onClick={() => markAllAsRead(info.id)}
            >
              <i className="fas fa-check-double"></i>
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>
        <div className="notification-body">
          {notifications.length > 0 ? (
            <div className="notification-list">
              {notifications.map((notification) => (
                <div key={notification.id || notification._id} className={`notification-item ${!notification.isRead ? 'unread' : ''}`}>
                  <div className="notification-icon">
                    <i className={`fas ${notification.type === 'achievement' ? 'fa-trophy' : 'fa-bell'}`}></i>
                  </div>
                  <div className="notification-content">
                    <h4 className="notification-item-title">{notification.title}</h4>
                    <p className="notification-text">{notification.message}</p>
                    <span className="notification-time">
                      {notification.createdAt ? new Date(notification.createdAt).toLocaleString('vi-VN') : 'Vừa xong'}
                    </span>
                  </div>
                  <div className="notification-actions">
                    <button
                      className="mark-read-btn"
                      onClick={() => markAsRead(notification.id || notification._id)}
                    >
                      <i className="fas fa-check"></i>
                      Đánh dấu đã đọc
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-notification">
              <div className="empty-icon">
                <i className="fas fa-bell-slash"></i>
              </div>
              <h3>Không có thông báo mới</h3>
              <p>Bạn không có thông báo nào. Thông báo mới sẽ xuất hiện ở đây.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notification;
