// Utility functions for filtering notifications by role
export const getNotificationsByRole = (notifications, userRole) => {
  const roleNotificationTypes = {
    admin: [
      // Teacher Request
      'teacher_request',
      
      // Content Approval 
      'content_pending',
      
      // System
      'system',
      'system_notification',
      
      // Role Change
      'role_promoted',
      'role_demoted'
    ],
    
    teacher: [
      // Content Approval
      'content_approved',
      'content_rejected',
      
      // Teacher Request (cho chính họ)
      'teacher_approved', 
      'teacher_rejected',
      
      // System (quan trọng)
      'system',
      'system_notification'
    ],
    
    learner: [
      // Achievement
      'achievement',
      'new_achievement',
      
      // Teacher Request (nếu đăng ký)
      'teacher_approved',
      'teacher_rejected', 
      
      // Reminder
      'reminder',
      'reminder_notification',
      
      // System (nếu cần thiết)
      'system'
    ]
  };

  if (!notifications || !Array.isArray(notifications)) {
    return [];
  }

  return notifications.filter(notification => {
    const type = notification.data?.originalType || notification.type;
    return roleNotificationTypes[userRole]?.includes(type);
  });
};

// Role-specific counters
export const getRoleSpecificCounts = (counts, userRole) => {
  if (!counts) {
    return { total: 0 };
  }

  const roleCounts = {
    admin: {
      teacherRequest: counts.teacherRequest || 0,
      contentApproval: counts.contentApproval || 0, 
      system: counts.system || 0,
      roleChange: counts.roleChange || 0,
      total: (counts.teacherRequest || 0) + (counts.contentApproval || 0) + (counts.system || 0) + (counts.roleChange || 0)
    },
    
    teacher: {
      contentApproval: counts.contentApproval || 0,
      teacherRequest: counts.teacherRequest || 0,
      system: counts.system || 0,
      total: (counts.contentApproval || 0) + (counts.teacherRequest || 0) + (counts.system || 0)
    },
    
    learner: {
      achievement: counts.achievement || 0,
      teacherRequest: counts.teacherRequest || 0,
      reminder: counts.reminder || 0, 
      system: counts.system || 0,
      total: (counts.achievement || 0) + (counts.teacherRequest || 0) + (counts.reminder || 0) + (counts.system || 0)
    }
  };

  return roleCounts[userRole] || { total: 0 };
};