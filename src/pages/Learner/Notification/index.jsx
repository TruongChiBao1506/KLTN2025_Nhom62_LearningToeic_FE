import React from "react";
import { useSelector, useDispatch } from 'react-redux';
import { markAsRead, markAllAsRead } from '../../../store/notificationSlice.js';
import { useAuthStore } from '../../../hooks/useAuthStore';
import "./style.css";

const Notification = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(state => state.notifications.notifications);
  const { info } = useAuthStore();

  return (
    <div className="notification-container">
      <div className="notification-card">
        <div className="notification-header">
          <h2 className="notification-title">Thông báo của bạn</h2>
          {notifications.length > 0 && notifications.some(n => !n.isRead) && (
            <button
              className="mark-all-btn"
              onClick={() => dispatch(markAllAsRead(info.id))}
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
                    {!notification.isRead ? (
                      <button
                        className="mark-read-btn"
                        onClick={() => dispatch(markAsRead(notification.id || notification._id))}
                      >
                        <i className="fas fa-check"></i>
                        Đánh dấu đã đọc
                      </button>
                    ) : (
                      <div className="read-status">
                        <i className="fas fa-check-circle" style={{ color: '#28a745' }}></i>
                        <span style={{ color: '#28a745', fontSize: '0.8rem', marginLeft: '4px' }}>Đã đọc</span>
                      </div>
                    )}
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
