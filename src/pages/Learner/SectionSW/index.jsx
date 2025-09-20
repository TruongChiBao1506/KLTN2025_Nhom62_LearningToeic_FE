import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Spin,
  Tag,
  Empty,
  Divider,
  Space
} from "antd";
import {
  PlayCircleOutlined,
  BookOutlined,
  FileTextOutlined,
  UserOutlined,
  ReadOutlined,
  ThunderboltOutlined
} from "@ant-design/icons";
import SectionService from "../../../services/sectionsService";
import TestService from "../../../services/testService";
import useSectionAccess from "../../../hooks/useSectionAccess";
import SectionAccessGuard from "../../../components/Learner/SectionAccessGuard";
import "./style.css";

const { Title, Paragraph } = Typography;

const SectionSW = () => {
  const { sectionId } = useParams();
  
  // Use section access hook for checking section status
  const { 
    section, 
    loading: sectionLoading, 
    error: sectionError, 
    isAccessible 
  } = useSectionAccess(sectionId, {
    redirectTo: '/learner/speaking-writing',
    redirectDelay: 3000,
    showToast: true,
    pollInterval: 30000,
  });
  
  const [sections, setSections] = useState([]);
  const [tests, setTests] = useState([]);
  const [sectionName, setSectionName] = useState("");
  const [currentSection, setCurrentSection] = useState(null);

  // Lấy danh sách tất cả sections đã được kích hoạt
  const retrieveSections = useCallback(async () => {
    try {
      const response = await SectionService.allEnable();
      setSections(response);

    } catch (error) {
      console.log(error);
    }
  }, []);

  // Lọc chỉ lấy các section liên quan đến Speaking và Writing
  const noivietSections = sections.filter(
    (section) => section.type === 3 || section.type === 4
  );

  // Lấy danh sách tests thuộc section hiện tại
  const retrieveTests = useCallback(async () => {
    if (!sectionId) return;
    try {
      const response = await TestService.getEnableTestsBySection(sectionId);
      setTests(response);
    } catch (error) {
      console.log(error);
    }
  }, [sectionId]);

  // Lấy thông tin section theo ID
  const retrieveSectionById = useCallback(async () => {
    if (!sectionId) return;
    try {
      const response = await SectionService.get(sectionId);
      setCurrentSection(response);
      setSectionName(response.name);
    } catch (error) {
      console.log("Lỗi khi lấy thông tin section:", error);
    }
  }, [sectionId]);

  useEffect(() => {
    retrieveSections();
    if (sectionId) {
      retrieveTests();
      retrieveSectionById();
    }
  }, [sectionId, retrieveSections, retrieveTests, retrieveSectionById]);

  // Set sectionName từ section hook nếu có
  useEffect(() => {
    if (section?.name && !sectionName) {
      setSectionName(section.name);
    }
  }, [section, sectionName]);

  return (
    <SectionAccessGuard
      section={section}
      loading={sectionLoading}
      error={sectionError}
      isAccessible={isAccessible}
    >
      <div className="section-sw-container">
        <div className="section-sw-wrapper">
          {/* Header */}
          <div className="section-sw-header">
            <Title level={1} className="section-sw-title" style={{color: '#fff'}}>
              Nâng Tầm Kỹ Năng TOEIC Speaking & Writing
            </Title>
            <Paragraph className="section-sw-subtitle">
              {sectionName ? `Luyện tập: ${sectionName}` : 
               section?.name ? `Luyện tập: ${section.name}` : 
               "Nâng cao kỹ năng Speaking và Writing TOEIC"}
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            {/* Main Content - Tests */}
            <Col xs={24} lg={16}>
              <Card
                className="section-sw-card"
                title={
                  <Space>
                    <PlayCircleOutlined style={{ color: "#10b981" }} />
                    <span className="section-sw-card-title">
                      BÀI KIỂM TRA ({tests.length})
                    </span>
                  </Space>
                }
                headStyle={{
                  background: "#f8fafc",
                  borderBottom: "1px solid #e2e8f0",
                  borderRadius: "16px 16px 0 0"
                }}
              >
                {tests.length > 0 ? (
                  <Row gutter={[20, 20]}>
                    {tests.map((test) => (
                      <Col xs={24} sm={12} lg={12} key={test._id}>
                        <Card
                          className="test-card"
                          bodyStyle={{ 
                            padding: "20px", 
                            height: "100%",
                            display: "flex",
                            flexDirection: "column"
                          }}
                        >
                          {/* Header */}
                          <div className="test-card-header">
                            <div className="test-icon-wrapper">
                              <PlayCircleOutlined className="test-icon" />
                            </div>
                            <Tag color="green" className="test-tag">
                              Bài kiểm tra
                            </Tag>
                          </div>
                          
                          {/* Content */}
                          <Title level={5} className="test-title">
                            {test.testName}
                          </Title>
                          
                          {/* Stats */}
                          <div className="test-stats">
                            <span className="test-stat-item">
                              <FileTextOutlined />
                              20 câu
                            </span>
                            <span className="test-stat-item participants">
                              <UserOutlined />
                              {test.testParticipants} lượt
                            </span>
                          </div>
                          
                          {/* Footer */}
                          <div style={{ marginTop: "auto" }}>
                            <Link
                              to={`/learner/section/${sectionId}/study-sw/${test._id}`}
                              style={{ textDecoration: "none" }}
                            >
                              <Button
                                type="primary"
                                block
                                className="test-button"
                              >
                                <PlayCircleOutlined /> Làm bài
                              </Button>
                            </Link>
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Empty
                    description="Chưa có bài kiểm tra nào"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    className="empty-state"
                  />
                )}
              </Card>
            </Col>

            {/* Sidebar - Other Practice */}
            <Col xs={24} lg={8}>
              <Card
                className="section-sw-card"
                title={
                  <Space>
                    <ThunderboltOutlined style={{ color: "#f59e0b" }} />
                    <span className="section-sw-card-title">
                      LUYỆN TẬP KHÁC
                    </span>
                  </Space>
                }
                headStyle={{
                  background: "#f8fafc",
                  borderBottom: "1px solid #e2e8f0",
                  borderRadius: "16px 16px 0 0"
                }}
              >
                {noivietSections.length > 0 ? (
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    {noivietSections.map((section) => (
                      <Card
                        key={section.id}
                        className="sidebar-card"
                        size="small"
                        bodyStyle={{ padding: "16px" }}
                      >
                        <Link
                          to={`/learner/practice-sw/${section.id}`}
                          className="sidebar-link"
                        >
                          <div className="sidebar-item">
                            <div className="sidebar-icon-wrapper">
                              <ReadOutlined className="sidebar-icon" />
                            </div>
                            <div className="sidebar-text">
                              <Paragraph 
                                className="sidebar-title"
                                title={section.name}
                              >
                                {section.name}
                              </Paragraph>
                            </div>
                          </div>
                        </Link>
                      </Card>
                    ))}
                  </Space>
                ) : (
                  <Empty
                    description="Chưa có bài luyện tập nào"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    className="empty-state-small"
                  />
                )}
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </SectionAccessGuard>
  );
};

export default SectionSW;
