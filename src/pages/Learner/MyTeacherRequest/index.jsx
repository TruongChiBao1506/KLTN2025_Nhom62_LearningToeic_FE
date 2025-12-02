import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Space,
  Typography,
  message,
  Modal,
  Result,
  Alert,
  Spin
} from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import socketService from '../../../services/socketService';
import teacherRequestService from '../../../services/teacherRequestService';
import './style.css';

const { Title } = Typography;
const { confirm } = Modal;

const MyTeacherRequest = () => {
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState(null);
  const navigate = useNavigate();

  const fetchMyRequest = useCallback(async () => {
    setLoading(true);
    try {
      const data = await teacherRequestService.getMyRequest();
      if (data.success) {
        setRequest(data.data);
      } else {
        setRequest(null);
      }
    } catch (error) {
      console.error('Error fetching request:', error);
      if (error.response?.status === 401) {
        message.error('Session expired. Please login again.');
        navigate('/auth/login');
      } else {
        message.error('Failed to load your request');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleApproved = useCallback((data) => {
    message.success('Congratulations! Your teacher request has been approved!');
    fetchMyRequest();
    // Reload to update role
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }, [fetchMyRequest]);

  const handleRejected = useCallback((data) => {
    message.error('Your teacher request has been rejected');
    fetchMyRequest();
  }, [fetchMyRequest]);

  useEffect(() => {
    document.title = "My Teacher Request | TOEIC Learning";
    fetchMyRequest();

    // Setup real-time listeners
    socketService.on('teacher_approved', handleApproved);
    socketService.on('teacher_rejected', handleRejected);

    return () => {
      socketService.off('teacher_approved', handleApproved);
      socketService.off('teacher_rejected', handleRejected);
    };
  }, [fetchMyRequest, handleApproved, handleRejected]);

  const handleCancelRequest = () => {
    confirm({
      title: 'Cancel Teacher Request',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to cancel your teacher request? This action cannot be undone.',
      okText: 'Yes, Cancel Request',
      okType: 'danger',
      cancelText: 'No, Keep Request',
      onOk: async () => {
        try {
          const data = await teacherRequestService.cancelRequest();
          
          if (data.success) {
            message.success('Your request has been cancelled');
            navigate('/learner/become-teacher');
          } else {
            message.error(data.message || 'Failed to cancel request');
          }
        } catch (error) {
          console.error('Error cancelling request:', error);
          if (error.response?.status === 401) {
            message.error('Session expired. Please login again.');
            navigate('/auth/login');
          } else {
            message.error(error.response?.data?.message || 'Failed to cancel request');
          }
        }
      }
    });
  };

  const getStatusTag = (status) => {
    const statusMap = {
      0: {
        color: 'gold',
        icon: <ClockCircleOutlined />,
        text: 'PENDING'
      },
      1: {
        color: 'success',
        icon: <CheckCircleOutlined />,
        text: 'APPROVED'
      },
      2: {
        color: 'error',
        icon: <CloseCircleOutlined />,
        text: 'REJECTED'
      }
    };

    const config = statusMap[status] || statusMap[0];

    return (
      <Tag color={config.color} style={{ fontSize: 16, padding: '4px 12px' }}>
        {config.icon} {config.text}
      </Tag>
    );
  };

  const getStatusAlert = (status, rejectionReason) => {
    if (status === 0) {
      return (
        <Alert
          message="Request Pending"
          description="Your teacher request is being reviewed. You'll receive a notification once it's processed."
          type="info"
          showIcon
          icon={<ClockCircleOutlined />}
        />
      );
    }

    if (status === 1) {
      return (
        <Alert
          message="Request Approved!"
          description="Congratulations! You can now create content and help students learn."
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
        />
      );
    }

    if (status === 2) {
      return (
        <Alert
          message="Request Rejected"
          description={
            <div>
              <p>Unfortunately, your request has been rejected.</p>
              {rejectionReason && (
                <div>
                  <strong>Reason:</strong>
                  <p style={{ marginTop: 8, padding: 12, background: '#fff1f0', borderRadius: 4 }}>
                    {rejectionReason}
                  </p>
                </div>
              )}
            </div>
          }
          type="error"
          showIcon
          icon={<CloseCircleOutlined />}
        />
      );
    }
  };

  if (loading) {
    return (
      <div className="my-request-container">
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <p style={{ marginTop: 16 }}>Loading your request...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="my-request-container">
        <Card>
          <Result
            status="info"
            title="No Request Found"
            subTitle="You haven't submitted a teacher request yet."
            extra={
              <Button type="primary" onClick={() => navigate('/learner/become-teacher')}>
                Become a Teacher
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="my-request-container">
      <Card className="my-request-card">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header */}
          <div style={{ textAlign: 'center' }}>
            <Title level={2} style={{ marginBottom: 12 }}>My Teacher Request</Title>
            {getStatusTag(request.status)}
          </div>

          {/* Status Alert */}
          {getStatusAlert(request.status, request.rejectionReason)}

          {/* Request Details - Compact Layout */}
          <div className="request-details-compact">
            {/* Contact Information */}
            <Card type="inner" className="info-card">
              <Title level={4}>Contact Information</Title>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Full Name">{request.fullName}</Descriptions.Item>
                <Descriptions.Item label="Email">{request.user?.email}</Descriptions.Item>
                <Descriptions.Item label="Phone">{request.phoneNumber}</Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Professional Information */}
            <Card type="inner" className="info-card">
              <Title level={4}>Professional Information</Title>
              <div className="info-section">
                <div className="info-label">Teaching Experience:</div>
                <div className="info-content">{request.experience}</div>
              </div>
              <div className="info-section">
                <div className="info-label">Reason:</div>
                <div className="info-content">{request.reason}</div>
              </div>
            </Card>

            {/* Certificates & Dates */}
            <Card type="inner" className="info-card">
              <Title level={4}>Documents & Timeline</Title>
              {request.certificates && request.certificates.length > 0 && (
                <div className="info-section">
                  <div className="info-label">Certificates:</div>
                  <Space wrap size="small">
                    {request.certificates.map((cert, index) => (
                      <Button
                        key={index}
                        icon={<DownloadOutlined />}
                        href={`http://localhost:5000${cert}`}
                        target="_blank"
                        size="small"
                        type="link"
                      >
                        Certificate {index + 1}
                      </Button>
                    ))}
                  </Space>
                </div>
              )}
              <Descriptions column={1} size="small" style={{ marginTop: 12 }}>
                <Descriptions.Item label="Submitted">
                  {moment(request.createdAt).format('DD/MM/YYYY HH:mm')}
                </Descriptions.Item>
                {request.status === 1 && request.approvedAt && (
                  <Descriptions.Item label="Approved">
                    {moment(request.approvedAt).format('DD/MM/YYYY HH:mm')}
                  </Descriptions.Item>
                )}
                {request.status === 2 && request.rejectedAt && (
                  <Descriptions.Item label="Rejected">
                    {moment(request.rejectedAt).format('DD/MM/YYYY HH:mm')}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </div>

          {/* Actions */}
          <div style={{ textAlign: 'center', paddingTop: 8 }}>
            {request.status === 0 && (
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleCancelRequest}
                size="large"
              >
                Cancel Request
              </Button>
            )}

            {request.status === 1 && (
              <Button
                type="primary"
                size="large"
                onClick={() => navigate('/learner/dashboard')}
              >
                Go to Dashboard
              </Button>
            )}

            {request.status === 2 && (
              <Button
                type="primary"
                size="large"
                onClick={() => navigate('/learner/become-teacher')}
              >
                Submit New Request
              </Button>
            )}
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default MyTeacherRequest;