import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Card,
  Button,
  Progress,
  Row,
  Col,
  Typography,
  Space,
  Spin,
  message,
} from "antd";
import {
  Volume2,
  ArrowLeft,
  Check,
  X,
  RotateCcw,
  Home,
  Star,
  GraduationCap,
  Clock,
  HelpCircle,
  ChevronRight,
} from "lucide-react";

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
          message.warning("Chủ đề này chưa có từ vựng nào");
          setLoading(false);
          return;
        }

        if (vocabList.length < 4) {
          console.warn("Not enough vocabularies for quiz");
          message.warning("Cần ít nhất 4 từ vựng để tạo bài kiểm tra");
          setLoading(false);
          return;
        }

        // Generate quiz questions
        console.log("🚀 ~ Generating quiz questions...");
        const quizQuestions = generateQuestions(vocabList);
        console.log("🚀 ~ Generated questions:", quizQuestions);

        if (quizQuestions.length === 0) {
          console.error("Failed to generate questions");
          message.error("Không thể tạo câu hỏi từ dữ liệu từ vựng");
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
        message.error("Không thể tải dữ liệu. Vui lòng thử lại sau.");
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
            message.error("Hết thời gian!");
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
      message.warning("Vui lòng chọn một đáp án");
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
        message.success("🎉 Xuất sắc! Bạn đã làm bài tuyệt vời!");
      } else if (percentage >= 70) {
        message.success("🎊 Tốt lắm! Bạn đã vượt qua bài kiểm tra!");
      } else if (percentage >= 50) {
        message.warning("📚 Cần cố gắng thêm! Hãy ôn tập và thử lại.");
      } else {
        message.error("💪 Đừng nản lòng! Hãy học thêm và thử lại nhé!");
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
      message.error("Không thể phát âm từ này");
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
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f0f2f5 0%, #ffffff 100%)",
          padding: "20px",
        }}
      >
        <Card
          style={{
            textAlign: "center",
            borderRadius: "16px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            padding: "24px",
            border: "none",
          }}
        >
          <Spin size="large" />
          <Typography.Title
            level={4}
            style={{ marginTop: "16px", marginBottom: "8px", color: "#1890ff" }}
          >
            Đang tải dữ liệu quiz...
          </Typography.Title>
          <Typography.Text type="secondary">
            Vui lòng chờ trong giây lát
          </Typography.Text>
        </Card>
      </div>
    );
  }

  if (!loading && (vocabularies.length === 0 || questions.length === 0)) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f0f2f5 0%, #ffffff 100%)",
          padding: "20px",
        }}
      >
        <Card
          style={{
            textAlign: "center",
            borderRadius: "16px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            padding: "24px",
            border: "none",
            maxWidth: "500px",
            width: "100%",
          }}
        >
          <div style={{ marginBottom: "16px" }}>
            <GraduationCap size={48} style={{ color: "#8c8c8c" }} />
          </div>
          <Typography.Title
            level={3}
            style={{ color: "#8c8c8c", marginBottom: "12px" }}
          >
            Không thể tạo bài kiểm tra
          </Typography.Title>
          <Typography.Text
            type="secondary"
            style={{ fontSize: "14px", marginBottom: "24px", display: "block" }}
          >
            {vocabularies.length === 0
              ? "Chủ đề này chưa có từ vựng nào để kiểm tra."
              : "Không đủ dữ liệu để tạo câu hỏi kiểm tra."}
          </Typography.Text>
          <Space size="middle">
            <Link to={`/learner/topic/${topicId}`}>
              <Button
                type="primary"
                size="large"
                icon={<ArrowLeft size={16} />}
              >
                Quay lại chi tiết chủ đề
              </Button>
            </Link>
            <Link to="/learner/topics">
              <Button size="large" icon={<Home size={16} />}>
                Danh sách chủ đề
              </Button>
            </Link>
          </Space>
        </Card>
      </div>
    );
  }

  // Quiz results view
  if (showResult) {
    const score = answers.filter((a) => a?.isCorrect).length;
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f0f2f5 0%, #ffffff 100%)",
          padding: "16px",
        }}
      >
        <Row justify="center">
          <Col xs={24} sm={22} md={20} lg={16} xl={14}>
            <Card
              style={{
                borderRadius: "16px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                border: "none",
                textAlign: "center",
              }}
            >
              <div style={{ padding: "24px 16px" }}>
                {/* Results Icon */}
                <div style={{ marginBottom: "20px" }}>
                  {percentage >= 70 ? (
                    <div
                      style={{
                        width: "60px",
                        height: "60px",
                        background:
                          "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto",
                        boxShadow: "0 8px 24px rgba(82, 196, 26, 0.3)",
                      }}
                    >
                      <Check size={30} style={{ color: "white" }} />
                    </div>
                  ) : (
                    <div
                      style={{
                        width: "60px",
                        height: "60px",
                        background:
                          "linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto",
                        boxShadow: "0 8px 24px rgba(255, 77, 79, 0.3)",
                      }}
                    >
                      <X size={30} style={{ color: "white" }} />
                    </div>
                  )}
                </div>

                {/* Score Circle */}
                <div style={{ marginBottom: "20px" }}>
                  <Progress
                    type="circle"
                    percent={percentage}
                    size={120}
                    strokeWidth={8}
                    strokeColor={percentage >= 70 ? "#52c41a" : "#ff4d4f"}
                    trailColor="#f0f0f0"
                    format={() => (
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{
                            fontSize: "28px",
                            fontWeight: "bold",
                            color: percentage >= 70 ? "#52c41a" : "#ff4d4f",
                          }}
                        >
                          {percentage}
                        </div>
                        <div style={{ fontSize: "14px", color: "#8c8c8c" }}>
                          %
                        </div>
                      </div>
                    )}
                  />
                </div>

                {/* Result Title */}
                <Typography.Title
                  level={3}
                  style={{
                    marginBottom: "16px",
                    background:
                      percentage >= 70
                        ? "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)"
                        : "linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {percentage >= 90
                    ? "🎉 Xuất sắc!"
                    : percentage >= 70
                    ? "🎊 Tốt lắm!"
                    : percentage >= 50
                    ? "📚 Cần cố gắng thêm!"
                    : "💪 Hãy thử lại!"}
                </Typography.Title>

                {/* Score Details */}
                <Row gutter={16} style={{ marginBottom: "20px" }}>
                  <Col span={8}>
                    <Card
                      size="small"
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #d9f7be",
                      }}
                    >
                      <Typography.Title
                        level={5}
                        style={{ margin: 0, color: "#52c41a" }}
                      >
                        {score}
                      </Typography.Title>
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: "12px" }}
                      >
                        Câu đúng
                      </Typography.Text>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card
                      size="small"
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #ffccc7",
                      }}
                    >
                      <Typography.Title
                        level={5}
                        style={{ margin: 0, color: "#ff4d4f" }}
                      >
                        {questions.length - score}
                      </Typography.Title>
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: "12px" }}
                      >
                        Câu sai
                      </Typography.Text>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card
                      size="small"
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #d6e4ff",
                      }}
                    >
                      <Typography.Title
                        level={5}
                        style={{ margin: 0, color: "#1890ff" }}
                      >
                        {questions.length}
                      </Typography.Title>
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: "12px" }}
                      >
                        Tổng câu
                      </Typography.Text>
                    </Card>
                  </Col>
                </Row>

                {/* Action Buttons */}
                <Space size="middle" wrap style={{ marginBottom: "20px" }}>
                  <Button
                    type="primary"
                    size="large"
                    icon={<RotateCcw size={16} />}
                    onClick={resetQuiz}
                    style={{
                      borderRadius: "8px",
                      height: "40px",
                    }}
                  >
                    Làm lại
                  </Button>
                  <Link to={`/learner/topic/${topicId}`}>
                    <Button
                      size="large"
                      icon={<ArrowLeft size={16} />}
                      style={{
                        borderRadius: "8px",
                        height: "40px",
                      }}
                    >
                      Quay lại
                    </Button>
                  </Link>
                  <Link to={`/learner/flashcards/${topicId}`}>
                    <Button
                      type="default"
                      size="large"
                      icon={<Star size={16} />}
                      style={{
                        borderRadius: "8px",
                        height: "40px",
                        background: "#fff7e6",
                        borderColor: "#ffd591",
                      }}
                    >
                      Flashcards
                    </Button>
                  </Link>
                </Space>

                {/* Question Review */}
                <div>
                  <Typography.Title
                    level={5}
                    style={{
                      marginBottom: "16px",
                      background:
                        "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Xem lại kết quả
                  </Typography.Title>
                  <Space
                    direction="vertical"
                    size={12}
                    style={{ width: "100%" }}
                  >
                    {answers.map((answer, index) => (
                      <Card
                        key={index}
                        size="small"
                        style={{
                          borderRadius: "8px",
                          border: `1px solid ${
                            answer?.isCorrect ? "#d9f7be" : "#ffccc7"
                          }`,
                          background: answer?.isCorrect ? "#f6ffed" : "#fff2f0",
                        }}
                      >
                        <Row justify="space-between" align="middle">
                          <Col flex="auto">
                            <div style={{ marginBottom: "4px" }}>
                              <Typography.Text
                                strong
                                style={{ fontSize: "14px" }}
                              >
                                {questions[index]?.word}
                              </Typography.Text>
                              {questions[index]?.ipa && (
                                <Typography.Text
                                  type="secondary"
                                  style={{
                                    marginLeft: "8px",
                                    fontSize: "12px",
                                  }}
                                >
                                  {questions[index].ipa}
                                </Typography.Text>
                              )}
                            </div>
                            <div style={{ marginBottom: "2px" }}>
                              <Typography.Text style={{ fontSize: "12px" }}>
                                Bạn chọn:{" "}
                              </Typography.Text>
                              <Typography.Text
                                style={{
                                  color: answer?.isCorrect
                                    ? "#52c41a"
                                    : "#ff4d4f",
                                  fontWeight: "500",
                                  fontSize: "12px",
                                }}
                              >
                                {answer?.selectedAnswer}
                              </Typography.Text>
                            </div>
                            {!answer?.isCorrect && (
                              <div>
                                <Typography.Text style={{ fontSize: "12px" }}>
                                  Đáp án đúng:{" "}
                                </Typography.Text>
                                <Typography.Text
                                  style={{
                                    color: "#52c41a",
                                    fontWeight: "500",
                                    fontSize: "12px",
                                  }}
                                >
                                  {answer?.correctAnswer}
                                </Typography.Text>
                              </div>
                            )}
                          </Col>
                          <Col>
                            <div
                              style={{
                                width: "28px",
                                height: "28px",
                                background: answer?.isCorrect
                                  ? "#52c41a"
                                  : "#ff4d4f",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {answer?.isCorrect ? (
                                <Check size={14} style={{ color: "white" }} />
                              ) : (
                                <X size={14} style={{ color: "white" }} />
                              )}
                            </div>
                          </Col>
                        </Row>
                      </Card>
                    ))}
                  </Space>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  // Quiz start screen
  if (!quizStarted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f0f2f5 0%, #ffffff 100%)",
          padding: "16px",
        }}
      >
        <Row justify="center">
          <Col xs={24} sm={22} md={18} lg={14} xl={12}>
            <Card
              style={{
                borderRadius: "16px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                border: "none",
                textAlign: "center",
              }}
            >
              <div style={{ padding: "24px 16px" }}>
                <div
                  style={{
                    marginBottom: "20px",
                    width: "60px",
                    height: "60px",
                    background:
                      "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                    boxShadow: "0 8px 24px rgba(24, 144, 255, 0.3)",
                  }}
                >
                  <HelpCircle size={30} style={{ color: "white" }} />
                </div>

                <Typography.Title level={3} style={{ marginBottom: "12px" }}>
                  Kiểm tra từ vựng
                </Typography.Title>
                <Typography.Title
                  level={5}
                  style={{
                    color: "#1890ff",
                    marginBottom: "20px",
                    background:
                      "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {topic.topicName || "Chủ đề không xác định"}
                </Typography.Title>

                <Row gutter={16} style={{ marginBottom: "24px" }}>
                  <Col span={8}>
                    <Card
                      size="small"
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #d6e4ff",
                        background:
                          "linear-gradient(135deg, #f0f8ff 0%, #ffffff 100%)",
                      }}
                    >
                      <div style={{ marginBottom: "4px" }}>
                        <HelpCircle size={18} style={{ color: "#1890ff" }} />
                      </div>
                      <Typography.Title
                        level={5}
                        style={{ margin: 0, color: "#1890ff" }}
                      >
                        {questions.length}
                      </Typography.Title>
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: "12px" }}
                      >
                        Câu hỏi
                      </Typography.Text>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card
                      size="small"
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #fff7e6",
                        background:
                          "linear-gradient(135deg, #fff7e6 0%, #ffffff 100%)",
                      }}
                    >
                      <div style={{ marginBottom: "4px" }}>
                        <Clock size={18} style={{ color: "#fa8c16" }} />
                      </div>
                      <Typography.Title
                        level={5}
                        style={{ margin: 0, color: "#fa8c16" }}
                      >
                        {formatTime(timeLeft)}
                      </Typography.Title>
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: "12px" }}
                      >
                        Thời gian
                      </Typography.Text>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card
                      size="small"
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #d9f7be",
                        background:
                          "linear-gradient(135deg, #f6ffed 0%, #ffffff 100%)",
                      }}
                    >
                      <div style={{ marginBottom: "4px" }}>
                        <Star size={18} style={{ color: "#52c41a" }} />
                      </div>
                      <Typography.Title
                        level={5}
                        style={{ margin: 0, color: "#52c41a" }}
                      >
                        70%
                      </Typography.Title>
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: "12px" }}
                      >
                        Để đạt
                      </Typography.Text>
                    </Card>
                  </Col>
                </Row>

                <Card
                  size="small"
                  style={{
                    borderRadius: "8px",
                    background: "#fafafa",
                    border: "1px solid #e8e8e8",
                    marginBottom: "20px",
                  }}
                >
                  <Typography.Title level={5} style={{ marginBottom: "12px" }}>
                    Hướng dẫn:
                  </Typography.Title>
                  <div style={{ textAlign: "left" }}>
                    <Typography.Paragraph
                      style={{ margin: "4px 0", fontSize: "13px" }}
                    >
                      • Chọn nghĩa đúng cho từ vựng được hiển thị
                    </Typography.Paragraph>
                    <Typography.Paragraph
                      style={{ margin: "4px 0", fontSize: "13px" }}
                    >
                      • Mỗi câu hỏi có 30 giây để trả lời
                    </Typography.Paragraph>
                    <Typography.Paragraph
                      style={{ margin: "4px 0", fontSize: "13px" }}
                    >
                      • Bạn cần đạt 70% để vượt qua bài kiểm tra
                    </Typography.Paragraph>
                    <Typography.Paragraph
                      style={{ margin: "4px 0", fontSize: "13px" }}
                    >
                      • Có thể làm lại nhiều lần
                    </Typography.Paragraph>
                  </div>
                </Card>

                <Space size="middle">
                  <Button
                    type="primary"
                    size="large"
                    icon={<Check size={16} />}
                    onClick={startQuiz}
                    style={{
                      borderRadius: "8px",
                      height: "40px",
                      paddingLeft: "20px",
                      paddingRight: "20px",
                      background:
                        "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(82, 196, 26, 0.3)",
                    }}
                  >
                    Bắt đầu kiểm tra
                  </Button>
                  <Link to={`/learner/topic/${topicId}`}>
                    <Button
                      size="large"
                      icon={<ArrowLeft size={16} />}
                      style={{
                        borderRadius: "8px",
                        height: "40px",
                        paddingLeft: "20px",
                        paddingRight: "20px",
                      }}
                    >
                      Quay lại
                    </Button>
                  </Link>
                </Space>
              </div>
            </Card>
          </Col>
        </Row>
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
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0f2f5 0%, #ffffff 100%)",
        padding: "16px",
      }}
    >
      {/* Modern Header */}
      <Card
        style={{
          marginBottom: "16px",
          borderRadius: "12px",
          border: "none",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <Row align="middle">
          <Col xs={24} sm={8}>
            <div>
              <Typography.Text type="secondary" style={{ fontSize: "12px" }}>
                Câu hỏi
              </Typography.Text>
              <Typography.Title
                level={5}
                style={{ margin: 0, color: "#1890ff" }}
              >
                {currentQuestion + 1}/{questions.length}
              </Typography.Title>
            </div>
          </Col>
          <Col xs={24} sm={8} style={{ textAlign: "center" }}>
            <Progress
              percent={Math.round(
                ((currentQuestion + 1) / questions.length) * 100
              )}
              strokeColor="#1890ff"
              trailColor="#f0f0f0"
              strokeWidth={6}
              showInfo={false}
              style={{ marginBottom: "4px" }}
            />
            <Typography.Text
              strong
              style={{ color: "#1890ff", fontSize: "12px" }}
            >
              {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
            </Typography.Text>
          </Col>
          <Col xs={24} sm={8} style={{ textAlign: "right" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "4px",
              }}
            >
              <Clock
                size={16}
                style={{
                  color: timeLeft <= 30 ? "#ff4d4f" : "#1890ff",
                }}
              />
              <Typography.Text
                strong
                style={{
                  color: timeLeft <= 30 ? "#ff4d4f" : "#1890ff",
                  fontSize: "14px",
                }}
              >
                {formatTime(timeLeft)}
              </Typography.Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Question Card */}
      <Row justify="center">
        <Col xs={24} sm={22} md={20} lg={16} xl={14}>
          <Card
            style={{
              borderRadius: "12px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              border: "none",
            }}
          >
            <div style={{ padding: "24px 16px" }}>
              {/* Question Header */}
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    background:
                      "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px auto",
                    boxShadow: "0 8px 24px rgba(24, 144, 255, 0.3)",
                  }}
                >
                  <HelpCircle size={20} style={{ color: "white" }} />
                </div>
                <Typography.Title level={4} style={{ marginBottom: 0 }}>
                  Nghĩa của từ này là gì?
                </Typography.Title>
              </div>

              {/* Word Section */}
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <Card
                  style={{
                    background:
                      "linear-gradient(135deg, #f0f8ff 0%, #ffffff 100%)",
                    border: "2px solid #d6e4ff",
                    borderRadius: "12px",
                    marginBottom: "16px",
                  }}
                >
                  <Typography.Title
                    level={2}
                    style={{
                      margin: "12px 0",
                      color: "#1890ff",
                      fontSize: "36px",
                      fontWeight: "700",
                    }}
                  >
                    {question.word || "Unknown"}
                  </Typography.Title>

                  {question.ipa && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "12px",
                        marginBottom: "12px",
                      }}
                    >
                      <Typography.Text
                        style={{ color: "#1890ff", fontSize: "14px" }}
                      >
                        {question.ipa}
                      </Typography.Text>
                      <Button
                        type="text"
                        shape="circle"
                        size="small"
                        icon={<Volume2 size={16} />}
                        onClick={() => playPronunciation(question.word)}
                        disabled={!question.word}
                        style={{
                          color: "#1890ff",
                          backgroundColor: "#ffffff",
                          border: "1px solid #d6e4ff",
                          boxShadow: "0 2px 4px rgba(24, 144, 255, 0.1)",
                        }}
                      />
                    </div>
                  )}
                </Card>

                {question.exampleSentence &&
                  question.exampleSentence.trim() && (
                    <Card
                      size="small"
                      style={{
                        background:
                          "linear-gradient(135deg, #fff7e6 0%, #ffffff 100%)",
                        border: "1px solid #ffd591",
                        borderRadius: "8px",
                      }}
                    >
                      <Typography.Text
                        strong
                        style={{ color: "#fa8c16", fontSize: "12px" }}
                      >
                        Ví dụ:
                      </Typography.Text>
                      <br />
                      <Typography.Text
                        style={{
                          color: "#595959",
                          fontStyle: "italic",
                          fontSize: "12px",
                        }}
                      >
                        "{question.exampleSentence}"
                      </Typography.Text>
                    </Card>
                  )}
              </div>

              {/* Options Grid */}
              <Row gutter={[12, 12]} style={{ marginBottom: "20px" }}>
                {question.options.map((option, index) => (
                  <Col span={12} key={index}>
                    <Button
                      block
                      size="large"
                      onClick={() => selectAnswer(option)}
                      style={{
                        height: "60px",
                        borderRadius: "8px",
                        border:
                          selectedAnswer === option
                            ? "2px solid #1890ff"
                            : "1px solid #d9d9d9",
                        background:
                          selectedAnswer === option
                            ? "linear-gradient(135deg, #e6f7ff 0%, #f0f8ff 100%)"
                            : "#ffffff",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        boxShadow:
                          selectedAnswer === option
                            ? "0 4px 12px rgba(24, 144, 255, 0.2)"
                            : "0 2px 4px rgba(0,0,0,0.06)",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: "6px",
                          left: "8px",
                          width: "20px",
                          height: "20px",
                          background:
                            selectedAnswer === option ? "#1890ff" : "#f0f0f0",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: "10px",
                          fontWeight: "bold",
                        }}
                      >
                        {String.fromCharCode(65 + index)}
                      </div>
                      <Typography.Text
                        style={{
                          color:
                            selectedAnswer === option ? "#1890ff" : "#262626",
                          fontWeight: selectedAnswer === option ? "600" : "400",
                          textAlign: "center",
                          paddingTop: "12px",
                          fontSize: "13px",
                        }}
                      >
                        {option}
                      </Typography.Text>
                      {selectedAnswer === option && (
                        <div
                          style={{
                            position: "absolute",
                            top: "6px",
                            right: "8px",
                          }}
                        >
                          <Check size={14} style={{ color: "#1890ff" }} />
                        </div>
                      )}
                    </Button>
                  </Col>
                ))}
              </Row>

              {/* Submit Button */}
              <div style={{ textAlign: "center" }}>
                <Button
                  type="primary"
                  size="large"
                  onClick={submitAnswer}
                  disabled={selectedAnswer === null}
                  style={{
                    borderRadius: "8px",
                    height: "40px",
                    paddingLeft: "20px",
                    paddingRight: "20px",
                    fontSize: "14px",
                    fontWeight: "600",
                    background: selectedAnswer
                      ? "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)"
                      : "#f0f0f0",
                    border: "none",
                    boxShadow: selectedAnswer
                      ? "0 4px 12px rgba(24, 144, 255, 0.3)"
                      : "none",
                  }}
                  icon={
                    currentQuestion === questions.length - 1 ? (
                      <Check size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )
                  }
                  iconPosition="end"
                >
                  {currentQuestion === questions.length - 1
                    ? "Hoàn thành bài kiểm tra"
                    : "Câu tiếp theo"}
                </Button>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Quiz;
