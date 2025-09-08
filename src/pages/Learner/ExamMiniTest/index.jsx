import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Spin,
  Alert,
  Tag,
  Avatar,
  Divider,
  Badge,
  Tooltip,
} from "antd";
import {
  Clock,
  Users,
  BookOpen,
  Trophy,
  Star,
  ArrowRight,
  Timer,
  Target,
  Award,
  Play,
  FileText,
  MessageSquare,
  Zap,
} from "lucide-react";
import examService from "../../../services/examService";
import Comment from "../../../components/Learner/Comment";
import "./style.css";

const { Title, Text, Paragraph } = Typography;

const ExamMiniTest = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const retrieveExams = async () => {
      try {
        setLoading(true);
        const response = await examService.getMiniTest();

        setExams(response || []);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách bài thi mini:", error);
        setError("Không thể tải danh sách bài thi mini. Vui lòng thử lại sau!");
      } finally {
        setLoading(false);
      }
    };

    retrieveExams();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          flexDirection: "column",
        }}
      >
        <Spin size="large" />
        <Text style={{ marginTop: 16, fontSize: 16 }}>
          Đang tải danh sách bài thi mini...
        </Text>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "24px" }}>
        <Alert
          message="Lỗi tải dữ liệu"
          description={error}
          type="error"
          showIcon
          style={{ maxWidth: 600, margin: "0 auto" }}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", background: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header Section */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "48px",
          background: "linear-gradient(135deg, #00c6fb 0%, #005bea 100%)",
          padding: "48px 24px",
          borderRadius: "16px",
          boxShadow: "0 8px 24px rgba(0, 198, 251, 0.25)",
        }}
      >
        <Space direction="vertical" size={24}>
          <Title level={1} style={{ color: "#fff", margin: 0 }}>
            <Zap
              size={36}
              style={{ marginRight: "12px", verticalAlign: "middle" }}
            />
            Bài thi TOEIC® Mini
          </Title>
          <Paragraph
            style={{
              color: "rgba(255, 255, 255, 0.85)",
              fontSize: "18px",
              maxWidth: "800px",
              margin: "0 auto",
            }}
          >
            Bài thi mini sẽ giúp bạn làm quen với cấu trúc và nội dung của bài
            thi TOEIC chính thức trong thời gian ngắn hơn. Đây là cách tốt để
            luyện tập kỹ năng và chuẩn bị cho kỳ thi thật.
          </Paragraph>
          <Space>
            <Tag color="#f50" style={{ padding: "4px 12px" }}>
              <FileText
                size={16}
                style={{ verticalAlign: "middle", marginRight: "6px" }}
              />
              50-100 câu hỏi
            </Tag>
            <Tag color="#108ee9" style={{ padding: "4px 12px" }}>
              <Clock
                size={16}
                style={{ verticalAlign: "middle", marginRight: "6px" }}
              />
              Thời gian ngắn: 30-60 phút
            </Tag>
            <Tag color="#87d068" style={{ padding: "4px 12px" }}>
              <Target
                size={16}
                style={{ verticalAlign: "middle", marginRight: "6px" }}
              />
              Luyện tập hiệu quả
            </Tag>
          </Space>
        </Space>
      </div>

      {/* Exam Cards */}
      <div style={{ marginBottom: "48px" }}>
        {exams.length > 0 ? (
          <Row gutter={[24, 24]} justify="start">
            {exams.map((exam) => (
              <Col xs={24} sm={12} md={8} lg={6} key={exam._id}>
                <Card
                  hoverable
                  cover={
                    <div
                      style={{
                        height: "160px",
                        backgroundImage:
                          "url(https://stoeic.com/public/images/course/156/480_320/1719130469_white-and-purple-gradient-modern-artificial-intelligence-presentation-1png.png)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        position: "relative",
                        borderTopLeftRadius: "8px",
                        borderTopRightRadius: "8px",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: "12px",
                          right: "12px",
                          background: "#36cfc9",
                          color: "white",
                          padding: "2px 10px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        MINI TEST
                      </div>
                    </div>
                  }
                  bodyStyle={{ padding: "16px" }}
                  style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <Title
                      level={4}
                      style={{ marginTop: 0, marginBottom: "16px" }}
                    >
                      {exam.examName}
                    </Title>

                    <Space
                      direction="vertical"
                      size={12}
                      style={{ width: "100%" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Text type="secondary">
                          <Users
                            size={14}
                            style={{
                              marginRight: "6px",
                              verticalAlign: "middle",
                            }}
                          />
                          5 người tham gia
                        </Text>
                        <Tag color="cyan">
                          <Clock
                            size={14}
                            style={{
                              marginRight: "4px",
                              verticalAlign: "middle",
                            }}
                          />
                          {exam.examDurationMinutes || "N/A"} phút
                        </Tag>
                      </div>

                      <Space size={16} style={{ marginTop: "6px" }}>
                        <Badge count={3} color="#36cfc9" size="small" />
                        <Text type="secondary">Phần nghe</Text>
                        <Badge count={4} color="#108ee9" size="small" />
                        <Text type="secondary">Phần đọc</Text>
                      </Space>

                      <Divider style={{ margin: "12px 0" }} />

                      <Space align="center">
                        <Avatar
                          size="small"
                          icon={<Award size={12} />}
                          style={{ backgroundColor: "#36cfc9" }}
                        />
                        <Text type="secondary" style={{ fontSize: "13px" }}>
                          Cập nhật{" "}
                          {new Date(
                            exam.updatedAt || new Date()
                          ).toLocaleDateString("vi-VN")}
                        </Text>
                      </Space>
                    </Space>
                  </div>

                  <div style={{ marginTop: "16px" }}>
                    <Link to={`/learner/exams/${exam._id}`}>
                      <Button
                        type="primary"
                        block
                        icon={<Play size={16} />}
                        style={{
                          background:
                            "linear-gradient(90deg, #36cfc9 0%, #22c1c3 100%)",
                          height: "40px",
                          border: "none",
                        }}
                      >
                        Thi ngay
                      </Button>
                    </Link>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Alert
            message="Không có bài thi"
            description="Hiện tại không có bài thi mini nào. Vui lòng quay lại sau."
            type="info"
            showIcon
            style={{ maxWidth: "600px", margin: "0 auto" }}
          />
        )}
      </div>

      {/* Comment Section */}
      <div
        style={{
          background: "white",
          padding: "32px",
          borderRadius: "16px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
        }}
      >
        <Title level={2} style={{ textAlign: "center", marginBottom: "32px" }}>
          <MessageSquare
            size={28}
            style={{ marginRight: "12px", verticalAlign: "middle" }}
          />
          Chia sẻ ý kiến của bạn
        </Title>
        <Comment />
      </div>
    </div>
  );
};

export default ExamMiniTest;
