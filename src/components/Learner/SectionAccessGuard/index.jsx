import React from 'react';
import { Result, Button, Spin, Alert } from 'antd';
import { ExclamationCircleOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const SectionAccessGuard = ({ 
  children, 
  section, 
  loading, 
  error, 
  isAccessible,
  customErrorComponent = null 
}) => {
  const navigate = useNavigate();

  // Loading state
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <Spin size="large" tip="Đang kiểm tra quyền truy cập..." />
      </div>
    );
  }

  // Error or not accessible
  if (!isAccessible || error) {
    if (customErrorComponent) {
      return customErrorComponent;
    }

    return (
      <div style={{ padding: '50px 0' }}>
        <Result
          icon={<ExclamationCircleOutlined style={{ color: 'var(--color-warning)' }} />}
          title="Phần học không khả dụng"
          subTitle={error || 'Phần học này hiện đang bị tạm ngưng hoặc không tồn tại.'}
          extra={[
            <Button 
              type="primary" 
              icon={<HomeOutlined />}
              key="home"
              onClick={() => navigate('/learner/dashboard')}
            >
              Về trang chủ
            </Button>,
            <Button 
              key="back"
              onClick={() => navigate(-1)}
            >
              Quay lại
            </Button>
          ]}
        />
        
        {section && (
          <div style={{ maxWidth: '600px', margin: '20px auto', padding: '0 24px' }}>
            <Alert
              message="Thông tin phần học"
              description={
                <div>
                  <p><strong>Tên:</strong> {section.name}</p>
                  <p><strong>Mô tả:</strong> {section.description}</p>
                  <p><strong>Trạng thái:</strong> 
                    <span style={{ color: 'var(--color-danger)', marginLeft: '8px' }}>
                      Tạm ngưng
                    </span>
                  </p>
                </div>
              }
              type="warning"
              showIcon
            />
          </div>
        )}
      </div>
    );
  }

  // Accessible - render children
  return children;
};

export default SectionAccessGuard;
