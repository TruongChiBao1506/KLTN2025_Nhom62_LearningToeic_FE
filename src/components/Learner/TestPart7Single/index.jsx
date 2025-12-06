import React, { useState, useMemo } from "react";
import {
  Row,
  Col,
  Card,
  Radio,
  Button,
  Badge,
  Space,
  Typography,
  Affix,
  Divider,
} from "antd";
import {
  CheckCircle,
  XCircle,
  RotateCcw,
  FileText,
  Eye,
  EyeOff,
} from "lucide-react";

const { Title, Text } = Typography;

const TestPart7Single = ({
  questions,
  submitAnswers,
  refreshPage,
  isSubmited,
  getImageUrl,
  translateText,
  getOptions,
  getOptionClass,
  clearSelection,
  checkAnswer,
}) => {
  const [showExplanation, setShowExplanation] = useState({});

  // Nhóm các câu hỏi theo groupId
  const groupQuestionsByGroupId = (questions) => {
    const grouped = {};
    for (const question of questions) {
      const groupKey = question.questionGroup.groupId || "default";
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

  // Kiểm tra xem có nên hiển thị nội dung nhóm không
  const shouldDisplayGroupContent = (groupQuestions) => {
    return (
      groupQuestions[0].questionGroup?.groupImage ||
      groupQuestions[0].questionGroup?.groupPassage ||
      groupQuestions[0].questionPassage ||
      groupQuestions[0].questionImage
    );
  };

  // Lấy passage content từ questionGroup hoặc question
  const getPassageContent = (groupQuestions) => {
    // Ưu tiên questionPassage từ question individual
    if (groupQuestions[0].questionPassage) {
      return groupQuestions[0].questionPassage;
    }
    // Fallback về groupPassage
    if (groupQuestions[0].questionGroup?.groupPassage) {
      return groupQuestions[0].questionGroup.groupPassage;
    }
    return null;
  };

  // Lấy image từ questionGroup hoặc question
  const getImageContent = (groupQuestions) => {
    // Ưu tiên questionImage từ question individual
    if (groupQuestions[0].questionImage) {
      return groupQuestions[0].questionImage;
    }
    // Fallback về groupImage
    if (groupQuestions[0].questionGroup?.groupImage) {
      return groupQuestions[0].questionGroup.groupImage;
    }
    return null;
  };

  // Cuộn đến câu hỏi được chọn
  const scrollToQuestion = (groupId, index) => {
    const element = document.getElementById(`question-${groupId}-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleOptionChange = (question, option) => {
    question.selectedOption = option;
    checkAnswer(question);
  };

  // Lấy màu cho radio option - tham khảo từ TestPart4
  const getOptionStyle = (question, option, optionIndex) => {
    const optionLabel = String.fromCharCode(65 + optionIndex); // A, B, C, D

    // Check if this option is correct by comparing option letter with correctOption
    const isCorrect =
      question.isGraded && optionLabel === question.correctOption;

    const isSelected = question.selectedOption === option;

    // Check if this selected option is wrong
    const isWrong =
      question.isGraded &&
      isSelected &&
      question.selectedLetter !== question.correctOption;

    return {
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
    };
  };

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={16}>
        <Card
          className="shadow-lg"
          style={{
            borderRadius: "12px",
            border: "none",
          }}
        >
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {Object.entries(groupedQuestions).map(
              ([groupId, groupQuestions]) => (
                <div key={groupId}>
                  <Row gutter={[24, 24]}>
                    {/* Passage/Image Section */}
                    <Col xs={24} md={12}>
                      <Card
                        size="small"
                        style={{
                          backgroundColor: "var(--color-bg-secondary)",
                          borderRadius: "8px",
                        }}
                      >
                        {shouldDisplayGroupContent(groupQuestions) &&
                          getImageContent(groupQuestions) && (
                            <div style={{ marginBottom: 16 }}>
                              <img
                                src={getImageUrl(
                                  getImageContent(groupQuestions)
                                )}
                                style={{
                                  width: "100%",
                                  borderRadius: "8px",
                                }}
                                alt="Luyện thi Reading TOEIC"
                                loading="lazy"
                              />
                            </div>
                          )}

                        {shouldDisplayGroupContent(groupQuestions) &&
                          getPassageContent(groupQuestions) && (
                            <div style={{ marginTop: 16 }}>
                              {/* Question Text nếu có */}
                              {groupQuestions[0].questionText && (
                                <div
                                  style={{
                                    marginBottom: 12,
                                    padding: "8px 12px",
                                    backgroundColor: "var(--color-info-bg)",
                                    borderRadius: "6px",
                                    fontSize: "12px",
                                    fontWeight: "bold",
                                    color: "var(--color-primary)",
                                  }}
                                >
                                  {groupQuestions[0].questionText}
                                </div>
                              )}

                              <div
                                dangerouslySetInnerHTML={{
                                  __html: getPassageContent(groupQuestions),
                                }}
                                style={{
                                  lineHeight: "1.6",
                                  fontSize: "12px",
                                  whiteSpace: "pre-line",
                                }}
                              />
                            </div>
                          )}
                      </Card>
                    </Col>

                    {/* Questions Section */}
                    <Col xs={24} md={12}>
                      <div
                        style={{
                          maxHeight: "600px",
                          overflowY: "auto",
                          paddingRight: "8px",
                        }}
                      >
                        <Space
                          direction="vertical"
                          size="large"
                          style={{ width: "100%" }}
                        >
                          {groupQuestions.map((question, index) => (
                            <Card
                              key={index}
                              id={`question-${groupId}-${index}`}
                              size="small"
                              style={{
                                borderRadius: "8px",
                                border: "1px solid #f0f0f0",
                              }}
                            >
                              <Space
                                direction="vertical"
                                size="middle"
                                style={{ width: "100%" }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                  }}
                                >
                                  <Badge
                                    count={
                                      calculateQuestionNumber(
                                        parseInt(groupId),
                                        index
                                      ) + 1
                                    }
                                    style={{
                                      backgroundColor: "var(--color-primary)",
                                      color: "white",
                                      fontSize: "12px",
                                      fontWeight: "bold",
                                    }}
                                  />
                                  <Badge
                                    text={question.questionType}
                                    style={{
                                      backgroundColor: "#f0f0f0",
                                      color: "var(--color-text-secondary)",
                                      fontSize: "11px",
                                    }}
                                  />
                                </div>

                                <Text
                                  style={{
                                    fontSize: "12px",
                                    lineHeight: "1.5",
                                  }}
                                >
                                  {question.questionContent}
                                </Text>

                                <Radio.Group
                                  value={question.selectedOption}
                                  onChange={(e) =>
                                    handleOptionChange(question, e.target.value)
                                  }
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
                                        ); // A, B, C, D

                                        // Check if this option is correct by comparing option letter with correctOption
                                        const isCorrect =
                                          question.isGraded &&
                                          optionLabel ===
                                            question.correctOption;

                                        const isSelected =
                                          question.selectedOption === option;

                                        // Check if this selected option is wrong
                                        const isWrong =
                                          question.isGraded &&
                                          isSelected &&
                                          question.selectedLetter !==
                                            question.correctOption;

                                        return (
                                          <div
                                            key={optionIndex}
                                            style={{
                                              padding: "8px",
                                              borderRadius: "6px",
                                              ...getOptionStyle(
                                                question,
                                                option,
                                                optionIndex
                                              ),
                                              position: "relative",
                                            }}
                                          >
                                            <Radio
                                              value={option}
                                              style={{ width: "100%" }}
                                            >
                                              <div
                                                style={{
                                                  display: "flex",
                                                  alignItems: "center",
                                                  justifyContent:
                                                    "space-between",
                                                  width: "100%",
                                                }}
                                              >
                                                <Text style={{ marginLeft: 8 }}>
                                                  {option}
                                                </Text>
                                              </div>
                                            </Radio>

                                            {isCorrect && (
                                              <CheckCircle
                                                size={16}
                                                color="var(--color-success)"
                                                style={{
                                                  position: "absolute",
                                                  right: "8px",
                                                  top: "50%",
                                                  transform: "translateY(-50%)",
                                                }}
                                              />
                                            )}
                                            {isWrong && (
                                              <XCircle
                                                size={16}
                                                color="var(--color-danger)"
                                                style={{
                                                  position: "absolute",
                                                  right: "8px",
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

                                {!question.isGraded &&
                                  question.selectedOption && (
                                    <Button
                                      type="link"
                                      size="small"
                                      onClick={() => clearSelection(question)}
                                      style={{ padding: 0, height: "auto" }}
                                    >
                                      Xóa lựa chọn
                                    </Button>
                                  )}

                                {question.isGraded && (
                                  <div>
                                    <Button
                                      type="link"
                                      size="small"
                                      icon={
                                        showExplanation[
                                          calculateQuestionNumber(
                                            parseInt(groupId),
                                            index
                                          )
                                        ] ? (
                                          <EyeOff size={14} />
                                        ) : (
                                          <Eye size={14} />
                                        )
                                      }
                                      onClick={() =>
                                        toggleExplanation(
                                          calculateQuestionNumber(
                                            parseInt(groupId),
                                            index
                                          )
                                        )
                                      }
                                      style={{ padding: 0, height: "auto" }}
                                    >
                                      {showExplanation[
                                        calculateQuestionNumber(
                                          parseInt(groupId),
                                          index
                                        )
                                      ]
                                        ? "Ẩn giải thích"
                                        : "Hiển thị giải thích"}
                                    </Button>

                                    {showExplanation[
                                      calculateQuestionNumber(
                                        parseInt(groupId),
                                        index
                                      )
                                    ] && (
                                      <Card
                                        size="small"
                                        style={{
                                          marginTop: 12,
                                          backgroundColor: "var(--color-bg-hover)",
                                          border: "1px solid #e8e8e8",
                                        }}
                                      >
                                        <div
                                          dangerouslySetInnerHTML={{
                                            __html:
                                              question.questionExplanation,
                                          }}
                                          style={{ marginBottom: 8 }}
                                        />

                                        {question.translatedExplanation && (
                                          <div>
                                            <Badge
                                              text="Bản dịch"
                                              style={{
                                                backgroundColor: "var(--color-success)",
                                                color: "white",
                                                fontSize: "10px",
                                                marginBottom: 8,
                                              }}
                                            />
                                            <div
                                              dangerouslySetInnerHTML={{
                                                __html:
                                                  question.translatedExplanation,
                                              }}
                                            />
                                          </div>
                                        )}
                                      </Card>
                                    )}
                                  </div>
                                )}
                              </Space>
                            </Card>
                          ))}
                        </Space>
                      </div>
                    </Col>
                  </Row>

                  {Object.keys(groupedQuestions).length > 1 && (
                    <Divider style={{ margin: "24px 0" }} />
                  )}
                </div>
              )
            )}
          </Space>
        </Card>
      </Col>

      {/* Sidebar */}
      <Col xs={24} lg={8}>
        <Affix offsetTop={95}>
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FileText size={20} />
                <Title level={5} style={{ margin: 0 }}>
                  Bảng câu hỏi
                </Title>
              </div>
            }
            style={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {/* Question Grid */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  justifyContent: "center",
                }}
              >
                {Object.entries(groupedQuestions).map(
                  ([groupId, groupQuestions]) =>
                    groupQuestions.map((question, index) => {
                      const questionNumber =
                        calculateQuestionNumber(parseInt(groupId), index) + 1;
                      let backgroundColor = "#f0f0f0";
                      let color = "var(--color-text-secondary)";

                      if (question.selectedOption) {
                        if (question.isGraded) {
                          backgroundColor =
                            question.selectedLetter === question.correctOption
                              ? "var(--color-success)"
                              : "var(--color-danger)";
                          color = "white";
                        } else {
                          // Đã chọn đáp án nhưng chưa nộp bài - màu xanh dương
                          backgroundColor = "#1890ff";
                          color = "white";
                        }
                      }

                      return (
                        <Button
                          key={`${groupId}-${index}`}
                          size="small"
                          onClick={() => scrollToQuestion(groupId, index)}
                          style={{
                            backgroundColor,
                            color,
                            border: "none",
                            borderRadius: "6px",
                            width: "36px",
                            height: "36px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "bold",
                            fontSize: "12px",
                          }}
                        >
                          {questionNumber}
                        </Button>
                      );
                    })
                )}
              </div>

              {/* Score Display */}
              {questions.some((q) => q.isGraded) && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 16,
                    padding: "16px",
                    backgroundColor: "var(--color-bg-hover)",
                    borderRadius: "8px",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <CheckCircle size={16} style={{ color: "var(--color-success)" }} />
                    <Text strong style={{ color: "var(--color-success)" }}>
                      {
                        questions.filter(
                          (q) =>
                            q.isGraded &&
                            q.answered &&
                            q.selectedLetter === q.correctOption
                        ).length
                      }
                      /{questions.length}
                    </Text>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <XCircle size={16} style={{ color: "var(--color-danger)" }} />
                    <Text strong style={{ color: "var(--color-danger)" }}>
                      {
                        questions.filter(
                          (q) =>
                            q.isGraded &&
                            q.answered &&
                            q.selectedLetter !== q.correctOption
                        ).length
                      }
                      /{questions.length}
                    </Text>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <Button
                type={questions.some((q) => q.isGraded) ? "default" : "primary"}
                size="large"
                icon={
                  questions.some((q) => q.isGraded) ? (
                    <RotateCcw size={16} />
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
                  border: "none",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: questions.some((q) => q.isGraded) ? 8 : 0,
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

export default TestPart7Single;
