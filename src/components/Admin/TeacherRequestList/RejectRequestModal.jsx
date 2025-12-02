import React, { useState, useEffect } from 'react';
import { Modal, Input, Typography, message } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;

const RejectRequestModal = ({ visible, request, onClose, onSubmit }) => {
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (!visible) {
      setRejectionReason('');
    }
  }, [visible]);

  const handleSubmit = () => {
    if (!rejectionReason?.trim()) {
      message.error('Please provide a rejection reason');
      return;
    }
    
    if (rejectionReason.trim().length < 10) {
      message.error('Rejection reason must be at least 10 characters');
      return;
    }

    if (rejectionReason.trim().length > 500) {
      message.error('Rejection reason must not exceed 500 characters');
      return;
    }

    onSubmit(rejectionReason.trim());
  };

  if (!request) return null;

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <CloseCircleOutlined style={{ fontSize: 24, color: 'var(--color-danger)' }} />
          <span>Reject Teacher Request</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Reject Request"
      okButtonProps={{ 
        danger: true,
        style: { borderRadius: 20 }
      }}
      cancelButtonProps={{
        style: { borderRadius: 20 }
      }}
      width={600}
    >
      <div style={{ padding: '20px 0' }}>
        <div style={{ 
          marginBottom: 16,
          padding: 16,
          background: '#fff2e8',
          borderRadius: 8,
          border: '1px solid #ffbb96'
        }}>
          <Text strong>Applicant: </Text>
          <Text>{request.fullName}</Text>
          <br />
          <Text strong>Email: </Text>
          <Text>{request.email}</Text>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Text type="danger" strong>
            ⚠️ Important: Please provide a clear reason for rejection
          </Text>
        </div>

        <TextArea
          placeholder="Enter rejection reason (minimum 10 characters, maximum 500 characters)..."
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          rows={6}
          maxLength={500}
          showCount
          style={{ borderRadius: 8 }}
        />

        <div style={{ marginTop: 12 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            The applicant will receive a notification with this reason.
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default RejectRequestModal;
