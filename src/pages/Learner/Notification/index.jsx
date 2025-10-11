import React, { useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { markAsRead, markAllAsRead, addNotification } from '../../../store/notificationSlice.js';
import { useAuthStore } from '../../../hooks/useAuthStore';
import socketService from '../../../services/socketService';
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
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';

const Notification = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(state => state.notifications.notifications);
  const { info } = useAuthStore();

  // Function to get notification icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'achievement':
        return faTrophy;
      case 'exam':
        return faFileAlt;
      case 'course':
        return faBook;
      case 'system':
        return faCog;
      case 'reminder':
        return faClock;
      default:
        return faBell;
    }
  };
   useEffect(() => {
      document.title = "Thông báo | TOEIC Learning Platform";
    }, []);

  // Socket.IO setup for real-time notifications
  useEffect(() => {
    if (info?.id) {
      // Connect socket với userId
      socketService.connect(info.id);

      // Lắng nghe event 'reminder' từ server
      const handleReminder = (data) => {
        console.log('📢 Nhận được reminder:', data);
        
        // Tạo notification object từ data reminder
        const newNotification = {
          id: `reminder_${Date.now()}`, // Tạo ID unique
          type: data.type || 'reminder',
          title: 'Nhắc nhở tiến độ học tập',
          message: data.message,
          createdAt: data.timestamp || new Date().toISOString(),
          isRead: false,
          userId: data.userId
        };

        // Dispatch action để thêm notification vào store
        dispatch(addNotification(newNotification));
      };

      // Đăng ký listener
      socketService.on('reminder', handleReminder);

      // Cleanup khi component unmount
      return () => {
        socketService.off('reminder', handleReminder);
      };
    }
  }, [info?.id, dispatch]);

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
                  data-type={notification.type}
                >
                  <div className="notification-icon">
                    <FontAwesomeIcon icon={getNotificationIcon(notification.type)} />
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
                        <FontAwesomeIcon icon={faCheck} />
                        Đánh dấu đã đọc
                      </button>
                    ) : (
                      <div className="read-status">
                        <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#28a745' }} />
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

export default Notification;