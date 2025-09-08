import React, { useState, useEffect } from "react";
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
} from "antd";
import {
  BookOpen,
  Search,
  Clock,
  ArrowRight,
  Target,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import topicService from "../../../services/topicService";
import vocabularyService from "../../../services/vocabularyService";

const { Title, Text } = Typography;
const { Search: SearchInput } = Input;

const VocabularyTopics = () => {
  const navigate = useNavigate();
  
  // States
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [topicStats, setTopicStats] = useState({});

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

    const loadTopics = async () => {
      try {
        setLoading(true);
        const response = await topicService.all();
        
        if (response && response.length > 0) {
          setTopics(response);
          
          // Load vocabulary stats for each topic
          await loadTopicStats(response);
        }
      } catch (error) {
        console.error("Error loading topics:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTopics();
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

  const filteredTopics = topics.filter(topic =>
    topic.topicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTopicSelect = (topicId) => {
    navigate(`/learner/vocabulary-learning/${topicId}`);
  };

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
    <div style={{ 
      padding: "24px", 
      background: "linear-gradient(135deg, #f0f2f5 0%, #ffffff 100%)",
      minHeight: "100vh" 
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <Title level={2} style={{ 
          marginBottom: "8px",
          background: "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          <BookOpen size={32} style={{ marginRight: "12px", color: "#1890ff" }} />
          Chọn chủ đề từ vựng
        </Title>
        <Text type="secondary" style={{ fontSize: "16px" }}>
          Chọn chủ đề bạn muốn học để bắt đầu hành trình nâng cao vốn từ vựng
        </Text>
      </div>

      {/* Search */}
      <Card style={{ marginBottom: "24px", borderRadius: "12px" }}>
        <SearchInput
          placeholder="Tìm kiếm chủ đề từ vựng..."
          allowClear
          size="large"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ borderRadius: "8px" }}
          prefix={<Search size={20} style={{ color: "#8c8c8c" }} />}
        />
      </Card>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: "32px" }}>
        <Col xs={24} sm={12}>
          <Card style={{ 
            textAlign: "center", 
            borderRadius: "12px",
            height: "120px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          }}>
            <div style={{ color: "#1890ff", marginBottom: "8px" }}>
              <BookOpen size={28} />
            </div>
            <Text strong style={{ fontSize: "28px", color: "#1890ff" }}>
              {topics.length}
            </Text>
            <div>
              <Text type="secondary" style={{ fontSize: "16px" }}>Chủ đề có sẵn</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card style={{ 
            textAlign: "center", 
            borderRadius: "12px",
            height: "120px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          }}>
            <div style={{ color: "#52c41a", marginBottom: "8px" }}>
              <Target size={28} />
            </div>
            <Text strong style={{ fontSize: "28px", color: "#52c41a" }}>
              {Object.values(topicStats).reduce((sum, stat) => sum + stat.totalVocabularies, 0)}
            </Text>
            <div>
              <Text type="secondary" style={{ fontSize: "16px" }}>Tổng từ vựng</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Topics Grid */}
      {filteredTopics.length === 0 ? (
        <Card style={{ borderRadius: "12px" }}>
          <Empty
            description="Không tìm thấy chủ đề nào phù hợp"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredTopics.map((topic) => {
            const stats = topicStats[topic._id] || {};
            const progressPercent = Math.min((stats.totalVocabularies / 50) * 100, 100);
            
            return (
              <Col xs={24} sm={12} lg={8} xl={6} key={topic._id}>
                <Card
                  hoverable
                  style={{ 
                    borderRadius: "12px",
                    height: "100%",
                    border: "1px solid #f0f0f0",
                    transition: "all 0.3s ease",
                    position: "relative",
                    overflow: "hidden"
                  }}
                  bodyStyle={{ padding: "20px" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
                  }}
                >
                  {/* Topic Header */}
                  <div style={{ marginBottom: "16px" }}>
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "flex-start",
                      marginBottom: "8px"
                    }}>
                      <Title level={4} style={{ margin: 0, color: "#1890ff" }}>
                        {topic.topicName}
                      </Title>
                      <Tag color={getDifficultyColor(stats.difficulty)}>
                        {stats.difficulty}
                      </Tag>
                    </div>
                    
                    {topic.description && (
                      <Text type="secondary" style={{ fontSize: "13px", lineHeight: "1.4" }}>
                        {topic.description.length > 80 
                          ? `${topic.description.substring(0, 80)}...` 
                          : topic.description}
                      </Text>
                    )}
                  </div>

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
                  <div style={{ marginBottom: "20px" }}>
                    <Row gutter={8}>
                      <Col span={12}>
                        <div style={{ textAlign: "center", padding: "8px" }}>
                          <div style={{ color: "#1890ff", marginBottom: "4px" }}>
                            <BookOpen size={16} />
                          </div>
                          <Text strong style={{ display: "block", fontSize: "14px" }}>
                            {stats.totalVocabularies}
                          </Text>
                          <Text type="secondary" style={{ fontSize: "11px" }}>
                            Từ vựng
                          </Text>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ textAlign: "center", padding: "8px" }}>
                          <div style={{ color: "#52c41a", marginBottom: "4px" }}>
                            <Clock size={16} />
                          </div>
                          <Text strong style={{ display: "block", fontSize: "14px" }}>
                            {stats.estimatedTime}m
                          </Text>
                          <Text type="secondary" style={{ fontSize: "11px" }}>
                            Ước tính
                          </Text>
                        </div>
                      </Col>
                    </Row>
                  </div>

                  {/* Action Button */}
                  <Button
                    type="primary"
                    block
                    size="middle"
                    icon={<ArrowRight size={16} />}
                    onClick={() => handleTopicSelect(topic._id)}
                    style={{ 
                      borderRadius: "8px",
                      background: "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
                      border: "none",
                      fontWeight: "500"
                    }}
                  >
                    Bắt đầu học
                  </Button>

                  {/* Background decoration */}
                  <div style={{
                    position: "absolute",
                    top: -20,
                    right: -20,
                    width: 80,
                    height: 80,
                    background: "linear-gradient(135deg, rgba(24,144,255,0.1) 0%, rgba(64,169,255,0.05) 100%)",
                    borderRadius: "50%",
                    zIndex: 0
                  }} />
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Time Estimation Info */}
      <Card style={{ marginTop: "24px", borderRadius: "12px" }}>
        <Title level={4} style={{ textAlign: "center", marginBottom: "20px" }}>
          📚 Cách chúng tôi ước tính thời gian học
        </Title>
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <div style={{ textAlign: "center", padding: "16px" }}>
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>⏱️</div>
              <Text strong>1.5 phút/từ vựng</Text>
              <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                Thời gian trung bình để học một từ vựng hiệu quả
              </div>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ textAlign: "center", padding: "16px" }}>
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>🎯</div>
              <Text strong>Bao gồm đầy đủ</Text>
              <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                Đọc nghĩa, nghe phát âm, luyện nói, ghi nhớ
              </div>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ textAlign: "center", padding: "16px" }}>
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>📊</div>
              <Text strong>Dựa trên nghiên cứu</Text>
              <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                Thống kê từ người học TOEIC Việt Nam
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Footer CTA */}
      <Card style={{ 
        marginTop: "32px", 
        borderRadius: "12px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        border: "none",
        color: "white"
      }}>
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Title level={3} style={{ color: "white", marginBottom: "8px" }}>
            Sẵn sàng cải thiện vốn từ vựng của bạn?
          </Title>
          <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: "16px" }}>
            Chọn một chủ đề phù hợp với mục tiêu học tập và bắt đầu ngay hôm nay!
          </Text>
          <div style={{ 
            marginTop: "16px", 
            padding: "12px", 
            background: "rgba(255,255,255,0.1)", 
            borderRadius: "8px",
            fontSize: "14px"
          }}>
            <Text style={{ color: "rgba(255,255,255,0.8)" }}>
              💡 <strong>Cách tính thời gian học:</strong> Ước tính 1.5 phút cho mỗi từ vựng (bao gồm đọc, nghe, luyện phát âm và ghi nhớ)
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VocabularyTopics;
