import React, { useState, useEffect, useMemo } from "react";
import "./style.css";

const TestPart7Triple = ({
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

  // Nhóm câu hỏi theo groupId
  const groupedQuestions = useMemo(() => {
    const grouped = {};
    for (const question of questions) {
      const groupKey = question.questionGroup.groupId || "default";
      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(question);
    }
    return grouped;
  }, [questions]);

  // Kiểm tra xem nhóm câu hỏi đã được trả lời chưa
  const isGroupAnswered = (groupQuestions) => {
    return groupQuestions.every((question) => question.answered);
  };

  // Tính toán số thứ tự của câu hỏi
  const calculateQuestionNumber = (groupId, questionIndex) => {
    let questionNumber = questionIndex;
    let groupIds = Object.keys(groupedQuestions);
    for (let i = 0; i < groupIds.indexOf(groupId); i++) {
      if (groupedQuestions[groupIds[i]]) {
        questionNumber += groupedQuestions[groupIds[i]].length;
      }
    }
    return questionNumber;
  };

  // Hiển thị nội dung nhóm (hình ảnh hoặc đoạn văn)
  const shouldDisplayGroupContent = (groupQuestions) => {
    return (
      groupQuestions[0].questionGroup.groupImage ||
      groupQuestions[0].questionGroup.groupPassage
    );
  };

  // Đếm số câu trả lời đúng
  const getCorrectCount = useMemo(() => {
    return questions.filter(
      (q) => q.answered && q.selectedOption === q.correctOption
    ).length;
  }, [questions]);

  // Đếm số câu trả lời sai
  const getIncorrectCount = useMemo(() => {
    return questions.filter(
      (q) => q.answered && q.selectedOption !== q.correctOption
    ).length;
  }, [questions]);

  // Cuộn đến câu hỏi khi nhấp vào nút
  const scrollToQuestion = (groupId, index) => {
    const questionElement = document.getElementById(
      `question-${groupId}-${index}`
    );
    if (questionElement) {
      questionElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Hiển thị hoặc ẩn giải thích
  const toggleExplanation = async (index) => {
    setShowExplanation((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));

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

  return (
    <>
      <div className="col-lg col-md col-sm">
        <div className="card specific-card border-0 shadow-lg">
          <div className="card-body">
            <div className="row">
              {Object.entries(groupedQuestions).map(
                ([groupId, groupQuestions]) => (
                  <div className="col-sm-12 mt-3" key={groupId}>
                    {/* Nhóm câu hỏi */}
                    <div className="row">
                      <div className="col-md-6 bg-light rounded">
                        <div className="scrollable-container">
                          {shouldDisplayGroupContent(groupQuestions) &&
                            groupQuestions[0].questionGroup.groupImage && (
                              <div className="image-container">
                                <img
                                  src={getImageUrl(
                                    groupQuestions[0].questionGroup.groupImage
                                  )}
                                  style={{ width: "100%" }}
                                  alt="Luyện thi Listening TOEIC"
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
                                    __html:
                                      groupQuestions[0].questionGroup
                                        .groupPassage,
                                  }}
                                />
                              </div>
                            )}
                          </div>
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
                                  className="badge text-bg-secondary mb-2"
                                  style={{ fontSize: "14px" }}
                                >
                                  {question.questionType}
                                </span>
                                <div className="row">
                                  <ul className="mt-5">
                                    <button
                                      className="btn button5 mb-2"
                                      style={{
                                        backgroundColor: "#e8f2ff",
                                        color: "#35509a",
                                        width: "60px",
                                      }}
                                    >
                                      {calculateQuestionNumber(groupId, index) +
                                        1}
                                    </button>

                                    <span className="ms-1">
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
                                                question.selectedOption ===
                                                option
                                              }
                                              onChange={() => {
                                                question.selectedOption =
                                                  option;
                                                // Gọi hàm để cập nhật state nếu cần
                                              }}
                                              disabled={question.isGraded}
                                              name={`flexRadioDefault-${question.questionId}`}
                                            />
                                            {option}

                                            {question.isGraded &&
                                              option ===
                                                question.correctOption && (
                                                <div className="result-icon">
                                                  <i
                                                    className="fas fa-check"
                                                    style={{ color: "green" }}
                                                  ></i>
                                                </div>
                                              )}
                                            {question.isGraded &&
                                              option ===
                                                question.selectedOption &&
                                              option !==
                                                question.correctOption && (
                                                <div className="result-icon">
                                                  <i
                                                    className="fas fa-times"
                                                    style={{ color: "red" }}
                                                  ></i>
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
                                        onClick={() =>
                                          toggleExplanation(
                                            calculateQuestionNumber(
                                              groupId,
                                              index
                                            )
                                          )
                                        }
                                        className="btn btn-link btn-sm mt-2 link-offset-3"
                                      >
                                        {showExplanation[
                                          calculateQuestionNumber(
                                            groupId,
                                            index
                                          )
                                        ]
                                          ? "Ẩn giải thích"
                                          : "Hiện giải thích"}
                                      </button>
                                      {showExplanation[
                                        calculateQuestionNumber(groupId, index)
                                      ] && (
                                        <div className="transcript">
                                          <div className="explanation-original">
                                            <div
                                              dangerouslySetInnerHTML={{
                                                __html:
                                                  question.questionExplanation,
                                              }}
                                            />
                                          </div>
                                          {question.translatedExplanation && (
                                            <div className="transcript-translation">
                                              <span className="badge text-bg-success">
                                                Bản dịch
                                              </span>
                                              <div
                                                dangerouslySetInnerHTML={{
                                                  __html:
                                                    question.translatedExplanation,
                                                }}
                                              />
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
                )
              )}
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
                {Object.entries(groupedQuestions).map(
                  ([groupId, groupQuestions]) => (
                    <React.Fragment key={groupId}>
                      {groupQuestions.map((question, index) => (
                        <button
                          key={`${groupId}-${index}`}
                          onClick={() => scrollToQuestion(groupId, index)}
                          className="equal-size-button"
                          style={{
                            backgroundColor: question.selectedOption
                              ? question.isGraded
                                ? question.selectedOption ===
                                  question.correctOption
                                  ? "green"
                                  : "red"
                                : "orange"
                              : "",
                            color: question.selectedOption ? "white" : "black",
                          }}
                        >
                          <span className="order-number">
                            {calculateQuestionNumber(groupId, index) + 1}
                          </span>
                        </button>
                      ))}
                    </React.Fragment>
                  )
                )}
              </div>
              <div className="score">
                <i className="fas fa-square" style={{ color: "green" }}></i>{" "}
                {getCorrectCount}/{questions.length}
                <i
                  className="fas fa-square ms-2"
                  style={{ color: "red" }}
                ></i>{" "}
                {getIncorrectCount}/{questions.length}
              </div>
              <div className="row mt-3">
                <div className="d-flex justify-content-center">
                  {isSubmited ? (
                    <button className="btn btn-light" onClick={refreshPage}>
                      <i className="fas fa-sync-alt text-success"></i> Làm lại
                    </button>
                  ) : (
                    <button className="button" onClick={submitAnswers}>
                      Chấm điểm
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TestPart7Triple;
