import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Progress,
  Tag,
  Space,
  Spin,
  Alert,
} from "antd";
import {
  BookOpen,
  ChevronRight,
  Users,
  PlayCircle,
  Target,
  Headphones,
  FileText,
  Award,
  TrendingUp,
  WifiHighIcon
} from "lucide-react";
import SectionService from "../../../services/sectionsService";
import LessonService from "../../../services/lessonService";
import TestService from "../../../services/testService";
// import "./section.css";

const { Title, Text } = Typography;

const Section = () => {
  const { sectionId } = useParams();
  const [sections, setSections] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [tests, setTests] = useState([]);
  const [sectionName, setSectionName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy danh sách tất cả sections đã được kích hoạt
  const retrieveSections = useCallback(async () => {
    try {
      console.log("🚀 ~ Fetching all enabled sections...");
      const response = await SectionService.allEnable();
      console.log("🚀 ~ Sections response:", response);
      setSections(response || []);
    } catch (error) {
      console.error("❌ Error fetching sections:", error);
      setError("Không thể tải danh sách phần thi");
    }
  }, []);

  // Lấy danh sách lessons thuộc section hiện tại
  const retrieveLessons = useCallback(async () => {
    if (!sectionId) return;
    try {
      console.log("🚀 ~ Fetching lessons for sectionId:", sectionId);
      const response = await LessonService.getEnableLessonsBySection(sectionId);
      console.log("🚀 ~ Lessons response:", response);
      setLessons(response?.data || response || []);
    } catch (error) {
      console.error("❌ Error fetching lessons:", error);
      setLessons([]);
    }
  }, [sectionId]);

  // Lấy danh sách tests thuộc section hiện tại
  const retrieveTests = useCallback(async () => {
    if (!sectionId) return;
    try {
      console.log("🚀 ~ Fetching tests for sectionId:", sectionId);
      const response = await TestService.getEnableTestsBySection(sectionId);
      console.log("🚀 ~ Tests response:", response);
      const testsData = response?.data || response || [];
      setTests(testsData);

      if (testsData && testsData.length > 0) {
        setSectionName(testsData[0].section?.name || "");
      } else {
        // Fallback: tìm tên section từ danh sách sections
        const currentSection = sections.find((s) => s._id === sectionId);
        if (currentSection) {
          setSectionName(currentSection.name);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching tests:", error);
      setTests([]);
      // Vẫn cố gắng set tên section từ danh sách sections
      const currentSection = sections.find((s) => s._id === sectionId);
      if (currentSection) {
        setSectionName(currentSection.name);
      }
    } finally {
      setLoading(false);
    }
  }, [sectionId, sections]);

  // Lọc chỉ lấy các section liên quan đến Listening và Reading
  const docngheSections = sections.filter(
    (section) => section.type === 1 || section.type === 2
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!sectionId) return;

      setLoading(true);
      setError(null);

      // Fetch sections first
      await retrieveSections();

      // Then fetch lessons and tests in parallel
      await Promise.all([retrieveLessons(), retrieveTests()]);
    };

    fetchData();
  }, [sectionId, retrieveSections, retrieveLessons, retrieveTests]);

  const getSectionIcon = (type) => {
    if (type === 1)
      return <Headphones style={{ width: "20px", height: "20px" }} />;
    if (type === 2)
      return <FileText style={{ width: "20px", height: "20px" }} />;
    return <Target style={{ width: "20px", height: "20px" }} />;
  };

  const getSectionTypeColor = (type) => {
    if (type === 1) return "blue";
    if (type === 2) return "green";
    return "default";
  };

  const getSectionTypeName = (type) => {
    if (type === 1) return "Listening";
    if (type === 2) return "Reading";
    return "Mixed";
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          padding: "20px",
        }}
      >
        <Alert
          message="Lỗi tải dữ liệu"
          description={error}
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header Section */}
        <Card
          style={{
            borderRadius: "24px",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
            marginBottom: "24px",
          }}
          bodyStyle={{ padding: "32px" }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                borderRadius: "50%",
                width: "80px",
                height: "80px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <Target
                style={{ width: "32px", height: "32px", color: "white" }}
              />
            </div>
            <Title
              level={2}
              style={{
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: "8px",
                fontWeight: "700",
              }}
            >
              LUYỆN THI TOEIC LISTENING READING ONLINE 2025
            </Title>
            {sectionName && (
              <Title
                level={3}
                style={{
                  color: "#1890ff",
                  marginBottom: "16px",
                  fontWeight: "600",
                }}
              >
                {sectionName}
              </Title>
            )}
            <Tag color="blue" style={{ fontSize: "14px", padding: "8px 16px" }}>
              <Award
                style={{ width: "16px", height: "16px", marginRight: "8px" }}
              />
              Học tập chuyên sâu từng phần
            </Tag>
          </div>
        </Card>

        <Row gutter={[24, 24]}>
          {/* Main Content - Lessons and Tests */}
          <Col xs={24} lg={16}>
            {/* Lessons Section */}
            <Card
              title={
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <BookOpen
                    style={{ width: "24px", height: "24px", color: "#1890ff" }}
                  />
                  <Text strong style={{ fontSize: "18px", color: "#1890ff" }}>
                    BÀI HỌC ({lessons.length})
                  </Text>
                </div>
              }
              style={{
                borderRadius: "16px",
                marginBottom: "24px",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
              }}
              bodyStyle={{ padding: "24px" }}
            >
              {lessons.length > 0 ? (
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: "100%" }}
                >
                  {lessons.map((lesson, index) => (
                    <Card
                      key={lesson.lessonId}
                      size="small"
                      hoverable
                      style={{
                        borderRadius: "12px",
                        border: "2px solid #f0f0f0",
                        transition: "all 0.3s ease",
                      }}
                      bodyStyle={{ padding: "16px" }}
                    >
                      <Link
                        to={`/learner/section/${lesson.section?.id}/lesson/${lesson.lessonId}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                            }}
                          >
                            <div
                              style={{
                                background:
                                  "linear-gradient(135deg, #667eea, #764ba2)",
                                borderRadius: "8px",
                                width: "32px",
                                height: "32px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontSize: "14px",
                                fontWeight: "600",
                              }}
                            >
                              {index + 1}
                            </div>
                            <Text strong style={{ fontSize: "16px" }}>
                              {lesson.lessonName}
                            </Text>
                          </div>
                          <ChevronRight
                            style={{
                              width: "20px",
                              height: "20px",
                              color: "#999",
                            }}
                          />
                        </div>
                      </Link>
                    </Card>
                  ))}
                </Space>
              ) : (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <BookOpen
                    style={{
                      width: "48px",
                      height: "48px",
                      color: "#d9d9d9",
                      margin: "0 auto 16px",
                    }}
                  />
                  <Text type="secondary" style={{ fontSize: "16px" }}>
                    Chưa có bài học nào cho phần này
                  </Text>
                </div>
              )}
            </Card>

            {/* Tests Section */}
            <Card
              title={
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <PlayCircle
                    style={{ width: "24px", height: "24px", color: "#52c41a" }}
                  />
                  <Text strong style={{ fontSize: "18px", color: "#52c41a" }}>
                    BÀI KIỂM TRA ({tests.length})
                  </Text>
                </div>
              }
              style={{
                borderRadius: "16px",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
              }}
              bodyStyle={{ padding: "24px" }}
            >
              {tests.length > 0 ? (
                <Row gutter={[16, 16]}>
                  {tests.map((test) => (
                    <Col
                      xs={24}
                      sm={12}
                      md={8}
                      lg={12}
                      xl={8}
                      key={test.testId}
                    >
                      <Card
                        hoverable
                        style={{
                          borderRadius: "16px",
                          border: "2px solid #f0f0f0",
                          height: "100%",
                          transition: "all 0.3s ease",
                        }}
                        bodyStyle={{ padding: "20px" }}
                      >
                        <div style={{ marginBottom: "16px" }}>
                          <Text
                            strong
                            style={{
                              fontSize: "16px",
                              display: "block",
                              marginBottom: "8px",
                            }}
                          >
                            {test.testName}
                          </Text>
                          <Progress
                            percent={20}
                            size="small"
                            strokeColor="#52c41a"
                            style={{ marginBottom: "8px" }}
                          />
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              marginBottom: "4px",
                            }}
                          >
                            <Users
                              style={{
                                width: "16px",
                                height: "16px",
                                color: "#999",
                              }}
                            />
                            <Text type="secondary" style={{ fontSize: "14px" }}>
                              Tham gia: {test.testParticipants}
                            </Text>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <TrendingUp
                              style={{
                                width: "16px",
                                height: "16px",
                                color: "#52c41a",
                              }}
                            />
                            <Text type="secondary" style={{ fontSize: "14px" }}>
                              Tiến độ: 20%
                            </Text>
                          </div>
                        </div>
                        <Link
                          to={`/learner/section/${test.section?.id}/study/${test.testId}`}
                        >
                          <Button
                            type="primary"
                            block
                            size="large"
                            style={{
                              background:
                                "linear-gradient(135deg, #667eea, #764ba2)",
                              borderColor: "transparent",
                              borderRadius: "8px",
                              height: "44px",
                              fontWeight: "600",
                              fontSize: "14px",
                              boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)",
                            }}
                            icon={
                              <PlayCircle
                                style={{ width: "16px", height: "16px" }}
                              />
                            }
                          >
                            Bắt đầu học
                          </Button>
                        </Link>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <WifiHighIcon
                    style={{
                      fontSize: "48px",
                      color: "#d9d9d9",
                      margin: "0 auto 16px",
                      display: "block",
                    }}
                  />
                  <Text type="secondary" style={{ fontSize: "16px" }}>
                    Chưa có bài kiểm tra nào cho phần này
                  </Text>
                </div>
              )}
            </Card>
          </Col>

          {/* Sidebar - Other Sections */}
          <Col xs={24} lg={8}>
            <Card
              title={
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <Target
                    style={{ width: "24px", height: "24px", color: "#fa8c16" }}
                  />
                  <Text strong style={{ fontSize: "18px", color: "#fa8c16" }}>
                    LUYỆN TẬP KHÁC ({docngheSections.length})
                  </Text>
                </div>
              }
              style={{
                borderRadius: "16px",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                position: "sticky",
                top: "20px",
              }}
              bodyStyle={{ padding: "24px" }}
            >
              {docngheSections.length > 0 ? (
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: "100%" }}
                >
                  {docngheSections.map((section) => (
                    <Card
                      key={section._id}
                      size="small"
                      hoverable
                      style={{
                        borderRadius: "12px",
                        border: "2px solid #f0f0f0",
                        transition: "all 0.3s ease",
                      }}
                      bodyStyle={{ padding: "16px" }}
                    >
                      <Link
                        to={`/learner/practice-lr/${section._id}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                            }}
                          >
                            {getSectionIcon(section.type)}
                            <div>
                              <Text
                                strong
                                style={{
                                  fontSize: "14px",
                                  display: "block",
                                  marginBottom: "4px",
                                }}
                              >
                                {section.name}
                              </Text>
                              <Tag
                                color={getSectionTypeColor(section.type)}
                                style={{ fontSize: "11px", margin: 0 }}
                              >
                                {getSectionTypeName(section.type)}
                              </Tag>
                            </div>
                          </div>
                          <ChevronRight
                            style={{
                              width: "16px",
                              height: "16px",
                              color: "#999",
                            }}
                          />
                        </div>
                      </Link>
                    </Card>
                  ))}
                </Space>
              ) : (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <Target
                    style={{
                      width: "32px",
                      height: "32px",
                      color: "#d9d9d9",
                      margin: "0 auto 12px",
                    }}
                  />
                  <Text type="secondary">Chưa có phần luyện tập nào</Text>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Section;
