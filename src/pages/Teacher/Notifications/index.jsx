import React, { useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { markAsRead, markAllAsRead } from '../../../store/notificationSlice.js';
import { getNotificationsByRole } from '../../../utils/notificationRoleFilter';
import "./style.css";

// Import FontAwesome components
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrophy, 
  faBell, 
  faFileAlt, 
  faBook, 
  faCog, 
  faClock,
  faBellSlash,
  faCheckDouble,
  faCheck,
  faCheckCircle,
  faUserCheck,
  faUserTimes
} from '@fortawesome/free-solid-svg-icons';

const Notifications = () => {
  const dispatch = useDispatch();
  const allNotifications = useSelector(state => state.notifications.notifications);
  
  // Filter notifications for teacher role
  const notifications = getNotificationsByRole(allNotifications, 'teacher');
  
  // Get teacher user info
  const teacherUserData = JSON.parse(localStorage.getItem('user') || '{}');

  // Function to get notification icon
  const getNotificationIcon = (type) => {
    const iconMap = {
      // Achievement
      'achievement': faTrophy,
      'new_achievement': faTrophy,
      
      // Teacher Request
      'teacher_request': faClock,
      'teacher_approved': faUserCheck,
      'teacher_rejected': faUserTimes,
      
      // Content Approval
      'content_pending': faClock,
      'content_approved': faCheckCircle,
      'content_rejected': faUserTimes,
      
      // User Role
      'role_promoted': faUserCheck,
      'role_demoted': faUserTimes,
      
      // System
      'system': faCog,
      'system_notification': faCog,
      'reminder': faClock,
      'reminder_notification': faClock,
      
      // Default
      'exam': faFileAlt,
      'course': faBook,
    };
    return iconMap[type] || faBell;
  };

  useEffect(() => {
    document.title = "Thông báo | Teacher Dashboard";
  }, []);

  return (
    <div className="notification-container">
      <div className="notification-card">
        <div className="notification-header">
          <h2 className="notification-title">
            <FontAwesomeIcon icon={faBell} style={{ marginRight: '12px' }} />
            Thông báo của bạn
          </h2>
          {notifications.length > 0 && notifications.some(n => !n.isRead) && (
            <button
              className="mark-all-btn"
              onClick={() => dispatch(markAllAsRead(teacherUserData._id || teacherUserData.id))}
            >
              <FontAwesomeIcon icon={faCheckDouble} />
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>
        <div className="notification-body">
          {notifications.length > 0 ? (
            <div className="notification-list">
              {notifications.map((notification) => (
                <div 
                  key={notification.id || notification._id} 
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                  data-type={notification.data?.originalType || notification.type}
                >
                  <div className="notification-icon">
                    <FontAwesomeIcon icon={getNotificationIcon(notification.data?.originalType || notification.type)} />
                  </div>
                  <div className="notification-content">
                    <h4 className="notification-item-title">{notification.title}</h4>
                    <p className="notification-text">{notification.message}</p>
                    <span className="notification-time">
                      {notification.timestamp 
                        ? new Date(notification.timestamp).toLocaleString('vi-VN')
                        : notification.createdAt 
                          ? new Date(notification.createdAt).toLocaleString('vi-VN') 
                          : 'Vừa xong'}
                    </span>
                  </div>
                  <div className="notification-actions">
                    {!notification.isRead ? (
                      <button
                        className="mark-read-btn"
                        onClick={() => dispatch(markAsRead(notification.id || notification._id))}
                      >
                        <FontAwesomeIcon icon={faCheck} />
                        Đánh dấu đã đọc
                      </button>
                    ) : (
                      <div className="read-status">
                        <FontAwesomeIcon icon={faCheckCircle} style={{ color: 'var(--color-approved)' }} />
                        <span style={{ color: 'var(--color-approved)', fontSize: '0.8rem', marginLeft: '4px' }}>Đã đọc</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-notification">
              <div className="empty-icon">
                <FontAwesomeIcon icon={faBellSlash} />
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

export default Notifications;
