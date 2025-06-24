import React, { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faSync } from "@fortawesome/free-solid-svg-icons";
import "./style.css";

const TestPart3 = ({
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
  const [showGroupScript, setShowGroupScript] = useState({});

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

  const toggleGroupScript = async (groupId) => {
    setShowGroupScript((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));

    // Dịch đoạn văn khi hiển thị
    if (!showGroupScript[groupId]) {
      const groupQuestions = groupedQuestions[groupId];
      const groupScript = groupQuestions[0].questionGroup.groupScript;
      const targetLanguage = "vi"; // Tiếng Việt
      try {
        const translatedGroupScript = await translateText(groupScript, targetLanguage);
        groupQuestions[0].questionGroup.translatedGroupScript = translatedGroupScript;
      } catch (error) {
        console.error("Lỗi khi dịch:", error);
      }
    }
  };

  // Kiểm tra xem tất cả các câu hỏi trong nhóm đã được trả lời chưa
  const isGroupAnswered = (groupQuestions) => {
    return groupQuestions.every((question) => question.isGraded);
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
                <div className="col-sm-12" key={groupId}>
                  <div className="audio-container mt-5 mb-2">
                    <audio controls style={{ width: "400px" }}>
                      <source
                        src={getAudioUrl(groupQuestions[0].questionGroup.groupAudio)}
                        type="audio/mpeg"
                      />
                      Trình duyệt của bạn không hỗ trợ phát âm thanh.
                    </audio>
                  </div>

                  {groupQuestions[0].questionGroup.groupImage ? (
                    <div className="row">
                      <div className="col-md-6 bg-light rounded">
                        <div className="audio-image-container mt-5">
                          {shouldDisplayGroupContent(groupQuestions) && (
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
                                  <ul className="">
                                    <button
                                      className="btn mb-2"
                                      style={{
                                        backgroundColor: "#e8f2ff",
                                        color: "#35509a",
                                        width: "60px",
                                      }}
                                    >
                                      {calculateQuestionNumber(
                                        parseInt(groupId),
                                        index
                                      ) + 1}
                                    </button>

                                    <span className="ms-1">
                                      {question.questionContent}
                                    </span>
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
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="row">
                      <div className="col-md-12">
                        <div className="">
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
                                  <ul className="">
                                    <button
                                      className="btn mb-2"
                                      style={{
                                        backgroundColor: "#e8f2ff",
                                        color: "#35509a",
                                        width: "60px",
                                      }}
                                    >
                                      {calculateQuestionNumber(
                                        parseInt(groupId),
                                        index
                                      ) + 1}
                                    </button>

                                    <span className="ms-1">
                                      {question.questionContent}
                                    </span>
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
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Hiển thị groupScript nếu tất cả câu hỏi trong nhóm đã được trả lời */}
                  {isGroupAnswered(groupQuestions) && (
                    <>
                      <button
                        onClick={() => toggleGroupScript(groupId)}
                        className="btn btn-link btn-sm link-offset-3"
                      >
                        {showGroupScript[groupId]
                          ? "Ẩn đoạn văn"
                          : "Hiển thị đoạn văn"}
                      </button>
                      {showGroupScript[groupId] && (
                        <div className="transcript mb-2">
                          <div className="transcript-original">
                            <div
                              dangerouslySetInnerHTML={{
                                __html: groupQuestions[0].questionGroup.groupScript,
                              }}
                            ></div>
                          </div>
                          {groupQuestions[0].questionGroup.translatedGroupScript && (
                            <div className="transcript-translation">
                              <span className="badge bg-success">Bản dịch</span>
                              <div
                                dangerouslySetInnerHTML={{
                                  __html:
                                    groupQuestions[0].questionGroup.translatedGroupScript,
                                }}
                              ></div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
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

export default TestPart3;
