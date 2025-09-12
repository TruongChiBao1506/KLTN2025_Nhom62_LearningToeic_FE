import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Card,
  Typography,
  Button,
  Spin,
  message,
  Alert,
  Progress,
} from "antd";
import {
  Target,
  ArrowLeft,
  Play,
  RefreshCw,
  Lightbulb,
  Volume2,
} from "lucide-react";

// Import services
import topicService from "../../../services/topicService";
import vocabularyService from "../../../services/vocabularyService";

const { Title, Text } = Typography;

const VocabularyGame = () => {
  const { topicId } = useParams();

  // States
  const [topic, setTopic] = useState({});
  const [vocabularies, setVocabularies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Game states
  const [gameStarted, setGameStarted] = useState(false);
  const [currentWord, setCurrentWord] = useState("");
  const [currentHint, setCurrentHint] = useState("");
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [correctLetters, setCorrectLetters] = useState([]);
  const [wrongLetters, setWrongLetters] = useState([]);
  const [remainingChances, setRemainingChances] = useState(6);
  const [gameResult, setGameResult] = useState("");
  const [currentVocab, setCurrentVocab] = useState(null);
  const [score, setScore] = useState(0);
  const [totalPlayed, setTotalPlayed] = useState(0);
  const [usedVocabularies, setUsedVocabularies] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    document.title = "Trò chơi đoán từ vựng | TOEIC Learning Platform";
    
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load topic data
        const topicResponse = await topicService.getById(topicId);
        console.log("🚀 ~ loadData ~ topicResponse:", topicResponse);
        setTopic(topicResponse);

        // Load vocabularies
        const vocabResponse = await vocabularyService.getByTopicId(topicId);
        console.log("🚀 ~ loadData ~ vocabResponse:", vocabResponse);
        
        if (Array.isArray(vocabResponse) && vocabResponse.length > 0) {
          setVocabularies(vocabResponse);
        } else {
          message.warning("Chủ đề này chưa có từ vựng nào!");
        }
      } catch (error) {
        console.error("Error loading data:", error);
        message.error("Có lỗi xảy ra khi tải dữ liệu!");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [topicId]);

  // Game functions
  const getNextVocabulary = () => {
    const availableWords = vocabularies.filter((vocab, index) => !usedVocabularies.includes(index));
    
    if (availableWords.length === 0) {
      // Tất cả từ đã được sử dụng
      message.success(`🎉 Chúc mừng! Bạn đã hoàn thành tất cả ${vocabularies.length} từ vựng trong chủ đề này!`);
      setUsedVocabularies([]);
      return vocabularies[Math.floor(Math.random() * vocabularies.length)];
    }
    
    const randomIndex = Math.floor(Math.random() * availableWords.length);
    const selectedVocab = availableWords[randomIndex];
    const originalIndex = vocabularies.findIndex(vocab => vocab.id === selectedVocab.id);
    
    return { vocab: selectedVocab, originalIndex };
  };

  const startGame = () => {
    if (vocabularies.length === 0) {
      message.warning("Không có từ vựng để chơi!");
      return;
    }
    
    const nextWord = getNextVocabulary();
    const selectedVocab = nextWord.vocab || nextWord;
    const wordIndex = nextWord.originalIndex || 0;
    
    setCurrentVocab(selectedVocab);
    setCurrentWord(selectedVocab.word.toUpperCase());
    setCurrentHint(selectedVocab.meaning);
    setCurrentWordIndex(wordIndex);
    setGuessedLetters([]);
    setCorrectLetters([]);
    setWrongLetters([]);
    setRemainingChances(6);
    setGameResult("");
    setGameStarted(true);
    
    // Play sound effect (optional)
    if (typeof Audio !== 'undefined') {
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+LvwHkpBSl+zO/VfywGM'); 
        audio.volume = 0.3;
        audio.play().catch(() => {}); // Ignore errors
      } catch (e) {
        // Ignore audio errors
      }
    }
  };

  const playNextWord = () => {
    if (vocabularies.length === 0) {
      message.warning("Không có từ vựng để chơi!");
      return;
    }
    
    const nextWord = getNextVocabulary();
    const selectedVocab = nextWord.vocab || nextWord;
    const wordIndex = nextWord.originalIndex || 0;
    
    // Thêm từ hiện tại vào danh sách đã sử dụng
    if (!usedVocabularies.includes(currentWordIndex)) {
      setUsedVocabularies(prev => [...prev, currentWordIndex]);
    }
    
    setCurrentVocab(selectedVocab);
    setCurrentWord(selectedVocab.word.toUpperCase());
    setCurrentHint(selectedVocab.meaning);
    setCurrentWordIndex(wordIndex);
    setGuessedLetters([]);
    setCorrectLetters([]);
    setWrongLetters([]);
    setRemainingChances(6);
    setGameResult("");
  };

  const guessLetter = (letter) => {
    if (guessedLetters.includes(letter) || gameResult) return;

    const newGuessedLetters = [...guessedLetters, letter];
    setGuessedLetters(newGuessedLetters);

    if (currentWord.includes(letter)) {
      const newCorrectLetters = [...correctLetters, letter];
      setCorrectLetters(newCorrectLetters);
      
      // Check if word is complete
      const isComplete = currentWord.split("").every(char => newCorrectLetters.includes(char));
      if (isComplete) {
        setGameResult("win");
        setScore(prev => prev + 1);
        setTotalPlayed(prev => prev + 1);
        
        // Thêm từ hiện tại vào danh sách đã sử dụng
        if (!usedVocabularies.includes(currentWordIndex)) {
          setUsedVocabularies(prev => [...prev, currentWordIndex]);
        }
        
        message.success("🎉 Chúc mừng! Bạn đã đoán đúng!");
        
        // Play success sound
        if (typeof Audio !== 'undefined') {
          try {
            const audio = new Audio('data:audio/wav;base64,UklGRlgBAABXQVZFZm10IBAAAAABAAEAgD4AAIA+AAABAAgAZGF0YQAAAAA=');
            audio.volume = 0.5;
            audio.play().catch(() => {});
          } catch (e) {}
        }
      }
    } else {
      const newWrongLetters = [...wrongLetters, letter];
      setWrongLetters(newWrongLetters);
      const newRemainingChances = remainingChances - 1;
      setRemainingChances(newRemainingChances);
      
      if (newRemainingChances === 0) {
        setGameResult("lose");
        setTotalPlayed(prev => prev + 1);
        message.error("😅 Game Over! Hãy thử lại!");
      }
    }
  };

  // Play pronunciation
  const playPronunciation = (word) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    } else {
      message.info("Trình duyệt không hỗ trợ phát âm!");
    }
  };

  const resetStats = () => {
    setScore(0);
    setTotalPlayed(0);
    setUsedVocabularies([]);
    setCurrentWordIndex(0);
    setGameStarted(false);
    setGameResult("");
  };

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      }}>
        <Spin size="large" style={{ color: "white" }} />
      </div>
    );
  }

  if (vocabularies.length === 0) {
    return (
      <div style={{ 
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "40px 20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <Card style={{ 
          maxWidth: "500px", 
          textAlign: "center",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
        }}>
          <Title level={3} style={{ color: "#667eea", marginBottom: "16px" }}>
            <Target size={32} style={{ marginRight: "12px" }} />
            Chưa có từ vựng
          </Title>
          <Text style={{ fontSize: "16px", marginBottom: "24px", display: "block" }}>
            Chủ đề này chưa có từ vựng nào để chơi game.
          </Text>
          <Link to={`/learner/topic/${topicId}`}>
            <Button type="primary" icon={<ArrowLeft size={16} />}>
              Quay lại chủ đề
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      padding: "10px"
    }}>
      {/* Header - Compact */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "15px",
        maxWidth: "1200px",
        margin: "0 auto 15px",
        background: "white",
        borderRadius: "12px",
        padding: "12px 20px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        border: "1px solid rgba(255,255,255,0.2)"
      }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Link 
            to={`/learner/topic/${topicId}`}
            style={{ 
              color: "#667eea", 
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              marginRight: "15px",
              background: "rgba(102,126,234,0.1)",
              padding: "6px 12px",
              borderRadius: "8px",
              transition: "all 0.3s ease"
            }}
          >
            <ArrowLeft size={16} style={{ marginRight: "6px" }} />
            Quay lại
          </Link>
          <Title level={3} style={{ 
            color: "#2c3e50", 
            margin: 0,
            fontSize: "18px"
          }}>
            🎯 Trò chơi đoán từ vựng
          </Title>
        </div>
        
        {/* Stats - Compact */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ 
            textAlign: "center",
            background: "white",
            padding: "6px 12px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
          }}>
            <Text style={{ color: "#8c8c8c", fontSize: "11px", display: "block" }}>Điểm</Text>
            <Text style={{ color: "#52c41a", fontSize: "16px", fontWeight: "bold" }}>{score}</Text>
          </div>
          <div style={{ 
            textAlign: "center",
            background: "white",
            padding: "6px 12px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
          }}>
            <Text style={{ color: "#8c8c8c", fontSize: "11px", display: "block" }}>Đã chơi</Text>
            <Text style={{ color: "#faad14", fontSize: "16px", fontWeight: "bold" }}>
              {usedVocabularies.length}/{vocabularies.length}
            </Text>
          </div>
          <div style={{ 
            textAlign: "center",
            background: "white",
            padding: "6px 12px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
          }}>
            <Text style={{ color: "#8c8c8c", fontSize: "11px", display: "block" }}>Tỷ lệ</Text>
            <Text style={{ color: "#1890ff", fontSize: "16px", fontWeight: "bold" }}>
              {totalPlayed > 0 ? Math.round((score / totalPlayed) * 100) : 0}%
            </Text>
          </div>
        </div>
      </div>

      {/* Game Content - Compact */}
      <div style={{ 
        maxWidth: "1000px", 
        margin: "0 auto", 
        textAlign: "center"
      }}>
        <Card style={{ 
          borderRadius: "16px",
          background: "white",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          border: "1px solid rgba(102,126,234,0.1)",
          padding: "20px",
          position: "relative",
          overflow: "hidden",
          minHeight: "calc(60vh - 120px)" // Fit in remaining screen space
        }}>
          {/* Decorative background elements */}
          <div style={{
            position: "absolute",
            top: "-50px",
            right: "-50px",
            width: "200px",
            height: "200px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "50%",
            opacity: 0.05,
            zIndex: 0
          }} />
          <div style={{
            position: "absolute",
            bottom: "-30px",
            left: "-30px",
            width: "150px",
            height: "150px",
            background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
            borderRadius: "50%",
            opacity: 0.05,
            zIndex: 0
          }} />
          
          <div style={{ position: "relative", zIndex: 1 }}>
            {!gameStarted ? (
              <div style={{ padding: "20px 0" }}>
                <Title level={3} style={{ 
                  color: "#2c3e50", 
                  marginBottom: "15px",
                  fontSize: "24px",
                  fontWeight: "bold"
                }}>
                  Hãy đoán từ vựng dựa trên gợi ý!
                </Title>
                <Text style={{ 
                  fontSize: "16px", 
                  color: "#7f8c8d",
                  marginBottom: "20px", 
                  display: "block"
                }}>
                  Chủ đề: <strong style={{ color: "#667eea" }}>{topic.topicName}</strong> • {vocabularies.length} từ vựng
                </Text>
                <Button 
                  type="primary" 
                  size="large" 
                  onClick={startGame}
                  style={{ 
                    borderRadius: "12px",
                    fontSize: "16px",
                    padding: "12px 32px",
                    height: "auto",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                    boxShadow: "0 6px 16px rgba(102,126,234,0.4)",
                    transform: "translateY(0)",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 8px 20px rgba(102,126,234,0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 6px 16px rgba(102,126,234,0.4)";
                  }}
                >
                  <Play size={20} style={{ marginRight: "8px" }} />
                  Bắt đầu chơi
                </Button>
                
                {totalPlayed > 0 && (
                  <div style={{ marginTop: "15px" }}>
                    <Button onClick={resetStats} type="link" style={{ color: "#667eea", fontSize: "14px" }}>
                      Đặt lại thống kê
                    </Button>
                  </div>
                )}
              </div>
            ) : (
            <div style={{ height: "calc(100vh - 200px)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              {/* Topic info - Compact */}
              <div style={{ marginBottom: "10px" }}>
                <Text style={{ 
                  fontSize: "14px", 
                  color: "#7f8c8d",
                  display: "block"
                }}>
                  Chủ đề: <strong style={{ color: "#667eea" }}>{topic.topicName}</strong> • 
                  Từ thứ <strong style={{ color: "#52c41a" }}>{usedVocabularies.length + 1}</strong>/{vocabularies.length}
                </Text>
              </div>

              {/* Top Section: Hint + Word + Lives in compact layout */}
              <div style={{ flex: "0 0 auto" }}>
                {/* Hint Section - Compact */}
                <div style={{ 
                  marginBottom: "15px",
                  padding: "15px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "12px",
                  color: "white",
                  boxShadow: "0 6px 16px rgba(102,126,234,0.3)"
                }}>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    marginBottom: "8px",
                    flexWrap: "wrap"
                  }}>
                    <Lightbulb size={20} style={{ marginRight: "8px" }} />
                    <Text style={{ 
                      fontSize: "16px", 
                      color: "white", 
                      fontWeight: "bold" 
                    }}>
                      GỢI Ý
                    </Text>
                  </div>
                  <Text style={{ 
                    fontSize: "18px", 
                    color: "white", 
                    fontWeight: "bold",
                    textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                    display: "block",
                    lineHeight: "1.3"
                  }}>
                    {currentHint}
                  </Text>
                </div>

                {/* Word Display + Lives + Pronunciation in one row */}
                <div style={{ 
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "15px",
                  flexWrap: "wrap",
                  gap: "15px",
                  position: "relative"
                }}>
                  {/* Word Display - Centered */}
                  <div style={{ 
                    fontSize: "clamp(24px, 4vw, 36px)", 
                    fontFamily: "monospace", 
                    letterSpacing: "clamp(4px, 1vw, 12px)",
                    color: "#52c41a",
                    fontWeight: "bold",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
                    textAlign: "center",
                    width: "100%",
                    marginBottom: "10px"
                  }}>
                    {currentWord.split("").map((letter, index) => (
                      <span key={index}>
                        {correctLetters.includes(letter) ? letter : "_"}
                      </span>
                    ))}
                  </div>

                  {/* Lives & Pronunciation - Below word */}
                  <div style={{ 
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "15px",
                    flexWrap: "wrap",
                    width: "100%"
                  }}>
                    <div style={{ 
                      padding: "8px 12px",
                      background: remainingChances <= 2 ? "rgba(255,77,79,0.1)" : "rgba(82,196,26,0.1)",
                      borderRadius: "8px",
                      border: `2px solid ${remainingChances <= 2 ? "#ff4d4f" : "#52c41a"}`,
                      whiteSpace: "nowrap"
                    }}>
                      <Text style={{ fontSize: "14px", color: "#2c3e50" }}>
                        ❤️ 
                      </Text>
                      <Text strong style={{ 
                        fontSize: "18px",
                        color: remainingChances <= 2 ? "#ff4d4f" : "#52c41a",
                        marginLeft: "4px"
                      }}>
                        {remainingChances}
                      </Text>
                    </div>
                    
                    {currentVocab && (
                      <Button
                        type="primary"
                        icon={<Volume2 size={16} />}
                        onClick={() => playPronunciation(currentVocab.word)}
                        style={{
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          border: "none",
                          borderRadius: "8px",
                          padding: "6px 12px",
                          height: "auto",
                          fontSize: "12px"
                        }}
                      >
                        Phát âm
                      </Button>
                    )}
                  </div>
                </div>

                {/* Progress */}
                <div style={{ marginBottom: "15px" }}>
                  <Progress 
                    percent={Math.round(((currentWord.length - (currentWord.split("").filter(char => !correctLetters.includes(char)).length)) / currentWord.length) * 100)}
                    strokeColor={{
                      '0%': '#667eea',
                      '100%': '#52c41a',
                    }}
                    trailColor="rgba(0,0,0,0.1)"
                    size="small"
                  />
                </div>
              </div>

              {/* Game Result - Compact */}
              {gameResult && (
                <Alert
                  message={gameResult === "win" ? "🎉 Chúc mừng!" : "😅 Game Over"}
                  description={
                    <div style={{ fontSize: "14px" }}>
                      <div>{gameResult === "win" 
                        ? "Bạn đã đoán đúng từ vựng!" 
                        : `Từ đúng là: ${currentWord}`}
                      </div>
                      {currentVocab && currentVocab.ipa && (
                        <div style={{ marginTop: "5px" }}>
                          <strong>Phiên âm:</strong> {currentVocab.ipa}
                        </div>
                      )}
                      
                      {/* Action buttons trong alert */}
                      <div style={{ 
                        marginTop: "12px", 
                        display: "flex", 
                        gap: "8px", 
                        justifyContent: "center",
                        flexWrap: "wrap"
                      }}>
                        {gameResult === "win" && (
                          <Button 
                            type="primary" 
                            size="small"
                            icon={<RefreshCw size={14} />}
                            onClick={playNextWord}
                            style={{ 
                              borderRadius: "6px",
                              fontSize: "13px",
                              background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                              border: "none"
                            }}
                          >
                            Từ tiếp theo
                          </Button>
                        )}
                        
                        {gameResult === "lose" && (
                          <Button 
                            type="primary" 
                            size="small"
                            icon={<RefreshCw size={14} />}
                            onClick={playNextWord}
                            style={{ 
                              borderRadius: "6px",
                              fontSize: "13px",
                              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              border: "none"
                            }}
                          >
                            Thử từ khác
                          </Button>
                        )}
                        
                        {usedVocabularies.length === vocabularies.length && (
                          <Button 
                            size="small"
                            icon={<RefreshCw size={14} />}
                            onClick={() => {
                              setUsedVocabularies([]);
                              playNextWord();
                            }}
                            style={{ 
                              borderRadius: "6px",
                              fontSize: "13px",
                              background: "linear-gradient(135deg, #fa8c16 0%, #faad14 100%)",
                              border: "none",
                              color: "white"
                            }}
                          >
                            Chơi lại tất cả
                          </Button>
                        )}
                      </div>
                    </div>
                  }
                  type={gameResult === "win" ? "success" : "error"}
                  style={{ 
                    marginBottom: "15px",
                    borderRadius: "8px",
                    fontSize: "14px"
                  }}
                  showIcon
                />
              )}

              {/* Middle Section: Alphabet Grid - Compact */}
              <div style={{ flex: "1 1 auto", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fit, minmax(35px, 1fr))", 
                  gap: "6px",
                  maxWidth: "650px",
                  margin: "0 auto 15px",
                  padding: "15px",
                  background: "linear-gradient(135deg, rgba(102,126,234,0.06) 0%, rgba(67,233,123,0.06) 100%)",
                  borderRadius: "12px",
                  border: "1px solid rgba(102,126,234,0.1)"
                }}>
                  {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
                    <Button
                      key={letter}
                      size="small"
                      onClick={() => guessLetter(letter)}
                      disabled={guessedLetters.includes(letter) || gameResult}
                      style={{
                        height: "35px",
                        fontSize: "14px",
                        fontWeight: "bold",
                        borderRadius: "6px",
                        backgroundColor: correctLetters.includes(letter) 
                          ? "#52c41a" 
                          : wrongLetters.includes(letter) 
                            ? "#ff4d4f" 
                            : "white",
                        color: guessedLetters.includes(letter) ? "white" : "#2c3e50",
                        border: guessedLetters.includes(letter) 
                          ? "1px solid transparent" 
                          : "1px solid rgba(102,126,234,0.2)",
                        boxShadow: guessedLetters.includes(letter) 
                          ? "0 2px 6px rgba(0,0,0,0.15)" 
                          : "0 1px 4px rgba(0,0,0,0.08)",
                        transition: "all 0.2s ease",
                        cursor: guessedLetters.includes(letter) || gameResult ? "not-allowed" : "pointer"
                      }}
                    >
                      {letter}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Bottom Section: Action Buttons - Only show when game is ongoing */}
              {!gameResult && (
                <div style={{ 
                  display: "flex",
                  justifyContent: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                  flex: "0 0 auto"
                }}>
                  <Button 
                    type="primary" 
                    size="middle"
                    icon={<RefreshCw size={16} />}
                    onClick={playNextWord}
                    style={{ 
                      borderRadius: "8px",
                      fontSize: "14px",
                      padding: "8px 16px",
                      height: "auto",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      border: "none"
                    }}
                  >
                    Từ tiếp theo
                  </Button>
                  
                  {usedVocabularies.length === vocabularies.length && (
                    <Button 
                      type="default" 
                      size="middle"
                      icon={<RefreshCw size={16} />}
                      onClick={() => {
                        setUsedVocabularies([]);
                        playNextWord();
                      }}
                      style={{ 
                        borderRadius: "8px",
                        fontSize: "14px",
                        padding: "8px 16px",
                        height: "auto",
                        background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                        border: "none",
                        color: "white"
                      }}
                    >
                      Chơi lại tất cả
                    </Button>
                  )}
                  
                  <Button 
                    size="middle"
                    onClick={() => setGameStarted(false)}
                    style={{ 
                      borderRadius: "8px",
                      fontSize: "14px",
                      padding: "8px 16px",
                      height: "auto"
                    }}
                  >
                    Dừng chơi
                  </Button>
                </div>
              )}
              
              {/* Always show quit button */}
              {gameResult && (
                <div style={{ 
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "10px"
                }}>
                  <Button 
                    size="middle"
                    onClick={() => setGameStarted(false)}
                    style={{ 
                      borderRadius: "8px",
                      fontSize: "14px",
                      padding: "8px 16px",
                      height: "auto"
                    }}
                  >
                    Dừng chơi
                  </Button>
                </div>
              )}
            </div>
          )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VocabularyGame;
