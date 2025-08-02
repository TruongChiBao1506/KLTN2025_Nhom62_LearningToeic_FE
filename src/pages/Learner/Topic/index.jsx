import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Input,
  Button,
  Badge,
  Space,
  Spin,
  Empty,
  message,
  Avatar,
  Tag,
  Divider,
} from "antd";
import {
  Mic,
  MicOff,
  Search,
  BookOpen,
  Target,
  Volume2,
  FileText,
  Trophy,
  Zap,
  ChevronRight,
  Play,
} from "lucide-react";
// import "./style.css";

// Import services
import topicService from "../../../services/topicService";
import sectionService from "../../../services/sectionsService";

const { Title, Text, Paragraph } = Typography;
const { Search: SearchInput } = Input;

const Topic = () => {
  // States
  const [topics, setTopics] = useState([]);
  const [sections, setSections] = useState([]);
  const [transcript, setTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Refs
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Fetch topics and sections
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const topicResponse = await topicService.getAllEnabled();
        console.log("Topic response:", topicResponse);
        // Backend trả về array trực tiếp
        setTopics(Array.isArray(topicResponse) ? topicResponse : []);

        const sectionResponse = await sectionService.getAllEnabled();
        console.log("Section response:", sectionResponse);
        // Backend trả về array trực tiếp
        setSections(Array.isArray(sectionResponse) ? sectionResponse : []);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu chủ đề:", error);
        message.error("Không thể tải dữ liệu chủ đề. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtered topics based on search
  const filteredTopics = topics.filter((topic) => {
    if (!transcript || transcript.trim() === "") return true;

    // Search in topic name specifically
    const searchTerm = transcript.toLowerCase().trim();
    return (
      topic.topicName && topic.topicName.toLowerCase().includes(searchTerm)
    );
  });

  // Debug logging
  console.log("Total topics:", topics.length);
  console.log("Filtered topics:", filteredTopics.length);
  console.log("Search term:", transcript);

  // Filtered sections for reading and listening
  const docngheSections = sections.filter(
    (section) => section.type === 1 || section.type === 2
  );

  const getImageUrl = (imageName) => {
    if (!imageName) {
      return "http://localhost:5000/images/default-image.png";
    }

    // If imageName already contains full URL, return as is
    if (imageName.startsWith("http")) {
      return imageName;
    }

    // If imageName starts with '/images/', use it directly
    if (imageName.startsWith("/images/")) {
      return `http://localhost:5000${imageName}`;
    }

    // Otherwise, assume it's just the filename
    return `http://localhost:5000/images/${imageName}`;
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      message.error("Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = "en-US";
    recognitionRef.current.interimResults = true;

    setIsSpeaking(true);

    recognitionRef.current.addEventListener("result", (event) => {
      const lastResultIndex = event.results.length - 1;
      setTranscript(event.results[lastResultIndex][0].transcript);
    });

    recognitionRef.current.addEventListener("end", () => {
      recognitionRef.current.stop();
      setIsSpeaking(false);
    });

    recognitionRef.current.start();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header Section - Compact */}
        <Card
          style={{
            borderRadius: "16px",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 12px 24px rgba(0, 0, 0, 0.08)",
            marginBottom: "20px",
          }}
          bodyStyle={{ padding: "20px" }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                borderRadius: "50%",
                width: "60px",
                height: "60px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
              }}
            >
              <Target
                style={{ width: "24px", height: "24px", color: "white" }}
              />
            </div>
            <Title
              level={3}
              style={{
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: "6px",
                fontWeight: "700",
                fontSize: "20px",
              }}
            >
              HỌC TỪ VỰNG TOEIC THEO CHỦ ĐỀ
            </Title>
            <Text type="secondary" style={{ fontSize: "14px" }}>
              Khám phá và học từ vựng TOEIC được phân loại theo chủ đề chuyên
              sâu
            </Text>
          </div>
        </Card>

        <Row gutter={[20, 20]}>
          {/* Main Content - Increased width */}
          <Col xs={24} lg={18} xl={19}>
            {/* Search Section - Compact */}
            <Card
              style={{
                borderRadius: "12px",
                marginBottom: "16px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
              }}
              bodyStyle={{ padding: "16px" }}
            >
              <div>
                <Title
                  level={5}
                  style={{ marginBottom: "12px", color: "#1890ff" }}
                >
                  <Search
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "6px",
                    }}
                  />
                  Tìm kiếm chủ đề
                </Title>
                <Space.Compact style={{ width: "100%" }}>
                  <SearchInput
                    placeholder="Tìm kiếm chủ đề theo tên..."
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    size="large"
                    style={{
                      borderRadius: "8px 0 0 8px",
                      fontSize: "14px",
                    }}
                    suffix={<Search style={{ color: "#1890ff" }} />}
                  />
                  <Button
                    type={isSpeaking ? "primary" : "default"}
                    size="large"
                    onClick={startSpeechRecognition}
                    disabled={isSpeaking}
                    style={{
                      borderRadius: "0 8px 8px 0",
                      height: "40px",
                      background: isSpeaking ? "#52c41a" : undefined,
                      borderColor: isSpeaking ? "#52c41a" : undefined,
                    }}
                  >
                    {isSpeaking ? (
                      <MicOff style={{ width: "14px", height: "14px" }} />
                    ) : (
                      <Mic style={{ width: "14px", height: "14px" }} />
                    )}
                  </Button>
                </Space.Compact>
              </div>
            </Card>

            {/* Topics Grid - More space */}
            <Card
              style={{
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
              }}
              bodyStyle={{ padding: "20px" }}
            >
              {isLoading ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
                  <Spin size="large" />
                  <Title level={4} style={{ color: "#1890ff", margin: 0 }}>
                    Đang tải dữ liệu chủ đề...
                  </Title>
                  <Text type="secondary">Vui lòng đợi trong giây lát</Text>
                </div>
              ) : filteredTopics.length === 0 ? (
                <Empty
                  image={
                    <Zap
                      style={{
                        width: "64px",
                        height: "64px",
                        color: "#d9d9d9",
                      }}
                    />
                  }
                  description={
                    <div style={{ textAlign: "center" }}>
                      <Title level={4} style={{ color: "#999" }}>
                        Không tìm thấy chủ đề nào
                      </Title>
                      <Text type="secondary" style={{ fontSize: "16px" }}>
                        {transcript
                          ? `Không có chủ đề nào chứa từ khóa "${transcript}". Thử tìm kiếm với từ khóa khác.`
                          : "Hiện tại chưa có chủ đề nào được kích hoạt trong hệ thống."}
                      </Text>
                      {transcript && (
                        <div style={{ marginTop: "16px" }}>
                          <Button
                            type="primary"
                            onClick={() => setTranscript("")}
                            style={{
                              borderRadius: "8px",
                              height: "40px",
                            }}
                          >
                            Xóa bộ lọc
                          </Button>
                        </div>
                      )}
                    </div>
                  }
                />
              ) : (
                <>
                  <div style={{ marginBottom: "16px" }}>
                    <Title
                      level={4}
                      style={{
                        color: "#1890ff",
                        marginBottom: "6px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "18px",
                      }}
                    >
                      <BookOpen style={{ width: "20px", height: "20px" }} />
                      Chủ đề học tập
                      <Badge
                        count={filteredTopics.length}
                        style={{
                          backgroundColor: "#52c41a",
                          fontSize: "12px",
                        }}
                      />
                    </Title>
                    {transcript && (
                      <Text type="secondary" style={{ fontSize: "13px" }}>
                        Tìm thấy {filteredTopics.length} chủ đề cho "
                        {transcript}"
                      </Text>
                    )}
                  </div>
                  <Row gutter={[16, 16]}>
                    {filteredTopics.map((topic, index) => (
                      <Col xs={24} sm={12} md={8} lg={8} xl={6} key={topic._id}>
                        <Card
                          hoverable
                          style={{
                            borderRadius: "12px",
                            border: "2px solid #f0f0f0",
                            height: "100%",
                            transition: "all 0.3s ease",
                            overflow: "hidden",
                          }}
                          bodyStyle={{ padding: 0 }}
                          cover={
                            <div
                              style={{
                                position: "relative",
                                height: "160px",
                                overflow: "hidden",
                              }}
                            >
                              <img
                                src={getImageUrl(topic.topicImage)}
                                alt={`Ảnh chủ đề ${topic.topicName}`}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  transition: "transform 0.3s ease",
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.transform = "scale(1.1)";
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.transform = "scale(1)";
                                }}
                              />
                              <div
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  background:
                                    "linear-gradient(135deg, rgba(102, 126, 234, 0.8), rgba(118, 75, 162, 0.8))",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  opacity: 0,
                                  transition: "opacity 0.3s ease",
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.opacity = 1;
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.opacity = 0;
                                }}
                              >
                                <Play
                                  style={{
                                    width: "48px",
                                    height: "48px",
                                    color: "white",
                                  }}
                                />
                              </div>
                            </div>
                          }
                        >
                          <Link
                            to={`/learner/topic/${topic._id}`}
                            style={{ textDecoration: "none", color: "inherit" }}
                          >
                            <div style={{ padding: "16px" }}>
                              <Title
                                level={5}
                                style={{
                                  marginBottom: "6px",
                                  color: "#1890ff",
                                  fontSize: "16px",
                                }}
                              >
                                {topic.topicName}
                              </Title>
                              <Paragraph
                                type="secondary"
                                style={{
                                  marginBottom: "12px",
                                  fontSize: "13px",
                                  lineHeight: "1.4",
                                }}
                              >
                                Học từ vựng và cụm từ quan trọng
                              </Paragraph>
                              <Space>
                                <Tag
                                  color="success"
                                  style={{
                                    borderRadius: "4px",
                                    padding: "2px 8px",
                                    fontSize: "11px",
                                    fontWeight: "500",
                                  }}
                                >
                                  <Trophy
                                    style={{
                                      width: "10px",
                                      height: "10px",
                                      marginRight: "3px",
                                    }}
                                  />
                                  Kích hoạt
                                </Tag>
                                <ChevronRight
                                  style={{
                                    width: "14px",
                                    height: "14px",
                                    color: "#999",
                                  }}
                                />
                              </Space>
                            </div>
                          </Link>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </>
              )}
            </Card>
          </Col>

          {/* Sidebar - Compact */}
          <Col xs={24} lg={6} xl={5}>
            <Card
              style={{
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
                position: "sticky",
                top: "20px",
              }}
              bodyStyle={{ padding: "16px" }}
            >
              <div style={{ marginBottom: "16px" }}>
                <Title
                  level={5}
                  style={{
                    color: "#fa8c16",
                    marginBottom: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "14px",
                  }}
                >
                  <Zap style={{ width: "16px", height: "16px" }} />
                  Luyện tập khác
                </Title>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Các phần thi TOEIC L&R
                </Text>
              </div>

              <Divider style={{ margin: "12px 0" }} />

              <div>
                {isLoading ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "20px 10px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Spin size="small" />
                    <Text type="secondary" style={{ fontSize: "11px" }}>
                      Đang tải...
                    </Text>
                  </div>
                ) : docngheSections.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "16px" }}>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Chưa có phần luyện tập
                    </Text>
                  </div>
                ) : (
                  <Space
                    direction="vertical"
                    size="small"
                    style={{ width: "100%" }}
                  >
                    {docngheSections.map((section, index) => (
                      <Card
                        key={section._id}
                        size="small"
                        hoverable
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #f0f0f0",
                          transition: "all 0.3s ease",
                        }}
                        bodyStyle={{ padding: "12px" }}
                      >
                        <Link
                          to={`/learner/practice/${section._id}`}
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
                                gap: "8px",
                              }}
                            >
                              <Avatar
                                size="small"
                                style={{
                                  background:
                                    section.type === 1
                                      ? "linear-gradient(135deg, #1890ff, #36cfc9)"
                                      : "linear-gradient(135deg, #52c41a, #73d13d)",
                                  border: "none",
                                }}
                                icon={
                                  section.type === 1 ? (
                                    <Volume2
                                      style={{ width: "12px", height: "12px" }}
                                    />
                                  ) : (
                                    <FileText
                                      style={{ width: "12px", height: "12px" }}
                                    />
                                  )
                                }
                              />
                              <div>
                                <Title
                                  level={5}
                                  style={{
                                    fontSize: "12px",
                                    margin: 0,
                                    marginBottom: "2px",
                                    color: "#1890ff",
                                  }}
                                >
                                  {section.name}
                                </Title>
                                <Tag
                                  color={section.type === 1 ? "blue" : "green"}
                                  style={{
                                    fontSize: "10px",
                                    margin: 0,
                                    borderRadius: "3px",
                                    padding: "1px 6px",
                                  }}
                                >
                                  {section.type === 1 ? "Listening" : "Reading"}
                                </Tag>
                              </div>
                            </div>
                            <ChevronRight
                              style={{
                                width: "12px",
                                height: "12px",
                                color: "#999",
                              }}
                            />
                          </div>
                        </Link>
                      </Card>
                    ))}
                  </Space>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Topic;
