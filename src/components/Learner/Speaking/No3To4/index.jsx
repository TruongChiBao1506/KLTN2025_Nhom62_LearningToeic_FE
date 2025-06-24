import React, { useState, useEffect, useRef } from 'react';
import './style.css';

const No3To4 = ({ testId }) => {
  const [isReadyToTest, setIsReadyToTest] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [preparingCountdown, setPreparingCountdown] = useState([]);
  const [recordingCountdown, setRecordingCountdown] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURLs, setAudioURLs] = useState([]);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [showInstruction, setShowInstruction] = useState(false);
  
  const preparingTime = 45; // seconds
  const recordingTime = 30; // seconds
  
  const preparingTimerRef = useRef(null);
  const recordingTimerRef = useRef(null);
  
  // Giả lập dữ liệu câu hỏi (thay thế bằng API call trong thực tế)
  useEffect(() => {
    // Simulated data - in real scenario, fetch from API based on testId
    const fetchedQuestions = [
      {
        id: 1,
        content: "Describe what you see in the picture below. Be as detailed as possible.",
        imageUrl: "https://img.freepik.com/free-photo/people-meeting-office-teamwork_53876-138129.jpg",
      },
      {
        id: 2,
        content: "Look at the picture and describe what you think is happening. What are the people doing?",
        imageUrl: "https://img.freepik.com/free-photo/business-people-meeting_53876-15178.jpg",
      }
    ];
    
    setQuestions(fetchedQuestions);
    
    // Initialize countdowns
    const prepCountdowns = new Array(fetchedQuestions.length).fill(preparingTime);
    const recCountdowns = new Array(fetchedQuestions.length).fill(recordingTime);
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
      setPreparingCountdown(prevCountdowns => {
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
      setRecordingCountdown(prevCountdowns => {
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
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setAudioURLs(prev => {
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
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
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
      setCurrentIndex(prevIndex => prevIndex + 1);
      
      // Reset countdowns for the new question
      setPreparingCountdown(prevCountdowns => {
        const newCountdowns = [...prevCountdowns];
        newCountdowns[currentIndex + 1] = preparingTime;
        return newCountdowns;
      });
      
      setRecordingCountdown(prevCountdowns => {
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
      
      setCurrentIndex(prevIndex => prevIndex - 1);
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

  const toggleInstruction = () => {
    setShowInstruction(!showInstruction);
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
              <h2 className="text-center my-3">Speaking: Miêu tả một bức tranh</h2>
              <h5 className="card-title text-primary">Hướng dẫn:</h5>
              <p className="card-text">
                Trong phần kiểm tra này, bạn sẽ mô tả hình ảnh trên màn hình càng chi tiết càng tốt.
                Bạn sẽ có <strong>45</strong> giây để chuẩn bị phản hồi. Sau đó, bạn sẽ có <strong>30</strong> giây để nói về bức tranh.
              </p>
              <h5 className="card-title text-primary">Tiêu chí đánh giá:</h5>
              <span className="badge bg-success-subtle border border-successs-subtle text-success-emphasis rounded-pill">
                Phát âm, ngữ điệu, trọng âm.
              </span>
              <span className="badge bg-success-subtle border border-successs-subtle text-success-emphasis rounded-pill mx-3">
                Từ vựng, ngữ pháp, và các tính liên kết.
              </span>
              <span className="badge bg-success-subtle border border-successs-subtle text-success-emphasis rounded-pill">
                Sự tương thích nội dung.
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
                  <button className="button bg-primary" onClick={refreshAllQuestions}>
                    Làm lại
                  </button>

                  <div className="word-item">
                    <div className="mb-5">
                      <div className="text-end" style={{ fontSize: '20px' }}>
                        <span className="badge bg-primary-subtle border border-primary-subtle text-primary-emphasis rounded-pill" style={{ backgroundColor: 'orange' }}>
                          <span style={{ fontSize: '22px' }}>&#9200;</span>
                          Chuẩn bị: {preparingCountdown[currentIndex]} s
                        </span>
                        <span className="badge ms-3 bg-success-subtle border border-successs-subtle text-success-emphasis rounded-pill">
                          <span style={{ fontSize: '22px' }}>&#9200;</span>
                          Ghi âm: {recordingCountdown[currentIndex]} s
                        </span>
                      </div>
                    </div>
                    
                    {questions.length > 0 && (
                      <div className="my-4">
                        <div className="border border-3 p-3 mb-3">
                          <h4>Câu hỏi {currentIndex + 1}</h4>
                          <p>{questions[currentIndex].content}</p>
                        </div>
                        
                        <div className="image-container mb-4">
                          <img 
                            src={questions[currentIndex].imageUrl} 
                            alt="Question image" 
                            className="img-fluid" 
                            style={{ maxHeight: '300px' }}
                          />
                        </div>
                        
                        {audioURLs[currentIndex] && (
                          <div className="mt-3">
                            <h5>Bản ghi của bạn:</h5>
                            <audio controls src={audioURLs[currentIndex]} className="w-100" />
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
                      <button className="btn btn-info" onClick={toggleInstruction}>
                        {showInstruction ? "Ẩn hướng dẫn" : "Xem hướng dẫn"}
                      </button>
                      
                      {showInstruction && (
                        <div className="card mt-3">
                          <div className="card-body">
                            <h5>Hướng dẫn trả lời:</h5>
                            <ul>
                              <li>Mô tả địa điểm và thời gian trong ảnh</li>
                              <li>Mô tả người/vật chính trong ảnh</li>
                              <li>Mô tả hoạt động đang diễn ra</li>
                              <li>Sử dụng thì hiện tại tiếp diễn để mô tả hành động</li>
                              <li>Chú ý đến chi tiết như màu sắc, cảm xúc, và bối cảnh</li>
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

export default No3To4;
