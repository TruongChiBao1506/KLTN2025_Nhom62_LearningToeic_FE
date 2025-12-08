import React, { useMemo, useState } from "react";
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
} from "antd";
import { Check, X, RotateCcw, Eye, EyeOff, Languages } from "lucide-react";
import "./style.css";

const { Title, Text } = Typography;

const TestPart5 = ({
  questions,
  submitAnswers,
  refreshPage,
  isSubmited,
  translateText,
  getOptions,
  getOptionClass,
  clearSelection,
  checkAnswer,
}) => {
  const [showExplanation, setShowExplanation] = useState({});

  const toggleExplanation = async (index) => {
    setShowExplanation({
      ...showExplanation,
      [index]: !showExplanation[index],
    });

    // Dịch phần giải thích nếu hiển thị
    if (!showExplanation[index]) {
      const question = questions[index];
      const explanation = question.questionExplanation;
      const targetLanguage = "vi"; // Tiếng Việt

      try {
        const translatedExplanation = await translateText(
          explanation,
          targetLanguage
        );
        question.translatedExplanation = translatedExplanation;
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
  };

  // Tính số câu đúng - so sánh selectedLetter với correctOption
  const getCorrectCount = useMemo(() => 
    questions.filter(
      (q) => q.isGraded && q.answered && q.selectedLetter === q.correctOption
    ).length,
    [questions]
  );

  // Tính số câu sai - so sánh selectedLetter với correctOption
  const getIncorrectCount = useMemo(() => 
    questions.filter(
      (q) => q.isGraded && q.answered && q.selectedLetter !== q.correctOption
    ).length,
    [questions]
  );

  // Debug logs
  // console.log("🎯 TestPart5 Debug:", {
  //   questionsCount: questions.length,
  //   gradedQuestions: questions.filter((q) => q.isGraded).length,
  //   correctCount: getCorrectCount,
  //   incorrectCount: getIncorrectCount,
  //   isSubmited,
  //   questionsWithSelectedOption: questions.filter((q) => q.selectedOption)
  //     .length,
  //   firstQuestionData: questions[0]
  //     ? {
  //         selectedOption: questions[0].selectedOption,
  //         selectedLetter: questions[0].selectedLetter,
  //         correctOption: questions[0].correctOption,
  //         isGraded: questions[0].isGraded,
  //       }
  //     : null,
  // });

  // Get button style based on question state
  const getQuestionButtonStyle = (question) => {
    if (!question.selectedOption) {
      return {
        backgroundColor: "var(--color-bg-secondary)",
        color: "var(--color-text-secondary)",
        border: "1px solid #d9d9d9",
      };
    }

    if (question.isGraded) {
      // So sánh selectedLetter với correctOption
      if (question.selectedLetter === question.correctOption) {
        return {
          backgroundColor: "var(--color-success)",
          color: "white",
          border: "1px solid #52c41a",
        };
      } else {
        return {
          backgroundColor: "var(--color-danger)",
          color: "white",
          border: "1px solid #ff4d4f",
        };
      }
    }

    // Đã chọn đáp án nhưng chưa nộp bài - màu xanh dương
    return {
      backgroundColor: "#1890ff",
      color: "white",
      border: "1px solid #1890ff",
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
                size="medium"
                style={{ width: "100%" }}
              >
                {/* Question Header */}
                <Space align="center">
                  <Button
                    type="primary"
                    shape="circle"
                    size="large"
                    style={{
                      backgroundColor: "var(--color-primary)",
                      borderColor: "var(--color-primary)",
                      fontWeight: "bold",
                    }}
                  >
                    {index + 1}
                  </Button>
                  <Badge
                    color="blue"
                    text={
                      question.questionType || "Part 5: Incomplete Sentences"
                    }
                  />
                </Space>

                {/* Question Content */}
                <div style={{ marginLeft: "48px" }}>
                  <Text
                    style={{
                      fontSize: "16px",
                      lineHeight: "1.6",
                      color: "#262626",
                    }}
                  >
                    {question.questionContent}
                  </Text>
                </div>

                {/* Options */}
                <div style={{ marginLeft: "48px" }}>
                  <Radio.Group
                    value={question.selectedOption}
                    onChange={(e) => handleOptionChange(e, question)}
                    disabled={question.isGraded}
                    style={{ width: "100%" }}
                  >
                    <Space
                      direction="vertical"
                      size="small"
                      style={{ width: "100%" }}
                    >
                      {getOptions(question).map((option, optionIndex) => {
                        const optionLabel = String.fromCharCode(
                          65 + optionIndex
                        ); // A, B, C, D

                        // So sánh theo letter thay vì text
                        const isCorrect =
                          question.isGraded &&
                          optionLabel === question.correctOption;
                        const isSelected = question.selectedOption === option;
                        const isWrong =
                          question.isGraded &&
                          isSelected &&
                          optionLabel !== question.correctOption;

                        // Debug log for each option
                        // if (optionIndex === 0) {
                        //   console.log(`🔍 Question ${index + 1} Debug:`, {
                        //     isGraded: question.isGraded,
                        //     selectedOption: question.selectedOption,
                        //     correctOption: question.correctOption,
                        //     answered: question.answered,
                        //     optionLabel,
                        //     isCorrect,
                        //     isWrong,
                        //   });
                        // }

                        return (
                          <div
                            key={optionIndex}
                            style={{
                              padding: "12px",
                              borderRadius: "8px",
                              border: `2px solid ${
                                isCorrect
                                  ? "var(--color-success)"
                                  : isWrong
                                  ? "var(--color-danger)"
                                  : isSelected
                                  ? "var(--color-primary)"
                                  : "#f0f0f0"
                              }`,
                              backgroundColor: isCorrect
                                ? "var(--color-success-bg)"
                                : isWrong
                                ? "var(--color-danger-bg)"
                                : isSelected
                                ? "var(--color-info-bg)"
                                : "var(--color-bg-hover)",
                              position: "relative",
                            }}
                          >
                            <Radio value={option} style={{ width: "100%" }}>
                              <Space align="start">
                                <Text strong>{optionLabel}.</Text>
                                <Text>{option}</Text>
                              </Space>
                            </Radio>

                            {/* Result Icons */}
                            {isCorrect && (
                              <Check
                                size={20}
                                color="var(--color-success)"
                                style={{
                                  position: "absolute",
                                  right: "12px",
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                }}
                              />
                            )}
                            {isWrong && (
                              <X
                                size={20}
                                color="var(--color-danger)"
                                style={{
                                  position: "absolute",
                                  right: "12px",
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

                {/* Clear Selection Button */}
                {!question.isGraded && question.selectedOption && (
                  <div style={{ marginLeft: "48px" }}>
                    <Button
                      type="link"
                      onClick={() => clearSelection(question)}
                      style={{ padding: 0 }}
                    >
                      Xóa lựa chọn
                    </Button>
                  </div>
                )}

                {/* Explanation Section */}
                {question.isGraded && (
                  <div style={{ marginLeft: "48px" }}>
                    <Divider style={{ margin: "16px 0" }} />

                    <Button
                      type="link"
                      icon={
                        showExplanation[index] ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )
                      }
                      onClick={() => toggleExplanation(index)}
                      style={{ padding: 0, marginBottom: "12px" }}
                    >
                      {showExplanation[index]
                        ? "Ẩn giải thích"
                        : "Hiển thị giải thích"}
                    </Button>

                    {showExplanation[index] && (
                      <Space
                        direction="vertical"
                        size="medium"
                        style={{ width: "100%" }}
                      >
                        <Alert
                          message="Giải thích"
                          description={
                            <div
                              dangerouslySetInnerHTML={{
                                __html: question.questionExplanation,
                              }}
                            />
                          }
                          type="info"
                          showIcon
                        />

                        {question.translatedExplanation && (
                          <Alert
                            message={
                              <Space>
                                <Languages size={16} />
                                <span>Bản dịch</span>
                              </Space>
                            }
                            description={
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: question.translatedExplanation,
                                }}
                              />
                            }
                            type="success"
                            showIcon={false}
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
                  gridTemplateColumns: "repeat(5, 1fr)",
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
                    <Check size={20} color="var(--color-success)" />
                    <Text strong style={{ color: "var(--color-success)" }}>
                      {getCorrectCount}/{questions.length}
                    </Text>
                  </Space>
                  <Space>
                    <X size={20} color="var(--color-danger)" />
                    <Text strong style={{ color: "var(--color-danger)" }}>
                      {getIncorrectCount}/{questions.length}
                    </Text>
                  </Space>
                </Space>
              </div>

              {/* Action Button */}
              <Button
                type={questions.some((q) => q.isGraded) ? "default" : "primary"}
                size="large"
                icon={
                  questions.some((q) => q.isGraded) ? (
                    <RotateCcw size={18} />
                  ) : null
                }
                onClick={
                  questions.some((q) => q.isGraded)
                    ? refreshPage
                    : submitAnswers
                }
                block
                style={{
                  height: "48px",
                  fontSize: "16px",
                  fontWeight: "600",
                  borderRadius: "20px",
                  background:  "var(--color-primary)",
                  borderColor:  "var(--color-primary)",
                  color: "#fff",
                }}
              >
                {questions.some((q) => q.isGraded) ? "Làm lại" : "Chấm điểm"}
              </Button>
            </Space>
          </Card>
        </Affix>
      </Col>
    </Row>
  );
};

export default TestPart5;
