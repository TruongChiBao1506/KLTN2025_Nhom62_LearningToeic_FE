import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faStop,
  faHeadphones,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import "./style.css";
import TestService from "../../../services/testService";

const No1To2 = ({ testId }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isReadyToTest, setIsReadyToTest] = useState(false);
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

  // Lấy câu hỏi từ bài kiểm tra
  const retrieveQuestions = async () => {
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
    } catch (error) {
      console.log(error);
    }
  };

  // Khởi tạo Speech Recognition API
  const initSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
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
        const newRecordedText = [...recordedText];
        newRecordedText[currentIndex] = finalTranscript || interimTranscript;
        setRecordedText(newRecordedText);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
      };

      speechRecognitionRef.current = recognition;
    } else {
      alert("Trình duyệt của bạn không hỗ trợ Speech Recognition API");
    }
  };

  // Khởi tạo Media Recorder
  const setupMediaRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          const newRecordedAudios = [...recordedAudios];
          newRecordedAudios[currentIndex] = URL.createObjectURL(event.data);
          setRecordedAudios(newRecordedAudios);
        }
      });

      return recorder;
    } catch (error) {
      console.error("Không thể truy cập microphone:", error);
      return null;
    }
  };

  // Đọc đoạn văn (hệ thống phát âm)
  const readPassage = (index) => {
    if (!window.speechSynthesis) {
      alert("Trình duyệt của bạn không hỗ trợ Speech Synthesis API");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(questions[index].questionText);
    
    // Tìm giọng tiếng Anh
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(voice => 
      voice.name === 'Google US English' || 
      voice.name === 'Microsoft Aria Online (Natural) - English (United States)'
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
  const startRecording = async (index) => {
    // Dừng đếm ngược chuẩn bị
    const newIsPreparingCountDown = [...isPreparingCountDown];
    newIsPreparingCountDown[index] = false;
    setIsPreparingCountDown(newIsPreparingCountDown);

    // Bắt đầu đếm ngược ghi âm
    const newIsRecordingCountDown = [...isRecordingCountDown];
    newIsRecordingCountDown[index] = true;
    setIsRecordingCountDown(newIsRecordingCountDown);

    // Chuẩn bị media recorder
    mediaRecorderRef.current = await setupMediaRecorder();
    if (!mediaRecorderRef.current) return;

    // Bắt đầu nhận diện giọng nói
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.start();
    }

    // Cập nhật trạng thái ghi âm
    const newIsRecording = [...isRecording];
    newIsRecording[index] = true;
    setIsRecording(newIsRecording);

    // Bắt đầu ghi âm
    mediaRecorderRef.current.start();
  };

  // Dừng ghi âm
  const stopRecording = (index) => {
    if (!isRecording[index]) return;

    // Dừng nhận diện giọng nói
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    }

    // Dừng đếm ngược ghi âm
    const newIsRecordingCountDown = [...isRecordingCountDown];
    newIsRecordingCountDown[index] = false;
    setIsRecordingCountDown(newIsRecordingCountDown);

    // Cập nhật trạng thái ghi âm
    const newIsRecording = [...isRecording];
    newIsRecording[index] = null;
    setIsRecording(newIsRecording);

    // Dừng ghi âm
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      
      // Giải phóng stream
      if (mediaRecorderRef.current.stream) {
        const tracks = mediaRecorderRef.current.stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    }
  };

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
    const newIsPreparingCountDown = [...isPreparingCountDown];
    newIsPreparingCountDown[0] = true;
    setIsPreparingCountDown(newIsPreparingCountDown);
    
    // Cập nhật đếm ngược cho thời gian chuẩn bị
    preparationIntervalRef.current = setInterval(() => {
      setPreparingCountdown(prev => {
        const updated = [...prev];
        if (isPreparingCountDown[currentIndex] && updated[currentIndex] > 0) {
          updated[currentIndex] = updated[currentIndex] - 1;
          
          // Khi hết thời gian chuẩn bị, tự động bắt đầu ghi âm
          if (updated[currentIndex] === 0) {
            startRecording(currentIndex);
          }
        }
        return updated;
      });
    }, 1000);
    
    // Cập nhật đếm ngược cho thời gian ghi âm
    recordingIntervalRef.current = setInterval(() => {
      setRecordingCountdown(prev => {
        const updated = [...prev];
        if (isRecordingCountDown[currentIndex] && updated[currentIndex] > 0) {
          updated[currentIndex] = updated[currentIndex] - 1;
          
          // Khi hết thời gian ghi âm, tự động dừng
          if (updated[currentIndex] === 0) {
            stopRecording(currentIndex);
          }
        }
        return updated;
      });
    }, 1000);
  };

  // Làm lại tất cả
  const refreshAllQuestions = () => {
    // Dừng tất cả đếm ngược và xử lý
    clearInterval(preparationIntervalRef.current);
    clearInterval(recordingIntervalRef.current);
    clearInterval(continuousReadingIntervalRef.current);
    
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      if (mediaRecorderRef.current.stream) {
        const tracks = mediaRecorderRef.current.stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    }
    
    // Reset lại tất cả trạng thái
    setCurrentIndex(0);
    retrieveQuestions();
    startTest();
  };

  // Khởi tạo khi component mount
  useEffect(() => {
    retrieveQuestions();
    initSpeechRecognition();
    
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
        tracks.forEach(track => track.stop());
      }
    };
  }, [testId]);

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-12">
          <div className="card mt-3" style={{ transform: "none" }}>
            <div className="card-body">
              <div className="d-flex justify-content-center">
                <img
                  src="https://www.vividsites.com/mm/images/Voice-UI.png"
                  alt="Speaking"
                  width="100px"
                  height="100px"
                />
              </div>
              <h2 className="text-center my-3">Speaking: Đọc to một đoạn văn</h2>
              <h5 className="card-title text-primary">Hướng dẫn:</h5>
              <p className="card-text">
                Trong phần kiểm tra này, bạn sẽ đọc to văn bản trên màn hình. Bạn sẽ có{" "}
                <strong>45</strong> giây để chuẩn bị. Sau đó, bạn sẽ có{" "}
                <strong>45</strong> giây để đọc to văn bản.
              </p>
              <h5 className="card-title text-primary">Tiêu chí đánh giá:</h5>
              <span className="badge bg-success-subtle border border-successs-subtle text-success-emphasis rounded-pill">
                Phát âm, ngữ điệu, trọng âm.
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
                  <button className="button bg-primary" onClick={refreshAllQuestions}>
                    Làm lại
                  </button>

                  <div className="word-item">
                    <div className="mb-5">
                      <div className="text-end" style={{ fontSize: "20px" }}>
                        <span className="badge bg-primary-subtle border border-primary-subtle text-primary-emphasis rounded-pill">
                          <span style={{ fontSize: "22px" }}>⏸</span>
                          Chuẩn bị: {preparingCountdown[currentIndex]}s
                        </span>
                        <span className="badge ms-3 bg-success-subtle border border-successs-subtle text-success-emphasis rounded-pill">
                          <span style={{ fontSize: "22px" }}>⏸</span>
                          Ghi âm: {recordingCountdown[currentIndex]}s
                        </span>
                      </div>

                      {isRecording[currentIndex] === null && (
                        <button
                          className="btn mb-3"
                          style={{ backgroundColor: "#052649" }}
                          onClick={() => toggleReading(currentIndex)}
                        >
                          <FontAwesomeIcon
                            icon={isReading[currentIndex] ? faStop : faHeadphones}
                            className={isReading[currentIndex] ? "text-danger" : "text-white"}
                          />
                        </button>
                      )}

                      <div className="word-info">
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
                        <strong className="ms-3">Văn bản:</strong>
                        <div
                          className="ms-3"
                          dangerouslySetInnerHTML={{
                            __html: questions[currentIndex]?.questionText || "",
                          }}
                        ></div>
                      </div>

                      <div className="d-flex justify-content-center">
                        {recordedAudios[currentIndex] && (
                          <audio
                            className="my-3"
                            src={recordedAudios[currentIndex]}
                            controls
                          ></audio>
                        )}
                      </div>

                      <div className="word-actions d-flex justify-content-center">
                        {isRecording[currentIndex] === false && (
                          <button
                            className="btn"
                            style={{ backgroundColor: "#052649" }}
                            onClick={() => startRecording(currentIndex)}
                          >
                            <FontAwesomeIcon icon={faMicrophone} className="text-white" />
                          </button>
                        )}
                        {isRecording[currentIndex] === true && (
                          <button
                            className="btn"
                            style={{ backgroundColor: "#052649" }}
                            onClick={() => stopRecording(currentIndex)}
                          >
                            <FontAwesomeIcon icon={faStop} className="text-danger" />
                          </button>
                        )}
                        {isRecording[currentIndex] === null && (
                          <button className="p-2 badge bg-info-subtle border border-info-subtle text-info-emphasis rounded-pill ms-3">
                            Đã hoàn thành{" "}
                            <FontAwesomeIcon icon={faCircleCheck} className="text-success" />
                          </button>
                        )}
                      </div>

                      <div className="mt-3">
                        <div className="alert alert-light text-primary" role="alert">
                          <strong className="ms-3" style={{ color: "#052649" }}>
                            Kết quả:
                          </strong>{" "}
                          {recordedText[currentIndex]}
                        </div>
                      </div>

                      <div className="mt-5 d-flex justify-content-center">
                        {currentIndex !== 0 && (
                          <button className="button d-flex" onClick={showPreviousQuestion}>
                            Câu trước
                          </button>
                        )}
                        {isRecording[currentIndex] === null &&
                          currentIndex < questions.length - 1 && (
                            <button className="button ms-3" onClick={showNextQuestion}>
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

export default No1To2;
