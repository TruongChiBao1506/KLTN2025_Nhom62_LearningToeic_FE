import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faSync } from "@fortawesome/free-solid-svg-icons";
import "./style.css";

const TestPart5 = ({
  questions,
  submitAnswers,
  refreshPage,
  isSubmited,
  translateText,
  getOptions,
  getOptionClass,
  clearSelection,
  checkAnswer,
}) => {
  const [showExplanation, setShowExplanation] = useState({});

  const toggleExplanation = async (index) => {
    setShowExplanation({
      ...showExplanation,
      [index]: !showExplanation[index],
    });

    // Dịch phần giải thích nếu hiển thị
    if (!showExplanation[index]) {
      const question = questions[index];
      const explanation = question.questionExplanation;
      const targetLanguage = "vi"; // Tiếng Việt

      try {
        const translatedExplanation = await translateText(
          explanation,
          targetLanguage
        );
        question.translatedExplanation = translatedExplanation;
      } catch (error) {
        console.error("Lỗi khi dịch:", error);
      }
    }
  };

  const scrollToQuestion = (index) => {
    const element = document.getElementById(`question-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleOptionChange = (question, option) => {
    question.selectedOption = option;
    checkAnswer(question);
  };

  // Tính số câu đúng
  const getCorrectCount = questions.filter(
    (q) => q.answered && q.selectedOption === q.correctOption
  ).length;

  // Tính số câu sai
  const getIncorrectCount = questions.filter(
    (q) => q.answered && q.selectedOption !== q.correctOption
  ).length;

  return (
    <>
      <div className="col-lg col-md col-sm">
        <div className="card specific-card border-0 shadow-lg">
          <div className="card-body">
            <div className="row">
              <div className="col-lg col-md col-sm">
                {/* Vòng lặp hiển thị các câu hỏi */}
                {questions.map((question, index) => (
                  <div
                    className="question-section"
                    key={index}
                    id={`question-${index}`}
                  >
                    <div className="card specific-card mb-3 border-0 shadow-lg">
                      <div className="card-body">
                        <span
                          className="badge bg-secondary mb-2"
                          style={{ fontSize: "14px" }}
                        >
                          {question.questionType}
                        </span>
                        <ul className="mt-5">
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
                          <span className="ms-1">
                            {question.questionContent}
                          </span>

                          {getOptions(question).map((option, optionIndex) => (
                            <li
                              key={optionIndex}
                              className={
                                Array.isArray(getOptionClass(question, option))
                                  ? getOptionClass(question, option).join(" ")
                                  : getOptionClass(question, option)
                              }
                            >
                              <label className="form-check-label">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  value={option}
                                  checked={question.selectedOption === option}
                                  onChange={() =>
                                    handleOptionChange(question, option)
                                  }
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
                          ))}
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
                                : "Hiển thị giải thích"}
                            </button>

                            {showExplanation[index] && (
                              <div className="transcript">
                                <div className="explanation-original">
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html: question.questionExplanation,
                                    }}
                                  ></div>
                                </div>
                                {question.translatedExplanation && (
                                  <div className="transcript-translation">
                                    <span className="badge bg-success">
                                      Bản dịch
                                    </span>
                                    <div
                                      dangerouslySetInnerHTML={{
                                        __html: question.translatedExplanation,
                                      }}
                                    ></div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-lg-4 col-md-4 col-sm-4 text-decoration-none border-0">
        <div
          className="card specific-card border-0"
          style={{ position: "sticky", top: "95px", zIndex: 1 }}
        >
          <div className="card-body border-0">
            <div className="question-list-section">
              <h5 className="fw-normal fs-5 text-center">Bảng câu hỏi</h5>
              <div
                className="question-buttons mb-5 mx-2 lesson-content"
                style={{ display: "flex", flexWrap: "wrap" }}
              >
                {questions.map((q, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToQuestion(index)}
                    className={`question-button ${
                      q.answered && q.selectedOption === q.correctOption
                        ? "correct"
                        : ""
                    } ${
                      q.answered && q.selectedOption !== q.correctOption
                        ? "incorrect"
                        : ""
                    } ${q.selectedOption !== null ? "selected" : ""} ${
                      q.isGraded ? "graded" : ""
                    }`}
                    style={{
                      backgroundColor: q.selectedOption
                        ? q.isGraded
                          ? q.selectedOption === q.correctOption
                            ? "green"
                            : "red"
                          : "orange"
                        : "",
                      color: q.selectedOption ? "white" : "#052649",
                    }}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <div className="score mb-3">
                <FontAwesomeIcon icon={faCheck} style={{ color: "green" }} />{" "}
                {getCorrectCount}/{questions.length}
                <FontAwesomeIcon
                  icon={faTimes}
                  style={{ color: "red", marginLeft: "8px" }}
                />{" "}
                {getIncorrectCount}/{questions.length}
              </div>

              <div className="d-grid gap-2">
                {isSubmited ? (
                  <button onClick={refreshPage} className="btn btn-light">
                    <FontAwesomeIcon icon={faSync} className="text-success" />{" "}
                    Làm lại
                  </button>
                ) : (
                  <button onClick={submitAnswers} className="btn btn-primary">
                    Chấm điểm
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TestPart5;
