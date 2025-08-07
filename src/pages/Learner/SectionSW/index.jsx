import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Badge,
  Space,
  Empty,
  Spin,
  Progress,
  Divider,
} from "antd";
import {
  BookOpen,
  Users,
  Zap,
  Play,
  Headphones,
  PenTool,
  Award,
} from "lucide-react";
import SectionService from "../../../services/sectionsService";
import TestService from "../../../services/testService";

const { Title, Text, Paragraph } = Typography;

const SectionSW = () => {
  const { sectionId } = useParams();
  const [sections, setSections] = useState([]);
  const [tests, setTests] = useState([]);

  const [sectionName, setSectionName] = useState("");
  const [loading, setLoading] = useState(false);
  const [testsLoading, setTestsLoading] = useState(false);

  console.log("🚀 ~ SectionSW ~ sectionId from URL:", sectionId);
  console.log("🚀 ~ SectionSW ~ tests:", tests);

  // Lấy danh sách tất cả sections đã được kích hoạt
  const retrieveSections = useCallback(async () => {
    try {
      setLoading(true);
      const response = await SectionService.allEnable();
      console.log("🚀 ~ SectionSW ~ response:", response);
      setSections(response);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Lọc chỉ lấy các section liên quan đến Speaking và Writing (type 3, 4)
  const speakingWritingSections = sections.filter(
    (section) => section.type === 3 || section.type === 4
  );

  console.log(
    "🚀 ~ SectionSW ~ speakingWritingSections:",
    speakingWritingSections
  );

  // Hiển thị tất cả sections hiện có để fallback
  const allAvailableSections = sections.slice(0, 8); // Giới hạn 8 sections

  // Lấy danh sách tests thuộc section hiện tại
  const retrieveTests = useCallback(async () => {
    if (!sectionId) {
      console.log("🚀 ~ SectionSW ~ No sectionId provided");
      return;
    }
    try {
      setTestsLoading(true);
      console.log("🚀 ~ SectionSW ~ Loading tests for sectionId:", sectionId);
      const response = await TestService.getEnableTestsBySection(sectionId);
      console.log("🚀 ~ SectionSW ~ tests response:", response);

      setTests(response);
      if (response && response.length > 0) {
        setSectionName(response[0].section.name);
        console.log("🚀 ~ SectionSW ~ first test:", response[0]);
      } else {
        console.log("🚀 ~ SectionSW ~ No tests found for section:", sectionId);
      }
    } catch (error) {
      console.error("🚀 ~ SectionSW ~ Error loading tests:", error);
    } finally {
      setTestsLoading(false);
    }
  }, [sectionId]);

  useEffect(() => {
    retrieveSections();
    if (sectionId) {
      retrieveTests();
    }
  }, [sectionId, retrieveSections, retrieveTests]);

  return (
    <div style={{ padding: "24px", background: "#f5f5f5", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header Section */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <Space direction="vertical" size="small">
            <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
              <Headphones size={32} style={{ marginRight: "12px" }} />
              Luyện thi TOEIC SPEAKING & WRITING online 2025
            </Title>
            {sectionName && (
              <Title level={4} style={{ margin: 0, color: "#666" }}>
                {sectionName}
              </Title>
            )}
          </Space>
        </div>

        <Row gutter={[24, 24]}>
          {/* Main Tests Section */}
          <Col xs={24} lg={16}>
            <Card
              title={
                <Space>
                  <BookOpen size={20} />
                  <span style={{ fontSize: "18px", fontWeight: "600" }}>
                    {sectionId ? "BÀI KIỂM TRA" : "CÁC PHẦN LUYỆN TẬP"}
                  </span>
                </Space>
              }
              style={{
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              {sectionId ? (
                // Hiển thị tests của section cụ thể
                testsLoading ? (
                  <div style={{ textAlign: "center", padding: "40px" }}>
                    <Spin size="large" />
                    <div style={{ marginTop: "16px" }}>
                      Đang tải bài kiểm tra...
                    </div>
                  </div>
                ) : tests.length > 0 ? (
                  <Row gutter={[16, 16]}>
                    {tests.map((test) => (
                      <Col
                        xs={24}
                        sm={12}
                        md={8}
                        lg={6}
                        key={test._id || test.testId}
                      >
                        <Card
                          size="small"
                          style={{
                            borderRadius: "8px",
                            border: "1px solid #f0f0f0",
                            transition: "all 0.3s ease",
                            cursor: "pointer",
                          }}
                          hoverable
                          bodyStyle={{ padding: "16px" }}
                        >
                          <Space
                            direction="vertical"
                            size="small"
                            style={{ width: "100%" }}
                          >
                            <Text
                              strong
                              style={{ fontSize: "14px", color: "#1890ff" }}
                            >
                              {test.testName}
                            </Text>

                            <Progress
                              percent={20}
                              size="small"
                              strokeColor="#52c41a"
                              showInfo={false}
                            />
                            <Text style={{ fontSize: "12px", color: "#666" }}>
                              Tiến độ: 20%
                            </Text>

                            <Space>
                              <Users size={14} />
                              <Text style={{ fontSize: "12px", color: "#666" }}>
                                {test.testParticipants} người tham gia
                              </Text>
                            </Space>

                            <Link
                              to={`/learner/section/${
                                test.section._id || test.section.id
                              }/study-sw/${test._id || test.testId}`}
                              style={{ textDecoration: "none" }}
                            >
                              <Button
                                type="primary"
                                size="small"
                                icon={<Play size={14} />}
                                block
                                style={{
                                  marginTop: "8px",
                                  borderRadius: "6px",
                                  background:
                                    "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                                }}
                              >
                                Bắt đầu học
                              </Button>
                            </Link>
                          </Space>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Chưa có bài kiểm tra nào"
                    style={{ padding: "40px" }}
                  />
                )
              ) : // Hiển thị tổng quan các sections Speaking/Writing
              loading ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <Spin size="large" />
                  <div style={{ marginTop: "16px" }}>Đang tải sections...</div>
                </div>
              ) : speakingWritingSections.length > 0 ? (
                <Row gutter={[16, 16]}>
                  {speakingWritingSections.map((section) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={section._id}>
                      <Link
                        to={`/learner/practice-sw/${section._id}`}
                        style={{ textDecoration: "none" }}
                      >
                        <Card
                          size="small"
                          hoverable
                          style={{
                            borderRadius: "8px",
                            border: "1px solid #f0f0f0",
                            transition: "all 0.3s ease",
                            cursor: "pointer",
                          }}
                          bodyStyle={{ padding: "16px" }}
                        >
                          <Space
                            direction="vertical"
                            size="small"
                            style={{ width: "100%" }}
                          >
                            <Space>
                              {section.type === 3 ? (
                                <Headphones
                                  size={20}
                                  style={{ color: "#fa8c16" }}
                                />
                              ) : (
                                <PenTool
                                  size={20}
                                  style={{ color: "#722ed1" }}
                                />
                              )}
                              <Badge
                                count={
                                  section.type === 3 ? "Speaking" : "Writing"
                                }
                                style={{
                                  backgroundColor:
                                    section.type === 3 ? "#fa8c16" : "#722ed1",
                                  fontSize: "10px",
                                }}
                              />
                            </Space>

                            <Text
                              strong
                              style={{
                                fontSize: "14px",
                                color: "#1890ff",
                              }}
                            >
                              {section.name}
                            </Text>

                            <Text style={{ fontSize: "12px", color: "#666" }}>
                              {section.description
                                ? section.description.slice(0, 100) + "..."
                                : `${
                                    section.type === 3 ? "Speaking" : "Writing"
                                  } - Luyện tập kỹ năng TOEIC`}
                            </Text>

                            <Button
                              type="primary"
                              size="small"
                              icon={<Play size={14} />}
                              block
                              style={{
                                marginTop: "8px",
                                borderRadius: "6px",
                                background:
                                  section.type === 3
                                    ? "linear-gradient(135deg, #fa8c16 0%, #d48806 100%)"
                                    : "linear-gradient(135deg, #722ed1 0%, #531dab 100%)",
                              }}
                            >
                              Xem bài tập
                            </Button>
                          </Space>
                        </Card>
                      </Link>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Chưa có sections Speaking & Writing nào"
                  style={{ padding: "40px" }}
                />
              )}
            </Card>
          </Col>

          {/* Sidebar */}
          <Col xs={24} lg={8}>
            <Card
              title={
                <Space>
                  <Zap size={20} style={{ color: "#faad14" }} />
                  <span style={{ fontSize: "18px", fontWeight: "600" }}>
                    LUYỆN TẬP KHÁC
                  </span>
                </Space>
              }
              style={{
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              {loading ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <Spin />
                  <div style={{ marginTop: "8px" }}>Đang tải...</div>
                </div>
              ) : (
                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: "100%" }}
                >
                  {speakingWritingSections.length > 0 ? (
                    speakingWritingSections.map((section) => (
                      <Link
                        key={section._id}
                        to={`/learner/practice-sw/${section._id}`}
                        style={{ textDecoration: "none" }}
                      >
                        <Card
                          size="small"
                          hoverable
                          style={{
                            borderRadius: "8px",
                            border: "1px solid #f0f0f0",
                            marginBottom: "8px",
                          }}
                          bodyStyle={{ padding: "12px" }}
                        >
                          <Space>
                            {section.type === 3 ? (
                              <Headphones
                                size={16}
                                style={{ color: "#fa8c16" }}
                              />
                            ) : (
                              <PenTool size={16} style={{ color: "#722ed1" }} />
                            )}
                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  marginBottom: "4px",
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: "14px",
                                    fontWeight: "500",
                                  }}
                                >
                                  {section.name}
                                </Text>
                                <Badge
                                  count={
                                    section.type === 3 ? "Speaking" : "Writing"
                                  }
                                  style={{
                                    backgroundColor:
                                      section.type === 3
                                        ? "#fa8c16"
                                        : "#722ed1",
                                    fontSize: "10px",
                                  }}
                                />
                              </div>
                              <Text style={{ fontSize: "12px", color: "#666" }}>
                                {section.description
                                  ? section.description.slice(0, 120) + "..."
                                  : `${
                                      section.type === 3
                                        ? "Speaking"
                                        : "Writing"
                                    } - Luyện tập kỹ năng TOEIC`}
                              </Text>
                            </div>
                          </Space>
                        </Card>
                      </Link>
                    ))
                  ) : (
                    <>
                      <Paragraph
                        style={{
                          fontSize: "14px",
                          color: "#666",
                          marginBottom: "16px",
                        }}
                      >
                        Hiện chưa có bài luyện Speaking & Writing. Bạn có thể
                        thử các phần TOEIC khác:
                      </Paragraph>
                      {allAvailableSections.map((section) => (
                        <Link
                          key={section._id}
                          to={`/learner/section/${section._id}`}
                          style={{ textDecoration: "none" }}
                        >
                          <Card
                            size="small"
                            hoverable
                            style={{
                              borderRadius: "8px",
                              border: "1px solid #f0f0f0",
                              marginBottom: "8px",
                            }}
                            bodyStyle={{ padding: "12px" }}
                          >
                            <Space>
                              {section.type === 1 ? (
                                <Headphones
                                  size={16}
                                  style={{ color: "#52c41a" }}
                                />
                              ) : section.type === 2 ? (
                                <BookOpen
                                  size={16}
                                  style={{ color: "#1890ff" }}
                                />
                              ) : section.type === 3 ? (
                                <Headphones
                                  size={16}
                                  style={{ color: "#fa8c16" }}
                                />
                              ) : (
                                <PenTool
                                  size={16}
                                  style={{ color: "#722ed1" }}
                                />
                              )}
                              <div style={{ flex: 1 }}>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginBottom: "4px",
                                  }}
                                >
                                  <Text
                                    style={{
                                      fontSize: "14px",
                                      fontWeight: "500",
                                    }}
                                  >
                                    {section.name}
                                  </Text>
                                  <Badge
                                    count={
                                      section.type === 1
                                        ? "Listening"
                                        : section.type === 2
                                        ? "Reading"
                                        : section.type === 3
                                        ? "Speaking"
                                        : "Writing"
                                    }
                                    style={{
                                      backgroundColor:
                                        section.type === 1
                                          ? "#52c41a"
                                          : section.type === 2
                                          ? "#1890ff"
                                          : section.type === 3
                                          ? "#fa8c16"
                                          : "#722ed1",
                                      fontSize: "10px",
                                    }}
                                  />
                                </div>
                                <Text
                                  style={{ fontSize: "12px", color: "#666" }}
                                >
                                  {section.description
                                    ? section.description.slice(0, 100) + "..."
                                    : `${
                                        section.type === 1
                                          ? "Listening"
                                          : section.type === 2
                                          ? "Reading"
                                          : section.type === 3
                                          ? "Speaking"
                                          : "Writing"
                                      } - Luyện tập kỹ năng TOEIC`}
                                </Text>
                              </div>
                            </Space>
                          </Card>
                        </Link>
                      ))}
                    </>
                  )}

                  <Divider style={{ margin: "16px 0" }} />

                  {/* Tips Section */}
                  <Card
                    size="small"
                    style={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      border: "none",
                      borderRadius: "8px",
                    }}
                    bodyStyle={{ padding: "16px" }}
                  >
                    <Space
                      direction="vertical"
                      size="small"
                      style={{ width: "100%" }}
                    >
                      <Space>
                        <Award size={16} style={{ color: "white" }} />
                        <Text style={{ color: "white", fontWeight: "600" }}>
                          Mẹo luyện thi
                        </Text>
                      </Space>
                      <Text style={{ color: "white", fontSize: "12px" }}>
                        {speakingWritingSections.length > 0
                          ? "Luyện tập Speaking và Writing đều đặn mỗi ngày để cải thiện kỹ năng giao tiếp. Bắt đầu với Read Aloud và Describe Picture trước khi chuyển sang các phần khó hơn."
                          : "Hiện tại chưa có bài luyện Speaking & Writing. Hãy luyện tập Listening và Reading để chuẩn bị tốt cho kỳ thi TOEIC. Bắt đầu với Part 1 và Part 5 trước khi chuyển sang các phần khó hơn."}
                      </Text>
                    </Space>
                  </Card>
                </Space>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default SectionSW;
