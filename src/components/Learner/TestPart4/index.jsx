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
  Play,
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
  console.log("🎯 TestPart4 Component Debug:", {
    questionsCount: questions?.length || 0,
    hasGetAudioUrl: typeof getAudioUrl === "function",
    firstQuestion: questions?.[0] || null,
    timestamp: new Date().toISOString(),
  });

  // Nhóm các câu hỏi theo groupId
  const groupQuestionsByGroupId = (questions) => {
    const grouped = {};
    for (const question of questions) {
      // Debug question structure
      console.log("🔍 Question structure:", {
        questionId: question._id,
        questionGroup: question.questionGroup,
        questionGroupType: typeof question.questionGroup,
        hasGroupAudio:
          question.questionGroup?.groupAudio || "No groupAudio found",
      });

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
      groupQuestions[0].questionGroup.groupImage ||
      groupQuestions[0].questionGroup.groupPassage
    );
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
                  <Volume2 size={20} color="#1890ff" />
                  <div style={{ flex: 1 }}>
                    {/* Debug logs before audio element */}
                    {(() => {
                      const groupAudio =
                        groupQuestions[0].questionGroup?.groupAudio ||
                        groupQuestions[0].questionAudio ||
                        "No audio";
                      const audioUrl = getAudioUrl(groupAudio);
                      console.log("🎵 TestPart4 Audio Debug:", {
                        groupId,
                        questionGroup: groupQuestions[0].questionGroup,
                        groupAudio,
                        questionAudio: groupQuestions[0].questionAudio,
                        audioUrl,
                        hasAudio: !!audioUrl,
                      });
                      return null;
                    })()}

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
                          src={getImageUrl(
                            groupQuestions[0].questionGroup.groupImage
                          )}
                          alt="TOEIC Listening"
                          style={{
                            maxWidth: "100%",
                            borderRadius: "8px",
                          }}
                          preview={{
                            mask: <Eye size={20} />,
                          }}
                        />
                      </div>
                    </Col>

                    {/* Questions Column */}
                    <Col xs={24} md={12}>
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
                              backgroundColor: "#fafafa",
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
                                    backgroundColor: "#1890ff",
                                    borderColor: "#1890ff",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {calculateQuestionNumber(
                                    parseInt(groupId),
                                    index
                                  ) + 1}
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
                                style={{ fontSize: "14px", marginLeft: "32px" }}
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
                                            }}
                                          >
                                            <Radio
                                              value={option}
                                              style={{ width: "100%" }}
                                            >
                                              <Space align="start" size="small">
                                                <Text
                                                  strong
                                                  style={{ fontSize: "12px" }}
                                                >
                                                  {optionLabel}.
                                                </Text>
                                                <Text
                                                  style={{ fontSize: "12px" }}
                                                >
                                                  {option}
                                                </Text>
                                              </Space>
                                            </Radio>

                                            {isCorrect && (
                                              <Check
                                                size={16}
                                                color="#52c41a"
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
                                                color="#ff4d4f"
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
                          backgroundColor: "#fafafa",
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
                                backgroundColor: "#1890ff",
                                borderColor: "#1890ff",
                                fontWeight: "bold",
                              }}
                            >
                              {calculateQuestionNumber(
                                parseInt(groupId),
                                index
                              ) + 1}
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
                                        }}
                                      >
                                        <Radio
                                          value={option}
                                          style={{ width: "100%" }}
                                        >
                                          <Space align="start">
                                            <Text strong>{optionLabel}.</Text>
                                            <Text>{option}</Text>
                                          </Space>
                                        </Radio>

                                        {isCorrect && (
                                          <Check
                                            size={20}
                                            color="#52c41a"
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
                                            color="#ff4d4f"
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
                        {calculateQuestionNumber(parseInt(groupId), index) + 1}
                      </Button>
                    ))
                )}
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
