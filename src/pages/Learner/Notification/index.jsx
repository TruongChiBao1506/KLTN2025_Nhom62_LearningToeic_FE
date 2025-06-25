import React, { useState } from "react";
import "./style.css";

const Notification = () => {
  // Giả lập dữ liệu thông báo
  const [notifications, setNotifications] = useState([]);

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="card notification-card">
            <div className="card-header">
              <h3>Thông báo của bạn</h3>
            </div>
            <div className="card-body">
              {notifications.length > 0 ? (
                <div className="notification-list">
                  {notifications.map((notification, index) => (
                    <div key={index} className="notification-item">
                      <div className="notification-icon">
                        <i className={`fas ${notification.icon}`}></i>
                      </div>
                      <div className="notification-content">
                        <div className="notification-title">{notification.title}</div>
                        <div className="notification-text">{notification.text}</div>
                        <div className="notification-time">{notification.time}</div>
                      </div>
                      <div className="notification-actions">
                        <button className="btn btn-sm btn-outline-secondary">
                          <i className="fas fa-check"></i> Đánh dấu đã đọc
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-5">
                  <div className="empty-notification-icon">
                    <i className="fas fa-bell-slash"></i>
                  </div>
                  <h5 className="mt-3">Không có thông báo mới</h5>
                  <p className="text-muted">
                    Bạn không có thông báo nào. Thông báo mới sẽ xuất hiện ở đây.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification;
