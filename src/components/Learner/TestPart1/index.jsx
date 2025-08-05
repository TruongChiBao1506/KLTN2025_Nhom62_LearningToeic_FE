import React, { useState } from "react";
import {
  Card,
  Button,
  Radio,
  Badge,
  Row,
  Col,
  Typography,
  Space,
  Affix,
  Divider,
  Alert,
  Image,
} from "antd";
import {
  Volume2,
  Eye,
  EyeOff,
  Check,
  X,
  RotateCcw,
  Languages,
} from "lucide-react";
import "./style.css";

const { Title, Text } = Typography;

const TestPart1 = ({
  questions,
  submitAnswers,
  refreshPage,
  isSubmited,
  getImageUrl,
  getAudioUrl,
  translateText,
  getOptions,
  getOptionClass,
  clearSelection,
  checkAnswer,
}) => {
  const [showTranscript, setShowTranscript] = useState({});

  // Debug logs for component props
  console.log("🎯 TestPart1 Component Debug:", {
    questionsCount: questions?.length || 0,
    hasGetAudioUrl: typeof getAudioUrl === "function",
    firstQuestion: questions?.[0] || null,
    timestamp: new Date().toISOString(),
  });

  const toggleTranscript = async (index) => {
    setShowTranscript((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));

    // Dịch transcript khi hiển thị
    if (!showTranscript[index] && questions[index].questionScript) {
      try {
        const translatedScript = await translateText(
          questions[index].questionScript,
          "vi"
        );
        questions[index].translatedScript = translatedScript;
      } catch (error) {
        console.error("Lỗi khi dịch:", error);
      }
    }
  };

  const scrollToQuestion = (index) => {
    const element = document.getElementById(`question-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleOptionChange = (e, question) => {
    const selectedValue = e.target.value;
    checkAnswer(question, selectedValue);

    // Log để debug
    console.log("🎯 handleOptionChange Debug:", {
      questionId: question._id,
      selectedValue,
      correctOption: question.correctOption,
      eventTarget: e.target.value,
    });
  };

  // Tính số câu đúng - chỉ sau khi isGraded = true
  const getCorrectCount = questions.filter(
    (q) => q.isGraded && q.answered && q.selectedLetter === q.correctOption
  ).length;

  // Tính số câu sai - chỉ sau khi isGraded = true
  const getIncorrectCount = questions.filter(
    (q) => q.isGraded && q.answered && q.selectedLetter !== q.correctOption
  ).length;

  // Get button style based on question state
  const getQuestionButtonStyle = (question) => {
    if (!question.selectedOption) {
      return {
        backgroundColor: "#f5f5f5",
        color: "#666",
        border: "1px solid #d9d9d9",
      };
    }

    if (question.isGraded) {
      if (question.selectedLetter === question.correctOption) {
        return {
          backgroundColor: "#52c41a",
          color: "white",
          border: "1px solid #52c41a",
        };
      } else {
        return {
          backgroundColor: "#ff4d4f",
          color: "white",
          border: "1px solid #ff4d4f",
        };
      }
    }

    return {
      backgroundColor: "#fa8c16",
      color: "white",
      border: "1px solid #fa8c16",
    };
  };

  return (
    <Row gutter={24} style={{ padding: "20px" }}>
      {/* Main Content */}
      <Col xs={24} lg={16}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {questions.map((question, index) => (
            <Card
              key={index}
              id={`question-${index}`}
              style={{
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
              bodyStyle={{ padding: "24px" }}
            >
              <Space
                direction="vertical"
                size="large"
                style={{ width: "100%" }}
              >
                {/* Question Header */}
                <Space align="center">
                  <Button
                    type="primary"
                    shape="circle"
                    size="large"
                    style={{
                      backgroundColor: "#1890ff",
                      borderColor: "#1890ff",
                      fontWeight: "bold",
                    }}
                  >
                    {index + 1}
                  </Button>
                  <Badge
                    color="green"
                    text={question.questionType || "Part 1: Pictures"}
                  />
                </Space>

                {/* Audio and Image Layout */}
                <Row gutter={24}>
                  {/* Audio Column */}
                  <Col xs={24} md={12}>
                    <div
                      style={{
                        background:
                          "linear-gradient(135deg, #f6f9fc 0%, #e9ecef 100%)",
                        padding: "16px",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <Volume2 size={20} color="#1890ff" />
                      <div style={{ flex: 1 }}>
                        <audio
                          controls
                          preload="metadata"
                          style={{
                            width: "100%",
                            maxWidth: "350px",
                            height: "40px",
                          }}
                          onError={(e) => {
                            console.error("❌ Audio load error:", e);
                            console.error(
                              "❌ Audio src:",
                              getAudioUrl(question.questionAudio)
                            );
                          }}
                          onLoadStart={() => {
                            console.log(
                              "✅ Audio loading started:",
                              getAudioUrl(question.questionAudio)
                            );
                          }}
                        >
                          <source
                            src={getAudioUrl(question.questionAudio)}
                            type="audio/mpeg"
                          />
                          <source
                            src={getAudioUrl(question.questionAudio)}
                            type="audio/mp3"
                          />
                          <source
                            src={getAudioUrl(question.questionAudio)}
                            type="audio/wav"
                          />
                          Trình duyệt của bạn không hỗ trợ phát âm thanh.
                        </audio>

                        {/* Debug info - remove in production */}
                        {process.env.NODE_ENV === "development" && (
                          <div
                            style={{
                              fontSize: "10px",
                              color: "#666",
                              marginTop: "4px",
                            }}
                          >
                            Audio URL: {getAudioUrl(question.questionAudio)}
                          </div>
                        )}
                      </div>
                    </div>
                  </Col>

                  {/* Image Column */}
                  <Col xs={24} md={12}>
                    <div
                      style={{
                        background: "#f8f9fa",
                        padding: "16px",
                        borderRadius: "8px",
                        textAlign: "center",
                      }}
                    >
                      <Image
                        src={getImageUrl(question.questionImage)}
                        alt="TOEIC Part 1 Picture"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "300px",
                          borderRadius: "8px",
                        }}
                        preview={{
                          mask: <Eye size={20} />,
                        }}
                      />
                    </div>
                  </Col>
                </Row>

                {/* Options */}
                <div style={{ marginTop: "24px" }}>
                  <Radio.Group
                    value={question.selectedOption}
                    onChange={(e) => handleOptionChange(e, question)}
                    disabled={question.isGraded}
                    style={{ width: "100%" }}
                  >
                    <Space
                      direction="vertical"
                      size="medium"
                      style={{ width: "100%" }}
                    >
                      {getOptions(question).map((option, optionIndex) => {
                        const optionLabel = String.fromCharCode(
                          65 + optionIndex
                        );

                        // Check if this option is correct by comparing option letter with correctOption
                        const isCorrect =
                          question.isGraded &&
                          optionLabel === question.correctOption;

                        const isSelected = question.selectedOption === option;

                        // Check if this selected option is wrong
                        const isWrong =
                          question.isGraded &&
                          isSelected &&
                          question.selectedLetter !== question.correctOption;

                        return (
                          <div
                            key={optionIndex}
                            style={{
                              padding: "16px",
                              borderRadius: "8px",
                              border: `2px solid ${
                                isCorrect
                                  ? "#52c41a"
                                  : isWrong
                                  ? "#ff4d4f"
                                  : isSelected
                                  ? "#1890ff"
                                  : "#f0f0f0"
                              }`,
                              backgroundColor: isCorrect
                                ? "#f6ffed"
                                : isWrong
                                ? "#fff2f0"
                                : isSelected
                                ? "#e6f7ff"
                                : "#fafafa",
                              position: "relative",
                              transition: "all 0.3s ease",
                            }}
                          >
                            <Radio value={option} style={{ width: "100%" }}>
                              <Space align="start">
                                <Text strong style={{ fontSize: "16px" }}>
                                  {optionLabel}.
                                </Text>
                                <Text style={{ fontSize: "16px" }}>
                                  {option}
                                </Text>
                              </Space>
                            </Radio>

                            {isCorrect && (
                              <Check
                                size={24}
                                color="#52c41a"
                                style={{
                                  position: "absolute",
                                  right: "16px",
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                }}
                              />
                            )}
                            {isWrong && (
                              <X
                                size={24}
                                color="#ff4d4f"
                                style={{
                                  position: "absolute",
                                  right: "16px",
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </Space>
                  </Radio.Group>
                </div>

                {/* Clear Selection */}
                {!question.isGraded && question.selectedOption && (
                  <div>
                    <Button
                      type="link"
                      onClick={() => clearSelection(question)}
                      style={{ padding: 0 }}
                    >
                      Xóa lựa chọn
                    </Button>
                  </div>
                )}

                {/* Transcript Section */}
                {question.isGraded && (
                  <div>
                    <Divider />
                    <Button
                      type="link"
                      icon={
                        showTranscript[index] ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )
                      }
                      onClick={() => toggleTranscript(index)}
                      style={{ padding: 0, marginBottom: "12px" }}
                    >
                      {showTranscript[index]
                        ? "Ẩn transcript & giải thích"
                        : "Hiển thị transcript & giải thích"}
                    </Button>

                    {showTranscript[index] && (
                      <Space
                        direction="vertical"
                        size="medium"
                        style={{ width: "100%" }}
                      >
                        {/* Transcript */}
                        {question.questionScript && (
                          <Alert
                            message="📄 Transcript"
                            description={
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: question.questionScript,
                                }}
                              />
                            }
                            type="info"
                            showIcon
                          />
                        )}

                        {/* Translated Transcript */}
                        {question.translatedScript && (
                          <Alert
                            message={
                              <Space>
                                <Languages size={16} />
                                <span>🇻🇳 Bản dịch Transcript</span>
                              </Space>
                            }
                            description={
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: question.translatedScript,
                                }}
                              />
                            }
                            type="success"
                            showIcon={false}
                          />
                        )}

                        {/* Explanation */}
                        {question.questionExplanation && (
                          <Alert
                            message={`💡 Giải thích câu ${index + 1}`}
                            description={
                              <div>
                                <strong>Đáp án:</strong>{" "}
                                {question.correctOption}
                                <br />
                                <strong>Giải thích:</strong>{" "}
                                {question.questionExplanation}
                                {question.suggestedAnswer && (
                                  <>
                                    <br />
                                    <strong>Gợi ý:</strong>{" "}
                                    {question.suggestedAnswer}
                                  </>
                                )}
                              </div>
                            }
                            type="warning"
                            showIcon
                          />
                        )}
                      </Space>
                    )}
                  </div>
                )}
              </Space>
            </Card>
          ))}
        </Space>
      </Col>

      {/* Sidebar */}
      <Col xs={24} lg={8}>
        <Affix offsetTop={20}>
          <Card
            title={
              <Title level={4} style={{ margin: 0, textAlign: "center" }}>
                Bảng câu hỏi
              </Title>
            }
            style={{
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {/* Question Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "8px",
                }}
              >
                {questions.map((question, index) => (
                  <Button
                    key={index}
                    onClick={() => scrollToQuestion(index)}
                    style={{
                      ...getQuestionButtonStyle(question),
                      aspectRatio: "1",
                      fontWeight: "bold",
                    }}
                    size="large"
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>

              {/* Score Display */}
              <div style={{ textAlign: "center" }}>
                <Space size="large">
                  <Space>
                    <Check size={20} color="#52c41a" />
                    <Text strong style={{ color: "#52c41a" }}>
                      {getCorrectCount}/{questions.length}
                    </Text>
                  </Space>
                  <Space>
                    <X size={20} color="#ff4d4f" />
                    <Text strong style={{ color: "#ff4d4f" }}>
                      {getIncorrectCount}/{questions.length}
                    </Text>
                  </Space>
                </Space>
              </div>

              {/* Action Buttons */}
              <Space
                direction="vertical"
                size="medium"
                style={{ width: "100%" }}
              >
                <Button
                  type={isSubmited ? "default" : "primary"}
                  size="large"
                  onClick={submitAnswers}
                  block
                  style={{
                    height: "48px",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                >
                  {isSubmited ? "Đã nộp bài" : "Chấm điểm"}
                </Button>
                <Button
                  type="default"
                  size="large"
                  icon={<RotateCcw size={18} />}
                  onClick={refreshPage}
                  block
                  style={{
                    height: "48px",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                >
                  Làm lại
                </Button>
              </Space>
            </Space>
          </Card>
        </Affix>
      </Col>
    </Row>
  );
};

export default TestPart1;
