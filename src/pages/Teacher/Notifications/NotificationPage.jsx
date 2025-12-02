import React, { useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { markAsRead, markAllAsRead } from '../../../store/notificationSlice.js';
import { getNotificationsByRole } from '../../../utils/notificationRoleFilter';
import "./NotificationPage.css";

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

const NotificationPage = () => {
  const dispatch = useDispatch();
  const allNotifications = useSelector(state => state.notifications.notifications);
  
  // Filter notifications for teacher role
  const notifications = getNotificationsByRole(allNotifications, 'teacher');
  
  // Get teacher user info
  const teacherUserData = JSON.parse(localStorage.getItem('user') || '{}');

  // Function to get notification icon
  const getNotificationIcon = (type) => {
    const iconMap = {
      'achievement': faTrophy,
      'new_achievement': faTrophy,
      'teacher_request': faClock,
      'teacher_approved': faUserCheck,
      'teacher_rejected': faUserTimes,
      'content_pending': faClock,
      'content_approved': faCheckCircle,
      'content_rejected': faUserTimes,
      'role_promoted': faUserCheck,
      'role_demoted': faUserTimes,
      'system': faCog,
      'system_notification': faCog,
      'reminder': faClock,
      'reminder_notification': faClock,
      'exam': faFileAlt,
      'course': faBook,
    };
    return iconMap[type] || faBell;
  };

  useEffect(() => {
    document.title = "Thông báo | Teacher Dashboard";
  }, []);

  return (
    <div className="notif-page">
      <div className="notif-wrapper">
        <div className="notif-header-bar">
          <h2 className="notif-title">
            <FontAwesomeIcon icon={faBell} />
            <span>Thông báo của bạn</span>
          </h2>
          {notifications.length > 0 && notifications.some(n => !n.isRead) && (
            <button
              className="notif-mark-all"
              onClick={() => dispatch(markAllAsRead(teacherUserData._id || teacherUserData.id))}
            >
              <FontAwesomeIcon icon={faCheckDouble} />
              <span>Đánh dấu tất cả đã đọc</span>
            </button>
          )}
        </div>
        
        <div className="notif-content-area">
          {notifications.length > 0 ? (
            <div className="notif-items">
              {notifications.map((notification) => (
                <div 
                  key={notification.id || notification._id} 
                  className={`notif-card ${!notification.isRead ? 'notif-unread' : ''}`}
                >
                  <div className="notif-icon-box">
                    <FontAwesomeIcon icon={getNotificationIcon(notification.data?.originalType || notification.type)} />
                  </div>
                  <div className="notif-text-area">
                    <h4 className="notif-card-title">{notification.title}</h4>
                    <p className="notif-message">{notification.message}</p>
                    <span className="notif-timestamp">
                      {notification.timestamp 
                        ? new Date(notification.timestamp).toLocaleString('vi-VN')
                        : notification.createdAt 
                          ? new Date(notification.createdAt).toLocaleString('vi-VN') 
                          : 'Vừa xong'}
                    </span>
                  </div>
                  <div className="notif-action-area">
                    {!notification.isRead ? (
                      <button
                        className="notif-mark-read"
                        onClick={() => dispatch(markAsRead(notification.id || notification._id))}
                      >
                        <FontAwesomeIcon icon={faCheck} />
                        <span>Đánh dấu đã đọc</span>
                      </button>
                    ) : (
                      <div className="notif-read-badge">
                        <FontAwesomeIcon icon={faCheckCircle} />
                        <span>Đã đọc</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="notif-empty">
              <FontAwesomeIcon icon={faBellSlash} className="notif-empty-icon" />
              <h3>Không có thông báo mới</h3>
              <p>Bạn không có thông báo nào. Thông báo mới sẽ xuất hiện ở đây.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
