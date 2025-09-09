import React, { useState, useEffect, useRef, useCallback } from "react";
import Comment from "../../../components/Learner/Comment";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./style.css"; // Import custom styles
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
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [savedProgress, setSavedProgress] = useState(false);
  const timerRef = useRef(null);
  const eventHandlersRef = useRef({ beforeUnload: null, popState: null });

  // Define saveProgress early to avoid "used before defined" errors
  const saveProgress = useCallback(async () => {
    try {
      await learnerExamService.saveProgress(
        id,
        userAnswers,
        exam?.duration * 60 - remainingTime,
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
  }, [id, userAnswers, exam?.duration, remainingTime, flaggedQuestions]);

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

  // Warn user before leaving page during exam
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Only show warning if exam is started but not submitted and not exiting
      if (examStarted && !examSubmitted && !isExiting) {
        const message = "Bạn đang làm bài thi. Dữ liệu có thể bị mất nếu rời khỏi trang này. Bạn có chắc chắn muốn rời khỏi không?";
        e.preventDefault();
        e.returnValue = message; // Chrome requires returnValue to be set
        return message; // For other browsers
      }
    };

    const handlePopState = (e) => {
      // Handle browser back/forward buttons
      if (examStarted && !examSubmitted && !isExiting) {
        e.preventDefault();
        setShowExitWarning(true);
        // Prevent navigation by pushing the current state again
        window.history.pushState(null, "", window.location.href);
      }
    };

    // Store handlers in ref for later removal
    eventHandlersRef.current.beforeUnload = handleBeforeUnload;
    eventHandlersRef.current.popState = handlePopState;

    if (examStarted && !examSubmitted) {
      // Add warning for programmatic navigation
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('popstate', handlePopState);
      
      // Push initial state to handle back button
      window.history.pushState(null, "", window.location.href);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [examStarted, examSubmitted, isExiting, saveProgress]);

  // Additional warning for route changes in React Router
  useEffect(() => {
    if (!examStarted || examSubmitted) return;

    // Custom implementation for React Router v6
    const handleBeforeRouteChange = (e) => {
      if (examStarted && !examSubmitted && !isExiting) {
        e.preventDefault();
        setShowExitWarning(true);
        return false;
      }
      return true;
    };

    // Listen for link clicks and form submissions
    const handleClick = (e) => {
      const target = e.target.closest('a, button[type="submit"]');
      if (target && target.href && target.href !== window.location.href) {
        if (!handleBeforeRouteChange(e)) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [examStarted, examSubmitted, isExiting, saveProgress]);

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

  // Function to clean question text by removing redundant titles
  const cleanQuestionText = (text) => {
    if (!text) return "";
    
    // Remove patterns like "Mini Test 1 - Question X" or "Test X - Question Y"
    const cleanedText = text
      .replace(/^(Mini\s+)?Test\s+\d+\s*-\s*Question\s+\d+\s*/i, "")
      .replace(/^Question\s+\d+\s*[:.-]\s*/i, "")
      .trim();
    
    return cleanedText || text; // Return original if cleaning results in empty string
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
                            {cleanQuestionText(question.text)}
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

        {/* Comment Section for this exam - Hiển thị sau khi hoàn thành bài thi */}
        {exam && exam.id && (
          <div style={{ marginTop: "24px" }}>
            <Comment examId={exam.id} />
          </div>
        )}
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

        {/* Exam Introduction - Compact Hero Section */}
        <div className="exam-detail-container" style={{ border: "none", borderBottom: "none", borderTop: "none" }}>
          <Card
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "16px",
              marginBottom: "24px",
              color: "#fff",
              border: "none",
              position: "relative",
              overflow: "hidden",
            }}
            styles={{
              body: { 
                padding: "24px",
                borderBottom: "none",
                border: "none"
              }
            }}
            bodyStyle={{
              border: "none",
              borderBottom: "none",
              borderTop: "none"
            }}
          >
          {/* Background Pattern */}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "150px",
              height: "150px",
              background: "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
              opacity: 0.3,
            }}
          />
          
          <Row align="middle" gutter={[24, 16]} style={{ position: "relative", zIndex: 1 }}>
            <Col xs={24} md={16}>
              <Space direction="vertical" size="small" style={{ width: "100%" }}>
                <Title 
                  level={2} 
                  style={{ 
                    color: "#fff", 
                    marginBottom: "8px",
                    fontSize: "1.8rem",
                    fontWeight: "bold",
                    borderBottom: "none",
                    paddingBottom: "0"
                  }}
                >
                  {exam.name}
                </Title>
                
                <Paragraph 
                  style={{ 
                    color: "rgba(255,255,255,0.9)", 
                    fontSize: "16px",
                    marginBottom: "16px",
                    lineHeight: "1.4"
                  }}
                >
                  {exam.description}
                </Paragraph>
                
                <Space size="middle">
                  <Tag
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      borderRadius: "20px",
                      padding: "4px 12px",
                      border: "none",
                      color: "#fff",
                      backdropFilter: "blur(10px)"
                    }}
                  >
                    <Clock size={14} style={{ marginRight: "6px" }} />
                    {exam.duration} phút
                  </Tag>
                  <Tag
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      borderRadius: "20px",
                      padding: "4px 12px",
                      border: "none",
                      color: "#fff",
                      backdropFilter: "blur(10px)"
                    }}
                  >
                    <HelpCircle size={14} style={{ marginRight: "6px" }} />
                    {exam.questions ? exam.questions.length : 0} câu
                  </Tag>
                  <Tag
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      borderRadius: "20px",
                      padding: "4px 12px",
                      border: "none",
                      color: "#fff",
                      backdropFilter: "blur(10px)"
                    }}
                  >
                    <Target size={14} style={{ marginRight: "6px" }} />
                    {exam.type === "full-test" ? "Full Test" : "Mini Test"}
                  </Tag>
                </Space>
              </Space>
            </Col>
            
            <Col xs={24} md={8} style={{ textAlign: "center" }}>
              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <Button
                  type="primary"
                  size="large"
                  onClick={startExam}
                  icon={<PlayCircle size={20} />}
                  style={{
                    width: "100%",
                    height: "48px",
                    fontSize: "16px",
                    fontWeight: "600",
                    borderRadius: "24px",
                    background: "rgba(255,255,255,0.9)",
                    border: "none",
                    color: "#667eea",
                    boxShadow: "0 4px 16px rgba(255,255,255,0.3)"
                  }}
                >
                  {savedProgress ? "Tiếp tục bài thi" : "Bắt đầu bài thi"}
                </Button>
                
                <Link to="/learner/exams">
                  <Button
                    size="middle"
                    icon={<ArrowLeft size={14} />}
                    style={{
                      background: "#fff",
                      border: "2px solid rgba(255,255,255,0.8)",
                      color: "#667eea",
                      borderRadius: "20px",
                      fontWeight: "500",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                    }}
                  >
                    Quay lại
                  </Button>
                </Link>
              </Space>
            </Col>
          </Row>
        </Card>
        </div>

        {/* Quick Instructions - Compact Version */}
        {savedProgress ? (
          <Card
            style={{
              marginBottom: "24px",
              borderRadius: "12px",
              border: "2px solid #52c41a",
              background: "linear-gradient(135deg, #f6ffed 0%, #ffffff 100%)"
            }}
          >
            <Row align="middle" gutter={[16, 8]}>
              <Col flex="none">
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    background: "#52c41a",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <PlayCircle size={20} style={{ color: "#fff" }} />
                </div>
              </Col>
              <Col flex="auto">
                <Title level={5} style={{ marginBottom: "4px", color: "#389e0d" }}>
                  Tiếp tục bài thi đã lưu
                </Title>
                <Text style={{ fontSize: "14px", color: "#666" }}>
                  Bạn có thể tiếp tục từ nơi đã dừng lại
                </Text>
              </Col>
            </Row>
          </Card>
        ) : (
          <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
            <Col xs={24} md={12}>
              <Card
                size="small"
                style={{
                  borderRadius: "12px",
                  border: "1px solid #e6f4ff",
                  background: "#f0f7ff"
                }}
              >
                <Space align="start">
                  <BookOpen size={20} style={{ color: "#1890ff", marginTop: "2px" }} />
                  <div>
                    <Title level={5} style={{ marginBottom: "8px", color: "#1890ff" }}>
                      Hướng dẫn làm bài
                    </Title>
                    <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "14px", color: "#666" }}>
                      <li>Đọc kỹ đề bài trước khi trả lời</li>
                      <li>Đánh dấu câu khó để xem lại</li>
                      <li>Lưu tiến trình thường xuyên</li>
                    </ul>
                  </div>
                </Space>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card
                size="small"
                style={{
                  borderRadius: "12px",
                  border: "1px solid #fff7e6",
                  background: "#fff7e6"
                }}
              >
                <Space align="start">
                  <Target size={20} style={{ color: "#fa8c16", marginTop: "2px" }} />
                  <div>
                    <Title level={5} style={{ marginBottom: "8px", color: "#fa8c16" }}>
                      Lưu ý quan trọng
                    </Title>
                    <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "14px", color: "#666" }}>
                      <li>Quản lý thời gian hợp lý</li>
                      <li>Kiểm tra kỹ trước khi nộp</li>
                      <li>Không thể sửa sau khi nộp bài</li>
                    </ul>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        )}

        {/* Comment Section for this exam - Hiển thị ngay từ trang intro */}
        {exam && exam.id && (
          <div style={{ marginTop: "24px" }}>
            <Comment examId={exam.id} />
          </div>
        )}
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
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      {/* Enhanced Exam Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "12px 20px",
          color: "#fff",
          boxShadow: "0 4px 20px rgba(102, 126, 234, 0.3)",
          position: "sticky",
          top: 0,
          zIndex: 100,
          height: "72px",
          display: "flex",
          alignItems: "center",
          borderBottom: "3px solid rgba(255,255,255,0.1)",
        }}
      >
        <Row justify="space-between" align="middle" style={{ width: "100%" }}>
          <Col flex="auto">
            <Space direction="vertical" size={0}>
              <Title level={4} style={{ color: "#fff", margin: 0, fontWeight: "600" }}>
                {exam.name}
              </Title>
              <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px" }}>
                Câu {currentQuestionIndex + 1} / {exam.questions ? exam.questions.length : 0}
              </Text>
            </Space>
          </Col>
          <Col>
            <Space align="center" size="large">
              <Tooltip
                title="Bạn có thể chọn văn bản để làm nổi bật hoặc dịch"
                placement="bottom"
              >
                <div
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    padding: "8px 16px",
                    borderRadius: "20px",
                    backdropFilter: "blur(10px)",
                    cursor: "help",
                    border: "1px solid rgba(255,255,255,0.2)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "rgba(255,255,255,0.25)";
                    e.target.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "rgba(255,255,255,0.15)";
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  <Space size="small">
                    <PenTool size={16} />
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      Highlight/Dịch
                    </Text>
                  </Space>
                </div>
              </Tooltip>
              
              {/* Enhanced Timer */}
              <div
                style={{
                  background: remainingTime < 300 ? 
                    "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)" :
                    remainingTime < 900 ?
                    "linear-gradient(135deg, #ffa726 0%, #ff9800 100%)" :
                    "linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  minWidth: "120px",
                  textAlign: "center",
                  animation: remainingTime < 300 ? "pulse 2s infinite" : "none",
                }}
              >
                <Space size="small">
                  <Clock size={16} />
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: "16px",
                      fontWeight: "bold",
                      fontFamily: "monospace",
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

      {/* Navigation Protection Alert */}
      <div style={{ padding: "0 20px" }}>
        <Alert
          message={
            <Space>
              <AlertCircle size={16} />
              <span style={{ fontWeight: "600" }}>Bảo vệ tiến trình làm bài</span>
            </Space>
          }
          description="Hệ thống sẽ cảnh báo nếu bạn cố gắng rời khỏi trang hoặc chuyển tab khi đang làm bài. Nhấn 'Lưu tạm' để lưu tiến trình."
          type="info"
          showIcon={false}
          style={{
            background: "linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)",
            border: "1px solid #2196f3",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
          closable
        />
      </div>

      {/* Main Exam Content - Enhanced */}
      <Content style={{ padding: "20px", minHeight: "calc(100vh - 72px)", overflow: "auto" }}>
        <Row gutter={[20, 20]} style={{ minHeight: "100%" }}>
          {/* Enhanced Question Navigation Sidebar */}
          <Col xs={24} lg={6} xl={5}>
            <Card
              title={
                <Space>
                  <HelpCircle size={16} />
                  <span style={{ fontWeight: "600" }}>Danh sách câu hỏi</span>
                </Space>
              }
              style={{
                height: "calc(100vh - 140px)",
                display: window.innerWidth < 992 ? "none" : "block",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                borderRadius: "12px",
                border: "1px solid #e8f4fd",
                position: "sticky",
                top: "20px",
              }}
              headStyle={{
                background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                borderRadius: "12px 12px 0 0",
                borderBottom: "1px solid #e8f4fd",
                padding: "12px 16px",
              }}
              bodyStyle={{
                padding: "16px",
                height: "calc(100vh - 197px)",
                display: "flex",
                flexDirection: "column",
              }}
              size="small"
            >
              {/* Enhanced Legend */}
              <div style={{
                background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "16px",
                border: "1px solid #e2e8f0",
                flexShrink: 0,
                boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
              }}>
                <Row gutter={[8, 6]}>
                  <Col span={24}>
                    <Space size="small" style={{ marginBottom: "4px" }}>
                      <div style={{
                        width: "14px",
                        height: "14px",
                        background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                        borderRadius: "3px",
                        boxShadow: "0 2px 4px rgba(24, 144, 255, 0.3)",
                      }}></div>
                      <Text style={{ fontSize: "12px", color: "#475569", fontWeight: "500" }}>
                        Câu hiện tại
                      </Text>
                    </Space>
                  </Col>
                  <Col span={12}>
                    <Space size="small">
                      <div style={{
                        width: "14px",
                        height: "14px",
                        background: "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
                        borderRadius: "3px",
                        boxShadow: "0 2px 4px rgba(82, 196, 26, 0.3)",
                      }}></div>
                      <Text style={{ fontSize: "12px", color: "#475569", fontWeight: "500" }}>
                        Đã làm
                      </Text>
                    </Space>
                  </Col>
                  <Col span={12}>
                    <Space size="small">
                      <div style={{
                        width: "14px",
                        height: "14px",
                        border: "2px solid #faad14",
                        borderRadius: "3px",
                        background: "#fff",
                        boxShadow: "0 2px 4px rgba(250, 173, 20, 0.3)",
                      }}></div>
                      <Text style={{ fontSize: "12px", color: "#475569", fontWeight: "500" }}>
                        Đánh dấu
                      </Text>
                    </Space>
                  </Col>
                </Row>
              </div>

              {/* Enhanced Question Grid */}
              <div style={{
                flex: 1,
                overflowY: "auto",
                overflowX: "hidden",
                maxHeight: "calc(100vh - 350px)",
                minHeight: "200px",
                paddingRight: "4px",
              }}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: exam.questions?.length > 60 ? "repeat(6, 1fr)" : "repeat(5, 1fr)",
                  gap: "6px",
                  padding: "4px"
                }}>
                  {exam.questions && exam.questions.map((q, index) => {
                    const isActive = index === currentQuestionIndex;
                    const isAnswered = userAnswers[q.id] !== undefined;
                    const isFlagged = flaggedQuestions.includes(q.id);
                    
                    return (
                      <button
                        key={q.id}
                        onClick={() => goToQuestion(index)}
                        style={{
                          width: "100%",
                          height: "32px",
                          border: `2px solid ${
                            isFlagged ? "#faad14" : 
                            isActive ? "#1890ff" : 
                            isAnswered ? "#52c41a" : "#d1d5db"
                          }`,
                          background: isActive ? 
                            "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)" : 
                            isAnswered ? 
                            "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)" : 
                            "#ffffff",
                          color: isActive || isAnswered ? "#fff" : "#374151",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          position: "relative",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "0",
                          boxShadow: isActive || isAnswered ? 
                            "0 2px 8px rgba(0,0,0,0.15)" : 
                            "0 1px 3px rgba(0,0,0,0.1)",
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.target.style.transform = "scale(1.08) translateY(-1px)";
                            e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = "scale(1) translateY(0)";
                          e.target.style.boxShadow = isActive || isAnswered ? 
                            "0 2px 8px rgba(0,0,0,0.15)" : 
                            "0 1px 3px rgba(0,0,0,0.1)";
                        }}
                      >
                        {index + 1}
                        {isFlagged && (
                          <Flag
                            size={8}
                            style={{
                              position: "absolute",
                              top: "-2px",
                              right: "-2px",
                              color: "#faad14",
                              background: "#fff",
                              borderRadius: "50%",
                              padding: "1px",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                            }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Enhanced Progress Summary */}
              <div style={{
                marginTop: "12px",
                padding: "12px",
                background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                borderRadius: "8px",
                border: "1px solid #bae6fd",
                flexShrink: 0,
                boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
              }}>
                <Row gutter={8}>
                  <Col span={8} style={{ textAlign: "center" }}>
                    <div style={{ 
                      fontSize: "16px", 
                      fontWeight: "bold", 
                      color: "#1890ff",
                      marginBottom: "2px"
                    }}>
                      {currentQuestionIndex + 1}
                    </div>
                    <div style={{ fontSize: "10px", color: "#64748b", fontWeight: "500" }}>
                      Hiện tại
                    </div>
                  </Col>
                  <Col span={8} style={{ textAlign: "center" }}>
                    <div style={{ 
                      fontSize: "16px", 
                      fontWeight: "bold", 
                      color: "#52c41a",
                      marginBottom: "2px"
                    }}>
                      {Object.keys(userAnswers).length}
                    </div>
                    <div style={{ fontSize: "10px", color: "#64748b", fontWeight: "500" }}>
                      Đã làm
                    </div>
                  </Col>
                  <Col span={8} style={{ textAlign: "center" }}>
                    <div style={{ 
                      fontSize: "16px", 
                      fontWeight: "bold", 
                      color: "#faad14",
                      marginBottom: "2px"
                    }}>
                      {flaggedQuestions.length}
                    </div>
                    <div style={{ fontSize: "10px", color: "#64748b", fontWeight: "500" }}>
                      Đánh dấu
                    </div>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>

          {/* Enhanced Question Content */}
          <Col xs={24} lg={18} xl={19}>
            <Card
              style={{ 
                minHeight: "calc(100vh - 140px)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                borderRadius: "12px",
                border: "1px solid #e8f4fd",
                overflow: "visible",
              }}
              bodyStyle={{
                padding: "24px",
                minHeight: "calc(100vh - 197px)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Enhanced Question Header */}
              <div
                style={{
                  marginBottom: "20px",
                  paddingBottom: "16px",
                  borderBottom: "2px solid #f0f9ff",
                  flexShrink: 0,
                  background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                  margin: "-24px -24px 20px -24px",
                  padding: "16px 24px",
                  borderRadius: "12px 12px 0 0",
                }}
              >
                <Row justify="space-between" align="middle">
                  <Col>
                    <Space direction="vertical" size={0}>
                      <Title level={4} style={{ margin: 0, color: "#1e293b", fontWeight: "600" }}>
                        Câu {currentQuestionIndex + 1} / {exam.questions ? exam.questions.length : 0}
                      </Title>
                      <Text style={{ color: "#64748b", fontSize: "13px" }}>
                        {exam.type === "full-test" ? "TOEIC Full Test" : "Mini Test"}
                      </Text>
                    </Space>
                  </Col>
                  <Col>
                    <Button
                      type={
                        flaggedQuestions.includes(currentQuestion.id)
                          ? "primary"
                          : "default"
                      }
                      size="middle"
                      icon={<Flag size={14} />}
                      onClick={() => toggleFlagQuestion(currentQuestion.id)}
                      style={{
                        borderColor: flaggedQuestions.includes(currentQuestion.id)
                          ? "#faad14"
                          : "#d1d5db",
                        background: flaggedQuestions.includes(currentQuestion.id)
                          ? "linear-gradient(135deg, #faad14 0%, #f59e0b 100%)"
                          : "#ffffff",
                        color: flaggedQuestions.includes(currentQuestion.id)
                          ? "#fff"
                          : "#374151",
                        borderRadius: "8px",
                        fontWeight: "500",
                        height: "36px",
                        paddingLeft: "16px",
                        paddingRight: "16px",
                        boxShadow: flaggedQuestions.includes(currentQuestion.id)
                          ? "0 2px 8px rgba(250, 173, 20, 0.3)"
                          : "0 1px 3px rgba(0,0,0,0.1)",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!flaggedQuestions.includes(currentQuestion.id)) {
                          e.target.style.borderColor = "#faad14";
                          e.target.style.color = "#faad14";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!flaggedQuestions.includes(currentQuestion.id)) {
                          e.target.style.borderColor = "#d1d5db";
                          e.target.style.color = "#374151";
                        }
                      }}
                    >
                      {flaggedQuestions.includes(currentQuestion.id)
                        ? "Bỏ đánh dấu"
                        : "Đánh dấu"}
                    </Button>
                  </Col>
                </Row>
              </div>

              {/* Enhanced Scrollable Content Area */}
              <div style={{ 
                flex: 1, 
                overflow: "visible", 
                paddingRight: "8px",
                scrollBehavior: "smooth",
                minHeight: "400px",
              }}>
                {/* Enhanced Question Media */}
                <Space
                  direction="vertical"
                  size="large"
                  style={{ width: "100%", marginBottom: "24px" }}
                >
                  {currentQuestion.image && (
                    <Card
                      size="small"
                      style={{
                        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        overflow: "hidden",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      }}
                      bodyStyle={{ padding: "16px", textAlign: "center" }}
                    >
                      <Image
                        src={currentQuestion.image}
                        alt="Hình ảnh câu hỏi"
                        style={{ 
                          maxWidth: "100%", 
                          borderRadius: "8px",
                          maxHeight: "400px",
                          objectFit: "contain",
                        }}
                        placeholder={
                          <div
                            style={{
                              padding: "40px",
                              textAlign: "center",
                              background: "#f8fafc",
                              borderRadius: "8px",
                              color: "#64748b",
                            }}
                          >
                            <Spin size="large" />
                            <div style={{ marginTop: "16px" }}>Đang tải hình ảnh...</div>
                          </div>
                        }
                      />
                    </Card>
                  )}

                  {currentQuestion.audio && (
                    <Card
                      size="small"
                      style={{
                        background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                        border: "1px solid #bae6fd",
                        borderRadius: "12px",
                        boxShadow: "0 2px 8px rgba(59, 130, 246, 0.1)",
                      }}
                      bodyStyle={{ padding: "16px" }}
                    >
                      <Space direction="vertical" size="small" style={{ width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                          <Volume2 size={16} style={{ color: "#3b82f6", marginRight: "8px" }} />
                          <Text strong style={{ color: "#1e40af" }}>
                            Audio cho câu hỏi này
                          </Text>
                        </div>
                        <AudioPlayer
                          src={currentQuestion.audio}
                          questionId={currentQuestion.id}
                          key={`audio-${currentQuestion.id}-${currentQuestion.audio}`}
                        />
                      </Space>
                    </Card>
                  )}
                </Space>

                {/* Enhanced Question Text */}
                {/* <div style={{ marginBottom: "28px" }}>
                  <Card
                    size="small"
                    style={{
                      background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                      border: "2px solid #e2e8f0",
                      borderRadius: "12px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                    bodyStyle={{ padding: "20px" }}
                  >
                    <Title
                      level={4}
                      style={{ 
                        marginBottom: "0", 
                        color: "#1e293b",
                        lineHeight: "1.6",
                        fontSize: "16px",
                      }}
                      id="question-text"
                    >
                      <TextHighlighter containerId="question-text">
                        {cleanQuestionText(currentQuestion.text)}
                      </TextHighlighter>
                    </Title>
                  </Card>
                </div> */}

                {/* Compact Answer Options */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                    borderRadius: "12px",
                    padding: "16px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div style={{ marginBottom: "12px" }}>
                    <Space>
                      <CheckCircle size={16} style={{ color: "#3b82f6" }} />
                      <Text style={{ color: "#1e293b", fontWeight: "600", fontSize: "14px" }}>
                        Chọn đáp án
                      </Text>
                    </Space>
                  </div>
                  
                  <Radio.Group
                    value={userAnswers[currentQuestion.id]}
                    onChange={(e) =>
                      handleAnswerSelect(currentQuestion.id, e.target.value)
                    }
                    style={{ width: "100%" }}
                  >
                    <Row gutter={[8, 8]}>
                      {currentQuestion.options &&
                        currentQuestion.options.map((option, optionIndex) => {
                          const optionLetter = String.fromCharCode(65 + optionIndex);
                          const isSelected = userAnswers[currentQuestion.id] === option.id;
                          
                          return (
                            <Col xs={24} sm={12} key={option.id}>
                              <Radio
                                value={option.id}
                                style={{
                                  width: "100%",
                                  padding: "8px 12px",
                                  borderRadius: "8px",
                                  border: "1px solid",
                                  borderColor: isSelected ? "#3b82f6" : "#d1d5db",
                                  background: isSelected 
                                    ? "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)"
                                    : "#ffffff",
                                  transition: "all 0.2s ease",
                                  boxShadow: isSelected 
                                    ? "0 2px 8px rgba(59, 130, 246, 0.15)"
                                    : "0 1px 2px rgba(0,0,0,0.05)",
                                  margin: 0,
                                }}
                              >
                                <Space align="start" style={{ width: "100%" }}>
                                  <div
                                    style={{
                                      width: "24px",
                                      height: "24px",
                                      borderRadius: "6px",
                                      background: isSelected 
                                        ? "#3b82f6"
                                        : "#f1f5f9",
                                      color: isSelected ? "#ffffff" : "#64748b",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontWeight: "600",
                                      fontSize: "12px",
                                      flexShrink: 0,
                                    }}
                                  >
                                    {optionLetter}
                                  </div>
                                  <Text
                                    style={{ 
                                      fontSize: "14px",
                                      color: isSelected ? "#1e40af" : "#374151",
                                      fontWeight: isSelected ? "500" : "400",
                                      lineHeight: "1.4",
                                      margin: 0,
                                    }}
                                  >
                                    {option.text}
                                  </Text>
                                </Space>
                              </Radio>
                            </Col>
                          );
                        })}
                    </Row>
                  </Radio.Group>
                </div>
              </div>

              {/* Enhanced Navigation Buttons */}
              <div
                style={{
                  marginTop: "24px",
                  paddingTop: "20px",
                  borderTop: "2px solid #f0f9ff",
                  flexShrink: 0,
                  background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                  margin: "24px -24px 0 -24px",
                  padding: "20px 24px",
                  borderRadius: "0 0 12px 12px",
                  boxShadow: "0 -2px 8px rgba(0,0,0,0.02)",
                }}
              >
                <div 
                  className={window.innerWidth < 576 ? "navigation-buttons-mobile" : ""}
                  style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "16px",
                    ...(window.innerWidth < 576 && {
                      flexDirection: "column",
                      gap: "12px"
                    })
                  }}
                >
                  {/* Previous Button */}
                  <div style={{ 
                    flex: window.innerWidth < 576 ? "1 1 100%" : "0 0 auto",
                    width: window.innerWidth < 576 ? "100%" : "auto"
                  }}>
                    <Button
                      type="default"
                      onClick={goToPrevQuestion}
                      disabled={currentQuestionIndex === 0}
                      icon={<ChevronLeft size={18} />}
                      size="large"
                      style={{ 
                        minWidth: window.innerWidth < 576 ? "100%" : "140px",
                        width: window.innerWidth < 576 ? "100%" : "auto",
                        height: "48px",
                        borderRadius: "12px",
                        fontWeight: "600",
                        fontSize: "15px",
                        border: currentQuestionIndex === 0 ? "2px solid #e5e7eb" : "2px solid #3b82f6",
                        background: currentQuestionIndex === 0 ? 
                          "#f9fafb" : 
                          "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                        color: currentQuestionIndex === 0 ? "#9ca3af" : "#3b82f6",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        boxShadow: currentQuestionIndex === 0 ? "none" : "0 2px 8px rgba(59, 130, 246, 0.15)",
                      }}
                      onMouseEnter={(e) => {
                        if (currentQuestionIndex !== 0) {
                          e.target.style.background = "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)";
                          e.target.style.color = "#ffffff";
                          e.target.style.transform = "translateY(-2px)";
                          e.target.style.boxShadow = "0 4px 16px rgba(59, 130, 246, 0.3)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentQuestionIndex !== 0) {
                          e.target.style.background = "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)";
                          e.target.style.color = "#3b82f6";
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow = "0 2px 8px rgba(59, 130, 246, 0.15)";
                        }
                      }}
                    >
                      Câu trước
                    </Button>
                  </div>

                  {/* Center Buttons */}
                  <div 
                    className={window.innerWidth < 576 ? "navigation-center-mobile" : ""}
                    style={{ 
                      display: "flex", 
                      gap: "12px", 
                      flex: window.innerWidth < 576 ? "1 1 100%" : "1 1 auto", 
                      justifyContent: "center",
                      flexWrap: "wrap",
                      width: window.innerWidth < 576 ? "100%" : "auto",
                      ...(window.innerWidth < 576 && {
                        flexDirection: "column",
                        gap: "8px"
                      })
                    }}
                  >
                    <Button
                      type="default"
                      onClick={saveProgress}
                      icon={<Save size={18} />}
                      size="large"
                      style={{
                        minWidth: window.innerWidth < 576 ? "100%" : "120px",
                        width: window.innerWidth < 576 ? "100%" : "auto",
                        height: "48px",
                        borderRadius: "12px",
                        fontWeight: "600",
                        fontSize: "15px",
                        border: "2px solid transparent",
                        background: savedProgress 
                          ? "linear-gradient(135deg, #10b981 0%, #047857 100%)"
                          : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                        color: "#ffffff",
                        boxShadow: savedProgress
                          ? "0 2px 8px rgba(16, 185, 129, 0.3)"
                          : "0 2px 8px rgba(245, 158, 11, 0.3)",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow = savedProgress
                          ? "0 4px 16px rgba(16, 185, 129, 0.4)"
                          : "0 4px 16px rgba(245, 158, 11, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = savedProgress
                          ? "0 2px 8px rgba(16, 185, 129, 0.3)"
                          : "0 2px 8px rgba(245, 158, 11, 0.3)";
                      }}
                    >
                      {savedProgress ? "✓ Đã lưu" : "Lưu tạm"}
                    </Button>

                    <Button
                      type="primary"
                      onClick={() => setShowConfirmSubmit(true)}
                      icon={<CheckCircle size={18} />}
                      size="large"
                      style={{
                        minWidth: window.innerWidth < 576 ? "100%" : "160px",
                        width: window.innerWidth < 576 ? "100%" : "auto",
                        height: "48px",
                        borderRadius: "12px",
                        fontWeight: "700",
                        fontSize: "16px",
                        border: "2px solid transparent",
                        background: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
                        color: "#ffffff",
                        boxShadow: "0 4px 16px rgba(16, 185, 129, 0.3)",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        position: "relative",
                        overflow: "hidden",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "translateY(-2px) scale(1.02)";
                        e.target.style.boxShadow = "0 6px 20px rgba(16, 185, 129, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "translateY(0) scale(1)";
                        e.target.style.boxShadow = "0 4px 16px rgba(16, 185, 129, 0.3)";
                      }}
                    >
                      Nộp bài thi
                    </Button>
                  </div>

                  {/* Next Button */}
                  <div style={{ flex: "0 0 auto" }}>
                    <Button
                      type="default"
                      onClick={goToNextQuestion}
                      disabled={
                        !exam.questions ||
                        currentQuestionIndex === exam.questions.length - 1
                      }
                      size="large"
                      style={{ 
                        minWidth: "140px",
                        height: "48px",
                        borderRadius: "12px",
                        fontWeight: "600",
                        fontSize: "15px",
                        border: (!exam.questions || currentQuestionIndex === exam.questions.length - 1) ? 
                          "2px solid #e5e7eb" : "2px solid #3b82f6",
                        background: (!exam.questions || currentQuestionIndex === exam.questions.length - 1) ? 
                          "#f9fafb" : 
                          "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                        color: (!exam.questions || currentQuestionIndex === exam.questions.length - 1) ? 
                          "#9ca3af" : "#3b82f6",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        boxShadow: (!exam.questions || currentQuestionIndex === exam.questions.length - 1) ? 
                          "none" : "0 2px 8px rgba(59, 130, 246, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                      }}
                      onMouseEnter={(e) => {
                        if (exam.questions && currentQuestionIndex !== exam.questions.length - 1) {
                          e.target.style.background = "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)";
                          e.target.style.color = "#ffffff";
                          e.target.style.transform = "translateY(-2px)";
                          e.target.style.boxShadow = "0 4px 16px rgba(59, 130, 246, 0.3)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (exam.questions && currentQuestionIndex !== exam.questions.length - 1) {
                          e.target.style.background = "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)";
                          e.target.style.color = "#3b82f6";
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow = "0 2px 8px rgba(59, 130, 246, 0.15)";
                        }
                      }}
                    >
                      Câu tiếp
                      <ChevronRight size={18} />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Content>

      {/* Enhanced Confirm Submit Modal */}
      <Modal
        title={
          <div style={{
            textAlign: "center",
            padding: "8px 0",
          }}>
            <Space direction="vertical" size="small">
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #faad14 0%, #f59e0b 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                boxShadow: "0 4px 12px rgba(250, 173, 20, 0.3)",
              }}>
                <AlertCircle size={24} style={{ color: "#fff" }} />
              </div>
              <Title level={4} style={{ margin: 0, color: "#1e293b" }}>
                Nộp bài thi?
              </Title>
            </Space>
          </div>
        }
        open={showConfirmSubmit}
        onCancel={() => setShowConfirmSubmit(false)}
        footer={null}
        width={600}
        centered
        style={{
          borderRadius: "16px",
          overflow: "hidden",
        }}
        styles={{
          content: {
            borderRadius: "16px",
            padding: "0",
          },
          body: {
            padding: "24px",
          }
        }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div style={{ textAlign: "center", padding: "0 20px" }}>
            <Text style={{ 
              fontSize: "16px", 
              color: "#64748b",
              lineHeight: "1.6",
              display: "block",
              marginBottom: "8px"
            }}>
              Bạn có chắc chắn muốn nộp bài thi không?
            </Text>
            <Text style={{ 
              fontSize: "14px", 
              color: "#94a3b8",
              lineHeight: "1.5"
            }}>
              Bạn sẽ không thể thay đổi câu trả lời sau khi đã nộp bài.
            </Text>
          </div>

          <Card 
            size="small" 
            style={{ 
              background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
            bodyStyle={{ padding: "20px" }}
          >
            <Row gutter={[20, 16]}>
              <Col span={8}>
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 8px auto",
                    boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
                  }}>
                    <CheckCircle size={20} style={{ color: "#fff" }} />
                  </div>
                  <Statistic
                    title={<span style={{ color: "#64748b", fontSize: "12px" }}>Đã trả lời</span>}
                    value={Object.keys(userAnswers).length}
                    suffix={`/ ${exam.questions ? exam.questions.length : 0}`}
                    valueStyle={{ 
                      color: "#10b981", 
                      fontWeight: "bold",
                      fontSize: "18px"
                    }}
                  />
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 8px auto",
                    boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)",
                  }}>
                    <XCircle size={20} style={{ color: "#fff" }} />
                  </div>
                  <Statistic
                    title={<span style={{ color: "#64748b", fontSize: "12px" }}>Chưa trả lời</span>}
                    value={
                      (exam.questions ? exam.questions.length : 0) -
                      Object.keys(userAnswers).length
                    }
                    valueStyle={{ 
                      color: "#ef4444", 
                      fontWeight: "bold",
                      fontSize: "18px"
                    }}
                  />
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 8px auto",
                    boxShadow: "0 2px 8px rgba(245, 158, 11, 0.3)",
                  }}>
                    <Flag size={20} style={{ color: "#fff" }} />
                  </div>
                  <Statistic
                    title={<span style={{ color: "#64748b", fontSize: "12px" }}>Đã đánh dấu</span>}
                    value={flaggedQuestions.length}
                    valueStyle={{ 
                      color: "#f59e0b", 
                      fontWeight: "bold",
                      fontSize: "18px"
                    }}
                  />
                </div>
              </Col>
            </Row>
          </Card>

          <Row gutter={[16, 16]} justify="center">
            <Col>
              <Button
                size="large"
                onClick={() => setShowConfirmSubmit(false)}
                icon={<X size={16} />}
                style={{
                  borderRadius: "8px",
                  height: "48px",
                  paddingLeft: "24px",
                  paddingRight: "24px",
                  fontWeight: "500",
                  border: "2px solid #e5e7eb",
                  background: "#ffffff",
                  color: "#374151",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = "#ef4444";
                  e.target.style.color = "#ef4444";
                  e.target.style.transform = "translateY(-1px)";
                  e.target.style.boxShadow = "0 2px 8px rgba(239, 68, 68, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                  e.target.style.color = "#374151";
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }}
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
                style={{ 
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  borderColor: "#10b981",
                  borderRadius: "8px",
                  height: "48px",
                  paddingLeft: "24px",
                  paddingRight: "24px",
                  fontWeight: "600",
                  fontSize: "15px",
                  boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-1px)";
                  e.target.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 2px 8px rgba(16, 185, 129, 0.3)";
                }}
              >
                {loading ? "Đang nộp bài..." : "Nộp bài ngay"}
              </Button>
            </Col>
          </Row>
        </Space>
      </Modal>

      {/* Exit Warning Modal */}
      <Modal
        title={
          <Space>
            <AlertCircle size={20} style={{ color: "#f59e0b" }} />
            <span style={{ color: "#1f2937", fontWeight: "600" }}>
              ⚠️ Cảnh báo rời khỏi bài thi
            </span>
          </Space>
        }
        open={showExitWarning}
        onCancel={() => setShowExitWarning(false)}
        footer={[
          <Button 
            key="stay" 
            onClick={() => setShowExitWarning(false)}
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              borderColor: "#10b981",
              color: "#fff",
              fontWeight: "600",
            }}
          >
            Tiếp tục làm bài
          </Button>,
          <Button 
            key="save-exit" 
            onClick={async () => {
              setIsExiting(true);
              setShowExitWarning(false);
              
              // Remove event listeners using stored references
              if (eventHandlersRef.current.beforeUnload) {
                window.removeEventListener('beforeunload', eventHandlersRef.current.beforeUnload);
              }
              if (eventHandlersRef.current.popState) {
                window.removeEventListener('popstate', eventHandlersRef.current.popState);
              }
              
              try {
                await saveProgress();
              } catch (error) {
                console.error("Error saving progress:", error);
              }
              
              // Navigate after a short delay
              setTimeout(() => {
                navigate(-1);
              }, 100);
            }}
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              borderColor: "#3b82f6",
              color: "#fff",
              fontWeight: "600",
            }}
          >
            Lưu và thoát
          </Button>,
          <Button 
            key="exit" 
            danger 
            onClick={() => {
              setIsExiting(true);
              setShowExitWarning(false);
              
              // Remove event listeners using stored references
              if (eventHandlersRef.current.beforeUnload) {
                window.removeEventListener('beforeunload', eventHandlersRef.current.beforeUnload);
              }
              if (eventHandlersRef.current.popState) {
                window.removeEventListener('popstate', eventHandlersRef.current.popState);
              }
              
              // Navigate after a short delay
              setTimeout(() => {
                navigate(-1);
              }, 100);
            }}
            style={{
              fontWeight: "600",
            }}
          >
            Thoát không lưu
          </Button>
        ]}
        width={500}
        style={{ top: 50 }}
      >
        <div style={{ padding: "20px 0" }}>
          <Alert
            message="Bạn đang cố gắng rời khỏi bài thi"
            description={
              <div style={{ marginTop: "12px" }}>
                <p style={{ margin: "8px 0", color: "#4b5563" }}>
                  <strong>Tiến trình hiện tại:</strong>
                </p>
                <ul style={{ margin: "8px 0", paddingLeft: "20px", color: "#6b7280" }}>
                  <li>Đã trả lời: <strong>{Object.keys(userAnswers).length}/{exam?.questions?.length || 0}</strong> câu</li>
                  <li>Thời gian còn lại: <strong>{formatTime(remainingTime)}</strong></li>
                  <li>Đã đánh dấu: <strong>{flaggedQuestions.length}</strong> câu</li>
                </ul>
                <p style={{ margin: "12px 0 4px 0", color: "#dc2626", fontWeight: "500" }}>
                  ⚠️ Nếu thoát mà không lưu, bạn sẽ mất toàn bộ tiến trình làm bài!
                </p>
              </div>
            }
            type="warning"
            showIcon
            style={{ marginBottom: "16px" }}
          />
        </div>
      </Modal>
    </Layout>
  );
};

export default ExamDetail;