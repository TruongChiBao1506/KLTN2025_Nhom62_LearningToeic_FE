import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import userExamService from '../../../services/userExamService';
import userExamQuestionService from '../../../services/userExamQuestionService';
import './style.css';
import BangDiem1 from '../../../assets/bang-diem-toeic-1.jpg';
import BangDiem2 from '../../../assets/bang-diem-toeic-2.jpg';

const ExamResult = () => {
  const { userExamId } = useParams();
  const [userExamById, setUserExamById] = useState({});
  const [questionGroups, setQuestionGroups] = useState({});
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPart, setSelectedPart] = useState(1);
  const [showExplanation, setShowExplanation] = useState({});
  const [showGroupScript, setShowGroupScript] = useState({});

  // Biến dành cho phần dịch thuật
  const [translationMode, setTranslationMode] = useState("en-vi");
  const [textToTranslate, setTextToTranslate] = useState("");
  const [translatedTextTemp, setTranslatedTextTemp] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const maxScore = 990;
  const maxListeningScore = 495;
  const maxReadingScore = 495;
  const allParts = [1, 2, 3, 4, 5, 6, 7];
  
  // Các hàm tiện ích
  const formatTime = (time) => {
    let formattedTime = "";

    if (time >= 3600) {
      const hours = Math.floor(time / 3600);
      formattedTime += `${padZero(hours)}:${padZero(Math.floor((time % 3600) / 60))}:${padZero(time % 60)}`;
    } else if (time >= 60) {
      formattedTime += `${padZero(Math.floor(time / 60))}:${padZero(time % 60)}`;
    } else {
      formattedTime += `00:00:${padZero(time)}`;
    }
    return formattedTime;
  };

  const padZero = (number) => {
    return number.toString().padStart(2, "0");
  };

  useEffect(() => {
    const retrieveUserExamById = async () => {
      try {
        setLoading(true);
        const response = await userExamService.getUserExamById(userExamId);
        if (response && response.data) {
          const exam = response.data;
          exam.completionTime = formatTime(exam.completionTime);
          setUserExamById(exam);
        } else {
          throw new Error('Không tìm thấy dữ liệu bài thi');
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin bài thi:', error);
        setError('Không thể tải thông tin bài thi. Vui lòng thử lại sau.');
      }
    };

    const retrieveQuestionsByUserExamId = async () => {
      try {
        const response = await userExamQuestionService.getQuestionsByUserExamId(userExamId);
        if (response && response.data) {
          setQuestions(response.data);
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách câu hỏi:', error);
      }
    };

    const getQuestionsByUserExamIdGroupedByType = async () => {
      try {
        const response = await userExamQuestionService.getQuestionsByUserExamIdGroupedByType(userExamId);
        if (response && response.data) {
          setQuestionGroups(response.data);
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách câu hỏi theo nhóm:', error);
      } finally {
        setLoading(false);      }
    };    retrieveUserExamById();
    retrieveQuestionsByUserExamId();
    getQuestionsByUserExamIdGroupedByType();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userExamId]);

  // Phân tích câu hỏi theo nhóm
  const calculateCorrectCount = (questions) => {
    return questions.filter((question) => question.isCorrect === 1).length;
  };

  const calculateIncorrectCount = (questions) => {
    return questions.filter((question) => question.isCorrect === 0).length;
  };

  const calculateUnansweredCount = (questions) => {
    return questions.filter((question) => question.isCorrect === null).length;
  };

  const calculatePercentage = (questions) => {
    const correctCount = calculateCorrectCount(questions);
    const inCorrectCount = calculateIncorrectCount(questions);
    const totalCount = correctCount + inCorrectCount;
    if (totalCount === 0) {
      return 0;
    }
    return ((correctCount / totalCount) * 100).toFixed(2);
  };

  // Hiển thị câu hỏi theo part
  const selectPart = (part) => {
    setSelectedPart(part);
  };

  const filteredQuestionsByPart = () => {
    return questions.filter((question) => {
      return question.examQuestion.questionPart === `PART${selectedPart}`;
    });
  };

  const groupQuestionsByAudioOrPassage = (questions) => {
    const grouped = {};
    for (const question of questions) {
      const groupKey = question.examQuestion.questionAudio || question.examQuestion.questionPassage || 'default';
      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(question);
    }
    return grouped;
  };
  const groupedQuestions = groupQuestionsByAudioOrPassage(filteredQuestionsByPart());

  // Hiển thị audio, hình ảnh, đoạn văn
  const getImageUrl = (imageName) => {
    if (imageName) {
      return `${process.env.REACT_APP_API_URL}/images/${imageName}`;
    }
    return "";
  };

  const getAudioUrl = (audioName) => {
    if (audioName) {
      return `${process.env.REACT_APP_API_URL}/audios/${audioName}`;
    }
    return "";
  };

  const shouldDisplayAudio = (question) => {
    return question && question.examQuestion.questionAudio !== null && question.examQuestion.questionAudio !== '';
  };

  const shouldDisplayImage = (question) => {
    return question && question.examQuestion.questionImage !== null && question.examQuestion.questionImage !== '';
  };

  const shouldDisplayPassage = (question) => {
    return question && question.examQuestion.questionPassage !== null && question.examQuestion.questionPassage !== '';
  };

  // Lấy options và class cho option
  const getOptions = (question) => {
    if (question.examQuestion.orderNumber >= 7 && question.examQuestion.orderNumber <= 31) {
      return [question.examQuestion.optionA, question.examQuestion.optionB, question.examQuestion.optionC];
    }
    return [question.examQuestion.optionA, question.examQuestion.optionB, question.examQuestion.optionC, question.examQuestion.optionD];
  };

  const getOptionClass = (question, option) => {
    if (option === question.examQuestion.correctOption) {
      return 'correct-option';
    } else if (option === question.selectedOption && option !== question.examQuestion.correctOption) {
      return 'wrong-option';
    }
    return '';
  };

  // Xử lý toggle explanation và script
  const toggleExplanation = (index) => {
    setShowExplanation({ ...showExplanation, [index]: !showExplanation[index] });
  };

  const toggleGroupScript = (groupId) => {
    setShowGroupScript({ ...showGroupScript, [groupId]: !showGroupScript[groupId] });
  };

  // Cuộn xuống phần đáp án chi tiết
  const scrollToReviewQuestion = () => {
    const examQuestionElement = document.getElementById('reviewAnswers');
    if (examQuestionElement) {
      examQuestionElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Xử lý dịch thuật
  const characterCount = textToTranslate.length;

  const setTranslationModeHandler = (e) => {
    setTranslationMode(e.target.value);
    translateText(textToTranslate, e.target.value);
  };

  const translateText = async (text, mode = translationMode) => {
    if (!text.trim()) {
      setTranslatedTextTemp('');
      return;
    }

    const apiKey = "AIzaSyD-7uWTjTodZba7ky7mgfSgnVxAX_opoh8";
    const apiUrl = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

    const sourceLang = mode.split("-")[0];
    const targetLang = mode.split("-")[1];
    
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: text,
          source: sourceLang,
          target: targetLang,
        }),
      });
      
      const result = await response.json();
      if (result.data && result.data.translations && result.data.translations[0]) {
        setTranslatedTextTemp(result.data.translations[0].translatedText);
      }
    } catch (error) {
      console.error("Lỗi khi dịch văn bản:", error);
    }
  };
  useEffect(() => {
    translateText(textToTranslate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textToTranslate]);

  // Xử lý chuyển đổi văn bản thành giọng nói
  const convertTranslatedTextToSpeech = () => {
    if (!translatedTextTemp.trim()) {
      alert("Không có văn bản để đọc phiên dịch.");
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(translatedTextTemp);
    const lang = translationMode.split("-")[1];
    utterance.lang = lang === "vi" ? "vi-VN" : "en-US";
    
    // Dừng tất cả giọng nói đang phát
    window.speechSynthesis.cancel();
    
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    
    utterance.onend = () => {
      setIsPlaying(false);
    };
  };

  const stopConvertedTextSpeech = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  // Xử lý nhận dạng giọng nói
  const startTranslationSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = translationMode.startsWith("en") ? "en-US" : "vi-VN";
    recognition.interimResults = true;
    
    setIsTranslating(true);
    
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      setTextToTranslate(transcript);
    };
    
    recognition.onend = () => {
      setIsTranslating(false);
    };
    
    recognition.start();
    
    // Lưu recognition vào biến để có thể dừng khi cần
    window.currentRecognition = recognition;
  };

  const stopTranslationSpeechRecognition = () => {
    if (window.currentRecognition) {
      window.currentRecognition.stop();
    }
    setIsTranslating(false);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  const percent = (userExamById.totalScore / maxScore) * 100;

  return (
    <>
      {/* Bảng điểm TOEIC 2023 - Modal */}
      <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel">Bảng điểm thi TOEIC 2023</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body row">
              <div className="col-6">
                <img className="my-3" src={BangDiem1} alt="Bảng điểm TOEIC 1" loading="lazy" width="100%" height="100%" />
              </div>
              <div className="col-6">
                <img className="my-3" src={BangDiem2} alt="Bảng điểm TOEIC 2" loading="lazy" width="100%" height="100%" />
              </div>
            </div>
            <p className="text-center"><i className="fa-solid fa-square text-warning me-2"></i> Nguồn: Anh ngữ Mshoa Toeic</p>
          </div>
        </div>
      </div>

      {/* Modal từ điển */}
      <div className="modal fade" id="exampleModal2" tabIndex="-1" aria-labelledby="exampleModalLabel2" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel2">Tra cứu từ điển</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body d-flex justify-content-center">
              <div id="accordionExample" style={{ width: '100%' }}>
                <div className="accordion-item">
                  <h2 className="accordion-header" id="headingOne">
                    <button className="accordion-button" type="button" data-bs-toggle="collapse"
                      data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                      <span className="accordion-button-text">Công cụ dịch thuật</span>
                      <i className="fa-solid fa-book-open"></i>
                    </button>
                  </h2>
                  <div id="collapseOne" className="accordion-collapse collapse show" data-bs-parent="#accordionExample">
                    <div className="accordion-body mb-2">
                      <div className="card specific-card">
                        <div className="card-body">
                          <div className="row">
                            <div>
                              <select className="form-select" value={translationMode} onChange={setTranslationModeHandler}>
                                <option value="en-vi">Dịch tiếng Anh sang tiếng Việt</option>
                                <option value="vi-en">Dịch tiếng Việt sang tiếng Anh</option>
                              </select>
                            </div>

                            <div className="col-md-6">
                              <h3 className="text-center">Dịch thuật</h3>
                              <div className="form-group">
                                <div className="position-relative">
                                  <textarea rows="7" cols="33" className="form-control"
                                    value={textToTranslate}
                                    onChange={(e) => setTextToTranslate(e.target.value)}
                                    placeholder="Nhập văn bản cần dịch"
                                    maxLength={5000}></textarea>
                                  <small className="position-absolute bottom-0 end-0 text-danger me-2 mb-2">
                                    {characterCount} / 5000
                                  </small>
                                </div>
                              </div>
                              <div>
                                <button className="btn btn-primary mt-2" id="translate-button"
                                  onClick={isTranslating ? stopTranslationSpeechRecognition : startTranslationSpeechRecognition}>
                                  {!isTranslating ? (
                                    <i className="fas fa-microphone text-white"></i>
                                  ) : (
                                    <i className="fas fa-stop text-danger"></i>
                                  )}
                                </button>
                              </div>
                            </div>

                            <div className="col-md-6">
                              <h3 className="text-center">Bản dịch</h3>
                              <div className="form-group">
                                <textarea rows="7" cols="33" className="form-control"
                                  value={translatedTextTemp}
                                  placeholder="Bản dịch"
                                  readOnly></textarea>
                              </div>
                              <div>
                                <button className="btn btn-primary mt-2" id="translate-button"
                                  onClick={isPlaying ? stopConvertedTextSpeech : convertTranslatedTextToSpeech}>
                                  {!isPlaying ? (
                                    <i className="fas fa-headphones text-white"></i>
                                  ) : (
                                    <i className="fas fa-stop text-danger"></i>
                                  )}
                                </button>
                              </div>
                            </div>

                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phân tích chi tiết điểm số */}
      <div className="bg-test">
        <div className="container-fluid">
          <div className="row mt-3">
            <div className="col-lg col-md col-sm">
              <div className="alert alert-primary" role="alert">
                <i className="fa-solid fa-circle-exclamation me-3"></i>Đánh giá điểm chỉ dành riêng cho Full Test 200 câu.
              </div>

              <div className="card specific-card border-0 shadow-lg mb-4">
                <div className="card-body">
                  <div className="row">
                    {/* Card 1 - Trả lời đúng */}
                    <div className="col-md-3">
                      <div className="card specific-card radius-10 border-start border-0 border-3 border-success card-with-effect">
                        <div className="card-body">
                          <div className="d-flex align-items-center">
                            <div>
                              <p className="mb-0 text-secondary">Trả lời đúng</p>
                              <h4 className="my-1 text-success">
                                {userExamById.numCorrectAnswers}/
                                {userExamById.numCorrectAnswers + userExamById.numWrongAnswers + userExamById.numSkippedQuestions}
                              </h4>
                            </div>
                            <div className="widgets-icons-2 rounded-circle bg-gradient-scooter text-white ms-auto">
                              <i className="fa-solid fa-circle-check"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card 2 - Trả lời sai */}
                    <div className="col-md-3">
                      <div className="card specific-card radius-10 border-start border-0 border-3 border-danger card-with-effect">
                        <div className="card-body">
                          <div className="d-flex align-items-center">
                            <div>
                              <p className="mb-0 text-secondary">Trả lời sai</p>
                              <h4 className="my-1 text-danger">
                                {userExamById.numWrongAnswers}/
                                {userExamById.numCorrectAnswers + userExamById.numWrongAnswers + userExamById.numSkippedQuestions}
                              </h4>
                            </div>
                            <div className="widgets-icons-2 rounded-circle bg-gradient-ohhappiness text-white ms-auto">
                              <i className="fa-solid fa-circle-xmark"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card 3 - Bỏ qua */}
                    <div className="col-md-3">
                      <div className="card specific-card radius-10 border-start border-0 border-3 border-secondary card-with-effect">
                        <div className="card-body">
                          <div className="d-flex align-items-center">
                            <div>
                              <p className="mb-0 text-secondary">Bỏ qua</p>
                              <h4 className="my-1 text-secondary">
                                {userExamById.numSkippedQuestions}/
                                {userExamById.numCorrectAnswers + userExamById.numWrongAnswers + userExamById.numSkippedQuestions}
                              </h4>
                            </div>
                            <div className="widgets-icons-2 rounded-circle bg-gradient-bloody text-white ms-auto">
                              <i className="fa-solid fa-minus"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card 4 - Thời gian hoàn thành */}
                    <div className="col-md-3">
                      <div className="card specific-card radius-10 border-start border-0 border-3 border-warning card-with-effect">
                        <div className="card-body">
                          <div className="d-flex align-items-center">
                            <div>
                              <p className="mb-0 text-secondary">Hoàn thành trong</p>
                              <h4 className="my-1 text-warning">{userExamById.completionTime}</h4>
                            </div>
                            <div className="widgets-icons-2 rounded-circle bg-gradient-blooker text-white ms-auto">
                              <i className="fa-solid fa-clock"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bảng điểm */}
                  <div className="card specific-card border-0">
                    <div className="row g-0">
                      <div className="col-4 d-flex justify-content-center align-items-center position-relative"
                        style={{ 
                          backgroundImage: 'url(https://media1.giphy.com/media/EoMXPKIN8b5jkYgT5e/giphy.gif?cid=6c09b952yv36lu2ev6randx9grip9luwzjty5ahdgt21vk5p&ep=v1_stickers_related&rid=giphy.gif&ct=s)', 
                          backgroundSize: '200px 150px', 
                          backgroundRepeat: 'no-repeat' 
                        }}>
                        <div style={{ width: 200, height: 200 }}>
                          <CircularProgressbar
                            value={percent}
                            text={`${userExamById.totalScore}/${maxScore}`}
                            styles={buildStyles({
                              textSize: '16px',
                              pathColor: `rgba(62, 152, 199, ${percent / 100})`,
                              textColor: '#333',
                              trailColor: '#d6d6d6',
                              backgroundColor: '#3e98c7',
                            })}
                          />
                        </div>
                        <p className="total-score">TOTAL SCORE</p>
                      </div>

                      <div className="col-8">                        <div className="card-footer border-0 d-flex justify-content-center">
                          <button className="btn btn-light">
                            <span style={{ fontSize: '20px' }}>🎯 Mục tiêu: {userExamById.goalScore}</span>
                          </button>
                        </div>

                        <div className="card-body border mt-3 me-3">
                          <h5 className="card-title">
                            <i className="fa-solid fa-headphones mb-5"></i> LISTENING: {userExamById.numListeningCorrectAnswers}/100
                          </h5>

                          <div className="barWrapper">
                            <div className="progress">
                              <div className="progress-bar" role="progressbar"
                                aria-valuenow={(userExamById.listeningScore * 100 / maxListeningScore)}
                                aria-valuemin="0" aria-valuemax="100"
                                style={{ width: (userExamById.listeningScore * 100 / maxListeningScore) + '%' }}>
                              </div>
                            </div>
                            <div className="custom-tooltip px-2"
                              style={{ left: (userExamById.listeningScore * 100 / maxListeningScore) + '%' }}>
                              {userExamById.listeningScore}
                            </div>
                          </div>
                          <div className="row">
                            <div className="col d-flex justify-content-start">
                              <span>0</span>
                            </div>
                            <div className="col d-flex justify-content-end">
                              <span>495</span>
                            </div>
                          </div>
                        </div>

                        <div className="card-body border me-3">
                          <h5 className="card-title">
                            <i className="fa-solid fa-book-open-reader mb-5"></i> READING: {userExamById.numReadingCorrectAnswers}/100
                          </h5>

                          <div className="barWrapper">
                            <div className="progress">
                              <div className="progress-bar" role="progressbar"
                                aria-valuenow={(userExamById.readingScore * 100 / maxReadingScore)}
                                aria-valuemin="0" aria-valuemax="100"
                                style={{ width: (userExamById.readingScore * 100 / maxReadingScore) + '%' }}>
                              </div>
                            </div>
                            <div className="custom-tooltip px-2"
                              style={{ left: (userExamById.readingScore * 100 / maxReadingScore) + '%' }}>
                              {userExamById.readingScore}
                            </div>
                          </div>
                          <div className="row">
                            <div className="col d-flex justify-content-start">
                              <span>0</span>
                            </div>
                            <div className="col d-flex justify-content-end">
                              <span>495</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          {/* Button trigger modal */}
                          <button type="button" className="btn btn-link link-offset-2" data-bs-toggle="modal"
                            data-bs-target="#exampleModal">
                            Xem chi tiết cách tính điểm 2023
                          </button>
                        </div>
                        
                        <p className=""><i className="fa-solid fa-square text-warning me-2"></i> Lưu ý: Bảng điểm Toeic 2023 chỉ mang tính chất tham khảo, điểm số khi thi chính thức có thể chênh lệch 5-20 điểm</p>

                        {userExamById.totalScore < userExamById.goalScore ? (
                          <p><i className="fa-solid fa-square text-success me-2"></i> Nhận xét: Bạn chưa vượt qua mục tiêu, cố gắng thêm nhé !!!</p>
                        ) : (
                          <p><i className="fa-solid fa-square text-success me-2"></i> Nhận xét: Chúc mừng bạn, bạn có thể đặt mục tiêu mới cho bản thân để rèn luyện thêm nữa nhé !!!</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Phân tích chi tiết câu hỏi từng phần */}
                  <div className="row my-3">
                    <div className="row">
                      <div className="col">
                        <h2>Phân tích chi tiết</h2>
                      </div>
                      <div className="col d-flex justify-content-end">
                        <Link to="/improve-study">
                          <button className="glowing-button ms-2">CẢI THIỆN NGAY</button>
                        </Link>
                      </div>
                    </div>

                    <div className="col-lg col-md col-sm">
                      <div className="card specific-card border-0 shadow-lg mb-4">
                        <div className="card-body">
                          <div className="row">
                            <div className="col">
                              <table className="table text-center table-hover shadow">
                                <thead className="text-center shadow">
                                  <tr className="align-middle">
                                    <th style={{ backgroundColor: 'white', color: '#052649', textAlign: 'center' }}>
                                      <button className="btn btn-success rounded-5 disabled">Phân loại câu hỏi</button>
                                    </th>
                                    <th style={{ backgroundColor: 'white', color: '#052649', textAlign: 'center' }}>
                                      <i className="fa-solid fa-circle-check text-success"></i>
                                    </th>
                                    <th style={{ backgroundColor: 'white', color: '#052649', textAlign: 'center' }}>
                                      <i className="fa-solid fa-circle-xmark text-danger"></i>
                                    </th>
                                    <th style={{ backgroundColor: 'white', color: '#052649', textAlign: 'center' }}>
                                      <i className="fa-solid fa-minus text-secondary"></i>
                                    </th>
                                    <th style={{ backgroundColor: 'white', color: '#052649', textAlign: 'center' }}>
                                      <i className="fa-solid fa-bullseye"></i>
                                    </th>
                                    <th style={{ backgroundColor: 'white', color: '#052649', textAlign: 'center' }}>
                                      Danh sách câu hỏi
                                    </th>
                                  </tr>
                                </thead>

                                <tbody>
                                  {Object.entries(questionGroups).map(([index, questionGroup]) => (
                                    <tr className="table-row shadow-on-hover" key={index}>
                                      <td className="align-middle">{index}</td>
                                      <td className="align-middle">{calculateCorrectCount(questionGroup)}</td>
                                      <td className="align-middle">{calculateIncorrectCount(questionGroup)}</td>
                                      <td className="align-middle">{calculateUnansweredCount(questionGroup)}</td>
                                      <td className="align-middle">{calculatePercentage(questionGroup)}%</td>
                                      <td className="align-middle text-start">
                                        {questionGroup.map((question, qIndex) => (
                                          <button key={qIndex} className="btn button5 my-2 ms-2"
                                            style={{
                                              backgroundColor: question.isCorrect === 1 ? '#70FF85' : (question.isCorrect === 0 ? '#FF7070' : '#e8f2ff'),
                                              color: '#35509a',
                                              width: '50px',
                                              fontSize: '13px',
                                              fontWeight: 'bold'
                                            }}>
                                            {question.examQuestion.orderNumber}
                                          </button>
                                        ))}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Đáp án và giải thích chi tiết */}
                  <div className="row my-3" id="reviewAnswers">
                    <h2>Đáp án chi tiết</h2>
                    <div className="col-lg col-md col-sm">
                      <div className="card specific-card border-0 shadow-lg mb-4">
                        <div className="card-body">
                          <div className="mb-3 d-flex justify-content-center">
                            {allParts.map(part => (
                              <button key={part} type="button"
                                className={`button ms-4 ${selectedPart === part ? 'active-part' : ''}`}
                                onClick={() => selectPart(part)}>
                                Phần {part}
                              </button>
                            ))}
                          </div>
                          <div className="row">
                            {Object.entries(groupedQuestions).map(([groupId, groupQuestions]) => (
                              <div className="col-sm-12" key={groupId}>
                                {shouldDisplayAudio(groupQuestions[0]) && (
                                  <div className="audio-container mt-5 mb-2">
                                    <audio controls style={{ width: '400px' }}>
                                      <source
                                        src={getAudioUrl(groupQuestions[0].examQuestion.questionAudio)}
                                        type="audio/mpeg" />
                                      Your browser does not support the audio element.
                                    </audio>
                                  </div>
                                )}

                                <div className="row">
                                  <div className={`                                    ${(shouldDisplayImage(groupQuestions[0]) || shouldDisplayPassage(groupQuestions[0])) && groupQuestions.length >= 2 ? 'col-md-6' : ''}
                                    ${shouldDisplayImage(groupQuestions[0]) && groupQuestions.length === 1 ? 'col-md-12' : ''}
                                    ${((shouldDisplayImage(groupQuestions[0]) || (shouldDisplayPassage(groupQuestions[0]) && groupQuestions.length >= 2))) ? 'bg-light rounded' : ''}
                                    ${shouldDisplayPassage(groupQuestions[0]) && groupQuestions.length >= 4 ? 'scrollable-container' : ''}
                                  `}>
                                    <div className="audio-image-container mt-3">
                                      {shouldDisplayImage(groupQuestions[0]) && (
                                        <div className="image-container">
                                          <img src={getImageUrl(groupQuestions[0].examQuestion.questionImage)}
                                            style={{ width: '400px' }}
                                            alt="Luyện thi Listening TOEIC"
                                            className="question-image"
                                            loading="lazy" />
                                        </div>
                                      )}
                                    </div>

                                    <div className="audio-image-container mt-5">
                                      {shouldDisplayPassage(groupQuestions[0]) && (
                                        <div className="audio-container mb-2">
                                          <div dangerouslySetInnerHTML={{
                                            __html: groupQuestions[0].examQuestion.questionPassage
                                          }}></div>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="col-md">
                                    <div className={`${shouldDisplayPassage(groupQuestions[0]) && groupQuestions.length >= 4 ? 'scrollable-container' : ''}`}>
                                      {groupQuestions.map((question, index) => (
                                        <div key={index} className="ms-3">
                                          <div className="question">
                                            <span className="badge text-bg-secondary my-2" style={{ fontSize: '14px' }}>
                                              {question.examQuestion.questionType}
                                            </span>
                                            <div className="row">
                                              <ul className="">
                                                <button className="btn button5 my-2"
                                                  style={{ backgroundColor: '#e8f2ff', color: '#35509a', width: '60px' }}>
                                                  {question.examQuestion.orderNumber}
                                                </button>

                                                <span className="ms-1">{question.examQuestion.questionContent}</span>

                                                {getOptions(question).map((option, optionIndex) => (
                                                  <li key={optionIndex} style={{ listStyleType: 'none' }}
                                                    className={getOptionClass(question, option)}>
                                                    <label className="form-check-label">
                                                      <input className="form-check-input"
                                                        type="radio"
                                                        value={option}
                                                        checked={question.selectedOption === option}
                                                        disabled
                                                        name={`flexRadioDefault-${question.examQuestion.examQuestionId}`} />
                                                      {option}
                                                      {option === question.examQuestion.correctOption && (
                                                        <div className="result-icon">
                                                          <i className="fas fa-check" style={{ color: 'green' }}></i>
                                                        </div>
                                                      )}
                                                      {option === question.selectedOption && option !== question.examQuestion.correctOption && (
                                                        <div className="result-icon">
                                                          <i className="fas fa-times" style={{ color: 'red' }}></i>
                                                        </div>
                                                      )}
                                                    </label>
                                                  </li>
                                                ))}

                                                {question.examQuestion.questionExplanation && (
                                                  <div className="feedback-section">
                                                    <button
                                                      onClick={() => toggleExplanation(index)}
                                                      className="btn btn-link btn-sm mt-2 link-offset-3">
                                                      {showExplanation[index] ? 'Ẩn giải thích' : 'Hiện giải thích'}
                                                    </button>
                                                    {showExplanation[index] && (
                                                      <div className="explanation"
                                                        dangerouslySetInnerHTML={{
                                                          __html: question.examQuestion.questionExplanation
                                                        }}></div>
                                                    )}
                                                  </div>
                                                )}
                                              </ul>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {groupQuestions[0].examQuestion.questionScript && (
                                  <>
                                    <button
                                      onClick={() => toggleGroupScript(groupId)}
                                      className="btn btn-link btn-sm link-offset-3">
                                      {showGroupScript[groupId] ? 'Ẩn bản ghi' : 'Hiện bản ghi'}
                                    </button>
                                    {showGroupScript[groupId] && (
                                      <div className="transcript mb-2"
                                        dangerouslySetInnerHTML={{
                                          __html: groupQuestions[0].examQuestion.questionScript
                                        }}></div>
                                    )}
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-4 col-sm-4 text-decoration-none border-0">
              <div className="card specific-card border-0 shadow" style={{ position: 'sticky', top: '95px', zIndex: 1 }}>
                <Link to="/user-exams" className="button d-flex justify-content-center mb-3 border rounded-4">
                  Quay lại kết quả luyện thi
                </Link>
                <div className="card-header border-0 text-center">
                  Thông tin kỳ thi
                </div>
                <div className="card-body border-0">
                  <p>+ Bộ đề thi: ETS 2023</p>
                  {userExamById.exam && <p>+ {userExamById.exam.examName}</p>}
                  {userExamById.exam && <p>+ {userExamById.exam.examDuration / 60} phút</p>}
                </div>
                <div className="row">
                  <div className="col d-flex justify-content-center">
                    <div className="button border rounded-4" onClick={scrollToReviewQuestion}>
                      Xem đáp án
                    </div>
                  </div>
                  <div className="col d-flex justify-content-center">
                    <Link to="/full-test">
                      <div className="button border rounded-4">
                        Tiếp tục thi
                      </div>
                    </Link>
                  </div>
                </div>
                <div className="card-footer border-0">
                  <button type="button" className="btn btn-link link-offset-2" data-bs-toggle="modal" data-bs-target="#exampleModal2">
                    <i className="fa-solid fa-chevron-right me-2"></i> Tra cứu từ điển
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExamResult;
