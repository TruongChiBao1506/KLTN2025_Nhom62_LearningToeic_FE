import React, { useState, useMemo } from "react";
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
import {
  Check,
  X,
  RotateCcw,
  Eye,
  EyeOff,
  Languages,
  FileText,
} from "lucide-react";
import "./style.css";

const { Title, Text } = Typography;

const TestPart6 = ({
  questions,
  submitAnswers,
  refreshPage,
  translateText,
  getOptions,
  getOptionClass,
  clearSelection,
  checkAnswer,
}) => {
  const [showExplanation, setShowExplanation] = useState({});

  // Debug logs for component props
  console.log("🎯 TestPart6 Component Debug:", {
    questionsCount: questions?.length || 0,
    firstQuestion: questions?.[0] || null,
    timestamp: new Date().toISOString(),
  });

  // Nhóm các câu hỏi theo groupId
  const groupQuestionsByGroupId = (questions) => {
    const grouped = {};
    for (const question of questions) {
      const groupKey =
        question.questionGroup?.groupId ||
        question.questionGroup?._id ||
        question.questionGroup ||
        "default";
      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(question);
    }
    return grouped;
  };

  const groupedQuestions = useMemo(
    () => groupQuestionsByGroupId(questions),
    [questions]
  );

  const toggleExplanation = async (groupId) => {
    setShowExplanation((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));

    // Dịch phần giải thích nếu hiển thị
    if (!showExplanation[groupId]) {
      const groupQuestions = groupedQuestions[groupId];
      for (const question of groupQuestions) {
        if (question.questionExplanation && !question.translatedExplanation) {
          try {
            const translatedExplanation = await translateText(
              question.questionExplanation,
              "vi"
            );
            question.translatedExplanation = translatedExplanation;
          } catch (error) {
            console.error("Lỗi khi dịch:", error);
          }
        }
      }
    }
  };

  // Kiểm tra xem tất cả các câu hỏi trong nhóm đã được trả lời chưa
  const isGroupAnswered = (groupQuestions) => {
    return groupQuestions.every((question) => question.isGraded);
  };

  // Tính số thứ tự câu hỏi
  const calculateQuestionNumber = (groupId, questionIndex) => {
    let questionNumber = questionIndex;
    for (let i = 0; i < groupId; i++) {
      if (groupedQuestions[i]) {
        questionNumber += groupedQuestions[i].length;
      }
    }
    return questionNumber;
  };

  // Cuộn đến câu hỏi được chọn
  const scrollToQuestion = (groupId, index) => {
    const element = document.getElementById(`question-${groupId}-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleOptionChange = (e, question) => {
    const selectedValue = e.target.value;
    checkAnswer(question, selectedValue);
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
        backgroundColor: "var(--color-bg-secondary)",
        color: "var(--color-text-secondary)",
        border: "1px solid #d9d9d9",
      };
    }

    if (question.isGraded) {
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
          {Object.entries(groupedQuestions).map(([groupId, groupQuestions]) => (
            <Card
              key={groupId}
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
                {/* Group Passage */}
                {groupQuestions[0].questionGroup?.groupPassage && (
                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, #f6f9fc 0%, #e9ecef 100%)",
                      padding: "20px",
                      borderRadius: "12px",
                      border: "1px solid #e6f7ff",
                    }}
                  >
                    <Space align="center" style={{ marginBottom: "16px" }}>
                      <FileText size={20} color="var(--color-primary)" />
                      <Text
                        strong
                        style={{ color: "var(--color-primary)", fontSize: "16px" }}
                      >
                        Đoạn văn
                      </Text>
                    </Space>
                    <div
                      style={{
                        fontSize: "12px",
                        lineHeight: "1.6",
                        color: "var(--color-text-primary)",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: groupQuestions[0].questionGroup.groupPassage,
                      }}
                    />
                  </div>
                )}

                {/* Questions */}
                <Space
                  direction="vertical"
                  size="medium"
                  style={{ width: "100%" }}
                >
                  {groupQuestions.map((question, index) => (
                    <Card
                      key={index}
                      id={`question-${groupId}-${index}`}
                      style={{
                        backgroundColor: "var(--color-bg-hover)",
                        border: "1px solid #f0f0f0",
                      }}
                    >
                      <Space
                        direction="vertical"
                        size="small"
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
                            {calculateQuestionNumber(parseInt(groupId), index) +
                              1}
                          </Button>
                          <Badge
                            color="purple"
                            text="Part 6: Text Completion"
                          />
                        </Space>

                        {/* Question Content */}
                        <div style={{ marginLeft: "48px" }}>
                          <Text style={{ fontSize: "16px", lineHeight: "1.6" }}>
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
                              {getOptions(question).map(
                                (option, optionIndex) => {
                                  const optionLabel = String.fromCharCode(
                                    65 + optionIndex
                                  );

                                  const isCorrect =
                                    question.isGraded &&
                                    optionLabel === question.correctOption;

                                  const isSelected =
                                    question.selectedOption === option;

                                  const isWrong =
                                    question.isGraded &&
                                    isSelected &&
                                    question.selectedLetter !==
                                      question.correctOption;

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
                                        transition: "all 0.3s ease",
                                      }}
                                    >
                                      <Radio
                                        value={option}
                                        style={{ width: "100%" }}
                                      >
                                        <Space align="start">
                                          <Text
                                            strong
                                            style={{ fontSize: "16px" }}
                                          >
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
                                          color="var(--color-success)"
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
                                          color="var(--color-danger)"
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
                                }
                              )}
                            </Space>
                          </Radio.Group>
                        </div>

                        {/* Clear Selection */}
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
                      </Space>
                    </Card>
                  ))}
                </Space>

                {/* Explanations Section */}
                {isGroupAnswered(groupQuestions) && (
                  <div>
                    <Divider />
                    <Button
                      type="link"
                      icon={
                        showExplanation[groupId] ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )
                      }
                      onClick={() => toggleExplanation(groupId)}
                      style={{ padding: 0, marginBottom: "12px" }}
                    >
                      {showExplanation[groupId]
                        ? "Ẩn giải thích"
                        : "Hiển thị giải thích"}
                    </Button>

                    {showExplanation[groupId] && (
                      <Space
                        direction="vertical"
                        size="medium"
                        style={{ width: "100%" }}
                      >
                        {/* Explanations for each question */}
                        {groupQuestions.map(
                          (question, index) =>
                            question.questionExplanation && (
                              <Alert
                                key={index}
                                message={`💡 Giải thích câu ${
                                  calculateQuestionNumber(
                                    parseInt(groupId),
                                    index
                                  ) + 1
                                }`}
                                description={
                                  <div>
                                    <strong>Câu hỏi:</strong>{" "}
                                    {question.questionContent}
                                    <br />
                                    <strong>Đáp án đúng:</strong>{" "}
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
                                    {question.translatedExplanation && (
                                      <>
                                        <Divider style={{ margin: "12px 0" }} />
                                        <Space>
                                          <Languages size={16} />
                                          <strong>🇻🇳 Bản dịch:</strong>
                                        </Space>
                                        <br />
                                        {question.translatedExplanation}
                                      </>
                                    )}
                                  </div>
                                }
                                type="warning"
                                showIcon
                              />
                            )
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
                {Object.entries(groupedQuestions).map(
                  ([groupId, groupQuestions]) =>
                    groupQuestions.map((question, index) => (
                      <Button
                        key={`${groupId}-${index}`}
                        onClick={() => scrollToQuestion(groupId, index)}
                        style={{
                          ...getQuestionButtonStyle(question),
                          aspectRatio: "1",
                          fontWeight: "bold",
                        }}
                        size="large"
                      >
                        {calculateQuestionNumber(parseInt(groupId), index) + 1}
                      </Button>
                    ))
                )}
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

export default TestPart6;
