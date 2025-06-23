import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faBolt,
  faChevronRight,
  faCheck,
  faTimes,
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
  const [showExplanation, setShowExplanation] = useState({});

  useEffect(() => {
    // Fetch all data
    const fetchData = async () => {
      try {
        // Get grammar details
        const grammarResponse = await grammarService.getById(grammarId);
        setGrammarName(grammarResponse.data.grammarName);

        // Get all grammars for sidebar
        const grammarsResponse = await grammarService.getAllEnabled();
        setGrammars(grammarsResponse.data);

        // Get grammar contents
        const contentsResponse = await grammarContentService.getByGrammarId(
          grammarId
        );
        setGrammarContents(contentsResponse.data);

        // Get grammar questions
        const questionsResponse = await grammarQuestionService.getByGrammarId(
          grammarId
        );
        const formattedQuestions = questionsResponse.data.map((q) => ({
          ...q,
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

  const getOptionClass = (question, option) => {
    if (!question.isGraded) return "option-neutral";

    if (option === question.correctOption) {
      return "option-correct";
    } else if (
      option === question.selectedOption &&
      option !== question.correctOption
    ) {
      return "option-incorrect";
    }

    return "option-neutral";
  };

  const clearSelection = (question) => {
    setQuestions(
      questions.map((q) =>
        q.questionId === question.questionId
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
    setQuestions(
      questions.map((q) =>
        q.questionId === question.questionId ? { ...q, isGraded: true } : q
      )
    );
  };

  const gradeAllQuestions = () => {
    setQuestions(
      questions.map((q) => ({
        ...q,
        isGraded: true,
      }))
    );
  };

  // Calculate score
  const calculateScore = () => {
    const gradedQuestions = questions.filter((q) => q.isGraded);
    const correctAnswers = gradedQuestions.filter(
      (q) => q.selectedOption === q.correctOption
    );
    return {
      score: correctAnswers.length,
      total: gradedQuestions.length,
    };
  };

  const score = calculateScore();

  return (
    <div className="container mt-4">
      <div className="button-container mt-5">
        <button
          className={showTheory ? "active" : ""}
          onClick={() => setShowTheory(true)}
        >
          Lý thuyết
        </button>
        <button
          className={!showTheory ? "active" : ""}
          onClick={() => setShowTheory(false)}
        >
          Trắc nghiệm
        </button>
      </div>

      {showTheory ? (
        <div className="row mb-3 mt-1">
          <div className="col-lg col-md col-sm">
            <div className="card specific-card mt-4">
              <h1 className="text-center">
                <span>{grammarName}</span>
              </h1>
              <div className="card-body" style={{ minHeight: "500px" }}>
                <FontAwesomeIcon icon={faBook} className="book-icon ms-1" />
                {grammarContents.map((content) => (
                  <div key={content.contentId} className="mb-2">
                    <h4 className="card-subtitle mb-2 text-body-secondary lesson-subtitle">
                      <span className="highlight">{content.title}</span>
                    </h4>
                    <div
                      className="card-text"
                      dangerouslySetInnerHTML={{ __html: content.content }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-4 col-sm-4 text-decoration-none">
            <h5 className="text-center">
              <FontAwesomeIcon icon={faBolt} className="text-warning me-2" />
              NGỮ PHÁP KHÁC
            </h5>
            <div style={{ maxHeight: "500px", overflow: "auto" }}>
              {grammars.map((grammar) => (
                <div className="card mb-2 me-2 mt-2" key={grammar.grammarId}>
                  <Link
                    to={`/learner/grammar/${grammar.grammarId}`}
                    className="card-body custom-card text-decoration-none"
                  >
                    <span className="card-text">{grammar.grammarName}</span>
                    <FontAwesomeIcon icon={faChevronRight} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="container-fluid">
          <div className="row mt-3">
            <div className="col-lg col-md col-sm">
              <div className="card specific-card border-0 shadow-lg">
                <div className="card-body">
                  <div className="row">
                    <div className="col-lg col-md col-sm">
                      {/* Questions */}
                      {questions.map((question, index) => (
                        <div
                          className="question-section"
                          key={index}
                          id={`question-${index}`}
                        >
                          <div className="card specific-card mb-3 border-0 shadow-lg">
                            <div className="card-body">
                              <ul className="mt-5 list-unstyled">
                                <button
                                  className="btn mb-2"
                                  style={{
                                    backgroundColor: "#e8f2ff",
                                    color: "#35509a",
                                    width: "60px",
                                  }}
                                >
                                  {index + 1}
                                </button>
                                <span className="ms-3">
                                  {question.questionContent}
                                </span>

                                {getOptions(question).map(
                                  (option, optionIndex) => (
                                    <li
                                      key={optionIndex}
                                      className={getOptionClass(
                                        question,
                                        option
                                      )}
                                    >
                                      <label className="form-check-label">
                                        <input
                                          className="form-check-input"
                                          type="radio"
                                          value={option}
                                          checked={
                                            question.selectedOption === option
                                          }
                                          onChange={() => {
                                            setQuestions(
                                              questions.map((q) =>
                                                q.questionId ===
                                                question.questionId
                                                  ? {
                                                      ...q,
                                                      selectedOption: option,
                                                    }
                                                  : q
                                              )
                                            );
                                          }}
                                          disabled={question.isGraded}
                                          name={`flexRadioDefault-${question.questionId}`}
                                        />
                                        {option}
                                        {question.isGraded &&
                                          option === question.correctOption && (
                                            <div className="result-icon">
                                              <FontAwesomeIcon
                                                icon={faCheck}
                                                style={{ color: "green" }}
                                              />
                                            </div>
                                          )}
                                        {question.isGraded &&
                                          option === question.selectedOption &&
                                          option !== question.correctOption && (
                                            <div className="result-icon">
                                              <FontAwesomeIcon
                                                icon={faTimes}
                                                style={{ color: "red" }}
                                              />
                                            </div>
                                          )}
                                      </label>
                                    </li>
                                  )
                                )}

                                {!question.isGraded && (
                                  <button
                                    onClick={() => clearSelection(question)}
                                    className="btn btn-link text-decoration-none"
                                  >
                                    Xóa lựa chọn
                                  </button>
                                )}
                              </ul>

                              {question.isGraded && (
                                <div className="feedback-section">
                                  <button
                                    onClick={() => toggleExplanation(index)}
                                    className="btn btn-link btn-sm mt-2 link-offset-3"
                                  >
                                    {showExplanation[index]
                                      ? "Ẩn giải thích"
                                      : "Xem giải thích"}
                                  </button>

                                  {showExplanation[index] && (
                                    <div className="explanation-content">
                                      <div
                                        dangerouslySetInnerHTML={{
                                          __html: question.explanation,
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                              )}

                              {!question.isGraded &&
                                question.selectedOption && (
                                  <div className="mt-3">
                                    <button
                                      onClick={() => gradeQuestion(question)}
                                      className="btn btn-primary"
                                    >
                                      Kiểm tra câu trả lời
                                    </button>
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {questions.length > 0 &&
                        questions.some(
                          (q) => q.selectedOption && !q.isGraded
                        ) && (
                          <div className="text-center mb-4">
                            <button
                              onClick={gradeAllQuestions}
                              className="btn btn-primary btn-lg"
                            >
                              Kiểm tra tất cả các câu trả lời
                            </button>
                          </div>
                        )}

                      {questions.some((q) => q.isGraded) && (
                        <div className="score-summary card mb-4 border-0 shadow-sm">
                          <div className="card-body text-center">
                            <h5 className="card-title">Kết quả của bạn</h5>
                            <p className="card-text">
                              <strong>{score.score}</strong> / {score.total} (
                              {Math.round((score.score / score.total) * 100)}%)
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrammarDetail;
