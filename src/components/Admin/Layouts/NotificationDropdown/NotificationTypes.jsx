import React from 'react';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';

/**
 * Component để render các loại notification đặc biệt với action buttons
 */

// Teacher Request notification (for admin)
export const TeacherRequestNotification = ({ notification, onAction }) => {
  const navigate = useNavigate();
  
  return (
    <div>
      <Button
        type="primary"
        size="small"
        onClick={() => {
          navigate('/admin/teacher-requests');
          onAction?.();
        }}
        style={{ marginTop: '8px' }}
      >
        Xem yêu cầu
      </Button>
    </div>
  );
};

// Content Pending notification (for admin)
export const ContentPendingNotification = ({ notification, onAction }) => {
  const navigate = useNavigate();
  
  return (
    <div>
      <Button
        type="primary"
        size="small"
        onClick={() => {
          // Navigate to appropriate pending content page
          const contentType = notification.data?.relatedModel;
          if (contentType === 'Lesson') {
            navigate('/admin/lessons');
          } else if (contentType === 'Test') {
            navigate('/admin/tests');
          } else if (contentType === 'Exam') {
            navigate('/admin/exams');
          }
          onAction?.();
        }}
        style={{ marginTop: '8px' }}
      >
        Xem nội dung
      </Button>
    </div>
  );
};

// Content Approved notification (for teacher)
export const ContentApprovedNotification = ({ notification, onAction }) => {
  const contentTitle = notification.data?.contentTitle || 'nội dung';
  
  return (
    <div style={{ 
      marginTop: '8px',
      padding: '8px',
      background: 'var(--color-success-bg)',
      border: '1px solid #b7eb8f',
      borderRadius: '4px'
    }}>
      <div style={{ fontSize: '12px', color: 'var(--color-success)' }}>
        <strong>{contentTitle}</strong> đã được phê duyệt và hiển thị cho học viên
      </div>
    </div>
  );
};

// Content Rejected notification (for teacher)
export const ContentRejectedNotification = ({ notification, onAction }) => {
  const reason = notification.data?.reason || 'Không có lý do cụ thể';
  
  return (
    <div style={{ 
      marginTop: '8px',
      padding: '8px',
      background: '#fff2e8',
      border: '1px solid #ffbb96',
      borderRadius: '4px'
    }}>
      <div style={{ fontSize: '12px', color: '#fa541c' }}>
        <strong>Lý do:</strong> {reason}
      </div>
    </div>
  );
};

// Role Promoted notification
export const RolePromotedNotification = ({ notification, onAction }) => {
  const roleName = notification.data?.roleName || 'Unknown';
  const roleDisplay = {
    'ROLE_ADMIN': 'Admin',
    'ROLE_TEACHER': 'Teacher',
    'ROLE_LEARNER': 'Learner'
  }[roleName] || roleName;
  
  return (
    <div style={{ 
      marginTop: '8px',
      padding: '8px',
      background: '#f9f0ff',
      border: '1px solid #d3adf7',
      borderRadius: '4px'
    }}>
      <div style={{ fontSize: '12px', color: 'var(--color-chart-4)' }}>
        🎊 Bạn đã được thăng cấp lên <strong>{roleDisplay}</strong>
      </div>
    </div>
  );
};

// Role Demoted notification
export const RoleDemotedNotification = ({ notification, onAction }) => {
  const reason = notification.data?.reason;
  
  return (
    <div style={{ 
      marginTop: '8px',
      padding: '8px',
      background: 'var(--color-warning-bg)',
      border: '1px solid #ffd591',
      borderRadius: '4px'
    }}>
      {reason && (
        <div style={{ fontSize: '12px', color: 'var(--color-chart-6)' }}>
          <strong>Lý do:</strong> {reason}
        </div>
      )}
    </div>
  );
};

// Get notification extra content based on type
export const getNotificationExtra = (notification, onAction) => {
  const originalType = notification.data?.originalType || notification.type;
  
  switch(originalType) {
    case 'teacher_request':
      return <TeacherRequestNotification notification={notification} onAction={onAction} />;
    
    case 'content_pending':
      return <ContentPendingNotification notification={notification} onAction={onAction} />;
    
    case 'content_approved':
      return <ContentApprovedNotification notification={notification} onAction={onAction} />;
    
    case 'content_rejected':
      return <ContentRejectedNotification notification={notification} onAction={onAction} />;
    
    case 'role_promoted':
      return <RolePromotedNotification notification={notification} onAction={onAction} />;
    
    case 'role_demoted':
      return <RoleDemotedNotification notification={notification} onAction={onAction} />;
    
    default:
      return null;
  }
};
