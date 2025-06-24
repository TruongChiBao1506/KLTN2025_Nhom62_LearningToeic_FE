import React, { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faSync } from "@fortawesome/free-solid-svg-icons";
import "./style.css";

const TestPart7Single = ({
  questions,
  submitAnswers,
  refreshPage,
  isSubmited,
  getImageUrl,
  translateText,
  getOptions,
  getOptionClass,
  clearSelection,
  checkAnswer,
}) => {
  const [showExplanation, setShowExplanation] = useState({});

  // Nhóm các câu hỏi theo groupId
  const groupQuestionsByGroupId = (questions) => {
    const grouped = {};
    for (const question of questions) {
      const groupKey = question.questionGroup.groupId || "default";
      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(question);
    }
    return grouped;
  };

  const groupedQuestions = useMemo(() => groupQuestionsByGroupId(questions), [
    questions,
  ]);

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
        const translatedExplanation = await translateText(explanation, targetLanguage);
        question.translatedExplanation = translatedExplanation;
      } catch (error) {
        console.error("Lỗi khi dịch:", error);
      }
    }
  };

  // Kiểm tra xem nhóm câu hỏi đã được trả lời hết chưa
  const isGroupAnswered = (groupQuestions) => {
    return groupQuestions.every((question) => question.answered);
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
              {Object.entries(groupedQuestions).map(([groupId, groupQuestions]) => (
                <div className="col-sm-12 mt-3" key={groupId}>
                  <div className="row">
                    <div className="col-md-6 bg-light rounded">
                      {shouldDisplayGroupContent(groupQuestions) && groupQuestions[0].questionGroup.groupImage && (
                        <div className="image-container">
                          <img
                            src={getImageUrl(groupQuestions[0].questionGroup.groupImage)}
                            style={{ width: "100%" }}
                            alt="Luyện thi Reading TOEIC"
                            className="question-image"
                            loading="lazy"
                          />
                        </div>
                      )}

                      <div className="audio-image-container mt-5">
                        {shouldDisplayGroupContent(groupQuestions) && (
                          <div className="audio-container mb-2">
                            <div
                              dangerouslySetInnerHTML={{
                                __html: groupQuestions[0].questionGroup.groupPassage
                              }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="scrollable-container">
                        {groupQuestions.map((question, index) => (
                          <div key={index} className="ms-3">
                            <div
                              id={`question-${groupId}-${index}`}
                              className="question"
                            >
                              <span
                                className="badge bg-secondary mb-2"
                                style={{ fontSize: "14px" }}
                              >
                                {question.questionType}
                              </span>
                              <div className="row">
                                <ul className="mt-5">
                                  <button
                                    className="btn mb-2"
                                    style={{
                                      backgroundColor: "#e8f2ff",
                                      color: "#35509a",
                                      width: "60px",
                                    }}
                                  >
                                    {calculateQuestionNumber(parseInt(groupId), index) + 1}
                                  </button>

                                  <span className="ms-1">{question.questionContent}</span>
                                  
                                  {getOptions(question).map((option, optionIndex) => (
                                    <li
                                      key={optionIndex}
                                      className={Array.isArray(getOptionClass(question, option)) 
                                        ? getOptionClass(question, option).join(" ") 
                                        : getOptionClass(question, option)}
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
                                      onClick={() => toggleExplanation(calculateQuestionNumber(parseInt(groupId), index))}
                                      className="btn btn-link btn-sm mt-2 link-offset-3"
                                    >
                                      {showExplanation[calculateQuestionNumber(parseInt(groupId), index)]
                                        ? "Ẩn giải thích"
                                        : "Hiển thị giải thích"}
                                    </button>

                                    {showExplanation[calculateQuestionNumber(parseInt(groupId), index)] && (
                                      <div className="transcript">
                                        <div className="explanation-original">
                                          <div
                                            dangerouslySetInnerHTML={{
                                              __html: question.questionExplanation
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
                                                __html: question.translatedExplanation
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
                    <hr className="mt-3" />
                  </div>
                </div>
              ))}
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
                {Object.entries(groupedQuestions).map(([groupId, groupQuestions]) =>
                  groupQuestions.map((question, index) => (
                    <button
                      key={`${groupId}-${index}`}
                      onClick={() => scrollToQuestion(groupId, index)}
                      className={`question-button ${
                        question.answered && question.selectedOption === question.correctOption
                          ? "correct"
                          : ""
                      } ${
                        question.answered && question.selectedOption !== question.correctOption
                          ? "incorrect"
                          : ""
                      } ${question.selectedOption !== null ? "selected" : ""} ${
                        question.isGraded ? "graded" : ""
                      }`}
                      style={{
                        backgroundColor: question.selectedOption
                          ? question.isGraded
                            ? question.selectedOption === question.correctOption
                              ? "green"
                              : "red"
                            : "orange"
                          : "",
                        color: question.selectedOption ? "white" : "#052649",
                      }}
                    >
                      {calculateQuestionNumber(parseInt(groupId), index) + 1}
                    </button>
                  ))
                )}
              </div>
              
              <div className="score mb-3">
                <FontAwesomeIcon icon={faCheck} style={{ color: "green" }} /> {getCorrectCount}/{questions.length}
                <FontAwesomeIcon icon={faTimes} style={{ color: "red", marginLeft: "8px" }} /> {getIncorrectCount}/{questions.length}
              </div>
              
              <div className="d-grid gap-2">
                {isSubmited ? (
                  <button onClick={refreshPage} className="btn btn-light">
                    <FontAwesomeIcon icon={faSync} className="text-success" /> Làm lại
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

export default TestPart7Single;
