import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  Input,
  Button,
  Typography,
  Row,
  Col,
  Space,
  Badge,
  Empty,
  Spin,
  Alert,
  Breadcrumb,
  Statistic,
  Tag,
  Avatar,
  List,
  Divider,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  BookOutlined,
  HomeOutlined,
  PlayCircleOutlined,
  ClearOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import {
  BookOpen,
  Mic,
  MicOff,
  Search,
  GraduationCap,
  ArrowRight,
  Play,
  Zap,
  Volume2,
  FileText,
  Award,
  Clock,
} from "lucide-react";
import { toast } from "react-toastify";

// Import services
import grammarService from "../../../services/grammarService";
import sectionService from "../../../services/sectionsService";

const { Title, Text, Paragraph } = Typography;

const Grammar = () => {
  // States
  const [grammars, setGrammars] = useState([]);
  const [sections, setSections] = useState([]);
  const [transcript, setTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Refs
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Fetch grammars and sections
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [grammarResponse, sectionResponse] = await Promise.all([
          grammarService.getAllEnabled(),
          sectionService.getAllEnabled(),
        ]);
        console.log("🚀 ~ fetchData ~ grammarResponse:", grammarResponse);
        console.log("🚀 ~ fetchData ~ sectionResponse:", sectionResponse);

        // Backend giờ trả về array trực tiếp
        console.log("🚀 ~ grammarResponse.data:", grammarResponse.data);
        console.log("🚀 ~ sectionResponse.data:", sectionResponse.data);
        
        // Data giờ là array trực tiếp, không có wrapper object
        const grammarData = grammarResponse.data || grammarResponse || [];
        const sectionData = sectionResponse.data || sectionResponse || [];
        
        console.log("🚀 ~ grammarData final:", grammarData);
        console.log("🚀 ~ sectionData final:", sectionData);
        
        setGrammars(Array.isArray(grammarData) ? grammarData : []);
        setSections(Array.isArray(sectionData) ? sectionData : []);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu ngữ pháp:", error);
        setError("Không thể tải dữ liệu ngữ pháp. Vui lòng thử lại sau.");
        toast.error("Không thể tải dữ liệu ngữ pháp. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtered grammars based on search
  const filteredGrammars = grammars.filter((grammar) => {
    if (!transcript.trim()) return true;
    const searchTerm = transcript.toLowerCase().trim();
    return (
      (grammar.grammarName && grammar.grammarName.toLowerCase().includes(searchTerm)) ||
      (grammar.description && grammar.description.toLowerCase().includes(searchTerm)) ||
      (grammar.content && grammar.content.toLowerCase().includes(searchTerm))
    );
  });
  console.log("🚀 ~ filteredGrammars:", filteredGrammars);
  console.log("🚀 ~ grammars original:", grammars);

  // Filtered sections for reading and listening
  const docngheSections = sections.filter(
    (section) => section.type === 1 || section.type === 2
  );
  console.log("🚀 ~ Grammar ~ docngheSections:", docngheSections);

  const startSpeechRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = "vi-VN"; // Changed to Vietnamese for better recognition
    recognitionRef.current.interimResults = true;
    recognitionRef.current.continuous = false;

    setIsSpeaking(true);

    recognitionRef.current.addEventListener("result", (event) => {
      const lastResultIndex = event.results.length - 1;
      setTranscript(event.results[lastResultIndex][0].transcript);
    });

    recognitionRef.current.addEventListener("end", () => {
      recognitionRef.current.stop();
      setIsSpeaking(false);
    });

    recognitionRef.current.addEventListener("error", (event) => {
      console.error("Speech recognition error:", event.error);
      setIsSpeaking(false);
      toast.error("Lỗi nhận dạng giọng nói. Vui lòng thử lại.");
    });

    recognitionRef.current.start();
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsSpeaking(false);
    }
  };

  // Handle loading state
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2C5F8D",
        }}
      >
        <Card
          style={{
            textAlign: "center",
            minWidth: "300px",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text>Đang tải dữ liệu ngữ pháp...</Text>
          </div>
        </Card>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2C5F8D",
          padding: "24px",
        }}
      >
        <Card
          style={{
            textAlign: "center",
            maxWidth: "500px",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Alert
            message="Có lỗi xảy ra"
            description={error}
            type="error"
            showIcon
            icon={<BookOpen style={{ width: "24px", height: "24px" }} />}
            action={
              <Button
                type="primary"
                danger
                onClick={() => window.location.reload()}
              >
                Thử lại
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        padding: "24px 0",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 24px" }}>
        {/* Breadcrumb */}
        <Breadcrumb
          style={{ marginBottom: 24 }}
          items={[
            {
              href: "/learner",
              title: <HomeOutlined />,
            },
            {
              title: "Ngữ pháp TOEIC",
            },
          ]}
        />

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <Title
            level={1}
            style={{
              fontSize: "48px",
              marginBottom: 16,
              background: "#2C5F8D",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            <BookOpen
              style={{
                width: "48px",
                height: "48px",
                marginRight: "16px",
                color: "var(--color-brand-purple)",
              }}
            />
            Luyện ngữ pháp TOEIC
          </Title>
          <Paragraph
            style={{
              fontSize: "18px",
              color: "var(--color-text-secondary)",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            Học và luyện tập ngữ pháp TOEIC một cách hiệu quả với{" "}
            <Text strong style={{ color: "var(--color-brand-purple)" }}>
              {grammars.length}+
            </Text>{" "}
            bài học được biên soạn bởi các chuyên gia
          </Paragraph>
        </div>

        {/* Statistics */}
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={8}>
            <Card style={{ textAlign: "center", borderRadius: "16px" }}>
              <Statistic
                title="Bài ngữ pháp"
                value={grammars.length}
                prefix={<BookOpen style={{ width: "20px", height: "20px" }} />}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ textAlign: "center", borderRadius: "16px" }}>
              <Statistic
                title="Bài luyện tập"
                value={docngheSections.length}
                prefix={<PlayCircleOutlined />}
                valueStyle={{ color: "var(--color-primary)" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ textAlign: "center", borderRadius: "16px" }}>
              <Statistic
                title="Kết quả tìm kiếm"
                value={filteredGrammars.length}
                prefix={<Search style={{ width: "20px", height: "20px" }} />}
                valueStyle={{ color: "var(--color-chart-4)" }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            {/* Enhanced Search Section */}
            <Card
              style={{
                marginBottom: 24,
                borderRadius: "20px",
                boxShadow: "0 8px 32px rgba(102, 126, 234, 0.1)",
                border: "1px solid rgba(102, 126, 234, 0.1)",
                background: "linear-gradient(145deg, #ffffff 0%, #fbfcff 100%)",
              }}
              bodyStyle={{ padding: "32px" }}
            >
              <Space direction="vertical" style={{ width: "100%" }} size="large">
                <div>
                  <Space align="center" style={{ marginBottom: 20 }}>
                    <div
                      style={{
                        padding: "8px",
                        borderRadius: "12px",
                        background: "#2C5F8D",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Search style={{ width: "16px", height: "16px", color: "white" }} />
                    </div>
                    <Title level={4} style={{ margin: 0, color: "#2c3e50", fontSize: "20px" }}>
                      Tìm kiếm ngữ pháp
                    </Title>
                  </Space>
                  
                  <Input.Search
                    size="large"
                    placeholder="Nhập tên ngữ pháp hoặc từ khóa..."
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    onSearch={(value) => setTranscript(value)}
                    allowClear
                    style={{ 
                      borderRadius: "16px",
                      boxShadow: "0 2px 8px rgba(102, 126, 234, 0.1)",
                    }}
                    suffix={
                      <Space size={8}>
                        {transcript && (
                          <Tooltip title="Xóa tìm kiếm">
                            <Button
                              type="text"
                              size="small"
                              icon={<ClearOutlined />}
                              onClick={() => setTranscript("")}
                              style={{ 
                                borderRadius: "8px",
                                color: "#64748b",
                              }}
                            />
                          </Tooltip>
                        )}
                        <Tooltip title={isSpeaking ? "Dừng ghi âm" : "Tìm kiếm bằng giọng nói"}>
                          <Button
                            type={isSpeaking ? "primary" : "default"}
                            size="small"
                            icon={
                              isSpeaking ? (
                                <MicOff style={{ width: "16px", height: "16px" }} />
                              ) : (
                                <Mic style={{ width: "16px", height: "16px" }} />
                              )
                            }
                            onClick={isSpeaking ? stopSpeechRecognition : startSpeechRecognition}
                            danger={isSpeaking}
                            style={{ 
                              borderRadius: "10px",
                              background: isSpeaking ? "linear-gradient(135deg, #ff4757, #ff3742)" : undefined,
                              border: isSpeaking ? "none" : undefined,
                            }}
                          />
                        </Tooltip>
                      </Space>
                    }
                  />
                </div>
                
                {isSpeaking && (
                  <div
                    style={{
                      padding: "16px 20px",
                      background: "linear-gradient(135deg, #e3f2fd, #f3e5f5)",
                      borderRadius: "12px",
                      border: "1px solid #e1bee7",
                      animation: "pulse 2s infinite",
                    }}
                  >
                    <Space align="center">
                      <div
                        style={{
                          padding: "6px",
                          borderRadius: "50%",
                          background: "#2C5F8D",
                        }}
                      >
                        <Volume2 style={{ width: "16px", height: "16px", color: "white" }} />
                      </div>
                      <Text style={{ color: "#4a5568", fontWeight: "500", fontSize: "12px" }}>
                        Đang nghe... Hãy nói tên ngữ pháp bạn muốn tìm
                      </Text>
                    </Space>
                  </div>
                )}

                {transcript && (
                  <div
                    style={{
                      padding: "12px 16px",
                      background: "linear-gradient(135deg, #f0fff4, #f7fafc)",
                      borderRadius: "8px",
                      border: "1px solid #c6f6d5",
                    }}
                  >
                    <Text style={{ color: "#2d3748" }}>
                      Tìm thấy <Text strong style={{ color: "var(--color-brand-purple)" }}>{filteredGrammars.length}</Text> kết quả cho 
                      <Text strong style={{ color: "#4a5568" }}> "{transcript}"</Text>
                    </Text>
                  </div>
                )}
              </Space>
            </Card>

            {/* Grammar Content */}
            <Card
              style={{
                borderRadius: "20px",
                boxShadow: "0 8px 32px rgba(102, 126, 234, 0.1)",
                border: "1px solid rgba(102, 126, 234, 0.1)",
                background: "linear-gradient(145deg, #ffffff 0%, #fbfcff 100%)",
              }}
              bodyStyle={{ padding: "32px" }}
            >
              <div style={{ marginBottom: 24 }}>
                <Space align="center" style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      padding: "8px",
                      borderRadius: "12px",
                      background: "#2C5F8D",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <GraduationCap style={{ width: "20px", height: "20px", color: "white" }} />
                  </div>
                  <Title level={3} style={{ margin: 0, color: "#2c3e50", fontSize: "24px" }}>
                    Danh sách ngữ pháp
                  </Title>
                  <Badge
                    count={filteredGrammars.length}
                    style={{
                      backgroundColor: "var(--color-brand-purple)",
                      boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)",
                    }}
                  />
                </Space>
                
                {filteredGrammars.length > 0 && (
                  <Text type="secondary" style={{ fontSize: "16px" }}>
                    Khám phá {filteredGrammars.length} bài học ngữ pháp được tuyển chọn
                  </Text>
                )}
              </div>

              {filteredGrammars.length > 0 ? (
                <Row gutter={[20, 20]}>
                  {filteredGrammars.map((grammar, index) => (
                    <Col xs={24} sm={12} lg={8} key={grammar._id || grammar.grammarId || index}>
                      <Link
                        to={`/learner/grammar/${grammar._id || grammar.grammarId}`}
                        style={{ textDecoration: "none", display: "block" }}
                      >
                        <Card
                          hoverable
                          style={{
                            borderRadius: "16px",
                            border: "1px solid #f0f0f0",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            height: "220px",
                            background: "linear-gradient(145deg, #ffffff 0%, #f8faff 100%)",
                            boxShadow: "0 2px 8px rgba(102, 126, 234, 0.08)",
                            overflow: "hidden",
                            position: "relative",
                          }}
                          bodyStyle={{
                            padding: "20px",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-6px)";
                            e.currentTarget.style.boxShadow = "0 12px 32px rgba(102, 126, 234, 0.15)";
                            e.currentTarget.style.borderColor = "var(--color-brand-purple)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 2px 8px rgba(102, 126, 234, 0.08)";
                            e.currentTarget.style.borderColor = "#f0f0f0";
                          }}
                        >
                          {/* Background decoration */}
                          <div
                            style={{
                              position: "absolute",
                              top: 0,
                              right: 0,
                              width: "60px",
                              height: "60px",
                              background: "linear-gradient(135deg, #667eea20, #764ba220)",
                              borderRadius: "0 16px 0 60px",
                            }}
                          />
                          
                          {/* Header */}
                          <div style={{ marginBottom: 16, position: "relative", zIndex: 1 }}>
                            <Space align="center" style={{ width: "100%" }}>
                              <Avatar
                                size={40}
                                style={{
                                  backgroundColor: "var(--color-brand-purple)",
                                  boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)",
                                }}
                                icon={<FileText style={{ width: "18px", height: "18px" }} />}
                              />
                              <div style={{ flex: 1 }}>
                                <Tag 
                                  color="blue" 
                                  style={{ 
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                    fontWeight: "500",
                                    border: "none",
                                    background: "#2C5F8D",
                                    color: "white",
                                  }}
                                >
                                  Bài #{index + 1}
                                </Tag>
                              </div>
                            </Space>
                          </div>
                          
                          {/* Content */}
                          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                            <Title
                              level={5}
                              style={{
                                marginBottom: 12,
                                fontSize: "17px",
                                lineHeight: 1.4,
                                fontWeight: "600",
                                color: "#2c3e50",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                minHeight: "48px",
                              }}
                            >
                              {grammar.grammarName || "Chưa có tên"}
                            </Title>

                            <div style={{ flex: 1, minHeight: "40px" }}>
                              <Text
                                style={{
                                  color: "#64748b",
                                  fontSize: "12px",
                                  lineHeight: 1.5,
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {grammar.description || "Nhấp để học chi tiết về ngữ pháp này"}
                              </Text>
                            </div>
                          </div>

                          {/* Footer */}
                          <div 
                            style={{ 
                              marginTop: "auto", 
                              paddingTop: 16,
                              borderTop: "1px solid #f1f5f9",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Space size={4}>
                              <Clock style={{ width: "14px", height: "14px", color: "#94a3b8" }} />
                              <Text type="secondary" style={{ fontSize: "12px", color: "#94a3b8" }}>
                                15-20 phút
                              </Text>
                            </Space>
                            
                            <Space 
                              size={6}
                              style={{ 
                                color: "var(--color-brand-purple)",
                                fontSize: "12px",
                                fontWeight: "500",
                              }}
                            >
                              <Text style={{ color: "var(--color-brand-purple)", fontWeight: "500" }}>Học ngay</Text>
                              <ArrowRight 
                                style={{ 
                                  width: "16px", 
                                  height: "16px",
                                  transition: "transform 0.2s ease",
                                }} 
                              />
                            </Space>
                          </div>
                        </Card>
                      </Link>
                    </Col>
                  ))}
                </Row>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    background: "linear-gradient(145deg, #f8faff 0%, #ffffff 100%)",
                    borderRadius: "16px",
                    border: "2px dashed #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      margin: "0 auto 24px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #667eea20, #764ba220)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <BookOpen style={{ width: "40px", height: "40px", color: "var(--color-brand-purple)" }} />
                  </div>
                  
                  <Title level={3} style={{ color: "#475569", marginBottom: 8 }}>
                    {transcript ? "Không tìm thấy ngữ pháp nào" : "Chưa có dữ liệu ngữ pháp"}
                  </Title>
                  
                  <Text style={{ fontSize: "16px", color: "#64748b", display: "block", marginBottom: 24 }}>
                    {transcript
                      ? "Thử tìm kiếm với từ khóa khác hoặc kiểm tra chính tả"
                      : "Dữ liệu đang được cập nhật, vui lòng thử lại sau"}
                  </Text>
                  
                  {transcript && (
                    <Button
                      type="primary"
                      size="large"
                      onClick={() => setTranscript("")}
                      style={{
                        borderRadius: "12px",
                        background: "#2C5F8D",
                        border: "none",
                        boxShadow: "0 4px 16px rgba(102, 126, 234, 0.3)",
                        height: "48px",
                        padding: "0 24px",
                        fontSize: "16px",
                      }}
                    >
                      <Search style={{ width: "16px", height: "16px", marginRight: "8px" }} />
                      Xóa tìm kiếm
                    </Button>
                  )}
                </div>
              )}
            </Card>
          </Col>

          {/* Enhanced Sidebar */}
          <Col xs={24} lg={8}>
            <Card
              style={{
                borderRadius: "16px",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Title level={4} style={{ marginBottom: 16 }}>
                <Zap style={{ width: "20px", height: "20px", marginRight: "8px", color: "var(--color-warning)" }} />
                Các bài luyện tập khác
              </Title>

              {docngheSections.length > 0 ? (
                <List
                  dataSource={docngheSections}
                  renderItem={(section) => (
                    <List.Item style={{ padding: "8px 0", border: "none" }}>
                      <Link
                        to={`/learner/practice/${section._id || section.id}`}
                        style={{ textDecoration: "none", width: "100%" }}
                      >
                        <Card
                          hoverable
                          size="small"
                          style={{
                            borderRadius: "8px",
                            border: "1px solid #f0f0f0",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "var(--color-primary)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "#f0f0f0";
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center" }}>
                            <Avatar
                              size="small"
                              style={{ backgroundColor: "var(--color-primary)", marginRight: 12 }}
                              icon={<Play style={{ width: "12px", height: "12px" }} />}
                            />
                            <div style={{ flex: 1 }}>
                              <Text strong style={{ fontSize: "12px", display: "block" }}>
                                {section.name}
                              </Text>
                              <Text type="secondary" style={{ fontSize: "12px" }}>
                                {section.description || "Luyện tập kỹ năng"}
                              </Text>
                            </div>
                            <ArrowRight
                              style={{
                                width: "14px",
                                height: "14px",
                                color: "var(--color-primary)",
                                marginLeft: 8,
                              }}
                            />
                          </div>
                        </Card>
                      </Link>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Chưa có bài luyện tập nào"
                  style={{ padding: "24px 0" }}
                />
              )}

              <Divider />

              {/* Quick Stats */}
              <div>
                <Title level={5} style={{ marginBottom: 16 }}>
                  <Award style={{ width: "16px", height: "16px", marginRight: "8px", color: "var(--color-warning)" }} />
                  Thống kê nhanh
                </Title>
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="Tổng bài học"
                      value={grammars.length}
                      valueStyle={{ fontSize: "20px", color: "#3f8600" }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Bài luyện tập"
                      value={docngheSections.length}
                      valueStyle={{ fontSize: "20px", color: "var(--color-primary)" }}
                    />
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Grammar;
