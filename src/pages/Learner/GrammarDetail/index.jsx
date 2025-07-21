import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Card,
  Typography,
  Button,
  Space,
  Spin,
  Alert,
  Row,
  Col,
  Progress,
  Tag,
  Badge,
  Divider,
  Radio,
  Breadcrumb,
  Statistic,
  Avatar,
  List,
  Empty,
  Tabs,
  Result,
  Tooltip,
} from "antd";
import {
  BookOpen,
  GraduationCap,
  Zap,
  ChevronRight,
  Check,
  X,
  RotateCcw,
  Award,
  Target,
  Clock,
  Brain,
  TrendingUp,
  FileText,
  Play,
  BookMarked,
  Home,
} from "lucide-react";
import { HomeOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";

// Import services
import grammarService from "../../../services/grammarService";
import grammarContentService from "../../../services/grammarContentService";
import grammarQuestionService from "../../../services/grammarQuestionService";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const GrammarDetail = () => {
  const { grammarId } = useParams();

  // States
  const [showTheory, setShowTheory] = useState(true);
  const [grammarName, setGrammarName] = useState("");
  const [grammarContents, setGrammarContents] = useState([]);
  const [grammars, setGrammars] = useState([]);
  const [questions, setQuestions] = useState([]);
  console.log("🚀 ~ GrammarDetail ~ questions:", questions);

  const [showExplanation, setShowExplanation] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    // Fetch all data
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get grammar details
        const grammarResponse = await grammarService.getById(grammarId);
        console.log("🚀 ~ fetchData ~ grammarResponse:", grammarResponse);

        setGrammarName(grammarResponse.grammarName);

        // Get all grammars for sidebar
        const grammarsResponse = await grammarService.getAllEnabled();
        console.log("🚀 ~ fetchData ~ grammarsResponse:", grammarsResponse);

        // Handle array response directly
        const grammarsData = Array.isArray(grammarsResponse)
          ? grammarsResponse
          : grammarsResponse.data || [];
        const formattedGrammars = grammarsData.map((g) => ({
          ...g,
          grammarId: g._id || g.grammarId, // Map _id to grammarId for compatibility
        }));
        setGrammars(formattedGrammars);

        // Get grammar contents
        const contentsResponse =
          await grammarContentService.getEnableGrammarContentsByGrammar(
            grammarId
          );
        console.log("🚀 ~ fetchData ~ contentsResponse:", contentsResponse);

        // Handle array response directly
        const contentsData = Array.isArray(contentsResponse)
          ? contentsResponse
          : contentsResponse.data || [];
        const formattedContents = contentsData.map((c) => ({
          ...c,
          contentId: c._id || c.contentId, // Map _id to contentId for compatibility
          title: c.title || "Nội dung ngữ pháp", // Ensure title exists
          content: c.content || "", // Ensure content exists
          status: c.grammarContentStatus || 1, // Map status
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        }));
        setGrammarContents(formattedContents);

        // Get grammar questions
        const questionsResponse =
          await grammarQuestionService.getEnableGrammarQuestionsByGrammar(
            grammarId
          );
        console.log("🚀 ~ fetchData ~ questionsResponse:", questionsResponse);

        // Handle array response directly
        const questionsData = Array.isArray(questionsResponse)
          ? questionsResponse
          : questionsResponse.data || [];
        const formattedQuestions = questionsData.map((q) => ({
          ...q,
          questionId: q._id || q.questionId, // Map _id to questionId for compatibility
          explanation: q.questionExplanation || q.explanation || "", // Map questionExplanation to explanation
          selectedOption: null,
          isGraded: false,
        }));
        setQuestions(formattedQuestions);

        // Initialize explanation visibility state
        const initialExplanationState = {};
        formattedQuestions.forEach((_, index) => {
          initialExplanationState[index] = false;
        });
        setShowExplanation(initialExplanationState);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu ngữ pháp:", error);
        toast.error("Không thể tải dữ liệu ngữ pháp. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [grammarId]);

  const getOptions = (question) => {
    return [
      question.optionA,
      question.optionB,
      question.optionC,
      question.optionD,
    ].filter(Boolean);
  };

  const getCorrectOptionValue = (question) => {
    switch (question.correctOption) {
      case "A":
        return question.optionA;
      case "B":
        return question.optionB;
      case "C":
        return question.optionC;
      case "D":
        return question.optionD;
      default:
        return null;
    }
  };

  const clearSelection = (question) => {
    const questionId = question._id || question.questionId;
    setQuestions((prev) =>
      prev.map((q) =>
        (q._id || q.questionId) === questionId
          ? { ...q, selectedOption: null }
          : q
      )
    );
  };

  const toggleExplanation = (index) => {
    setShowExplanation({
      ...showExplanation,
      [index]: !showExplanation[index],
    });
  };

  const gradeQuestion = (question) => {
    const questionId = question._id || question.questionId;
    setQuestions((prev) =>
      prev.map((q) =>
        (q._id || q.questionId) === questionId ? { ...q, isGraded: true } : q
      )
    );
  };

  const gradeAllQuestions = () => {
    setQuestions((prev) =>
      prev.map((q) => ({
        ...q,
        isGraded: true,
      }))
    );
  };

  const resetQuiz = () => {
    setQuestions((prev) =>
      prev.map((q) => ({
        ...q,
        selectedOption: null,
        isGraded: false,
      }))
    );
    // Reset explanation visibility
    const initialExplanationState = {};
    questions.forEach((_, index) => {
      initialExplanationState[index] = false;
    });
    setShowExplanation(initialExplanationState);
  };

  const handleOptionSelect = (question, option) => {
    if (question.isGraded || isSelecting) return;

    setIsSelecting(true);
    const questionId = question._id || question.questionId;

    setQuestions((prev) =>
      prev.map((q) =>
        (q._id || q.questionId) === questionId
          ? { ...q, selectedOption: option }
          : q
      )
    );

    setTimeout(() => setIsSelecting(false), 300);
  };

  // Calculate score
  const calculateScore = () => {
    const gradedQuestions = questions.filter((q) => q.isGraded);
    const correctAnswers = gradedQuestions.filter(
      (q) => q.selectedOption === getCorrectOptionValue(q)
    );
    return {
      score: correctAnswers.length,
      total: gradedQuestions.length,
    };
  };

  const score = calculateScore();

  // Handle loading state
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <Card
          style={{
            textAlign: "center",
            minWidth: "300px",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text>Đang tải dữ liệu ngữ pháp...</Text>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        padding: "24px 0",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 24px" }}>
        {/* Breadcrumb */}
        <Breadcrumb
          style={{ marginBottom: 24 }}
          items={[
            {
              href: "/learner",
              title: <HomeOutlined />,
            },
            {
              href: "/learner/grammar",
              title: "Ngữ pháp",
            },
            {
              title: grammarName || "Chi tiết ngữ pháp",
            },
          ]}
        />

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Title
            level={1}
            style={{
              fontSize: "42px",
              marginBottom: 16,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            <GraduationCap
              style={{
                width: "42px",
                height: "42px",
                marginRight: "16px",
                color: "#667eea",
              }}
            />
            {grammarName}
          </Title>
          <Paragraph
            style={{
              fontSize: "16px",
              color: "#666",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            Học ngữ pháp tiếng Anh hiệu quả với lý thuyết và bài tập thực hành
          </Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            {/* Mode Selection with Tabs */}
            <Card
              style={{
                borderRadius: "16px",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                marginBottom: 24,
              }}
            >
              <Tabs
                activeKey={showTheory ? "theory" : "quiz"}
                onChange={(key) => setShowTheory(key === "theory")}
                size="large"
                style={{ margin: "-8px" }}
                items={[
                  {
                    key: "theory",
                    label: (
                      <Space>
                        <BookOpen style={{ width: "18px", height: "18px" }} />
                        Lý thuyết
                      </Space>
                    ),
                    children: null,
                  },
                  {
                    key: "quiz",
                    label: (
                      <Space>
                        <Brain style={{ width: "18px", height: "18px" }} />
                        Trắc nghiệm
                        {questions.length > 0 && (
                          <Badge
                            count={questions.length}
                            style={{ backgroundColor: "#667eea" }}
                          />
                        )}
                      </Space>
                    ),
                    children: null,
                  },
                ]}
              />
            </Card>

            {/* Content Section */}
            {showTheory ? (
              <Card
                style={{
                  borderRadius: "16px",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                }}
              >
                {grammarContents.length > 0 ? (
                  <div>
                    <div style={{ marginBottom: 32 }}>
                      <Title level={3} style={{ marginBottom: 8 }}>
                        <BookMarked
                          style={{
                            width: "24px",
                            height: "24px",
                            marginRight: "8px",
                          }}
                        />
                        {grammarName} - Lý thuyết
                      </Title>
                      <Text type="secondary" style={{ fontSize: "16px" }}>
                        Tìm hiểu chi tiết về {grammarName} với các khái niệm,
                        quy tắc và ví dụ thực tế
                      </Text>
                    </div>

                    <Space
                      direction="vertical"
                      style={{ width: "100%" }}
                      size="large"
                    >
                      {grammarContents.map((content, index) => (
                        <Card
                          key={content.contentId}
                          type="inner"
                          style={{
                            borderRadius: "12px",
                            border: "1px solid #f0f0f0",
                          }}
                          title={
                            <Space>
                              <Avatar
                                style={{
                                  backgroundColor: "#667eea",
                                  color: "white",
                                }}
                              >
                                {index + 1}
                              </Avatar>
                              <Text strong style={{ fontSize: "18px" }}>
                                {content.title}
                              </Text>
                            </Space>
                          }
                        >
                          <div
                            style={{
                              fontSize: "16px",
                              lineHeight: 1.8,
                              color: "#333",
                            }}
                            dangerouslySetInnerHTML={{
                              __html: content.content
                                .replace(
                                  /<h([1-6])>/g,
                                  (match, level) =>
                                    `<h${Math.min(parseInt(level) + 2, 6)}>`
                                )
                                .replace(
                                  /<\/h([1-6])>/g,
                                  (match, level) =>
                                    `</h${Math.min(parseInt(level) + 2, 6)}>`
                                ),
                            }}
                          />
                        </Card>
                      ))}
                    </Space>
                  </div>
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <div style={{ textAlign: "center" }}>
                        <Title level={4} style={{ color: "#999" }}>
                          Chưa có nội dung lý thuyết
                        </Title>
                        <Text type="secondary" style={{ fontSize: "16px" }}>
                          Nội dung lý thuyết cho{" "}
                          <Text strong>{grammarName}</Text> sẽ được cập nhật sớm
                        </Text>
                      </div>
                    }
                    style={{ padding: "60px 0" }}
                  />
                )}
              </Card>
            ) : (
              <div>
                {questions.length > 0 ? (
                  <Space
                    direction="vertical"
                    style={{ width: "100%" }}
                    size="large"
                  >
                    {questions.map((question, index) => (
                      <Card
                        key={index}
                        style={{
                          borderRadius: "16px",
                          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                          border: question.isGraded
                            ? question.selectedOption ===
                              getCorrectOptionValue(question)
                              ? "2px solid #52c41a"
                              : "2px solid #ff4d4f"
                            : "1px solid #f0f0f0",
                        }}
                      >
                        <div style={{ marginBottom: 24 }}>
                          <Space style={{ marginBottom: 16 }}>
                            <Avatar
                              style={{
                                backgroundColor: "#667eea",
                                color: "white",
                                fontSize: "16px",
                              }}
                            >
                              {index + 1}
                            </Avatar>
                            <Tag color="blue">Câu hỏi {index + 1}</Tag>
                            {question.isGraded && (
                              <Tag
                                color={
                                  question.selectedOption ===
                                  getCorrectOptionValue(question)
                                    ? "success"
                                    : "error"
                                }
                              >
                                {question.selectedOption ===
                                getCorrectOptionValue(question)
                                  ? "Chính xác"
                                  : "Sai"}
                              </Tag>
                            )}
                          </Space>

                          <Title
                            level={4}
                            style={{
                              marginBottom: 0,
                              fontSize: "18px",
                              lineHeight: 1.6,
                            }}
                          >
                            {question.questionContent}
                          </Title>
                        </div>

                        <Radio.Group
                          value={question.selectedOption}
                          onChange={(e) =>
                            handleOptionSelect(question, e.target.value)
                          }
                          disabled={question.isGraded}
                          style={{ width: "100%" }}
                        >
                          <Space
                            direction="vertical"
                            style={{ width: "100%" }}
                            size="middle"
                          >
                            {getOptions(question).map((option, optionIndex) => (
                              <Card
                                key={optionIndex}
                                size="small"
                                style={{
                                  cursor: question.isGraded
                                    ? "default"
                                    : "pointer",
                                  border: "1px solid #f0f0f0",
                                  borderRadius: "8px",
                                  backgroundColor: question.isGraded
                                    ? option === getCorrectOptionValue(question)
                                      ? "#f6ffed"
                                      : option === question.selectedOption &&
                                        option !==
                                          getCorrectOptionValue(question)
                                      ? "#fff2f0"
                                      : "#fafafa"
                                    : question.selectedOption === option
                                    ? "#e6f7ff"
                                    : "white",
                                  borderColor: question.isGraded
                                    ? option === getCorrectOptionValue(question)
                                      ? "#52c41a"
                                      : option === question.selectedOption &&
                                        option !==
                                          getCorrectOptionValue(question)
                                      ? "#ff4d4f"
                                      : "#f0f0f0"
                                    : question.selectedOption === option
                                    ? "#1890ff"
                                    : "#f0f0f0",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <Radio
                                    value={option}
                                    style={{ fontSize: "16px" }}
                                  >
                                    {option}
                                  </Radio>
                                  {question.isGraded &&
                                    option ===
                                      getCorrectOptionValue(question) && (
                                      <Check
                                        style={{
                                          width: "20px",
                                          height: "20px",
                                          color: "#52c41a",
                                        }}
                                      />
                                    )}
                                  {question.isGraded &&
                                    option === question.selectedOption &&
                                    option !==
                                      getCorrectOptionValue(question) && (
                                      <X
                                        style={{
                                          width: "20px",
                                          height: "20px",
                                          color: "#ff4d4f",
                                        }}
                                      />
                                    )}
                                </div>
                              </Card>
                            ))}
                          </Space>
                        </Radio.Group>

                        {question.isGraded && (
                          <div style={{ marginTop: 24 }}>
                            <Alert
                              message={
                                question.selectedOption ===
                                getCorrectOptionValue(question)
                                  ? "Chính xác!"
                                  : "Không chính xác"
                              }
                              type={
                                question.selectedOption ===
                                getCorrectOptionValue(question)
                                  ? "success"
                                  : "error"
                              }
                              showIcon
                              style={{ marginBottom: 16 }}
                            />

                            {showExplanation[index] && question.explanation && (
                              <Card
                                type="inner"
                                title={
                                  <Space>
                                    <FileText
                                      style={{ width: "16px", height: "16px" }}
                                    />
                                    Giải thích chi tiết
                                  </Space>
                                }
                                style={{ marginBottom: 16 }}
                              >
                                <div
                                  style={{ fontSize: "15px", lineHeight: 1.6 }}
                                  dangerouslySetInnerHTML={{
                                    __html: question.explanation,
                                  }}
                                />
                              </Card>
                            )}

                            <Button
                              type={
                                showExplanation[index] ? "default" : "primary"
                              }
                              onClick={() => toggleExplanation(index)}
                              style={{ borderRadius: "6px" }}
                            >
                              {showExplanation[index]
                                ? "Ẩn giải thích"
                                : "Xem giải thích"}
                            </Button>
                          </div>
                        )}

                        {!question.isGraded && question.selectedOption && (
                          <div style={{ marginTop: 24 }}>
                            <Space>
                              <Button
                                type="primary"
                                onClick={() => gradeQuestion(question)}
                                style={{ borderRadius: "6px" }}
                              >
                                <Target
                                  style={{
                                    width: "16px",
                                    height: "16px",
                                    marginRight: "4px",
                                  }}
                                />
                                Kiểm tra câu trả lời
                              </Button>
                              <Button
                                onClick={() => clearSelection(question)}
                                style={{ borderRadius: "6px" }}
                              >
                                <RotateCcw
                                  style={{
                                    width: "16px",
                                    height: "16px",
                                    marginRight: "4px",
                                  }}
                                />
                                Xóa lựa chọn
                              </Button>
                            </Space>
                          </div>
                        )}
                      </Card>
                    ))}

                    {questions.length > 0 &&
                      questions.some(
                        (q) => q.selectedOption && !q.isGraded
                      ) && (
                        <div style={{ textAlign: "center", margin: "32px 0" }}>
                          <Button
                            type="primary"
                            size="large"
                            onClick={gradeAllQuestions}
                            style={{
                              borderRadius: "8px",
                              padding: "12px 48px",
                              fontSize: "16px",
                              height: "auto",
                            }}
                          >
                            <Brain
                              style={{
                                width: "18px",
                                height: "18px",
                                marginRight: "8px",
                              }}
                            />
                            Kiểm tra tất cả các câu trả lời
                          </Button>
                        </div>
                      )}

                    {questions.some((q) => q.isGraded) && (
                      <Card
                        style={{
                          borderRadius: "16px",
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          color: "white",
                          textAlign: "center",
                        }}
                      >
                        <Title
                          level={2}
                          style={{ color: "white", marginBottom: 24 }}
                        >
                          <Award
                            style={{
                              width: "32px",
                              height: "32px",
                              marginRight: "12px",
                            }}
                          />
                          Kết quả bài làm
                        </Title>

                        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
                          <Col span={8}>
                            <div style={{ textAlign: "center" }}>
                              <div
                                style={{
                                  fontSize: "48px",
                                  fontWeight: "bold",
                                  marginBottom: 8,
                                }}
                              >
                                {Math.round((score.score / score.total) * 100)}%
                              </div>
                              <Text
                                style={{
                                  color: "rgba(255,255,255,0.8)",
                                  fontSize: "16px",
                                }}
                              >
                                Điểm số
                              </Text>
                            </div>
                          </Col>
                          <Col span={8}>
                            <div style={{ textAlign: "center" }}>
                              <div
                                style={{
                                  fontSize: "32px",
                                  fontWeight: "bold",
                                  marginBottom: 8,
                                  color: "#52c41a",
                                }}
                              >
                                {score.score}
                              </div>
                              <Text
                                style={{
                                  color: "rgba(255,255,255,0.8)",
                                  fontSize: "16px",
                                }}
                              >
                                Câu đúng
                              </Text>
                            </div>
                          </Col>
                          <Col span={8}>
                            <div style={{ textAlign: "center" }}>
                              <div
                                style={{
                                  fontSize: "32px",
                                  fontWeight: "bold",
                                  marginBottom: 8,
                                  color: "#ff4d4f",
                                }}
                              >
                                {score.total - score.score}
                              </div>
                              <Text
                                style={{
                                  color: "rgba(255,255,255,0.8)",
                                  fontSize: "16px",
                                }}
                              >
                                Câu sai
                              </Text>
                            </div>
                          </Col>
                        </Row>

                        <Button
                          size="large"
                          onClick={resetQuiz}
                          style={{
                            borderRadius: "8px",
                            backgroundColor: "white",
                            color: "#667eea",
                            border: "none",
                            padding: "12px 32px",
                            fontSize: "16px",
                            height: "auto",
                          }}
                        >
                          <RotateCcw
                            style={{
                              width: "18px",
                              height: "18px",
                              marginRight: "8px",
                            }}
                          />
                          Làm lại bài trắc nghiệm
                        </Button>
                      </Card>
                    )}
                  </Space>
                ) : (
                  <Card
                    style={{
                      borderRadius: "16px",
                      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <div style={{ textAlign: "center" }}>
                          <Title level={4} style={{ color: "#999" }}>
                            Chưa có câu hỏi trắc nghiệm
                          </Title>
                          <Text type="secondary" style={{ fontSize: "16px" }}>
                            Câu hỏi trắc nghiệm cho{" "}
                            <Text strong>{grammarName}</Text> sẽ được cập nhật
                            sớm
                          </Text>
                        </div>
                      }
                      style={{ padding: "60px 0" }}
                    />
                  </Card>
                )}
              </div>
            )}
          </Col>

          {/* Enhanced Sidebar */}
          <Col xs={24} lg={8}>
            <Space direction="vertical" style={{ width: "100%" }} size="large">
              {/* Other Grammars */}
              <Card
                style={{
                  borderRadius: "16px",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                }}
              >
                <Title level={4} style={{ marginBottom: 16 }}>
                  <Zap
                    style={{
                      width: "20px",
                      height: "20px",
                      marginRight: "8px",
                      color: "#faad14",
                    }}
                  />
                  Ngữ pháp khác
                </Title>

                {grammars.length > 0 ? (
                  <List
                    dataSource={grammars}
                    renderItem={(grammar) => (
                      <List.Item style={{ padding: "8px 0", border: "none" }}>
                        <Link
                          to={`/learner/grammar/${
                            grammar._id || grammar.grammarId
                          }`}
                          style={{ textDecoration: "none", width: "100%" }}
                        >
                          <Card
                            hoverable
                            size="small"
                            style={{
                              borderRadius: "8px",
                              border:
                                (grammar._id || grammar.grammarId) === grammarId
                                  ? "2px solid #667eea"
                                  : "1px solid #f0f0f0",
                              backgroundColor:
                                (grammar._id || grammar.grammarId) === grammarId
                                  ? "#f0f2ff"
                                  : "white",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <Avatar
                                size="small"
                                style={{
                                  backgroundColor:
                                    (grammar._id || grammar.grammarId) ===
                                    grammarId
                                      ? "#667eea"
                                      : "#1890ff",
                                  marginRight: 12,
                                }}
                                icon={
                                  <BookOpen
                                    style={{ width: "12px", height: "12px" }}
                                  />
                                }
                              />
                              <div style={{ flex: 1 }}>
                                <Text
                                  strong
                                  style={{ fontSize: "14px", display: "block" }}
                                >
                                  {grammar.grammarName}
                                </Text>
                                {(grammar._id || grammar.grammarId) ===
                                  grammarId && (
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: "12px" }}
                                  >
                                    Đang học
                                  </Text>
                                )}
                              </div>
                              <ChevronRight
                                style={{
                                  width: "14px",
                                  height: "14px",
                                  color: "#1890ff",
                                  marginLeft: 8,
                                }}
                              />
                            </div>
                          </Card>
                        </Link>
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Chưa có ngữ pháp khác"
                    style={{ padding: "24px 0" }}
                  />
                )}
              </Card>

              {/* Quiz Progress */}
              {!showTheory && questions.length > 0 && (
                <Card
                  style={{
                    borderRadius: "16px",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <Title level={4} style={{ marginBottom: 16 }}>
                    <TrendingUp
                      style={{
                        width: "20px",
                        height: "20px",
                        marginRight: "8px",
                        color: "#52c41a",
                      }}
                    />
                    Tiến độ luyện tập
                  </Title>

                  <Space
                    direction="vertical"
                    style={{ width: "100%" }}
                    size="middle"
                  >
                    <Row gutter={16}>
                      <Col span={12}>
                        <Statistic
                          title="Tổng câu hỏi"
                          value={questions.length}
                          valueStyle={{ fontSize: "20px", color: "#667eea" }}
                          prefix={
                            <Brain style={{ width: "16px", height: "16px" }} />
                          }
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="Đã làm"
                          value={questions.filter((q) => q.isGraded).length}
                          valueStyle={{ fontSize: "20px", color: "#1890ff" }}
                          prefix={
                            <Target style={{ width: "16px", height: "16px" }} />
                          }
                        />
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Statistic
                          title="Câu đúng"
                          value={score.score}
                          valueStyle={{ fontSize: "20px", color: "#52c41a" }}
                          prefix={
                            <Check style={{ width: "16px", height: "16px" }} />
                          }
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="Điểm số"
                          value={
                            score.total > 0
                              ? Math.round((score.score / score.total) * 100)
                              : 0
                          }
                          suffix="%"
                          valueStyle={{ fontSize: "20px", color: "#faad14" }}
                          prefix={
                            <Award style={{ width: "16px", height: "16px" }} />
                          }
                        />
                      </Col>
                    </Row>

                    {score.total > 0 && (
                      <div>
                        <Text
                          style={{
                            display: "block",
                            marginBottom: 8,
                            fontSize: "14px",
                            color: "#666",
                          }}
                        >
                          Tỉ lệ hoàn thành
                        </Text>
                        <Progress
                          percent={Math.round(
                            (score.score / score.total) * 100
                          )}
                          strokeColor={{
                            "0%": "#667eea",
                            "100%": "#764ba2",
                          }}
                          strokeWidth={8}
                          style={{ marginBottom: 0 }}
                        />
                      </div>
                    )}
                  </Space>
                </Card>
              )}
            </Space>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default GrammarDetail;
