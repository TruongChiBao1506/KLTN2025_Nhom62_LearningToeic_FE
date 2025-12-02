import { useCallback, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addNotification } from '../store/notificationSlice';
import { toast } from 'react-toastify';

/**
 * Hook tập trung để xử lý tất cả loại notifications
 * - Quản lý Redux state
 * - Hiển thị toast notifications với background trắng đơn giản
 * - Styling theo từng loại notification (chỉ title có màu)
 * - 🔧 Progress bar với một màu đơn giản
 * - 🔧 Prevent duplicate notifications with Set tracking
 */
const useNotifications = () => {
  const dispatch = useDispatch();
  
  // 🔧 NEW: Track processed notifications to prevent duplicates
  const processedNotifications = useRef(new Set());

  // 🔧 NEW: Cleanup old processed notifications every 5 minutes to prevent memory leak
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const oldSize = processedNotifications.current.size;
      if (oldSize > 0) {
        console.log(`🧹 Cleaning up ${oldSize} processed notification IDs...`);
        processedNotifications.current.clear();
        console.log(`✅ Processed notifications cleared`);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(cleanupInterval);
  }, []);

  // ==================== HELPER FUNCTIONS ====================

  /**
   * Lấy emoji icon theo loại notification
   */
  const getNotificationIcon = (type) => {
    const icons = {
      // Achievement
      'achievement': '🏆',
      'new_achievement': '🏆',
      
      // Teacher Request
      'teacher_request': '📝',
      'teacher_approved': '✅',
      'teacher_rejected': '❌',
      
      // Content Approval
      'content_pending': '⏳',
      'content_approved': '✅',
      'content_rejected': '❌',
      
      // User Role
      'role_promoted': '⬆️',
      'role_demoted': '⬇️',
      
      // System
      'system': '🔔',
      'system_notification': '🔔',
      'reminder': '⏰',
      'reminder_notification': '⏰',
    };
    return icons[type] || '📬';
  };

  /**
   * 🎨 Lấy màu cho title theo loại notification
   */
  const getTitleColor = (type) => {
    const colors = {
      // Achievement - Gold
      'achievement': 'var(--color-warning)',
      'new_achievement': 'var(--color-warning)',
      
      // Success - Green
      'teacher_approved': 'var(--color-success)',
      'content_approved': 'var(--color-success)',
      'role_promoted': 'var(--color-success)',
      
      // Error - Red
      'teacher_rejected': 'var(--color-danger)',
      'content_rejected': 'var(--color-danger)',
      'role_demoted': 'var(--color-danger)',
      
      // Warning - Orange
      'teacher_request': 'var(--color-chart-6)',
      'content_pending': 'var(--color-chart-6)',
      
      // Info - Blue
      'reminder': 'var(--color-primary)',
      'reminder_notification': 'var(--color-primary)',
      
      // System - Purple
      'system': 'var(--color-chart-4)',
      'system_notification': 'var(--color-chart-4)',
    };
    return colors[type] || 'var(--color-chart-4)';
  };

  /**
   * 🎨 Lấy màu border theo loại notification
   */
  const getBorderColor = (type) => {
    const colors = {
      // Achievement - Gold
      'achievement': '#ffd666',
      'new_achievement': '#ffd666',
      
      // Success - Green
      'teacher_approved': '#95de64',
      'content_approved': '#95de64',
      'role_promoted': '#95de64',
      
      // Error - Red
      'teacher_rejected': 'var(--color-danger-light)',
      'content_rejected': 'var(--color-danger-light)',
      'role_demoted': 'var(--color-danger-light)',
      
      // Warning - Orange
      'teacher_request': '#ffc069',
      'content_pending': '#ffc069',
      
      // Info - Blue
      'reminder': '#69c0ff',
      'reminder_notification': '#69c0ff',
      
      // System - Purple
      'system': '#b37feb',
      'system_notification': '#b37feb',
    };
    return colors[type] || '#b37feb';
  };

  // ==================== TOAST DISPLAY FUNCTIONS ====================

  /**
   * 🎨 Hiển thị toast notification với background trắng đơn giản
   * 🔧 FIXED: Use toastId to prevent duplicate toasts
   * 🔧 FIXED: Progress bar với một màu xám đơn giản
   */
  const showBasicToast = useCallback((notification) => {
    const type = notification.data?.originalType || notification.type;
    const icon = getNotificationIcon(type);
    const titleColor = getTitleColor(type);
    const borderColor = getBorderColor(type);
    
    // 🔧 Use notification._id as toastId to prevent duplicates
    const toastId = notification._id || `${type}-${Date.now()}`;
    
    // Check if toast is already active
    if (toast.isActive(toastId)) {
      console.log('⚠️ Toast already active:', toastId);
      return;
    }

    toast(
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ 
          fontWeight: '600', 
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: titleColor
        }}>
          <span style={{ fontSize: '20px' }}>{icon}</span>
          {notification.title}
        </div>
        <div style={{ 
          fontSize: '12px', 
          color: '#595959',
          lineHeight: '1.5'
        }}>
          {notification.message}
        </div>
      </div>,
      {
        toastId,
        style: {
          background: 'var(--color-bg-primary)',
          borderLeft: `4px solid ${borderColor}`,
          color: '#262626',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          border: '1px solid #f0f0f0'
        },
        autoClose: 5000,
        progressClassName: 'toast-progress-bar',
        progressStyle: {
          background: 'var(--color-border)',
          backgroundImage: 'none',
          backgroundColor: 'var(--color-border)',
        }
      }
    );
  }, []);

  /**
   * 🎨 Hiển thị toast đặc biệt cho Achievement - background trắng
   * 🔧 FIXED: Use toastId to prevent duplicate toasts
   * 🔧 FIXED: Progress bar với một màu xám đơn giản
   */
  const showAchievementToast = useCallback((notification) => {
    const titleColor = getTitleColor('achievement');
    const borderColor = getBorderColor('achievement');
    
    // 🔧 Use notification._id as toastId to prevent duplicates
    const toastId = notification._id || `achievement-${Date.now()}`;
    
    // Check if toast is already active
    if (toast.isActive(toastId)) {
      console.log('⚠️ Achievement toast already active:', toastId);
      return;
    }

    toast(
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ 
          fontWeight: '700', 
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: titleColor
        }}>
          <span style={{ fontSize: '28px' }}>🏆</span>
          <span>{notification.title}</span>
        </div>
        <div style={{ 
          fontSize: '12px', 
          color: '#595959',
          lineHeight: '1.5'
        }}>
          {notification.message}
        </div>
        {notification.data?.points && (
          <div style={{ 
            fontSize: '12px', 
            fontWeight: '600',
            background: '#fffbe6',
            color: titleColor,
            padding: '8px 14px',
            borderRadius: '6px',
            marginTop: '4px',
            display: 'inline-block',
            alignSelf: 'flex-start',
            border: `1px solid ${borderColor}`
          }}>
            +{notification.data.points} XP ⭐
          </div>
        )}
      </div>,
      {
        toastId,
        icon: '🎉',
        style: {
          background: 'var(--color-bg-primary)',
          borderLeft: `5px solid ${titleColor}`,
          color: '#262626',
          borderRadius: '10px',
          padding: '20px',
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
          border: '1px solid #f0f0f0'
        },
        autoClose: 8000,
        progressClassName: 'toast-progress-bar',
        progressStyle: {
          background: 'var(--color-border)',
          backgroundImage: 'none',
          backgroundColor: 'var(--color-border)',
        }
      }
    );
  }, []);

  /**
   * 🎨 Hiển thị toast cho Role Change - background trắng
   * 🔧 FIXED: Use toastId to prevent duplicate toasts
   * 🔧 FIXED: Progress bar với một màu xám đơn giản
   */
  const showRoleChangeToast = useCallback((notification) => {
    const isPromotion = notification.data?.originalType === 'role_promoted';
    const type = isPromotion ? 'role_promoted' : 'role_demoted';
    const titleColor = getTitleColor(type);
    const borderColor = getBorderColor(type);
    const icon = isPromotion ? '⬆️' : '⬇️';
    
    // 🔧 Use notification._id as toastId to prevent duplicates
    const toastId = notification._id || `role-${Date.now()}`;
    
    // Check if toast is already active
    if (toast.isActive(toastId)) {
      console.log('⚠️ Role change toast already active:', toastId);
      return;
    }

    toast(
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ 
          fontWeight: '600', 
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: titleColor
        }}>
          <span style={{ fontSize: '24px' }}>{icon}</span>
          {notification.title}
        </div>
        <div style={{ 
          fontSize: '12px', 
          color: '#595959',
          lineHeight: '1.5'
        }}>
          {notification.message}
        </div>
        {notification.data?.reason && (
          <div style={{ 
            fontSize: '12px', 
            color: '#8c8c8c',
            marginTop: '4px',
            padding: '8px 12px',
            background: 'var(--color-bg-hover)',
            borderRadius: '6px',
            border: '1px solid #f0f0f0'
          }}>
            <strong style={{ color: titleColor }}>Lý do:</strong> {notification.data.reason}
          </div>
        )}
      </div>,
      {
        toastId,
        style: {
          background: 'var(--color-bg-primary)',
          borderLeft: `4px solid ${borderColor}`,
          color: '#262626',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          border: '1px solid #f0f0f0'
        },
        autoClose: 6000,
        progressClassName: 'toast-progress-bar',
        progressStyle: {
          background: 'var(--color-border)',
          backgroundImage: 'none',
          backgroundColor: 'var(--color-border)',
        }
      }
    );
  }, []);

  // ==================== NOTIFICATION TYPE HANDLERS ====================

  /**
   * Handler cho Achievement notifications
   */
  const handleAchievementNotification = useCallback((notification) => {
    console.log('🏆 Achievement notification:', notification);
    dispatch(addNotification(notification));
    showAchievementToast(notification);
  }, [dispatch, showAchievementToast]);

  /**
   * Handler cho Teacher Request notifications
   */
  const handleTeacherRequestNotification = useCallback((notification) => {
    console.log('📝 Teacher request notification:', notification);
    dispatch(addNotification(notification));
    showBasicToast(notification);
  }, [dispatch, showBasicToast]);

  /**
   * Handler cho Content Approval notifications
   */
  const handleContentApprovalNotification = useCallback((notification) => {
    console.log('📋 Content approval notification:', notification);
    dispatch(addNotification(notification));
    showBasicToast(notification);
  }, [dispatch, showBasicToast]);

  /**
   * Handler cho Role Change notifications
   */
  const handleRoleChangeNotification = useCallback((notification) => {
    console.log('⭐ Role change notification:', notification);
    dispatch(addNotification(notification));
    showRoleChangeToast(notification);
  }, [dispatch, showRoleChangeToast]);

  /**
   * Handler cho System notifications
   */
  const handleSystemNotification = useCallback((notification) => {
    console.log('🔔 System notification:', notification);
    dispatch(addNotification(notification));
    showBasicToast(notification);
  }, [dispatch, showBasicToast]);

  /**
   * Handler cho Reminder notifications
   */
  const handleReminderNotification = useCallback((notification) => {
    console.log('⏰ Reminder notification:', notification);
    dispatch(addNotification(notification));
    showBasicToast(notification);
  }, [dispatch, showBasicToast]);

  // ==================== MAIN NOTIFICATION HANDLER ====================

  /**
   * Handler chính - route notification đến handler phù hợp
   * Đây là function duy nhất cần gọi từ component
   * 🔧 FIXED: Track processed notifications to prevent duplicates
   */
  const handleNotification = useCallback((notification) => {
    // 🔧 CRITICAL: Check if notification was already processed
    const notificationId = notification._id || `${notification.type}-${notification.createdAt}`;
    
    if (processedNotifications.current.has(notificationId)) {
      console.log('⚠️ Notification already processed:', notificationId);
      return;
    }
    
    // Mark as processed
    processedNotifications.current.add(notificationId);
    console.log('📬 Processing notification:', notification);
    console.log('   Processed count:', processedNotifications.current.size);
    
    const type = notification.data?.originalType || notification.type;
    
    switch(type) {
      // Achievement
      case 'achievement':
      case 'new_achievement':
        handleAchievementNotification(notification);
        break;
      
      // Teacher Request
      case 'teacher_request':
      case 'teacher_approved':
      case 'teacher_rejected':
        handleTeacherRequestNotification(notification);
        break;
      
      // Content Approval
      case 'content_pending':
      case 'content_approved':
      case 'content_rejected':
        handleContentApprovalNotification(notification);
        break;
      
      // User Role
      case 'role_promoted':
      case 'role_demoted':
        handleRoleChangeNotification(notification);
        break;
      
      // System
      case 'system':
      case 'system_notification':
        handleSystemNotification(notification);
        break;
      
      // Reminder
      case 'reminder':
      case 'reminder_notification':
        handleReminderNotification(notification);
        break;
      
      // Default - Unknown type
      default:
        console.log('📬 Unknown notification type, using default handler');
        dispatch(addNotification(notification));
        showBasicToast(notification);
    }
  }, [
    dispatch,
    handleAchievementNotification,
    handleTeacherRequestNotification,
    handleContentApprovalNotification,
    handleRoleChangeNotification,
    handleSystemNotification,
    handleReminderNotification,
    showBasicToast
  ]);

  // Return API
  return {
    // Main handler - chỉ cần dùng cái này
    handleNotification,
    
    // Helper functions (có thể dùng riêng nếu cần)
    getNotificationIcon,
    getTitleColor,
    getBorderColor,
    
    // Individual handlers (có thể dùng riêng nếu cần)
    handleAchievementNotification,
    handleTeacherRequestNotification,
    handleContentApprovalNotification,
    handleRoleChangeNotification,
    handleSystemNotification,
    handleReminderNotification,
  };
};

export default useNotifications;