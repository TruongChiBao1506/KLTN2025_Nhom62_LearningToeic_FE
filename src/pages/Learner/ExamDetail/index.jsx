import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Layout,
  Card,
  Button,
  Radio,
  Progress,
  Typography,
  Space,
  Breadcrumb,
  Statistic,
  Row,
  Col,
  Badge,
  Alert,
  Spin,
  Modal,
  Image,
  Divider,
  Tabs,
  Tag,
  Tooltip,
} from "antd";
import {
  Home,
  FileText,
  ArrowLeft,
  Clock,
  AlertCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Flag,
  Save,
  Volume2,
  PlayCircle,
  Trophy,
  Target,
  BookOpen,
  RotateCcw,
  CheckCircle,
  XCircle,
  Timer,
  TrendingUp,
  X,
  PenTool,
} from "lucide-react";
import learnerExamService from "../../../services/learnerExamService";
import AudioPlayer from "../../../components/AudioPlayer";
import audioRegistry from "../../../utils/AudioRegistry";
import TextHighlighter from "../../../components/TextHighlighter/TextHighlighter";

// === COMPREHENSIVE RESIZEOBSERVER ERROR SUPPRESSION ===
const suppressResizeObserverErrors = () => {
  if (typeof window !== "undefined") {
    // Store original console methods
    if (!window._originalConsoleError) {
      window._originalConsoleError = console.error;
    }
    if (!window._originalConsoleWarn) {
      window._originalConsoleWarn = console.warn;
    }

    // Override console.error with comprehensive filtering
    console.error = (...args) => {
      const message = args.join(" ").toLowerCase();
      if (
        message.includes("resizeobserver") ||
        message.includes("script error") ||
        message.includes("non-passive event") ||
        message.includes("passive event listener")
      ) {
        return; // Suppress these errors completely
      }
      window._originalConsoleError.apply(console, args);
    };

    // Override console.warn as well
    console.warn = (...args) => {
      const message = args.join(" ").toLowerCase();
      if (
        message.includes("resizeobserver") ||
        message.includes("script error")
      ) {
        return; // Suppress these warnings
      }
      window._originalConsoleWarn.apply(console, args);
    };

    // Comprehensive global error handler
    const globalErrorHandler = (e) => {
      const message = (e.message || e.error?.message || "").toLowerCase();
      if (
        message.includes("resizeobserver") ||
        message.includes("script error")
      ) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
    };

    // Remove existing listeners first to prevent duplicates
    window.removeEventListener("error", globalErrorHandler, true);
    window.removeEventListener("unhandledrejection", globalErrorHandler, true);

    // Add comprehensive error listeners
    window.addEventListener("error", globalErrorHandler, true);
    window.addEventListener(
      "unhandledrejection",
      (e) => {
        const message = (e.reason?.message || e.reason || "")
          .toString()
          .toLowerCase();
        if (
          message.includes("resizeobserver") ||
          message.includes("script error")
        ) {
          e.preventDefault();
          return false;
        }
      },
      true
    );

    // Monkey patch ResizeObserver if it exists
    if (window.ResizeObserver) {
      const OriginalResizeObserver = window.ResizeObserver;
      window.ResizeObserver = class extends OriginalResizeObserver {
        constructor(callback) {
          const wrappedCallback = (entries, observer) => {
            try {
              callback(entries, observer);
            } catch (err) {
              // Silently ignore ResizeObserver callback errors
              if (!err.message?.toLowerCase().includes("resizeobserver")) {
                throw err;
              }
            }
          };
          super(wrappedCallback);
        }
      };
    }
  }
};

// Initialize comprehensive error suppression immediately
suppressResizeObserverErrors();

// Re-apply suppression after DOM events
if (typeof window !== "undefined") {
  document.addEventListener("DOMContentLoaded", suppressResizeObserverErrors);
  window.addEventListener("load", suppressResizeObserverErrors);
}
// === END RESIZEOBSERVER ERROR SUPPRESSION ===

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const ExamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState([]);
  const [remainingTime, setRemainingTime] = useState(null);
  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examResult, setExamResult] = useState(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [savedProgress, setSavedProgress] = useState(false);
  const timerRef = useRef(null);

  const fetchExam = useCallback(async () => {
    try {
      setLoading(true);
      const response = await learnerExamService.getExamById(id);
      console.log("🚀 ~ fetchExam ~ response:", response);
      console.log("🚀 ~ fetchExam ~ response.questions:", response.questions);
      console.log(
        "🚀 ~ fetchExam ~ questions length:",
        response.questions?.length
      );

      // Map backend response to expected format
      const examData = {
        id: response._id,
        name: response.examName,
        description:
          response.examType === 1
            ? "Complete TOEIC simulation test with all sections"
            : "Quick practice test focusing on specific skills",
        type: response.examType === 1 ? "full-test" : "mini-test",
        difficulty: response.examType === 1 ? "Medium" : "Easy",
        duration:
          response.examDurationMinutes || (response.examType === 1 ? 120 : 60),
        questions: (response.questions || []).map((q, index) => ({
          id: q._id,
          text: q.questionContent || `Question ${index + 1}`,
          options: [
            { id: "A", text: q.optionA || "Option A" },
            { id: "B", text: q.optionB || "Option B" },
            { id: "C", text: q.optionC || "Option C" },
            { id: "D", text: q.optionD || "Option D" },
          ].filter(
            (option) => option.text && option.text !== `Option ${option.id}`
          ), // Remove empty/default options
          correctAnswer: q.correctOption || q.correctAnswer,
          explanation:
            q.questionExplanation ||
            q.explanation ||
            q._originalData?.explanation,
          questionType: q.questionType,
          image: q.questionImage
            ? `http://localhost:5000/images/${q.questionImage}`
            : q.imageUrl ||
              q.image ||
              (q.imagePath ? `http://localhost:5000/${q.imagePath}` : null),
          audio: q.questionAudio
            ? `http://localhost:5000/audios/${q.questionAudio}`
            : q.audioUrl ||
              q.audio ||
              (q.audioPath ? `http://localhost:5000/${q.audioPath}` : null),
          _originalData: q,
        })),
        status: "not-started", // Default status
        _originalData: response,
      };

      console.log("🚀 ~ fetchExam ~ examData.questions:", examData.questions);
      console.log("🚀 ~ fetchExam ~ mapped exam data:", examData);

      setExam(examData);

      // Check if exam has questions
      if (!examData.questions || examData.questions.length === 0) {
        console.warn("⚠️ Exam has no questions!");
        setError(
          "Bài thi này chưa có câu hỏi nào. Vui lòng liên hệ quản trị viên."
        );
        setLoading(false);
        return;
      }

      // For now, set default time since we don't have progress tracking yet
      setRemainingTime(examData.duration * 60); // Convert minutes to seconds

      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi tải bài thi:", error);
      setError("Không thể tải bài thi. Vui lòng thử lại sau.");
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchExam();

    // Initialize audio registry
    audioRegistry.init();

    // Make sure audio is fully stopped when leaving exam
    return () => {
      audioRegistry.stopAll();
    };
  }, [fetchExam]);

  // Stop any playing audio when question changes
  useEffect(() => {
    // Stop all audio when changing questions
    console.log(
      "🔇 Question index changed to:",
      currentQuestionIndex,
      "- stopping all audio"
    );
    try {
      // Try both methods to ensure audio stops
      if (window.audioRegistry) {
        window.audioRegistry.stopAll();
      }
      if (window.stopAllAudio) {
        window.stopAllAudio();
      }
    } catch (e) {
      console.error("Error stopping audio:", e);
    }
  }, [currentQuestionIndex]);

  const startExam = () => {
    setExamStarted(true);
    document.title = `Đang làm bài thi: ${exam ? exam.name : "Bài thi TOEIC"}`;
    // Bắt đầu đếm ngược thời gian
    timerRef.current = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime <= 1) {
          submitExam();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  }; // Dọn dẹp bộ đếm thời gian khi component bị hủy
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerSelect = (questionId, answer) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const toggleFlagQuestion = (questionId) => {
    setFlaggedQuestions((prev) => {
      if (prev.includes(questionId)) {
        return prev.filter((id) => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  };

  const goToNextQuestion = () => {
    if (exam.questions && currentQuestionIndex < exam.questions.length - 1) {
      // Stop audio before changing question
      console.log("🔄 Moving to next question, stopping all audio");
      try {
        // Try both methods to ensure audio stops
        if (window.audioRegistry) {
          window.audioRegistry.stopAll();
        }
        if (window.stopAllAudio) {
          window.stopAllAudio();
        }
      } catch (e) {
        console.error("Error stopping audio:", e);
      }
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      // Stop audio before changing question
      console.log("🔄 Moving to previous question, stopping all audio");
      try {
        // Try both methods to ensure audio stops
        if (window.audioRegistry) {
          window.audioRegistry.stopAll();
        }
        if (window.stopAllAudio) {
          window.stopAllAudio();
        }
      } catch (e) {
        console.error("Error stopping audio:", e);
      }
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToQuestion = (index) => {
    if (exam.questions && index >= 0 && index < exam.questions.length) {
      // Stop audio before changing question
      console.log(
        `🔄 Directly navigating to question ${index}, stopping all audio`
      );
      try {
        // Try both methods to ensure audio stops
        if (window.audioRegistry) {
          window.audioRegistry.stopAll();
        }
        if (window.stopAllAudio) {
          window.stopAllAudio();
        }
      } catch (e) {
        console.error("Error stopping audio:", e);
      }
      setCurrentQuestionIndex(index);
    }
  };

  const saveProgress = async () => {
    try {
      await learnerExamService.saveProgress(
        id,
        userAnswers,
        exam.duration * 60 - remainingTime,
        flaggedQuestions
      );
      setSavedProgress(true);
      // Hiển thị thông báo đã lưu tạm thời
      setTimeout(() => {
        setSavedProgress(false);
      }, 3000);
    } catch (error) {
      console.error("Lỗi khi lưu tiến trình:", error);
    }
  };
  const submitExam = async () => {
    // Dừng bộ đếm thời gian
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    try {
      setLoading(true);

      // Convert userAnswers object to array format expected by backend
      const answersArray = Object.entries(userAnswers).map(
        ([questionId, selectedOption]) => ({
          questionId,
          selectedOption,
          timeSpent: 60, // Default time spent per question
        })
      );

      console.log("Sending answers array:", answersArray);

      const response = await learnerExamService.submitExam(id, answersArray);
      console.log("✅ Submit response:", response);

      setExamSubmitted(true);
      // Map backend response to frontend expected format
      const resultData = {
        scores: response.scores || {
          listening: 0,
          reading: 0,
          total: 0,
        },
        details: response.details || {
          correct: 0,
          wrong: 0,
          skipped: 0,
          listeningCorrect: 0,
          readingCorrect: 0,
        },
        userExamId: response.userExamId,
        message: response.message,
        // Calculate additional metrics for UI
        totalQuestions: exam.questions.length,
        percentage: Math.round(
          ((response.details?.correct || 0) * 100) / exam.questions.length
        ),
        correctCount: response.details?.correct || 0,
        incorrectCount: response.details?.wrong || 0,
        unansweredCount: response.details?.skipped || 0,
        listeningScore: response.scores?.listening || 0,
        readingScore: response.scores?.reading || 0,
        totalScore: response.scores?.total || 0,
        listeningCorrect: response.details?.listeningCorrect || 0,
        readingCorrect: response.details?.readingCorrect || 0,
        timeSpent: exam.duration * 60 - remainingTime, // Calculate actual time spent
      };

      setExamResult(resultData);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi nộp bài thi:", error);
      setError("Không thể nộp bài thi. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  if (loading && !exam) {
    return (
      <Content
        style={{
          padding: "24px",
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Space direction="vertical" align="center" size="large">
          <Spin size="large" />
          <Text type="secondary" style={{ fontSize: "16px" }}>
            Đang tải bài thi...
          </Text>
        </Space>
      </Content>
    );
  }

  if (error) {
    return (
      <Content style={{ padding: "24px" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Alert
            message="Lỗi tải bài thi"
            description={error}
            type="error"
            showIcon
            icon={<AlertCircle size={20} />}
          />
          <div style={{ textAlign: "center" }}>
            <Link to="/learner/exams">
              <Button type="primary" icon={<ArrowLeft size={16} />}>
                Quay lại Danh sách bài thi
              </Button>
            </Link>
          </div>
        </Space>
      </Content>
    );
  }

  if (!exam) {
    return (
      <Content style={{ padding: "24px" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Alert
            message="Không tìm thấy bài thi"
            description="Bài thi bạn tìm kiếm không tồn tại hoặc đã bị xóa."
            type="warning"
            showIcon
            icon={<HelpCircle size={20} />}
          />
          <div style={{ textAlign: "center" }}>
            <Link to="/learner/exams">
              <Button type="primary" icon={<ArrowLeft size={16} />}>
                Quay lại Danh sách bài thi
              </Button>
            </Link>
          </div>
        </Space>
      </Content>
    );
  }

  // Exam results view when exam is submitted
  if (examSubmitted && examResult) {
    return (
      <Content style={{ padding: "24px", background: "#f5f5f5" }}>
        {/* Breadcrumb */}
        <Breadcrumb style={{ marginBottom: "24px" }}>
          <Breadcrumb.Item>
            <Link to="/learner/dashboard">
              <Home size={16} style={{ marginRight: "4px" }} />
              Trang chủ
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/learner/exams">
              <FileText size={16} style={{ marginRight: "4px" }} />
              Bài thi thực hành
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{exam.name} - Kết quả</Breadcrumb.Item>
        </Breadcrumb>

        {/* Results Header */}
        <Card
          style={{
            marginBottom: "24px",
            textAlign: "center",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
          }}
        >
          <Space direction="vertical" size="large">
            <div style={{ color: "#fff" }}>
              <CheckCircle
                size={48}
                style={{ color: "#52c41a", marginBottom: "16px" }}
              />
              <Title level={2} style={{ color: "#fff", margin: 0 }}>
                Hoàn thành bài thi!
              </Title>
              <Title level={3} style={{ color: "#fff", margin: "8px 0" }}>
                {exam.name}
              </Title>
              <Text
                style={{ color: "rgba(255,255,255,0.8)", fontSize: "16px" }}
              >
                Kết quả chi tiết bài thi của bạn
              </Text>
            </div>
          </Space>
        </Card>

        {/* Overall Score Section */}
        <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
          <Col xs={24} md={8}>
            <Card
              style={{
                height: "100%",
                textAlign: "center",
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                border: "none",
              }}
            >
              <Space direction="vertical" size="large">
                <div style={{ position: "relative" }}>
                  <Progress
                    type="circle"
                    percent={examResult.percentage}
                    format={() => `${examResult.percentage}%`}
                    strokeWidth={8}
                    size={120}
                    strokeColor={{
                      "0%": "#108ee9",
                      "100%": "#87d068",
                    }}
                  />
                </div>
                <div style={{ color: "#fff" }}>
                  <Title level={4} style={{ color: "#fff", margin: "8px 0" }}>
                    {examResult.correctCount}/{examResult.totalQuestions}
                  </Title>
                  <Text style={{ color: "rgba(255,255,255,0.8)" }}>
                    Tổng điểm
                  </Text>
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={16}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card style={{ height: "100%" }}>
                  <Space
                    direction="vertical"
                    size="small"
                    style={{ width: "100%" }}
                  >
                    <Space align="center">
                      <Volume2 size={20} style={{ color: "#1890ff" }} />
                      <Title level={5} style={{ margin: 0 }}>
                        LISTENING
                      </Title>
                    </Space>
                    <Title level={3} style={{ margin: 0, color: "#1890ff" }}>
                      {examResult.listeningScore}/495
                    </Title>
                    <Progress
                      percent={(examResult.listeningScore / 495) * 100}
                      strokeColor="#1890ff"
                      showInfo={false}
                    />
                    <Text type="secondary">
                      Đúng: {examResult.listeningCorrect}/
                      {Math.floor(examResult.totalQuestions / 2)}
                    </Text>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card style={{ height: "100%" }}>
                  <Space
                    direction="vertical"
                    size="small"
                    style={{ width: "100%" }}
                  >
                    <Space align="center">
                      <BookOpen size={20} style={{ color: "#faad14" }} />
                      <Title level={5} style={{ margin: 0 }}>
                        READING
                      </Title>
                    </Space>
                    <Title level={3} style={{ margin: 0, color: "#faad14" }}>
                      {examResult.readingScore}/495
                    </Title>
                    <Progress
                      percent={(examResult.readingScore / 495) * 100}
                      strokeColor="#faad14"
                      showInfo={false}
                    />
                    <Text type="secondary">
                      Đúng: {examResult.readingCorrect}/
                      {Math.floor(examResult.totalQuestions / 2)}
                    </Text>
                  </Space>
                </Card>
              </Col>
              <Col span={24}>
                <Card
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                    textAlign: "center",
                  }}
                >
                  <Space direction="vertical">
                    <Title level={4} style={{ color: "#fff", margin: 0 }}>
                      Tổng điểm TOEIC:{" "}
                      <Badge
                        count={`${examResult.totalScore}/990`}
                        style={{ backgroundColor: "#52c41a", fontSize: "16px" }}
                      />
                    </Title>
                    <Text style={{ color: "rgba(255,255,255,0.8)" }}>
                      Điểm TOEIC ước tính dựa trên kết quả bài thi
                    </Text>
                  </Space>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
        {/* Detailed Statistics */}
        <Card style={{ marginBottom: "24px" }}>
          <Title level={4} style={{ marginBottom: "24px" }}>
            <TrendingUp
              size={20}
              style={{ marginRight: "8px", color: "#1890ff" }}
            />
            Thống kê chi tiết
          </Title>
          <Row gutter={[16, 16]}>
            <Col xs={12} md={6}>
              <Card
                size="small"
                style={{ background: "#f6ffed", border: "1px solid #b7eb8f" }}
              >
                <Statistic
                  title="Câu đúng"
                  value={examResult.correctCount}
                  prefix={
                    <CheckCircle size={20} style={{ color: "#52c41a" }} />
                  }
                  valueStyle={{ color: "#52c41a", fontWeight: "bold" }}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card
                size="small"
                style={{ background: "#fff2f0", border: "1px solid #ffccc7" }}
              >
                <Statistic
                  title="Câu sai"
                  value={examResult.incorrectCount}
                  prefix={<XCircle size={20} style={{ color: "#ff4d4f" }} />}
                  valueStyle={{ color: "#ff4d4f", fontWeight: "bold" }}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card
                size="small"
                style={{ background: "#fffbf0", border: "1px solid #ffe58f" }}
              >
                <Statistic
                  title="Chưa trả lời"
                  value={examResult.unansweredCount}
                  prefix={<HelpCircle size={20} style={{ color: "#faad14" }} />}
                  valueStyle={{ color: "#faad14", fontWeight: "bold" }}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card
                size="small"
                style={{ background: "#f0f9ff", border: "1px solid #91d5ff" }}
              >
                <Statistic
                  title="Thời gian làm bài"
                  value={formatTime(examResult.timeSpent)}
                  prefix={<Timer size={20} style={{ color: "#1890ff" }} />}
                  valueStyle={{ color: "#1890ff", fontWeight: "bold" }}
                />
              </Card>
            </Col>
          </Row>
        </Card>
        {/* Question Review Section */}
        <Card style={{ marginBottom: "24px" }}>
          <Title level={4} style={{ marginBottom: "16px" }}>
            <FileText
              size={20}
              style={{ marginRight: "8px", color: "#1890ff" }}
            />
            Xem lại câu trả lời
          </Title>
          <Text
            type="secondary"
            style={{ marginBottom: "24px", display: "block" }}
          >
            Xem lại các câu trả lời và giải thích cho từng câu hỏi.
          </Text>

          <Tabs
            defaultActiveKey="all"
            centered
            style={{ marginBottom: "24px" }}
            items={[
              {
                key: "all",
                label: `Tất cả (${examResult.totalQuestions})`,
              },
              {
                key: "correct",
                label: (
                  <span style={{ color: "#52c41a" }}>
                    Đúng ({examResult.correctCount})
                  </span>
                ),
              },
              {
                key: "incorrect",
                label: (
                  <span style={{ color: "#ff4d4f" }}>
                    Sai ({examResult.incorrectCount})
                  </span>
                ),
              },
              {
                key: "unanswered",
                label: (
                  <span style={{ color: "#faad14" }}>
                    Chưa trả lời ({examResult.unansweredCount})
                  </span>
                ),
              },
            ]}
          />

          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {exam.questions.map((question, index) => {
              const isCorrect =
                userAnswers[question.id] === question.correctAnswer;
              const isAnswered = userAnswers[question.id] !== undefined;
              const userAnswer = userAnswers[question.id];

              return (
                <Card
                  key={question.id}
                  size="small"
                  style={{
                    border: `2px solid ${
                      !isAnswered
                        ? "#faad14"
                        : isCorrect
                        ? "#52c41a"
                        : "#ff4d4f"
                    }`,
                    background: !isAnswered
                      ? "#fffbf0"
                      : isCorrect
                      ? "#f6ffed"
                      : "#fff2f0",
                  }}
                >
                  <Row gutter={[16, 16]}>
                    <Col span={2}>
                      <div style={{ textAlign: "center" }}>
                        <Badge
                          count={index + 1}
                          style={{
                            backgroundColor: !isAnswered
                              ? "#faad14"
                              : isCorrect
                              ? "#52c41a"
                              : "#ff4d4f",
                            fontSize: "14px",
                          }}
                        />
                        <div style={{ marginTop: "8px" }}>
                          {!isAnswered ? (
                            <HelpCircle
                              size={20}
                              style={{ color: "#faad14" }}
                            />
                          ) : isCorrect ? (
                            <CheckCircle
                              size={20}
                              style={{ color: "#52c41a" }}
                            />
                          ) : (
                            <XCircle size={20} style={{ color: "#ff4d4f" }} />
                          )}
                        </div>
                      </div>
                    </Col>
                    <Col span={22}>
                      <Space
                        direction="vertical"
                        size="middle"
                        style={{ width: "100%" }}
                      >
                        <div>
                          <Tag
                            color={
                              !isAnswered
                                ? "orange"
                                : isCorrect
                                ? "green"
                                : "red"
                            }
                          >
                            {!isAnswered
                              ? "Chưa trả lời"
                              : isCorrect
                              ? "Đúng"
                              : "Sai"}
                          </Tag>
                        </div>

                        {/* Question Content */}
                        <div>
                          <Title level={5} style={{ marginBottom: "16px" }}>
                            {question.text}
                          </Title>

                          {/* Display image if exists */}
                          {question.image && (
                            <div style={{ marginBottom: "16px" }}>
                              <Image
                                src={question.image}
                                alt="Question image"
                                style={{
                                  maxWidth: "300px",
                                  borderRadius: "8px",
                                }}
                                placeholder={
                                  <div
                                    style={{
                                      padding: "20px",
                                      textAlign: "center",
                                      background: "#f5f5f5",
                                    }}
                                  >
                                    Loading image...
                                  </div>
                                }
                              />
                            </div>
                          )}

                          {/* Display audio if exists */}
                          {question.audio && (
                            <div style={{ marginBottom: "16px" }}>
                              <AudioPlayer
                                src={question.audio}
                                questionId={question.id}
                                style={{ maxWidth: "300px" }}
                                key={`audio-${question.id}-${question.audio}`}
                              />
                            </div>
                          )}
                        </div>

                        {/* Options Review */}
                        <div>
                          <Space
                            direction="vertical"
                            size="small"
                            style={{ width: "100%" }}
                          >
                            {question.options.map((option, optionIndex) => {
                              const optionLetter = String.fromCharCode(
                                65 + optionIndex
                              );
                              const isUserSelected = userAnswer === option.id;
                              const isCorrectAnswer =
                                question.correctAnswer === option.id;

                              return (
                                <div
                                  key={option.id}
                                  style={{
                                    padding: "8px 12px",
                                    borderRadius: "6px",
                                    border: "1px solid",
                                    borderColor: isUserSelected
                                      ? isCorrectAnswer
                                        ? "#52c41a"
                                        : "#ff4d4f"
                                      : isCorrectAnswer
                                      ? "#52c41a"
                                      : "#d9d9d9",
                                    background: isUserSelected
                                      ? isCorrectAnswer
                                        ? "#f6ffed"
                                        : "#fff2f0"
                                      : isCorrectAnswer
                                      ? "#f6ffed"
                                      : "#fafafa",
                                  }}
                                >
                                  <Space>
                                    <Tag color="blue">{optionLetter}</Tag>
                                    <Text>{option.text}</Text>
                                    {isUserSelected &&
                                      (isCorrectAnswer ? (
                                        <CheckCircle
                                          size={16}
                                          style={{ color: "#52c41a" }}
                                        />
                                      ) : (
                                        <XCircle
                                          size={16}
                                          style={{ color: "#ff4d4f" }}
                                        />
                                      ))}
                                    {!isUserSelected && isCorrectAnswer && (
                                      <CheckCircle
                                        size={16}
                                        style={{ color: "#52c41a" }}
                                      />
                                    )}
                                  </Space>
                                </div>
                              );
                            })}
                          </Space>
                        </div>

                        {/* Explanation */}
                        {question.explanation && (
                          <Alert
                            message="Giải thích"
                            description={
                              <div id={`explanation-${question.id}`}>
                                <TextHighlighter
                                  containerId={`explanation-${question.id}`}
                                >
                                  {question.explanation}
                                </TextHighlighter>
                              </div>
                            }
                            type="info"
                            showIcon
                            icon={<HelpCircle size={16} />}
                            style={{ marginTop: "16px" }}
                          />
                        )}
                      </Space>
                    </Col>
                  </Row>
                </Card>
              );
            })}
          </Space>
        </Card>
        {/* Result Actions */}
        <Card
          style={{
            textAlign: "center",
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            border: "none",
          }}
        >
          <Space direction="vertical" size="large">
            <Space size="large" wrap>
              <Button
                type="primary"
                size="large"
                icon={<FileText size={16} />}
                onClick={() => navigate("/learner/exams")}
                style={{ background: "#1890ff", borderColor: "#1890ff" }}
              >
                Thêm bài thi luyện tập
              </Button>
              <Button
                type="default"
                size="large"
                icon={<RotateCcw size={16} />}
                onClick={() => window.location.reload()}
                style={{
                  background: "#52c41a",
                  borderColor: "#52c41a",
                  color: "#fff",
                }}
              >
                Làm lại bài thi
              </Button>
              <Button
                type="default"
                size="large"
                icon={<Home size={16} />}
                onClick={() => navigate("/learner/dashboard")}
              >
                Quay lại Trang chủ
              </Button>
            </Space>

            <Alert
              message={
                <Space>
                  <Trophy size={16} />
                  <strong>Chúc mừng!</strong>
                  Bạn đã hoàn thành bài thi với điểm số {examResult.totalScore}
                  /990.
                  {examResult.totalScore >= 600 && " Kết quả rất tốt!"}
                  {examResult.totalScore >= 800 && " Xuất sắc!"}
                  {examResult.totalScore < 600 &&
                    " Hãy tiếp tục luyện tập để cải thiện kết quả!"}
                </Space>
              }
              type="info"
              style={{ background: "rgba(255,255,255,0.9)", border: "none" }}
            />
          </Space>
        </Card>
      </Content>
    );
  }

  // Exam start/intro view when not yet started
  if (!examStarted) {
    return (
      <Content style={{ padding: "24px", background: "#f5f5f5" }}>
        {/* Breadcrumb */}
        <Breadcrumb style={{ marginBottom: "24px" }}>
          <Breadcrumb.Item>
            <Link to="/learner/dashboard">
              <Home size={16} style={{ marginRight: "4px" }} />
              Trang chủ
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/learner/exams">
              <FileText size={16} style={{ marginRight: "4px" }} />
              Bài thi thực hành
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{exam.name}</Breadcrumb.Item>
        </Breadcrumb>

        {/* Exam Introduction */}
        <Card
          style={{
            marginBottom: "24px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
          }}
        >
          <div style={{ textAlign: "center", color: "#fff" }}>
            <Title level={2} style={{ color: "#fff", marginBottom: "16px" }}>
              {exam.name}
            </Title>
            <Space size="large">
              <Badge
                count={
                  <Space>
                    <Clock size={16} />
                    {exam.duration} phút
                  </Space>
                }
                style={{
                  backgroundColor: "#1890ff",
                  fontSize: "14px",
                  padding: "4px 12px",
                  borderRadius: "16px",
                }}
              />
              <Badge
                count={
                  <Space>
                    <HelpCircle size={16} />
                    {exam.questions ? exam.questions.length : 0} câu hỏi
                  </Space>
                }
                style={{
                  backgroundColor: "#52c41a",
                  fontSize: "14px",
                  padding: "4px 12px",
                  borderRadius: "16px",
                }}
              />
            </Space>
          </div>
        </Card>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            {/* Description */}
            <Card
              title={
                <>
                  <BookOpen size={16} style={{ marginRight: "8px" }} />
                  Mô tả
                </>
              }
              style={{ height: "100%", marginBottom: "24px" }}
            >
              <Paragraph>{exam.description}</Paragraph>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            {/* Instructions */}
            <Card
              title={
                <>
                  <Target size={16} style={{ marginRight: "8px" }} />
                  Hướng dẫn
                </>
              }
              style={{ height: "100%", marginBottom: "24px" }}
            >
              <ul style={{ paddingLeft: "20px", margin: 0 }}>
                <li style={{ marginBottom: "8px" }}>
                  Bài thi này có {exam.questions ? exam.questions.length : 0}{" "}
                  câu hỏi.
                </li>
                <li style={{ marginBottom: "8px" }}>
                  Bạn có {exam.duration} phút để hoàn thành bài thi này.
                </li>
                <li style={{ marginBottom: "8px" }}>
                  Bạn có thể đánh dấu các câu hỏi để xem lại sau.
                </li>
                <li style={{ marginBottom: "8px" }}>
                  Bạn có thể lưu tiến trình và tiếp tục sau.
                </li>
                <li style={{ marginBottom: "8px" }}>
                  Sau khi nộp bài, bạn không thể thay đổi câu trả lời.
                </li>
              </ul>
            </Card>
          </Col>
        </Row>

        {savedProgress && (
          <Alert
            message="Tiếp tục bài thi"
            description="Bạn có một phiên đã lưu cho bài thi này. Bạn có thể tiếp tục từ nơi bạn đã dừng lại."
            type="info"
            showIcon
            style={{ marginBottom: "24px" }}
          />
        )}

        {/* Action Buttons */}
        <Card style={{ textAlign: "center" }}>
          <Space size="large">
            <Button
              type="primary"
              size="large"
              onClick={startExam}
              icon={<PlayCircle size={20} />}
              style={{ minWidth: "200px", height: "50px", fontSize: "16px" }}
            >
              {savedProgress ? "Tiếp tục bài thi" : "Bắt đầu bài thi"}
            </Button>
            <Link to="/learner/exams">
              <Button
                size="large"
                icon={<ArrowLeft size={16} />}
                style={{ minWidth: "120px", height: "50px" }}
              >
                Quay lại
              </Button>
            </Link>
          </Space>
        </Card>
      </Content>
    );
  }

  // Main exam taking view
  const currentQuestion = exam.questions[currentQuestionIndex];

  // If no questions available, show error
  if (!exam.questions || exam.questions.length === 0) {
    return (
      <Content style={{ padding: "24px" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Alert
            message="Không có câu hỏi"
            description="Bài thi này chưa có câu hỏi nào. Vui lòng thử lại sau."
            type="warning"
            showIcon
            icon={<AlertCircle size={20} />}
          />
          <div style={{ textAlign: "center" }}>
            <Link to="/learner/exams">
              <Button type="primary" icon={<ArrowLeft size={16} />}>
                Quay lại Danh sách bài thi
              </Button>
            </Link>
          </div>
        </Space>
      </Content>
    );
  }

  // If currentQuestion is not available, show error
  if (!currentQuestion) {
    return (
      <Content style={{ padding: "24px" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Alert
            message="Lỗi tải câu hỏi"
            description="Không thể tải câu hỏi hiện tại. Vui lòng thử lại."
            type="error"
            showIcon
            icon={<AlertCircle size={20} />}
          />
          <div style={{ textAlign: "center" }}>
            <Link to="/learner/exams">
              <Button type="primary" icon={<ArrowLeft size={16} />}>
                Quay lại Danh sách bài thi
              </Button>
            </Link>
          </div>
        </Space>
      </Content>
    );
  }

  // ...existing code...

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      {/* Exam Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "16px 24px",
          color: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ color: "#fff", margin: 0 }}>
              {exam.name}
            </Title>
          </Col>
          <Col>
            <Space align="center" size="large">
              <Tooltip
                title="Bạn có thể chọn văn bản để làm nổi bật hoặc dịch"
                placement="bottom"
              >
                <div
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    padding: "8px 16px",
                    borderRadius: "20px",
                    backdropFilter: "blur(10px)",
                    cursor: "help",
                  }}
                >
                  <Space>
                    <PenTool size={20} />
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: "16px",
                        fontWeight: "bold",
                      }}
                    >
                      Chọn văn bản để highlight/dịch
                    </Text>
                  </Space>
                </div>
              </Tooltip>
              <div
                style={{
                  background: "rgba(255,255,255,0.2)",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Space>
                  <Clock size={20} />
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                  >
                    {formatTime(remainingTime)}
                  </Text>
                </Space>
              </div>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Main Exam Content */}
      <Content style={{ padding: "24px" }}>
        <Row gutter={[24, 24]}>
          {/* Question Navigation Sidebar */}
          <Col xs={24} lg={6} xl={5}>
            <Card
              title={
                <>
                  <HelpCircle size={16} style={{ marginRight: "8px" }} />
                  Câu hỏi
                </>
              }
              style={{
                position: "sticky",
                top: "120px",
                maxHeight: "calc(100vh - 200px)",
                overflow: "auto",
                display: window.innerWidth < 992 ? "none" : "block",
              }}
              size="small"
            >
              <Row gutter={[8, 8]}>
                {exam.questions &&
                  exam.questions.map((q, index) => (
                    <Col span={6} key={q.id}>
                      <Button
                        type={
                          index === currentQuestionIndex ? "primary" : "default"
                        }
                        size="small"
                        onClick={() => goToQuestion(index)}
                        style={{
                          width: "100%",
                          background:
                            userAnswers[q.id] !== undefined
                              ? index === currentQuestionIndex
                                ? "#1890ff"
                                : "#52c41a"
                              : index === currentQuestionIndex
                              ? "#1890ff"
                              : "#fff",
                          borderColor: flaggedQuestions.includes(q.id)
                            ? "#faad14"
                            : index === currentQuestionIndex
                            ? "#1890ff"
                            : userAnswers[q.id] !== undefined
                            ? "#52c41a"
                            : "#d9d9d9",
                          color:
                            index === currentQuestionIndex
                              ? "#fff"
                              : userAnswers[q.id] !== undefined
                              ? "#fff"
                              : "#262626",
                          position: "relative",
                        }}
                      >
                        {index + 1}
                        {flaggedQuestions.includes(q.id) && (
                          <Flag
                            size={10}
                            style={{
                              position: "absolute",
                              top: "2px",
                              right: "2px",
                              color: "#faad14",
                            }}
                          />
                        )}
                      </Button>
                    </Col>
                  ))}
              </Row>

              {/* Legend */}
              <Divider />
              <Space
                direction="vertical"
                size="small"
                style={{ width: "100%" }}
              >
                <Space size="small">
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      background: "#1890ff",
                      borderRadius: "2px",
                    }}
                  ></div>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Hiện tại
                  </Text>
                </Space>
                <Space size="small">
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      background: "#52c41a",
                      borderRadius: "2px",
                    }}
                  ></div>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Đã trả lời
                  </Text>
                </Space>
                <Space size="small">
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      border: "2px solid #faad14",
                      borderRadius: "2px",
                    }}
                  ></div>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Đã đánh dấu
                  </Text>
                </Space>
              </Space>
            </Card>
          </Col>

          {/* Question Content */}
          <Col xs={24} lg={18} xl={19}>
            <Card>
              {/* Question Header */}
              <div
                style={{
                  marginBottom: "24px",
                  paddingBottom: "16px",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <Row justify="space-between" align="middle">
                  <Col>
                    <Title level={5} style={{ margin: 0 }}>
                      Câu hỏi {currentQuestionIndex + 1} /{" "}
                      {exam.questions ? exam.questions.length : 0}
                    </Title>
                  </Col>
                  <Col>
                    <Button
                      type={
                        flaggedQuestions.includes(currentQuestion.id)
                          ? "primary"
                          : "default"
                      }
                      icon={<Flag size={16} />}
                      onClick={() => toggleFlagQuestion(currentQuestion.id)}
                      style={{
                        borderColor: flaggedQuestions.includes(
                          currentQuestion.id
                        )
                          ? "#faad14"
                          : "#d9d9d9",
                        background: flaggedQuestions.includes(
                          currentQuestion.id
                        )
                          ? "#faad14"
                          : "#fff",
                        color: flaggedQuestions.includes(currentQuestion.id)
                          ? "#fff"
                          : "#262626",
                      }}
                    >
                      {flaggedQuestions.includes(currentQuestion.id)
                        ? "Bỏ đánh dấu"
                        : "Đánh dấu"}
                    </Button>
                  </Col>
                </Row>
              </div>

              {/* Question Media */}
              <Space
                direction="vertical"
                size="large"
                style={{ width: "100%", marginBottom: "24px" }}
              >
                {currentQuestion.image && (
                  <div>
                    <Image
                      src={currentQuestion.image}
                      alt="Hình ảnh câu hỏi"
                      style={{ maxWidth: "100%", borderRadius: "8px" }}
                      placeholder={
                        <div
                          style={{
                            padding: "40px",
                            textAlign: "center",
                            background: "#f5f5f5",
                            borderRadius: "8px",
                          }}
                        >
                          Loading image...
                        </div>
                      }
                    />
                  </div>
                )}

                {currentQuestion.audio && (
                  <Card
                    size="small"
                    style={{
                      background: "#f0f9ff",
                      border: "1px solid #91d5ff",
                    }}
                  >
                    <AudioPlayer
                      src={currentQuestion.audio}
                      questionId={currentQuestion.id}
                      key={`audio-${currentQuestion.id}-${currentQuestion.audio}`}
                    />
                  </Card>
                )}
              </Space>

              {/* Question Text */}
              <div style={{ marginBottom: "32px" }}>
                <Title
                  level={4}
                  style={{ marginBottom: "24px", color: "#262626" }}
                  id="question-text"
                >
                  <TextHighlighter containerId="question-text">
                    {currentQuestion.text}
                  </TextHighlighter>
                </Title>
              </div>

              {/* Answer Options */}
              <Radio.Group
                value={userAnswers[currentQuestion.id]}
                onChange={(e) =>
                  handleAnswerSelect(currentQuestion.id, e.target.value)
                }
                style={{ width: "100%" }}
              >
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: "100%" }}
                >
                  {currentQuestion.options &&
                    currentQuestion.options.map((option, optionIndex) => {
                      const optionLetter = String.fromCharCode(
                        65 + optionIndex
                      );
                      return (
                        <Radio
                          key={option.id}
                          value={option.id}
                          style={{
                            width: "100%",
                            padding: "16px",
                            borderRadius: "8px",
                            border: "2px solid",
                            borderColor:
                              userAnswers[currentQuestion.id] === option.id
                                ? "#1890ff"
                                : "#f0f0f0",
                            background:
                              userAnswers[currentQuestion.id] === option.id
                                ? "#f0f9ff"
                                : "#fff",
                            transition: "all 0.3s ease",
                          }}
                        >
                          <Space align="center" style={{ width: "100%" }}>
                            <Tag
                              color="blue"
                              style={{ minWidth: "28px", textAlign: "center" }}
                            >
                              {optionLetter}
                            </Tag>
                            <Text
                              style={{ fontSize: "16px" }}
                              id={`option-text-${option.id}`}
                            >
                              <TextHighlighter
                                containerId={`option-text-${option.id}`}
                              >
                                {option.text}
                              </TextHighlighter>
                            </Text>
                          </Space>
                        </Radio>
                      );
                    })}
                </Space>
              </Radio.Group>

              {/* Navigation buttons */}
              <div
                style={{
                  marginTop: "32px",
                  paddingTop: "24px",
                  borderTop: "1px solid #f0f0f0",
                }}
              >
                <Row justify="space-between" align="middle">
                  <Col>
                    <Button
                      type="default"
                      size="large"
                      onClick={goToPrevQuestion}
                      disabled={currentQuestionIndex === 0}
                      icon={<ChevronLeft size={16} />}
                      style={{ minWidth: "120px" }}
                    >
                      Câu trước
                    </Button>
                  </Col>
                  <Col>
                    <Space size="middle">
                      <Button
                        type="default"
                        size="large"
                        onClick={saveProgress}
                        icon={<Save size={16} />}
                        style={{
                          background: savedProgress ? "#52c41a" : "#1890ff",
                          borderColor: savedProgress ? "#52c41a" : "#1890ff",
                          color: "#fff",
                        }}
                      >
                        {savedProgress ? "Đã lưu" : "Lưu tiến trình"}
                      </Button>

                      <Button
                        type="primary"
                        size="large"
                        onClick={() => setShowConfirmSubmit(true)}
                        icon={<CheckCircle size={16} />}
                        style={{
                          background: "#52c41a",
                          borderColor: "#52c41a",
                          minWidth: "120px",
                        }}
                      >
                        Nộp bài
                      </Button>
                    </Space>
                  </Col>
                  <Col>
                    <Button
                      type="default"
                      size="large"
                      onClick={goToNextQuestion}
                      disabled={
                        !exam.questions ||
                        currentQuestionIndex === exam.questions.length - 1
                      }
                      style={{ minWidth: "120px" }}
                    >
                      Câu tiếp
                      <ChevronRight size={16} />
                    </Button>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
        </Row>
      </Content>

      {/* Confirm Submit Modal */}
      <Modal
        title={
          <Space>
            <AlertCircle size={20} style={{ color: "#faad14" }} />
            Nộp bài thi?
          </Space>
        }
        open={showConfirmSubmit}
        onCancel={() => setShowConfirmSubmit(false)}
        footer={null}
        width={500}
        centered
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Text style={{ fontSize: "16px", color: "#595959" }}>
            Bạn có chắc chắn muốn nộp bài thi? Bạn không thể thay đổi câu trả
            lời sau khi đã nộp.
          </Text>

          <Card size="small" style={{ background: "#f8f9fa" }}>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic
                  title="Đã trả lời"
                  value={Object.keys(userAnswers).length}
                  suffix={`/ ${exam.questions ? exam.questions.length : 0}`}
                  valueStyle={{ color: "#52c41a", fontWeight: "bold" }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Chưa trả lời"
                  value={
                    (exam.questions ? exam.questions.length : 0) -
                    Object.keys(userAnswers).length
                  }
                  valueStyle={{ color: "#ff4d4f", fontWeight: "bold" }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Đã đánh dấu"
                  value={flaggedQuestions.length}
                  valueStyle={{ color: "#faad14", fontWeight: "bold" }}
                />
              </Col>
            </Row>
          </Card>

          <Row gutter={[16, 16]} justify="end">
            <Col>
              <Button
                size="large"
                onClick={() => setShowConfirmSubmit(false)}
                icon={<X size={16} />}
              >
                Tiếp tục làm bài
              </Button>
            </Col>
            <Col>
              <Button
                type="primary"
                size="large"
                onClick={submitExam}
                loading={loading}
                icon={<CheckCircle size={16} />}
                style={{ background: "#52c41a", borderColor: "#52c41a" }}
              >
                {loading ? "Đang nộp bài..." : "Nộp bài ngay"}
              </Button>
            </Col>
          </Row>
        </Space>
      </Modal>
    </Layout>
  );
};

export default ExamDetail;
