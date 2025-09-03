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
  Badge,
  Space
} from "antd";
import { 
  PlayCircleOutlined, 
  FileTextOutlined,
  UserOutlined,
  TrophyOutlined,
  BookOutlined
} from "@ant-design/icons";
import testService from "../../../services/testService";
import sectionService from "../../../services/sectionsService";

const { Title, Paragraph } = Typography;

const Practice = ({ sectionId: propSectionId }) => {
  const { sectionId: paramSectionId } = useParams();
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [section, setSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use prop sectionId if provided, otherwise use param
  const sectionId = propSectionId || paramSectionId;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching data for sectionId:", sectionId);
        
        // Lấy thông tin section
        const sectionResponse = await sectionService.get(sectionId);
        console.log("Section response:", sectionResponse);
        const sectionData = sectionResponse.data || sectionResponse;
        setSection(sectionData);
        
        // Lấy các test theo section
        const testsResponse = await testService.getEnableTestsBySection(sectionId);
        console.log("Tests response:", testsResponse);
        const testsData = testsResponse.data || testsResponse;
        
        // Đảm bảo testsData là array
        if (Array.isArray(testsData)) {
          setTests(testsData);
        } else if (testsData && typeof testsData === 'object') {
          // Nếu response là object, có thể data nằm trong một property khác
          setTests(testsData.tests || testsData.data || []);
        } else {
          setTests([]);
        }
        
      } catch (error) {
        console.error("Error fetching practice data:", error);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        setTests([]); // Đảm bảo tests luôn là array
      } finally {
        setLoading(false);
      }
    };

    if (sectionId) {
      fetchData();
    }
  }, [sectionId]);

  const handleStartTest = (testId) => {
    navigate(`/learner/test/${testId}`);
  };

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
          <Spin 
            size="large" 
            style={{
              color: "#667eea"
            }}
          />
          <div style={{ 
            marginTop: "24px",
            fontSize: "18px",
            fontWeight: "600",
            color: "#1e293b"
          }}>
            Đang tải dữ liệu...
          </div>
          <div style={{ 
            marginTop: "8px",
            fontSize: "14px",
            color: "#64748b"
          }}>
            Vui lòng chờ trong giây lát
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
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          maxWidth: "500px"
        }}>
          <div style={{
            fontSize: "64px",
            marginBottom: "24px"
          }}>
            😔
          </div>
          <Title level={3} style={{ color: "#ef4444", marginBottom: "12px" }}>
            Có lỗi xảy ra
          </Title>
          <Paragraph style={{ color: "#64748b", fontSize: "16px", marginBottom: "24px" }}>
            {error}
          </Paragraph>
          <Button 
            type="primary" 
            size="large"
            onClick={() => window.location.reload()}
            style={{
              borderRadius: "12px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              fontWeight: "600",
              height: "48px",
              paddingLeft: "24px",
              paddingRight: "24px"
            }}
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: "24px",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      minHeight: "100vh"
    }}>
      {/* Header Section */}
      {section && (
        <div style={{ 
          marginBottom: "32px",
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)"
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ 
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontSize: "36px",
              fontWeight: "800",
              marginBottom: "16px",
              letterSpacing: "-0.02em"
            }}>
              {section.name}
            </div>
            
            <Paragraph style={{ 
              fontSize: "16px", 
              color: "#64748b",
              maxWidth: "600px",
              margin: "0 auto 24px",
              lineHeight: "1.6"
            }}>
              {section.description}
            </Paragraph>
            
            <Space size="large">
              <Tag 
                color="blue" 
                style={{ 
                  padding: "8px 16px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: "600",
                  border: "none"
                }}
              >
                <BookOutlined style={{ marginRight: "6px" }} />
                {section.type === 1 ? "Listening" : section.type === 2 ? "Reading" : "Speaking & Writing"}
              </Tag>
              
              <Tag 
                color="green" 
                style={{ 
                  padding: "8px 16px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: "600",
                  border: "none"
                }}
              >
                <TrophyOutlined style={{ marginRight: "6px" }} />
                {tests.length} bài test
              </Tag>
            </Space>
          </div>
        </div>
      )}

      {(!tests || tests.length === 0) ? (
        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "16px",
          padding: "48px",
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)"
        }}>
          <div style={{
            fontSize: "48px",
            marginBottom: "16px",
            opacity: "0.5"
          }}>
            📚
          </div>
          <Title level={3} style={{ color: "#64748b", marginBottom: "8px" }}>
            Chưa có bài test nào
          </Title>
          <Paragraph style={{ color: "#94a3b8", fontSize: "16px" }}>
            Hiện tại chưa có bài test nào cho phần này. Vui lòng quay lại sau.
          </Paragraph>
        </div>
      ) : (
        <>
          <div style={{
            marginBottom: "24px",
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "12px",
            padding: "16px 24px",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)"
          }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px"
            }}>
              <div>
                <Title level={4} style={{ margin: 0, color: "#1e293b" }}>
                  Danh sách bài test
                </Title>
                <Paragraph style={{ margin: 0, color: "#64748b" }}>
                  Chọn bài test phù hợp với trình độ của bạn
                </Paragraph>
              </div>
              <Badge count={tests.length} showZero color="#667eea" />
            </div>
          </div>
          
          <Row gutter={[24, 24]}>
            {tests.map((test, index) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={test._id}>
                <Card
                  hoverable
                  style={{
                    borderRadius: "16px",
                    overflow: "hidden",
                    border: "none",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
                    transition: "all 0.3s ease",
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(10px)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-8px)";
                    e.currentTarget.style.boxShadow = "0 16px 48px rgba(0, 0, 0, 0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.08)";
                  }}
                  cover={
                    <div style={{ 
                      height: "200px", 
                      background: `linear-gradient(135deg, ${
                        index % 3 === 0 ? "#667eea, #764ba2" :
                        index % 3 === 1 ? "#f093fb, #f5576c" :
                        "#4facfe, #00f2fe"
                      })`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative"
                    }}>
                      {test.image ? (
                        <img
                          alt={test.testName || test.name}
                          src={`http://localhost:5000${test.image}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover"
                          }}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div style={{ 
                          textAlign: "center",
                          color: "white"
                        }}>
                          <BookOutlined style={{ fontSize: "48px", marginBottom: "8px" }} />
                          <div style={{ fontSize: "16px", fontWeight: "600" }}>
                            Test {index + 1}
                          </div>
                        </div>
                      )}
                      
                      <div style={{
                        position: "absolute",
                        top: "12px",
                        right: "12px",
                        background: "rgba(255, 255, 255, 0.2)",
                        backdropFilter: "blur(10px)",
                        borderRadius: "20px",
                        padding: "4px 12px",
                        color: "white",
                        fontSize: "12px",
                        fontWeight: "600"
                      }}>
                        #{index + 1}
                      </div>
                    </div>
                  }
                  actions={[
                    <Button
                      type="primary"
                      size="large"
                      icon={<PlayCircleOutlined />}
                      onClick={() => handleStartTest(test._id)}
                      style={{
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        border: "none",
                        fontWeight: "600",
                        height: "48px",
                        boxShadow: "0 4px 16px rgba(102, 126, 234, 0.3)"
                      }}
                      block
                    >
                      Bắt đầu luyện tập
                    </Button>
                  ]}
                >
                  <div style={{ padding: "8px 0" }}>
                    <Title 
                      level={5} 
                      style={{ 
                        margin: "0 0 12px 0",
                        color: "#1e293b",
                        fontSize: "16px",
                        fontWeight: "700",
                        lineHeight: "1.4"
                      }}
                    >
                      {test.testName || test.name || "Untitled Test"}
                    </Title>
                    
                    <Paragraph style={{ 
                      color: "#64748b",
                      fontSize: "14px",
                      margin: "0 0 16px 0",
                      lineHeight: "1.5",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden"
                    }}>
                      {test.description || "Bài test luyện tập kỹ năng TOEIC với các câu hỏi được thiết kế chuyên nghiệp"}
                    </Paragraph>
                    
                    <div style={{ marginBottom: "16px" }}>
                      <Row gutter={16}>
                        <Col span={12}>
                          <div style={{
                            textAlign: "center",
                            padding: "12px",
                            background: "rgba(102, 126, 234, 0.1)",
                            borderRadius: "12px"
                          }}>
                            <FileTextOutlined style={{ 
                              fontSize: "20px", 
                              color: "#667eea",
                              marginBottom: "4px"
                            }} />
                            <div style={{
                              fontSize: "18px",
                              fontWeight: "700",
                              color: "#1e293b",
                              lineHeight: "1.2"
                            }}>
                              {test.questionCount || 0}
                            </div>
                            <div style={{
                              fontSize: "12px",
                              color: "#64748b",
                              fontWeight: "500"
                            }}>
                              câu hỏi
                            </div>
                          </div>
                        </Col>
                        <Col span={12}>
                          <div style={{
                            textAlign: "center",
                            padding: "12px",
                            background: "rgba(16, 185, 129, 0.1)",
                            borderRadius: "12px"
                          }}>
                            <UserOutlined style={{ 
                              fontSize: "20px", 
                              color: "#10b981",
                              marginBottom: "4px"
                            }} />
                            <div style={{
                              fontSize: "18px",
                              fontWeight: "700",
                              color: "#1e293b",
                              lineHeight: "1.2"
                            }}>
                              {test.testParticipants || 0}
                            </div>
                            <div style={{
                              fontSize: "12px",
                              color: "#64748b",
                              fontWeight: "500"
                            }}>
                              đã thi
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </div>
                    
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "16px"
                    }}>
                      <Tag 
                        color={
                          test.averageDifficulty === "easy" || test.difficulty === "easy" ? "#10b981" : 
                          test.averageDifficulty === "medium" || test.difficulty === "medium" ? "#f59e0b" : 
                          test.averageDifficulty === "hard" || test.difficulty === "hard" ? "#ef4444" : "#6366f1"
                        }
                        style={{ 
                          borderRadius: "20px",
                          padding: "4px 12px",
                          fontSize: "12px",
                          fontWeight: "600",
                          border: "none"
                        }}
                      >
                        {test.averageDifficulty === "easy" || test.difficulty === "easy" ? "🟢 Dễ" : 
                         test.averageDifficulty === "medium" || test.difficulty === "medium" ? "🟡 Trung bình" : 
                         test.averageDifficulty === "hard" || test.difficulty === "hard" ? "🔴 Khó" : "🔵 Chưa xác định"}
                      </Tag>
                      
                      {test.testStatus === 1 && (
                        <Badge 
                          status="success" 
                          text={
                            <span style={{ 
                              color: "#10b981",
                              fontSize: "12px",
                              fontWeight: "600"
                            }}>
                              Sẵn sàng
                            </span>
                          } 
                        />
                      )}
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}
    </div>
  );
};

export default Practice;
