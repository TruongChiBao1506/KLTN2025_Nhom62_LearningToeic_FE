import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./style.css";

const ExamQuestionList = ({
  examQuestions,
  submitAnswers,
  parts,
  groupedQuestionsByPart,
  hasSubmitted,
  formatTime,
  countdown,
  userExamId,
  goalScore,
  onAnswerChange,
  viewedQuestions = [],
  markQuestionAsViewed,
  darkMode = false,
}) => {
  const [selectedPart, setSelectedPart] = useState(parts[0] || "PART1");
  const [flaggedQuestions, setFlaggedQuestions] = useState([]);
  const [showExplanation, setShowExplanation] = useState({});
  const [showGroupScript, setShowGroupScript] = useState({});
  const [groupedQuestions, setGroupedQuestions] = useState({});
  const [localExamQuestions, setLocalExamQuestions] = useState([]);
  const [modal, setModal] = useState({ show: false, part: null });

  useEffect(() => {
    // Chép examQuestions từ props để có thể xử lý ở local mà không ảnh hưởng đến parent
    setLocalExamQuestions([...examQuestions]);

    // Khôi phục trạng thái đã lưu (nếu có)
    const savedState = localStorage.getItem(`exam_${userExamId}_state`);
    if (savedState && !hasSubmitted) {
      try {
        const { flagged, selected } = JSON.parse(savedState);
        setFlaggedQuestions(flagged || []);

        // Cập nhật các câu trả lời đã lưu
        if (selected && selected.length > 0) {
          const updatedQuestions = examQuestions.map((q) => {
            const savedQuestion = selected.find(
              (sq) => sq.examQuestionId === q.examQuestionId
            );
            if (savedQuestion && savedQuestion.selectedOption) {
              return { ...q, selectedOption: savedQuestion.selectedOption };
            }
            return q;
          });
          setLocalExamQuestions(updatedQuestions);
        }
      } catch (error) {
        console.error("Lỗi khi khôi phục trạng thái:", error);
      }
    }
  }, [examQuestions, userExamId, hasSubmitted]);

  // Mỗi khi có thay đổi câu trả lời, lưu trạng thái
  useEffect(() => {
    if (!hasSubmitted && userExamId) {
      const selectedAnswers = localExamQuestions
        .filter((q) => q.selectedOption)
        .map((q) => ({
          examQuestionId: q.examQuestionId,
          selectedOption: q.selectedOption,
        }));

      const stateToSave = {
        flagged: flaggedQuestions,
        selected: selectedAnswers,
      };

      localStorage.setItem(
        `exam_${userExamId}_state`,
        JSON.stringify(stateToSave)
      );
    }
  }, [localExamQuestions, flaggedQuestions, userExamId, hasSubmitted]);

  // Nhóm các câu hỏi theo audio hoặc passage
  useEffect(() => {
    const filteredQuestionsByPart = localExamQuestions.filter(
      (examQuestion) => examQuestion.questionPart === selectedPart
    );

    const grouped = groupQuestionsByAudioOrPassage(filteredQuestionsByPart);
    setGroupedQuestions(grouped);
  }, [selectedPart, localExamQuestions]);

  // Hiển thị thông báo khi người dùng rời trang
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!hasSubmitted) {
        const message =
          "Bạn có chắc chắn muốn rời khỏi trang? Dữ liệu làm bài của bạn có thể bị mất!";
        event.returnValue = message;
        return message;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasSubmitted]);

  const groupQuestionsByAudioOrPassage = (questions) => {
    const grouped = {};
    for (const examQuestion of questions) {
      const groupKey =
        examQuestion.questionAudio || examQuestion.questionPassage || "default";
      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(examQuestion);
    }
    return grouped;
  };

  const getImageUrl = (imageName) => {
    if (imageName) {
      return `http://localhost:5000/images/${imageName}`;
    }
    return "";
  };

  const getAudioUrl = (audioName) => {
    if (audioName) {
      return `http://localhost:5000/audios/${audioName}`;
    }
    return "";
  };

  const handleSelectPart = (part) => {
    setSelectedPart(part);
    window.scrollTo(0, 0);
  };

  const handleToggleFlag = (examQuestion) => {
    const newFlaggedQuestions = [...flaggedQuestions];
    const index = newFlaggedQuestions.findIndex(
      (q) => q.examQuestionId === examQuestion.examQuestionId
    );

    if (index !== -1) {
      newFlaggedQuestions.splice(index, 1);
    } else {
      newFlaggedQuestions.push(examQuestion);
    }

    setFlaggedQuestions(newFlaggedQuestions);
  };

  const isFlagged = (examQuestion) => {
    return flaggedQuestions.some(
      (q) => q.examQuestionId === examQuestion.examQuestionId
    );
  };

  const toggleExplanation = (index) => {
    setShowExplanation((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleGroupScript = (groupId) => {
    setShowGroupScript((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const shouldDisplayAudio = (examQuestion) => {
    return (
      examQuestion.questionAudio !== null && examQuestion.questionAudio !== ""
    );
  };

  const shouldDisplayImage = (examQuestion) => {
    return (
      examQuestion.questionImage !== null && examQuestion.questionImage !== ""
    );
  };

  const shouldDisplayPassage = (examQuestion) => {
    return (
      examQuestion.questionPassage !== null &&
      examQuestion.questionPassage !== ""
    );
  };

  const markAsListened = (question) => {
    const updatedQuestions = localExamQuestions.map((q) => {
      if (q.examQuestionId === question.examQuestionId) {
        return { ...q, hasListened: true };
      }
      return q;
    });
    setLocalExamQuestions(updatedQuestions);
  };

  const isGroupAnswered = (groupQuestions) => {
    return groupQuestions.every((examQuestion) => examQuestion.isGraded);
  };

  const getOptions = (examQuestion) => {
    // Phần 2 chỉ có 3 đáp án
    if (examQuestion.orderNumber >= 7 && examQuestion.orderNumber <= 31) {
      return [examQuestion.optionA, examQuestion.optionB, examQuestion.optionC];
    }
    return [
      examQuestion.optionA,
      examQuestion.optionB,
      examQuestion.optionC,
      examQuestion.optionD,
    ];
  };

  const getOptionClass = (examQuestion, option) => {
    return {
      "highlight-row": option === examQuestion.selectedOption,
    };
  };
  const handleSelectOption = (examQuestion, option) => {
    if (hasSubmitted) return;

    const updatedQuestions = localExamQuestions.map((q) => {
      if (q.examQuestionId === examQuestion.examQuestionId) {
        return { ...q, selectedOption: option };
      }
      return q;
    });
    setLocalExamQuestions(updatedQuestions);

    // Thông báo cho component cha về thay đổi
    if (onAnswerChange) {
      onAnswerChange(examQuestion.examQuestionId, option);
    }
  };
  const isQuestionViewed = (examQuestion) => {
    return viewedQuestions.includes(examQuestion.examQuestionId);
  };

  const scrollToQuestion = (part, index) => {
    const examQuestionElement = document.getElementById(
      `examQuestion-part-${part}-${index}`
    );
    if (examQuestionElement) {
      examQuestionElement.scrollIntoView({ behavior: "smooth" });

      // Thêm class active tạm thời để đánh dấu câu hỏi
      examQuestionElement.classList.add("bg-highlight");
      setTimeout(() => {
        examQuestionElement.classList.remove("bg-highlight");
      }, 2000);

      // Đánh dấu câu hỏi đã xem
      const question = examQuestions.find(
        (q) => q.questionPart === part && q.orderNumber === index
      );
      if (question && markQuestionAsViewed) {
        markQuestionAsViewed(question.examQuestionId);
      }
    }
  };

  // Di chuyển đến câu hỏi tiếp theo/trước
  const navigateToNextQuestion = (currentPart, currentNumber) => {
    const currentPartQuestions = groupedQuestionsByPart[currentPart] || [];
    const currentIndex = currentPartQuestions.findIndex(
      (q) => q.orderNumber === currentNumber
    );

    if (currentIndex < currentPartQuestions.length - 1) {
      // Còn câu tiếp theo trong cùng phần
      scrollToQuestion(
        currentPart,
        currentPartQuestions[currentIndex + 1].orderNumber
      );
      return;
    }

    // Tìm phần tiếp theo
    const currentPartIndex = parts.indexOf(currentPart);
    if (currentPartIndex < parts.length - 1) {
      const nextPart = parts[currentPartIndex + 1];
      if (groupedQuestionsByPart[nextPart]?.length > 0) {
        scrollToQuestion(
          nextPart,
          groupedQuestionsByPart[nextPart][0].orderNumber
        );
        setSelectedPart(nextPart);
      }
    }
  };

  const navigateToPrevQuestion = (currentPart, currentNumber) => {
    const currentPartQuestions = groupedQuestionsByPart[currentPart] || [];
    const currentIndex = currentPartQuestions.findIndex(
      (q) => q.orderNumber === currentNumber
    );

    if (currentIndex > 0) {
      // Còn câu trước trong cùng phần
      scrollToQuestion(
        currentPart,
        currentPartQuestions[currentIndex - 1].orderNumber
      );
      return;
    }

    // Tìm phần trước
    const currentPartIndex = parts.indexOf(currentPart);
    if (currentPartIndex > 0) {
      const prevPart = parts[currentPartIndex - 1];
      const prevPartQuestions = groupedQuestionsByPart[prevPart] || [];
      if (prevPartQuestions.length > 0) {
        scrollToQuestion(
          prevPart,
          prevPartQuestions[prevPartQuestions.length - 1].orderNumber
        );
        setSelectedPart(prevPart);
      }
    }
  };

  const getCorrectCount = () => {
    return localExamQuestions.filter(
      (q) => q.answered && q.selectedOption === q.correctOption
    ).length;
  };

  const getIncorrectCount = () => {
    return localExamQuestions.filter(
      (q) => q.answered && q.selectedOption !== q.correctOption
    ).length;
  };

  const openInstructionModal = (part) => {
    setModal({ show: true, part });
  };

  const closeModal = () => {
    setModal({ show: false, part: null });
  };

  // Modal hướng dẫn
  const InstructionModal = () => {
    if (!modal.show) return null;

    let instructionText = "";
    switch (modal.part) {
      case "PART1":
        instructionText =
          "Nhìn hình ảnh và nghe câu. Chọn câu mô tả chính xác nhất hình ảnh.";
        break;
      case "PART2":
        instructionText =
          "Nghe câu hỏi và ba câu trả lời. Chọn câu trả lời phù hợp nhất với câu hỏi.";
        break;
      case "PART3":
        instructionText =
          "Nghe đoạn hội thoại. Sau đó đọc từng câu hỏi và chọn câu trả lời tốt nhất.";
        break;
      case "PART4":
        instructionText =
          "Nghe đoạn nói chuyện. Sau đó đọc từng câu hỏi và chọn câu trả lời tốt nhất.";
        break;
      case "PART5":
        instructionText = "Chọn từ hoàn thành câu một cách tốt nhất.";
        break;
      case "PART6":
        instructionText =
          "Chọn từ hoặc cụm từ hoàn thành chỗ trống một cách tốt nhất.\nChủ đề: Thông báo, thư, email, quảng cáo.";
        break;
      case "PART7":
        instructionText = "Đọc đoạn văn và chọn câu trả lời đúng.";
        break;
      default:
        instructionText = "Hướng dẫn đang được cập nhật.";
    }

    return (
      <div className="modal-backdrop">
        <div className="modal-content-custom">
          <div className="modal-header-custom">
            <h5 className="modal-title">
              <i className="fa-regular fa-lightbulb me-2"></i>
              Hướng dẫn làm Phần {modal.part.replace("PART", "")}
            </h5>
            <button
              type="button"
              className="modal-close-button"
              onClick={closeModal}
            >
              &times;
            </button>
          </div>
          <div className="modal-body-custom d-flex justify-content-center">
            <p>{instructionText}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <InstructionModal />
      <div className="col-lg col-md col-sm">
        <div className="card specific-card border-0 shadow-lg mb-4">
          <div className="card-body">
            {/* Phần chọn Part */}
            <div className="mb-3 d-flex justify-content-center">
              {parts.map((part) => (
                <button
                  key={part}
                  type="button"
                  className={`button ms-4 ${
                    selectedPart === part ? "active-part" : ""
                  }`}
                  onClick={() => handleSelectPart(part)}
                >
                  Phần {part.replace("PART", "")}
                </button>
              ))}
            </div>

            {/* Thông báo lưu ý */}
            <div
              className="alert alert-primary alert-dismissible fade show"
              role="alert"
              style={{ fontSize: "16px" }}
            >
              <p className="text-warning">
                <i className="fa-solid fa-triangle-exclamation"></i> Lưu ý:{" "}
              </p>
              <p>
                Phần nghe bạn chỉ nghe 1 lần duy nhất, vui lòng không xả để
                tránh mất phần nghe
              </p>
              <p>
                Làm tuần tự các câu, câu nào không làm được xin hãy bỏ trống để
                đánh giá đúng năng lực
              </p>
              <p>
                Không xem trước phần đọc vì khi thi chính thức sẽ bị thu bài
              </p>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="alert"
                aria-label="Close"
              ></button>
            </div>

            {/* Nút hướng dẫn */}
            <div className="d-flex justify-content-end fst-italic">
              <button
                type="button"
                className="btn btn-link link-offset-3"
                onClick={() => openInstructionModal(selectedPart)}
              >
                <i
                  style={{ fontSize: "30px" }}
                  className="fa-regular fa-circle-question mx-2"
                ></i>
              </button>
            </div>

            {/* Hiển thị câu hỏi của part đã chọn */}
            <div className="row">
              {Object.entries(groupedQuestions).map(([groupId, questions]) => (
                <div className="col-sm-12" key={groupId}>
                  {/* Hiển thị audio nếu có */}
                  {shouldDisplayAudio(questions[0]) &&
                    !questions[0].hasListened && (
                      <div className="audio-container mt-5 mb-2">
                        <audio
                          controls
                          style={{ width: "400px" }}
                          onEnded={() => markAsListened(questions[0])}
                        >
                          <source
                            src={getAudioUrl(questions[0].questionAudio)}
                            type="audio/mpeg"
                          />
                          Trình duyệt của bạn không hỗ trợ phát audio.
                        </audio>
                      </div>
                    )}

                  <div className="row">
                    {/* Hiển thị hình ảnh hoặc đoạn văn nếu có */}
                    {(shouldDisplayImage(questions[0]) ||
                      shouldDisplayPassage(questions[0])) && (
                      <div
                        className={`
                          ${
                            shouldDisplayImage(questions[0]) ||
                            (shouldDisplayPassage(questions[0]) &&
                              questions.length >= 2)
                              ? "col-md-6"
                              : "col-md-12"
                          }
                          ${
                            shouldDisplayImage(questions[0]) ||
                            (shouldDisplayPassage(questions[0]) &&
                              questions.length >= 2)
                              ? "bg-light rounded"
                              : ""
                          }
                          ${
                            shouldDisplayPassage(questions[0]) &&
                            questions.length >= 4
                              ? "scrollable-container"
                              : ""
                          }
                        `}
                      >
                        {shouldDisplayImage(questions[0]) && (
                          <div className="audio-image-container mt-3">
                            <div className="image-container">
                              <img
                                src={getImageUrl(questions[0].questionImage)}
                                style={{ width: "400px" }}
                                alt="Luyện thi Listening TOEIC"
                                className="question-image"
                                loading="lazy"
                              />
                            </div>
                          </div>
                        )}

                        {shouldDisplayPassage(questions[0]) && (
                          <div className="audio-image-container mt-5">
                            <div className="audio-container mb-2">
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: questions[0].questionPassage,
                                }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Hiển thị câu hỏi và đáp án */}
                    <div className="col-md">
                      <div
                        className={`${
                          shouldDisplayPassage(questions[0]) &&
                          questions.length >= 4
                            ? "scrollable-container"
                            : ""
                        }`}
                      >
                        {questions.map((examQuestion, index) => (
                          <div
                            key={examQuestion.examQuestionId}
                            id={`examQuestion-part-${selectedPart}-${examQuestion.orderNumber}`}
                            className={`ms-3 question ${
                              isQuestionViewed(examQuestion)
                                ? "viewed-question"
                                : ""
                            }`}
                            onClick={() =>
                              markQuestionAsViewed &&
                              markQuestionAsViewed(examQuestion.examQuestionId)
                            }
                          >
                            <div className="row">
                              {!examQuestion.isGraded && (
                                <div className="text-end mt-2">
                                  <button
                                    onClick={() =>
                                      handleToggleFlag(examQuestion)
                                    }
                                    className="btn border border-primary"
                                  >
                                    <i className="fa-solid fa-flag text-danger me-2"></i>
                                    {isFlagged(examQuestion)
                                      ? "Gỡ cờ"
                                      : "Cắm cờ"}
                                  </button>
                                </div>
                              )}

                              <ul>
                                <button
                                  className="btn button5 my-2"
                                  style={{
                                    backgroundColor: "#e8f2ff",
                                    color: "#35509a",
                                    width: "60px",
                                  }}
                                >
                                  {examQuestion.orderNumber}
                                </button>

                                <span className="ms-1">
                                  {examQuestion.questionContent}
                                </span>
                                {getOptions(examQuestion).map(
                                  (option, optionIndex) => (
                                    <li
                                      key={optionIndex}
                                      className={
                                        option === examQuestion.selectedOption
                                          ? "highlight-row"
                                          : ""
                                      }
                                      onClick={() =>
                                        !examQuestion.isGraded &&
                                        handleSelectOption(examQuestion, option)
                                      }
                                    >
                                      <label className="form-check-label">
                                        <input
                                          className="form-check-input"
                                          type="radio"
                                          value={option}
                                          checked={
                                            examQuestion.selectedOption ===
                                            option
                                          }
                                          disabled={examQuestion.isGraded}
                                          onChange={() =>
                                            !examQuestion.isGraded &&
                                            handleSelectOption(
                                              examQuestion,
                                              option
                                            )
                                          }
                                          name={`flexRadioDefault-${examQuestion.examQuestionId}`}
                                        />
                                        {option}

                                        {examQuestion.isGraded &&
                                          option ===
                                            examQuestion.correctOption && (
                                            <div className="result-icon">
                                              <i
                                                className="fas fa-check"
                                                style={{ color: "green" }}
                                              ></i>
                                            </div>
                                          )}
                                        {examQuestion.isGraded &&
                                          option ===
                                            examQuestion.selectedOption &&
                                          option !==
                                            examQuestion.correctOption && (
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
                                {examQuestion.isGraded &&
                                  examQuestion.questionExplanation && (
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
                                        <div
                                          className="explanation"
                                          dangerouslySetInnerHTML={{
                                            __html:
                                              examQuestion.questionExplanation,
                                          }}
                                        />
                                      )}
                                    </div>
                                  )}
                              </ul>
                            </div>
                          </div>
                        ))}{" "}
                      </div>

                      {/* Navigation buttons */}
                      {questions.length > 0 && !hasSubmitted && (
                        <div className="question-navigation mt-3">
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() =>
                              navigateToPrevQuestion(
                                selectedPart,
                                questions[0].orderNumber
                              )
                            }
                          >
                            <i className="fas fa-arrow-left me-1"></i> Câu trước
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() =>
                              navigateToNextQuestion(
                                selectedPart,
                                questions[questions.length - 1].orderNumber
                              )
                            }
                          >
                            Câu tiếp <i className="fas fa-arrow-right ms-1"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hiển thị TranScript */}
                  {isGroupAnswered(questions) &&
                    questions[0].questionScript && (
                      <>
                        <button
                          onClick={() => toggleGroupScript(groupId)}
                          className="btn btn-link btn-sm link-offset-3"
                        >
                          {showGroupScript[groupId]
                            ? "Ẩn TranScript"
                            : "Xem TranScript"}
                        </button>
                        {showGroupScript[groupId] && (
                          <div
                            className="transcript mb-2"
                            dangerouslySetInnerHTML={{
                              __html: questions[0].questionScript,
                            }}
                          />
                        )}
                      </>
                    )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Phần bên phải - Question Palette */}
      <div className="col-lg-4 col-md-4 col-sm-4 text-decoration-none border-0">
        <div
          className="card specific-card border-0 shadow"
          style={{ position: "sticky", top: "95px", zIndex: 1 }}
        >
          <div className="card-body border-0">
            <div className="countdown-section mb-2">
              <p>
                <span style={{ fontSize: "20px" }}>&#9200;</span>
                <span style={{ color: "green", fontSize: "24px" }}>
                  {formatTime(countdown)}
                </span>
              </p>
            </div>
            <h5 className="fw-normal fs-6 text-center bg-info text-white p-2 border rounded-4">
              Bảng câu hỏi
            </h5>
            <div className="question-list-section lesson-content">
              {parts.map((part) => (
                <div key={part}>
                  <h6
                    className="fw-normal fs-6 ms-3 text-start mt-2"
                    onClick={() => handleSelectPart(part)}
                    style={{ cursor: "pointer" }}
                  >
                    {selectedPart === part && (
                      <i className="fa-solid fa-chevron-right me-2"></i>
                    )}
                    Phần {part.replace("PART", "")}
                  </h6>

                  <div
                    className="question-buttons mb-2 mx-2"
                    style={{ display: "flex", flexWrap: "wrap" }}
                  >
                    {groupedQuestionsByPart[part]?.map((examQuestion) => {
                      let buttonStyle = {};
                      let buttonClassName = "equal-size-button";

                      if (examQuestion.selectedOption) {
                        if (examQuestion.isGraded) {
                          if (
                            examQuestion.selectedOption ===
                            examQuestion.correctOption
                          ) {
                            buttonStyle = {
                              backgroundColor: "green",
                              color: "white",
                            };
                            buttonClassName += " correct";
                          } else {
                            buttonStyle = {
                              backgroundColor: "red",
                              color: "white",
                            };
                            buttonClassName += " incorrect";
                          }
                        } else {
                          buttonStyle = {
                            backgroundColor: "orange",
                            color: "white",
                          };
                          buttonClassName += " selected";
                        }
                      }

                      return (
                        <button
                          key={examQuestion.examQuestionId}
                          onClick={() =>
                            scrollToQuestion(part, examQuestion.orderNumber)
                          }
                          className={buttonClassName}
                          style={buttonStyle}
                        >
                          {!examQuestion.isGraded &&
                            isFlagged(examQuestion) && (
                              <i className="fa-solid fa-flag flag-icon text-danger"></i>
                            )}
                          <span className="order-number">
                            {examQuestion.orderNumber}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="row mt-3">
            <div className="d-flex justify-content-center">
              {hasSubmitted ? (
                <div className="score">
                  <i className="fas fa-square" style={{ color: "green" }}></i>{" "}
                  {getCorrectCount()}/{localExamQuestions.length}
                  <i
                    className="fas fa-square ms-2"
                    style={{ color: "red" }}
                  ></i>{" "}
                  {getIncorrectCount()}/{localExamQuestions.length}
                </div>
              ) : (
                <button className="button" onClick={() => submitAnswers()}>
                  Nộp bài
                </button>
              )}
            </div>
          </div>
          {hasSubmitted && (
            <Link
              to={`/exam-result/${userExamId}`}
              className="fw-normal fs-6 text-center bg-info text-white p-2 border text-decoration-none d-block mt-3"
            >
              Đi tới trang đánh giá kết quả{" "}
              <i className="fa-solid fa-right-from-bracket ms-2"></i>
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default ExamQuestionList;
