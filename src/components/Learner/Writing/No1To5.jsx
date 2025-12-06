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
  const [isSubmitted, setIsSubmitted] = useState([]);
  const [showDetailedResult, setShowDetailedResult] = useState(false);

  // Interval refs để clear
  const preparationIntervalRef = React.useRef(null);
  const writingIntervalRef = React.useRef(null);

  // Lấy câu hỏi từ bài kiểm tra
  const retrieveQuestions = async () => {
    try {
      const response = await TestService.getQuestionsByTestId(testId);
      console.log("🚀 ~ Writing retrieveQuestions ~ response:", response);

      // Kiểm tra nếu response là mảng và có dữ liệu
      if (Array.isArray(response) && response.length > 0) {
        setQuestions(response);

        // Khởi tạo các giá trị mặc định
        setAnswers(response.map(() => ""));
        setPreparingCountdown(response.map(() => 5)); // 5 seconds for preparation
        setWritingCountdown(response.map(() => 5)); // 5 seconds for writing
        setIsPreparingCountDown(response.map(() => false));
        setIsWritingCountDown(response.map(() => false));
        setIsFinished(response.map(() => false));
        setIsSubmitted(response.map(() => false));
      } else {
        console.warn("⚠️ No writing questions received or invalid response format");
        // Tạo writing questions mẫu cho development/testing
        const sampleQuestions = createSampleWritingQuestions();
        setQuestions(sampleQuestions);
        
        // Khởi tạo các giá trị mặc định cho questions mẫu
        setAnswers(sampleQuestions.map(() => ""));
        setPreparingCountdown(sampleQuestions.map(() => 5));
        setWritingCountdown(sampleQuestions.map(() => 5));
        setIsPreparingCountDown(sampleQuestions.map(() => false));
        setIsWritingCountDown(sampleQuestions.map(() => false));
        setIsFinished(sampleQuestions.map(() => false));
        setIsSubmitted(sampleQuestions.map(() => false));
      }
    } catch (error) {
      console.error("Error fetching writing questions:", error);
      // Fallback to sample questions in case of API error
      const sampleQuestions = createSampleWritingQuestions();
      setQuestions(sampleQuestions);
      
      // Khởi tạo các giá trị mặc định cho questions mẫu
      setAnswers(sampleQuestions.map(() => ""));
      setPreparingCountdown(sampleQuestions.map(() => 5));
      setWritingCountdown(sampleQuestions.map(() => 5));
      setIsPreparingCountDown(sampleQuestions.map(() => false));
      setIsWritingCountDown(sampleQuestions.map(() => false));
      setIsFinished(sampleQuestions.map(() => false));
      setIsSubmitted(sampleQuestions.map(() => false));
    }
  };

  // Tạo writing questions mẫu khi API không hoạt động
  const createSampleWritingQuestions = () => {
    return [
      {
        _id: "writing_sample1",
        questionType: "writing",
        questionText: `<div class="writing-task">
          <h4>Writing Task 1: Business Email</h4>
          <div class="time-limit">⏰ Time Limit: 10 minutes</div>
          <div class="word-limit">📝 Word Limit: 120-180 words</div>
          <div class="scenario">
            <h5>📧 Scenario:</h5>
            <p>You work for ABC International Company. Your manager asked you to write an email to a client about a delayed shipment.</p>
            <h6>✅ Your email should include:</h6>
            <ul>
              <li>Apologize for the delay</li>
              <li>Explain the reason for delay</li>
              <li>Provide new delivery date</li>
              <li>Offer compensation</li>
            </ul>
          </div>
          <div class="writing-tips">
            <h6>💡 Writing Tips:</h6>
            <ul>
              <li>Use professional tone and formal language</li>
              <li>Structure: Subject line → Greeting → Body → Closing</li>
              <li>Be clear, concise, and polite</li>
              <li>Check grammar and spelling</li>
            </ul>
          </div>
        </div>`,
        questionImage: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        questionExplanation: "This writing task assesses your ability to compose professional business emails with appropriate tone, structure, and content. Focus on clarity, politeness, and including all required elements.",
        suggestedAnswer: `Subject: Apology for Shipment Delay - Order #12345

Dear Mr. Johnson,

I sincerely apologize for the delay in your recent order #12345. Due to unexpected supply chain disruptions, we are experiencing a 3-day delay. Your order will now be delivered on March 15th instead of March 12th. 

As compensation, we would like to offer you a 10% discount on your next order. We understand the inconvenience this may cause and appreciate your patience.

Best regards,
[Your Name]`
      },
      {
        _id: "writing_sample2",
        questionType: "writing",
        questionText: `<div class="writing-task">
          <h4>Writing Task 2: Meeting Request Email</h4>
          <div class="time-limit">⏰ Time Limit: 8 minutes</div>
          <div class="word-limit">📝 Word Limit: 100-150 words</div>
          <div class="scenario">
            <h5>📧 Scenario:</h5>
            <p>You need to schedule a meeting with your department team to discuss the upcoming project deadline.</p>
            <h6>✅ Your email should include:</h6>
            <ul>
              <li>State meeting purpose</li>
              <li>Suggest date and time</li>
              <li>Mention agenda items</li>
              <li>Request confirmation</li>
            </ul>
          </div>
          <div class="writing-tips">
            <h6>💡 Writing Tips:</h6>
            <ul>
              <li>Use clear and direct language</li>
              <li>Be specific about timing and location</li>
              <li>Make the request polite but urgent</li>
              <li>Provide all necessary details</li>
            </ul>
          </div>
        </div>`,
        questionImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        questionExplanation: "This task evaluates your ability to write clear, professional meeting requests with proper structure and all necessary information.",
        suggestedAnswer: `Subject: Team Meeting Request - Project Deadline Discussion

Dear Team,

I hope this email finds you well. I would like to schedule a team meeting to discuss our upcoming project deadline and ensure we are on track.

Could we meet this Friday, March 10th at 2:00 PM in Conference Room B? We will cover progress updates, resource allocation, and timeline adjustments.

Please confirm your attendance by Thursday so we can finalize the agenda.

Best regards,
[Your Name]`
      },
      {
        _id: "writing_sample3",
        questionType: "writing",
        questionText: `<div class="writing-task">
          <h4>Writing Task 3: Complaint Response</h4>
          <div class="time-limit">⏰ Time Limit: 12 minutes</div>
          <div class="word-limit">📝 Word Limit: 150-200 words</div>
          <div class="scenario">
            <h5>📧 Scenario:</h5>
            <p>A customer has complained about poor service quality. You need to respond professionally and resolve the issue.</p>
            <h6>✅ Your response should include:</h6>
            <ul>
              <li>Acknowledge the complaint</li>
              <li>Express empathy and apologize</li>
              <li>Explain what went wrong</li>
              <li>Offer a solution or compensation</li>
              <li>Provide future assurance</li>
            </ul>
          </div>
          <div class="writing-tips">
            <h6>💡 Writing Tips:</h6>
            <ul>
              <li>Maintain empathetic and professional tone</li>
              <li>Take responsibility without making excuses</li>
              <li>Focus on solutions and future improvement</li>
              <li>Show genuine concern for customer satisfaction</li>
            </ul>
          </div>
        </div>`,
        questionImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        questionExplanation: "This writing task tests your ability to handle customer complaints professionally while maintaining positive relationships and offering effective solutions.",
        suggestedAnswer: `Subject: Re: Service Quality Concern - Resolution and Apology

Dear [Customer Name],

Thank you for bringing your concerns to our attention. I sincerely apologize for the poor service experience you encountered during your recent visit.

After investigating your case, I found that our staff member was not following proper service protocols. This is unacceptable and does not reflect our company standards. We have immediately addressed this issue through additional training.

As an apology, I would like to offer you a full refund and a complimentary service voucher for your next visit. We have also implemented new quality control measures to prevent similar issues.

Your feedback is valuable to us, and we are committed to regaining your trust.

Sincerely,
[Your Name]
Customer Service Manager`
      }
    ];
  };

  // Bắt đầu kiểm tra
  const startTest = () => {
    setIsReadyToTest(true);
    console.log("Test started - ready to begin individual questions");
  };

  // Bắt đầu chuẩn bị cho câu hỏi cụ thể
  const startPreparation = (index) => {
    console.log("Starting preparation for question", index + 1);

    // Reset timer cho câu này
    const newPreparingCountdown = [...preparingCountdown];
    newPreparingCountdown[index] = 5;
    setPreparingCountdown(newPreparingCountdown);

    // Bắt đầu đếm ngược thời gian chuẩn bị
    const newIsPreparingCountDown = [...isPreparingCountDown];
    newIsPreparingCountDown[index] = true;
    setIsPreparingCountDown(newIsPreparingCountDown);

    // Clear existing timer
    if (preparationIntervalRef.current) {
      clearInterval(preparationIntervalRef.current);
    }

    // Start preparation timer
    preparationIntervalRef.current = setInterval(() => {
      setPreparingCountdown((prevCountdown) => {
        const updated = [...prevCountdown];
        if (updated[index] > 0) {
          updated[index] = updated[index] - 1;
          console.log(
            `Preparation timer for question ${index + 1}:`,
            updated[index]
          );

          // When preparation time ends, start writing
          if (updated[index] === 0) {
            clearInterval(preparationIntervalRef.current);
            setTimeout(() => startWriting(index), 100);
          }
        }
        return updated;
      });
    }, 1000);
  };

  // Bắt đầu thời gian viết
  const startWriting = (index) => {
    console.log("Starting writing phase for question", index + 1);

    // Dừng đếm ngược chuẩn bị
    const newIsPreparingCountDown = [...isPreparingCountDown];
    newIsPreparingCountDown[index] = false;
    setIsPreparingCountDown(newIsPreparingCountDown);

    // Reset writing time
    const newWritingCountdown = [...writingCountdown];
    newWritingCountdown[index] = 5;
    setWritingCountdown(newWritingCountdown);

    // Bắt đầu đếm ngược thời gian viết
    const newIsWritingCountDown = [...isWritingCountDown];
    newIsWritingCountDown[index] = true;
    setIsWritingCountDown(newIsWritingCountDown);

    // Clear existing writing timer
    if (writingIntervalRef.current) {
      clearInterval(writingIntervalRef.current);
    }

    // Start writing timer
    writingIntervalRef.current = setInterval(() => {
      setWritingCountdown((prevCountdown) => {
        const updated = [...prevCountdown];
        if (updated[index] > 0) {
          updated[index] = updated[index] - 1;
          console.log(
            `Writing timer for question ${index + 1}:`,
            updated[index]
          );

          // When writing time ends, finish automatically
          if (updated[index] === 0) {
            clearInterval(writingIntervalRef.current);
            setTimeout(() => finishWriting(index), 100);
          }
        }
        return updated;
      });
    }, 1000);
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

  // Submit bài viết
  const submitAnswer = (questionIndex) => {
    const newIsSubmitted = [...isSubmitted];
    newIsSubmitted[questionIndex] = true;
    setIsSubmitted(newIsSubmitted);

    // Ở đây có thể gọi API để submit lên server
    console.log(
      "Submitting answer for question",
      questionIndex + 1,
      ":",
      answers[questionIndex]
    );

    // Hiển thị thông báo thành công
    alert(
      `Đã nộp bài câu ${questionIndex + 1} thành công!\n\nSố từ: ${
        answers[questionIndex].split(" ").filter((word) => word.length > 0)
          .length
      }\nĐộ dài: ${answers[questionIndex].length} ký tự`
    );
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
      const prevIndex = currentIndex - 1;

      // Clear any existing timers
      if (preparationIntervalRef.current) {
        clearInterval(preparationIntervalRef.current);
      }
      if (writingIntervalRef.current) {
        clearInterval(writingIntervalRef.current);
      }

      setCurrentIndex(prevIndex);

      console.log(`Moved to question ${prevIndex + 1}`);
    }
  };

  // Tiến đến câu tiếp theo
  const showNextQuestion = () => {
    if (currentIndex < questions.length - 1 && isFinished[currentIndex]) {
      const nextIndex = currentIndex + 1;

      // Clear any existing timers when moving to next question
      if (preparationIntervalRef.current) {
        clearInterval(preparationIntervalRef.current);
      }
      if (writingIntervalRef.current) {
        clearInterval(writingIntervalRef.current);
      }

      // Ensure next question is in clean state
      const newPreparingCountdown = [...preparingCountdown];
      const newWritingCountdown = [...writingCountdown];
      const newIsPreparingCountDown = [...isPreparingCountDown];
      const newIsWritingCountDown = [...isWritingCountDown];
      const newIsFinished = [...isFinished];

      // Reset next question to initial state
      newPreparingCountdown[nextIndex] = 5;
      newWritingCountdown[nextIndex] = 5;
      newIsPreparingCountDown[nextIndex] = false;
      newIsWritingCountDown[nextIndex] = false;
      newIsFinished[nextIndex] = false;

      setPreparingCountdown(newPreparingCountdown);
      setWritingCountdown(newWritingCountdown);
      setIsPreparingCountDown(newIsPreparingCountDown);
      setIsWritingCountDown(newIsWritingCountDown);
      setIsFinished(newIsFinished);

      setCurrentIndex(nextIndex);

      console.log(
        `Moved to question ${nextIndex + 1} - ready for user to start`
      );
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
      if (preparationIntervalRef.current) {
        clearInterval(preparationIntervalRef.current);
      }
      if (writingIntervalRef.current) {
        clearInterval(writingIntervalRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId]);

  // Format thời gian
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  return (
    <>
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
                  được đưa ra. Bạn sẽ có <strong>5</strong> giây để chuẩn bị và{" "}
                  <strong>5</strong> giây để viết câu trả lời.
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

                        {/* Debug info */}
                        <div className="text-muted small mb-2">
                          Debug - Câu {currentIndex + 1}: Prep=
                          {isPreparingCountDown[currentIndex]?.toString()},
                          Writing={isWritingCountDown[currentIndex]?.toString()}
                          , Finished={isFinished[currentIndex]?.toString()}
                        </div>

                        {/* Start button for questions that haven't started */}
                        {!isPreparingCountDown[currentIndex] &&
                          !isWritingCountDown[currentIndex] &&
                          !isFinished[currentIndex] && (
                            <div className="text-center mb-4">
                              <button
                                className="btn btn-success btn-lg"
                                onClick={() => {
                                  console.log(
                                    `User clicked start for question ${
                                      currentIndex + 1
                                    }`
                                  );
                                  startPreparation(currentIndex);
                                }}
                              >
                                <i className="fas fa-play me-2"></i>
                                Bắt đầu câu {currentIndex + 1}
                              </button>
                            </div>
                          )}

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
                              __html:
                                questions[currentIndex]?.questionText || "",
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
                            <>
                              <button className="p-2 badge bg-info-subtle border border-info-subtle text-info-emphasis rounded-pill ms-3">
                                Đã hoàn thành{" "}
                                <FontAwesomeIcon
                                  icon={faCheck}
                                  className="text-success"
                                />
                              </button>
                              <button
                                className="btn btn-outline-primary btn-sm ms-2"
                                onClick={() => setShowDetailedResult(true)}
                              >
                                <i className="fas fa-eye me-1"></i>
                                Xem chi tiết
                              </button>
                              {!isSubmitted[currentIndex] ? (
                                <button
                                  className="btn btn-primary btn-sm ms-2"
                                  onClick={() => submitAnswer(currentIndex)}
                                  disabled={
                                    !answers[currentIndex] ||
                                    answers[currentIndex].trim().length === 0
                                  }
                                >
                                  <i className="fas fa-paper-plane me-1"></i>
                                  Submit
                                </button>
                              ) : (
                                <button
                                  className="btn btn-success btn-sm ms-2"
                                  disabled
                                >
                                  <i className="fas fa-check-circle me-1"></i>
                                  Đã nộp
                                </button>
                              )}
                            </>
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

      {/* Detailed Result Modal */}
      {showDetailedResult && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowDetailedResult(false)}
        >
          <div
            className="modal-dialog modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-chart-line me-2"></i>
                  Kết quả chi tiết - Câu {currentIndex + 1}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDetailedResult(false)}
                ></button>
              </div>
              <div className="modal-body">
                {/* Writing Analysis */}
                <div className="mb-4">
                  <h6>
                    <i className="fas fa-edit me-2 text-primary"></i>Bài viết
                    của bạn:
                  </h6>
                  {answers[currentIndex] ? (
                    <div className="card border-info">
                      <div className="card-body">
                        <div
                          className="writing-content"
                          style={{
                            minHeight: "150px",
                            padding: "15px",
                            backgroundColor: "#f8f9fa",
                            borderRadius: "8px",
                          }}
                        >
                          {answers[currentIndex]}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="alert alert-warning">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      Chưa có nội dung
                    </div>
                  )}
                </div>

                {/* Writing Statistics */}
                <div className="mb-4">
                  <h6>
                    <i className="fas fa-chart-bar me-2 text-success"></i>Thống
                    kê:
                  </h6>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="card bg-light">
                        <div className="card-body text-center">
                          <h6>
                            <i className="fas fa-font text-primary"></i> Số từ
                          </h6>
                          <div className="badge bg-primary fs-6">
                            {answers[currentIndex]
                              ? answers[currentIndex]
                                  .split(" ")
                                  .filter((word) => word.length > 0).length
                              : 0}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card bg-light">
                        <div className="card-body text-center">
                          <h6>
                            <i className="fas fa-keyboard text-info"></i> Ký tự
                          </h6>
                          <div className="badge bg-info fs-6">
                            {answers[currentIndex]
                              ? answers[currentIndex].length
                              : 0}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card bg-light">
                        <div className="card-body text-center">
                          <h6>
                            <i className="fas fa-paragraph text-warning"></i>{" "}
                            Đoạn văn
                          </h6>
                          <div className="badge bg-warning fs-6">
                            {answers[currentIndex]
                              ? answers[currentIndex]
                                  .split("\n\n")
                                  .filter((p) => p.trim().length > 0).length
                              : 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Writing Quality Analysis */}
                <div className="mb-4">
                  <h6>
                    <i className="fas fa-star me-2 text-warning"></i>Đánh giá
                    chất lượng:
                  </h6>
                  <div className="alert alert-primary">
                    {answers[currentIndex] ? (
                      (() => {
                        const wordCount = answers[currentIndex]
                          .split(" ")
                          .filter((word) => word.length > 0).length;
                        const sentences = answers[currentIndex]
                          .split(/[.!?]+/)
                          .filter((s) => s.trim().length > 0).length;

                        if (wordCount < 50) {
                          return (
                            <>
                              <i className="fas fa-arrow-up me-2"></i>
                              <strong>Cần viết thêm:</strong> Bài viết còn ngắn
                              ({wordCount} từ). Hãy phát triển ý tưởng và thêm
                              chi tiết để đạt yêu cầu.
                            </>
                          );
                        } else if (wordCount < 150) {
                          return (
                            <>
                              <i className="fas fa-check me-2"></i>
                              <strong>Đạt yêu cầu:</strong> Bài viết có độ dài
                              phù hợp ({wordCount} từ, {sentences} câu). Có thể
                              cải thiện thêm về cấu trúc và ngữ pháp.
                            </>
                          );
                        } else {
                          return (
                            <>
                              <i className="fas fa-thumbs-up me-2"></i>
                              <strong>Xuất sắc:</strong> Bài viết dài và chi
                              tiết ({wordCount} từ, {sentences} câu). Hãy kiểm
                              tra lại chính tả và ngữ pháp.
                            </>
                          );
                        }
                      })()
                    ) : (
                      <>
                        <i className="fas fa-edit me-2"></i>
                        <strong>Chưa có nội dung:</strong> Hãy bắt đầu viết bài
                        để nhận được đánh giá.
                      </>
                    )}
                  </div>
                </div>

                {/* Writing Tips */}
                <div className="mb-4">
                  <h6>
                    <i className="fas fa-lightbulb me-2 text-warning"></i>Gợi ý
                    cải thiện:
                  </h6>
                  <div className="alert alert-success">
                    <ul className="mb-0">
                      <li>
                        <strong>Cấu trúc:</strong> Sử dụng mở bài - thân bài -
                        kết luận rõ ràng
                      </li>
                      <li>
                        <strong>Từ vựng:</strong> Dùng từ chính xác và đa dạng
                      </li>
                      <li>
                        <strong>Ngữ pháp:</strong> Kiểm tra thì và cấu trúc câu
                      </li>
                      <li>
                        <strong>Ý tưởng:</strong> Phát triển ý và đưa ra ví dụ
                        cụ thể
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-warning me-2"
                  onClick={() => {
                    setShowDetailedResult(false);
                    // Reset để viết lại
                    const newAnswers = [...answers];
                    const newIsFinished = [...isFinished];
                    const newIsWritingCountDown = [...isWritingCountDown];
                    const newWritingCountdown = [...writingCountdown];

                    newAnswers[currentIndex] = "";
                    newIsFinished[currentIndex] = false;
                    newIsWritingCountDown[currentIndex] = false;
                    newWritingCountdown[currentIndex] = 5; // Reset to 5 seconds

                    // Reset trạng thái submitted
                    const newIsSubmitted = [...isSubmitted];
                    newIsSubmitted[currentIndex] = false;

                    setAnswers(newAnswers);
                    setIsFinished(newIsFinished);
                    setIsWritingCountDown(newIsWritingCountDown);
                    setWritingCountdown(newWritingCountdown);
                    setIsSubmitted(newIsSubmitted);
                  }}
                >
                  <i className="fas fa-redo me-2"></i>Viết lại
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => setShowDetailedResult(false)}
                >
                  <i className="fas fa-check me-2"></i>Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default No1To5;
