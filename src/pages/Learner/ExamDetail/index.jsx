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
  PanelLeftClose,
  PanelRightClose,
} from "lucide-react";
import learnerExamService from "../../../services/learnerExamService";
import useAchievementNotifications from "../../../hooks/useAchievementNotifications";
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const timerRef = useRef(null);
  const eventHandlersRef = useRef({ beforeUnload: null, popState: null });
  const { recordCompleteTest } = useAchievementNotifications();

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
        const message =
          "Bạn đang làm bài thi. Dữ liệu có thể bị mất nếu rời khỏi trang này. Bạn có chắc chắn muốn rời khỏi không?";
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
      window.addEventListener("beforeunload", handleBeforeUnload);
      window.addEventListener("popstate", handlePopState);

      // Push initial state to handle back button
      window.history.pushState(null, "", window.location.href);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [examStarted, examSubmitted, isExiting]);

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

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [examStarted, examSubmitted, isExiting]);

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

  // Set document title when exam data is loaded
  useEffect(() => {
    if (loading) {
      document.title = "Đang tải bài thi... | TOEIC Learning Platform";
    } else if (exam && exam.name) {
      document.title = `${exam.name} | TOEIC Learning Platform`;
    } else if (error) {
      document.title = "Lỗi tải bài thi | TOEIC Learning Platform";
    } else {
      document.title = "Chi tiết bài thi | TOEIC Learning Platform";
    }
  }, [exam, error, loading]);

  const startExam = () => {
    setExamStarted(true);
    document.title = `Đang làm: ${
      exam ? exam.name : "Bài thi TOEIC"
    } | TOEIC Learning Platform`;
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
      // API trả về: numCorrectAnswers, numWrongAnswers, numSkippedQuestions, 
      // numListeningCorrectAnswers, numReadingCorrectAnswers
      const totalQuestionsCount = response.details?.totalQuestions || exam.questions.length;
      
      const resultData = {
        scores: response.scores || {
          listening: 0,
          reading: 0,
          total: 0,
        },
        details: {
          correct: response.details?.numCorrectAnswers || 0,
          wrong: response.details?.numWrongAnswers || 0,
          skipped: response.details?.numSkippedQuestions || 0,
          listeningCorrect: response.details?.numListeningCorrectAnswers || 0,
          readingCorrect: response.details?.numReadingCorrectAnswers || 0,
          totalQuestions: totalQuestionsCount,
        },
        userExamId: response.userExamId,
        message: response.message,
        completedAt: response.completedAt,
        // Calculate additional metrics for UI
        totalQuestions: totalQuestionsCount,
        percentage: Math.round(
          ((response.details?.numCorrectAnswers || 0) * 100) / totalQuestionsCount
        ),
        correctCount: response.details?.numCorrectAnswers || 0,
        incorrectCount: response.details?.numWrongAnswers || 0,
        unansweredCount: response.details?.numSkippedQuestions || 0,
        listeningScore: response.scores?.listening || 0,
        readingScore: response.scores?.reading || 0,
        totalScore: response.scores?.total || 0,
        listeningCorrect: response.details?.numListeningCorrectAnswers || 0,
        readingCorrect: response.details?.numReadingCorrectAnswers || 0,
        timeSpent: exam.duration * 60 - remainingTime, // Calculate actual time spent
      };

      setExamResult(resultData);

      // Update document title when exam is submitted
      document.title = `Kết quả: ${
        exam ? exam.name : "Bài thi TOEIC"
      } | TOEIC Learning Platform`;

      // Ghi nhận hoàn thành bài test cho streak với notification
      try {
        const learnerToken = localStorage.getItem("learnerToken");
        if (learnerToken) {
          const decoded = JSON.parse(atob(learnerToken.split(".")[1]));
          const userId = decoded.id;
          const score = resultData.totalScore || 0;
          const examType = exam?.examType || "TOEIC";

          await recordCompleteTest(userId, score, examType);
          console.log(
            "✅ Đã ghi nhận hoàn thành bài test cho streak với notification"
          );
        }
      } catch (streakError) {
        console.warn("⚠️ Không thể ghi nhận streak bài test:", streakError);
        // Không làm gián đoạn flow nộp bài nếu streak service lỗi
      }

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
      <Content 
        style={{ 
          padding: "24px",
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-bg-secondary)"
        }}
      >
        <div style={{ maxWidth: "500px", width: "100%", textAlign: "center" }}>
          <Card
            style={{
              borderRadius: "16px",
              boxShadow: "var(--shadow-lg)",
              border: "1px solid var(--color-border-light)",
            }}
          >
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {/* Error Icon */}
              <div 
                style={{
                  width: "80px",
                  height: "80px",
                  margin: "0 auto",
                  borderRadius: "50%",
                  background: "var(--color-danger-bg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AlertCircle size={40} style={{ color: "var(--color-danger)" }} />
              </div>

              {/* Error Message */}
              <div>
                <Title level={3} style={{ color: "var(--color-text-primary)", marginBottom: "8px" }}>
                  Không thể tải bài thi
                </Title>
                <Text style={{ color: "var(--color-text-secondary)", fontSize: "15px" }}>
                  {error}
                </Text>
              </div>

              {/* Divider */}
              <div style={{ width: "100%", height: "1px", background: "var(--color-border-light)" }} />

              {/* Actions */}
              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <Button 
                  type="primary" 
                  size="large"
                  icon={<ArrowLeft size={18} />}
                  onClick={() => navigate(-1)}
                  style={{
                    width: "100%",
                    height: "48px",
                    borderRadius: "8px",
                    fontSize: "15px",
                    fontWeight: "600",
                    background: "var(--color-primary)",
                    borderColor: "var(--color-primary)",
                    color: "#FFFFFF",
                  }}
                >
                  Quay lại
                </Button>
                
                <Button 
                  size="large"
                  icon={<RotateCcw size={18} />}
                  onClick={() => window.location.reload()}
                  style={{
                    width: "100%",
                    height: "48px",
                    borderRadius: "8px",
                    fontSize: "15px",
                    fontWeight: "500",
                    background: "var(--color-bg-primary)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  Thử lại
                </Button>
              </Space>

              {/* Help Text */}
              <Text type="secondary" style={{ fontSize: "13px" }}>
                Nếu vấn đề vẫn tiếp tục, vui lòng liên hệ hỗ trợ
              </Text>
            </Space>
          </Card>
        </div>
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
    console.log("🚀 ~ ExamDetail ~ examResult:", examResult);

    return (
      <Content style={{ padding: "24px", background: "var(--color-bg-secondary)" }}>
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
            background: "#2C5F8D",
            border: "none",
          }}
        >
          <Space direction="vertical" size="large">
            <div style={{ color: "var(--color-bg-primary)" }}>
              <CheckCircle
                size={48}
                style={{ color: "var(--color-success)", marginBottom: "16px" }}
              />
              <Title level={2} style={{ color: "var(--color-bg-primary)", margin: 0 }}>
                Hoàn thành bài thi!
              </Title>
              <Title level={3} style={{ color: "var(--color-bg-primary)", margin: "8px 0" }}>
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
                <div style={{ color: "var(--color-bg-primary)" }}>
                  <Title level={4} style={{ color: "var(--color-bg-primary)", margin: "8px 0" }}>
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
                      <Volume2 size={20} style={{ color: "var(--color-primary)" }} />
                      <Title level={5} style={{ margin: 0 }}>
                        LISTENING
                      </Title>
                    </Space>
                    <Title level={3} style={{ margin: 0, color: "var(--color-primary)" }}>
                      {examResult.listeningScore}/495
                    </Title>
                    <Progress
                      percent={(examResult.listeningScore / 495) * 100}
                      strokeColor="var(--color-primary)"
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
                      <BookOpen size={20} style={{ color: "var(--color-warning)" }} />
                      <Title level={5} style={{ margin: 0 }}>
                        READING
                      </Title>
                    </Space>
                    <Title level={3} style={{ margin: 0, color: "var(--color-warning)" }}>
                      {examResult.readingScore}/495
                    </Title>
                    <Progress
                      percent={(examResult.readingScore / 495) * 100}
                      strokeColor="var(--color-warning)"
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
                      "#2C5F8D",
                    border: "none",
                    textAlign: "center",
                  }}
                >
                  <Space direction="vertical">
                    <Title level={4} style={{ color: "var(--color-bg-primary)", margin: 0 }}>
                      Tổng điểm TOEIC:{" "}
                      <Badge
                        count={`${examResult.totalScore}/990`}
                        style={{ backgroundColor: "var(--color-success)", fontSize: "16px" }}
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
              style={{ marginRight: "8px", color: "var(--color-primary)" }}
            />
            Thống kê chi tiết
          </Title>
          <Row gutter={[16, 16]}>
            <Col xs={12} md={6}>
              <Card
                size="small"
                style={{ background: "var(--color-success-bg)", border: "1px solid #b7eb8f" }}
              >
                <Statistic
                  title="Câu đúng"
                  value={examResult.correctCount}
                  prefix={
                    <CheckCircle size={20} style={{ color: "var(--color-success)" }} />
                  }
                  valueStyle={{ color: "var(--color-success)", fontWeight: "bold" }}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card
                size="small"
                style={{ background: "var(--color-danger-bg)", border: "1px solid #ffccc7" }}
              >
                <Statistic
                  title="Câu sai"
                  value={examResult.incorrectCount}
                  prefix={<XCircle size={20} style={{ color: "var(--color-danger)" }} />}
                  valueStyle={{ color: "var(--color-danger)", fontWeight: "bold" }}
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
                  prefix={<HelpCircle size={20} style={{ color: "var(--color-warning)" }} />}
                  valueStyle={{ color: "var(--color-warning)", fontWeight: "bold" }}
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
                  prefix={<Timer size={20} style={{ color: "var(--color-primary)" }} />}
                  valueStyle={{ color: "var(--color-primary)", fontWeight: "bold" }}
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
              style={{ marginRight: "8px", color: "var(--color-primary)" }}
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
                  <span style={{ color: "var(--color-success)" }}>
                    Đúng ({examResult.correctCount})
                  </span>
                ),
              },
              {
                key: "incorrect",
                label: (
                  <span style={{ color: "var(--color-danger)" }}>
                    Sai ({examResult.incorrectCount})
                  </span>
                ),
              },
              {
                key: "unanswered",
                label: (
                  <span style={{ color: "var(--color-warning)" }}>
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
                        ? "var(--color-warning)"
                        : isCorrect
                        ? "var(--color-success)"
                        : "var(--color-danger)"
                    }`,
                    background: !isAnswered
                      ? "#fffbf0"
                      : isCorrect
                      ? "var(--color-success-bg)"
                      : "var(--color-danger-bg)",
                  }}
                >
                  <Row gutter={[16, 16]}>
                    <Col span={2}>
                      <div style={{ textAlign: "center" }}>
                        <Badge
                          count={index + 1}
                          style={{
                            backgroundColor: !isAnswered
                              ? "var(--color-warning)"
                              : isCorrect
                              ? "var(--color-success)"
                              : "var(--color-danger)",
                            fontSize: "12px",
                          }}
                        />
                        <div style={{ marginTop: "8px" }}>
                          {!isAnswered ? (
                            <HelpCircle
                              size={20}
                              style={{ color: "var(--color-warning)" }}
                            />
                          ) : isCorrect ? (
                            <CheckCircle
                              size={20}
                              style={{ color: "var(--color-success)" }}
                            />
                          ) : (
                            <XCircle size={20} style={{ color: "var(--color-danger)" }} />
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
                                      background: "var(--color-bg-secondary)",
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
                                        ? "var(--color-success)"
                                        : "var(--color-danger)"
                                      : isCorrectAnswer
                                      ? "var(--color-success)"
                                      : "var(--color-border)",
                                    background: isUserSelected
                                      ? isCorrectAnswer
                                        ? "var(--color-success-bg)"
                                        : "var(--color-danger-bg)"
                                      : isCorrectAnswer
                                      ? "var(--color-success-bg)"
                                      : "var(--color-bg-hover)",
                                  }}
                                >
                                  <Space>
                                    <Tag color="blue">{optionLetter}</Tag>
                                    <Text>{option.text}</Text>
                                    {isUserSelected &&
                                      (isCorrectAnswer ? (
                                        <CheckCircle
                                          size={16}
                                          style={{ color: "var(--color-success)" }}
                                        />
                                      ) : (
                                        <XCircle
                                          size={16}
                                          style={{ color: "var(--color-danger)" }}
                                        />
                                      ))}
                                    {!isUserSelected && isCorrectAnswer && (
                                      <CheckCircle
                                        size={16}
                                        style={{ color: "var(--color-success)" }}
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
                                {/* <TextHighlighter
                                  containerId={`explanation-${question.id}`}
                                > */}
                                {question.explanation}
                                {/* </TextHighlighter> */}
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
                style={{ background: "var(--color-primary)", borderColor: "var(--color-primary)" }}
              >
                Thêm bài thi luyện tập
              </Button>
              <Button
                type="default"
                size="large"
                icon={<RotateCcw size={16} />}
                onClick={() => window.location.reload()}
                style={{
                  background: "var(--color-success)",
                  borderColor: "var(--color-success)",
                  color: "var(--color-bg-primary)",
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
      <Content style={{ padding: "24px", background: "var(--color-bg-secondary)" }}>
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
        <div
          className="exam-detail-container"
          style={{ border: "none", borderBottom: "none", borderTop: "none" }}
        >
          <Card
            style={{
              background: "#2C5F8D",
              borderRadius: "16px",
              marginBottom: "24px",
              color: "var(--color-bg-primary)",
              border: "none",
              position: "relative",
              overflow: "hidden",
            }}
            styles={{
              body: {
                padding: "24px",
                borderBottom: "none",
                border: "none",
              },
            }}
            bodyStyle={{
              border: "none",
              borderBottom: "none",
              borderTop: "none",
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
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
                opacity: 0.3,
              }}
            />

            <Row
              align="middle"
              gutter={[24, 16]}
              style={{ position: "relative", zIndex: 1 }}
            >
              <Col xs={24} md={16}>
                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: "100%" }}
                >
                  <Title
                    level={2}
                    style={{
                      color: "var(--color-bg-primary)",
                      marginBottom: "8px",
                      fontSize: "1.8rem",
                      fontWeight: "bold",
                      borderBottom: "none",
                      paddingBottom: "0",
                    }}
                  >
                    {exam.name}
                  </Title>

                  <Paragraph
                    style={{
                      color: "rgba(255,255,255,0.9)",
                      fontSize: "16px",
                      marginBottom: "16px",
                      lineHeight: "1.4",
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
                        color: "var(--color-bg-primary)",
                        backdropFilter: "blur(10px)",
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
                        color: "var(--color-bg-primary)",
                        backdropFilter: "blur(10px)",
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
                        color: "var(--color-bg-primary)",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <Target size={14} style={{ marginRight: "6px" }} />
                      {exam.type === "full-test" ? "Full Test" : "Mini Test"}
                    </Tag>
                  </Space>
                </Space>
              </Col>

              <Col xs={24} md={8} style={{ textAlign: "center" }}>
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: "100%" }}
                >
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
                      color: "var(--color-primary)",
                      boxShadow: "0 4px 16px rgba(255,255,255,0.3)",
                    }}
                  >
                    Bắt đầu bài thi
                  </Button>

                  <Link to="/learner/exams">
                    <Button
                      size="middle"
                      icon={<ArrowLeft size={14} />}
                      style={{
                        background: "var(--color-bg-primary)",
                        border: "2px solid rgba(255,255,255,0.8)",
                        color: "var(--color-brand-purple)",
                        borderRadius: "20px",
                        fontWeight: "500",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
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
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
            <Col xs={24} md={12}>
              <Card
                size="small"
                style={{
                  borderRadius: "12px",
                  border: "1px solid #e6f4ff",
                  background: "#f0f7ff",
                }}
              >
                <Space align="start">
                  <BookOpen
                    size={20}
                    style={{ color: "var(--color-primary)", marginTop: "2px" }}
                  />
                  <div>
                    <Title
                      level={5}
                      style={{ marginBottom: "8px", color: "var(--color-primary)" }}
                    >
                      Hướng dẫn làm bài
                    </Title>
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: "16px",
                        fontSize: "12px",
                        color: "var(--color-text-secondary)",
                      }}
                    >
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
                  background: "var(--color-warning-bg)",
                }}
              >
                <Space align="start">
                  <Target
                    size={20}
                    style={{ color: "var(--color-chart-6)", marginTop: "2px" }}
                  />
                  <div>
                    <Title
                      level={5}
                      style={{ marginBottom: "8px", color: "var(--color-chart-6)" }}
                    >
                      Lưu ý quan trọng
                    </Title>
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: "16px",
                        fontSize: "12px",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      <li>Quản lý thời gian hợp lý</li>
                      <li>Kiểm tra kỹ trước khi nộp</li>
                      <li>Không thể sửa sau khi nộp bài</li>
                    </ul>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>

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

  // Main exam view rendering
  // )}
  // ...existing code...

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      {/* Enhanced Exam Header */}
      <div
        style={{
          background: "#2C5F8D",
          padding: "12px 20px",
          color: "var(--color-bg-primary)",
          boxShadow: "0 4px 20px rgba(102, 126, 234, 0.3)",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          width: "100%",
          zIndex: 1000,
          height: "72px",
          display: "flex",
          alignItems: "center",
          borderBottom: "3px solid rgba(255,255,255,0.1)",
        }}
      >
        <Row justify="space-between" align="middle" style={{ width: "100%" }}>
          <Col flex="auto">
            <Space direction="vertical" size={0}>
              <Title
                level={4}
                style={{ color: "var(--color-bg-primary)", margin: 0, fontWeight: "600" }}
              >
                {exam.name}
              </Title>
              <Text
                style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px" }}
              >
                Câu {currentQuestionIndex + 1} /{" "}
                {exam.questions ? exam.questions.length : 0}
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
                        color: "var(--color-bg-primary)",
                        fontSize: "12px",
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
                  background:
                    remainingTime < 300
                      ? "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)"
                      : remainingTime < 900
                      ? "linear-gradient(135deg, #ffa726 0%, #ff9800 100%)"
                      : "linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)",
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
                      color: "var(--color-bg-primary)",
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
              <span style={{ fontWeight: "600" }}>
                Bảo vệ tiến trình làm bài
              </span>
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
      <Content
        style={{
          padding: "20px",
          paddingTop: "92px",
          minHeight: "calc(100vh - 72px)",
          overflow: "auto",
        }}
      >
        <Row gutter={[20, 20]} style={{ minHeight: "100%" }}>
          {/* Enhanced Question Navigation Sidebar */}
          <Col
            xs={24}
            lg={sidebarCollapsed ? 1 : 6}
            xl={sidebarCollapsed ? 1 : 5}
          >
            <Card
              title={
                <Space
                  style={{ width: "100%", justifyContent: "space-between" }}
                >
                  <Space>
                    <HelpCircle size={16} />
                    <span style={{ fontWeight: "600" }}>Câu hỏi theo Part</span>
                  </Space>
                  <Button
                    type="text"
                    size="small"
                    icon={
                      sidebarCollapsed ? (
                        <PanelRightClose size={16} />
                      ) : (
                        <PanelLeftClose size={16} />
                      )
                    }
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    style={{
                      color: "#64748b",
                      border: "none",
                      boxShadow: "none",
                      padding: "4px",
                    }}
                    title={
                      sidebarCollapsed
                        ? "Mở rộng danh sách câu hỏi"
                        : "Thu gọn danh sách câu hỏi"
                    }
                  />
                </Space>
              }
              style={{
                height: "calc(100vh - 112px)",
                display:
                  window.innerWidth < 992 || sidebarCollapsed
                    ? "none"
                    : "block",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                borderRadius: "12px",
                border: "1px solid #e8f4fd",
                position: "sticky",
                top: "92px",
              }}
              headStyle={{
                background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                borderRadius: "12px 12px 0 0",
                borderBottom: "1px solid #e8f4fd",
                padding: "12px 16px",
              }}
              bodyStyle={{
                padding: "16px",
                height: "calc(100vh - 169px)",
                display: "flex",
                flexDirection: "column",
              }}
              size="small"
            >
              {/* Enhanced Legend */}
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  border: "1px solid #e2e8f0",
                  flexShrink: 0,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                }}
              >
                <Row gutter={[8, 6]}>
                  <Col span={24}>
                    <Space size="small" style={{ marginBottom: "4px" }}>
                      <div
                        style={{
                          width: "14px",
                          height: "14px",
                          background:
                            "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                          borderRadius: "3px",
                          boxShadow: "0 2px 4px rgba(24, 144, 255, 0.3)",
                        }}
                      ></div>
                      <Text
                        style={{
                          fontSize: "12px",
                          color: "#475569",
                          fontWeight: "500",
                        }}
                      >
                        Câu hiện tại
                      </Text>
                    </Space>
                  </Col>
                  <Col span={12}>
                    <Space size="small">
                      <div
                        style={{
                          width: "14px",
                          height: "14px",
                          background:
                            "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
                          borderRadius: "3px",
                          boxShadow: "0 2px 4px rgba(82, 196, 26, 0.3)",
                        }}
                      ></div>
                      <Text
                        style={{
                          fontSize: "12px",
                          color: "#475569",
                          fontWeight: "500",
                        }}
                      >
                        Đã làm
                      </Text>
                    </Space>
                  </Col>
                  <Col span={12}>
                    <Space size="small">
                      <div
                        style={{
                          width: "14px",
                          height: "14px",
                          border: "2px solid #faad14",
                          borderRadius: "3px",
                          background: "var(--color-bg-primary)",
                          boxShadow: "0 2px 4px rgba(250, 173, 20, 0.3)",
                        }}
                      ></div>
                      <Text
                        style={{
                          fontSize: "12px",
                          color: "#475569",
                          fontWeight: "500",
                        }}
                      >
                        Đánh dấu
                      </Text>
                    </Space>
                  </Col>
                </Row>
              </div>

              {/* Enhanced Question Grid Grouped by Parts */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  overflowX: "hidden",
                  maxHeight: "calc(100vh - 280px)",
                  minHeight: "400px",
                  paddingRight: "4px",
                  scrollbarWidth: "thin",
                  scrollbarColor: "#cbd5e1 #f8fafc",
                }}
              >
                <style>
                  {`
                    .question-grid::-webkit-scrollbar {
                      width: 6px;
                    }
                    .question-grid::-webkit-scrollbar-track {
                      background: #f8fafc;
                      border-radius: 3px;
                    }
                    .question-grid::-webkit-scrollbar-thumb {
                      background: #cbd5e1;
                      border-radius: 3px;
                    }
                    .question-grid::-webkit-scrollbar-thumb:hover {
                      background: #94a3b8;
                    }
                    @keyframes pulse {
                      0%, 100% { opacity: 1; }
                      50% { opacity: 0.5; }
                    }
                    @keyframes sidebarButtonPulse {
                      0%, 100% { 
                        opacity: 1; 
                        transform: scale(1);
                      }
                      50% { 
                        opacity: 0.8; 
                        transform: scale(1.05);
                      }
                    }
                  `}
                </style>
                <div
                  className="question-grid"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {/* Quick Stats Overview */}
                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid #bae6fd",
                      marginBottom: "8px",
                    }}
                  >
                    <Row gutter={8} align="middle">
                      <Col span={8}>
                        <div style={{ textAlign: "center" }}>
                          <div
                            style={{
                              fontSize: "12px",
                              fontWeight: "bold",
                              color: "var(--color-primary)",
                              marginBottom: "2px",
                            }}
                          >
                            {currentQuestionIndex + 1}
                          </div>
                          <div
                            style={{
                              fontSize: "9px",
                              color: "#64748b",
                              fontWeight: "500",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Hiện tại
                          </div>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div style={{ textAlign: "center" }}>
                          <div
                            style={{
                              fontSize: "12px",
                              fontWeight: "bold",
                              color: "var(--color-success)",
                              marginBottom: "2px",
                            }}
                          >
                            {Object.keys(userAnswers).length}
                          </div>
                          <div
                            style={{
                              fontSize: "9px",
                              color: "#64748b",
                              fontWeight: "500",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Đã làm
                          </div>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div style={{ textAlign: "center" }}>
                          <div
                            style={{
                              fontSize: "12px",
                              fontWeight: "bold",
                              color: "var(--color-warning)",
                              marginBottom: "2px",
                            }}
                          >
                            {flaggedQuestions.length}
                          </div>
                          <div
                            style={{
                              fontSize: "9px",
                              color: "#64748b",
                              fontWeight: "500",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Đánh dấu
                          </div>
                        </div>
                      </Col>
                    </Row>
                    {/* Progress Bar */}
                    <div style={{ marginTop: "8px" }}>
                      <div
                        style={{
                          width: "100%",
                          height: "4px",
                          background: "#e2e8f0",
                          borderRadius: "2px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${
                              (Object.keys(userAnswers).length /
                                (exam.questions?.length || 1)) *
                              100
                            }%`,
                            height: "100%",
                            background:
                              "linear-gradient(90deg, #52c41a 0%, #389e0d 100%)",
                            borderRadius: "2px",
                            transition: "width 0.3s ease",
                          }}
                        ></div>
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#64748b",
                          textAlign: "center",
                          marginTop: "4px",
                          fontWeight: "500",
                        }}
                      >
                        {Math.round(
                          (Object.keys(userAnswers).length /
                            (exam.questions?.length || 1)) *
                            100
                        )}
                        % Hoàn thành
                      </div>
                    </div>
                  </div>

                  {/* Question Groups by Part */}
                  {(() => {
                    // Ranges cho TOEIC dựa trên loại bài thi
                    const toeicRanges =
                      exam.type === "full-test"
                        ? [
                            {
                              id: 1,
                              name: "Photographs",
                              range: "1-6",
                              description: "Mô tả hình ảnh",
                              start: 0,
                              end: 6,
                            },
                            {
                              id: 2,
                              name: "Question-Response",
                              range: "7-31",
                              description: "Hỏi đáp",
                              start: 6,
                              end: 31,
                            },
                            {
                              id: 3,
                              name: "Conversations",
                              range: "32-70",
                              description: "Đối thoại",
                              start: 31,
                              end: 70,
                            },
                            {
                              id: 4,
                              name: "Talks",
                              range: "71-100",
                              description: "Bài nói",
                              start: 70,
                              end: 100,
                            },
                            {
                              id: 5,
                              name: "Incomplete Sentences",
                              range: "101-130",
                              description: "Hoàn thành câu",
                              start: 100,
                              end: 130,
                            },
                            {
                              id: 6,
                              name: "Text Completion",
                              range: "131-146",
                              description: "Hoàn thành đoạn văn",
                              start: 130,
                              end: 146,
                            },
                            {
                              id: 7,
                              name: "Reading Comprehension",
                              range: "147-200",
                              description: "Đọc hiểu",
                              start: 146,
                              end: 200,
                            },
                          ]
                        : [
                            // Mini test: 100 câu (50 Listening + 50 Reading)
                            {
                              id: 1,
                              name: "Photographs",
                              range: "1-13",
                              description: "Mô tả hình ảnh",
                              start: 0,
                              end: 13,
                            },
                            {
                              id: 2,
                              name: "Question-Response",
                              range: "14-25",
                              description: "Hỏi đáp",
                              start: 13,
                              end: 25,
                            },
                            {
                              id: 3,
                              name: "Conversations",
                              range: "26-37",
                              description: "Đối thoại",
                              start: 25,
                              end: 37,
                            },
                            {
                              id: 4,
                              name: "Talks",
                              range: "38-50",
                              description: "Bài nói",
                              start: 37,
                              end: 50,
                            },
                            {
                              id: 5,
                              name: "Incomplete Sentences",
                              range: "51-62",
                              description: "Hoàn thành câu",
                              start: 50,
                              end: 62,
                            },
                            {
                              id: 6,
                              name: "Text Completion",
                              range: "63-75",
                              description: "Hoàn thành đoạn văn",
                              start: 62,
                              end: 75,
                            },
                            {
                              id: 7,
                              name: "Reading Comprehension",
                              range: "76-100",
                              description: "Đọc hiểu",
                              start: 75,
                              end: 100,
                            },
                          ];

                    const totalQuestions = exam.questions?.length || 0;
                    const parts = toeicRanges
                      .map((range) => {
                        // Điều chỉnh end nếu tổng câu ít hơn (cho bài thi mini)
                        const adjustedEnd = Math.min(range.end, totalQuestions);
                        const partQuestions =
                          exam.questions?.slice(range.start, adjustedEnd) || [];

                        if (partQuestions.length > 0) {
                          const answeredInPart = partQuestions.filter(
                            (q) => userAnswers[q.id] !== undefined
                          ).length;
                          const flaggedInPart = partQuestions.filter((q) =>
                            flaggedQuestions.includes(q.id)
                          ).length;
                          const isCurrentPart =
                            currentQuestionIndex >= range.start &&
                            currentQuestionIndex < adjustedEnd;

                          return {
                            id: range.id,
                            name: `Part ${range.id}`,
                            description: range.name,
                            range: range.range,
                            questions: partQuestions,
                            startIndex: range.start,
                            endIndex: adjustedEnd,
                            answeredCount: answeredInPart,
                            flaggedCount: flaggedInPart,
                            isCurrentPart,
                            progress:
                              partQuestions.length > 0
                                ? (answeredInPart / partQuestions.length) * 100
                                : 0,
                          };
                        }
                        return null;
                      })
                      .filter((part) => part !== null); // Chỉ hiển thị part có câu

                    return parts.map((part) => (
                      <div
                        key={part.id}
                        style={{
                          background: part.isCurrentPart
                            ? "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)"
                            : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                          borderRadius: "10px",
                          border: part.isCurrentPart
                            ? "2px solid #f59e0b"
                            : "1px solid #e2e8f0",
                          overflow: "hidden",
                          boxShadow: part.isCurrentPart
                            ? "0 4px 12px rgba(245, 158, 11, 0.15)"
                            : "0 2px 4px rgba(0,0,0,0.04)",
                          transition: "all 0.3s ease",
                        }}
                      >
                        {/* Part Header */}
                        <div
                          style={{
                            padding: "10px 12px",
                            background: part.isCurrentPart
                              ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                              : "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                            borderBottom: "1px solid #e2e8f0",
                            cursor: "pointer",
                          }}
                        >
                          <Row align="middle" gutter={8}>
                            <Col flex="auto">
                              <Space direction="vertical" size={0}>
                                <div
                                  style={{
                                    fontSize: "12px",
                                    fontWeight: "700",
                                    color: part.isCurrentPart
                                      ? "var(--color-bg-primary)"
                                      : "#1e293b",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                  }}
                                >
                                  {part.name}
                                </div>
                                <div
                                  style={{
                                    fontSize: "10px",
                                    color: part.isCurrentPart
                                      ? "rgba(255,255,255,0.9)"
                                      : "#64748b",
                                    fontWeight: "500",
                                  }}
                                >
                                  {part.description} • {part.questions.length}{" "}
                                  câu
                                </div>
                              </Space>
                            </Col>
                            <Col>
                              <div
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "bold",
                                  color: part.isCurrentPart
                                    ? "var(--color-bg-primary)"
                                    : "#374151",
                                  background: part.isCurrentPart
                                    ? "rgba(255,255,255,0.2)"
                                    : "#f1f5f9",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                }}
                              >
                                {part.answeredCount}/{part.questions.length}
                              </div>
                            </Col>
                          </Row>

                          {/* Part Progress Bar */}
                          <div style={{ marginTop: "6px" }}>
                            <div
                              style={{
                                width: "100%",
                                height: "3px",
                                background: part.isCurrentPart
                                  ? "rgba(255,255,255,0.3)"
                                  : "#e2e8f0",
                                borderRadius: "2px",
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  width: `${part.progress}%`,
                                  height: "100%",
                                  background: part.isCurrentPart
                                    ? "linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)"
                                    : "linear-gradient(90deg, #52c41a 0%, #389e0d 100%)",
                                  borderRadius: "2px",
                                  transition: "width 0.4s ease",
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* Questions Grid */}
                        <div
                          style={{
                            padding: "8px",
                            background: part.isCurrentPart
                              ? "rgba(245, 158, 11, 0.02)"
                              : "transparent",
                          }}
                        >
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                part.questions.length > 15
                                  ? "repeat(5, 1fr)"
                                  : part.questions.length > 10
                                  ? "repeat(4, 1fr)"
                                  : "repeat(3, 1fr)",
                              gap: "4px",
                            }}
                          >
                            {part.questions.map((q, partIndex) => {
                              const globalIndex = part.startIndex + partIndex;
                              const isActive =
                                globalIndex === currentQuestionIndex;
                              const isAnswered =
                                userAnswers[q.id] !== undefined;
                              const isFlagged = flaggedQuestions.includes(q.id);

                              return (
                                <Tooltip
                                  key={q.id}
                                  title={
                                    <div style={{ textAlign: "center" }}>
                                      <div
                                        style={{
                                          fontWeight: "600",
                                          marginBottom: "4px",
                                        }}
                                      >
                                        Câu {globalIndex + 1}
                                      </div>
                                      <div
                                        style={{
                                          fontSize: "12px",
                                          opacity: 0.9,
                                        }}
                                      >
                                        {isAnswered
                                          ? "Đã trả lời"
                                          : "Chưa trả lời"}
                                        {isFlagged && " • Đã đánh dấu"}
                                      </div>
                                    </div>
                                  }
                                  placement="top"
                                >
                                  <button
                                    onClick={() => goToQuestion(globalIndex)}
                                    style={{
                                      width: "100%",
                                      height: "28px",
                                      border: `2px solid ${
                                        isFlagged
                                          ? "var(--color-warning)"
                                          : isActive
                                          ? "var(--color-primary)"
                                          : isAnswered
                                          ? "var(--color-success)"
                                          : "#d1d5db"
                                      }`,
                                      background: isActive
                                        ? "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)"
                                        : isAnswered
                                        ? "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)"
                                        : "var(--color-bg-primary)",
                                      color:
                                        isActive || isAnswered
                                          ? "var(--color-bg-primary)"
                                          : "#374151",
                                      borderRadius: "6px",
                                      fontSize: "11px",
                                      fontWeight: "700",
                                      cursor: "pointer",
                                      transition:
                                        "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                      position: "relative",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      padding: "0",
                                      boxShadow:
                                        isActive || isAnswered
                                          ? "0 2px 6px rgba(0,0,0,0.15)"
                                          : "0 1px 2px rgba(0,0,0,0.08)",
                                      transform: isActive
                                        ? "scale(1.1)"
                                        : "scale(1)",
                                    }}
                                    onMouseEnter={(e) => {
                                      if (!isActive) {
                                        e.target.style.transform =
                                          "scale(1.05) translateY(-1px)";
                                        e.target.style.boxShadow =
                                          "0 3px 8px rgba(0,0,0,0.2)";
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!isActive) {
                                        e.target.style.transform =
                                          "scale(1) translateY(0)";
                                        e.target.style.boxShadow =
                                          isActive || isAnswered
                                            ? "0 2px 6px rgba(0,0,0,0.15)"
                                            : "0 1px 2px rgba(0,0,0,0.08)";
                                      }
                                    }}
                                  >
                                    {globalIndex + 1}
                                    {isFlagged && (
                                      <Flag
                                        size={6}
                                        style={{
                                          position: "absolute",
                                          top: "-1px",
                                          right: "-1px",
                                          color: "var(--color-warning)",
                                          background: "var(--color-bg-primary)",
                                          borderRadius: "50%",
                                          padding: "1px",
                                          boxShadow:
                                            "0 1px 2px rgba(0,0,0,0.3)",
                                          border: "1px solid #faad14",
                                        }}
                                      />
                                    )}
                                    {isActive && (
                                      <div
                                        style={{
                                          position: "absolute",
                                          top: "-2px",
                                          left: "-2px",
                                          width: "8px",
                                          height: "8px",
                                          background: "var(--color-bg-primary)",
                                          borderRadius: "50%",
                                          border: "2px solid #1890ff",
                                          animation: "pulse 2s infinite",
                                        }}
                                      ></div>
                                    )}
                                  </button>
                                </Tooltip>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </Card>
          </Col>

          {/* Enhanced Question Content */}
          <Col
            xs={24}
            lg={sidebarCollapsed ? 23 : 18}
            xl={sidebarCollapsed ? 23 : 19}
          >
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
                  background:
                    "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                  margin: "-24px -24px 20px -24px",
                  padding: "16px 24px",
                  borderRadius: "12px 12px 0 0",
                }}
              >
                <Row justify="space-between" align="middle">
                  <Col>
                    <Space direction="vertical" size={0}>
                      <Title
                        level={4}
                        style={{
                          margin: 0,
                          color: "#1e293b",
                          fontWeight: "600",
                        }}
                      >
                        Câu {currentQuestionIndex + 1} /{" "}
                        {exam.questions ? exam.questions.length : 0}
                      </Title>
                      <Text style={{ color: "#64748b", fontSize: "12px" }}>
                        {exam.type === "full-test"
                          ? "TOEIC Full Test"
                          : "Mini Test"}
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
                        borderColor: flaggedQuestions.includes(
                          currentQuestion.id
                        )
                          ? "var(--color-warning)"
                          : "#d1d5db",
                        background: flaggedQuestions.includes(
                          currentQuestion.id
                        )
                          ? "linear-gradient(135deg, #faad14 0%, #f59e0b 100%)"
                          : "var(--color-bg-primary)",
                        color: flaggedQuestions.includes(currentQuestion.id)
                          ? "var(--color-bg-primary)"
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
                          e.target.style.borderColor = "var(--color-warning)";
                          e.target.style.color = "var(--color-warning)";
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
              <div
                style={{
                  flex: 1,
                  overflow: "visible",
                  paddingRight: "8px",
                  scrollBehavior: "smooth",
                  minHeight: "400px",
                }}
              >
                {/* Enhanced Question Media */}
                <Space
                  direction="vertical"
                  size="large"
                  style={{ width: "100%", marginBottom: "24px" }}
                >
                  {currentQuestion.image && (
                    <div
                      style={{
                        position: "relative",
                        display: "inline-block",
                        width: "100%",
                      }}
                    >
                      <Card
                        size="small"
                        style={{
                          background:
                            "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
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
                            pointerEvents: "none", // Ngăn tương tác
                          }}
                          onContextMenu={(e) => e.preventDefault()} // Chặn right-click
                          onDragStart={(e) => e.preventDefault()} // Chặn kéo
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
                              <div style={{ marginTop: "16px" }}>
                                Đang tải hình ảnh...
                              </div>
                            </div>
                          }
                        />
                      </Card>
                    </div>
                  )}

                  {currentQuestion.audio && (
                    <Card
                      size="small"
                      style={{
                        background:
                          "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                        border: "1px solid #bae6fd",
                        borderRadius: "12px",
                        boxShadow: "0 2px 8px rgba(59, 130, 246, 0.1)",
                      }}
                      bodyStyle={{ padding: "16px" }}
                    >
                      <Space
                        direction="vertical"
                        size="small"
                        style={{ width: "100%" }}
                      >
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
                <div style={{ marginBottom: "28px" }}>
                  <Card
                    size="small"
                    style={{
                      background:
                        "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
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
                      {/* <TextHighlighter containerId="question-text"> */}
                      {cleanQuestionText(currentQuestion.text)}
                      {/* </TextHighlighter> */}
                    </Title>
                  </Card>
                </div>

                {/* Compact Answer Options */}
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                    borderRadius: "12px",
                    padding: "16px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div style={{ marginBottom: "12px" }}>
                    <Space>
                      <CheckCircle size={16} style={{ color: "#3b82f6" }} />
                      <Text
                        style={{
                          color: "#1e293b",
                          fontWeight: "600",
                          fontSize: "12px",
                        }}
                      >
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
                          const optionLetter = String.fromCharCode(
                            65 + optionIndex
                          );
                          const isSelected =
                            userAnswers[currentQuestion.id] === option.id;

                          return (
                            <Col xs={24} sm={12} key={option.id}>
                              <Radio
                                value={option.id}
                                style={{
                                  width: "100%",
                                  padding: "8px 12px",
                                  borderRadius: "8px",
                                  border: "1px solid",
                                  borderColor: isSelected
                                    ? "#3b82f6"
                                    : "#d1d5db",
                                  background: isSelected
                                    ? "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)"
                                    : "var(--color-bg-primary)",
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
                                      color: isSelected ? "var(--color-bg-primary)" : "#64748b",
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
                                      fontSize: "12px",
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
                  background:
                    "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                  margin: "24px -24px 0 -24px",
                  padding: "20px 24px",
                  borderRadius: "0 0 12px 12px",
                  boxShadow: "0 -2px 8px rgba(0,0,0,0.02)",
                }}
              >
                <div
                  className={
                    window.innerWidth < 576 ? "navigation-buttons-mobile" : ""
                  }
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "16px",
                    ...(window.innerWidth < 576 && {
                      flexDirection: "column",
                      gap: "12px",
                    }),
                  }}
                >
                  {/* Previous Button */}
                  <div
                    style={{
                      flex: window.innerWidth < 576 ? "1 1 100%" : "0 0 auto",
                      width: window.innerWidth < 576 ? "100%" : "auto",
                    }}
                  >
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
                        fontSize: "12px",
                        border:
                          currentQuestionIndex === 0
                            ? "2px solid #e5e7eb"
                            : "2px solid #3b82f6",
                        background:
                          currentQuestionIndex === 0
                            ? "#f9fafb"
                            : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                        color:
                          currentQuestionIndex === 0 ? "#9ca3af" : "#3b82f6",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        boxShadow:
                          currentQuestionIndex === 0
                            ? "none"
                            : "0 2px 8px rgba(59, 130, 246, 0.15)",
                      }}
                      onMouseEnter={(e) => {
                        if (currentQuestionIndex !== 0) {
                          e.target.style.background =
                            "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)";
                          e.target.style.color = "var(--color-bg-primary)";
                          e.target.style.transform = "translateY(-2px)";
                          e.target.style.boxShadow =
                            "0 4px 16px rgba(59, 130, 246, 0.3)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentQuestionIndex !== 0) {
                          e.target.style.background =
                            "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)";
                          e.target.style.color = "#3b82f6";
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow =
                            "0 2px 8px rgba(59, 130, 246, 0.15)";
                        }
                      }}
                    >
                      Câu trước
                    </Button>
                  </div>

                  {/* Center Buttons */}
                  <div
                    className={
                      window.innerWidth < 576 ? "navigation-center-mobile" : ""
                    }
                    style={{
                      display: "flex",
                      gap: "12px",
                      flex: window.innerWidth < 576 ? "1 1 100%" : "1 1 auto",
                      justifyContent: "center",
                      flexWrap: "wrap",
                      width: window.innerWidth < 576 ? "100%" : "auto",
                      ...(window.innerWidth < 576 && {
                        flexDirection: "column",
                        gap: "8px",
                      }),
                    }}
                  >
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
                        background:
                          "linear-gradient(135deg, #10b981 0%, #047857 100%)",
                        color: "var(--color-bg-primary)",
                        boxShadow: "0 4px 16px rgba(16, 185, 129, 0.3)",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        position: "relative",
                        overflow: "hidden",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform =
                          "translateY(-2px) scale(1.02)";
                        e.target.style.boxShadow =
                          "0 6px 20px rgba(16, 185, 129, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "translateY(0) scale(1)";
                        e.target.style.boxShadow =
                          "0 4px 16px rgba(16, 185, 129, 0.3)";
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
                        fontSize: "12px",
                        border:
                          !exam.questions ||
                          currentQuestionIndex === exam.questions.length - 1
                            ? "2px solid #e5e7eb"
                            : "2px solid #3b82f6",
                        background:
                          !exam.questions ||
                          currentQuestionIndex === exam.questions.length - 1
                            ? "#f9fafb"
                            : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                        color:
                          !exam.questions ||
                          currentQuestionIndex === exam.questions.length - 1
                            ? "#9ca3af"
                            : "#3b82f6",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        boxShadow:
                          !exam.questions ||
                          currentQuestionIndex === exam.questions.length - 1
                            ? "none"
                            : "0 2px 8px rgba(59, 130, 246, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                      }}
                      onMouseEnter={(e) => {
                        if (
                          exam.questions &&
                          currentQuestionIndex !== exam.questions.length - 1
                        ) {
                          e.target.style.background =
                            "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)";
                          e.target.style.color = "var(--color-bg-primary)";
                          e.target.style.transform = "translateY(-2px)";
                          e.target.style.boxShadow =
                            "0 4px 16px rgba(59, 130, 246, 0.3)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (
                          exam.questions &&
                          currentQuestionIndex !== exam.questions.length - 1
                        ) {
                          e.target.style.background =
                            "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)";
                          e.target.style.color = "#3b82f6";
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow =
                            "0 2px 8px rgba(59, 130, 246, 0.15)";
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

      {/* Floating Button to Expand Sidebar */}
      {sidebarCollapsed && window.innerWidth >= 992 && (
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<PanelRightClose size={20} />}
          onClick={() => setSidebarCollapsed(false)}
          style={{
            position: "fixed",
            top: "100px",
            left: "20px",
            zIndex: 1000,
            background: "#2C5F8D",
            border: "none",
            boxShadow: "0 4px 20px rgba(102, 126, 234, 0.4)",
            animation: "sidebarButtonPulse 2s infinite",
            transform: "scale(1)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "scale(1.1)";
            e.target.style.boxShadow = "0 6px 25px rgba(102, 126, 234, 0.6)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = "0 4px 20px rgba(102, 126, 234, 0.4)";
          }}
          title="Mở rộng danh sách câu hỏi"
        />
      )}

      {/* Enhanced Confirm Submit Modal */}
      <Modal
        title={
          <div
            style={{
              textAlign: "center",
              padding: "8px 0",
            }}
          >
            <Space direction="vertical" size="small">
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #faad14 0%, #f59e0b 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                  boxShadow: "0 4px 12px rgba(250, 173, 20, 0.3)",
                }}
              >
                <AlertCircle size={24} style={{ color: "var(--color-bg-primary)" }} />
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
          },
        }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div style={{ textAlign: "center", padding: "0 20px" }}>
            <Text
              style={{
                fontSize: "16px",
                color: "#64748b",
                lineHeight: "1.6",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Bạn có chắc chắn muốn nộp bài thi không?
            </Text>
            <Text
              style={{
                fontSize: "12px",
                color: "#94a3b8",
                lineHeight: "1.5",
              }}
            >
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
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 8px auto",
                      boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
                    }}
                  >
                    <CheckCircle size={20} style={{ color: "var(--color-bg-primary)" }} />
                  </div>
                  <Statistic
                    title={
                      <span style={{ color: "#64748b", fontSize: "12px" }}>
                        Đã trả lời
                      </span>
                    }
                    value={Object.keys(userAnswers).length}
                    suffix={`/ ${exam.questions ? exam.questions.length : 0}`}
                    valueStyle={{
                      color: "#10b981",
                      fontWeight: "bold",
                      fontSize: "18px",
                    }}
                  />
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 8px auto",
                      boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)",
                    }}
                  >
                    <XCircle size={20} style={{ color: "var(--color-bg-primary)" }} />
                  </div>
                  <Statistic
                    title={
                      <span style={{ color: "#64748b", fontSize: "12px" }}>
                        Chưa trả lời
                      </span>
                    }
                    value={
                      (exam.questions ? exam.questions.length : 0) -
                      Object.keys(userAnswers).length
                    }
                    valueStyle={{
                      color: "#ef4444",
                      fontWeight: "bold",
                      fontSize: "18px",
                    }}
                  />
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 8px auto",
                      boxShadow: "0 2px 8px rgba(245, 158, 11, 0.3)",
                    }}
                  >
                    <Flag size={20} style={{ color: "var(--color-bg-primary)" }} />
                  </div>
                  <Statistic
                    title={
                      <span style={{ color: "#64748b", fontSize: "12px" }}>
                        Đã đánh dấu
                      </span>
                    }
                    value={flaggedQuestions.length}
                    valueStyle={{
                      color: "#f59e0b",
                      fontWeight: "bold",
                      fontSize: "18px",
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
                  background: "var(--color-bg-primary)",
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
                  background:
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  borderColor: "#10b981",
                  borderRadius: "8px",
                  height: "48px",
                  paddingLeft: "24px",
                  paddingRight: "24px",
                  fontWeight: "600",
                  fontSize: "12px",
                  boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-1px)";
                  e.target.style.boxShadow =
                    "0 4px 12px rgba(16, 185, 129, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow =
                    "0 2px 8px rgba(16, 185, 129, 0.3)";
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
            <AlertCircle size={20} style={{ color: "#ef4444" }} />
            <span style={{ color: "#1f2937", fontWeight: "600" }}>
              ⚠️ Thoát khỏi bài thi?
            </span>
          </Space>
        }
        open={showExitWarning}
        onCancel={() => setShowExitWarning(false)}
        footer={[
          <Button
            key="stay"
            type="primary"
            onClick={() => setShowExitWarning(false)}
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              borderColor: "#10b981",
              color: "var(--color-bg-primary)",
              fontWeight: "600",
            }}
          >
            Tiếp tục làm bài
          </Button>,
          <Button
            key="exit"
            danger
            onClick={() => {
              setIsExiting(true);
              setShowExitWarning(false);

              // Remove event listeners using stored references
              if (eventHandlersRef.current.beforeUnload) {
                window.removeEventListener(
                  "beforeunload",
                  eventHandlersRef.current.beforeUnload
                );
              }
              if (eventHandlersRef.current.popState) {
                window.removeEventListener(
                  "popstate",
                  eventHandlersRef.current.popState
                );
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
            Thoát ngay
          </Button>,
        ]}
        width={500}
        centered
      >
        <div style={{ padding: "20px 0" }}>
          <Alert
            message="Cảnh báo"
            description={
              <div style={{ marginTop: "12px" }}>
                <p style={{ margin: "8px 0", color: "#4b5563", fontSize: "14px" }}>
                  Bạn đang cố gắng rời khỏi bài thi. Tiến trình làm bài của bạn sẽ <strong style={{ color: "#dc2626" }}>KHÔNG được lưu</strong>.
                </p>
                <div style={{ 
                  background: "#fef2f2", 
                  border: "1px solid #fecaca",
                  borderRadius: "8px",
                  padding: "12px",
                  marginTop: "12px"
                }}>
                  <p style={{ margin: "8px 0", color: "#991b1b", fontWeight: "500" }}>
                    📊 Tiến trình hiện tại:
                  </p>
                  <ul
                    style={{
                      margin: "8px 0",
                      paddingLeft: "20px",
                      color: "#6b7280",
                    }}
                  >
                    <li>
                      Đã trả lời: <strong>{Object.keys(userAnswers).length}/{exam?.questions?.length || 0}</strong> câu
                    </li>
                    <li>
                      Thời gian còn lại: <strong>{formatTime(remainingTime)}</strong>
                    </li>
                    <li>
                      Đã đánh dấu: <strong>{flaggedQuestions.length}</strong> câu
                    </li>
                  </ul>
                </div>
                <p
                  style={{
                    margin: "16px 0 4px 0",
                    color: "#dc2626",
                    fontWeight: "600",
                    fontSize: "14px",
                    textAlign: "center"
                  }}
                >
                  ⚠️ Mọi câu trả lời sẽ bị mất khi bạn thoát!
                </p>
              </div>
            }
            type="error"
            showIcon
            icon={<AlertCircle size={20} />}
          />
        </div>
      </Modal>
    </Layout>
  );
};

export default ExamDetail;
