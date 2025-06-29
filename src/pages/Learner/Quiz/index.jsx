import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVolumeUp,
  faArrowLeft,
  faCheck,
  faTimes,
  faRotateRight,
  faHome,
  faStar,
  faGraduationCap,
  faClock,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import "./style.css";

// Import services
import topicService from "../../../services/topicService";
import vocabularyService from "../../../services/vocabularyService";

const Quiz = () => {
  const { topicId } = useParams();

  // States
  const [topic, setTopic] = useState({});
  const [vocabularies, setVocabularies] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      console.log("🚀 ~ Starting fetchData for topicId:", topicId);
      setLoading(true);
      try {
        // Get topic details
        const topicResponse = await topicService.getById(topicId);
        console.log("🚀 ~ fetchData ~ topicResponse:", topicResponse);

        // Backend trả về object trực tiếp
        setTopic(topicResponse || {});

        // Get vocabularies by topic ID
        const vocabResponse = await vocabularyService.getByTopicId(topicId);
        console.log("🚀 ~ fetchData ~ vocabResponse:", vocabResponse);
        console.log("🚀 ~ vocabResponse type:", typeof vocabResponse);
        console.log(
          "🚀 ~ vocabResponse isArray:",
          Array.isArray(vocabResponse)
        );

        // Backend trả về array trực tiếp, đảm bảo các field đầy đủ
        const vocabList = Array.isArray(vocabResponse)
          ? vocabResponse.filter((vocab) => {
              console.log("🚀 ~ Checking vocab:", vocab);
              return (
                vocab.word && vocab.meaning && vocab.vocabularyStatus === 1
              );
            })
          : [];
        console.log("🚀 ~ filtered vocabList:", vocabList);
        console.log("🚀 ~ vocabList length:", vocabList.length);
        setVocabularies(vocabList);

        if (vocabList.length === 0) {
          console.warn("No vocabularies found");
          toast.warning("Chủ đề này chưa có từ vựng nào");
          setLoading(false);
          return;
        }

        if (vocabList.length < 4) {
          console.warn("Not enough vocabularies for quiz");
          toast.warning("Cần ít nhất 4 từ vựng để tạo bài kiểm tra");
          setLoading(false);
          return;
        }

        // Generate quiz questions
        console.log("🚀 ~ Generating quiz questions...");
        const quizQuestions = generateQuestions(vocabList);
        console.log("🚀 ~ Generated questions:", quizQuestions);

        if (quizQuestions.length === 0) {
          console.error("Failed to generate questions");
          toast.error("Không thể tạo câu hỏi từ dữ liệu từ vựng");
          setLoading(false);
          return;
        }

        setQuestions(quizQuestions);
        setTimeLeft(quizQuestions.length * 30); // 30 seconds per question
        console.log(
          "🚀 ~ Quiz initialized with",
          quizQuestions.length,
          "questions"
        );
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        toast.error("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    if (topicId) {
      fetchData();
    }
  }, [topicId]);

  // Generate quiz questions
  const generateQuestions = (vocabList) => {
    console.log("🚀 ~ generateQuestions ~ Input vocabList:", vocabList);

    if (!Array.isArray(vocabList) || vocabList.length === 0) {
      console.warn("Invalid vocab list for generating questions");
      return [];
    }

    if (vocabList.length < 4) {
      console.warn("Not enough vocabulary for quiz (need at least 4)");
      return [];
    }

    const questions = [];
    const shuffledVocabs = [...vocabList].sort(() => 0.5 - Math.random());
    const maxQuestions = Math.min(10, vocabList.length);

    console.log(
      "🚀 ~ Will generate",
      maxQuestions,
      "questions from",
      shuffledVocabs.length,
      "vocabularies"
    );

    shuffledVocabs.slice(0, maxQuestions).forEach((vocab, index) => {
      console.log(`🚀 ~ Processing vocab ${index + 1}:`, vocab);

      // Đảm bảo vocab có đủ thông tin cần thiết
      if (!vocab.word || !vocab.meaning) {
        console.warn("Skipping vocab with missing fields:", vocab);
        return;
      }

      // Create wrong answers from other vocabularies
      const otherVocabs = vocabList.filter(
        (v) =>
          v._id !== vocab._id &&
          v.meaning &&
          v.meaning !== vocab.meaning &&
          v.meaning.trim() !== vocab.meaning.trim()
      );

      console.log(
        `🚀 ~ Found ${otherVocabs.length} other vocabs for wrong answers`
      );

      if (otherVocabs.length < 3) {
        console.warn(
          `Not enough wrong answers for vocab "${vocab.word}" (found ${otherVocabs.length}, need 3)`
        );
        return;
      }

      const wrongAnswers = otherVocabs
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map((v) => v.meaning);

      const options = [vocab.meaning, ...wrongAnswers].sort(
        () => 0.5 - Math.random()
      );

      const questionData = {
        id: vocab._id,
        word: vocab.word || "",
        ipa: vocab.ipa || "",
        correctAnswer: vocab.meaning,
        options: options,
        exampleSentence: vocab.exampleSentence || "",
      };

      console.log(
        `🚀 ~ Generated question ${questions.length + 1}:`,
        questionData
      );
      questions.push(questionData);
    });

    console.log("🚀 ~ generateQuestions ~ Final questions array:", questions);
    return questions;
  };

  // Timer effect
  useEffect(() => {
    let timer;
    if (quizStarted && !quizCompleted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            toast.error("Hết thời gian!");
            setQuizCompleted(true);
            setShowResult(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizStarted, quizCompleted, timeLeft]);

  // Start quiz
  const startQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowResult(false);
    setQuizCompleted(false);
  };

  // Handle answer selection
  const selectAnswer = (answer) => {
    setSelectedAnswer(answer);
  };

  // Submit answer and go to next question
  const submitAnswer = () => {
    if (selectedAnswer === null) {
      toast.warning("Vui lòng chọn một đáp án");
      return;
    }

    const newAnswers = [...answers];
    newAnswers[currentQuestion] = {
      questionId: questions[currentQuestion].id,
      selectedAnswer: selectedAnswer,
      correctAnswer: questions[currentQuestion].correctAnswer,
      isCorrect: selectedAnswer === questions[currentQuestion].correctAnswer,
    };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Quiz completed
      setQuizCompleted(true);
      showQuizResults(newAnswers);
    }
  };

  // Show quiz results
  const showQuizResults = (finalAnswers) => {
    setShowResult(true);

    // Calculate score for celebration
    const score = finalAnswers.filter((a) => a?.isCorrect).length;
    const percentage = Math.round((score / questions.length) * 100);

    // Show celebration toast based on performance
    setTimeout(() => {
      if (percentage >= 90) {
        toast.success("🎉 Xuất sắc! Bạn đã làm bài tuyệt vời!", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else if (percentage >= 70) {
        toast.success("🎊 Tốt lắm! Bạn đã vượt qua bài kiểm tra!", {
          position: "top-center",
          autoClose: 4000,
        });
      } else if (percentage >= 50) {
        toast.warning("📚 Cần cố gắng thêm! Hãy ôn tập và thử lại.", {
          position: "top-center",
          autoClose: 4000,
        });
      } else {
        toast.error("💪 Đừng nản lòng! Hãy học thêm và thử lại nhé!", {
          position: "top-center",
          autoClose: 4000,
        });
      }
    }, 500);
  };

  // Reset quiz
  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setShowResult(false);
    setQuizStarted(false);
    setQuizCompleted(false);
    setTimeLeft(questions.length * 30);
  };

  // Play pronunciation
  const playPronunciation = (word) => {
    if (!word || typeof word !== "string") {
      console.warn("Invalid word for pronunciation:", word);
      return;
    }

    try {
      const speech = new SpeechSynthesisUtterance(word);
      speech.lang = "en-US";
      speech.rate = 0.8; // Slightly slower for better pronunciation
      window.speechSynthesis.speak(speech);
    } catch (error) {
      console.error("Error playing pronunciation:", error);
      toast.error("Không thể phát âm từ này");
    }
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="text-muted">Đang tải dữ liệu quiz...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!loading && (vocabularies.length === 0 || questions.length === 0)) {
    return (
      <div className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 text-center">
            <FontAwesomeIcon
              icon={faGraduationCap}
              className="fs-1 text-muted mb-4"
            />
            <h3 className="text-muted mb-3">Không thể tạo bài kiểm tra</h3>
            <p className="text-muted mb-4">
              {vocabularies.length === 0
                ? "Chủ đề này chưa có từ vựng nào để kiểm tra."
                : "Không đủ dữ liệu để tạo câu hỏi kiểm tra."}
            </p>
            <div className="d-flex gap-3 justify-content-center">
              <Link
                to={`/learner/topic/${topicId}`}
                className="btn btn-primary"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                Quay lại chi tiết chủ đề
              </Link>
              <Link to="/learner/topics" className="btn btn-outline-secondary">
                <FontAwesomeIcon icon={faHome} className="me-2" />
                Danh sách chủ đề
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz results view
  if (showResult) {
    const score = answers.filter((a) => a?.isCorrect).length;
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="quiz-results">
        {/* SVG Gradients */}
        <svg className="svg-gradients">
          <defs>
            <linearGradient
              id="scoreGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#28a745" />
              <stop offset="100%" stopColor="#20c997" />
            </linearGradient>
          </defs>
        </svg>

        {/* Confetti for excellent performance */}
        {percentage >= 90 && (
          <div className="confetti">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="confetti-piece"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        )}

        <div className="container-fluid">
          <div className="row justify-content-center">
            <div className="col-lg-10 col-xl-8">
              <div className="card results-card fade-in">
                <div className="card-body text-center p-5">
                  {/* Results Icon */}
                  <div className="results-icon mb-4">
                    <div
                      className={
                        percentage >= 70 ? "success-checkmark" : "error-cross"
                      }
                    ></div>
                  </div>

                  {/* Score Ring */}
                  <div className="score-ring mb-4">
                    <svg viewBox="0 0 150 150">
                      <circle
                        className="bg"
                        strokeDasharray="408.4"
                        strokeDashoffset="0"
                      />
                      <circle
                        className="progress"
                        strokeDasharray="408.4"
                        strokeDashoffset={408.4 - (408.4 * percentage) / 100}
                      />
                    </svg>
                    <div className="score-text">
                      <div className="score">{percentage}</div>
                      <div className="total">%</div>
                    </div>
                  </div>

                  {/* Result Title */}
                  <h2 className="mb-3 text-gradient">
                    {percentage >= 90
                      ? "🎉 Xuất sắc!"
                      : percentage >= 70
                      ? "🎊 Tốt lắm!"
                      : percentage >= 50
                      ? "📚 Cần cố gắng thêm!"
                      : "💪 Hãy thử lại!"}
                  </h2>

                  {/* Score Details */}
                  <div className="row justify-content-center mb-4">
                    <div className="col-4 text-center">
                      <div className="info-item">
                        <h5>{score}</h5>
                        <p>Câu đúng</p>
                      </div>
                    </div>
                    <div className="col-4 text-center">
                      <div className="info-item">
                        <h5>{questions.length - score}</h5>
                        <p>Câu sai</p>
                      </div>
                    </div>
                    <div className="col-4 text-center">
                      <div className="info-item">
                        <h5>{questions.length}</h5>
                        <p>Tổng câu</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="d-flex flex-wrap gap-3 justify-content-center mb-4">
                    <button
                      onClick={resetQuiz}
                      className="btn btn-primary btn-lg"
                    >
                      <FontAwesomeIcon icon={faRotateRight} className="me-2" />
                      Làm lại
                    </button>
                    <Link
                      to={`/learner/topic/${topicId}`}
                      className="btn btn-secondary btn-lg"
                    >
                      <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                      Quay lại
                    </Link>
                    <Link
                      to={`/learner/topic/${topicId}/flashcards`}
                      className="btn btn-warning btn-lg"
                    >
                      <FontAwesomeIcon icon={faStar} className="me-2" />
                      Flashcards
                    </Link>
                  </div>

                  {/* Question Review */}
                  <div className="question-review">
                    <h4 className="mb-4 text-gradient">Xem lại kết quả</h4>
                    {answers.map((answer, index) => (
                      <div
                        key={index}
                        className={`card review-item mb-3 ${
                          answer?.isCorrect ? "border-success" : "border-danger"
                        } slide-up`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="card-body">
                          <div className="d-flex align-items-center justify-content-between">
                            <div className="flex-grow-1">
                              <div className="review-word mb-2">
                                <strong>{questions[index]?.word}</strong>
                                {questions[index]?.ipa && (
                                  <span className="ipa ms-2">
                                    {questions[index].ipa}
                                  </span>
                                )}
                              </div>
                              <div className="review-answer mb-1">
                                <span className="fw-medium">Bạn chọn: </span>
                                <span
                                  className={
                                    answer?.isCorrect
                                      ? "text-success"
                                      : "text-danger"
                                  }
                                >
                                  {answer?.selectedAnswer}
                                </span>
                              </div>
                              {!answer?.isCorrect && (
                                <div className="review-correct">
                                  <span className="fw-medium">
                                    Đáp án đúng:{" "}
                                  </span>
                                  <span className="text-success">
                                    {answer?.correctAnswer}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="result-icon ms-3">
                              <FontAwesomeIcon
                                icon={answer?.isCorrect ? faCheck : faTimes}
                                className={`fs-4 ${
                                  answer?.isCorrect
                                    ? "text-success"
                                    : "text-danger"
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz start screen
  if (!quizStarted) {
    return (
      <div className="container-fluid quiz-intro">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card intro-card">
              <div className="card-body text-center p-5">
                <div className="intro-icon mb-4">
                  <FontAwesomeIcon
                    icon={faQuestionCircle}
                    className="fs-1 text-primary"
                  />
                </div>
                <h2 className="mb-3">Kiểm tra từ vựng</h2>
                <h4 className="text-primary mb-4">
                  {topic.topicName || "Chủ đề không xác định"}
                </h4>

                <div className="quiz-info mb-5">
                  <div className="row text-center">
                    <div className="col-md-4">
                      <div className="info-item">
                        <FontAwesomeIcon
                          icon={faQuestionCircle}
                          className="fs-3 text-primary mb-2"
                        />
                        <h5>{questions.length}</h5>
                        <p className="text-muted">Câu hỏi</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="info-item">
                        <FontAwesomeIcon
                          icon={faClock}
                          className="fs-3 text-warning mb-2"
                        />
                        <h5>{formatTime(timeLeft)}</h5>
                        <p className="text-muted">Thời gian</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="info-item">
                        <FontAwesomeIcon
                          icon={faStar}
                          className="fs-3 text-success mb-2"
                        />
                        <h5>70%</h5>
                        <p className="text-muted">Để đạt</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="quiz-rules mb-4">
                  <h5>Hướng dẫn:</h5>
                  <ul className="list-unstyled">
                    <li>• Chọn nghĩa đúng cho từ vựng được hiển thị</li>
                    <li>• Mỗi câu hỏi có 30 giây để trả lời</li>
                    <li>• Bạn cần đạt 70% để vượt qua bài kiểm tra</li>
                    <li>• Có thể làm lại nhiều lần</li>
                  </ul>
                </div>

                <div className="d-flex gap-3 justify-content-center">
                  <button
                    onClick={startQuiz}
                    className="btn btn-success btn-lg"
                  >
                    <FontAwesomeIcon icon={faCheck} className="me-2" />
                    Bắt đầu kiểm tra
                  </button>
                  <Link
                    to={`/learner/topic/${topicId}`}
                    className="btn btn-outline-secondary btn-lg"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                    Quay lại
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz question view
  const question = questions[currentQuestion];

  // Debug logging
  console.log("🚀 ~ Render state:", {
    loading,
    vocabulariesLength: vocabularies.length,
    questionsLength: questions.length,
    quizStarted,
    showResult,
    currentQuestion,
    question,
  });

  return (
    <div className="quiz-container">
      {/* Background decoration */}
      <div className="quiz-background">
        <div className="quiz-circle quiz-circle-1"></div>
        <div className="quiz-circle quiz-circle-2"></div>
        <div className="quiz-circle quiz-circle-3"></div>
      </div>

      <div className="container-fluid">
        {/* Modern Header */}
        <div className="quiz-header-modern">
          <div className="row align-items-center">
            <div className="col-md-4">
              <div className="quiz-progress-info">
                <span className="progress-text">Câu hỏi</span>
                <span className="progress-number">
                  {currentQuestion + 1}/{questions.length}
                </span>
              </div>
            </div>
            <div className="col-md-4 text-center">
              <div className="quiz-progress-bar">
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${
                        ((currentQuestion + 1) / questions.length) * 100
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="progress-percentage">
                  {Math.round(((currentQuestion + 1) / questions.length) * 100)}
                  %
                </span>
              </div>
            </div>
            <div className="col-md-4 text-end">
              <div className="quiz-timer-modern">
                <FontAwesomeIcon icon={faClock} className="timer-icon" />
                <span
                  className={`timer-text ${
                    timeLeft <= 30 ? "timer-urgent" : ""
                  }`}
                >
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="row justify-content-center mt-4">
          <div className="col-lg-10 col-xl-8">
            <div className="question-card-modern">
              <div className="question-header">
                <div className="question-icon">
                  <FontAwesomeIcon icon={faQuestionCircle} />
                </div>
                <h3 className="question-title-modern">
                  Nghĩa của từ này là gì?
                </h3>
              </div>

              <div className="word-section">
                <div className="word-display-modern">
                  <h1 className="vocabulary-word">
                    {question.word || "Unknown"}
                  </h1>
                  <div className="word-details">
                    {question.ipa && (
                      <div className="pronunciation-section">
                        <span className="ipa-text">{question.ipa}</span>
                        <button
                          className="pronunciation-btn"
                          onClick={() => playPronunciation(question.word)}
                          disabled={!question.word}
                        >
                          <FontAwesomeIcon icon={faVolumeUp} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {question.exampleSentence &&
                  question.exampleSentence.trim() && (
                    <div className="example-section">
                      <div className="example-label">Ví dụ:</div>
                      <div className="example-text">
                        "{question.exampleSentence}"
                      </div>
                    </div>
                  )}
              </div>

              <div className="options-grid">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    className={`option-card ${
                      selectedAnswer === option ? "option-selected" : ""
                    }`}
                    onClick={() => selectAnswer(option)}
                  >
                    <div className="option-letter">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <div className="option-content">
                      <span className="option-text">{option}</span>
                    </div>
                    <div className="option-indicator">
                      {selectedAnswer === option && (
                        <FontAwesomeIcon icon={faCheck} />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="question-footer">
                <button
                  className={`submit-btn ${
                    selectedAnswer ? "submit-ready" : "submit-disabled"
                  }`}
                  onClick={submitAnswer}
                  disabled={selectedAnswer === null}
                >
                  <span className="submit-text">
                    {currentQuestion === questions.length - 1
                      ? "Hoàn thành bài kiểm tra"
                      : "Câu tiếp theo"}
                  </span>
                  <FontAwesomeIcon
                    icon={
                      currentQuestion === questions.length - 1
                        ? faCheck
                        : faArrowLeft
                    }
                    className="submit-icon"
                    style={
                      currentQuestion !== questions.length - 1
                        ? { transform: "rotate(180deg)" }
                        : {}
                    }
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
