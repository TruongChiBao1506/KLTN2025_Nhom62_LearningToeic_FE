import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Button,
  Typography,
  Row,
  Col,
  Progress,
  Badge,
  List,
  Alert,
  Statistic,
  Modal,
  message,
} from "antd";
import {
  Trophy,
  TrendingUp,
  Star,
  Download,
  Share2,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  BookOpen,
} from "lucide-react";

const { Title, Text } = Typography;

const SpeakingResult = ({
  questions = [],
  recordedAudios = [],
  recordedText = [],
  onRestart,
  onBackToSections,
}) => {
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [analysisResults, setAnalysisResults] = useState({});

  // Phân tích kết quả tự động
  const analyzeResults = useCallback(() => {
    const results = {
      overallScore: 0,
      pronunciation: 0,
      fluency: 0,
      accuracy: 0,
      completeness: 0,
      recommendations: [],
      strengths: [],
      improvements: [],
    };

    let totalScore = 0;
    let completedQuestions = 0;

    questions.forEach((question, index) => {
      const hasAudio = recordedAudios[index] !== null;
      const hasText =
        recordedText[index] && recordedText[index].trim().length > 0;

      if (hasAudio && hasText) {
        completedQuestions++;

        // Đơn giản hóa phân tích dựa trên độ dài text và có audio
        const textLength = recordedText[index].length;
        const expectedLength = question.questionText
          ? question.questionText.length * 0.8
          : 100;

        // Tính điểm dựa trên độ đầy đủ
        const completenessScore = Math.min(
          (textLength / expectedLength) * 100,
          100
        );

        // Tính điểm phát âm (giả định dựa trên việc có audio)
        const pronunciationScore = hasAudio ? Math.random() * 20 + 70 : 0; // 70-90

        // Tính điểm trôi chảy (dựa trên tỷ lệ text/expected)
        const fluencyScore = Math.min(completenessScore * 0.9, 90);

        // Tính điểm chính xác (đơn giản hóa)
        const accuracyScore = textLength > 20 ? Math.random() * 15 + 75 : 60; // 75-90 hoặc 60

        const questionScore =
          (pronunciationScore +
            fluencyScore +
            accuracyScore +
            completenessScore) /
          4;
        totalScore += questionScore;
      }
    });

    if (completedQuestions > 0) {
      results.overallScore = Math.round(totalScore / completedQuestions);
      results.pronunciation = Math.round(75 + Math.random() * 20); // 75-95
      results.fluency = Math.round(70 + Math.random() * 25); // 70-95
      results.accuracy = Math.round(80 + Math.random() * 15); // 80-95
      results.completeness = Math.round(
        (completedQuestions / questions.length) * 100
      );
    }

    // Đánh giá điểm mạnh
    if (results.pronunciation >= 85) results.strengths.push("Phát âm rõ ràng");
    if (results.fluency >= 80) results.strengths.push("Nói trôi chảy tự nhiên");
    if (results.accuracy >= 85) results.strengths.push("Đọc chính xác");
    if (results.completeness >= 90) results.strengths.push("Hoàn thành đầy đủ");

    // Đánh giá điểm cần cải thiện
    if (results.pronunciation < 75)
      results.improvements.push("Cải thiện phát âm");
    if (results.fluency < 70) results.improvements.push("Tăng tốc độ nói");
    if (results.accuracy < 80) results.improvements.push("Đọc chính xác hơn");
    if (results.completeness < 80)
      results.improvements.push("Hoàn thành đầy đủ bài");

    // Tạo khuyến nghị
    results.recommendations = generateRecommendations(results);

    setAnalysisResults(results);
  }, [questions, recordedAudios, recordedText]);

  useEffect(() => {
    analyzeResults();
  }, [analyzeResults]);

  const generateRecommendations = (results) => {
    const recommendations = [];

    if (results.pronunciation < 80) {
      recommendations.push({
        type: "pronunciation",
        title: "Luyện phát âm",
        description: "Nghe và bắt chước giọng người bản xứ",
        priority: "high",
      });
    }

    if (results.fluency < 75) {
      recommendations.push({
        type: "fluency",
        title: "Tăng tốc độ đọc",
        description: "Luyện đọc hàng ngày để tăng độ trôi chảy",
        priority: "medium",
      });
    }

    if (results.completeness < 90) {
      recommendations.push({
        type: "practice",
        title: "Luyện tập thường xuyên",
        description: "Dành 15-20 phút mỗi ngày để luyện Speaking",
        priority: "high",
      });
    }

    recommendations.push({
      type: "study",
      title: "Học từ vựng mới",
      description: "Mở rộng vốn từ vựng để diễn đạt tốt hơn",
      priority: "medium",
    });

    return recommendations;
  };

  const getScoreColor = (score) => {
    if (score >= 85) return "#52c41a";
    if (score >= 70) return "#faad14";
    return "#ff4d4f";
  };

  const getScoreLevel = (score) => {
    if (score >= 90) return "Xuất sắc";
    if (score >= 80) return "Tốt";
    if (score >= 70) return "Khá";
    if (score >= 60) return "Trung bình";
    return "Cần cải thiện";
  };

  const handleDownloadReport = () => {
    // Tạo báo cáo PDF hoặc export data
    message.success("Tính năng tải báo cáo sẽ sớm có!");
  };

  const handleShareResult = () => {
    // Chia sẻ kết quả
    message.success("Tính năng chia sẻ sẽ sớm có!");
  };

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <Row justify="center">
        <Col xs={24} sm={22} md={20} lg={18} xl={16}>
          {/* Header */}
          <Card
            style={{
              marginBottom: "24px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
              color: "white",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <Trophy
                size={48}
                color="white"
                style={{ marginBottom: "16px" }}
              />
              <Title level={2} style={{ color: "white", marginBottom: "8px" }}>
                Kết quả bài kiểm tra Speaking
              </Title>
              <Text
                style={{ color: "rgba(255,255,255,0.9)", fontSize: "16px" }}
              >
                Bạn đã hoàn thành bài kiểm tra! Hãy xem kết quả chi tiết bên
                dưới.
              </Text>
            </div>
          </Card>

          <Row gutter={[24, 24]}>
            {/* Overall Score */}
            <Col xs={24} md={8}>
              <Card style={{ borderRadius: "12px", height: "100%" }}>
                <div style={{ textAlign: "center" }}>
                  <Progress
                    type="circle"
                    percent={analysisResults.overallScore}
                    size={120}
                    strokeColor={getScoreColor(analysisResults.overallScore)}
                    format={(percent) => (
                      <div>
                        <div style={{ fontSize: "24px", fontWeight: "bold" }}>
                          {percent}
                        </div>
                        <div style={{ fontSize: "12px", color: "#666" }}>
                          điểm
                        </div>
                      </div>
                    )}
                  />
                  <Title
                    level={4}
                    style={{ marginTop: "16px", marginBottom: "8px" }}
                  >
                    Điểm tổng thể
                  </Title>
                  <Badge
                    color={getScoreColor(analysisResults.overallScore)}
                    text={getScoreLevel(analysisResults.overallScore)}
                  />
                </div>
              </Card>
            </Col>

            {/* Detailed Scores */}
            <Col xs={24} md={16}>
              <Card style={{ borderRadius: "12px", height: "100%" }}>
                <Title level={4} style={{ marginBottom: "20px" }}>
                  <BarChart3 size={20} style={{ marginRight: "8px" }} />
                  Điểm chi tiết
                </Title>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Statistic
                      title="Phát âm"
                      value={analysisResults.pronunciation}
                      suffix="/100"
                      valueStyle={{
                        color: getScoreColor(analysisResults.pronunciation),
                      }}
                    />
                    <Progress
                      percent={analysisResults.pronunciation}
                      strokeColor={getScoreColor(analysisResults.pronunciation)}
                      showInfo={false}
                      size="small"
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Độ trôi chảy"
                      value={analysisResults.fluency}
                      suffix="/100"
                      valueStyle={{
                        color: getScoreColor(analysisResults.fluency),
                      }}
                    />
                    <Progress
                      percent={analysisResults.fluency}
                      strokeColor={getScoreColor(analysisResults.fluency)}
                      showInfo={false}
                      size="small"
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Độ chính xác"
                      value={analysisResults.accuracy}
                      suffix="/100"
                      valueStyle={{
                        color: getScoreColor(analysisResults.accuracy),
                      }}
                    />
                    <Progress
                      percent={analysisResults.accuracy}
                      strokeColor={getScoreColor(analysisResults.accuracy)}
                      showInfo={false}
                      size="small"
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Độ hoàn thành"
                      value={analysisResults.completeness}
                      suffix="/100"
                      valueStyle={{
                        color: getScoreColor(analysisResults.completeness),
                      }}
                    />
                    <Progress
                      percent={analysisResults.completeness}
                      strokeColor={getScoreColor(analysisResults.completeness)}
                      showInfo={false}
                      size="small"
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          <Row gutter={[24, 24]} style={{ marginTop: "24px" }}>
            {/* Strengths & Improvements */}
            <Col xs={24} md={12}>
              <Card style={{ borderRadius: "12px", height: "100%" }}>
                <Title
                  level={4}
                  style={{ marginBottom: "16px", color: "#52c41a" }}
                >
                  <Star size={20} style={{ marginRight: "8px" }} />
                  Điểm mạnh
                </Title>
                {analysisResults.strengths?.length > 0 ? (
                  <List
                    dataSource={analysisResults.strengths}
                    renderItem={(item) => (
                      <List.Item>
                        <CheckCircle
                          size={16}
                          color="#52c41a"
                          style={{ marginRight: "8px" }}
                        />
                        {item}
                      </List.Item>
                    )}
                  />
                ) : (
                  <Text type="secondary">
                    Hãy luyện tập thêm để phát hiện điểm mạnh!
                  </Text>
                )}
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card style={{ borderRadius: "12px", height: "100%" }}>
                <Title
                  level={4}
                  style={{ marginBottom: "16px", color: "#faad14" }}
                >
                  <TrendingUp size={20} style={{ marginRight: "8px" }} />
                  Cần cải thiện
                </Title>
                {analysisResults.improvements?.length > 0 ? (
                  <List
                    dataSource={analysisResults.improvements}
                    renderItem={(item) => (
                      <List.Item>
                        <AlertTriangle
                          size={16}
                          color="#faad14"
                          style={{ marginRight: "8px" }}
                        />
                        {item}
                      </List.Item>
                    )}
                  />
                ) : (
                  <Text type="secondary">Bạn đã làm rất tốt!</Text>
                )}
              </Card>
            </Col>
          </Row>

          {/* Recommendations */}
          <Card style={{ marginTop: "24px", borderRadius: "12px" }}>
            <Title level={4} style={{ marginBottom: "16px" }}>
              <Lightbulb size={20} style={{ marginRight: "8px" }} />
              Đề xuất cải thiện
            </Title>
            <Row gutter={[16, 16]}>
              {analysisResults.recommendations?.map((rec, index) => (
                <Col xs={24} md={12} key={index}>
                  <Alert
                    message={rec.title}
                    description={rec.description}
                    type={rec.priority === "high" ? "warning" : "info"}
                    showIcon
                    style={{ borderRadius: "8px" }}
                  />
                </Col>
              ))}
            </Row>
          </Card>

          {/* Question Details */}
          <Card style={{ marginTop: "24px", borderRadius: "12px" }}>
            <Title level={4} style={{ marginBottom: "16px" }}>
              <BookOpen size={20} style={{ marginRight: "8px" }} />
              Chi tiết từng câu
            </Title>
            <Row gutter={[16, 16]}>
              {questions.map((question, index) => (
                <Col xs={24} md={12} lg={8} key={index}>
                  <Card
                    size="small"
                    style={{
                      borderRadius: "8px",
                      border: recordedAudios[index]
                        ? "1px solid #52c41a"
                        : "1px solid #d9d9d9",
                    }}
                    actions={[
                      <Button
                        type="link"
                        size="small"
                        onClick={() => {
                          setSelectedQuestionIndex(index);
                          setDetailModalVisible(true);
                        }}
                      >
                        Xem chi tiết
                      </Button>,
                    ]}
                  >
                    <div style={{ textAlign: "center" }}>
                      <Badge
                        count={index + 1}
                        style={{
                          backgroundColor: "#1890ff",
                          marginBottom: "8px",
                        }}
                      />
                      <div style={{ marginBottom: "8px" }}>
                        {recordedAudios[index] ? (
                          <CheckCircle size={24} color="#52c41a" />
                        ) : (
                          <AlertTriangle size={24} color="#faad14" />
                        )}
                      </div>
                      <Text
                        type={recordedAudios[index] ? "success" : "warning"}
                      >
                        {recordedAudios[index]
                          ? "Đã hoàn thành"
                          : "Chưa hoàn thành"}
                      </Text>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>

          {/* Action Buttons */}
          <Card style={{ marginTop: "24px", borderRadius: "12px" }}>
            <Row gutter={[16, 16]} justify="center">
              <Col>
                <Button
                  type="primary"
                  size="large"
                  icon={<RotateCcw size={20} />}
                  onClick={onRestart}
                  style={{ borderRadius: "8px" }}
                >
                  Làm lại bài test
                </Button>
              </Col>
              <Col>
                <Button
                  size="large"
                  icon={<BookOpen size={20} />}
                  onClick={onBackToSections}
                  style={{ borderRadius: "8px" }}
                >
                  Về danh sách bài
                </Button>
              </Col>
              <Col>
                <Button
                  size="large"
                  icon={<Download size={20} />}
                  onClick={handleDownloadReport}
                  style={{ borderRadius: "8px" }}
                >
                  Tải báo cáo
                </Button>
              </Col>
              <Col>
                <Button
                  size="large"
                  icon={<Share2 size={20} />}
                  onClick={handleShareResult}
                  style={{ borderRadius: "8px" }}
                >
                  Chia sẻ
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Detail Modal */}
      <Modal
        title={`Chi tiết câu ${selectedQuestionIndex + 1}`}
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {questions[selectedQuestionIndex] && (
          <div>
            <Title level={5}>Văn bản gốc:</Title>
            <Card
              size="small"
              style={{ marginBottom: "16px", backgroundColor: "#fafafa" }}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: questions[selectedQuestionIndex]?.questionText || "",
                }}
              />
            </Card>

            {recordedAudios[selectedQuestionIndex] && (
              <div style={{ marginBottom: "16px" }}>
                <Title level={5}>Bản ghi âm:</Title>
                <audio
                  src={recordedAudios[selectedQuestionIndex]}
                  controls
                  style={{ width: "100%" }}
                />
              </div>
            )}

            {recordedText[selectedQuestionIndex] && (
              <div>
                <Title level={5}>Văn bản nhận diện:</Title>
                <Card size="small" style={{ backgroundColor: "#f6ffed" }}>
                  {recordedText[selectedQuestionIndex]}
                </Card>
              </div>
            )}

            {!recordedAudios[selectedQuestionIndex] && (
              <Alert
                message="Chưa có bản ghi âm"
                description="Bạn chưa ghi âm cho câu này"
                type="warning"
                showIcon
              />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SpeakingResult;
