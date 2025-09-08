import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Spin, 
  Typography, 
  Tag, 
  Tabs,
  Empty
} from "antd";
import "./style.css";
import { 
  PlayCircleOutlined, 
  FileTextOutlined,
  UserOutlined,
  BookOutlined,
  ReadOutlined
} from "@ant-design/icons";
import testService from "../../../services/testService";
import lessonService from "../../../services/lessonService";
import useSectionAccess from "../../../hooks/useSectionAccess";
import SectionAccessGuard from "../../../components/Learner/SectionAccessGuard";

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

const PartPractice = ({ sectionId: propSectionId }) => {
  const { sectionId: paramSectionId } = useParams();
  const navigate = useNavigate();
  
  // Use prop sectionId if provided, otherwise use param
  const sectionId = propSectionId || paramSectionId;
  
  // Use section access hook for checking section status
  const { 
    section, 
    loading: sectionLoading, 
    error: sectionError, 
    isAccessible 
  } = useSectionAccess(sectionId, {
    redirectTo: '/learner/dashboard',
    redirectDelay: 3000,
    showToast: true,
    pollInterval: 30000, // Check every 30 seconds
  });
  
  // States
  const [tests, setTests] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("lessons");

  useEffect(() => {
    const fetchData = async () => {
      // Skip if section is not accessible or still loading
      if (!isAccessible || sectionLoading || !section) {
        return;
      }
      
      try {
        setLoading(true);
        
        // Lấy lessons theo section
        const lessonsResponse = await lessonService.getEnableLessonsBySection(sectionId);
        const lessonsData = lessonsResponse.data || lessonsResponse;
        
        if (Array.isArray(lessonsData)) {
          setLessons(lessonsData);
        } else {
          setLessons(lessonsData?.lessons || lessonsData?.data || []);
        }
        
        // Lấy tests theo section
        const testsResponse = await testService.getEnableTestsBySection(sectionId);
        const testsData = testsResponse.data || testsResponse;
        
        if (Array.isArray(testsData)) {
          setTests(testsData);
        } else {
          setTests(testsData?.tests || testsData?.data || []);
        }
        
      } catch (error) {
        console.error("Error fetching practice data:", error);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        setLessons([]);
        setTests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sectionId, isAccessible, sectionLoading, section]);

  const handleStartLesson = (lessonId) => {
    if (!lessonId) {
      console.error("Lesson ID is undefined!");
      return;
    }
    navigate(`/learner/section/${sectionId}/lesson/${lessonId}`);
  };

  const handleStartTest = (testId) => {
    navigate(`/learner/section/${sectionId}/study/${testId}`);
  };

  const renderLessonCard = (lesson) => (
    <Col xs={24} sm={12} md={8} lg={6} key={lesson.lessonId || lesson._id}>
      <Card
        className="lesson-card"
        hoverable
        style={{
          borderRadius: "20px",
          overflow: "hidden",
          border: "none",
          boxShadow: "0 8px 32px rgba(79, 70, 229, 0.1)",
          height: "100%",
          background: "linear-gradient(145deg, #ffffff 0%, #f8faff 100%)",
          position: "relative"
        }}
        bodyStyle={{ 
          padding: "24px", 
          height: "100%",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {/* Header với icon và badge */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          marginBottom: "16px"
        }}>
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 16px rgba(102, 126, 234, 0.3)"
          }}>
            <ReadOutlined style={{ color: "#fff", fontSize: "20px" }} />
          </div>
          <Tag 
            color="blue" 
            style={{ 
              margin: 0,
              borderRadius: "12px",
              padding: "4px 12px",
              fontSize: "12px",
              fontWeight: "500",
              border: "none",
              background: "linear-gradient(135deg, #e6f7ff 0%, #f0f5ff 100%)",
              color: "#1890ff"
            }}
          >
            Bài học
          </Tag>
        </div>
        
        {/* Title */}
        <Title 
          level={5} 
          style={{ 
            margin: "0 0 12px 0", 
            color: "#1e293b", 
            lineHeight: "1.4",
            fontSize: "16px",
            fontWeight: "600"
          }}
        >
          {lesson.lessonName || lesson.name}
        </Title>
        
        {/* Description */}
        <Paragraph 
          style={{ 
            margin: "0 0 20px 0", 
            color: "#64748b", 
            fontSize: "14px",
            lineHeight: "1.6",
            flex: 1,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden"
          }}
        >
          {lesson.description || "Bài học giúp bạn nắm vững kiến thức cơ bản"}
        </Paragraph>
        
        {/* Footer */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginTop: "auto",
          paddingTop: "16px",
          borderTop: "1px solid #f1f5f9"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <BookOutlined style={{ color: "#6366f1", fontSize: "14px" }} />
            <span style={{ 
              color: "#6366f1", 
              fontSize: "13px", 
              fontWeight: "500" 
            }}>
              {lesson.duration || "30"} phút
            </span>
          </div>
          
          <Button
            type="primary"
            icon={<ReadOutlined />}
            onClick={() => handleStartLesson(lesson.lessonId || lesson._id)}
            style={{
              borderRadius: "12px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              fontWeight: "500",
              height: "36px",
              paddingLeft: "16px",
              paddingRight: "16px",
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)"
            }}
          >
            Học
          </Button>
        </div>
      </Card>
    </Col>
  );

  const renderTestCard = (test) => (
    <Col xs={24} sm={12} md={8} lg={6} key={test.testId || test._id}>
      <Card
        className="test-card"
        hoverable
        style={{
          borderRadius: "20px",
          overflow: "hidden",
          border: "none",
          boxShadow: "0 8px 32px rgba(16, 185, 129, 0.1)",
          height: "100%",
          background: "linear-gradient(145deg, #ffffff 0%, #f0fdf4 100%)",
          position: "relative"
        }}
        bodyStyle={{ 
          padding: "24px", 
          height: "100%",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {/* Header với icon và badge */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          marginBottom: "16px"
        }}>
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 16px rgba(16, 185, 129, 0.3)"
          }}>
            <PlayCircleOutlined style={{ color: "#fff", fontSize: "20px" }} />
          </div>
          <Tag 
            color="green" 
            style={{ 
              margin: 0,
              borderRadius: "12px",
              padding: "4px 12px",
              fontSize: "12px",
              fontWeight: "500",
              border: "none",
              background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
              color: "#059669"
            }}
          >
            Bài test
          </Tag>
        </div>
        
        {/* Title */}
        <Title 
          level={5} 
          style={{ 
            margin: "0 0 12px 0", 
            color: "#1e293b", 
            lineHeight: "1.4",
            fontSize: "16px",
            fontWeight: "600"
          }}
        >
          {test.testName || test.name}
        </Title>
        
        {/* Description */}
        <Paragraph 
          style={{ 
            margin: "0 0 20px 0", 
            color: "#64748b", 
            fontSize: "14px",
            lineHeight: "1.6",
            flex: 1,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden"
          }}
        >
          {test.description || "Kiểm tra kiến thức và kỹ năng của bạn"}
        </Paragraph>
        
        {/* Stats */}
        <div style={{ 
          display: "flex", 
          gap: "12px", 
          marginBottom: "20px",
          padding: "12px",
          background: "rgba(16, 185, 129, 0.05)",
          borderRadius: "12px"
        }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "4px",
            flex: 1
          }}>
            <FileTextOutlined style={{ color: "#059669", fontSize: "14px" }} />
            <span style={{ 
              color: "#059669", 
              fontSize: "13px", 
              fontWeight: "500" 
            }}>
              {test.questionCount || 20} câu
            </span>
          </div>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "4px",
            flex: 1
          }}>
            <UserOutlined style={{ color: "#f59e0b", fontSize: "14px" }} />
            <span style={{ 
              color: "#f59e0b", 
              fontSize: "13px", 
              fontWeight: "500" 
            }}>
              {test.testParticipants || 0} lượt
            </span>
          </div>
        </div>
        
        {/* Footer */}
        <div style={{ 
          marginTop: "auto",
          paddingTop: "16px",
          borderTop: "1px solid #f1f5f9"
        }}>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={() => handleStartTest(test.testId || test._id)}
            block
            style={{
              borderRadius: "12px",
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              border: "none",
              fontWeight: "500",
              height: "40px",
              fontSize: "14px",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)"
            }}
          >
            Làm bài
          </Button>
        </div>
      </Card>
    </Col>
  );

  if (loading) {
    return (
      <div style={{ 
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px"
      }}>
        <div style={{
          textAlign: "center",
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "24px",
          padding: "48px",
          boxShadow: "0 16px 64px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          minWidth: "320px"
        }}>
          <Spin size="large" />
          <div style={{ 
            marginTop: "24px",
            fontSize: "18px",
            fontWeight: "600",
            color: "#1e293b"
          }}>
            Đang tải dữ liệu...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px"
      }}>
        <div style={{
          textAlign: "center",
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "24px",
          padding: "48px",
          boxShadow: "0 16px 64px rgba(0, 0, 0, 0.1)",
          maxWidth: "500px"
        }}>
          <div style={{ fontSize: "64px", marginBottom: "24px" }}>😔</div>
          <Title level={3} style={{ color: "#1e293b", marginBottom: "16px" }}>
            Oops! Có lỗi xảy ra
          </Title>
          <Paragraph style={{ color: "#64748b", fontSize: "16px" }}>
            {error}
          </Paragraph>
        </div>
      </div>
    );
  }

  return (
    <SectionAccessGuard
      section={section}
      loading={sectionLoading}
      error={sectionError}
      isAccessible={isAccessible}
    >
      <div className="part-practice-container" style={{ 
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "24px"
      }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "24px",
          padding: "32px",
          marginBottom: "24px",
          boxShadow: "0 16px 64px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)"
        }}>
          <div style={{ textAlign: "center" }}>
            <Title level={1} style={{ 
              margin: 0,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: "clamp(28px, 5vw, 48px)"
            }}>
              {section?.name || "Luyện tập TOEIC"}
            </Title>
            <Paragraph style={{ 
              fontSize: "18px", 
              color: "#64748b", 
              margin: "16px 0 0 0",
              maxWidth: "600px",
              marginLeft: "auto",
              marginRight: "auto"
            }}>
              {section?.description || "Nâng cao kỹ năng TOEIC với các bài học và bài kiểm tra được thiết kế chuyên nghiệp"}
            </Paragraph>
          </div>
        </div>

        {/* Content */}
        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "24px",
          padding: "32px",
          boxShadow: "0 16px 64px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)"
        }}>
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            size="large"
            style={{ 
              marginBottom: "0",
              background: "rgba(248, 250, 252, 0.8)",
              borderRadius: "20px",
              padding: "8px",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(226, 232, 240, 0.5)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.06)"
            }}
            tabBarStyle={{
              marginBottom: "24px",
              border: "none"
            }}
          >
            <TabPane 
              tab={
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <ReadOutlined />
                  Bài học ({lessons.length})
                </span>
              } 
              key="lessons"
            >
              <div style={{ padding: "0 8px" }}>
                {lessons.length > 0 ? (
                  <Row gutter={[24, 24]} style={{ margin: "0 -12px" }}>
                    {lessons.map(renderLessonCard)}
                  </Row>
                ) : (
                  <Empty
                    description={
                      <span style={{ color: "#64748b", fontSize: "16px" }}>
                        Chưa có bài học nào
                      </span>
                    }
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    style={{ padding: "60px 20px" }}
                  />
                )}
              </div>
            </TabPane>
            
            <TabPane 
              tab={
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <PlayCircleOutlined />
                  Bài kiểm tra ({tests.length})
                </span>
              } 
              key="tests"
            >
              <div style={{ padding: "0 8px" }}>
                {tests.length > 0 ? (
                  <Row gutter={[24, 24]} style={{ margin: "0 -12px" }}>
                    {tests.map(renderTestCard)}
                  </Row>
                ) : (
                  <Empty
                    description={
                      <span style={{ color: "#64748b", fontSize: "16px" }}>
                        Chưa có bài kiểm tra nào
                      </span>
                    }
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    style={{ padding: "60px 20px" }}
                  />
                )}
              </div>
            </TabPane>
          </Tabs>
        </div>
      </div>
    </div>
    </SectionAccessGuard>
  );
};

export default PartPractice;
