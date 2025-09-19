import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  Volume2,
  RotateCcw,
  Trophy,
  Target,
  Home,
  GraduationCap,
} from "lucide-react";
import {
  Card,
  Col,
  Row,
  Space,
  Typography,
  Button,
  Badge,
  Tooltip,
  Progress,
  Spin,
  message,
} from "antd";

// Import services
import topicService from "../../../services/topicService";
import vocabularyService from "../../../services/vocabularyService";
import useAchievementNotifications from "../../../hooks/useAchievementNotifications";

// Add CSS for animations
const pulseAnimation = `
  @keyframes pulse {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.7;
      transform: scale(1.1);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

// Inject CSS
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = pulseAnimation;
  document.head.appendChild(style);
}

const { Title, Text } = Typography;

const Flashcards = () => {
  const { topicId } = useParams();

  // States
  const [topic, setTopic] = useState({});
  const [vocabularies, setVocabularies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({ correct: 0, total: 0 });
  const [answered, setAnswered] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const { recordLearnVocab } = useAchievementNotifications();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get topic details
        const topicResponse = await topicService.getById(topicId);
        setTopic(topicResponse);

        // Get vocabularies by topic ID
        const vocabResponse = await vocabularyService.getByTopicId(topicId);
        const vocabList = Array.isArray(vocabResponse) ? vocabResponse : [];
        setVocabularies(vocabList);

        if (vocabList.length === 0) {
          message.warning("Chủ đề này chưa có từ vựng nào");
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        message.error("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [topicId]);

  const currentVocab = vocabularies[currentIndex];

  // Play pronunciation
  const playPronunciation = (word) => {
    const speech = new SpeechSynthesisUtterance(word);
    speech.lang = "en-US";
    window.speechSynthesis.speak(speech);
  };

  // Flip card
  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  // Next card
  const nextCard = () => {
    if (currentIndex < vocabularies.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      setShowResults(true);
    }
  };

  // Previous card
  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  // Mark as correct/incorrect
  const markAnswer = (isCorrect) => {
    const newAnswered = [...answered];
    newAnswered[currentIndex] = isCorrect;
    setAnswered(newAnswered);

    const correctCount = newAnswered.filter(Boolean).length;
    setProgress({ correct: correctCount, total: newAnswered.length });

    // Ghi nhận học từ vựng cho streak với notification
    try {
      const learnerToken = localStorage.getItem("learnerToken");
      if (learnerToken) {
        const decoded = JSON.parse(atob(learnerToken.split('.')[1]));
        const userId = decoded.id;
        const currentVocab = vocabularies[currentIndex];
        
        if (currentVocab) {
          recordLearnVocab(userId, 1, currentVocab.vocabularyId || currentVocab._id)
            .then(() => {
              console.log("✅ Đã ghi nhận học từ vựng cho streak với notification");
            })
            .catch(streakError => {
              console.warn("⚠️ Không thể ghi nhận streak học từ vựng:", streakError);
            });
        }
      }
    } catch (error) {
      console.warn("⚠️ Lỗi khi ghi nhận học từ vựng:", error);
    }

    setTimeout(() => {
      nextCard();
    }, 500);
  };

  // Reset flashcards
  const resetFlashcards = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setAnswered([]);
    setProgress({ correct: 0, total: 0 });
    setShowResults(false);
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f8f9fa",
        }}
      >
        <Spin size="large" tip="Đang tải flashcards..." />
      </div>
    );
  }

  if (vocabularies.length === 0) {
    return (
      <div
        style={{
          backgroundColor: "#f8f9fa",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <Card
          style={{
            textAlign: "center",
            maxWidth: "500px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            border: "1px solid #e8e8e8",
          }}
        >
          <div style={{ padding: "40px 20px" }}>
            <GraduationCap
              size={64}
              style={{ color: "#bfbfbf", marginBottom: "24px" }}
            />
            <Title level={3} style={{ color: "#333", marginBottom: "16px" }}>
              Chưa có từ vựng
            </Title>
            <Text
              style={{
                fontSize: "16px",
                color: "#666",
                marginBottom: "32px",
                display: "block",
              }}
            >
              Chủ đề này chưa có từ vựng nào để luyện tập.
            </Text>
            <Link to={`/learner/topic/${topicId}`}>
              <Button
                type="primary"
                size="large"
                style={{
                  borderRadius: "8px",
                  height: "48px",
                  fontSize: "16px",
                }}
              >
                <ArrowLeft size={18} style={{ marginRight: "8px" }} />
                Quay lại chi tiết chủ đề
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (showResults) {
    const percentage = Math.round(
      (progress.correct / vocabularies.length) * 100
    );
    return (
      <div
        style={{
          backgroundColor: "#f8f9fa",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <Card
          style={{
            textAlign: "center",
            maxWidth: "600px",
            borderRadius: "12px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            border: "1px solid #e8e8e8",
          }}
        >
          <div style={{ padding: "40px" }}>
            <div style={{ marginBottom: "24px" }}>
              {percentage >= 70 ? (
                <Trophy size={64} style={{ color: "#52c41a" }} />
              ) : (
                <Target size={64} style={{ color: "#1890ff" }} />
              )}
            </div>
            <Title level={2} style={{ color: "#333", marginBottom: "8px" }}>
              {percentage >= 70 ? "🎉 Xuất sắc!" : "💪 Tiếp tục cố gắng!"}
            </Title>
            <Title
              level={1}
              style={{
                color: percentage >= 70 ? "#52c41a" : "#1890ff",
                fontSize: "48px",
                margin: "16px 0",
              }}
            >
              {percentage}%
            </Title>

            <Text
              style={{
                fontSize: "18px",
                color: "#666",
                marginBottom: "32px",
                display: "block",
              }}
            >
              Bạn đã trả lời đúng{" "}
              <Text strong style={{ color: "#52c41a", fontSize: "20px" }}>
                {progress.correct}
              </Text>{" "}
              /{" "}
              <Text strong style={{ fontSize: "20px" }}>
                {vocabularies.length}
              </Text>{" "}
              từ vựng
            </Text>

            <Space size={16} wrap>
              <Button
                type="primary"
                size="large"
                onClick={resetFlashcards}
                style={{
                  borderRadius: "8px",
                  height: "48px",
                  fontSize: "16px",
                  minWidth: "140px",
                }}
              >
                <RotateCcw size={18} style={{ marginRight: "8px" }} />
                Luyện tập lại
              </Button>

              <Link to={`/learner/topic/${topicId}`}>
                <Button
                  size="large"
                  style={{
                    borderRadius: "8px",
                    height: "48px",
                    fontSize: "16px",
                    minWidth: "140px",
                  }}
                >
                  <ArrowLeft size={18} style={{ marginRight: "8px" }} />
                  Quay lại chủ đề
                </Button>
              </Link>

              <Link to="/learner/topics">
                <Button
                  size="large"
                  style={{
                    borderRadius: "8px",
                    height: "48px",
                    fontSize: "16px",
                    minWidth: "140px",
                  }}
                >
                  <Home size={18} style={{ marginRight: "8px" }} />
                  Danh sách chủ đề
                </Button>
              </Link>
            </Space>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        padding: "24px 16px",
      }}
    >
      {/* Header */}
      <Row justify="center" style={{ marginBottom: "24px" }}>
        <Col span={22}>
          <Card
            style={{
              borderRadius: "12px",
              border: "1px solid #e8e8e8",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <Row align="middle" justify="space-between">
              <Col>
                <Link to={`/learner/topic/${topicId}`}>
                  <Button style={{ borderRadius: "6px" }}>
                    <ArrowLeft size={16} style={{ marginRight: "6px" }} />
                    Quay lại
                  </Button>
                </Link>
              </Col>
              <Col style={{ textAlign: "center" }}>
                <Title level={4} style={{ margin: "0 0 4px 0", color: "#333" }}>
                  {topic.topicName}
                </Title>
                <Text style={{ color: "#666" }}>Flashcards</Text>
              </Col>
              <Col>
                <Badge
                  count={`${currentIndex + 1}/${vocabularies.length}`}
                  style={{
                    backgroundColor: "#1890ff",
                    borderRadius: "12px",
                  }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Main Content - Row Layout */}
      <Row justify="center" gutter={24}>
        {/* Left Side - Flashcard (70% width) */}
        <Col xs={24} lg={16} xl={17}>
          <div
            style={{
              perspective: "1000px",
              height: "400px",
              cursor: "pointer",
            }}
            onClick={flipCard}
          >
            <div
              style={{
                height: "100%",
                borderRadius: "16px",
                boxShadow: "0 8px 24px rgba(24, 144, 255, 0.12)",
                transition: "transform 0.6s ease-in-out",
                transformStyle: "preserve-3d",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                position: "relative",
              }}
            >
              {/* Front Side */}
              <div
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  backfaceVisibility: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "40px",
                  background:
                    "linear-gradient(135deg, #f8faff 0%, #ffffff 100%)",
                  borderRadius: "16px",
                  border: "2px solid #e6f4ff",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "20px",
                    right: "24px",
                    background: "#1890ff",
                    color: "white",
                    padding: "6px 16px",
                    borderRadius: "12px",
                    fontSize: "13px",
                    fontWeight: "bold",
                  }}
                >
                  Từ vựng
                </div>

                <Title
                  level={1}
                  style={{
                    color: "#1890ff",
                    fontSize: "48px",
                    marginBottom: "24px",
                    textAlign: "center",
                    fontWeight: "700",
                    textShadow: "0 2px 4px rgba(24, 144, 255, 0.1)",
                  }}
                >
                  {currentVocab?.word}
                </Title>

                {currentVocab?.ipa && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "32px",
                      backgroundColor: "#f0f8ff",
                      padding: "14px 24px",
                      borderRadius: "16px",
                      border: "1px solid #d6e4ff",
                    }}
                  >
                    <Text
                      style={{
                        color: "#1890ff",
                        fontSize: "20px",
                        marginRight: "16px",
                        fontWeight: "500",
                      }}
                    >
                      {currentVocab.ipa}
                    </Text>
                    <Button
                      type="text"
                      shape="circle"
                      size="large"
                      icon={<Volume2 size={24} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        playPronunciation(currentVocab.word);
                      }}
                      style={{
                        color: "#1890ff",
                        backgroundColor: "#ffffff",
                        border: "1px solid #d6e4ff",
                        boxShadow: "0 2px 4px rgba(24, 144, 255, 0.1)",
                        width: "48px",
                        height: "48px",
                      }}
                    />
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#8c8c8c",
                    fontSize: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      backgroundColor: "#52c41a",
                      borderRadius: "50%",
                      animation: "pulse 2s infinite",
                    }}
                  ></div>
                  Nhấp để xem nghĩa
                </div>
              </div>

              {/* Back Side */}
              <div
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "40px",
                  background:
                    "linear-gradient(135deg, #f6ffed 0%, #ffffff 100%)",
                  borderRadius: "16px",
                  border: "2px solid #d9f7be",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "20px",
                    right: "24px",
                    background: "#52c41a",
                    color: "white",
                    padding: "6px 16px",
                    borderRadius: "12px",
                    fontSize: "13px",
                    fontWeight: "bold",
                  }}
                >
                  Nghĩa
                </div>

                <Title
                  level={2}
                  style={{
                    color: "#52c41a",
                    fontSize: "36px",
                    marginBottom: "24px",
                    textAlign: "center",
                    fontWeight: "600",
                    textShadow: "0 2px 4px rgba(82, 196, 26, 0.1)",
                  }}
                >
                  {currentVocab?.meaning}
                </Title>

                {currentVocab?.wordType && (
                  <Badge
                    color="#722ed1"
                    text={currentVocab.wordType}
                    style={{
                      marginBottom: "24px",
                      fontSize: "16px",
                      fontWeight: "500",
                    }}
                  />
                )}

                {currentVocab?.exampleSentence && (
                  <div
                    style={{
                      backgroundColor: "#fff7e6",
                      padding: "24px",
                      borderRadius: "16px",
                      border: "1px solid #ffd591",
                      textAlign: "center",
                      maxWidth: "100%",
                    }}
                  >
                    <Text
                      strong
                      style={{
                        color: "#fa8c16",
                        fontSize: "16px",
                        display: "block",
                        marginBottom: "12px",
                      }}
                    >
                      📝 Ví dụ:
                    </Text>
                    <Text
                      style={{
                        color: "#595959",
                        fontSize: "18px",
                        fontStyle: "italic",
                        lineHeight: "1.5",
                      }}
                    >
                      "{currentVocab.exampleSentence}"
                    </Text>
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#8c8c8c",
                    fontSize: "16px",
                    marginTop: "24px",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      backgroundColor: "#1890ff",
                      borderRadius: "50%",
                      animation: "pulse 2s infinite",
                    }}
                  ></div>
                  Đánh giá độ khó để tiếp tục
                </div>
              </div>
            </div>
          </div>
        </Col>

        {/* Right Side - Controls & Info (30% width) */}
        <Col xs={24} lg={8} xl={7}>
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            {/* Progress Card */}
            <Card
              style={{
                borderRadius: "12px",
                border: "1px solid #e8e8e8",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <Title level={5} style={{ margin: "0 0 16px 0", color: "#333" }}>
                Tiến độ
              </Title>
              <Progress
                percent={Math.round(
                  ((currentIndex + 1) / vocabularies.length) * 100
                )}
                strokeColor="#1890ff"
                trailColor="#f0f0f0"
                strokeWidth={8}
                style={{ marginBottom: "16px" }}
              />
              <Row justify="space-between">
                <Col>
                  <Space>
                    <Check size={16} style={{ color: "#52c41a" }} />
                    <Text style={{ color: "#52c41a", fontWeight: "500" }}>
                      Đúng: {progress.correct}
                    </Text>
                  </Space>
                </Col>
                <Col>
                  <Space>
                    <X size={16} style={{ color: "#ff4d4f" }} />
                    <Text style={{ color: "#ff4d4f", fontWeight: "500" }}>
                      Sai: {progress.total - progress.correct}
                    </Text>
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* Instruction Card - Show when flipped */}
            {isFlipped && (
              <Card
                style={{
                  background:
                    "linear-gradient(135deg, #fff2e8 0%, #ffffff 100%)",
                  border: "1px solid #ffb37c",
                  borderRadius: "12px",
                  textAlign: "center",
                }}
              >
                <Text
                  style={{
                    color: "#d46b08",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Hãy đánh giá độ khó của từ này
                </Text>
              </Card>
            )}

            {/* Action Buttons */}
            {isFlipped && (
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <Button
                  danger
                  size="large"
                  block
                  onClick={() => markAnswer(false)}
                  style={{
                    borderRadius: "12px",
                    height: "56px",
                    fontSize: "16px",
                    fontWeight: "600",
                    background: "#ff4d4f",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(255, 77, 79, 0.25)",
                    color: "white",
                  }}
                >
                  <X size={20} style={{ marginRight: "8px" }} />
                  <div>
                    <div style={{ color: "white", fontWeight: "600" }}>Khó</div>
                    <div style={{ fontSize: "12px", color: "white" }}>
                      Cần ôn lại
                    </div>
                  </div>
                </Button>

                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={() => markAnswer(true)}
                  style={{
                    borderRadius: "12px",
                    height: "56px",
                    fontSize: "16px",
                    fontWeight: "600",
                    background: "#52c41a",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(82, 196, 26, 0.25)",
                    color: "white",
                  }}
                >
                  <Check size={20} style={{ marginRight: "8px" }} />
                  <div>
                    <div style={{ color: "white", fontWeight: "600" }}>Dễ</div>
                    <div style={{ fontSize: "12px", color: "white" }}>
                      Đã nhớ
                    </div>
                  </div>
                </Button>
              </Space>
            )}

            {/* Navigation Card */}
            <Card
              style={{
                borderRadius: "12px",
                border: "1px solid #e8e8e8",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <Row
                justify="space-between"
                align="middle"
                style={{ marginBottom: "16px" }}
              >
                <Col>
                  <Button
                    size="large"
                    onClick={prevCard}
                    disabled={currentIndex === 0}
                    style={{
                      borderRadius: "8px",
                      height: "44px",
                      opacity: currentIndex === 0 ? 0.5 : 1,
                    }}
                  >
                    <ArrowLeft size={18} style={{ marginRight: "6px" }} />
                    Trước
                  </Button>
                </Col>
                <Col>
                  <Button
                    size="large"
                    onClick={nextCard}
                    disabled={currentIndex === vocabularies.length - 1}
                    style={{
                      borderRadius: "8px",
                      height: "44px",
                      opacity:
                        currentIndex === vocabularies.length - 1 ? 0.5 : 1,
                    }}
                  >
                    {currentIndex === vocabularies.length - 1
                      ? "Hoàn thành"
                      : "Tiếp theo"}
                    <ArrowRight size={18} style={{ marginLeft: "6px" }} />
                  </Button>
                </Col>
              </Row>

              <div style={{ textAlign: "center" }}>
                <Tooltip title="Lật thẻ">
                  <Button
                    type="text"
                    shape="circle"
                    size="large"
                    onClick={flipCard}
                    style={{
                      backgroundColor: "#f0f2f5",
                      color: "#1890ff",
                      width: "48px",
                      height: "48px",
                      marginBottom: "8px",
                    }}
                  >
                    <RotateCcw size={22} />
                  </Button>
                </Tooltip>
                <div>
                  <Text
                    style={{
                      fontSize: "14px",
                      color: "#8c8c8c",
                      fontWeight: "500",
                    }}
                  >
                    {currentIndex + 1} / {vocabularies.length}
                  </Text>
                </div>
              </div>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default Flashcards;
