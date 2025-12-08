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

  // Nhóm các câu hỏi theo groupId nếu chưa grouped
  const groupQuestionsByGroupId = (questions) => {
    // Kiểm tra nếu questions đã grouped (có groupData và questions array)
    if (questions.length > 0 && questions[0].groupData && Array.isArray(questions[0].questions)) {
      // Đã grouped, trả về dưới dạng object với key là index
      const grouped = {};
      const groupOrder = [];
      questions.forEach((group, index) => {
        grouped[index] = {
          groupData: group.groupData,
          questions: group.questions
        };
        groupOrder.push(index);
      });
      // Reverse each group's questions to match desired order
      const sortedGrouped = {};
      groupOrder.forEach((key) => {
        sortedGrouped[key] = {
          groupData: grouped[key].groupData,
          questions: grouped[key].questions.reverse(),
        };
      });
      return sortedGrouped;
    }

    // Nếu chưa grouped, nhóm theo questionGroup._id
    const grouped = {};
    const groupOrder = [];
    for (const question of questions) {
      const groupKey = question.questionGroup?._id || "default";
      if (!grouped[groupKey]) {
        grouped[groupKey] = {
          groupData: question.questionGroup || null,
          questions: []
        };
        groupOrder.push(groupKey);
      }
      grouped[groupKey].questions.push(question);
    }
    // Reverse questions inside each group to match desired order
    const sortedGrouped = {};
    groupOrder.forEach((key) => {
      sortedGrouped[key] = {
        groupData: grouped[key].groupData,
        questions: grouped[key].questions.reverse(),
      };
    });
    return sortedGrouped;
  };

  const groupedQuestions = useMemo(
    () => groupQuestionsByGroupId(questions),
    [questions]
  );

  // Sort group keys để đảm bảo thứ tự
  const groupKeys = useMemo(() => Object.keys(groupedQuestions), [groupedQuestions]);

  // Flatten questions for score and grid
  const allQuestions = useMemo(() => {
    // Compute flattened list from groupedQuestions to reflect reversed order
    return Object.entries(groupedQuestions).flatMap(([, groupObj]) => groupObj.questions || []);
  }, [groupedQuestions]);

  const toggleExplanation = async (index) => {
    setShowExplanation({
      ...showExplanation,
      [index]: !showExplanation[index],
    });

    // Dịch phần giải thích nếu hiển thị
    if (!showExplanation[index]) {
      // Tìm question theo index tổng
      let currentIndex = 0;
      let foundQuestion = null;
      for (const groupKey of groupKeys) {
        const groupQuestions = groupedQuestions[groupKey];
        for (const question of groupQuestions) {
          if (currentIndex === index) {
            foundQuestion = question;
            break;
          }
          currentIndex++;
        }
        if (foundQuestion) break;
      }
      if (foundQuestion) {
        const explanation = foundQuestion.questionExplanation;
        const targetLanguage = "vi"; // Tiếng Việt

        try {
          const translatedExplanation = await translateText(
            explanation,
            targetLanguage
          );
          foundQuestion.translatedExplanation = translatedExplanation;
        } catch (error) {
          console.error("Lỗi khi dịch:", error);
        }
      }
    }
  };

  // Tính số thứ tự câu hỏi
  const questionNumbers = useMemo(() => {
    const numbers = {};
    const indices = {};
    let currentNumber = 0; // zero-based index
    Object.keys(groupedQuestions).forEach((groupId) => {
      const group = groupedQuestions[groupId];
      group.questions.forEach((_, idx) => {
        indices[`${groupId}-${idx}`] = currentNumber;
        numbers[`${groupId}-${idx}`] = currentNumber + 1; // display 1-based
        currentNumber += 1;
      });
    });
    return { numbers, indices };
  }, [groupedQuestions]);

  const getQuestionNumber = (groupId, questionIndex) => {
    return questionNumbers.numbers[`${groupId}-${questionIndex}`] || 0;
  };

  const getQuestionIndex = (groupId, questionIndex) => {
    return questionNumbers.indices[`${groupId}-${questionIndex}`] ?? 0;
  };

  // Kiểm tra xem có nên hiển thị nội dung nhóm không
  const shouldDisplayGroupContent = (groupObj) => {
    return (
      groupObj.groupData?.groupImage ||
      groupObj.groupData?.groupPassage ||
      groupObj.questions[0]?.questionPassage ||
      groupObj.questions[0]?.questionImage
    );
  };

  // Lấy passage content từ groupData hoặc question
  const getPassageContent = (groupObj) => {
    // Ưu tiên questionPassage từ question individual
    if (groupObj.questions[0].questionPassage) {
      return groupObj.questions[0].questionPassage;
    }
    // Fallback về groupPassage
    if (groupObj.groupData?.groupPassage) {
      return groupObj.groupData.groupPassage;
    }
    return null;
  };

  // Lấy image từ groupData hoặc question
  const getImageContent = (groupObj) => {
    // Ưu tiên questionImage từ question individual
    if (groupObj.questions[0].questionImage) {
      return groupObj.questions[0].questionImage;
    }
    // Fallback về groupImage
    if (groupObj.groupData?.groupImage) {
      return groupObj.groupData.groupImage;
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
              ([groupId, groupObj]) => (
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
                        {shouldDisplayGroupContent(groupObj) &&
                          getImageContent(groupObj) && (
                            <div style={{ marginBottom: 16 }}>
                              <img
                                src={getImageUrl(
                                  getImageContent(groupObj)
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

                        {shouldDisplayGroupContent(groupObj) &&
                          getPassageContent(groupObj) && (
                            <div style={{ marginTop: 16 }}>
                              {/* Question Text nếu có */}
                              {groupObj.questions[0].questionText && (
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
                                  {groupObj.questions[0].questionText}
                                </div>
                              )}

                              <div
                                dangerouslySetInnerHTML={{
                                  __html: getPassageContent(groupObj),
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
                          {groupObj.questions.map((question, index) => (
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
                                      count={getQuestionNumber(groupId, index)}
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
                                            getQuestionIndex(
                                              groupId,
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
                                          getQuestionIndex(
                                            groupId,
                                            index
                                          )
                                        )
                                      }
                                      style={{ padding: 0, height: "auto" }}
                                    >
                                      {showExplanation[
                                        getQuestionIndex(
                                          groupId,
                                          index
                                        )
                                      ]
                                        ? "Ẩn giải thích"
                                        : "Hiển thị giải thích"}
                                    </Button>

                                    {showExplanation[
                                      getQuestionIndex(
                                        groupId,
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
                  ([groupId, groupObj]) =>
                    groupObj.questions.map((question, index) => {
                      const questionNumber = getQuestionNumber(groupId, index);
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
              {allQuestions.some((q) => q.isGraded) && (
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
                        allQuestions.filter(
                          (q) =>
                            q.isGraded &&
                            q.answered &&
                            q.selectedLetter === q.correctOption
                        ).length
                      }
                      /{allQuestions.length}
                    </Text>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <XCircle size={16} style={{ color: "var(--color-danger)" }} />
                    <Text strong style={{ color: "var(--color-danger)" }}>
                      {
                        allQuestions.filter(
                          (q) =>
                            q.isGraded &&
                            q.answered &&
                            q.selectedLetter !== q.correctOption
                        ).length
                      }
                      /{allQuestions.length}
                    </Text>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <Button
                type={allQuestions.some((q) => q.isGraded) ? "default" : "primary"}
                size="large"
                icon={
                  allQuestions.some((q) => q.isGraded) ? (
                    <RotateCcw size={16} />
                  ) : null
                }
                onClick={
                  allQuestions.some((q) => q.isGraded)
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
                  gap: allQuestions.some((q) => q.isGraded) ? 8 : 0,
                  borderRadius: "20px",
                  background:  "var(--color-primary)",
                  borderColor:  "var(--color-primary)",
                  color: "#fff",
                }}
              >
                {allQuestions.some((q) => q.isGraded) ? "Làm lại" : "Chấm điểm"}
              </Button>
            </Space>
          </Card>
        </Affix>
      </Col>
    </Row>
  );
};

export default TestPart7Single;
