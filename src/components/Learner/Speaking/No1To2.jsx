import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Card,
  Button,
  Typography,
  Space,
  Badge,
  Alert,
  Row,
  Col,
  message,
} from "antd";
import {
  Mic,
  Square,
  Headphones,
  CheckCircle,
  Play,
  Timer,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  VolumeX,
  Trophy,
} from "lucide-react";
import TestService from "../../../services/testService";
import SpeakingResult from "./SpeakingResult";

const { Title, Text, Paragraph } = Typography;

const No1To2 = ({ testId }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isReadyToTest, setIsReadyToTest] = useState(false);
  const [isTestCompleted, setIsTestCompleted] = useState(false);
  console.log("🚀 ~ No1To2 ~ isTestCompleted:", isTestCompleted);

  const [isReading, setIsReading] = useState([]);
  const [isPreparingCountDown, setIsPreparingCountDown] = useState([]);
  const [isRecordingCountDown, setIsRecordingCountDown] = useState([]);
  const [preparingCountdown, setPreparingCountdown] = useState([]);
  const [recordingCountdown, setRecordingCountdown] = useState([]);
  const [isRecording, setIsRecording] = useState([]);
  const [recordedAudios, setRecordedAudios] = useState([]);
  const [recordedText, setRecordedText] = useState([]);

  const mediaRecorderRef = useRef(null);
  const preparationIntervalRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const continuousReadingIntervalRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const currentIndexRef = useRef(0);

  // Lấy câu hỏi từ bài kiểm tra
  const retrieveQuestions = useCallback(async () => {
    try {
      const response = await TestService.getQuestionsByTestId(testId);
      setQuestions(response);

      // Khởi tạo các giá trị mặc định cho mỗi câu hỏi
      setIsReading(response.map(() => false));
      setIsPreparingCountDown(response.map(() => false));
      setIsRecordingCountDown(response.map(() => false));
      setPreparingCountdown(response.map(() => 45));
      setRecordingCountdown(response.map(() => 45));
      setIsRecording(response.map(() => false));
      setRecordedAudios(response.map(() => null));
      setRecordedText(response.map(() => ""));

      message.success("Đã tải câu hỏi thành công!");
    } catch (error) {
      console.log(error);
      message.error("Không thể tải câu hỏi. Vui lòng thử lại!");
    }
  }, [testId]);

  // Khởi tạo Speech Recognition API
  const initSpeechRecognition = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        // Cập nhật nội dung đã ghi âm
        setRecordedText((prev) => {
          const newRecordedText = [...prev];
          newRecordedText[currentIndexRef.current] =
            finalTranscript || interimTranscript;
          return newRecordedText;
        });
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
      };

      speechRecognitionRef.current = recognition;
    } else {
      message.error("Trình duyệt của bạn không hỗ trợ Speech Recognition API");
    }
  }, []);

  // Khởi tạo Media Recorder
  const setupMediaRecorder = useCallback(async (index) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          setRecordedAudios((prev) => {
            const newRecordedAudios = [...prev];
            newRecordedAudios[index] = URL.createObjectURL(event.data);
            return newRecordedAudios;
          });
        }
      });

      return recorder;
    } catch (error) {
      console.error("Không thể truy cập microphone:", error);
      message.error(
        "Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập!"
      );
      return null;
    }
  }, []);

  // Đọc đoạn văn (hệ thống phát âm)
  const readPassage = (index) => {
    if (!window.speechSynthesis) {
      alert("Trình duyệt của bạn không hỗ trợ Speech Synthesis API");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(
      questions[index].questionText
    );

    // Tìm giọng tiếng Anh
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(
      (voice) =>
        voice.name === "Google US English" ||
        voice.name ===
          "Microsoft Aria Online (Natural) - English (United States)"
    );

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    window.speechSynthesis.speak(utterance);

    // Cập nhật trạng thái đang đọc
    const newIsReading = [...isReading];
    newIsReading[index] = true;
    setIsReading(newIsReading);

    // Đảm bảo văn bản được đọc liên tục (để tránh lỗi timeout của Chrome)
    continuousReadingIntervalRef.current = setInterval(() => {
      if (newIsReading[index]) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      } else {
        clearInterval(continuousReadingIntervalRef.current);
      }
    }, 14000);
  };

  // Dừng đọc
  const stopReadingPassage = (index) => {
    if (isReading[index]) {
      window.speechSynthesis.cancel();
      clearInterval(continuousReadingIntervalRef.current);

      const newIsReading = [...isReading];
      newIsReading[index] = false;
      setIsReading(newIsReading);
    }
  };

  // Bật/tắt đọc
  const toggleReading = (index) => {
    if (isReading[index]) {
      stopReadingPassage(index);
    } else {
      readPassage(index);
    }
  };

  // Bắt đầu ghi âm
  const startRecording = useCallback(
    async (index) => {
      // Dừng đếm ngược chuẩn bị
      setIsPreparingCountDown((prev) => {
        const newIsPreparingCountDown = [...prev];
        newIsPreparingCountDown[index] = false;
        return newIsPreparingCountDown;
      });

      // Bắt đầu đếm ngược ghi âm
      setIsRecordingCountDown((prev) => {
        const newIsRecordingCountDown = [...prev];
        newIsRecordingCountDown[index] = true;
        return newIsRecordingCountDown;
      });

      // Chuẩn bị media recorder
      mediaRecorderRef.current = await setupMediaRecorder(index);
      if (!mediaRecorderRef.current) return;

      // Bắt đầu nhận diện giọng nói
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.start();
      }

      // Cập nhật trạng thái ghi âm
      setIsRecording((prev) => {
        const newIsRecording = [...prev];
        newIsRecording[index] = true;
        return newIsRecording;
      });

      // Bắt đầu ghi âm
      mediaRecorderRef.current.start();
    },
    [setupMediaRecorder]
  );

  // Dừng ghi âm
  const stopRecording = useCallback((index) => {
    setIsRecording((prev) => {
      if (!prev[index]) return prev;

      // Dừng nhận diện giọng nói
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }

      // Dừng đếm ngược ghi âm
      setIsRecordingCountDown((prevCountdown) => {
        const newIsRecordingCountDown = [...prevCountdown];
        newIsRecordingCountDown[index] = false;
        return newIsRecordingCountDown;
      });

      // Dừng ghi âm
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();

        // Giải phóng stream
        if (mediaRecorderRef.current.stream) {
          const tracks = mediaRecorderRef.current.stream.getTracks();
          tracks.forEach((track) => track.stop());
        }
      }

      // Cập nhật trạng thái ghi âm
      const newIsRecording = [...prev];
      newIsRecording[index] = null;
      return newIsRecording;
    });
  }, []);

  // Quay lại câu trước
  const showPreviousQuestion = () => {
    if (currentIndex > 0) {
      // Dừng đọc và ghi âm của câu hiện tại nếu đang chạy
      stopReadingPassage(currentIndex);
      if (isRecording[currentIndex] === true) {
        stopRecording(currentIndex);
      }

      setCurrentIndex(currentIndex - 1);
    }
  };

  // Tiến đến câu tiếp theo
  const showNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      // Dừng đọc và ghi âm của câu hiện tại nếu đang chạy
      stopReadingPassage(currentIndex);
      if (isRecording[currentIndex] === true) {
        stopRecording(currentIndex);
      }

      setCurrentIndex(currentIndex + 1);
    }
  };

  // Bắt đầu kiểm tra
  const startTest = () => {
    setIsReadyToTest(true);

    // Bắt đầu đếm ngược thời gian chuẩn bị cho câu đầu tiên
    setIsPreparingCountDown((prev) => {
      const newIsPreparingCountDown = [...prev];
      newIsPreparingCountDown[0] = true;
      return newIsPreparingCountDown;
    });
  };

  // Separate useEffect for preparation countdown
  useEffect(() => {
    if (!isReadyToTest) return;

    preparationIntervalRef.current = setInterval(() => {
      setPreparingCountdown((prev) => {
        const updated = [...prev];
        const currentIdx = currentIndexRef.current;

        if (isPreparingCountDown[currentIdx] && updated[currentIdx] > 0) {
          updated[currentIdx] = updated[currentIdx] - 1;

          // Khi hết thời gian chuẩn bị, tự động bắt đầu ghi âm
          if (updated[currentIdx] === 0) {
            startRecording(currentIdx);
          }
        }
        return updated;
      });
    }, 1000);

    return () => {
      if (preparationIntervalRef.current) {
        clearInterval(preparationIntervalRef.current);
      }
    };
  }, [isReadyToTest, isPreparingCountDown, startRecording]);

  // Separate useEffect for recording countdown
  useEffect(() => {
    if (!isReadyToTest) return;

    recordingIntervalRef.current = setInterval(() => {
      setRecordingCountdown((prev) => {
        const updated = [...prev];
        const currentIdx = currentIndexRef.current;

        if (isRecordingCountDown[currentIdx] && updated[currentIdx] > 0) {
          updated[currentIdx] = updated[currentIdx] - 1;

          // Khi hết thời gian ghi âm, tự động dừng
          if (updated[currentIdx] === 0) {
            stopRecording(currentIdx);
          }
        }
        return updated;
      });
    }, 1000);

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [isReadyToTest, isRecordingCountDown, stopRecording]);

  // Làm lại tất cả
  const refreshAllQuestions = () => {
    // Dừng tất cả đếm ngược và xử lý
    clearInterval(preparationIntervalRef.current);
    clearInterval(recordingIntervalRef.current);
    clearInterval(continuousReadingIntervalRef.current);

    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      if (mediaRecorderRef.current.stream) {
        const tracks = mediaRecorderRef.current.stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    }

    // Reset lại tất cả trạng thái
    setCurrentIndex(0);
    setIsTestCompleted(false);
    retrieveQuestions();
    startTest();
  };

  // Show result page
  const showResults = () => {
    setIsTestCompleted(true);
  };

  // Back to sections (you'll need to implement this based on your routing)
  const backToSections = () => {
    // Navigate back to sections page
    window.history.back();
  };

  // Check if all questions are completed
  const allQuestionsCompleted =
    questions.length > 0 &&
    isRecording.filter((status) => status === null).length === questions.length;

  // Update currentIndexRef khi currentIndex thay đổi
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Check if test is completed
  useEffect(() => {
    if (questions.length > 0) {
      const completedCount = isRecording.filter(
        (status) => status === null
      ).length;
      if (completedCount === questions.length) {
        // All questions completed - có thể auto show result hoặc show button
      }
    }
  }, [isRecording, questions.length]);
  useEffect(() => {
    const initComponent = async () => {
      await retrieveQuestions();
      initSpeechRecognition();
    };

    initComponent();

    // Cleanup khi component unmount
    return () => {
      clearInterval(preparationIntervalRef.current);
      clearInterval(recordingIntervalRef.current);
      clearInterval(continuousReadingIntervalRef.current);

      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }

      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }

      if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
        const tracks = mediaRecorderRef.current.stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [testId, retrieveQuestions, initSpeechRecognition]);

  return (
    <div>
      {isTestCompleted ? (
        <SpeakingResult
          questions={questions}
          recordedAudios={recordedAudios}
          recordedText={recordedText}
          onRestart={refreshAllQuestions}
          onBackToSections={backToSections}
        />
      ) : (
        <div
          style={{
            padding: "24px",
            backgroundColor: "#f5f5f5",
            minHeight: "100vh",
          }}
        >
          <Row justify="center">
            <Col xs={24} sm={22} md={20} lg={18} xl={16}>
              {/* Header Card */}
              <Card
                style={{
                  marginBottom: "24px",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      backgroundColor: "#1890ff",
                      borderRadius: "50%",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <Headphones size={40} color="white" />
                  </div>
                  <Title
                    level={2}
                    style={{ color: "#1890ff", marginBottom: "8px" }}
                  >
                    Speaking: Đọc to một đoạn văn
                  </Title>
                </div>

                <Alert
                  message="Hướng dẫn"
                  description={
                    <Paragraph style={{ marginBottom: 0 }}>
                      Trong phần kiểm tra này, bạn sẽ đọc to văn bản trên màn
                      hình. Bạn sẽ có <Text strong>45</Text> giây để chuẩn bị.
                      Sau đó, bạn sẽ có <Text strong>45</Text> giây để đọc to
                      văn bản.
                    </Paragraph>
                  }
                  type="info"
                  style={{ marginBottom: "16px" }}
                />

                <div>
                  <Text strong style={{ color: "#1890ff" }}>
                    Tiêu chí đánh giá:
                  </Text>
                  <div style={{ marginTop: "8px" }}>
                    <Badge
                      color="#52c41a"
                      text="Phát âm, ngữ điệu, trọng âm"
                      style={{ fontSize: "14px" }}
                    />
                  </div>
                </div>
              </Card>

              {/* Main Content Card */}
              <Card
                style={{
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                {!isReadyToTest ? (
                  <div style={{ textAlign: "center", padding: "40px 0" }}>
                    <Play
                      size={48}
                      color="#1890ff"
                      style={{ marginBottom: "16px" }}
                    />
                    <Title level={3} style={{ marginBottom: "24px" }}>
                      Sẵn sàng bắt đầu bài kiểm tra?
                    </Title>
                    <Button
                      type="primary"
                      size="large"
                      icon={<Play size={20} />}
                      onClick={startTest}
                      style={{
                        borderRadius: "8px",
                        height: "48px",
                        fontSize: "16px",
                        fontWeight: "500",
                      }}
                    >
                      Sẵn sàng luyện tập
                    </Button>
                  </div>
                ) : (
                  <div>
                    {/* Action Bar */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "24px",
                        padding: "16px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "8px",
                      }}
                    >
                      <Button
                        icon={<RotateCcw size={16} />}
                        onClick={refreshAllQuestions}
                        style={{ borderRadius: "6px" }}
                      >
                        Làm lại
                      </Button>

                      <Space size="middle">
                        <Badge
                          count={`${preparingCountdown[currentIndex]}s`}
                          style={{ backgroundColor: "#1890ff" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "8px 12px",
                              backgroundColor: "#e6f7ff",
                              borderRadius: "6px",
                            }}
                          >
                            <Timer size={16} color="#1890ff" />
                            <Text
                              style={{ color: "#1890ff", fontWeight: "500" }}
                            >
                              Chuẩn bị
                            </Text>
                          </div>
                        </Badge>

                        <Badge
                          count={`${recordingCountdown[currentIndex]}s`}
                          style={{ backgroundColor: "#52c41a" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "8px 12px",
                              backgroundColor: "#f6ffed",
                              borderRadius: "6px",
                            }}
                          >
                            <Mic size={16} color="#52c41a" />
                            <Text
                              style={{ color: "#52c41a", fontWeight: "500" }}
                            >
                              Ghi âm
                            </Text>
                          </div>
                        </Badge>
                      </Space>

                      {allQuestionsCompleted && (
                        <Button
                          type="primary"
                          icon={<Trophy size={16} />}
                          onClick={showResults}
                          style={{ borderRadius: "6px" }}
                        >
                          Xem kết quả
                        </Button>
                      )}
                    </div>

                    {/* Question Content */}
                    <Card
                      style={{
                        marginBottom: "24px",
                        border: "1px solid #d9d9d9",
                        borderRadius: "8px",
                      }}
                    >
                      {/* Question Header */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "16px",
                        }}
                      >
                        <Badge
                          count={currentIndex + 1}
                          style={{
                            backgroundColor: "#1890ff",
                            fontSize: "14px",
                            fontWeight: "600",
                          }}
                        />

                        {isRecording[currentIndex] === null && (
                          <Button
                            type={
                              isReading[currentIndex] ? "danger" : "default"
                            }
                            icon={
                              isReading[currentIndex] ? (
                                <VolumeX size={16} />
                              ) : (
                                <Headphones size={16} />
                              )
                            }
                            onClick={() => toggleReading(currentIndex)}
                            style={{ borderRadius: "6px" }}
                          >
                            {isReading[currentIndex] ? "Dừng đọc" : "Nghe mẫu"}
                          </Button>
                        )}
                      </div>

                      {/* Question Text */}
                      <div style={{ marginBottom: "20px" }}>
                        <Text
                          strong
                          style={{ color: "#1890ff", fontSize: "16px" }}
                        >
                          Văn bản:
                        </Text>
                        <Card
                          size="small"
                          style={{
                            marginTop: "8px",
                            backgroundColor: "#fafafa",
                            border: "1px solid #e8e8e8",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "16px",
                              lineHeight: "1.6",
                              marginBottom: 0,
                            }}
                            dangerouslySetInnerHTML={{
                              __html:
                                questions[currentIndex]?.questionText || "",
                            }}
                          />
                        </Card>
                      </div>

                      {/* Audio Player */}
                      {recordedAudios[currentIndex] && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            marginBottom: "20px",
                          }}
                        >
                          <audio
                            src={recordedAudios[currentIndex]}
                            controls
                            style={{ width: "100%", maxWidth: "400px" }}
                          />
                        </div>
                      )}

                      {/* Recording Controls */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          marginBottom: "20px",
                        }}
                      >
                        {isRecording[currentIndex] === false && (
                          <Button
                            type="primary"
                            size="large"
                            danger
                            icon={<Mic size={20} />}
                            onClick={() => startRecording(currentIndex)}
                            style={{
                              borderRadius: "50%",
                              width: "60px",
                              height: "60px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          />
                        )}

                        {isRecording[currentIndex] === true && (
                          <Button
                            type="primary"
                            size="large"
                            danger
                            icon={<Square size={20} />}
                            onClick={() => stopRecording(currentIndex)}
                            style={{
                              borderRadius: "50%",
                              width: "60px",
                              height: "60px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: "#ff4d4f",
                            }}
                          />
                        )}

                        {isRecording[currentIndex] === null && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "12px 24px",
                              backgroundColor: "#f6ffed",
                              borderRadius: "25px",
                              border: "1px solid #b7eb8f",
                            }}
                          >
                            <CheckCircle size={20} color="#52c41a" />
                            <Text
                              style={{ color: "#52c41a", fontWeight: "500" }}
                            >
                              Đã hoàn thành
                            </Text>
                          </div>
                        )}
                      </div>

                      {/* Recognition Result */}
                      {recordedText[currentIndex] && (
                        <Alert
                          message="Kết quả nhận diện giọng nói"
                          description={recordedText[currentIndex]}
                          type="info"
                          style={{ marginBottom: "20px" }}
                        />
                      )}
                    </Card>

                    {/* Navigation */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "16px",
                      }}
                    >
                      {currentIndex !== 0 && (
                        <Button
                          icon={<ChevronLeft size={16} />}
                          onClick={showPreviousQuestion}
                          style={{ borderRadius: "6px" }}
                        >
                          Câu trước
                        </Button>
                      )}

                      {isRecording[currentIndex] === null &&
                        currentIndex < questions.length - 1 && (
                          <Button
                            type="primary"
                            icon={<ChevronRight size={16} />}
                            onClick={showNextQuestion}
                            style={{ borderRadius: "6px" }}
                            iconPosition="end"
                          >
                            Câu tiếp theo
                          </Button>
                        )}
                    </div>
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
};

export default No1To2;
