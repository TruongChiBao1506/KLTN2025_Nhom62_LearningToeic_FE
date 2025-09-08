import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Typography,
  Button,
  Space,
  Image,
  Tag,
  Table,
  Progress,
  message,
  Radio,
  Row,
  Col,
  Spin,
  Alert,
  Modal,
} from "antd";
import {
  Volume2,
  Mic,
  MicOff,
  BookOpen,
  Star,
  StarOff,
  RotateCcw,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ArrowRight,
  Lightbulb,
  Target,
  Trophy,
  Headphones,
  RefreshCw,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import vocabularyService from "../../../services/vocabularyService";
import vocabularyQuestionService from "../../../services/vocabularyQuestionService";
import userVocabularyService from "../../../services/userVocabularyService";
import topicService from "../../../services/topicService";

// CSS styles for flip animation
const flipCardStyles = `
  .flip-card {
    width: 100%;
    height: 400px;
    position: relative;
    perspective: 1000px;
    cursor: pointer;
  }
  
  .flip-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    text-align: center;
    transition: transform 0.8s ease-in-out;
    transform-style: preserve-3d;
  }
  
  .flip-card-inner.flipped {
    transform: rotateY(180deg);
  }
  
  .flip-card-front, .flip-card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 20px;
    box-sizing: border-box;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    transition: box-shadow 0.3s ease;
  }
  
  .flip-card:hover .flip-card-front,
  .flip-card:hover .flip-card-back {
    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
  }
  
  .flip-card-front {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
  }
  
  .flip-card-back {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    transform: rotateY(180deg);
  }
  
  .flip-card-controls {
    position: absolute;
    top: 16px;
    right: 16px;
    display: flex;
    gap: 8px;
    z-index: 10;
  }
  
  .flip-card-controls button {
    transition: transform 0.2s ease;
  }
  
  .flip-card-controls button:hover {
    transform: scale(1.1);
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  // Check if styles already exist to avoid duplication
  if (!document.getElementById('flip-card-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'flip-card-styles';
    styleElement.textContent = flipCardStyles;
    document.head.appendChild(styleElement);
  }
}

const { Title, Text } = Typography;

const VocabularyLearning = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();

  // States
  const [loading, setLoading] = useState(true);
  const [vocabularies, setVocabularies] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [topicName, setTopicName] = useState("");
  const [activeTab, setActiveTab] = useState("theory");

  // Flashcard states
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Practice states
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);

  // Game states
  const [gameStarted, setGameStarted] = useState(false);
  const [currentWord, setCurrentWord] = useState("");
  const [currentHint, setCurrentHint] = useState("");
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [correctLetters, setCorrectLetters] = useState([]);
  const [wrongLetters, setWrongLetters] = useState([]);
  const [remainingChances, setRemainingChances] = useState(6);
  const [gameResult, setGameResult] = useState("");

  // Quiz states
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showExplanations, setShowExplanations] = useState({});
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [noQuestionsMessage, setNoQuestionsMessage] = useState("");

  useEffect(() => {
    document.title = "Học từ vựng | TOEIC Learning Platform";
    
    const loadVocabularies = async () => {
      try {
        const response = await vocabularyService.getByTopicId(topicId);
        if (response && response.length > 0) {
          const vocabulariesWithStatus = response.map((item) => ({
            ...item,
            isCorrect: null,
            lowerTranscript: "",
            isBookmarked: false,
          }));
          setVocabularies(vocabulariesWithStatus);
          setTopicName(response[0].topic?.topicName || "");
          
          // Check bookmarked status
          await checkBookmarkStatus(vocabulariesWithStatus);
        }
      } catch (error) {
        console.error("Error loading vocabularies:", error);
      }
    };

    const loadQuestions = async () => {
      try {
        const response = await vocabularyQuestionService.getVocabularyQuestionsByTopic(topicId);
        if (response && response.length > 0) {
          const questionsWithState = response.map((question) => ({
            ...question,
            selectedOption: null,
            isGraded: false,
            answered: false,
          }));
          setQuestions(questionsWithState);
          setNoQuestionsMessage(""); // Reset message if questions are found
        } else {
          setQuestions([]);
          setNoQuestionsMessage("Chưa có câu hỏi nào cho chủ đề này");
        }
      } catch (error) {
        console.error("Error loading questions:", error);
        setQuestions([]);
        
        // Check if the error contains the specific message from API
        if (error.response?.data?.message === "No vocabulary questions found for this topic") {
          setNoQuestionsMessage("Chưa có câu hỏi trắc nghiệm nào cho chủ đề này");
        } else {
          setNoQuestionsMessage("Không thể tải câu hỏi. Vui lòng thử lại sau.");
        }
      }
    };

    const loadTopics = async () => {
      try {
        const response = await topicService.all();
        setTopics(response || []);
      } catch (error) {
        console.error("Error loading topics:", error);
      }
    };

    const loadData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          loadVocabularies(),
          loadQuestions(),
          loadTopics(),
        ]);
      } catch (error) {
        console.error("Error loading data:", error);
        message.error("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [topicId]);

  const checkBookmarkStatus = async (vocabList) => {
    try {
      const userVocabs = await userVocabularyService.getUserVocabularies();
      if (userVocabs && userVocabs.userVocabularies) {
        const updatedVocabs = vocabList.map((vocab) => ({
          ...vocab,
          isBookmarked: userVocabs.userVocabularies.some(
            (userVocab) => userVocab.vocabulary._id === vocab._id
          ),
        }));
        setVocabularies(updatedVocabs);
      }
    } catch (error) {
      console.error("Error checking bookmark status:", error);
    }
  };

  const getImageUrl = (vocabularyData) => {
    if (!vocabularyData) return "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop";
    
    const word = vocabularyData.word?.toLowerCase() || "";
    const topicName = vocabularyData.topic?.topicName?.toLowerCase() || "";

    const specificWordImages = {
      exchange: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
      shopping: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=300&fit=crop",
      retail: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
      business: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
      travel: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop",
      technology: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
    };

    const topicImages = {
      business: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
      travel: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop",
      technology: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
    };

    return (
      specificWordImages[word] ||
      topicImages[topicName] ||
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop"
    );
  };

  // Flashcard functions
  const nextCard = useCallback(() => {
    if (currentIndex < vocabularies.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  }, [currentIndex, vocabularies.length]);

  const previousCard = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const flipCard = useCallback(() => {
    setIsFlipped(!isFlipped);
  }, [isFlipped]);

  // Keyboard support for flashcards
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (activeTab === "theory") {
        switch(event.key) {
          case 'ArrowLeft':
            event.preventDefault();
            previousCard();
            break;
          case 'ArrowRight':
            event.preventDefault();
            nextCard();
            break;
          case ' ':
          case 'Enter':
            event.preventDefault();
            flipCard();
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [activeTab, flipCard, nextCard, previousCard]);

  // Speech functions
  const speakWord = (vocabulary) => {
    const utterance = new SpeechSynthesisUtterance(vocabulary.word);
    utterance.lang = "en-US";
    utterance.rate = 0.8;

    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(
      (voice) =>
        voice.name === "Google US English" ||
        voice.name === "Microsoft Aria Online (Natural) - English (United States)" ||
        voice.lang === "en-US"
    );

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    window.speechSynthesis.speak(utterance);
    message.success(`Đang phát âm: ${vocabulary.word}`);
  };

  const practicePronunciation = (record, index) => {
    if (isSpeaking && activeIndex === index) {
      if (window.currentRecognition) {
        window.currentRecognition.stop();
      }
      setIsSpeaking(false);
      setActiveIndex(null);
      message.info("Đã dừng thu âm");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      message.error("Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;

    setIsSpeaking(true);
    setActiveIndex(index);
    message.info("Đang thu âm... Hãy nói từ: " + record.word);

    recognition.onresult = (event) => {
      const lastResultIndex = event.results.length - 1;
      const transcriptValue = event.results[lastResultIndex][0].transcript;
      const lowerTranscript = transcriptValue.toLowerCase().trim();
      const isCorrect = lowerTranscript === record.word.toLowerCase();

      const updatedVocabularies = [...vocabularies];
      updatedVocabularies[index] = {
        ...updatedVocabularies[index],
        isCorrect,
        lowerTranscript,
      };
      setVocabularies(updatedVocabularies);

      if (isCorrect) {
        message.success(`Phát âm chính xác! 🎉`);
      } else {
        message.warning(`Phát âm chưa chính xác. Bạn nói: "${lowerTranscript}"`);
      }
    };

    recognition.onend = () => {
      setIsSpeaking(false);
      setActiveIndex(null);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      message.error("Lỗi nhận dạng giọng nói. Vui lòng thử lại.");
      setIsSpeaking(false);
      setActiveIndex(null);
    };

    recognition.start();
    window.currentRecognition = recognition;
  };

  // Bookmark functions
  const toggleBookmark = async (index) => {
    const vocabulary = vocabularies[index];
    try {
      if (vocabulary.isBookmarked) {
        await userVocabularyService.removeFromFavorites(vocabulary._id);
        message.success("Đã xóa khỏi danh sách yêu thích");
      } else {
        await userVocabularyService.addToFavorites(vocabulary._id);
        message.success("Đã thêm vào danh sách yêu thích");
      }

      const updatedVocabularies = [...vocabularies];
      updatedVocabularies[index].isBookmarked = !updatedVocabularies[index].isBookmarked;
      setVocabularies(updatedVocabularies);
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      message.error("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  // Game functions
  const startGame = () => {
    if (vocabularies.length === 0) {
      message.warning("Không có từ vựng để chơi game");
      return;
    }

    const randomVocab = vocabularies[Math.floor(Math.random() * vocabularies.length)];
    setCurrentWord(randomVocab.word.toUpperCase());
    setCurrentHint(randomVocab.meaning);
    setGuessedLetters([]);
    setCorrectLetters([]);
    setWrongLetters([]);
    setRemainingChances(6);
    setGameResult("");
    setGameStarted(true);
  };

  const guessLetter = (letter) => {
    if (guessedLetters.includes(letter)) return;

    const newGuessedLetters = [...guessedLetters, letter];
    setGuessedLetters(newGuessedLetters);

    if (currentWord.includes(letter)) {
      const newCorrectLetters = [...correctLetters, letter];
      setCorrectLetters(newCorrectLetters);

      // Check if word is complete
      const wordLetters = [...new Set(currentWord.split(""))];
      const allGuessed = wordLetters.every(l => newCorrectLetters.includes(l));
      
      if (allGuessed) {
        setGameResult("win");
        message.success("Chúc mừng! Bạn đã đoán đúng từ!");
      }
    } else {
      const newWrongLetters = [...wrongLetters, letter];
      setWrongLetters(newWrongLetters);
      const newRemainingChances = remainingChances - 1;
      setRemainingChances(newRemainingChances);

      if (newRemainingChances === 0) {
        setGameResult("lose");
        message.error(`Game over! Từ đúng là: ${currentWord}`);
      }
    }
  };

  // Quiz functions
  const selectAnswer = (questionIndex, answer) => {
    if (isSubmitted) return;
    
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answer,
    });

    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].selectedOption = answer;
    setQuestions(updatedQuestions);
  };

  const submitQuiz = () => {
    const answeredQuestions = questions.filter(q => q.selectedOption);
    
    if (answeredQuestions.length === 0) {
      message.warning("Bạn chưa trả lời bất kỳ câu nào!");
      return;
    }

    Modal.confirm({
      title: "Xác nhận nộp bài",
      content: answeredQuestions.length < questions.length 
        ? `Bạn chỉ trả lời ${answeredQuestions.length}/${questions.length} câu. Bạn có chắc muốn nộp bài?`
        : "Bạn có chắc muốn nộp bài?",
      onOk: () => {
        const updatedQuestions = questions.map(q => ({
          ...q,
          isGraded: true,
          answered: !!q.selectedOption,
        }));
        setQuestions(updatedQuestions);
        setIsSubmitted(true);

        const correctCount = updatedQuestions.filter(
          q => q.answered && q.selectedOption === q.correctOption
        ).length;
        
        message.success(`Bạn đã trả lời đúng ${correctCount}/${questions.length} câu!`);
      },
    });
  };

  const resetQuiz = () => {
    const resetQuestions = questions.map(q => ({
      ...q,
      selectedOption: null,
      isGraded: false,
      answered: false,
    }));
    setQuestions(resetQuestions);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setShowExplanations({});
  };

  const toggleExplanation = (index) => {
    setShowExplanations({
      ...showExplanations,
      [index]: !showExplanations[index],
    });
  };

  const scrollToQuestion = (index) => {
    const element = document.getElementById(`question-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "60vh" 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  const renderFlashcard = () => (
    <Card style={{ marginBottom: "24px", borderRadius: "12px" }}>
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <Title level={3}>
          <BookOpen style={{ marginRight: "8px", color: "#1890ff" }} />
          Học với Flashcard
        </Title>
        <Text type="secondary" style={{ fontSize: "14px" }}>
          💡 Phím tắt: ← → (chuyển card), Space/Enter (lật card)
        </Text>
      </div>

      {vocabularies.length > 0 && (
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div className="flip-card" onClick={flipCard}>
            <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
              {/* Front side */}
              <div className="flip-card-front">
                <div className="flip-card-controls">
                  <Button
                    type="text"
                    icon={<Volume2 size={20} />}
                    style={{ color: "white" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWord(vocabularies[currentIndex]);
                    }}
                  />
                  <Button
                    type="text"
                    icon={<Lightbulb size={20} />}
                    style={{ color: "white" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      flipCard();
                    }}
                  />
                </div>

                <Image
                  src={getImageUrl(vocabularies[currentIndex])}
                  alt="Vocabulary"
                  style={{
                    width: "200px",
                    height: "150px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    marginBottom: "20px",
                  }}
                />
                <Title level={2} style={{ color: "white", margin: 0 }}>
                  {vocabularies[currentIndex].word}
                </Title>
                <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: "16px" }}>
                  {vocabularies[currentIndex].ipa}
                </Text>
              </div>

              {/* Back side */}
              <div className="flip-card-back">
                <div className="flip-card-controls">
                  <Button
                    type="text"
                    icon={<Volume2 size={20} />}
                    style={{ color: "white" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWord(vocabularies[currentIndex]);
                    }}
                  />
                  <Button
                    type="text"
                    icon={<RotateCcw size={20} />}
                    style={{ color: "white" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      flipCard();
                    }}
                  />
                </div>

                <Title level={3} style={{ color: "#52c41a", marginBottom: "16px" }}>
                  Nghĩa:
                </Title>
                <Text style={{ color: "white", fontSize: "18px", marginBottom: "20px" }}>
                  {vocabularies[currentIndex].meaning}
                </Text>
                {vocabularies[currentIndex].exampleSentence && (
                  <>
                    <Title level={4} style={{ color: "#faad14", marginBottom: "8px" }}>
                      Ví dụ:
                    </Title>
                    <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: "16px", fontStyle: "italic" }}>
                      {vocabularies[currentIndex].exampleSentence}
                    </Text>
                  </>
                )}
              </div>
            </div>
          </div>

          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            marginTop: "20px"
          }}>
            <Button
              icon={<ArrowLeft size={16} />}
              onClick={previousCard}
              disabled={currentIndex === 0}
              style={{ borderRadius: "8px" }}
            >
              Trước
            </Button>

            <div style={{ textAlign: "center" }}>
              <Text strong style={{ fontSize: "16px" }}>
                {currentIndex + 1} / {vocabularies.length}
              </Text>
              <Progress
                percent={Math.round(((currentIndex + 1) / vocabularies.length) * 100)}
                showInfo={false}
                style={{ width: "200px", marginTop: "8px" }}
              />
            </div>

            <Button
              icon={<ArrowRight size={16} />}
              onClick={nextCard}
              disabled={currentIndex === vocabularies.length - 1}
              style={{ borderRadius: "8px" }}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </Card>
  );

  const renderPractice = () => {
    const columns = [
      {
        title: "Từ vựng",
        dataIndex: "word",
        key: "word",
        render: (text, record, index) => (
          <Text
            strong
            style={{
              color: record.isCorrect === null 
                ? "#262626" 
                : record.isCorrect 
                  ? "#52c41a" 
                  : "#ff4d4f",
              fontSize: "16px",
            }}
          >
            {text}
          </Text>
        ),
      },
      {
        title: "Hình ảnh",
        dataIndex: "image",
        key: "image",
        render: (_, record) => (
          <Image
            src={getImageUrl(record)}
            alt={record.word}
            width={60}
            height={60}
            style={{ borderRadius: "8px", objectFit: "cover" }}
          />
        ),
      },
      {
        title: "Phiên âm",
        dataIndex: "ipa",
        key: "ipa",
        render: (text) => (
          <Text code style={{ color: "#52c41a", borderRadius: "4px" }}>
            {text}
          </Text>
        ),
      },
      {
        title: "Nghĩa",
        dataIndex: "meaning",
        key: "meaning",
      },
      {
        title: "Nghe",
        key: "listen",
        render: (_, record) => (
          <Button
            type="primary"
            ghost
            icon={<Volume2 size={16} />}
            onClick={() => speakWord(record)}
            style={{ borderRadius: "6px" }}
          />
        ),
      },
      {
        title: "Luyện tập",
        key: "practice",
        render: (_, record, index) => (
          <Button
            type={isSpeaking && activeIndex === index ? "danger" : "default"}
            icon={isSpeaking && activeIndex === index ? <MicOff size={16} /> : <Mic size={16} />}
            onClick={() => practicePronunciation(record, index)}
            loading={isSpeaking && activeIndex === index}
            style={{ borderRadius: "6px" }}
          />
        ),
      },
      {
        title: "Phát âm của bạn",
        dataIndex: "lowerTranscript",
        key: "transcript",
        render: (text, record) => {
          if (!text) return <Text type="secondary">Chưa thử</Text>;
          return (
            <Space direction="vertical" size={0}>
              <Text style={{ color: record.isCorrect ? "#52c41a" : "#ff4d4f" }}>
                {text}
              </Text>
              <Tag
                color={record.isCorrect ? "success" : "error"}
                icon={record.isCorrect ? <CheckCircle size={10} /> : <XCircle size={10} />}
              >
                {record.isCorrect ? "Chính xác" : "Chưa đúng"}
              </Tag>
            </Space>
          );
        },
      },
      {
        title: "Lưu trữ",
        key: "bookmark",
        render: (_, record, index) => (
          <Button
            type="text"
            icon={record.isBookmarked ? <Star size={16} style={{ color: "#faad14" }} /> : <StarOff size={16} />}
            onClick={() => toggleBookmark(index)}
          />
        ),
      },
    ];

    return (
      <Card style={{ marginBottom: "24px", borderRadius: "12px" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <Title level={3}>
            <Headphones style={{ marginRight: "8px", color: "#1890ff" }} />
            Luyện tập phát âm
          </Title>
        </div>
        <Table
          columns={columns}
          dataSource={vocabularies}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1000 }}
        />
      </Card>
    );
  };

  const renderGame = () => (
    <Card style={{ marginBottom: "24px", borderRadius: "12px" }}>
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <Title level={3}>
          <Target style={{ marginRight: "8px", color: "#1890ff" }} />
          Trò chơi đoán từ
        </Title>
      </div>

      <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
        {!gameStarted ? (
          <div>
            <Text style={{ fontSize: "16px", marginBottom: "20px", display: "block" }}>
              Hãy đoán từ vựng dựa trên gợi ý!
            </Text>
            <Button 
              type="primary" 
              size="large" 
              onClick={startGame}
              style={{ borderRadius: "8px" }}
            >
              Bắt đầu chơi
            </Button>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                <Lightbulb size={20} style={{ color: "#faad14", marginRight: "8px" }} />
                <Text style={{ fontSize: "16px" }}>{currentHint}</Text>
              </div>
              
              <div style={{ 
                fontSize: "32px", 
                fontFamily: "monospace", 
                letterSpacing: "8px",
                marginBottom: "20px",
                color: "#1890ff"
              }}>
                {currentWord.split("").map((letter, index) => (
                  <span key={index}>
                    {correctLetters.includes(letter) ? letter : "_"}
                  </span>
                ))}
              </div>

              <div style={{ marginBottom: "20px" }}>
                <Text>Số lần sai còn lại: </Text>
                <Text strong style={{ color: remainingChances <= 2 ? "#ff4d4f" : "#52c41a" }}>
                  {remainingChances}
                </Text>
              </div>

              {gameResult && (
                <Alert
                  message={gameResult === "win" ? "Chúc mừng!" : "Game Over"}
                  description={gameResult === "win" 
                    ? "Bạn đã đoán đúng từ!" 
                    : `Từ đúng là: ${currentWord}`}
                  type={gameResult === "win" ? "success" : "error"}
                  style={{ marginBottom: "20px" }}
                />
              )}
            </div>

            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(6, 1fr)", 
              gap: "8px",
              maxWidth: "400px",
              margin: "0 auto 20px"
            }}>
              {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
                <Button
                  key={letter}
                  onClick={() => guessLetter(letter)}
                  disabled={guessedLetters.includes(letter) || gameResult}
                  style={{
                    backgroundColor: correctLetters.includes(letter) 
                      ? "#52c41a" 
                      : wrongLetters.includes(letter) 
                        ? "#ff4d4f" 
                        : undefined,
                    color: guessedLetters.includes(letter) ? "white" : undefined,
                    borderRadius: "6px",
                  }}
                >
                  {letter}
                </Button>
              ))}
            </div>

            <Button 
              type="primary" 
              icon={<RefreshCw size={16} />}
              onClick={startGame}
              style={{ borderRadius: "8px" }}
            >
              Chơi lại
            </Button>
          </div>
        )}
      </div>
    </Card>
  );

  const renderQuiz = () => {
    const correctCount = questions.filter(q => q.answered && q.selectedOption === q.correctOption).length;
    const incorrectCount = questions.filter(q => q.answered && q.selectedOption !== q.correctOption).length;

    return (
      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Card style={{ borderRadius: "12px" }}>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <Title level={3}>
                <Trophy style={{ marginRight: "8px", color: "#1890ff" }} />
                Trắc nghiệm từ vựng
              </Title>
            </div>

            {questions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <Alert
                  message="Không có câu hỏi"
                  description={noQuestionsMessage || "Chưa có câu hỏi trắc nghiệm nào cho chủ đề này"}
                  type="info"
                  showIcon
                  style={{ 
                    marginBottom: "20px",
                    borderRadius: "8px" 
                  }}
                />
                <div style={{ color: "#8c8c8c", fontSize: "14px" }}>
                  💡 Câu hỏi trắc nghiệm sẽ được thêm vào sau để bạn có thể luyện tập
                </div>
              </div>
            ) : (
              <>
                {questions.map((question, index) => (
                  <Card
                    key={question._id}
                    id={`question-${index}`}
                    style={{ 
                      marginBottom: "16px", 
                      borderRadius: "8px",
                      border: selectedAnswers[index] ? "1px solid #1890ff" : undefined
                    }}
                  >
                    <div style={{ marginBottom: "16px" }}>
                      <Tag color="blue" style={{ marginBottom: "8px" }}>
                        Câu {index + 1}
                      </Tag>
                      <Text style={{ fontSize: "16px", display: "block" }}>
                        {question.questionContent}
                      </Text>
                    </div>

                    <Radio.Group
                      value={selectedAnswers[index]}
                      onChange={(e) => selectAnswer(index, e.target.value)}
                      disabled={isSubmitted}
                      style={{ width: "100%" }}
                    >
                      <Space direction="vertical" style={{ width: "100%" }}>
                        {[question.optionA, question.optionB, question.optionC, question.optionD].map((option, optIndex) => (
                          <Radio 
                            key={optIndex} 
                            value={option}
                            style={{
                              backgroundColor: isSubmitted 
                                ? option === question.correctOption 
                                  ? "#f6ffed" 
                                  : selectedAnswers[index] === option && option !== question.correctOption
                                    ? "#fff2f0"
                                    : "transparent"
                                : "transparent",
                              padding: "8px",
                              borderRadius: "4px",
                              border: isSubmitted && option === question.correctOption ? "1px solid #52c41a" : "none"
                            }}
                          >
                            {option}
                            {isSubmitted && option === question.correctOption && (
                              <CheckCircle size={16} style={{ color: "#52c41a", marginLeft: "8px" }} />
                            )}
                            {isSubmitted && selectedAnswers[index] === option && option !== question.correctOption && (
                              <XCircle size={16} style={{ color: "#ff4d4f", marginLeft: "8px" }} />
                            )}
                          </Radio>
                        ))}
                      </Space>
                    </Radio.Group>

                    {isSubmitted && question.questionExplanation && (
                      <div style={{ marginTop: "16px" }}>
                        <Button
                          type="link"
                          onClick={() => toggleExplanation(index)}
                          style={{ padding: 0 }}
                        >
                          {showExplanations[index] ? "Ẩn giải thích" : "Xem giải thích"}
                        </Button>
                        {showExplanations[index] && (
                          <div style={{ 
                            marginTop: "8px", 
                            padding: "12px", 
                            backgroundColor: "#f9f9f9", 
                            borderRadius: "6px" 
                          }}>
                            <Text>{question.questionExplanation}</Text>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                ))}

                <div style={{ textAlign: "center" }}>
                  {!isSubmitted ? (
                    <Button 
                      type="primary" 
                      onClick={submitQuiz}
                      style={{ borderRadius: "8px" }}
                      block
                    >
                      Nộp bài
                    </Button>
                  ) : (
                    <Button 
                      icon={<RotateCcw size={16} />}
                      onClick={resetQuiz}
                      style={{ borderRadius: "8px" }}
                      block
                    >
                      Làm lại
                    </Button>
                  )}
                </div>
              </>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card style={{ position: "sticky", top: "24px", borderRadius: "12px" }}>
            <Title level={4} style={{ textAlign: "center", marginBottom: "20px" }}>
              Bảng câu hỏi
            </Title>

            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(5, 1fr)", 
              gap: "8px",
              marginBottom: "20px"
            }}>
              {questions.map((question, index) => (
                <Button
                  key={index}
                  size="small"
                  onClick={() => scrollToQuestion(index)}
                  style={{
                    backgroundColor: isSubmitted
                      ? question.answered && question.selectedOption === question.correctOption
                        ? "#52c41a"
                        : question.answered 
                          ? "#ff4d4f"
                          : "#d9d9d9"
                      : selectedAnswers[index]
                        ? "#1890ff"
                        : "#f0f0f0",
                    color: selectedAnswers[index] || (isSubmitted && question.answered) ? "white" : "black",
                    border: "none",
                    borderRadius: "4px"
                  }}
                >
                  {index + 1}
                </Button>
              ))}
            </div>

            {isSubmitted && (
              <div style={{ marginBottom: "16px", textAlign: "center" }}>
                <div style={{ marginBottom: "8px" }}>
                  <span style={{ color: "#52c41a" }}>●</span> Đúng: {correctCount}/{questions.length}
                </div>
                <div>
                  <span style={{ color: "#ff4d4f" }}>●</span> Sai: {incorrectCount}/{questions.length}
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    );
  };

  return (
    <div style={{ 
      padding: "24px", 
      background: "linear-gradient(135deg, #f0f2f5 0%, #ffffff 100%)",
      minHeight: "100vh" 
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <Title level={2} style={{ marginBottom: "8px", color: "#1890ff" }}>
          {topicName || "Học từ vựng"}
        </Title>
        <Text type="secondary" style={{ fontSize: "16px" }}>
          Học từ vựng hiệu quả với Flashcard, luyện phát âm và trắc nghiệm
        </Text>
      </div>

      {/* Tab Navigation */}
      <div style={{ 
        textAlign: "center", 
        marginBottom: "32px",
        background: "white",
        borderRadius: "12px",
        padding: "8px",
        display: "inline-flex",
        margin: "0 auto 32px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        <Button
          type={activeTab === "theory" ? "primary" : "text"}
          onClick={() => setActiveTab("theory")}
          style={{ 
            borderRadius: "8px",
            margin: "0 4px",
            fontWeight: activeTab === "theory" ? "bold" : "normal"
          }}
        >
          Lý thuyết
        </Button>
        <Button
          type={activeTab === "quiz" ? "primary" : "text"}
          onClick={() => setActiveTab("quiz")}
          style={{ 
            borderRadius: "8px",
            margin: "0 4px",
            fontWeight: activeTab === "quiz" ? "bold" : "normal"
          }}
        >
          Trắc nghiệm {questions.length > 0 && <span style={{ 
            backgroundColor: activeTab === "quiz" ? "rgba(255,255,255,0.3)" : "#1890ff",
            color: activeTab === "quiz" ? "white" : "white",
            borderRadius: "10px",
            padding: "2px 6px",
            fontSize: "12px",
            marginLeft: "4px"
          }}>
            {questions.length}
          </span>}
        </Button>
      </div>

      {/* Content */}
      {activeTab === "theory" ? (
        <div>
          {renderFlashcard()}
          {renderPractice()}
          {renderGame()}
        </div>
      ) : (
        renderQuiz()
      )}

      {/* Other Topics */}
      <Card style={{ marginTop: "32px", borderRadius: "12px" }}>
        <Title level={4} style={{ textAlign: "center", marginBottom: "20px" }}>
          <Lightbulb style={{ marginRight: "8px", color: "#faad14" }} />
          Chủ đề khác
        </Title>
        <Row gutter={[16, 16]}>
          {topics.slice(0, 6).map((topic) => (
            <Col xs={24} sm={12} md={8} lg={6} key={topic._id}>
              <Card
                hoverable
                style={{ borderRadius: "8px", textAlign: "center" }}
                onClick={() => navigate(`/learner/vocabulary-learning/${topic._id}`)}
              >
                <Text strong>{topic.topicName}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};

export default VocabularyLearning;
