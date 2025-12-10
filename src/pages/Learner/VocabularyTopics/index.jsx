import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  Typography,
  Row,
  Col,
  Button,
  Input,
  Tag,
  Spin,
  Empty,
  Progress,
  Space,
  Badge,
  message,
} from "antd";
import {
  BookOpen,
  Search,
  Clock,
  Target,
  Mic,
  MicOff,
  Trophy,
  Zap,
  ChevronRight,
  Play,
} from "lucide-react";
import topicService from "../../../services/topicService";
import vocabularyService from "../../../services/vocabularyService";
// sectionService removed; not required for this page (sidebar removed)

const { Title, Text } = Typography;

const VocabularyTopics = () => {
  // States
  const [topics, setTopics] = useState([]);
  // sections removed — sidebar has been removed
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [topicStats, setTopicStats] = useState({});
  const [transcript, setTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [imageErrors, setImageErrors] = useState(new Set());

  // Refs
  const recognitionRef = useRef(null);

  useEffect(() => {
    document.title = "Chọn chủ đề từ vựng | TOEIC Learning Platform";
    
    const loadTopicStats = async (topicList) => {
      const stats = {};
      
      for (const topic of topicList) {
        try {
          const vocabularies = await vocabularyService.getByTopicId(topic._id);
          stats[topic._id] = {
            totalVocabularies: vocabularies?.length || 0,
            difficulty: getDifficultyLevel(vocabularies?.length || 0),
            estimatedTime: Math.ceil((vocabularies?.length || 0) * 1.5), // 1.5 minutes per vocabulary (realistic estimate)
          };
        } catch (error) {
          console.error(`Error loading stats for topic ${topic._id}:`, error);
          stats[topic._id] = {
            totalVocabularies: 0,
            difficulty: "Cơ bản",
            estimatedTime: 0,
          };
        }
      }
      
      setTopicStats(stats);
    };

    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load topics
        const topicsResponse = await topicService.all();
        if (topicsResponse && topicsResponse.length > 0) {
          setTopics(topicsResponse);
          await loadTopicStats(topicsResponse);
        }

        // Sidebar removed — no sections load required
      } catch (error) {
        console.error("Error loading data:", error);
        message.error("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getDifficultyLevel = (vocabularyCount) => {
    if (vocabularyCount >= 50) return "Nâng cao";
    if (vocabularyCount >= 25) return "Trung bình";
    return "Cơ bản";
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Nâng cao": return "red";
      case "Trung bình": return "orange";
      default: return "green";
    }
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
      const recognizedText = event.results[lastResultIndex][0].transcript;
      setTranscript(recognizedText);
      setSearchQuery(recognizedText);
    });

    recognitionRef.current.addEventListener("end", () => {
      recognitionRef.current.stop();
      setIsSpeaking(false);
    });

    recognitionRef.current.start();
  };

  // Function to handle image error
  const handleImageError = (topicId) => {
    setImageErrors(prev => new Set([...prev, topicId]));
  };
  // Lấy hình ảnh
  const getImageUrl = (imageName) => {
    // Return null if no image name provided
    if (!imageName || imageName.trim() === "") {
      return null;
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

  const filteredTopics = topics.filter(topic => {
    const searchTerm = (searchQuery || transcript).toLowerCase().trim();
    if (!searchTerm) return true;
    
    return (
      topic.topicName.toLowerCase().includes(searchTerm) ||
      topic.description?.toLowerCase().includes(searchTerm)
    );
  });

  // Filter to show only enabled topics
  const enabledTopics = filteredTopics.filter(topic => topic.topicStatus === 1);

  // NOTE: Sidebar 'Listening/Reading' sections removed — docngheSections not used anymore

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "60vh" 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        padding: "20px",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header Section - Compact */}
        <Card
          style={{
            borderRadius: "16px",
            background: "white",
            border: "1px solid rgba(0, 0, 0, 0.06)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            marginBottom: "20px",
          }}
          bodyStyle={{ padding: "24px" }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                background: "linear-gradient(135deg, rgb(102, 126, 234) 0%, rgb(118, 75, 162) 100%)",
                borderRadius: "50%",
                width: "64px",
                height: "64px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <Target
                style={{ width: "28px", height: "28px", color: "white" }}
              />
            </div>
            <Title
              level={2}
              style={{
                background: "linear-gradient(135deg, rgb(102, 126, 234) 0%, rgb(118, 75, 162) 100%) text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: "8px",
                fontWeight: "700",
                fontSize: "24px",
              }}
            >
              HỌC TỪ VỰNG TOEIC THEO CHỦ ĐỀ
            </Title>
            <Text type="secondary" style={{ fontSize: "16px" }}>
              Khám phá và học từ vựng TOEIC được phân loại theo chủ đề chuyên sâu
            </Text>
          </div>
        </Card>

        <Row gutter={[20, 20]}>
          {/* Main Content */}
          <Col xs={24} lg={24} xl={24}>
            {/* Search Section - Compact */}
            <Card
              style={{
                borderRadius: "12px",
                marginBottom: "16px",
                background: "white",
                border: "1px solid rgba(0, 0, 0, 0.06)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
              }}
              bodyStyle={{ padding: "20px" }}
            >
              <div>
                <Title
                  level={5}
                  style={{ marginBottom: "12px", color: "var(--color-primary)" }}
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
                  <Input
                    placeholder="Tìm kiếm chủ đề theo tên..."
                    value={searchQuery || transcript}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setTranscript(e.target.value);
                    }}
                    size="large"
                    style={{
                      borderRadius: "8px 0 0 8px",
                      fontSize: "12px",
                    }}
                    suffix={<Search style={{ color: "var(--color-primary)" }} />}
                  />
                  <Button
                    type={isSpeaking ? "primary" : "default"}
                    size="large"
                    onClick={startSpeechRecognition}
                    disabled={isSpeaking}
                    style={{
                      borderRadius: "0 8px 8px 0",
                      height: "40px",
                      background: isSpeaking ? "var(--color-success)" : undefined,
                      borderColor: isSpeaking ? "var(--color-success)" : undefined,
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

            {/* Statistics - Compact */}
            <Row gutter={16} style={{ marginBottom: "16px" }}>
              <Col xs={24} sm={12}>
                <Card style={{ 
                  textAlign: "center", 
                  borderRadius: "12px",
                  height: "100px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  background: "white",
                  border: "1px solid rgba(0, 0, 0, 0.06)",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                }}>
                  <div style={{ color: "var(--color-primary)", marginBottom: "6px" }}>
                    <BookOpen size={24} />
                  </div>
                  <Text strong style={{ fontSize: "24px", color: "var(--color-primary)" }}>
                    {enabledTopics.length}
                  </Text>
                  <div>
                    <Text type="secondary" style={{ fontSize: "12px" }}>Chủ đề có sẵn</Text>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card style={{ 
                  textAlign: "center", 
                  borderRadius: "12px",
                  height: "100px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  background: "white",
                  border: "1px solid rgba(0, 0, 0, 0.06)",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                }}>
                  <div style={{ color: "var(--color-success)", marginBottom: "6px" }}>
                    <Target size={24} />
                  </div>
                  <Text strong style={{ fontSize: "24px", color: "var(--color-success)" }}>
                    {Object.values(topicStats).reduce((sum, stat) => sum + stat.totalVocabularies, 0)}
                  </Text>
                  <div>
                    <Text type="secondary" style={{ fontSize: "12px" }}>Tổng từ vựng</Text>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Topics Grid - More space */}
            <Card
              style={{
                borderRadius: "12px",
                background: "white",
                border: "1px solid rgba(0, 0, 0, 0.06)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
              }}
              bodyStyle={{ padding: "24px" }}
            >
              {loading ? (
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
                  <Title level={4} style={{ color: "var(--color-primary)", margin: 0 }}>
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
                        color: "var(--color-border)",
                      }}
                    />
                  }
                  description={
                    <div style={{ textAlign: "center" }}>
                      <Title level={4} style={{ color: "var(--color-text-disabled)" }}>
                        Không tìm thấy chủ đề nào
                      </Title>
                      <Text type="secondary" style={{ fontSize: "16px" }}>
                        {(searchQuery || transcript)
                          ? `Không có chủ đề nào chứa từ khóa "${searchQuery || transcript}". Thử tìm kiếm với từ khóa khác.`
                          : "Hiện tại chưa có chủ đề nào được kích hoạt trong hệ thống."}
                      </Text>
                      {(searchQuery || transcript) && (
                        <div style={{ marginTop: "16px" }}>
                          <Button
                            type="primary"
                            onClick={() => {
                              setSearchQuery("");
                              setTranscript("");
                            }}
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
                        color: "var(--color-primary)",
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
                          backgroundColor: "var(--color-success)",
                          fontSize: "12px",
                        }}
                      />
                    </Title>
                    {(searchQuery || transcript) && (
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        Tìm thấy {filteredTopics.length} chủ đề cho "
                        {searchQuery || transcript}"
                      </Text>
                    )}
                  </div>
                  <Row gutter={[16, 16]}>
                    {enabledTopics.map((topic) => {
                      const shouldShowFallback = imageErrors.has(topic._id) || !topic.topicImage || topic.topicImage.trim() === "";
                      const stats = topicStats[topic._id] || {};
                      const progressPercent = Math.min((stats.totalVocabularies / 50) * 100, 100);
                      
                      return (
                        <Col xs={24} sm={12} md={8} lg={8} xl={6} key={topic._id}>
                          <Card
                            hoverable
                            style={{
                              borderRadius: "12px",
                              border: "1px solid #f0f0f0",
                              height: "100%",
                              transition: "all 0.3s ease",
                              overflow: "hidden",
                              background: "white",
                              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
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
                                {!shouldShowFallback ? (
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
                                    onError={() => handleImageError(topic._id)}
                                  />
                                ) : null}
                                
                                {/* Fallback image placeholder */}
                                <div
                                  className="fallback-image"
                                  style={{
                                    display: shouldShowFallback ? "flex" : "none",
                                    width: "100%",
                                    height: "100%",
                                    background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 50%, var(--color-success-light) 100%)",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexDirection: "column",
                                    position: "relative",
                                  }}
                                >
                                  <BookOpen 
                                    style={{ 
                                      width: "48px", 
                                      height: "48px", 
                                      color: "white",
                                      marginBottom: "8px",
                                      opacity: 0.9
                                    }} 
                                  />
                                  <Text 
                                    style={{ 
                                      color: "white", 
                                      fontSize: "12px", 
                                      fontWeight: "600",
                                      textAlign: "center",
                                      maxWidth: "120px",
                                      lineHeight: "1.2"
                                    }}
                                  >
                                    {topic.topicName}
                                  </Text>
                                  
                                  {/* Decorative elements */}
                                  <div style={{
                                    position: "absolute",
                                    top: "10px",
                                    right: "10px",
                                    width: "30px",
                                    height: "30px",
                                    background: "rgba(255,255,255,0.2)",
                                    borderRadius: "50%",
                                  }} />
                                  <div style={{
                                    position: "absolute",
                                    bottom: "10px",
                                    left: "10px",
                                    width: "20px",
                                    height: "20px",
                                    background: "rgba(255,255,255,0.15)",
                                    borderRadius: "50%",
                                  }} />
                                </div>

                                {/* Play overlay for both image and fallback */}
                                <div
                                  style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background:
                                      "linear-gradient(135deg, rgba(24, 144, 255, 0.8), rgba(64, 169, 255, 0.8))",
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
                                <div style={{ 
                                  display: "flex", 
                                  justifyContent: "space-between", 
                                  alignItems: "flex-start",
                                  marginBottom: "8px"
                                }}>
                                  <Title level={5} style={{ margin: 0, color: "var(--color-primary)", fontSize: "16px" }}>
                                    {topic.topicName}
                                  </Title>
                                  <Tag color={getDifficultyColor(stats.difficulty)}>
                                    {stats.difficulty}
                                  </Tag>
                                </div>
                                
                                {topic.description && (
                                  <Text type="secondary" style={{ fontSize: "12px", lineHeight: "1.4", display: "block", marginBottom: "12px" }}>
                                    {topic.description.length > 80 
                                      ? `${topic.description.substring(0, 80)}...` 
                                      : topic.description}
                                  </Text>
                                )}

                                {/* Progress */}
                                <div style={{ marginBottom: "16px" }}>
                                  <div style={{ 
                                    display: "flex", 
                                    justifyContent: "space-between", 
                                    marginBottom: "4px" 
                                  }}>
                                    <Text style={{ fontSize: "12px" }}>Tiến độ nội dung</Text>
                                    <Text style={{ fontSize: "12px" }}>{stats.totalVocabularies}/50</Text>
                                  </div>
                                  <Progress 
                                    percent={progressPercent} 
                                    size="small" 
                                    showInfo={false}
                                    strokeColor={{
                                      '0%': '#108ee9',
                                      '100%': '#87d068',
                                    }}
                                  />
                                </div>

                                {/* Stats */}
                                <div style={{ marginBottom: "16px" }}>
                                  <Row gutter={8}>
                                    <Col span={12}>
                                      <div style={{ textAlign: "center", padding: "8px" }}>
                                        <div style={{ color: "var(--color-primary)", marginBottom: "4px" }}>
                                          <BookOpen size={16} />
                                        </div>
                                        <Text strong style={{ display: "block", fontSize: "12px" }}>
                                          {stats.totalVocabularies}
                                        </Text>
                                        <Text type="secondary" style={{ fontSize: "11px" }}>
                                          Từ vựng
                                        </Text>
                                      </div>
                                    </Col>
                                    <Col span={12}>
                                      <div style={{ textAlign: "center", padding: "8px" }}>
                                        <div style={{ color: "var(--color-success)", marginBottom: "4px" }}>
                                          <Clock size={16} />
                                        </div>
                                        <Text strong style={{ display: "block", fontSize: "12px" }}>
                                          {stats.estimatedTime}m
                                        </Text>
                                        <Text type="secondary" style={{ fontSize: "11px" }}>
                                          Ước tính
                                        </Text>
                                      </div>
                                    </Col>
                                  </Row>
                                </div>

                                <Space style={{ width: "100%", justifyContent: "space-between" }}>
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
                                      color: "var(--color-text-disabled)",
                                    }}
                                  />
                                </Space>
                              </div>
                            </Link>
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                </>
              )}
            </Card>
          </Col>

          {/* Sidebar - removed */}
        </Row>
      </div>
    </div>
  );
};

export default VocabularyTopics;
