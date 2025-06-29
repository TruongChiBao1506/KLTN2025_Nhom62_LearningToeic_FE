import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faFileAlt,
  faArrowLeft,
  faClock,
  faCheck,
  faExclamationCircle,
  faQuestionCircle,
  faChevronLeft,
  faChevronRight,
  faFlag,
  faSave,
} from "@fortawesome/free-solid-svg-icons";
import learnerExamService from "../../../services/learnerExamService";
import "./style.css";

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
            { id: 'A', text: q.optionA || 'Option A' },
            { id: 'B', text: q.optionB || 'Option B' },
            { id: 'C', text: q.optionC || 'Option C' },
            { id: 'D', text: q.optionD || 'Option D' }
          ].filter(option => option.text), // Remove empty options
          correctAnswer: q.correctOption,
          explanation: q.explanation,
          questionType: q.questionType,
          image: q.imageUrl,
          audio: q.audioUrl,
          _originalData: q
        })),
        status: "not-started", // Default status
        _originalData: response,
      };

      setExam(examData);

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
  }, [fetchExam]);
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
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToQuestion = (index) => {
    if (exam.questions && index >= 0 && index < exam.questions.length) {
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
      const answersArray = Object.entries(userAnswers).map(([questionId, selectedOption]) => ({
        questionId,
        selectedOption,
        timeSpent: 60 // Default time spent per question
      }));

      console.log('Sending answers array:', answersArray);
      
      const response = await learnerExamService.submitExam(id, answersArray);
      console.log('✅ Submit response:', response);
      
      setExamSubmitted(true);
      // Map backend response to frontend expected format
      const resultData = {
        scores: response.scores || {
          listening: 0,
          reading: 0,
          total: 0
        },
        details: response.details || {
          correct: 0,
          wrong: 0,
          skipped: 0,
          listeningCorrect: 0,
          readingCorrect: 0
        },
        userExamId: response.userExamId,
        message: response.message,
        // Calculate additional metrics for UI
        totalQuestions: exam.questions.length,
        percentage: Math.round((response.details?.correct || 0) * 100 / exam.questions.length),
        correctCount: response.details?.correct || 0,
        incorrectCount: response.details?.wrong || 0,
        unansweredCount: response.details?.skipped || 0,
        listeningScore: response.scores?.listening || 0,
        readingScore: response.scores?.reading || 0,
        totalScore: response.scores?.total || 0,
        listeningCorrect: response.details?.listeningCorrect || 0,
        readingCorrect: response.details?.readingCorrect || 0,
        timeSpent: exam.duration * 60 - remainingTime // Calculate actual time spent
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
      <div className="exam-detail-container">
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="mt-3">Đang tải bài thi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="exam-detail-container">
        <div className="alert alert-danger m-4" role="alert">
          <FontAwesomeIcon icon={faExclamationCircle} className="me-2" />
          {error}
        </div>
        <div className="text-center">
          <Link to="/learner/exams" className="btn btn-outline-primary">
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Quay lại Danh sách bài thi
          </Link>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="exam-detail-container">
        <div className="alert alert-warning m-4" role="alert">
          <FontAwesomeIcon icon={faExclamationCircle} className="me-2" />
          Không tìm thấy bài thi.
        </div>
        <div className="text-center">
          <Link to="/learner/exams" className="btn btn-outline-primary">
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Quay lại Danh sách bài thi
          </Link>
        </div>
      </div>
    );
  }

  // Exam results view when exam is submitted
  if (examSubmitted && examResult) {
    return (
      <div className="exam-detail-container">
        {/* Breadcrumb */}{" "}
        <div className="breadcrumb-container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/learner/dashboard">
                  <FontAwesomeIcon icon={faHouse} className="me-2" />
                  Trang chủ
                </Link>
              </li>
              <li className="breadcrumb-item">
                <Link to="/learner/exams">
                  <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                  Bài thi thực hành
                </Link>
              </li>
              <li className="breadcrumb-item active">{exam.name} - Kết quả</li>
            </ol>
          </nav>
        </div>
        <div className="exam-results-container">
          <div className="results-header text-center mb-4">
            <h2 className="text-success mb-3">
              <FontAwesomeIcon icon={faCheck} className="me-2" />
              Hoàn thành bài thi!
            </h2>
            <h3 className="text-primary">{exam.name}</h3>
            <p className="text-muted">Kết quả chi tiết bài thi của bạn</p>
          </div>

          {/* Overall Score Section */}
          <div className="overall-score-section mb-5">
            <div className="row">
              <div className="col-md-4">
                <div className="score-circle-container text-center">
                  <div className="score-circle-large">
                    <div className="score-percentage">
                      {examResult.percentage}%
                    </div>
                    <div className="score-detail">
                      {examResult.correctCount}/{examResult.totalQuestions}
                    </div>
                    <div className="score-label">Tổng điểm</div>
                  </div>
                </div>
              </div>
              <div className="col-md-8">
                <div className="score-breakdown">
                  {/* TOEIC Scores */}
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="score-section listening">
                        <div className="score-section-header">
                          <FontAwesomeIcon icon={faQuestionCircle} className="me-2" />
                          <h5>LISTENING</h5>
                        </div>
                        <div className="score-bar-container">
                          <div className="score-number">{examResult.listeningScore}/495</div>
                          <div className="progress-container">
                            <div className="progress">
                              <div 
                                className="progress-bar bg-info" 
                                style={{width: `${(examResult.listeningScore / 495) * 100}%`}}
                              ></div>
                            </div>
                            <div className="score-range">
                              <span>0</span>
                              <span>495</span>
                            </div>
                          </div>
                          <div className="correct-count">
                            Đúng: {examResult.listeningCorrect}/{Math.floor(examResult.totalQuestions / 2)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="score-section reading">
                        <div className="score-section-header">
                          <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                          <h5>READING</h5>
                        </div>
                        <div className="score-bar-container">
                          <div className="score-number">{examResult.readingScore}/495</div>
                          <div className="progress-container">
                            <div className="progress">
                              <div 
                                className="progress-bar bg-warning" 
                                style={{width: `${(examResult.readingScore / 495) * 100}%`}}
                              ></div>
                            </div>
                            <div className="score-range">
                              <span>0</span>
                              <span>495</span>
                            </div>
                          </div>
                          <div className="correct-count">
                            Đúng: {examResult.readingCorrect}/{Math.floor(examResult.totalQuestions / 2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total TOEIC Score */}
                  <div className="total-toeic-score text-center">
                    <h4 className="text-primary">Tổng điểm TOEIC: <span className="badge bg-primary fs-5">{examResult.totalScore}/990</span></h4>
                    <p className="text-muted">Điểm TOEIC ước tính dựa trên kết quả bài thi</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Detailed Statistics */}
          <div className="detailed-statistics mb-5">
            <h4 className="mb-4">
              <FontAwesomeIcon icon={faQuestionCircle} className="me-2" />
              Thống kê chi tiết
            </h4>
            <div className="row g-3">
              <div className="col-md-3">
                <div className="stat-card correct">
                  <div className="stat-icon">
                    <FontAwesomeIcon icon={faCheck} />
                  </div>
                  <div className="stat-content">
                    <h5 className="stat-number text-success">{examResult.correctCount}</h5>
                    <p className="stat-label">Câu đúng</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="stat-card incorrect">
                  <div className="stat-icon">
                    <FontAwesomeIcon icon={faExclamationCircle} />
                  </div>
                  <div className="stat-content">
                    <h5 className="stat-number text-danger">{examResult.incorrectCount}</h5>
                    <p className="stat-label">Câu sai</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="stat-card unanswered">
                  <div className="stat-icon">
                    <FontAwesomeIcon icon={faQuestionCircle} />
                  </div>
                  <div className="stat-content">
                    <h5 className="stat-number text-warning">{examResult.unansweredCount}</h5>
                    <p className="stat-label">Chưa trả lời</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="stat-card time">
                  <div className="stat-icon">
                    <FontAwesomeIcon icon={faClock} />
                  </div>
                  <div className="stat-content">
                    <h5 className="stat-number text-info">{formatTime(examResult.timeSpent)}</h5>
                    <p className="stat-label">Thời gian làm bài</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Question Review Section */}
          <div className="question-review-section">
            <div className="section-header mb-4">
              <h4>
                <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                Xem lại câu trả lời
              </h4>
              <p className="text-muted">Xem lại các câu trả lời và giải thích cho từng câu hỏi.</p>
            </div>

            <div className="question-review-tabs mb-4">
              <div className="nav nav-pills justify-content-center" role="tablist">
                <button className="nav-link active" data-bs-toggle="pill" data-bs-target="#all-questions">
                  Tất cả ({examResult.totalQuestions})
                </button>
                <button className="nav-link text-success" data-bs-toggle="pill" data-bs-target="#correct-questions">
                  Đúng ({examResult.correctCount})
                </button>
                <button className="nav-link text-danger" data-bs-toggle="pill" data-bs-target="#incorrect-questions">
                  Sai ({examResult.incorrectCount})
                </button>
                <button className="nav-link text-warning" data-bs-toggle="pill" data-bs-target="#unanswered-questions">
                  Chưa trả lời ({examResult.unansweredCount})
                </button>
              </div>
            </div>

            <div className="tab-content">
              <div className="tab-pane fade show active" id="all-questions">
                <div className="question-review-list">
                  {exam.questions.map((question, index) => {
                    const isCorrect = userAnswers[question.id] === question.correctAnswer;
                    const isAnswered = userAnswers[question.id] !== undefined;
                    const userAnswer = userAnswers[question.id];

                    return (
                      <div
                        key={question.id}
                        className={`question-review-item ${
                          !isAnswered
                            ? "unanswered"
                            : isCorrect
                            ? "correct"
                            : "incorrect"
                        }`}
                      >
                        <div className="question-review-header">
                          <div className="question-number">
                            <span className="number">{index + 1}</span>
                            <div className={`status-badge ${!isAnswered ? "unanswered" : isCorrect ? "correct" : "incorrect"}`}>
                              {!isAnswered ? (
                                <FontAwesomeIcon icon={faQuestionCircle} />
                              ) : isCorrect ? (
                                <FontAwesomeIcon icon={faCheck} />
                              ) : (
                                <FontAwesomeIcon icon={faExclamationCircle} />
                              )}
                            </div>
                          </div>
                          <div className="question-status">
                            {!isAnswered ? (
                              <span className="badge bg-warning">Chưa trả lời</span>
                            ) : isCorrect ? (
                              <span className="badge bg-success">Đúng</span>
                            ) : (
                              <span className="badge bg-danger">Sai</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="question-content">
                          <h6 className="question-text mb-3">{question.text}</h6>
                          
                          <div className="options-review">
                            {question.options.map((option, optionIndex) => {
                              const optionLetter = String.fromCharCode(65 + optionIndex);
                              const isUserSelected = userAnswer === option.id;
                              const isCorrectAnswer = question.correctAnswer === option.id;

                              return (
                                <div
                                  key={option.id}
                                  className={`option-review-item ${
                                    isUserSelected
                                      ? isCorrectAnswer
                                        ? "selected-correct"
                                        : "selected-incorrect"
                                      : isCorrectAnswer
                                      ? "correct-answer"
                                      : ""
                                  }`}
                                >
                                  <div className="option-indicator">
                                    <span className="option-letter">{optionLetter}</span>
                                    {isUserSelected && (
                                      <FontAwesomeIcon 
                                        icon={isCorrectAnswer ? faCheck : faExclamationCircle} 
                                        className={isCorrectAnswer ? "text-success" : "text-danger"}
                                      />
                                    )}
                                    {!isUserSelected && isCorrectAnswer && (
                                      <FontAwesomeIcon icon={faCheck} className="text-success" />
                                    )}
                                  </div>
                                  <span className="option-text">{option.text}</span>
                                </div>
                              );
                            })}
                          </div>

                          {question.explanation && (
                            <div className="explanation-section mt-3">
                              <h6 className="explanation-title">
                                <FontAwesomeIcon icon={faQuestionCircle} className="me-2" />
                                Giải thích:
                              </h6>
                              <div className="explanation-content">
                                <p>{question.explanation}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          {/* Result Actions */}
          <div className="result-actions mt-5">
            <div className="text-center">
              <div className="action-buttons-group">
                <button
                  className="btn btn-primary btn-lg me-3"
                  onClick={() => navigate("/learner/exams")}
                >
                  <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                  Thêm bài thi luyện tập
                </button>

                <button
                  className="btn btn-success btn-lg me-3"
                  onClick={() => window.location.reload()}
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                  Làm lại bài thi
                </button>

                <button
                  className="btn btn-outline-secondary btn-lg"
                  onClick={() => navigate("/learner/dashboard")}
                >
                  <FontAwesomeIcon icon={faHouse} className="me-2" />
                  Quay lại Trang chủ
                </button>
              </div>
              
              <div className="achievement-message mt-4">
                <div className="alert alert-info">
                  <FontAwesomeIcon icon={faCheck} className="me-2" />
                  <strong>Chúc mừng!</strong> Bạn đã hoàn thành bài thi với điểm số {examResult.totalScore}/990. 
                  {examResult.totalScore >= 600 && " Kết quả rất tốt!"}
                  {examResult.totalScore >= 800 && " Xuất sắc!"}
                  {examResult.totalScore < 600 && " Hãy tiếp tục luyện tập để cải thiện kết quả!"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Exam start/intro view when not yet started
  if (!examStarted) {
    return (
      <div className="exam-detail-container">
        {/* Breadcrumb */}{" "}
        <div className="breadcrumb-container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/learner/dashboard">
                  <FontAwesomeIcon icon={faHouse} className="me-2" />
                  Trang chủ
                </Link>
              </li>
              <li className="breadcrumb-item">
                <Link to="/learner/exams">
                  <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                  Bài thi thực hành
                </Link>
              </li>
              <li className="breadcrumb-item active">{exam.name}</li>
            </ol>
          </nav>
        </div>
        <div className="exam-intro-container">
          <div className="exam-intro-header">
            <h2>{exam.name}</h2>
            <div className="exam-badges">
              {" "}
              <span className="badge bg-info me-2">
                <FontAwesomeIcon icon={faClock} className="me-1" />
                {exam.duration} phút
              </span>
              <span className="badge bg-primary">
                <FontAwesomeIcon icon={faQuestionCircle} className="me-1" />
                {exam.questions ? exam.questions.length : 0} câu hỏi
              </span>
            </div>
          </div>{" "}
          <div className="exam-description">
            <h4>Mô tả</h4>
            <p>{exam.description}</p>
          </div>
          <div className="exam-instructions">
            <h4>Hướng dẫn</h4>
            <ul>
              <li>Bài thi này có {exam.questions ? exam.questions.length : 0} câu hỏi.</li>
              <li>Bạn có {exam.duration} phút để hoàn thành bài thi này.</li>
              <li>Bạn có thể đánh dấu các câu hỏi để xem lại sau.</li>
              <li>Bạn có thể lưu tiến trình và tiếp tục sau.</li>
              <li>Sau khi nộp bài, bạn không thể thay đổi câu trả lời.</li>
            </ul>
          </div>{" "}
          {savedProgress && (
            <div className="alert alert-info" role="alert">
              <FontAwesomeIcon icon={faCheck} className="me-2" />
              Bạn có một phiên đã lưu cho bài thi này. Bạn có thể tiếp tục từ
              nơi bạn đã dừng lại.
            </div>
          )}{" "}
          <div className="exam-intro-actions">
            <button className="btn btn-primary btn-lg" onClick={startExam}>
              {savedProgress ? "Tiếp tục bài thi" : "Bắt đầu bài thi"}
            </button>
            <Link
              to="/learner/exams"
              className="btn btn-outline-secondary btn-lg ms-3"
            >
              Quay lại
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Main exam taking view
  const currentQuestion = exam.questions[currentQuestionIndex];
  console.log("🚀 ~ ExamDetail ~ currentQuestion:", currentQuestion);

  // If no questions available, show error
  if (!exam.questions || exam.questions.length === 0) {
    return (
      <div className="exam-detail-container">
        <div className="alert alert-warning m-4" role="alert">
          <FontAwesomeIcon icon={faExclamationCircle} className="me-2" />
          Bài thi này chưa có câu hỏi nào. Vui lòng thử lại sau.
        </div>
        <div className="text-center">
          <Link to="/learner/exams" className="btn btn-outline-primary">
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Quay lại Danh sách bài thi
          </Link>
        </div>
      </div>
    );
  }

  // If currentQuestion is not available, show error
  if (!currentQuestion) {
    return (
      <div className="exam-detail-container">
        <div className="alert alert-danger m-4" role="alert">
          <FontAwesomeIcon icon={faExclamationCircle} className="me-2" />
          Không thể tải câu hỏi hiện tại. Vui lòng thử lại.
        </div>
        <div className="text-center">
          <Link to="/learner/exams" className="btn btn-outline-primary">
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Quay lại Danh sách bài thi
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="exam-container">
      {/* Exam Header */}
      <div className="exam-header">
        <div className="exam-title">
          <h4>{exam.name}</h4>
        </div>
        <div className="exam-timer">
          <FontAwesomeIcon icon={faClock} className="me-2" />
          <span className="timer-text">{formatTime(remainingTime)}</span>
        </div>
      </div>

      {/* Main Exam Content */}
      <div className="exam-content">
        {/* Question Navigation Sidebar */}
        <div className="question-nav">
          {" "}
          <div className="question-nav-header">
            <h5>Câu hỏi</h5>
          </div>
          <div className="question-nav-list">
            {exam.questions && exam.questions.map((q, index) => (
              <button
                key={q.id}
                className={`question-nav-item ${
                  index === currentQuestionIndex ? "active" : ""
                } ${userAnswers[q.id] !== undefined ? "answered" : ""} ${
                  flaggedQuestions.includes(q.id) ? "flagged" : ""
                }`}
                onClick={() => goToQuestion(index)}
              >
                {index + 1}
                {flaggedQuestions.includes(q.id) && (
                  <FontAwesomeIcon icon={faFlag} className="flag-icon" />
                )}
              </button>
            ))}
          </div>{" "}
          <div className="question-nav-legend">
            <div className="legend-item">
              <div className="legend-color current"></div>
              <span>Hiện tại</span>
            </div>
            <div className="legend-item">
              <div className="legend-color answered"></div>
              <span>Đã trả lời</span>
            </div>
            <div className="legend-item">
              <div className="legend-color flagged"></div>
              <span>Đã đánh dấu</span>
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="question-content">
          {" "}
          <div className="question-header">
            <h5>
              Câu hỏi {currentQuestionIndex + 1} / {exam.questions ? exam.questions.length : 0}
            </h5>
            <button
              className={`flag-button ${
                flaggedQuestions.includes(currentQuestion.id) ? "flagged" : ""
              }`}
              onClick={() => toggleFlagQuestion(currentQuestion.id)}
            >
              <FontAwesomeIcon icon={faFlag} />
              {flaggedQuestions.includes(currentQuestion.id)
                ? " Bỏ đánh dấu"
                : " Đánh dấu xem lại"}
            </button>
          </div>
          {currentQuestion.image && (
            <div className="question-image">
              <img src={currentQuestion.image} alt="Hình ảnh câu hỏi" />
            </div>
          )}
          {currentQuestion.audio && (
            <div className="question-audio mb-3">
              <audio controls>
                <source src={currentQuestion.audio} type="audio/mpeg" />
                Trình duyệt của bạn không hỗ trợ phát âm thanh.
              </audio>
            </div>
          )}
          <div className="question-text">
            <p>{currentQuestion.text}</p>
          </div>
          <div className="answer-options">
            {currentQuestion.options && currentQuestion.options.map((option, optionIndex) => {
              const optionLetter = String.fromCharCode(65 + optionIndex); // A, B, C, D... cho các lựa chọn
              return (
                <div className="answer-option" key={option.id}>
                  <input
                    type="radio"
                    id={`option-${option.id}`}
                    name={`question-${currentQuestion.id}`}
                    value={option.id}
                    checked={userAnswers[currentQuestion.id] === option.id}
                    onChange={() =>
                      handleAnswerSelect(currentQuestion.id, option.id)
                    }
                  />
                  <label htmlFor={`option-${option.id}`}>
                    <span className="option-letter">{optionLetter}</span>
                    <span className="option-text">{option.text}</span>
                  </label>
                </div>
              );
            })}
          </div>
          {/* Navigation buttons */}
          <div className="question-navigation">
            {" "}
            <button
              className="btn btn-outline-secondary"
              onClick={goToPrevQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <FontAwesomeIcon icon={faChevronLeft} className="me-2" />
              Câu trước
            </button>
            <div className="center-buttons">
              <button
                className="btn btn-outline-info me-2"
                onClick={saveProgress}
              >
                <FontAwesomeIcon icon={faSave} className="me-1" />
                {savedProgress ? "Đã lưu" : "Lưu tiến trình"}
              </button>

              <button
                className="btn btn-success"
                onClick={() => setShowConfirmSubmit(true)}
              >
                <FontAwesomeIcon icon={faCheck} className="me-1" />
                Nộp bài
              </button>
            </div>
            <button
              className="btn btn-outline-primary"
              onClick={goToNextQuestion}
              disabled={!exam.questions || currentQuestionIndex === exam.questions.length - 1}
            >
              Câu tiếp
              <FontAwesomeIcon icon={faChevronRight} className="ms-2" />
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h4>Nộp bài?</h4>
            <p>
              Bạn có chắc chắn muốn nộp bài thi? Bạn không thể thay đổi câu trả
              lời sau khi đã nộp.
            </p>

            <div className="stats-summary">
              <div className="stat">
                <span>Đã trả lời:</span>
                <strong>
                  {Object.keys(userAnswers).length}/{exam.questions ? exam.questions.length : 0}
                </strong>
              </div>
              <div className="stat">
                <span>Chưa trả lời:</span>
                <strong>
                  {(exam.questions ? exam.questions.length : 0) - Object.keys(userAnswers).length}
                </strong>
              </div>
              <div className="stat">
                <span>Đã đánh dấu:</span>
                <strong>{flaggedQuestions.length}</strong>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowConfirmSubmit(false)}
              >
                Tiếp tục làm bài
              </button>
              <button
                className="btn btn-primary"
                onClick={submitExam}
                disabled={loading}
              >
                {loading ? "Đang nộp bài..." : "Nộp bài ngay"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamDetail;
