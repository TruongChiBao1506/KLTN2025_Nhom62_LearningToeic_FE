import React, { useState, useEffect, useCallback } from 'react';
import { Badge, Dropdown, Empty, Button, Spin, message } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { BellOutlined, CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import notificationService from '../../../../services/notificationService';
import { getNotificationExtra } from './NotificationTypes';
import moment from 'moment';
import './style.css';

const NotificationDropdown = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const response = await notificationService.getUserNotifications(userId);
      if (response.success) {
        setNotifications(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!userId) return;
    
    try {
      const response = await notificationService.getUnreadCount(userId);
      if (response.success) {
        setUnreadCount(response.count || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [userId]);

  // Handle new notification from socket
  const handleNewNotification = useCallback((data) => {
    console.log('🔔 New notification in dropdown:', data);
    
    // Add to notifications list
    if (data.notification) {
      setNotifications(prev => [data.notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      const originalType = data.notification.data?.originalType || data.notification.type;
      const icon = getNotificationIcon(originalType);
      const color = getNotificationColor(originalType);
      
      // Show message notification with appropriate style
      const messageConfig = {
        content: (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>{icon}</span>
            <div>
              <div style={{ fontWeight: 600, color: color }}>{data.notification.title}</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{data.notification.message}</div>
            </div>
          </div>
        ),
        duration: 5,
        style: {
          marginTop: '20px',
          borderLeft: `4px solid ${color}`
        }
      };

      // Different message types based on notification type
      if (originalType === 'teacher_approved' || originalType === 'content_approved' || originalType === 'role_promoted') {
        message.success(messageConfig);
      } else if (originalType === 'teacher_rejected' || originalType === 'content_rejected' || originalType === 'role_demoted') {
        message.error(messageConfig);
      } else if (originalType === 'teacher_request' || originalType === 'content_pending') {
        message.warning(messageConfig);
      } else {
        message.info(messageConfig);
      }
    }
  }, []);

  // Mark as read
  const handleMarkAsRead = async (notificationId, e) => {
    e.stopPropagation();
    
    try {
      const response = await notificationService.markAsRead(notificationId);
      if (response.success) {
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    if (!userId) return;
    
    try {
      const response = await notificationService.markAllAsRead(userId);
      if (response.success) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
        message.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      message.error('Failed to mark all as read');
    }
  };

  // Delete notification
  const handleDelete = async (notificationId, e) => {
    e.stopPropagation();
    
    try {
      const response = await notificationService.deleteNotification(notificationId);
      if (response.success) {
        setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
        const deletedNotif = notifications.find(n => n._id === notificationId);
        if (deletedNotif && !deletedNotif.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Get notification icon
  const getNotificationIcon = (type) => {
    const icons = {
      // Teacher Request notifications
      'teacher_request': '📝',
      'teacher_approved': '🎉',
      'teacher_rejected': '❌',
      
      // Content Approval notifications
      'content_pending': '⏳',
      'content_approved': '✅',
      'content_rejected': '❌',
      
      // User Role notifications
      'role_promoted': '🎊',
      'role_demoted': '⚠️',
      
      // System notifications
      'achievement': '🏆',
      'system': '🔔',
      'reminder': '⏰'
    };
    return icons[type] || '🔔';
  };

  // Get notification color (for badge/border)
  const getNotificationColor = (type) => {
    const colors = {
      // Teacher Request notifications
      'teacher_request': 'var(--color-primary)', // Blue
      'teacher_approved': 'var(--color-success)', // Green
      'teacher_rejected': 'var(--color-danger)', // Red
      
      // Content Approval notifications
      'content_pending': 'var(--color-warning)', // Orange
      'content_approved': 'var(--color-success)', // Green
      'content_rejected': 'var(--color-danger)', // Red
      
      // User Role notifications
      'role_promoted': 'var(--color-chart-4)', // Purple
      'role_demoted': 'var(--color-chart-6)', // Orange-red
      
      // System notifications
      'achievement': 'var(--color-info)', // Cyan
      'system': '#8c8c8c', // Gray
      'reminder': 'var(--color-chart-5)' // Magenta
    };
    return colors[type] || '#8c8c8c';
  };

  // Setup socket listener
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    // ✅ No socket listeners needed here anymore
    // AdminHeader/TeacherLayout already handles socket notifications
    // and dispatches to Redux. This component just reads from Redux.
    
  }, [fetchNotifications, fetchUnreadCount]);

  // Render notification item
  const renderNotificationItem = (notif) => {
    const originalType = notif.data?.originalType || notif.type;
    const icon = getNotificationIcon(originalType);
    const color = getNotificationColor(originalType);
    
    return (
      <div
        key={notif._id}
        className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #f0f0f0',
          borderLeft: `4px solid ${color}`,
          cursor: 'pointer',
          transition: 'background 0.3s',
          backgroundColor: notif.isRead ? 'var(--color-bg-primary)' : '#f0f7ff'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notif.isRead ? 'var(--color-bg-primary)' : '#f0f7ff'}
      >
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ fontSize: '24px', flexShrink: 0 }}>{icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontWeight: notif.isRead ? '400' : '600',
              fontSize: '12px',
              marginBottom: '4px',
              color: '#1a1a1a'
            }}>
              {notif.title}
            </div>
            <div style={{
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
              marginBottom: '6px',
              lineHeight: '1.4'
            }}>
              {notif.message}
            </div>
            
            {/* Extra content based on notification type */}
            {getNotificationExtra(notif, () => setDropdownVisible(false))}
            
            <div style={{
              fontSize: '12px',
              color: 'var(--color-text-disabled)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '8px'
            }}>
              <span>{moment(notif.createdAt).fromNow()}</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {!notif.isRead && (
                  <Button
                    type="text"
                    size="small"
                    icon={<CheckOutlined />}
                    onClick={(e) => handleMarkAsRead(notif._id, e)}
                    style={{ color: 'var(--color-primary)' }}
                  >
                    Mark read
                  </Button>
                )}
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={(e) => handleDelete(notif._id, e)}
                  danger
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Dropdown menu content
  const dropdownContent = (
    <div style={{
      width: '400px',
      maxHeight: '500px',
      backgroundColor: 'var(--color-bg-primary)',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--color-primary)',
        color: 'var(--color-bg-primary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BellOutlined style={{ fontSize: '18px' }} />
          <span style={{ fontSize: '16px', fontWeight: '600' }}>Notifications</span>
          {unreadCount > 0 && (
            <Badge count={unreadCount} style={{ backgroundColor: 'var(--color-danger)' }} />
          )}
        </div>
        {notifications.length > 0 && unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            onClick={handleMarkAllAsRead}
            style={{ color: 'var(--color-bg-primary)', padding: 0 }}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* Content */}
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <Spin />
          </div>
        ) : notifications.length === 0 ? (
          <Empty
            description="No notifications"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: '40px' }}
          />
        ) : (
          notifications.map(renderNotificationItem)
        )}
      </div>
    </div>
  );

  return (
    <Dropdown
      dropdownRender={() => dropdownContent}
      trigger={['click']}
      placement="bottomRight"
      open={dropdownVisible}
      onOpenChange={(visible) => {
        setDropdownVisible(visible);
        if (visible) {
          fetchNotifications();
          fetchUnreadCount();
        }
      }}
    >
      <div style={{ position: 'relative', cursor: 'pointer' }}>
        <Badge count={unreadCount} offset={[-5, 5]}>
          <FontAwesomeIcon
            icon={faBell}
            style={{
              fontSize: '18px',
              color: 'var(--color-text-secondary)',
              transition: 'color 0.3s'
            }}
          />
        </Badge>
      </div>
    </Dropdown>
  );
};

export default NotificationDropdown;
