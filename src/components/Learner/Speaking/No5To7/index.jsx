import React, { useState, useEffect, useRef } from "react";
import "./style.css";

const No5To7 = ({ testId }) => {
  const [isReadyToTest, setIsReadyToTest] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [preparingCountdown, setPreparingCountdown] = useState([]);
  const [recordingCountdown, setRecordingCountdown] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURLs, setAudioURLs] = useState([]);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [showTips, setShowTips] = useState(false);

  const preparingTime = 45; // seconds
  const recordingTime = 60; // seconds for longer responses

  const preparingTimerRef = useRef(null);
  const recordingTimerRef = useRef(null);

  // Giả lập dữ liệu câu hỏi (thay thế bằng API call trong thực tế)
  useEffect(() => {
    // Simulated data - in real scenario, fetch from API based on testId
    const fetchedQuestions = [
      {
        id: 1,
        type: "Câu hỏi 5",
        content:
          "Bạn sẽ nghe một công bố hoặc thông báo được đọc to. Sau đó, bạn sẽ được đặt một câu hỏi về những gì bạn đã nghe. Sau khi bạn nghe câu hỏi, bạn sẽ có 60 giây để trả lời câu hỏi nói về những gì bạn nghe thấy.",
        audioUrl: "https://example.com/question-audio-5.mp3",
        questionText:
          "Thông báo: Lưu ý gửi đến tất cả người dùng thư viện. Thư viện sẽ đóng cửa vào lúc 7 giờ tối hôm nay thay vì thời gian đóng cửa thông thường là 9 giờ tối do bảo trì hệ thống. Tất cả sách đã mượn hôm nay sẽ được gia hạn tự động thêm một ngày. Chúng tôi xin lỗi vì sự bất tiện này. Câu hỏi: Tại sao thư viện đóng cửa sớm hôm nay?",
      },
      {
        id: 2,
        type: "Câu hỏi 6",
        content:
          "Bạn sẽ nghe một phần của cuộc hội thoại. Sau đó, bạn sẽ được đặt một câu hỏi về những gì bạn đã nghe. Sau khi bạn nghe câu hỏi, bạn sẽ có 60 giây để trả lời câu hỏi nói về những gì bạn nghe thấy.",
        audioUrl: "https://example.com/question-audio-6.mp3",
        questionText:
          "Hội thoại: A: Chúng ta dường như đã hết giấy in cho buổi họp chiều nay. B: Tôi sẽ đi lấy thêm ở phòng kho. A: Cảm ơn, nhưng tôi nghĩ chúng ta cần yêu cầu văn phòng đặt thêm để tuần sau sử dụng. B: Được rồi, tôi sẽ gửi email cho bộ phận mua hàng. Câu hỏi: Nhóm cần làm gì để chuẩn bị cho tuần tới?",
      },
      {
        id: 3,
        type: "Câu hỏi 7",
        content:
          "Bạn sẽ nghe một đoạn hội thoại hoặc một bài nói ngắn. Sau đó, bạn sẽ được đặt một câu hỏi về những gì bạn đã nghe. Sau khi bạn nghe câu hỏi, bạn sẽ có 60 giây để trả lời câu hỏi dựa trên thông tin bạn đã nghe.",
        audioUrl: "https://example.com/question-audio-7.mp3",
        questionText:
          "Bài nói: Hôm nay, tôi muốn nói về một chủ đề quan trọng: biến đổi khí hậu. Nhiệt độ trung bình toàn cầu đã tăng 1 độ C so với thời kỳ tiền công nghiệp. Nếu không có hành động quyết liệt, sự ấm lên này có thể vượt quá 2 độ C, dẫn đến hậu quả thảm khốc cho hành tinh chúng ta. Các chính phủ trên toàn thế giới đã cam kết giảm phát thải khí nhà kính, nhưng cần có nhiều nỗ lực hơn nữa từ các doanh nghiệp và cá nhân. Câu hỏi: Theo bài nói, điều gì sẽ xảy ra nếu không có hành động quyết liệt về biến đổi khí hậu?",
      },
    ];

    setQuestions(fetchedQuestions);

    // Initialize countdowns
    const prepCountdowns = new Array(fetchedQuestions.length).fill(
      preparingTime
    );
    const recCountdowns = new Array(fetchedQuestions.length).fill(
      recordingTime
    );
    setPreparingCountdown(prepCountdowns);
    setRecordingCountdown(recCountdowns);
    setAudioURLs(new Array(fetchedQuestions.length).fill(null));

    return () => {
      // Cleanup timers when component unmounts
      if (preparingTimerRef.current) clearInterval(preparingTimerRef.current);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [testId]);

  const startTest = () => {
    setIsReadyToTest(true);
    startPreparingCountdown();
  };

  const startPreparingCountdown = () => {
    if (preparingTimerRef.current) clearInterval(preparingTimerRef.current);

    preparingTimerRef.current = setInterval(() => {
      setPreparingCountdown((prevCountdowns) => {
        const newCountdowns = [...prevCountdowns];
        if (newCountdowns[currentIndex] > 0) {
          newCountdowns[currentIndex] -= 1;
        } else {
          // Khi hết thời gian chuẩn bị, bắt đầu ghi âm
          clearInterval(preparingTimerRef.current);
          startRecording();
        }
        return newCountdowns;
      });
    }, 1000);
  };

  const startRecordingCountdown = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);

    recordingTimerRef.current = setInterval(() => {
      setRecordingCountdown((prevCountdowns) => {
        const newCountdowns = [...prevCountdowns];
        if (newCountdowns[currentIndex] > 0) {
          newCountdowns[currentIndex] -= 1;
        } else {
          // Khi hết thời gian ghi âm, dừng ghi âm
          clearInterval(recordingTimerRef.current);
          stopRecording();
        }
        return newCountdowns;
      });
    }, 1000);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks = [];

      recorder.ondataavailable = (e) => {
        audioChunks.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);

        setAudioURLs((prev) => {
          const newUrls = [...prev];
          newUrls[currentIndex] = audioUrl;
          return newUrls;
        });
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      startRecordingCountdown();
    } catch (error) {
      console.error("Lỗi khi bắt đầu ghi âm:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      setIsRecording(false);

      // Cleanup stream tracks
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      // Stop any ongoing recording before moving to next question
      if (isRecording) {
        stopRecording();
      }

      // Clear timers
      if (preparingTimerRef.current) clearInterval(preparingTimerRef.current);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);

      // Move to next question
      setCurrentIndex((prevIndex) => prevIndex + 1);

      // Reset countdowns for the new question
      setPreparingCountdown((prevCountdowns) => {
        const newCountdowns = [...prevCountdowns];
        newCountdowns[currentIndex + 1] = preparingTime;
        return newCountdowns;
      });

      setRecordingCountdown((prevCountdowns) => {
        const newCountdowns = [...prevCountdowns];
        newCountdowns[currentIndex + 1] = recordingTime;
        return newCountdowns;
      });

      // Start preparing countdown for the new question
      setTimeout(() => {
        startPreparingCountdown();
      }, 500);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      // Similar logic as nextQuestion, but moving to previous question
      if (isRecording) {
        stopRecording();
      }

      if (preparingTimerRef.current) clearInterval(preparingTimerRef.current);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);

      setCurrentIndex((prevIndex) => prevIndex - 1);
    }
  };

  const refreshAllQuestions = () => {
    // Reset all states
    if (isRecording) {
      stopRecording();
    }

    if (preparingTimerRef.current) clearInterval(preparingTimerRef.current);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);

    setCurrentIndex(0);
    setPreparingCountdown(new Array(questions.length).fill(preparingTime));
    setRecordingCountdown(new Array(questions.length).fill(recordingTime));
    setAudioURLs(new Array(questions.length).fill(null));

    // Start the first question again
    setTimeout(() => {
      startPreparingCountdown();
    }, 500);
  };

  const toggleTips = () => {
    setShowTips(!showTips);
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-12">
          <div className="card specific-card mt-3">
            <div className="card-body">
              <div className="d-flex justify-content-center">
                <img
                  src="https://www.vividsites.com/mm/images/Voice-UI.png"
                  alt="Speaking practice icon"
                  width="100px"
                  height="100px"
                />
              </div>
              <h2 className="text-center my-3">Speaking: Trả lời câu hỏi</h2>
              <h5 className="card-title text-primary">Hướng dẫn:</h5>
              <p className="card-text">
                Trong phần kiểm tra này, bạn sẽ nghe một đoạn ghi âm và trả lời
                câu hỏi liên quan. Bạn sẽ có <strong>45</strong> giây để chuẩn
                bị phản hồi. Sau đó, bạn sẽ có <strong>60</strong> giây để trả
                lời câu hỏi.
              </p>
              <h5 className="card-title text-primary">Tiêu chí đánh giá:</h5>
              <span className="badge bg-success-subtle border border-successs-subtle text-success-emphasis rounded-pill">
                Phát âm và ngữ điệu
              </span>
              <span className="badge bg-success-subtle border border-successs-subtle text-success-emphasis rounded-pill mx-3">
                Ngữ pháp và từ vựng
              </span>
              <span className="badge bg-success-subtle border border-successs-subtle text-success-emphasis rounded-pill">
                Phát triển câu trả lời và tính liên kết
              </span>
            </div>
          </div>

          <div className="card specific-card mt-3">
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

                  <div className="word-item">
                    <div className="mb-5">
                      <div className="text-end" style={{ fontSize: "20px" }}>
                        <span
                          className="badge bg-primary-subtle border border-primary-subtle text-primary-emphasis rounded-pill"
                          style={{ backgroundColor: "orange" }}
                        >
                          <span style={{ fontSize: "22px" }}>&#9200;</span>
                          Chuẩn bị: {preparingCountdown[currentIndex]} s
                        </span>
                        <span className="badge ms-3 bg-success-subtle border border-successs-subtle text-success-emphasis rounded-pill">
                          <span style={{ fontSize: "22px" }}>&#9200;</span>
                          Ghi âm: {recordingCountdown[currentIndex]} s
                        </span>
                      </div>
                    </div>

                    {questions.length > 0 && (
                      <div className="my-4">
                        <div className="card p-3 mb-3 question-card">
                          <h4>{questions[currentIndex].type}</h4>
                          <p>{questions[currentIndex].content}</p>

                          <div className="question-text mt-3">
                            <p>
                              <strong>Câu hỏi:</strong>
                            </p>
                            <p>{questions[currentIndex].questionText}</p>
                          </div>

                          {/* Trong thực tế, đây sẽ là một audio player với file ghi âm */}
                          <div className="audio-simulation mt-3">
                            <p>
                              <em>
                                * Trong phiên bản thực, đây sẽ là file âm thanh
                                cho câu hỏi.
                              </em>
                            </p>
                          </div>
                        </div>

                        {audioURLs[currentIndex] && (
                          <div className="mt-3 response-section">
                            <h5>Bản ghi của bạn:</h5>
                            <audio
                              controls
                              src={audioURLs[currentIndex]}
                              className="w-100"
                            />
                          </div>
                        )}

                        <div className="d-flex justify-content-between mt-4">
                          <button
                            className="btn btn-outline-secondary"
                            onClick={prevQuestion}
                            disabled={currentIndex === 0}
                          >
                            Câu trước
                          </button>

                          <button
                            className="btn btn-outline-primary"
                            onClick={nextQuestion}
                            disabled={currentIndex === questions.length - 1}
                          >
                            Câu tiếp theo
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="mt-4">
                      <button className="btn btn-info" onClick={toggleTips}>
                        {showTips ? "Ẩn mẹo" : "Xem mẹo trả lời"}
                      </button>

                      {showTips && (
                        <div className="card mt-3">
                          <div className="card-body">
                            <h5>Mẹo trả lời hiệu quả:</h5>
                            <ul>
                              <li>Lắng nghe kỹ các từ khóa trong câu hỏi</li>
                              <li>Trả lời trực tiếp vào câu hỏi đã hỏi</li>
                              <li>
                                Cung cấp ví dụ hoặc lý do để hỗ trợ câu trả lời
                                của bạn
                              </li>
                              <li>Tổ chức câu trả lời theo cấu trúc rõ ràng</li>
                              <li>
                                Sử dụng từ nối để tạo tính mạch lạc cho câu trả
                                lời
                              </li>
                              <li>Phát âm rõ ràng và kiểm soát tốc độ nói</li>
                            </ul>
                          </div>
                        </div>
                      )}
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

export default No5To7;
