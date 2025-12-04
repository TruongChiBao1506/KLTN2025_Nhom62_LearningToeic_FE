import React from 'react';
import { Modal, Descriptions, Avatar, Button, Typography, Divider } from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import moment from 'moment';

const { Text, Paragraph } = Typography;

const ViewRequestModal = ({ visible, request, onClose }) => {
  if (!request) return null;

  const username = request.user?.username || request.userId?.username || 'N/A';
  const avatar = request.user?.avatar || request.userId?.avatar;

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <FileTextOutlined style={{ fontSize: 24, color: 'var(--color-brand-purple)' }} />
          <span>Teacher Request Details</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose} style={{ borderRadius: 20 }}>
          Close
        </Button>
      ]}
      width={700}
      style={{ top: 20 }}
    >
      <div style={{ padding: '20px 0' }}>
        {/* Applicant Info */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: 24,
          padding: 20,
          background: 'var(--color-primary)',
          borderRadius: 16
        }}>
          <Avatar 
            size={80} 
            src={avatar}
            icon={!avatar && <UserOutlined />}
            style={{ 
              border: '4px solid white',
              marginBottom: 12
            }}
          />
          <div>
            <Text strong style={{ fontSize: 18, color: 'white', display: 'block' }}>
              {request.fullName}
            </Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)' }}>
              @{username}
            </Text>
          </div>
        </div>

        <Divider />

        {/* Contact Information */}
        <Descriptions 
          title="Contact Information" 
          column={1}
          bordered
          size="middle"
        >
          <Descriptions.Item 
            label={<><MailOutlined /> Email</>}
          >
            {request.email}
          </Descriptions.Item>
          <Descriptions.Item 
            label={<><PhoneOutlined /> Phone</>}
          >
            {request.phoneNumber}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        {/* Professional Information */}
        <Descriptions 
          title="Professional Information" 
          column={1}
          bordered
          size="middle"
        >
          <Descriptions.Item label="Experience">
            <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
              {request.experience}
            </Paragraph>
          </Descriptions.Item>
          <Descriptions.Item label="Documents">
            {request.documents ? (
              <Button
                type="link"
                icon={<DownloadOutlined />}
                onClick={() => window.open(request.documents, '_blank')}
              >
                View/Download Documents
              </Button>
            ) : (
              <Text type="secondary">No documents provided</Text>
            )}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        {/* Request Status */}
        <Descriptions 
          title="Request Status" 
          column={1}
          bordered
          size="middle"
        >
          <Descriptions.Item label="Status">
            {request.status === 0 && <Text type="warning">Pending</Text>}
            {request.status === 1 && <Text type="success">Approved</Text>}
            {request.status === 2 && <Text type="danger">Rejected</Text>}
          </Descriptions.Item>
          {request.status === 2 && request.rejectionReason && (
            <Descriptions.Item label="Rejection Reason">
              <Paragraph style={{ marginBottom: 0, color: 'var(--color-danger)' }}>
                {request.rejectionReason}
              </Paragraph>
            </Descriptions.Item>
          )}
          <Descriptions.Item 
            label={<><ClockCircleOutlined /> Submitted At</>}
          >
            {moment(request.createdAt).format('DD/MM/YYYY HH:mm:ss')}
          </Descriptions.Item>
          {request.updatedAt && request.updatedAt !== request.createdAt && (
            <Descriptions.Item 
              label={<><ClockCircleOutlined /> Updated At</>}
            >
              {moment(request.updatedAt).format('DD/MM/YYYY HH:mm:ss')}
            </Descriptions.Item>
          )}
        </Descriptions>
      </div>
    </Modal>
  );
};

export default ViewRequestModal;
