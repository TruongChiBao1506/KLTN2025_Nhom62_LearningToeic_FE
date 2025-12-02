import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Layout,
  Row,
  Col,
  Button,
  Card,
  Statistic,
  Typography,
  Space,
  Avatar,
  Divider,
  Affix,
  FloatButton
} from 'antd';
import {
  BookOutlined,
  TrophyOutlined,
  TeamOutlined,
  RocketOutlined,
  StarOutlined,
  PlayCircleOutlined,
  UserOutlined,
  MenuOutlined,
  CloseOutlined,
  GlobalOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  BulbOutlined,
  HeartOutlined,
  MessageOutlined,
  LoginOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import './style.css';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const HomePage = () => {
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const learnerToken = localStorage.getItem('learnerToken');
    const adminToken = localStorage.getItem('adminToken');

    if (learnerToken) {
      try {
        const decoded = JSON.parse(atob(learnerToken.split('.')[1]));
        setCurrentUser({ ...decoded, role: 'learner' });
      } catch (error) {
        console.error('Error decoding learner token:', error);
      }
    } else if (adminToken) {
      try {
        const decoded = JSON.parse(atob(adminToken.split('.')[1]));
        setCurrentUser({ ...decoded, role: 'admin' });
      } catch (error) {
        console.error('Error decoding admin token:', error);
      }
    }

    // Set page title
    document.title = 'TOEIC Learning Platform - Học TOEIC Online';
  }, []);

  const handleGetStarted = () => {
    if (currentUser) {
      if (currentUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/learner/dashboard');
      }
    } else {
      navigate('/auth/signin');
    }
  };

  const features = [
    {
      icon: <BookOutlined />,
      title: 'Bài học đa dạng',
      description: 'Hàng trăm bài học TOEIC từ cơ bản đến nâng cao với nội dung được cập nhật liên tục.'
    },
    {
      icon: <PlayCircleOutlined />,
      title: 'Video hướng dẫn',
      description: 'Video bài giảng chất lượng cao với giáo viên bản ngữ và phương pháp giảng dạy hiện đại.'
    },
    {
      icon: <TrophyOutlined />,
      title: 'Bài tập thực hành',
      description: 'Hệ thống bài tập phong phú với độ khó tăng dần, giúp bạn ôn luyện hiệu quả.'
    },
    {
      icon: <BarChartOutlined />,
      title: 'Theo dõi tiến độ',
      description: 'Báo cáo chi tiết về quá trình học tập, điểm mạnh yếu và đề xuất cải thiện.'
    },
    {
      icon: <TeamOutlined />,
      title: 'Cộng đồng học tập',
      description: 'Kết nối với hàng nghìn học viên TOEIC, chia sẻ kinh nghiệm và động lực học tập.'
    },
    {
      icon: <BulbOutlined />,
      title: 'AI hỗ trợ học tập',
      description: 'Công nghệ AI cá nhân hóa lộ trình học tập phù hợp với trình độ và mục tiêu của bạn.'
    }
  ];

  const testimonials = [
    {
      name: 'Nguyễn Thị Mai',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mai',
      rating: 5,
      content: 'TOEIC Learning Platform đã giúp tôi tăng 200 điểm chỉ trong 2 tháng. Phương pháp giảng dạy rất khoa học và dễ hiểu.',
      achievement: 'TOEIC 850'
    },
    {
      name: 'Trần Văn Minh',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Minh',
      rating: 5,
      content: 'Tôi thích nhất là tính năng theo dõi tiến độ và đề xuất bài học phù hợp. Học TOEIC chưa bao giờ dễ dàng đến thế!',
      achievement: 'TOEIC 780'
    },
    {
      name: 'Lê Thị Hoa',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hoa',
      rating: 5,
      content: 'Cộng đồng học tập rất tích cực, tôi học được nhiều từ các bạn. TOEIC Learning Platform xứng đáng là nền tảng tốt nhất!',
      achievement: 'TOEIC 900'
    }
  ];

  const stats = [
    { value: '50000+', label: 'Học viên', icon: <UserOutlined /> },
    { value: '1000+', label: 'Bài học', icon: <BookOutlined /> },
    { value: '95%', label: 'Đạt mục tiêu', icon: <TrophyOutlined /> },
    { value: '24/7', label: 'Hỗ trợ', icon: <ClockCircleOutlined /> }
  ];

  return (
    <Layout className="homepage-layout">
      {/* Header */}
      <Affix offsetTop={0}>
        <Header className="homepage-header">
          <div className="header-content">
            <div className="logo">
              <Link to="/" className="logo-link">
                <GlobalOutlined className="logo-icon" />
                <span className="logo-text">TOEIC Learning</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="desktop-nav">
              <Space size="large">
                <a href="#features" className="nav-link">Tính năng</a>
                <a href="#about" className="nav-link">Giới thiệu</a>
                <a href="#testimonials" className="nav-link">Đánh giá</a>
                <a href="#contact" className="nav-link">Liên hệ</a>
              </Space>
            </nav>

            {/* Auth Buttons */}
            <div className="auth-buttons">
              {currentUser ? (
                <Space>
                  <Button
                    type="primary"
                    onClick={handleGetStarted}
                    icon={<LoginOutlined />}
                  >
                    Vào học tập
                  </Button>
                  <Avatar
                    src={currentUser.avatar}
                    icon={<UserOutlined />}
                    className="user-avatar"
                  >
                    {currentUser.name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                </Space>
              ) : (
                <Space>
                  <Button
                    type="text"
                    onClick={() => navigate('/auth/signin')}
                    className="login-btn"
                  >
                    Đăng nhập
                  </Button>
                  <Button
                    type="primary"
                    className="signup-btn"
                    onClick={() => navigate('/auth/signup')}
                    icon={<UserAddOutlined />}
                  >
                    Đăng ký
                  </Button>
                </Space>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              type="text"
              className="mobile-menu-btn"
              icon={mobileMenuVisible ? <CloseOutlined /> : <MenuOutlined />}
              onClick={() => setMobileMenuVisible(!mobileMenuVisible)}
            />
          </div>

          {/* Mobile Navigation */}
          {mobileMenuVisible && (
            <div className="mobile-nav">
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <a href="#features" className="nav-link" onClick={() => setMobileMenuVisible(false)}>Tính năng</a>
                <a href="#about" className="nav-link" onClick={() => setMobileMenuVisible(false)}>Giới thiệu</a>
                <a href="#testimonials" className="nav-link" onClick={() => setMobileMenuVisible(false)}>Đánh giá</a>
                <a href="#contact" className="nav-link" onClick={() => setMobileMenuVisible(false)}>Liên hệ</a>
                <Divider />
                {currentUser ? (
                  <Button
                    type="primary"
                    block
                    onClick={() => {
                      handleGetStarted();
                      setMobileMenuVisible(false);
                    }}
                  >
                    Vào học tập
                  </Button>
                ) : (
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button
                      type="text"
                      block
                      onClick={() => {
                        navigate('/auth/signin');
                        setMobileMenuVisible(false);
                      }}
                    >
                      Đăng nhập
                    </Button>
                    <Button
                      type="primary"
                      block
                      onClick={() => {
                        navigate('/auth/signup');
                        setMobileMenuVisible(false);
                      }}
                      style={{color:"#1677ff"}}
                    >
                      Đăng ký
                    </Button>
                  </Space>
                )}
              </Space>
            </div>
          )}
        </Header>
      </Affix>

      {/* Main Content */}
      <Content className="homepage-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <Row gutter={[32, 32]} align="middle">
              <Col xs={24} md={12}>
                <div className="hero-text">
                  <Title level={1} className="hero-title">
                    Học TOEIC Online
                    <br />
                    <span className="highlight">Hiệu Quả & Tiện Lợi</span>
                  </Title>
                  <Paragraph className="hero-description">
                    Nền tảng học TOEIC hàng đầu Việt Nam với phương pháp giảng dạy hiện đại,
                    công nghệ AI cá nhân hóa và cộng đồng học tập tích cực.
                    Đạt mục tiêu TOEIC của bạn chỉ với 2-3 tháng học tập nghiêm túc!
                  </Paragraph>
                  <Space size="large" className="hero-actions">
                    <Button
                      type="primary"
                      size="large"
                      onClick={handleGetStarted}
                      className="cta-button"
                      icon={<RocketOutlined />}
                    >
                      {currentUser ? 'Tiếp tục học tập' : 'Bắt đầu học ngay'}
                    </Button>
                    <Button
                      type="text"
                      size="large"
                      className="demo-button"
                      icon={<PlayCircleOutlined />}
                    >
                      Xem demo
                    </Button>
                  </Space>
                  <div className="hero-stats">
                    <Space size="large">
                      <div className="stat-item">
                        <Text strong className="stat-number">50,000+</Text>
                        <Text className="stat-label">Học viên</Text>
                      </div>
                      <div className="stat-item">
                        <Text strong className="stat-number">95%</Text>
                        <Text className="stat-label">Đạt mục tiêu</Text>
                      </div>
                      <div className="stat-item">
                        <Text strong className="stat-number">4.9/5</Text>
                        <Text className="stat-label">Đánh giá</Text>
                      </div>
                    </Space>
                  </div>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="hero-image">
                  <div className="floating-cards">
                    <Card className="floating-card card-1">
                      <Space>
                        <TrophyOutlined style={{ color: 'var(--color-success)', fontSize: '24px' }} />
                        <div>
                          <Text strong>TOEIC 850</Text>
                          <br />
                          <Text type="secondary">Điểm mục tiêu</Text>
                        </div>
                      </Space>
                    </Card>
                    <Card className="floating-card card-2">
                      <Space>
                        <BookOutlined style={{ color: 'var(--color-primary)', fontSize: '24px' }} />
                        <div>
                          <Text strong>120 bài học</Text>
                          <br />
                          <Text type="secondary">Hoàn thành</Text>
                        </div>
                      </Space>
                    </Card>
                    <Card className="floating-card card-3">
                      <Space>
                        <TeamOutlined style={{ color: 'var(--color-chart-4)', fontSize: '24px' }} />
                        <div>
                          <Text strong>2,500+</Text>
                          <br />
                          <Text type="secondary">Bạn học</Text>
                        </div>
                      </Space>
                    </Card>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="features-section">
          <div className="section-container">
            <div className="section-header text-center">
              <Title level={2} className="section-title">
                Tại sao chọn TOEIC Learning Platform?
              </Title>
              <Paragraph className="section-description">
                Chúng tôi cung cấp giải pháp học TOEIC toàn diện với công nghệ tiên tiến
                và phương pháp giảng dạy được chứng minh hiệu quả.
              </Paragraph>
            </div>

            <Row gutter={[24, 24]}>
              {features.map((feature, index) => (
                <Col xs={24} sm={12} lg={8} key={index}>
                  <Card className="feature-card" hoverable>
                    <div className="feature-icon">
                      {feature.icon}
                    </div>
                    <Title level={4} className="feature-title">
                      {feature.title}
                    </Title>
                    <Paragraph className="feature-description">
                      {feature.description}
                    </Paragraph>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <div className="section-container">
            <Row gutter={[32, 32]}>
              {stats.map((stat, index) => (
                <Col xs={12} md={6} key={index}>
                  <div className="stat-card">
                    <div className="stat-icon">
                      {stat.icon}
                    </div>
                    <Statistic
                      value={stat.value}
                      title={stat.label}
                      valueStyle={{ color: 'var(--color-primary)', fontSize: '2rem', fontWeight: 'bold' }}
                    />
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="testimonials-section">
          <div className="section-container">
            <div className="section-header text-center">
              <Title level={2} className="section-title">
                Học viên nói gì về chúng tôi
              </Title>
              <Paragraph className="section-description">
                Hàng nghìn học viên đã thành công với TOEIC Learning Platform.
                Đây là những chia sẻ từ học viên xuất sắc của chúng tôi.
              </Paragraph>
            </div>

            <Row gutter={[24, 24]}>
              {testimonials.map((testimonial, index) => (
                <Col xs={24} md={8} key={index}>
                  <Card className="testimonial-card">
                    <div className="testimonial-rating">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <StarOutlined key={i} style={{ color: 'var(--color-warning)' }} />
                      ))}
                    </div>
                    <Paragraph className="testimonial-content">
                      "{testimonial.content}"
                    </Paragraph>
                    <div className="testimonial-author">
                      <Avatar src={testimonial.avatar} size="large" />
                      <div className="author-info">
                        <Text strong>{testimonial.name}</Text>
                        <br />
                        <Text type="secondary">{testimonial.achievement}</Text>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="section-container">
            <div className="cta-content">
              <Title level={2} className="cta-title">
                Sẵn sàng chinh phục TOEIC?
              </Title>
              <Paragraph className="cta-description">
                Tham gia cộng đồng 50,000+ học viên đã thành công.
                Bắt đầu hành trình TOEIC của bạn ngay hôm nay!
              </Paragraph>
              <Space size="large">
                <Button
                  type="primary"
                  size="large"
                  onClick={handleGetStarted}
                  className="cta-button"
                  icon={<RocketOutlined />}
                >
                  {currentUser ? 'Tiếp tục học tập' : 'Đăng ký miễn phí'}
                </Button>
                <Button
                  type="text"
                  size="large"
                  className="contact-button"
                  icon={<MessageOutlined />}
                >
                  Liên hệ tư vấn
                </Button>
              </Space>
            </div>
          </div>
        </section>
      </Content>

      {/* Footer */}
      <Footer className="homepage-footer">
        <div className="footer-content">
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <div className="footer-brand">
                <div className="footer-logo">
                  <GlobalOutlined className="logo-icon" />
                  <span className="logo-text">TOEIC Learning</span>
                </div>
                <Paragraph className="footer-description">
                  Nền tảng học TOEIC hàng đầu Việt Nam với công nghệ AI tiên tiến
                  và phương pháp giảng dạy được chứng minh hiệu quả.
                </Paragraph>
                <Space>
                  <Button type="text" icon={<HeartOutlined />} />
                  <Button type="text" icon={<MessageOutlined />} />
                  <Button type="text" icon={<GlobalOutlined />} />
                </Space>
              </div>
            </Col>

            <Col xs={12} sm={8} md={5}>
              <div className="footer-links">
                <Title level={5}>Sản phẩm</Title>
                <ul>
                  <li><a href="#features">Tính năng</a></li>
                  <li><a href="#pricing">Bảng giá</a></li>
                  <li><a href="#demo">Demo</a></li>
                  <li><a href="#support">Hỗ trợ</a></li>
                </ul>
              </div>
            </Col>

            <Col xs={12} sm={8} md={5}>
              <div className="footer-links">
                <Title level={5}>Hỗ trợ</Title>
                <ul>
                  <li><a href="#help">Trợ giúp</a></li>
                  <li><a href="#faq">FAQ</a></li>
                  <li><a href="#community">Cộng đồng</a></li>
                  <li><a href="#status">Tình trạng</a></li>
                </ul>
              </div>
            </Col>

            <Col xs={12} sm={24} md={5}>
              <div className="footer-links footer-contact">
                <Title level={5}>Liên hệ</Title>
                <ul>
                  <li><strong>Email:</strong> support@toeic.vn</li>
                  <li><strong>Phone:</strong> 1900 XXX XXX</li>
                  <li><strong>Address:</strong> TP.HCM, Việt Nam</li>
                </ul>
              </div>
            </Col>
          </Row>

          <Divider />

          <div className="footer-bottom">
            <div className="copyright">
              © 2025 TOEIC Learning Platform. All rights reserved.
            </div>
            <div className="footer-bottom-links">
              <Space>
                <a href="#privacy">Bảo mật</a>
                <a href="#terms">Điều khoản</a>
                <a href="#cookies">Cookie</a>
              </Space>
            </div>
          </div>
        </div>
      </Footer>

      {/* Back to Top */}
      <FloatButton.BackTop />

      {/* Floating Action Button */}
      <FloatButton
        icon={<MessageOutlined />}
        tooltip="Liên hệ hỗ trợ"
        style={{ right: 24, bottom: 100 }}
      />
    </Layout>
  );
};

export default HomePage;