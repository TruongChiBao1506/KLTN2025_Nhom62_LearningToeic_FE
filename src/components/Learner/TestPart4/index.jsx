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
  Image,
} from "antd";
import {
  Check,
  X,
  RotateCcw,
  Eye,
  EyeOff,
  Languages,
  Volume2,
} from "lucide-react";
import "./style.css";

const { Title, Text } = Typography;

const TestPart4 = ({
  questions,
  submitAnswers,
  refreshPage,
  getImageUrl,
  getAudioUrl,
  translateText,
  getOptions,
  getOptionClass,
  clearSelection,
  checkAnswer,
}) => {
  const [showGroupScript, setShowGroupScript] = useState({});

  // Debug logs for component props
  // console.log("🎯 TestPart4 Component Debug:", {
  //   questionsCount: questions?.length || 0,
  //   hasGetAudioUrl: typeof getAudioUrl === "function",
  //   timestamp: new Date().toISOString(),
  // });

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

  const toggleGroupScript = async (groupId) => {
    setShowGroupScript((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));

    // Dịch đoạn văn khi hiển thị
    if (!showGroupScript[groupId]) {
      const groupQuestions = groupedQuestions[groupId];
      // Use questionScript from first question since questionGroup is just an ID
      const groupScript =
        groupQuestions[0].questionScript ||
        groupQuestions[0].questionGroup?.groupScript ||
        "";
      const targetLanguage = "vi"; // Tiếng Việt
      try {
        if (groupScript) {
          const translatedGroupScript = await translateText(
            groupScript,
            targetLanguage
          );
          // Store translation in the question object
          groupQuestions[0].translatedQuestionScript = translatedGroupScript;
        }
      } catch (error) {
        console.error("Lỗi khi dịch:", error);
      }
    }
  };

  // Kiểm tra xem tất cả các câu hỏi trong nhóm đã được trả lời chưa
  const isGroupAnswered = (groupQuestions) => {
    return groupQuestions.every((question) => question.isGraded);
  };

  // Tính số thứ tự câu hỏi
  const questionNumbers = useMemo(() => {
    const numbers = {};
    let currentNumber = 0;
    Object.entries(groupedQuestions).forEach(([groupId, groupQuestions]) => {
      groupQuestions.forEach((_, index) => {
        numbers[`${groupId}-${index}`] = currentNumber + index + 1;
      });
      currentNumber += groupQuestions.length;
    });
    return numbers;
  }, [groupedQuestions]);

  const getQuestionNumber = (groupId, questionIndex) => {
    return questionNumbers[`${groupId}-${questionIndex}`] || 0;
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
  const getCorrectCount = useMemo(() => 
    questions.filter(
      (q) => q.isGraded && q.answered && q.selectedLetter === q.correctOption
    ).length,
    [questions]
  );

  // Tính số câu sai - chỉ sau khi isGraded = true
  const getIncorrectCount = useMemo(() => 
    questions.filter(
      (q) => q.isGraded && q.answered && q.selectedLetter !== q.correctOption
    ).length,
    [questions]
  );

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
                {/* Audio Player */}
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
                  <Volume2 size={20} color="var(--color-primary)" />
                  <div style={{ flex: 1 }}>
                    <audio
                      controls
                      preload="metadata"
                      style={{
                        width: "100%",
                        maxWidth: "400px",
                        height: "40px",
                      }}
                      onError={(e) => {
                        console.error("❌ Audio load error:", e);
                        const audioSrc =
                          groupQuestions[0].questionGroup?.groupAudio ||
                          groupQuestions[0].questionAudio;
                        console.error("❌ Audio src:", getAudioUrl(audioSrc));
                      }}
                      onLoadStart={() => {
                        const audioSrc =
                          groupQuestions[0].questionGroup?.groupAudio ||
                          groupQuestions[0].questionAudio;
                        console.log(
                          "✅ Audio loading started:",
                          getAudioUrl(audioSrc)
                        );
                      }}
                      onCanPlay={() => {
                        const audioSrc =
                          groupQuestions[0].questionGroup?.groupAudio ||
                          groupQuestions[0].questionAudio;
                        console.log(
                          "✅ Audio can play:",
                          getAudioUrl(audioSrc)
                        );
                      }}
                      onLoadedData={() => {
                        const audioSrc =
                          groupQuestions[0].questionGroup?.groupAudio ||
                          groupQuestions[0].questionAudio;
                        console.log(
                          "✅ Audio data loaded:",
                          getAudioUrl(audioSrc)
                        );
                      }}
                    >
                      <source
                        src={getAudioUrl(
                          groupQuestions[0].questionGroup?.groupAudio ||
                            groupQuestions[0].questionAudio
                        )}
                        type="audio/mpeg"
                      />
                      <source
                        src={getAudioUrl(
                          groupQuestions[0].questionGroup?.groupAudio ||
                            groupQuestions[0].questionAudio
                        )}
                        type="audio/mp3"
                      />
                      <source
                        src={getAudioUrl(
                          groupQuestions[0].questionGroup?.groupAudio ||
                            groupQuestions[0].questionAudio
                        )}
                        type="audio/wav"
                      />
                      Trình duyệt của bạn không hỗ trợ phát âm thanh.
                    </audio>
                  </div>
                </div>

                {/* Content Layout */}
                {groupQuestions[0].questionGroup.groupImage ? (
                  <Row gutter={24}>
                    {/* Image Column */}
                    <Col xs={24} md={16} lg={14}>
                      <div
                        style={{
                          background: "var(--color-bg-secondary)",
                          padding: "16px",
                          borderRadius: "8px",
                          textAlign: "center",
                        }}
                      >
                        <Image
                          src={getImageUrl(
                            groupQuestions[0].questionGroup.groupImage
                          )}
                          alt="TOEIC Listening"
                            style={{
                            width: "100%",
                            height: "auto",
                            maxHeight: 1000,
                            objectFit: "contain",
                            borderRadius: "8px",
                          }}
                          preview={{
                            mask: <Eye size={20} />,
                          }}
                        />
                      </div>
                    </Col>

                    {/* Questions Column */}
                    <Col xs={24} md={8} lg={10}>
                      <Space
                        direction="vertical"
                        size="medium"
                        style={{ width: "100%" }}
                      >
                        {groupQuestions.map((question, index) => (
                          <Card
                            key={index}
                            id={`question-${groupId}-${index}`}
                            size="small"
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
                                  size="small"
                                  style={{
                                    backgroundColor: "var(--color-primary)",
                                    borderColor: "var(--color-primary)",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {getQuestionNumber(
                                    parseInt(groupId),
                                    index
                                  )}
                                </Button>
                                <Badge
                                  color="blue"
                                  text={
                                    "Part 4: Talks" || question.questionType
                                  }
                                />
                              </Space>

                              {/* Question Content */}
                              <Text
                                style={{ fontSize: "12px", marginLeft: "32px" }}
                              >
                                {question.questionContent}
                              </Text>

                              {/* Options */}
                              <div style={{ marginLeft: "32px" }}>
                                <Radio.Group
                                  value={question.selectedOption}
                                  onChange={(e) =>
                                    handleOptionChange(e, question)
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
                                        );

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
                                            <Radio
                                              value={option}
                                              style={{ width: "100%" }}
                                            >
                                              <Text strong style={{ fontSize: "14px" }}>
                                                {optionLabel}
                                              </Text>
                                            </Radio>

                                            {isCorrect && (
                                              <Check
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
                                              <X
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
                              </div>

                              {/* Clear Selection */}
                              {!question.isGraded &&
                                question.selectedOption && (
                                  <div style={{ marginLeft: "32px" }}>
                                    <Button
                                      type="link"
                                      size="small"
                                      onClick={() => clearSelection(question)}
                                      style={{ padding: 0, fontSize: "12px" }}
                                    >
                                      Xóa lựa chọn
                                    </Button>
                                  </div>
                                )}
                            </Space>
                          </Card>
                        ))}
                      </Space>
                    </Col>
                  </Row>
                ) : (
                  /* Questions without image */
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
                              {getQuestionNumber(
                                parseInt(groupId),
                                index
                              )}
                            </Button>
                            <Badge
                              color="blue"
                              text={question.questionType || "Part 4: Talks"}
                            />
                          </Space>

                          {/* Question Content */}
                          <div style={{ marginLeft: "48px" }}>
                            <Text
                              style={{ fontSize: "16px", lineHeight: "1.6" }}
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
                                {getOptions(question).map(
                                  (option, optionIndex) => {
                                    const optionLabel = String.fromCharCode(
                                      65 + optionIndex
                                    );

                                    // Check if this option is correct by comparing option letter with correctOption
                                    const isCorrect =
                                      question.isGraded &&
                                      optionLabel === question.correctOption;

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
                                        <Radio
                                          value={option}
                                          style={{ width: "100%" }}
                                        >
                                          <Text strong style={{ fontSize: "16px" }}>
                                            {optionLabel}
                                          </Text>
                                        </Radio>

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
                )}

                {/* Group Script Section */}
                {isGroupAnswered(groupQuestions) && (
                  <div>
                    <Divider />
                    <Button
                      type="link"
                      icon={
                        showGroupScript[groupId] ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )
                      }
                      onClick={() => toggleGroupScript(groupId)}
                      style={{ padding: 0, marginBottom: "12px" }}
                    >
                      {showGroupScript[groupId]
                        ? "Ẩn transcript & giải thích"
                        : "Hiển thị transcript & giải thích"}
                    </Button>

                    {showGroupScript[groupId] && (
                      <Space
                        direction="vertical"
                        size="medium"
                        style={{ width: "100%" }}
                      >
                        {/* Transcript */}
                        {groupQuestions[0].questionScript && (
                          <Alert
                            message="📄 Transcript"
                            description={
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: groupQuestions[0].questionScript,
                                }}
                              />
                            }
                            type="info"
                            showIcon
                          />
                        )}

                        {/* Translated Transcript */}
                        {groupQuestions[0].translatedQuestionScript && (
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
                                  __html:
                                    groupQuestions[0].translatedQuestionScript,
                                }}
                              />
                            }
                            type="success"
                            showIcon={false}
                          />
                        )}

                        {/* Explanations for each question */}
                        {groupQuestions.map(
                          (question, index) =>
                            question.questionExplanation && (
                              <Alert
                                key={index}
                                message={`💡 Giải thích câu ${
                                  getQuestionNumber(
                                    parseInt(groupId),
                                    index
                                  )
                                }`}
                                description={
                                  <div>
                                    <strong>Câu hỏi:</strong>{" "}
                                    {question.questionContent}
                                    <br />
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
                        {getQuestionNumber(parseInt(groupId), index)}
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

export default TestPart4;
