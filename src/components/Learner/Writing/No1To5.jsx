import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import "./style.css";
import TestService from "../../../services/testService";

const No1To5 = ({ testId }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isReadyToTest, setIsReadyToTest] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [preparingCountdown, setPreparingCountdown] = useState([]);
  const [writingCountdown, setWritingCountdown] = useState([]);
  const [isPreparingCountDown, setIsPreparingCountDown] = useState([]);
  const [isWritingCountDown, setIsWritingCountDown] = useState([]);
  const [isFinished, setIsFinished] = useState([]);

  // Interval refs để clear
  const preparationIntervalRef = React.useRef(null);
  const writingIntervalRef = React.useRef(null);

  // Lấy câu hỏi từ bài kiểm tra
  const retrieveQuestions = async () => {
    try {
      const response = await TestService.getQuestionsByTestId(testId);
      setQuestions(response);

      // Khởi tạo các giá trị mặc định
      setAnswers(response.map(() => ""));
      setPreparingCountdown(response.map(() => 45)); // 45 seconds for preparation
      setWritingCountdown(response.map(() => 300)); // 5 minutes (300 sec) for writing
      setIsPreparingCountDown(response.map(() => false));
      setIsWritingCountDown(response.map(() => false));
      setIsFinished(response.map(() => false));
    } catch (error) {
      console.log(error);
    }
  };

  // Bắt đầu kiểm tra
  const startTest = () => {
    setIsReadyToTest(true);

    // Bắt đầu đếm ngược thời gian chuẩn bị cho câu đầu tiên
    const newIsPreparingCountDown = [...isPreparingCountDown];
    newIsPreparingCountDown[0] = true;
    setIsPreparingCountDown(newIsPreparingCountDown);

    // Cập nhật đếm ngược cho thời gian chuẩn bị
    preparationIntervalRef.current = setInterval(() => {
      setPreparingCountdown((prev) => {
        const updated = [...prev];
        if (isPreparingCountDown[currentIndex] && updated[currentIndex] > 0) {
          updated[currentIndex] = updated[currentIndex] - 1;

          // Khi hết thời gian chuẩn bị, bắt đầu thời gian viết
          if (updated[currentIndex] === 0) {
            startWriting(currentIndex);
          }
        }
        return updated;
      });
    }, 1000);

    // Cập nhật đếm ngược cho thời gian viết
    writingIntervalRef.current = setInterval(() => {
      setWritingCountdown((prev) => {
        const updated = [...prev];
        if (isWritingCountDown[currentIndex] && updated[currentIndex] > 0) {
          updated[currentIndex] = updated[currentIndex] - 1;

          // Khi hết thời gian viết, tự động kết thúc
          if (updated[currentIndex] === 0) {
            finishWriting(currentIndex);
          }
        }
        return updated;
      });
    }, 1000);
  };

  // Bắt đầu thời gian viết
  const startWriting = (index) => {
    // Dừng đếm ngược chuẩn bị
    const newIsPreparingCountDown = [...isPreparingCountDown];
    newIsPreparingCountDown[index] = false;
    setIsPreparingCountDown(newIsPreparingCountDown);

    // Bắt đầu đếm ngược thời gian viết
    const newIsWritingCountDown = [...isWritingCountDown];
    newIsWritingCountDown[index] = true;
    setIsWritingCountDown(newIsWritingCountDown);
  };

  // Hoàn thành viết
  const finishWriting = (index) => {
    // Dừng đếm ngược thời gian viết
    const newIsWritingCountDown = [...isWritingCountDown];
    newIsWritingCountDown[index] = false;
    setIsWritingCountDown(newIsWritingCountDown);

    // Đánh dấu là đã hoàn thành
    const newIsFinished = [...isFinished];
    newIsFinished[index] = true;
    setIsFinished(newIsFinished);
  };

  // Xử lý khi nhập câu trả lời
  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  // Quay lại câu trước
  const showPreviousQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Tiến đến câu tiếp theo
  const showNextQuestion = () => {
    if (currentIndex < questions.length - 1 && isFinished[currentIndex]) {
      setCurrentIndex(currentIndex + 1);

      // Nếu câu tiếp theo chưa bắt đầu, bắt đầu đếm ngược thời gian chuẩn bị
      if (
        !isPreparingCountDown[currentIndex + 1] &&
        !isWritingCountDown[currentIndex + 1] &&
        !isFinished[currentIndex + 1]
      ) {
        const newIsPreparingCountDown = [...isPreparingCountDown];
        newIsPreparingCountDown[currentIndex + 1] = true;
        setIsPreparingCountDown(newIsPreparingCountDown);
      }
    }
  };

  // Làm lại tất cả
  const refreshAllQuestions = () => {
    // Dừng tất cả đếm ngược
    clearInterval(preparationIntervalRef.current);
    clearInterval(writingIntervalRef.current);

    // Reset lại tất cả trạng thái
    setCurrentIndex(0);
    retrieveQuestions();
    startTest();
  };

  // Khởi tạo khi component mount
  useEffect(() => {
    retrieveQuestions();

    // Cleanup khi component unmount
    return () => {
      clearInterval(preparationIntervalRef.current);
      clearInterval(writingIntervalRef.current);
    };
  }, [testId]);

  // Format thời gian
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-12">
          <div className="card mt-3" style={{ transform: "none" }}>
            <div className="card-body">
              <div className="d-flex justify-content-center">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/5307/5307013.png"
                  alt="Writing"
                  width="100px"
                  height="100px"
                />
              </div>
              <h2 className="text-center my-3">
                Writing: Viết câu trả lời ngắn
              </h2>
              <h5 className="card-title text-primary">Hướng dẫn:</h5>
              <p className="card-text">
                Trong phần kiểm tra này, bạn sẽ viết câu trả lời cho câu hỏi
                được đưa ra. Bạn sẽ có <strong>45</strong> giây để chuẩn bị và{" "}
                <strong>5</strong> phút để viết câu trả lời.
              </p>
              <h5 className="card-title text-primary">Tiêu chí đánh giá:</h5>
              <span className="badge bg-success-subtle border border-successs-subtle text-success-emphasis rounded-pill">
                Nội dung, ngữ pháp, từ vựng và tổ chức.
              </span>
            </div>
          </div>

          <div className="card mt-3" style={{ transform: "none" }}>
            <div className="card-body">
              {!isReadyToTest ? (
                <button className="button" onClick={startTest}>
                  Sẵn sàng luyện tập
                </button>
              ) : (
                <div>
                  <button
                    className="button bg-primary"
                    onClick={refreshAllQuestions}
                  >
                    Làm lại
                  </button>

                  <div className="writing-item">
                    <div className="mb-5">
                      <div className="text-end" style={{ fontSize: "20px" }}>
                        {isPreparingCountDown[currentIndex] && (
                          <span className="badge bg-primary-subtle border border-primary-subtle text-primary-emphasis rounded-pill">
                            Thời gian chuẩn bị:{" "}
                            {preparingCountdown[currentIndex]}s
                          </span>
                        )}
                        {isWritingCountDown[currentIndex] && (
                          <span className="badge ms-3 bg-success-subtle border border-successs-subtle text-success-emphasis rounded-pill">
                            Thời gian viết:{" "}
                            {formatTime(writingCountdown[currentIndex])}
                          </span>
                        )}
                      </div>

                      <div className="question-info mt-4">
                        <button
                          className="btn button5 my-2 me-3"
                          style={{
                            backgroundColor: "#e8f2ff",
                            color: "#35509a",
                            width: "40px",
                          }}
                        >
                          {currentIndex + 1}
                        </button>
                        <br />
                        <strong className="ms-3">Câu hỏi:</strong>
                        <div
                          className="ms-3 mt-2"
                          dangerouslySetInnerHTML={{
                            __html: questions[currentIndex]?.questionText || "",
                          }}
                        ></div>
                      </div>

                      <div className="answer-section mt-4">
                        <div className="form-floating">
                          <textarea
                            className="form-control"
                            placeholder="Nhập câu trả lời của bạn tại đây"
                            style={{ height: "200px" }}
                            value={answers[currentIndex] || ""}
                            onChange={(e) =>
                              handleAnswerChange(currentIndex, e.target.value)
                            }
                            disabled={isFinished[currentIndex]}
                          ></textarea>
                          <label>Nhập câu trả lời của bạn tại đây</label>
                        </div>
                      </div>

                      <div className="writing-actions d-flex justify-content-center mt-4">
                        {isWritingCountDown[currentIndex] && (
                          <button
                            className="btn btn-success"
                            onClick={() => finishWriting(currentIndex)}
                          >
                            Hoàn thành
                          </button>
                        )}
                        {isFinished[currentIndex] && (
                          <button className="p-2 badge bg-info-subtle border border-info-subtle text-info-emphasis rounded-pill ms-3">
                            Đã hoàn thành{" "}
                            <FontAwesomeIcon
                              icon={faCheck}
                              className="text-success"
                            />
                          </button>
                        )}
                      </div>

                      <div className="mt-5 d-flex justify-content-center">
                        {currentIndex !== 0 && (
                          <button
                            className="button d-flex"
                            onClick={showPreviousQuestion}
                          >
                            Câu trước
                          </button>
                        )}
                        {isFinished[currentIndex] &&
                          currentIndex < questions.length - 1 && (
                            <button
                              className="button ms-3"
                              onClick={showNextQuestion}
                            >
                              Câu tiếp theo
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default No1To5;
