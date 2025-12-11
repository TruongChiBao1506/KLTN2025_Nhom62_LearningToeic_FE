import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Upload,
  Typography,
  message,
  Space,
  Alert,
  Row,
  Col,
  Divider,
  Steps,
  Result
} from 'antd';
import {
  UploadOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import teacherRequestService from '../../../services/teacherRequestService';
import './style.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const BecomeTeacher = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [experienceCount, setExperienceCount] = useState(0);
  const [reasonCount, setReasonCount] = useState(0);
  const [requestData, setRequestData] = useState(null);
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Become a Teacher | TOEIC Learning";
    checkExistingRequest();
    checkUserRole();
  }, []);

  const checkUserRole = () => {
    const role = localStorage.getItem('role');
    setUserRole(role);
  };

  const checkExistingRequest = async () => {
    try {
      const data = await teacherRequestService.getMyRequest();

      if (data.success && data.data) {
        setRequestData(data.data);
      }
    } catch (error) {
      console.error('Error checking request:', error);
      // Don't block form if check fails
    }
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    // Trigger validation for certificates field
    form.validateFields(['certificates']).catch(() => { });
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';

    if (!isImage && !isPDF) {
      message.error('You can only upload image or PDF files!');
      return Upload.LIST_IGNORE;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('File must be smaller than 5MB!');
      return Upload.LIST_IGNORE;
    }

    return false; // Prevent auto upload
  };

  const onFinish = async (values) => {
    // Validation
    if (experienceCount < 50) {
      message.error('Experience must be at least 50 characters');
      return;
    }
    if (reasonCount < 50) {
      message.error('Reason must be at least 50 characters');
      return;
    }
    if (reasonCount > 500) {
      message.error('Reason must not exceed 500 characters');
      return;
    }
    if (fileList.length === 0) {
      message.error('Please upload at least one certificate or CV');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('fullName', values.fullName);
      formData.append('email', values.email);
      formData.append('phoneNumber', values.phoneNumber);
      formData.append('experience', values.experience);
      formData.append('reason', values.reason);

      // Add certificates
      fileList.forEach((file) => {
        const fileToUpload = file.originFileObj || file;
        if (fileToUpload instanceof File) {
          formData.append('cv', fileToUpload);
        }
      });

      const data = await teacherRequestService.submitRequest(formData);

      if (data.success) {
        message.success('Your teacher request has been submitted successfully!');
        setRequestData(data.data);
        setTimeout(() => {
          navigate('/learner/my-teacher-request');
        }, 2000);
      } else {
        message.error(data.message || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Submit error:', error);
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const errorMessages = errorData.errors.map(err => err.msg).join(', ');
          message.error(`Validation error: ${errorMessages}`);
        } else {
          message.error(errorData.message || 'Invalid input data');
        }
      } else if (error.response?.status === 401) {
        message.error('Session expired. Please login again.');
        navigate('/auth/login');
      } else {
        message.error('Failed to submit request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // If user is already Teacher or Admin
  if (userRole === 'ROLE_TEACHER' || userRole === 'ROLE_ADMIN') {
    return (
      <div className="become-teacher-container">
        <Card>
          <Result
            status="info"
            title="You are already a Teacher/Admin"
            subTitle="You already have teaching privileges."
            extra={
              <Button type="primary" onClick={() => navigate('/learner/dashboard')}>
                Về trang dashboard
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  // If user has a request - check status
  if (requestData) {
    // Status 0 = Pending
    if (requestData.status === 0) {
      return (
        <div className="become-teacher-container">
          <Card>
            <Result
              status="info"
              icon={<ClockCircleOutlined style={{ color: 'var(--color-warning)' }} />}
              title="You already have a pending request"
              subTitle="Please wait for admin approval or check your request status."
              extra={
                <Button type="primary" onClick={() => navigate('/learner/my-teacher-request')}>
                  View My Request
                </Button>
              }
            />
          </Card>
        </div>
      );
    }

    // Status 1 = Approved
    if (requestData.status === 1) {
      return (
        <div className="become-teacher-container">
          <Card>
            <Result
              status="success"
              title="Your teacher request has been approved!"
              subTitle="Congratulations! You can now create content and help students learn."
              extra={[
                <Button type="primary"
                  key="dashboard"
                  onClick={() => navigate('/learner/dashboard')}
                  style={{
                    borderRadius: "8px",
                    background: "var(--color-primary)",
                    borderColor: "var(--color-primary)",
                    color: "#fff"
                  }}>
                  Về trang dashboard
                </Button>,
                <Button key="view" onClick={() => navigate('/learner/my-teacher-request')}>
                  Xem chi tiết yêu cầu
                </Button>
              ]}
            />
          </Card>
        </div>
      );
    }

    // Status 2 = Rejected
    if (requestData.status === 2) {
      return (
        <div className="become-teacher-container">
          <Card>
            <Result
              status="error"
              title="Your previous request was rejected"
              subTitle={
                <div>
                  <p>Unfortunately, your teacher request was not approved.</p>
                  {requestData.rejectionReason && (
                    <Alert
                      type="warning"
                      message="Rejection Reason"
                      description={requestData.rejectionReason}
                      style={{ marginTop: 16, textAlign: 'left' }}
                    />
                  )}
                </div>
              }
              extra={[
                <Button type="primary" key="new" onClick={() => navigate('/learner/my-teacher-request')}>
                  View Details & Submit New Request
                </Button>,
                <Button key="back" onClick={() => navigate('/learner/dashboard')}>
                  Back to Dashboard
                </Button>
              ]}
            />
          </Card>
        </div>
      );
    }
  }

  return (
    <div className="become-teacher-container">
      <Card className="become-teacher-card">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header */}
          <div style={{ textAlign: 'center' }}>
            <Title level={2}>
              <CheckCircleOutlined style={{ color: 'var(--color-primary)', marginRight: 8 }} />
              Become a Teacher
            </Title>
            <Paragraph type="secondary">
              Share your knowledge and help others learn TOEIC. Fill out the form below to apply.
            </Paragraph>
          </div>

          {/* Steps */}
          <Steps
            current={0}
            items={[
              {
                title: 'Submit Application',
                icon: <FileTextOutlined />
              },
              {
                title: 'Admin Review',
                icon: <InfoCircleOutlined />
              },
              {
                title: 'Get Approved',
                icon: <CheckCircleOutlined />
              }
            ]}
          />

          <Divider />

          {/* Info Alert */}
          <Alert
            message="Application Requirements"
            description={
              <ul style={{ marginBottom: 0 }}>
                <li>Provide detailed teaching experience (minimum 50 characters)</li>
                <li>Explain why you want to become a teacher (50-500 characters)</li>
                <li><strong>Upload at least one certificate or CV (REQUIRED)</strong></li>
                <li>Provide accurate contact information</li>
              </ul>
            }
            type="info"
            showIcon
          />

          {/* Form */}
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            <Row gutter={16}>
              {/* Full Name */}
              <Col xs={24} md={12}>
                <Form.Item
                  label="Full Name"
                  name="fullName"
                  rules={[
                    { required: true, message: 'Please enter your full name' },
                    { min: 3, message: 'Full name must be at least 3 characters' }
                  ]}
                >
                  <Input size="large" placeholder="Enter your full name" />
                </Form.Item>
              </Col>

              {/* Email */}
              <Col xs={24} md={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Please enter your email' },
                    { type: 'email', message: 'Please enter a valid email' }
                  ]}
                >
                  <Input size="large" placeholder="example@email.com" />
                </Form.Item>
              </Col>
            </Row>

            {/* Phone Number */}
            <Form.Item
              label="Phone Number"
              name="phoneNumber"
              rules={[
                { required: true, message: 'Please enter your phone number' },
                {
                  pattern: /^[0-9]{10,11}$/,
                  message: 'Phone number must be 10-11 digits'
                }
              ]}
            >
              <Input
                size="large"
                placeholder="0912345678"
                maxLength={11}
              />
            </Form.Item>

            {/* Experience */}
            <Form.Item
              label={
                <span>
                  Teaching Experience
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    ({experienceCount}/50 characters minimum)
                  </Text>
                </span>
              }
              name="experience"
              rules={[
                { required: true, message: 'Please describe your teaching experience' },
                { min: 50, message: 'Experience must be at least 50 characters' }
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Describe your teaching experience, qualifications, and expertise in TOEIC..."
                maxLength={1000}
                showCount
                onChange={(e) => setExperienceCount(e.target.value.length)}
              />
            </Form.Item>

            {experienceCount > 0 && experienceCount < 50 && (
              <Alert
                message={`Please write at least ${50 - experienceCount} more characters`}
                type="warning"
                showIcon
                style={{ marginTop: -16, marginBottom: 16 }}
              />
            )}

            {/* Reason */}
            <Form.Item
              label={
                <span>
                  Why do you want to become a teacher?
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    ({reasonCount}/50 minimum, 500 maximum)
                  </Text>
                </span>
              }
              name="reason"
              rules={[
                { required: true, message: 'Please explain why you want to become a teacher' },
                { min: 50, message: 'Reason must be at least 50 characters' },
                { max: 500, message: 'Reason must not exceed 500 characters' }
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Explain your motivation for becoming a teacher and how you plan to help students..."
                maxLength={500}
                showCount
                onChange={(e) => setReasonCount(e.target.value.length)}
              />
            </Form.Item>

            {reasonCount > 0 && reasonCount < 50 && (
              <Alert
                message={`Please write at least ${50 - reasonCount} more characters`}
                type="warning"
                showIcon
                style={{ marginTop: -16, marginBottom: 16 }}
              />
            )}

            {reasonCount >= 500 && (
              <Alert
                message="You have reached the maximum character limit (500)"
                type="info"
                showIcon
                style={{ marginTop: -16, marginBottom: 16 }}
              />
            )}

            {/* Certificates */}
            <Form.Item
              label="Certificates / CV"
              name="certificates"
              rules={[
                {
                  validator: (_, value) => {
                    if (fileList.length === 0) {
                      return Promise.reject(new Error('Please upload at least one certificate or CV'));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
              extra="Upload your teaching certificates, CV, TOEIC scores, or relevant qualifications (Max 5MB per file)"
            >
              <Upload
                fileList={fileList}
                onChange={handleFileChange}
                beforeUpload={beforeUpload}
                multiple
                maxCount={5}
                accept="image/*,.pdf"
              >
                <Button icon={<UploadOutlined />} size="large">
                  Upload Certificates / CV
                </Button>
              </Upload>
            </Form.Item>

            {fileList.length === 0 && (
              <Alert
                message="Certificate or CV is required"
                description="Please upload at least one document (certificate, CV, TOEIC score, etc.)"
                type="warning"
                showIcon
                style={{ marginTop: -16, marginBottom: 16 }}
              />
            )}

            {/* Submit Button */}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                block
                disabled={experienceCount < 50 || reasonCount < 50 || reasonCount > 500 || fileList.length === 0}
              >
                Submit Application
              </Button>
            </Form.Item>

            {/* Help Text */}
            <Alert
              message="Your application will be reviewed by our admin team. You will receive a notification once your application is processed."
              type="info"
              showIcon
            />
          </Form>
        </Space>
      </Card>
    </div>
  );
};

export default BecomeTeacher;