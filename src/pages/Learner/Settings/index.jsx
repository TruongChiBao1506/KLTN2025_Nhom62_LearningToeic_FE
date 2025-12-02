import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Typography, Switch, Select, InputNumber, 
  Slider, Tabs, Button, message, Space, TimePicker 
} from 'antd';
import { 
  SettingOutlined, GlobalOutlined, BookOutlined, 
  SoundOutlined, SaveOutlined, 
  ReloadOutlined, BulbOutlined, SafetyOutlined 
} from '@ant-design/icons';
import moment from 'moment';
import './style.css';

const { Title, Text } = Typography;

const Settings = () => {
  const [settings, setSettings] = useState({
    // General Settings
    language: 'vi',
    theme: 'light',
    notifications: true,
    soundEffects: true,
    fontSize: 'medium',
    animationsEnabled: true,
    
    // Study Settings
    studyReminder: true,
    reminderTime: '19:00',
    dailyGoal: 30,
    weeklyGoal: 200,
    autoplay: false,
    showHints: true,
    
    // Audio Settings
    volume: 70,
    playbackSpeed: 1,
    subtitles: true,
    
    // Privacy Settings
    profileVisibility: 'public',
    showProgress: true,
    allowFriendRequests: true
  });

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('toeicSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = () => {
    try {
      localStorage.setItem('toeicSettings', JSON.stringify(settings));
      message.success('Cài đặt đã được lưu thành công!');
    } catch (error) {
      message.error('Có lỗi xảy ra khi lưu cài đặt');
    }
  };

  const resetSettings = () => {
    const defaultSettings = {
      language: 'vi',
      theme: 'light',
      notifications: true,
      soundEffects: true,
      studyReminder: true,
      reminderTime: '19:00',
      dailyGoal: 30,
      weeklyGoal: 200,
      fontSize: 'medium',
      autoplay: true,
      showHints: true,
      animationsEnabled: true,
      profileVisibility: 'public',
      showProgress: true,
      allowFriendRequests: true,
      volume: 80,
      playbackSpeed: 1,
      subtitles: true
    };
    setSettings(defaultSettings);
    message.info('Cài đặt đã được khôi phục về mặc định');
  };

  // Thêm document title
  useEffect(() => {
    document.title = "Cài Đặt | TOEIC Learning Platform";
  }, []);

  const renderGeneralSettings = () => (
    <Card style={{ marginBottom: 16 }}>
      <Title level={4}>
        <GlobalOutlined style={{ marginRight: 8, color: "var(--color-primary)" }} />
        Cài đặt chung
      </Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ display: "block", marginBottom: 8 }}>
              Ngôn ngữ giao diện:
            </Text>
            <Select
              style={{ width: "100%" }}
              value={settings.language}
              onChange={(value) => updateSetting('language', value)}
            >
              <Select.Option value="vi">Tiếng Việt</Select.Option>
              <Select.Option value="en">English</Select.Option>
            </Select>
          </div>
        </Col>
        
        <Col xs={24} sm={12} md={8}>
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ display: "block", marginBottom: 8 }}>
              Giao diện:
            </Text>
            <Select
              style={{ width: "100%" }}
              value={settings.theme}
              onChange={(value) => updateSetting('theme', value)}
            >
              <Select.Option value="light">Sáng</Select.Option>
              <Select.Option value="dark">Tối</Select.Option>
              <Select.Option value="auto">Tự động</Select.Option>
            </Select>
          </div>
        </Col>
        
        <Col xs={24} sm={12} md={8}>
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ display: "block", marginBottom: 8 }}>
              Cỡ chữ:
            </Text>
            <Select
              style={{ width: "100%" }}
              value={settings.fontSize}
              onChange={(value) => updateSetting('fontSize', value)}
            >
              <Select.Option value="small">Nhỏ</Select.Option>
              <Select.Option value="medium">Vừa</Select.Option>
              <Select.Option value="large">Lớn</Select.Option>
            </Select>
          </div>
        </Col>
        
        <Col xs={24} sm={12}>
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ marginRight: 12 }}>
              Bật thông báo:
            </Text>
            <Switch
              checked={settings.notifications}
              onChange={(checked) => updateSetting('notifications', checked)}
            />
          </div>
        </Col>
        
        <Col xs={24} sm={12}>
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ marginRight: 12 }}>
              Hiệu ứng âm thanh:
            </Text>
            <Switch
              checked={settings.soundEffects}
              onChange={(checked) => updateSetting('soundEffects', checked)}
            />
          </div>
        </Col>
        
        <Col xs={24} sm={12}>
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ marginRight: 12 }}>
              Hiệu ứng chuyển động:
            </Text>
            <Switch
              checked={settings.animationsEnabled}
              onChange={(checked) => updateSetting('animationsEnabled', checked)}
            />
          </div>
        </Col>
      </Row>
    </Card>
  );

  const renderStudySettings = () => (
    <Card style={{ marginBottom: 16 }}>
      <Title level={4}>
        <BookOutlined style={{ marginRight: 8, color: "var(--color-success)" }} />
        Cài đặt học tập
      </Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ marginRight: 12 }}>
              Nhắc nhở học tập hàng ngày:
            </Text>
            <Switch
              checked={settings.studyReminder}
              onChange={(checked) => updateSetting('studyReminder', checked)}
            />
          </div>
        </Col>
        
        <Col xs={24} sm={12} md={8}>
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ display: "block", marginBottom: 8 }}>
              Thời gian nhắc nhở:
            </Text>
            <TimePicker
              style={{ width: "100%" }}
              format="HH:mm"
              value={settings.reminderTime ? moment(settings.reminderTime, 'HH:mm') : null}
              onChange={(time) => updateSetting('reminderTime', time ? time.format('HH:mm') : '')}
              disabled={!settings.studyReminder}
              placeholder="Chọn thời gian"
            />
          </div>
        </Col>
        
        <Col xs={24} sm={12} md={8}>
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ display: "block", marginBottom: 8 }}>
              Mục tiêu hàng ngày (phút):
            </Text>
            <InputNumber
              min={5}
              max={300}
              value={settings.dailyGoal}
              onChange={(value) => updateSetting('dailyGoal', value)}
              style={{ width: "100%" }}
            />
          </div>
        </Col>
        
        <Col xs={24} sm={12} md={8}>
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ display: "block", marginBottom: 8 }}>
              Mục tiêu hàng tuần (phút):
            </Text>
            <InputNumber
              min={30}
              max={2000}
              value={settings.weeklyGoal}
              onChange={(value) => updateSetting('weeklyGoal', value)}
              style={{ width: "100%" }}
            />
          </div>
        </Col>
        
        <Col xs={24} sm={12}>
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ marginRight: 12 }}>
              Tự động phát bài tiếp theo:
            </Text>
            <Switch
              checked={settings.autoplay}
              onChange={(checked) => updateSetting('autoplay', checked)}
            />
          </div>
        </Col>
        
        <Col xs={24} sm={12}>
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ marginRight: 12 }}>
              Hiển thị gợi ý trong bài tập:
            </Text>
            <Switch
              checked={settings.showHints}
              onChange={(checked) => updateSetting('showHints', checked)}
            />
          </div>
        </Col>
      </Row>
    </Card>
  );

  const renderAudioSettings = () => (
    <Card style={{ marginBottom: 16 }}>
      <Title level={4}>
        <SoundOutlined style={{ marginRight: 8, color: "var(--color-chart-6)" }} />
        Cài đặt âm thanh
      </Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ display: "block", marginBottom: 8 }}>
              Âm lượng: {settings.volume}%
            </Text>
            <Slider
              min={0}
              max={100}
              value={settings.volume}
              onChange={(value) => updateSetting('volume', value)}
            />
          </div>
        </Col>
        
        <Col xs={24} sm={12}>
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ display: "block", marginBottom: 8 }}>
              Tốc độ phát mặc định:
            </Text>
            <Select
              style={{ width: "100%" }}
              value={settings.playbackSpeed}
              onChange={(value) => updateSetting('playbackSpeed', value)}
            >
              <Select.Option value={0.5}>0.5x</Select.Option>
              <Select.Option value={0.75}>0.75x</Select.Option>
              <Select.Option value={1}>1x (Bình thường)</Select.Option>
              <Select.Option value={1.25}>1.25x</Select.Option>
              <Select.Option value={1.5}>1.5x</Select.Option>
            </Select>
          </div>
        </Col>
        
        <Col xs={24} sm={12}>
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ marginRight: 12 }}>
              Hiển thị phụ đề mặc định:
            </Text>
            <Switch
              checked={settings.subtitles}
              onChange={(checked) => updateSetting('subtitles', checked)}
            />
          </div>
        </Col>
      </Row>
    </Card>
  );

  const renderPrivacySettings = () => (
    <Card style={{ marginBottom: 16 }}>
      <Title level={4}>
        <SafetyOutlined style={{ marginRight: 8, color: "var(--color-chart-4)" }} />
        Cài đặt riêng tư
      </Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ display: "block", marginBottom: 8 }}>
              Hiển thị hồ sơ:
            </Text>
            <Select
              style={{ width: "100%" }}
              value={settings.profileVisibility}
              onChange={(value) => updateSetting('profileVisibility', value)}
            >
              <Select.Option value="public">Công khai</Select.Option>
              <Select.Option value="friends">Chỉ bạn bè</Select.Option>
              <Select.Option value="private">Riêng tư</Select.Option>
            </Select>
          </div>
        </Col>
        
        <Col xs={24} sm={12}>
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ marginRight: 12 }}>
              Hiển thị tiến độ học tập:
            </Text>
            <Switch
              checked={settings.showProgress}
              onChange={(checked) => updateSetting('showProgress', checked)}
            />
          </div>
        </Col>
        
        <Col xs={24} sm={12}>
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ marginRight: 12 }}>
              Cho phép lời mời kết bạn:
            </Text>
            <Switch
              checked={settings.allowFriendRequests}
              onChange={(checked) => updateSetting('allowFriendRequests', checked)}
            />
          </div>
        </Col>
      </Row>
    </Card>
  );

  return (
    <div className="settings-container" style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{
          background: 'linear-gradient(45deg, #1890ff, #52c41a)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center',
          margin: 0
        }}>
          <SettingOutlined style={{ marginRight: 12, color: 'var(--color-primary)' }} />
          Cài đặt
        </Title>
        <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 8 }}>
          Tùy chỉnh trải nghiệm học tập theo sở thích cá nhân của bạn
        </Text>
      </div>

      <Tabs
        defaultActiveKey="general"
        centered
        size="large"
        items={[
          {
            key: 'general',
            label: (
              <span>
                <GlobalOutlined />
                Chung
              </span>
            ),
            children: renderGeneralSettings(),
          },
          {
            key: 'study',
            label: (
              <span>
                <BookOutlined />
                Học tập
              </span>
            ),
            children: renderStudySettings(),
          },
          {
            key: 'audio',
            label: (
              <span>
                <SoundOutlined />
                Âm thanh
              </span>
            ),
            children: renderAudioSettings(),
          },
          {
            key: 'privacy',
            label: (
              <span>
                <SafetyOutlined />
                Riêng tư
              </span>
            ),
            children: renderPrivacySettings(),
          },
        ]}
      />

      <Row justify="center" style={{ marginTop: 24 }}>
        <Space size="middle">
          <Button
            icon={<ReloadOutlined />}
            onClick={resetSettings}
            size="large"
          >
            Khôi phục mặc định
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={saveSettings}
            size="large"
          >
            Lưu cài đặt
          </Button>
        </Space>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 32 }}>
        <Col xs={24} md={12}>
          <Card>
            <Title level={4}>
              <BulbOutlined style={{ marginRight: 8, color: 'var(--color-warning)' }} />
              Mẹo
            </Title>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              <li style={{ marginBottom: 8 }}>Bật nhắc nhở để duy trì thói quen học tập</li>
              <li style={{ marginBottom: 8 }}>Điều chỉnh âm lượng phù hợp với môi trường học</li>
              <li style={{ marginBottom: 8 }}>Thay đổi cỡ chữ để đọc dễ dàng hơn</li>
              <li>Tắt hiệu ứng nếu thiết bị chạy chậm</li>
            </ul>
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card>
            <Title level={4}>
              <SafetyOutlined style={{ marginRight: 8, color: 'var(--color-success)' }} />
              Bảo mật
            </Title>
            <Text>
              Tất cả cài đặt được lưu trữ cục bộ trên thiết bị của bạn. 
              Chúng tôi không thu thập hay chia sẻ thông tin cá nhân.
            </Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Settings;
