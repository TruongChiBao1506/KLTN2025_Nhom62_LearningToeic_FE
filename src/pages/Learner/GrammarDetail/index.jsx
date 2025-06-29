import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faBolt,
  faChevronRight,
  faCheck,
  faTimes,
  faGraduationCap,
  faSync,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import "./style.css";

// Import services
import grammarService from "../../../services/grammarService";
import grammarContentService from "../../../services/grammarContentService";
import grammarQuestionService from "../../../services/grammarQuestionService";

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
      case 'A':
        return question.optionA;
      case 'B':
        return question.optionB;
      case 'C':
        return question.optionC;
      case 'D':
        return question.optionD;
      default:
        return null;
    }
  };

  const clearSelection = (question) => {
    const questionId = question._id || question.questionId;
    setQuestions(prev =>
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
    setQuestions(prev =>
      prev.map((q) =>
        (q._id || q.questionId) === questionId ? { ...q, isGraded: true } : q
      )
    );
  };

  const gradeAllQuestions = () => {
    setQuestions(prev =>
      prev.map((q) => ({
        ...q,
        isGraded: true,
      }))
    );
  };

  const resetQuiz = () => {
    setQuestions(prev =>
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
    
    setQuestions(prev =>
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
      <div className="grammar-detail-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Đang tải dữ liệu ngữ pháp...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grammar-detail-container">
      {/* Header Section */}
      <div className="grammar-detail-header">
        <h1 className="grammar-title">
          <FontAwesomeIcon icon={faGraduationCap} className="grammar-title-icon" />
          {grammarName}
        </h1>
        <div className="grammar-subtitle">
          Học ngữ pháp tiếng Anh hiệu quả với lý thuyết và bài tập thực hành
        </div>
      </div>

      {/* Main Content */}
      <div className="grammar-detail-content">
        <div className="content-main">
          {/* Mode Selection */}
          <div className="mode-selection">
            <button
              className={`mode-btn ${showTheory ? "active" : ""}`}
              onClick={() => setShowTheory(true)}
            >
              <FontAwesomeIcon icon={faBook} />
              Lý thuyết
            </button>
            <button
              className={`mode-btn ${!showTheory ? "active" : ""}`}
              onClick={() => setShowTheory(false)}
            >
              <FontAwesomeIcon icon={faBolt} />
              Trắc nghiệm
            </button>
          </div>

          {/* Content Section */}
          <div className="content-section">
            {showTheory ? (
              <div className="theory-content">
                {grammarContents.length > 0 ? (
                  <div className="theory-wrapper">
                    <div className="theory-header">
                      <h1 className="theory-main-title">
                        <FontAwesomeIcon icon={faBook} />
                        {grammarName} - Lý thuyết
                      </h1>
                      <p className="theory-description">
                        Tìm hiểu chi tiết về {grammarName} với các khái niệm,
                        quy tắc và ví dụ thực tế
                      </p>
                    </div>
                    {grammarContents.map((content, index) => (
                      <div key={content.contentId} className="content-item">
                        <div className="content-section-header">
                          <div className="section-number">{index + 1}</div>
                          <h2 className="content-title">{content.title}</h2>
                        </div>
                        <div className="content-body">
                          <div
                            className="content-html"
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
                        </div>
                        {index < grammarContents.length - 1 && (
                          <div className="content-separator">
                            <div className="separator-line"></div>
                            <div className="separator-text">• • •</div>
                            <div className="separator-line"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <FontAwesomeIcon
                      icon={faBook}
                      className="empty-state-icon"
                    />
                    <h3>Chưa có nội dung lý thuyết</h3>
                    <p>
                      Nội dung lý thuyết cho <strong>{grammarName}</strong> sẽ
                      được cập nhật sớm
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="quiz-container">
                {questions.map((question, index) => (
                  <div className="question-card" key={index}>
                    <div className="question-header">
                      <div className="question-number">{index + 1}</div>
                      <div className="question-text">
                        {question.questionContent}
                      </div>
                    </div>

                    <div className="options-container">
                      {getOptions(question).map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`option-item ${
                            question.selectedOption === option ? "selected" : ""
                          } ${
                            question.isGraded
                              ? option === getCorrectOptionValue(question)
                                ? "correct"
                                : option === question.selectedOption &&
                                  option !== getCorrectOptionValue(question)
                                ? "incorrect"
                                : ""
                              : ""
                          }`}
                        >
                          <div 
                            className="option-label"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleOptionSelect(question, option);
                            }}
                            style={{ cursor: question.isGraded ? 'default' : 'pointer' }}
                          >
                            <div
                              className={`option-radio ${
                                question.selectedOption === option
                                  ? "checked"
                                  : ""
                              }`}
                            ></div>
                            <div className="option-text">{option}</div>
                            {question.isGraded &&
                              option === getCorrectOptionValue(question) && (
                                <FontAwesomeIcon
                                  icon={faCheck}
                                  style={{
                                    color: "#10b981",
                                    marginLeft: "auto",
                                  }}
                                />
                              )}
                            {question.isGraded &&
                              option === question.selectedOption &&
                              option !== getCorrectOptionValue(question) && (
                                <FontAwesomeIcon
                                  icon={faTimes}
                                  style={{
                                    color: "#ef4444",
                                    marginLeft: "auto",
                                  }}
                                />
                              )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {question.isGraded && (
                      <div
                        className={`result-feedback ${
                          question.selectedOption === getCorrectOptionValue(question)
                            ? "correct"
                            : "incorrect"
                        }`}
                      >
                        <div
                          className={`result-status ${
                            question.selectedOption === getCorrectOptionValue(question)
                              ? "correct"
                              : "incorrect"
                          }`}
                        >
                          <FontAwesomeIcon
                            icon={
                              question.selectedOption === getCorrectOptionValue(question)
                                ? faCheck
                                : faTimes
                            }
                          />
                          {question.selectedOption === getCorrectOptionValue(question)
                            ? "Chính xác!"
                            : "Không chính xác"}
                        </div>
                        {showExplanation[index] && (
                          <div
                            className="explanation-text"
                            dangerouslySetInnerHTML={{
                              __html: question.explanation,
                            }}
                          />
                        )}
                        <button
                          onClick={() => toggleExplanation(index)}
                          className="action-btn"
                          style={{ marginTop: "12px" }}
                        >
                          {showExplanation[index]
                            ? "Ẩn giải thích"
                            : "Xem giải thích"}
                        </button>
                      </div>
                    )}

                    {!question.isGraded && question.selectedOption && (
                      <div style={{ marginTop: "16px" }}>
                        <button
                          onClick={() => gradeQuestion(question)}
                          className="action-btn primary"
                        >
                          Kiểm tra câu trả lời
                        </button>
                        <button
                          onClick={() => clearSelection(question)}
                          className="action-btn"
                          style={{ marginLeft: "12px" }}
                        >
                          Xóa lựa chọn
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {questions.length > 0 &&
                  questions.some((q) => q.selectedOption && !q.isGraded) && (
                    <div style={{ textAlign: "center", margin: "32px 0" }}>
                      <button
                        onClick={gradeAllQuestions}
                        className="action-btn primary"
                        style={{ padding: "16px 48px", fontSize: "16px" }}
                      >
                        Kiểm tra tất cả các câu trả lời
                      </button>
                    </div>
                  )}

                {questions.some((q) => q.isGraded) && (
                  <div className="final-score">
                    <div className="score-header">
                      <h2 className="score-title">
                        <FontAwesomeIcon icon={faCheck} style={{ marginRight: "12px", color: "#10b981" }} />
                        Kết quả bài làm
                      </h2>
                    </div>
                    
                    <div className="score-content">
                      <div className="score-circle">
                        <div className="score-percentage">
                          {Math.round((score.score / score.total) * 100)}%
                        </div>
                        <div className="score-label">Điểm số</div>
                      </div>
                      
                      <div className="score-details">
                        <div className="score-item correct">
                          <FontAwesomeIcon icon={faCheck} />
                          <span className="score-item-label">Câu đúng:</span>
                          <span className="score-item-value">{score.score}</span>
                        </div>
                        <div className="score-item incorrect">
                          <FontAwesomeIcon icon={faTimes} />
                          <span className="score-item-label">Câu sai:</span>
                          <span className="score-item-value">{score.total - score.score}</span>
                        </div>
                        <div className="score-item total">
                          <FontAwesomeIcon icon={faGraduationCap} />
                          <span className="score-item-label">Tổng câu:</span>
                          <span className="score-item-value">{score.total}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="score-actions">
                      <button
                        onClick={resetQuiz}
                        className="action-btn reset-btn"
                      >
                        <FontAwesomeIcon icon={faSync} style={{ marginRight: "8px" }} />
                        Làm lại bài trắc nghiệm
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="content-sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">
              <FontAwesomeIcon icon={faBolt} />
              Ngữ pháp khác
            </h3>
            <div className="other-grammars-container">
              {grammars.map((grammar) => (
                <Link
                  key={grammar._id || grammar.grammarId}
                  to={`/learner/grammar/${grammar._id || grammar.grammarId}`}
                  className={`grammar-link ${
                    (grammar._id || grammar.grammarId) === grammarId
                      ? "current"
                      : ""
                  }`}
                >
                  <div className="grammar-link-content">
                    <span className="grammar-link-text">
                      {grammar.grammarName}
                    </span>
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className="grammar-link-icon"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {!showTheory && questions.length > 0 && (
            <div className="sidebar-section">
              <h3 className="sidebar-title">Tiến độ</h3>
              <div className="quiz-progress">
                <div className="progress-item">
                  <span className="progress-label">Tổng câu hỏi:</span>
                  <span className="progress-value">{questions.length}</span>
                </div>
                <div className="progress-item">
                  <span className="progress-label">Đã làm:</span>
                  <span className="progress-value">
                    {questions.filter((q) => q.isGraded).length}
                  </span>
                </div>
                <div className="progress-item">
                  <span className="progress-label">Câu đúng:</span>
                  <span className="progress-value">{score.score}</span>
                </div>
                {score.total > 0 && (
                  <>
                    <div className="progress-bar-container">
                      <div className="progress-bar">
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${(score.score / score.total) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div style={{ textAlign: "center", marginTop: "12px" }}>
                      <span style={{ fontSize: "18px", fontWeight: "600" }}>
                        {Math.round((score.score / score.total) * 100)}%
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GrammarDetail;
