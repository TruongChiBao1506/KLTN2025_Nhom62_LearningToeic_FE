import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import "./style.css";

const TestPart1 = ({
  questions,
  submitAnswers,
  refreshPage,
  isSubmited,
  getImageUrl,
  getAudioUrl,
  translateText,
  getOptions,
  getOptionClass,
  clearSelection,
  checkAnswer,
}) => {
  const [showTranscript, setShowTranscript] = useState({});

  const toggleTranscript = (index) => {
    setShowTranscript({
      ...showTranscript,
      [index]: !showTranscript[index],
    });
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

  return (
    <>
      <div className="col-lg col-md col-sm">
        <div className="card specific-card border-0 shadow-lg">
          <div className="card-body">
            <div className="row">
              <div className="col-lg col-md col-sm">
                {/* Vòng lặp để hiển thị các câu hỏi */}
                {questions.map((question, index) => (
                  <div
                    className="question-section"
                    key={index}
                    id={`question-${index}`}
                  >
                    <div className="card specific-card mb-3 border-0 shadow-lg">
                      <div className="card-body">
                        <span
                          className="badge bg-secondary"
                          style={{ fontSize: "14px" }}
                        >
                          {question.questionType}
                        </span>
                        {/* Audio */}
                        <div className="audio-container mb-2">
                          <audio controls style={{ width: "400px" }}>
                            <source
                              src={getAudioUrl(question.questionAudio)}
                              type="audio/mpeg"
                            />
                            Trình duyệt của bạn không hỗ trợ phát âm thanh.
                          </audio>
                        </div>
                        {/* Image */}
                        <div className="image-container">
                          <img
                            src={getImageUrl(question.questionImage)}
                            alt="Luyện thi Listening TOEIC"
                            style={{ width: "400px", height: "300px" }}
                            className="question-image"
                            loading="lazy"
                          />
                        </div>

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

                          {getOptions(question).map((option, optionIndex) => (
                            <li
                              key={optionIndex}
                              className={getOptionClass(question, option).join(
                                " "
                              )}
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
                              onClick={() => toggleTranscript(index)}
                              className="btn btn-link btn-sm mt-2 link-offset-3"
                            >
                              {showTranscript[index]
                                ? "Ẩn đoạn văn"
                                : "Hiển thị đoạn văn"}
                            </button>

                            {showTranscript[index] && (
                              <div className="transcript">
                                <div className="transcript-original">
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html: question.questionScript,
                                    }}
                                  ></div>
                                </div>
                                <div className="transcript-translation">
                                  <span className="badge bg-success">
                                    Bản dịch
                                  </span>
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html: question.translatedScript,
                                    }}
                                  ></div>
                                </div>
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

              <div className="d-grid gap-2">
                <button
                  onClick={submitAnswers}
                  className="btn btn-primary"
                  type="button"
                >
                  Nộp bài
                </button>
                <button
                  onClick={refreshPage}
                  className="btn btn-secondary"
                  type="button"
                >
                  Làm lại
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TestPart1;
