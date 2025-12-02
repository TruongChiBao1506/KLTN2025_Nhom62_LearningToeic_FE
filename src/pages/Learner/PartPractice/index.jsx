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
import { 
  PlayCircleOutlined, 
  FileTextOutlined,
  UserOutlined,
  BookOutlined,
  ReadOutlined
} from "@ant-design/icons";
import testService from "../../../services/testService";
import lessonService from "../../../services/lessonService";
import useAchievementNotifications from "../../../hooks/useAchievementNotifications";
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
  const [activeTab, setActiveTab] = useState("tests");
  const { recordActivity } = useAchievementNotifications();

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
    
    // Ghi nhận bắt đầu học bài học cho streak với notification
    try {
      const learnerToken = localStorage.getItem("learnerToken");
      if (learnerToken) {
        const decoded = JSON.parse(atob(learnerToken.split('.')[1]));
        const userId = decoded.id;
        
        // Ghi nhận bắt đầu học (có thể tính là một dạng hoạt động học tập)
        recordActivity(userId, 'start_lesson', { 
          lessonId, 
          sectionId 
        }).catch(streakError => {
          console.warn("⚠️ Không thể ghi nhận streak bắt đầu bài học:", streakError);
        });
      }
    } catch (error) {
      console.warn("⚠️ Lỗi khi ghi nhận bắt đầu bài học:", error);
    }
    
    navigate(`/learner/section/${sectionId}/lesson/${lessonId}`);
  };

  const handleStartTest = (testId) => {
    // Ghi nhận bắt đầu làm bài test cho streak với notification
    try {
      const learnerToken = localStorage.getItem("learnerToken");
      if (learnerToken) {
        const decoded = JSON.parse(atob(learnerToken.split('.')[1]));
        const userId = decoded.id;
        
        // Ghi nhận bắt đầu làm bài test
        recordActivity(userId, 'start_test', { 
          testId, 
          sectionId 
        }).catch(streakError => {
          console.warn("⚠️ Không thể ghi nhận streak bắt đầu bài test:", streakError);
        });
      }
    } catch (error) {
      console.warn("⚠️ Lỗi khi ghi nhận bắt đầu bài test:", error);
    }
    
    navigate(`/learner/section/${sectionId}/study/${testId}`);
  };

  const renderLessonCard = (lesson) => (
    <Col xs={24} sm={12} lg={8} xl={6} key={lesson.lessonId || lesson._id}>
      <Card
        hoverable
        style={{
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
          height: "280px",
          transition: "all 0.3s ease"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.12)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.06)";
        }}
        bodyStyle={{ 
          padding: "20px", 
          height: "100%",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background: "var(--color-brand-purple)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <ReadOutlined style={{ color: "var(--color-bg-primary)", fontSize: "18px" }} />
          </div>
          <Tag color="blue" style={{ borderRadius: "8px", fontSize: "12px" }}>
            Bài học
          </Tag>
        </div>
        
        {/* Content */}
        <Title level={5} style={{ margin: "0 0 8px 0", fontSize: "16px", lineHeight: "1.4" }}>
          {lesson.lessonName || lesson.name}
        </Title>
        
        <Paragraph style={{ 
          margin: "0 0 16px 0", 
          color: "#64748b", 
          fontSize: "12px",
          lineHeight: "1.5",
          flex: 1,
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical"
        }}>
          {lesson.description || "Bài học giúp bạn nắm vững kiến thức cơ bản"}
        </Paragraph>
        
        {/* Footer */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          paddingTop: "16px",
          borderTop: "1px solid #f1f5f9"
        }}>
          <span style={{ color: "#64748b", fontSize: "12px" }}>
            <BookOutlined style={{ marginRight: "4px" }} />
            {lesson.duration || "30"} phút
          </span>
          
          <Button
            type="primary"
            size="small"
            onClick={() => handleStartLesson(lesson.lessonId || lesson._id)}
            style={{ borderRadius: "8px" }}
          >
            Học ngay
          </Button>
        </div>
      </Card>
    </Col>
  );

  const renderTestCard = (test) => (
    <Col xs={24} sm={12} lg={8} xl={6} key={test.testId || test._id}>
      <Card
        hoverable
        style={{
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
          height: "280px",
          transition: "all 0.3s ease"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.12)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.06)";
        }}
        bodyStyle={{ 
          padding: "20px", 
          height: "100%",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background: "#10b981",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <PlayCircleOutlined style={{ color: "var(--color-bg-primary)", fontSize: "18px" }} />
          </div>
          <Tag color="green" style={{ borderRadius: "8px", fontSize: "12px" }}>
            Bài kiểm tra
          </Tag>
        </div>
        
        {/* Content */}
        <Title level={5} style={{ margin: "0 0 8px 0", fontSize: "16px", lineHeight: "1.4" }}>
          {test.testName || test.name}
        </Title>
        
        <Paragraph style={{ 
          margin: "0 0 16px 0", 
          color: "#64748b", 
          fontSize: "12px",
          lineHeight: "1.5",
          flex: 1,
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical"
        }}>
          {test.description || "Kiểm tra kiến thức và kỹ năng của bạn"}
        </Paragraph>
        
        {/* Stats */}
        <div style={{ 
          display: "flex", 
          gap: "12px", 
          marginBottom: "16px",
          padding: "8px 12px",
          background: "#f0fdf4",
          borderRadius: "8px",
          border: "1px solid #d1fae5"
        }}>
          <span style={{ color: "#059669", fontSize: "12px" }}>
            <FileTextOutlined style={{ marginRight: "4px" }} />
            {test.questionCount || 20} câu
          </span>
          <span style={{ color: "#f59e0b", fontSize: "12px" }}>
            <UserOutlined style={{ marginRight: "4px" }} />
            {test.testParticipants || 0} lượt
          </span>
        </div>
        
        {/* Footer */}
        <Button
          type="primary"
          onClick={() => handleStartTest(test.testId || test._id)}
          block
          style={{ borderRadius: "8px", background: "#10b981", borderColor: "#10b981" }}
        >
          <PlayCircleOutlined /> Làm bài
        </Button>
      </Card>
    </Col>
  );

  if (loading) {
    return (
      <div style={{ 
        minHeight: "100vh",
        background: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px"
      }}>
        <div style={{
          textAlign: "center",
          background: "var(--color-bg-primary)",
          borderRadius: "24px",
          padding: "48px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
          border: "1px solid #e2e8f0",
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
        background: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px"
      }}>
        <div style={{
          textAlign: "center",
          background: "var(--color-bg-primary)",
          borderRadius: "24px",
          padding: "48px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
          border: "1px solid #e2e8f0",
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
      <div style={{ 
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "24px"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Header */}
          <div style={{
            background: "var(--color-bg-primary)",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "24px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
            border: "1px solid #e2e8f0",
            textAlign: "center"
          }}>
            <Title level={1} style={{ 
              margin: "0 0 8px 0",
              color: "var(--color-brand-purple)",
              fontSize: "32px"
            }}>
              {section?.name || "Luyện tập TOEIC"}
            </Title>
            <Paragraph style={{ 
              fontSize: "16px", 
              color: "#64748b", 
              margin: 0,
              maxWidth: "600px",
              marginLeft: "auto",
              marginRight: "auto"
            }}>
              {section?.description || "Nâng cao kỹ năng TOEIC với các bài học và bài kiểm tra được thiết kế chuyên nghiệp"}
            </Paragraph>
          </div>

          {/* Content */}
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            size="large"
            style={{ 
              background: "var(--color-bg-primary)",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
              border: "1px solid #e2e8f0"
            }}
          >
            <TabPane 
              tab={
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <PlayCircleOutlined />
                  Bài kiểm tra ({tests.length})
                </span>
              } 
              key="tests"
            >
              {tests.length > 0 ? (
                <Row gutter={[20, 20]}>
                  {tests.map(renderTestCard)}
                </Row>
              ) : (
                <Empty
                  description="Chưa có bài kiểm tra nào"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ padding: "40px 20px" }}
                />
              )}
            </TabPane>
            <TabPane 
              tab={
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <ReadOutlined />
                  Bài học ({lessons.length})
                </span>
              } 
              key="lessons"
            >
              {lessons.length > 0 ? (
                <Row gutter={[20, 20]}>
                  {lessons.map(renderLessonCard)}
                </Row>
              ) : (
                <Empty
                  description="Chưa có bài học nào"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ padding: "40px 20px" }}
                />
              )}
            </TabPane>
          </Tabs>
        </div>
      </div>
    </SectionAccessGuard>
  );
};

export default PartPractice;
