import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, Row, Col, Typography, Tag, Button, Progress } from "antd";
import {
  BookOpen,
  Headphones,
  PenTool,
  Eye,
  Target,
  ChevronRight,
  Clock,
  Users,
  TrendingUp,
} from "lucide-react";
import sectionsService from "../../../services/sectionsService";
// import "./style.css";

const { Title, Text, Paragraph } = Typography;

const SectionList = () => {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await sectionsService.allEnable();
      setSections(response);
    } catch (error) {
      console.error("Lỗi khi tải danh sách phần thi:", error);
    }
  };

  // Get icon for each part
  const getPartIcon = (partNumber) => {
    switch (partNumber) {
      case 1:
        return <Eye className="w-6 h-6" />;
      case 2:
        return <Headphones className="w-6 h-6" />;
      case 3:
        return <Headphones className="w-6 h-6" />;
      case 4:
        return <Headphones className="w-6 h-6" />;
      case 5:
        return <PenTool className="w-6 h-6" />;
      case 6:
        return <BookOpen className="w-6 h-6" />;
      case 7:
        return <BookOpen className="w-6 h-6" />;
      default:
        return <Target className="w-6 h-6" />;
    }
  };

  // Get skill type and color
  const getSkillInfo = (partNumber) => {
    if (partNumber <= 4) {
      return {
        type: "Listening",
        color: "blue",
        bgColor: "rgba(24, 144, 255, 0.1)",
      };
    }
    return {
      type: "Reading",
      color: "green",
      bgColor: "rgba(82, 196, 26, 0.1)",
    };
  };

  // Get part description
  const getPartDescription = (partNumber) => {
    const descriptions = {
      1: "Mô tả tranh ảnh - Nghe và chọn câu mô tả đúng nhất",
      2: "Hỏi đáp - Nghe câu hỏi và chọn câu trả lời phù hợp",
      3: "Đoạn hội thoại - Nghe đoạn hội thoại ngắn và trả lời câu hỏi",
      4: "Bài nói chuyện - Nghe bài phát biểu, thông báo và trả lời câu hỏi",
      5: "Hoàn thành câu - Chọn từ/cụm từ phù hợp để hoàn thành câu",
      6: "Hoàn thành đoạn văn - Điền từ/câu vào chỗ trống trong đoạn văn",
      7: "Đọc hiểu - Đọc đoạn văn và trả lời câu hỏi",
    };
    return descriptions[partNumber] || "Luyện tập kỹ năng TOEIC";
  };

  // Get difficulty level
  const getDifficultyInfo = (partNumber) => {
    const difficulties = {
      1: { level: "Dễ", color: "green", percentage: 25 },
      2: { level: "Trung bình", color: "orange", percentage: 50 },
      3: { level: "Khó", color: "red", percentage: 75 },
      4: { level: "Khó", color: "red", percentage: 75 },
      5: { level: "Trung bình", color: "orange", percentage: 50 },
      6: { level: "Khó", color: "red", percentage: 75 },
      7: { level: "Rất khó", color: "purple", percentage: 90 },
    };
    return (
      difficulties[partNumber] || {
        level: "Trung bình",
        color: "orange",
        percentage: 50,
      }
    );
  };

  // Filter enabled sections
  const enabledSections = sections.filter((section) => section.status === 1);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#2C5F8D",
        padding: "20px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header Section */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              borderRadius: "24px",
              padding: "40px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div
              style={{
                background: "#2C5F8D",
                borderRadius: "50%",
                width: "80px",
                height: "80px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                animation: "pulse 2s infinite",
              }}
            >
              <Target className="w-8 h-8 text-white" />
            </div>
            <Title
              level={1}
              style={{
                background: "#2C5F8D",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: "16px",
                fontWeight: "700",
              }}
            >
              CÁC PHẦN THI TOEIC
            </Title>
            <Paragraph
              style={{
                fontSize: "18px",
                color: "var(--color-text-secondary)",
                marginBottom: "24px",
                maxWidth: "600px",
                margin: "0 auto",
              }}
            >
              Khám phá và luyện tập từng phần thi TOEIC một cách chi tiết. Mỗi
              phần được thiết kế để giúp bạn nắm vững kỹ năng cần thiết.
            </Paragraph>

            <Row gutter={[24, 16]} justify="center">
              <Col>
                <div style={{ textAlign: "center" }}>
                  <Text strong style={{ fontSize: "24px", color: "var(--color-brand-purple)" }}>
                    7
                  </Text>
                  <div style={{ color: "var(--color-text-secondary)" }}>Phần thi</div>
                </div>
              </Col>
              <Col>
                <div style={{ textAlign: "center" }}>
                  <Text strong style={{ fontSize: "24px", color: "var(--color-success)" }}>
                    4
                  </Text>
                  <div style={{ color: "var(--color-text-secondary)" }}>Listening</div>
                </div>
              </Col>
              <Col>
                <div style={{ textAlign: "center" }}>
                  <Text strong style={{ fontSize: "24px", color: "var(--color-chart-6)" }}>
                    3
                  </Text>
                  <div style={{ color: "var(--color-text-secondary)" }}>Reading</div>
                </div>
              </Col>
              <Col>
                <div style={{ textAlign: "center" }}>
                  <Text strong style={{ fontSize: "24px", color: "var(--color-chart-4)" }}>
                    200
                  </Text>
                  <div style={{ color: "var(--color-text-secondary)" }}>Câu hỏi</div>
                </div>
              </Col>
            </Row>
          </div>
        </div>

        {/* Sections Grid */}
        <Row gutter={[24, 24]}>
          {enabledSections.map((section) => {
            // Extract part number from section name
            const partMatch = section.name.match(/Part (\d+)/);
            const partNumber = partMatch ? parseInt(partMatch[1]) : null;
            const skillInfo = getSkillInfo(partNumber);
            const difficultyInfo = getDifficultyInfo(partNumber);

            return (
              <Col xs={24} sm={12} lg={8} key={section._id}>
                <Card
                  hoverable
                  style={{
                    borderRadius: "20px",
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                    height: "100%",
                    transition: "all 0.3s ease",
                    overflow: "hidden",
                  }}
                  bodyStyle={{
                    padding: "24px",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  className="section-card"
                >
                  {/* Card Header */}
                  <div
                    style={{
                      background: skillInfo.bgColor,
                      margin: "-24px -24px 20px -24px",
                      padding: "20px 24px",
                      borderRadius: "20px 20px 0 0",
                    }}
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
                            background: "white",
                            borderRadius: "12px",
                            padding: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color:
                              skillInfo.color === "blue"
                                ? "var(--color-primary)"
                                : "var(--color-success)",
                          }}
                        >
                          {getPartIcon(partNumber)}
                        </div>
                        <div>
                          <Title level={4} style={{ margin: 0, color: "var(--color-text-primary)" }}>
                            {section.name}
                          </Title>
                        </div>
                      </div>
                      <Tag
                        color={skillInfo.color}
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          padding: "4px 12px",
                          borderRadius: "20px",
                        }}
                      >
                        {skillInfo.type}
                      </Tag>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Paragraph
                      style={{
                        color: "var(--color-text-secondary)",
                        fontSize: "12px",
                        lineHeight: "1.6",
                        marginBottom: "20px",
                        flex: 1,
                      }}
                    >
                      {getPartDescription(partNumber)}
                    </Paragraph>

                    {/* Difficulty Level */}
                    <div style={{ marginBottom: "16px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "8px",
                        }}
                      >
                        <Text style={{ fontSize: "12px", fontWeight: "600" }}>
                          Độ khó:
                        </Text>
                        <Text
                          style={{
                            fontSize: "12px",
                            color: difficultyInfo.color,
                          }}
                        >
                          {difficultyInfo.level}
                        </Text>
                      </div>
                      <Progress
                        percent={difficultyInfo.percentage}
                        strokeColor={difficultyInfo.color}
                        size="small"
                        showInfo={false}
                      />
                    </div>

                    {/* Stats */}
                    <div
                      style={{
                        background: "var(--color-bg-secondary)",
                        borderRadius: "12px",
                        padding: "12px",
                        marginBottom: "20px",
                      }}
                    >
                      <Row gutter={16}>
                        <Col span={8} style={{ textAlign: "center" }}>
                          <div style={{ color: "var(--color-text-disabled)", fontSize: "11px" }}>
                            Câu hỏi
                          </div>
                          <div style={{ fontWeight: "600", color: "var(--color-text-primary)" }}>
                            {partNumber === 1
                              ? "6"
                              : partNumber === 2
                              ? "25"
                              : partNumber === 3
                              ? "39"
                              : partNumber === 4
                              ? "30"
                              : partNumber === 5
                              ? "30"
                              : partNumber === 6
                              ? "16"
                              : partNumber === 7
                              ? "54"
                              : "N/A"}
                          </div>
                        </Col>
                        <Col span={8} style={{ textAlign: "center" }}>
                          <div style={{ color: "var(--color-text-disabled)", fontSize: "11px" }}>
                            Thời gian
                          </div>
                          <div style={{ fontWeight: "600", color: "var(--color-text-primary)" }}>
                            {partNumber <= 4 ? "~45p" : "~75p"}
                          </div>
                        </Col>
                        <Col span={8} style={{ textAlign: "center" }}>
                          <div style={{ color: "var(--color-text-disabled)", fontSize: "11px" }}>
                            Điểm
                          </div>
                          <div style={{ fontWeight: "600", color: "var(--color-text-primary)" }}>
                            {partNumber <= 4 ? "5-495" : "5-495"}
                          </div>
                        </Col>
                      </Row>
                    </div>

                    {/* Action Button */}
                    <Link to={`/learner/section/${section._id}`}>
                      <Button
                        type="primary"
                        size="large"
                        block
                        style={{
                          height: "48px",
                          borderRadius: "12px",
                          background:
                            "#2C5F8D",
                          border: "none",
                          fontWeight: "600",
                          fontSize: "12px",
                        }}
                        icon={<ChevronRight className="w-4 h-4" />}
                      >
                        Bắt đầu luyện tập
                      </Button>
                    </Link>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>

        {/* Tips Section */}
        <div
          style={{
            marginTop: "40px",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: "20px",
            padding: "32px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Title
            level={3}
            style={{ textAlign: "center", marginBottom: "24px" }}
          >
            💡 Mẹo luyện tập hiệu quả
          </Title>
          <Row gutter={[24, 16]}>
            <Col xs={24} md={8}>
              <div style={{ textAlign: "center" }}>
                <Clock className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <Text strong style={{ display: "block", marginBottom: "8px" }}>
                  Quản lý thời gian
                </Text>
                <Text style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
                  Luyện tập thường xuyên, mỗi ngày 30-60 phút
                </Text>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div style={{ textAlign: "center" }}>
                <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <Text strong style={{ display: "block", marginBottom: "8px" }}>
                  Theo dõi tiến độ
                </Text>
                <Text style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
                  Đánh giá kết quả và điều chỉnh phương pháp học
                </Text>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div style={{ textAlign: "center" }}>
                <Users className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                <Text strong style={{ display: "block", marginBottom: "8px" }}>
                  Tham gia cộng đồng
                </Text>
                <Text style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
                  Học cùng bạn bè để có động lực học tập
                </Text>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .section-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15) !important;
        }

        .ant-btn:hover {
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};

export default SectionList;
