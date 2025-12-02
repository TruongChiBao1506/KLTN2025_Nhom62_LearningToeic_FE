import React, { useState, useEffect, useRef } from "react";
import {
  Layout,
  Card,
  Row,
  Col,
  Typography,
  Button,
  Input,
  Avatar,
  Tag,
  Space,
  Tabs,
  Modal,
  Rate,
  Slider,
  Switch,
  Badge,
  notification,
  Spin,
  message,
} from "antd";
import {
  MessageCircle,
  Mic,
  Volume2,
  VolumeX,
  Star,
  Clock,
  Brain,
  BookOpen,
  Send,
  Play,
  Square,
  User,
} from "lucide-react";
import { io } from "socket.io-client";
import axios from "axios";

const { Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const AITutor = () => {
  const [messages, setMessages] = useState([]);
  console.log("🚀 ~ AITutor ~ messages:", messages);

  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentMode, setCurrentMode] = useState("chat");
  const [isRecording, setIsRecording] = useState(false);
  const [speakingScore, setSpeakingScore] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [difficulty, setDifficulty] = useState(1);
  const [practiceStats] = useState({
    totalSessions: 127,
    todaySessions: 8,
    averageScore: 8.5,
    streak: 15,
  });
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [socket, setSocket] = useState(null);
  const [sessionId] = useState(`ai-tutor-${Date.now()}`);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // AI Modes and Features
  const aiModes = [
    {
      key: "chat",
      label: (
        <span>
          <MessageCircle size={16} style={{ marginRight: 8 }} />
          Chat AI
        </span>
      ),
      icon: <MessageCircle />,
      description: "Trò chuyện thông minh với AI về TOEIC",
    },
    {
      key: "speaking",
      label: (
        <span>
          <Mic size={16} style={{ marginRight: 8 }} />
          Speaking Practice
        </span>
      ),
      icon: <Mic />,
      description: "Luyện nói trực tiếp với AI và nhận điểm",
    },
    {
      key: "pronunciation",
      label: (
        <span>
          <Volume2 size={16} style={{ marginRight: 8 }} />
          Pronunciation
        </span>
      ),
      icon: <Volume2 />,
      description: "Chấm điểm phát âm chi tiết",
    },
    {
      key: "grammar",
      label: (
        <span>
          <BookOpen size={16} style={{ marginRight: 8 }} />
          Grammar Coach
        </span>
      ),
      icon: <BookOpen />,
      description: "AI phân tích và sửa lỗi ngữ pháp",
    },
    {
      key: "vocabulary",
      label: (
        <span>
          <Brain size={16} style={{ marginRight: 8 }} />
          Vocabulary Master
        </span>
      ),
      icon: <Brain />,
      description: "Học từ vựng thông minh với AI",
    },
  ];

  const speakingExercises = [
    {
      id: 1,
      title: "Self Introduction",
      difficulty: 1,
      prompt:
        "Please introduce yourself in English. Tell me about your name, hobbies, and your goals for learning English.",
      timeLimit: 60,
      type: "free-speech",
    },
    {
      id: 2,
      title: "Describe a Picture",
      difficulty: 2,
      prompt:
        "Look at this workplace scene. Describe what you see, including the people, their actions, and the environment.",
      timeLimit: 45,
      type: "picture-description",
    },
    {
      id: 3,
      title: "Business Meeting",
      difficulty: 3,
      prompt:
        "You are attending a business meeting. Respond to this question: 'What are your thoughts on the new marketing strategy?'",
      timeLimit: 90,
      type: "roleplay",
    },
  ];

  // Initialize conversation and socket connection
  useEffect(() => {
    const initialMessage = {
      id: 1,
      type: "ai",
      content:
        "🎯 Xin chào! Tôi là AI Tutor thông minh của bạn. Tôi có thể giúp bạn:\n\n📚 Chat về TOEIC và giải đáp thắc mắc\n🎤 Luyện Speaking với AI scoring\n🗣️ Chấm điểm phát âm chi tiết\n📖 Phân tích ngữ pháp tự động\n🧠 Học từ vựng thông minh\n\nHãy chọn chế độ bạn muốn bắt đầu!",
      timestamp: new Date().toISOString(),
      score: null,
    };
    setMessages([initialMessage]);

    // Setup socket connection
    const newSocket = io(
      window.location.hostname === "localhost"
        ? "http://localhost:5000"
        : window.location.origin
    );
    setSocket(newSocket);

    // Socket event listeners
    newSocket.on("ai-tutor-response", (data) => {
      if (data.sessionId === sessionId) {
        const aiMessage = {
          id: Date.now(),
          type: "ai",
          content: data.text,
          timestamp: new Date(data.timestamp).toISOString(),
          source: data.source || "gemini",
          score: data.score || null,
          details: data.details || null,
        };
        setMessages((prev) => [...prev, aiMessage]);
        setIsTyping(false);

        // If it's a speaking score, show modal
        if (data.score && currentMode === "speaking") {
          setSpeakingScore(data.score);
          setShowScoreModal(true);
        }
      }
    });

    newSocket.on("ai-tutor-error", (data) => {
      if (data.sessionId === sessionId) {
        notification.error({
          message: "Lỗi AI",
          description: "Đã xảy ra lỗi khi xử lý yêu cầu. Vui lòng thử lại.",
        });
        setIsTyping(false);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [sessionId, currentMode]);

  // Debug current mode changes
  useEffect(() => {
    console.log("Current mode changed to:", currentMode);
  }, [currentMode]);

  // Speech Recognition Setup
  const initializeSpeechRecognition = () => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      notification.warning({
        message: "Không hỗ trợ",
        description: "Trình duyệt không hỗ trợ nhận diện giọng nói",
      });
      return null;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    return recognition;
  };

  // Start Voice Recording
  const startRecording = async () => {
    console.log("Attempting to start recording..."); // Debug log
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Got media stream:", stream); // Debug log

      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        console.log("Audio data available:", event.data); // Debug log
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        console.log("Recording stopped, processing audio..."); // Debug log
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        processAudioForScoring(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      notification.success({
        message: "Đang ghi âm",
        description: "Hãy bắt đầu nói...",
      });
    } catch (error) {
      console.error("Recording error:", error); // Debug log
      notification.error({
        message: "Lỗi",
        description: "Không thể truy cập microphone: " + error.message,
      });
    }
  };

  // Stop Recording
  const stopRecording = () => {
    console.log("Attempting to stop recording..."); // Debug log
    if (mediaRecorderRef.current && isRecording) {
      console.log("Stopping recorder..."); // Debug log
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      notification.info({
        message: "Đã dừng ghi âm",
        description: "Đang xử lý âm thanh...",
      });
    } else {
      console.log("No active recording to stop"); // Debug log
    }
  };

  // Process Audio for AI Scoring using real API
  const processAudioForScoring = async (audioBlob) => {
    console.log("Processing audio blob:", audioBlob);
    setIsTyping(true);

    try {
      // Convert audio blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result.split(",")[1]; // Remove data:audio/wav;base64, prefix

        if (socket?.connected) {
          // Use socket for real-time communication
          socket.emit("ai-tutor-speaking", {
            audioData: base64Audio,
            exerciseType: currentExercise?.type || "free-speech",
            prompt: currentExercise?.prompt || "General speaking practice",
            difficulty: difficulty,
            userId: "user123", // Replace with actual user ID
            sessionId,
            mode: "speaking",
          });
        } else {
          // Fallback to REST API
          const response = await axios.post("/api/ai-tutor/speaking", {
            audioData: base64Audio,
            exerciseType: currentExercise?.type || "free-speech",
            prompt: currentExercise?.prompt || "General speaking practice",
            difficulty: difficulty,
            mode: "speaking",
          });

          if (response.data.success) {
            const result = response.data.data;
            const feedbackMessage = {
              id: Date.now(),
              type: "ai",
              content: result.feedback,
              timestamp: new Date().toISOString(),
              score: result.overallScore,
              details: result.scores,
            };

            setMessages((prev) => [...prev, feedbackMessage]);
            setSpeakingScore(result.overallScore);
            setShowScoreModal(true);
            setIsTyping(false);
          } else {
            throw new Error(response.data.message || "API call failed");
          }
        }
      };
    } catch (error) {
      console.error("Error processing audio:", error);
      notification.error({
        message: "Lỗi xử lý âm thanh",
        description: "Không thể phân tích âm thanh. Vui lòng thử lại.",
      });
      setIsTyping(false);
    }
  };

  // Generate Speaking Feedback
  const generateSpeakingFeedback = (scores) => {
    const feedback = [];
    feedback.push("🎯 **Kết quả phân tích AI:**\n");
    feedback.push(
      `📊 **Điểm tổng:** ${(
        Object.values(scores).reduce((a, b) => a + b) / 4
      ).toFixed(1)}/10\n`
    );
    feedback.push("📝 **Chi tiết:**");
    feedback.push(`🗣️ Phát âm: ${scores.pronunciation}/10`);
    feedback.push(`⚡ Độ lưu loát: ${scores.fluency}/10`);
    feedback.push(`📖 Ngữ pháp: ${scores.grammar}/10`);
    feedback.push(`🧠 Từ vựng: ${scores.vocabulary}/10\n`);

    // AI Suggestions
    feedback.push("💡 **Gợi ý cải thiện:**");
    if (scores.pronunciation < 8)
      feedback.push("• Tập trung luyện phát âm các âm cuối");
    if (scores.fluency < 7)
      feedback.push("• Tăng tốc độ nói và giảm nghỉ giữa từ");
    if (scores.grammar < 8) feedback.push("• Ôn lại cấu trúc câu phức");
    if (scores.vocabulary < 8) feedback.push("• Sử dụng từ vựng đa dạng hơn");

    return feedback.join("\n");
  };

  // Send Message using real API
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    console.log("Sending message:", inputMessage, "Mode:", currentMode);

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      if (socket?.connected) {
        // Use socket for real-time communication
        socket.emit("ai-tutor-message", {
          prompt: userMessage.content,
          mode: currentMode,
          difficulty: difficulty,
          userId: "user123", // Replace with actual user ID
          sessionId,
          history: messages.slice(-10), // Send last 10 messages for context
        });
      } else {
        // Fallback to REST API
        const response = await axios.post("/api/ai-tutor/chat", {
          prompt: userMessage.content,
          mode: currentMode,
          difficulty: difficulty,
          history: messages.slice(-10),
        });

        if (response.data.success) {
          const aiMessage = {
            id: Date.now() + 1,
            type: "ai",
            content: response.data.data.text,
            timestamp: new Date().toISOString(),
            source: response.data.data.source || "gemini",
          };

          setMessages((prev) => [...prev, aiMessage]);
          setIsTyping(false);
        } else {
          throw new Error(response.data.message || "API call failed");
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      notification.error({
        message: "Lỗi gửi tin nhắn",
        description:
          "Không thể gửi tin nhắn. Vui lòng kiểm tra kết nối và thử lại.",
      });
      setIsTyping(false);
    }
  };

  // Analyze text for grammar/vocabulary using real API
  const analyzeText = async (text, analysisType) => {
    try {
      const response = await axios.post("/api/ai-tutor/analyze", {
        text: text,
        analysisType: analysisType, // "grammar" or "vocabulary"
        difficulty: difficulty,
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Analysis failed");
      }
    } catch (error) {
      console.error("Error analyzing text:", error);
      notification.error({
        message: "Lỗi phân tích",
        description: "Không thể phân tích văn bản. Vui lòng thử lại.",
      });
      return null;
    }
  };

  // Speech to Text conversion
  const convertSpeechToText = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.wav");
      formData.append("language", "en-US");

      const response = await axios.post(
        "/api/ai-tutor/speech-to-text",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        return response.data.data.transcript;
      } else {
        throw new Error(response.data.message || "Speech to text failed");
      }
    } catch (error) {
      console.error("Error converting speech to text:", error);
      notification.error({
        message: "Lỗi nhận diện giọng nói",
        description: "Không thể chuyển đổi âm thanh thành văn bản.",
      });
      return null;
    }
  };

  // Start Speaking Exercise
  const startSpeakingExercise = (exercise) => {
    console.log("Starting exercise:", exercise); // Debug log
    setCurrentExercise(exercise);
    Modal.info({
      title: `🎤 ${exercise.title}`,
      content: (
        <div>
          <p>
            <strong>Prompt:</strong> {exercise.prompt}
          </p>
          <p>
            <strong>Time limit:</strong> {exercise.timeLimit} seconds
          </p>
          <p>
            <strong>Difficulty:</strong> {"⭐".repeat(exercise.difficulty)}
          </p>
        </div>
      ),
      onOk: () => {
        console.log("Starting recording..."); // Debug log
        startRecording();
      },
    });
  };

  // Key Press Handler
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "var(--color-bg-tertiary)" }}>
      {/* Sidebar */}
      <Sider width={350} style={{ background: "var(--color-bg-primary)", padding: "20px" }}>
        <div style={{ marginBottom: "24px" }}>
          <Title level={3} style={{ margin: 0, color: "var(--color-primary)" }}>
            <Brain size={24} style={{ marginRight: 8 }} />
            AI Tutor Pro
          </Title>
          <Text type="secondary">Powered by Advanced AI</Text>
        </div>

        {/* Stats Cards */}
        <Row gutter={[12, 12]} style={{ marginBottom: "24px" }}>
          <Col span={12}>
            <Card size="small" style={{ textAlign: "center" }}>
              <div
                style={{
                  color: "var(--color-primary)",
                  fontSize: "20px",
                  fontWeight: "bold",
                }}
              >
                {practiceStats.todaySessions}
              </div>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Hôm nay
              </Text>
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" style={{ textAlign: "center" }}>
              <div
                style={{
                  color: "var(--color-success)",
                  fontSize: "20px",
                  fontWeight: "bold",
                }}
              >
                {practiceStats.averageScore}
              </div>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Điểm TB
              </Text>
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Card
          title="🚀 Quick Actions"
          size="small"
          style={{ marginBottom: "16px" }}
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            <Button
              type="primary"
              icon={<Mic />}
              block
              onClick={() => {
                console.log("Switching to speaking mode"); // Debug log
                setCurrentMode("speaking");
              }}
            >
              Start Speaking Practice
            </Button>
            <Button
              icon={<Volume2 />}
              block
              onClick={() => {
                console.log("Switching to pronunciation mode"); // Debug log
                setCurrentMode("pronunciation");
              }}
            >
              Pronunciation Check
            </Button>
            <Button
              icon={<BookOpen />}
              block
              onClick={() => {
                console.log("Switching to grammar mode"); // Debug log
                setCurrentMode("grammar");
              }}
            >
              Grammar Analysis
            </Button>
          </Space>
        </Card>

        {/* Settings */}
        <Card title="⚙️ Settings" size="small">
          <Space direction="vertical" style={{ width: "100%" }}>
            <div>
              <Text>Difficulty Level</Text>
              <Slider
                min={1}
                max={3}
                value={difficulty}
                onChange={setDifficulty}
                marks={{ 1: "Easy", 2: "Medium", 3: "Hard" }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text>Voice Response</Text>
              <Switch
                checked={voiceEnabled}
                onChange={setVoiceEnabled}
                checkedChildren={<Volume2 size={14} />}
                unCheckedChildren={<VolumeX size={14} />}
              />
            </div>
          </Space>
        </Card>
      </Sider>

      {/* Main Content */}
      <Layout>
        <Content style={{ padding: "20px" }}>
          <Tabs
            activeKey={currentMode}
            onChange={(key) => {
              console.log("Tab changed to:", key); // Debug log
              setCurrentMode(key);
            }}
            items={aiModes}
            style={{ height: "100%" }}
          />

          {/* Chat Interface */}
          {currentMode === "chat" && (
            <Card
              style={{
                height: "calc(100vh - 180px)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Messages */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "16px",
                  marginBottom: "16px",
                }}
              >
                {console.log("Rendering messages:", messages)} {/* Debug log */}
                {messages && messages.length > 0 ? (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      style={{
                        display: "flex",
                        justifyContent:
                          message.type === "user" ? "flex-end" : "flex-start",
                        marginBottom: "16px",
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "70%",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "8px",
                          flexDirection:
                            message.type === "user" ? "row-reverse" : "row",
                        }}
                      >
                        <Avatar
                          icon={message.type === "user" ? <User /> : <Brain />}
                          style={{
                            backgroundColor:
                              message.type === "user" ? "var(--color-primary)" : "var(--color-success)",
                          }}
                        />
                        <div
                          style={{
                            background:
                              message.type === "user" ? "var(--color-primary)" : "#f6f6f6",
                            color: message.type === "user" ? "var(--color-bg-primary)" : "var(--color-text-primary)",
                            padding: "12px 16px",
                            borderRadius: "12px",
                            whiteSpace: "pre-line",
                          }}
                        >
                          {message.content}
                          {message.score && (
                            <div
                              style={{
                                marginTop: "8px",
                                paddingTop: "8px",
                                borderTop: "1px solid #eee",
                              }}
                            >
                              <Badge
                                count={message.score.toFixed(1)}
                                style={{ backgroundColor: "var(--color-success)" }}
                              >
                                <Star size={16} style={{ color: "#ffa940" }} />
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <Text type="secondary">No messages yet...</Text>
                  </div>
                )}
                {isTyping && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Avatar
                      icon={<Brain />}
                      style={{ backgroundColor: "var(--color-success)" }}
                    />
                    <Spin size="small" />
                    <Text type="secondary">AI đang suy nghĩ...</Text>
                  </div>
                )}
              </div>

              {/* Input */}
              <div style={{ display: "flex", gap: "8px" }}>
                <TextArea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onPressEnter={handleKeyPress}
                  placeholder="Hỏi AI về TOEIC..."
                  rows={2}
                  style={{ flex: 1 }}
                />
                <Button
                  type="primary"
                  icon={<Send />}
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  style={{ height: "64px" }}
                />
              </div>
            </Card>
          )}

          {/* Speaking Practice */}
          {currentMode === "speaking" && (
            <Card title="🎤 Speaking Practice with AI">
              <Row gutter={[16, 16]}>
                {speakingExercises.map((exercise) => (
                  <Col xs={24} md={8} key={exercise.id}>
                    <Card
                      hoverable
                      actions={[
                        <Button
                          key="start"
                          type="primary"
                          icon={<Play />}
                          onClick={() => startSpeakingExercise(exercise)}
                        >
                          Start
                        </Button>,
                      ]}
                    >
                      <Card.Meta
                        title={
                          <Space>
                            {exercise.title}
                            <Tag
                              color={
                                exercise.difficulty === 1
                                  ? "green"
                                  : exercise.difficulty === 2
                                  ? "orange"
                                  : "red"
                              }
                            >
                              {"⭐".repeat(exercise.difficulty)}
                            </Tag>
                          </Space>
                        }
                        description={exercise.prompt.substring(0, 100) + "..."}
                      />
                      <div style={{ marginTop: "8px" }}>
                        <Clock size={14} style={{ marginRight: "4px" }} />
                        <Text type="secondary">{exercise.timeLimit}s</Text>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>

              {/* Recording Interface */}
              <Card style={{ marginTop: "16px" }} title="🎙️ Voice Recorder">
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <Button
                    type={isRecording ? "danger" : "primary"}
                    icon={isRecording ? <Square /> : <Mic />}
                    size="large"
                    onClick={isRecording ? stopRecording : startRecording}
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                    }}
                  >
                    {isRecording ? "Stop" : "Record"}
                  </Button>
                  <div style={{ marginTop: "16px" }}>
                    <Text type="secondary">
                      {isRecording
                        ? "🔴 Recording..."
                        : "Click to start recording"}
                    </Text>
                  </div>
                </div>
              </Card>
            </Card>
          )}

          {/* Pronunciation Analysis */}
          {currentMode === "pronunciation" && (
            <Card title="🗣️ Pronunciation Analysis with AI">
              <Space
                direction="vertical"
                size="large"
                style={{ width: "100%" }}
              >
                <Card size="small">
                  <Space>
                    <Avatar
                      icon={<Volume2 />}
                      style={{ backgroundColor: "var(--color-success)" }}
                    />
                    <div>
                      <Text strong>AI Pronunciation Scoring</Text>
                      <br />
                      <Text type="secondary">
                        Record yourself speaking and get detailed pronunciation
                        feedback
                      </Text>
                    </div>
                  </Space>
                </Card>

                {/* Sample Words/Phrases for Practice */}
                <Row gutter={[16, 16]}>
                  {[
                    {
                      word: "comfortable",
                      difficulty: 1,
                      phonetic: "/ˈkʌmftəbəl/",
                    },
                    {
                      word: "restaurant",
                      difficulty: 2,
                      phonetic: "/ˈrestərɑːnt/",
                    },
                    {
                      word: "presentation",
                      difficulty: 3,
                      phonetic: "/ˌpriːzenˈteɪʃən/",
                    },
                  ].map((item, index) => (
                    <Col xs={24} md={8} key={index}>
                      <Card
                        size="small"
                        hoverable
                        actions={[
                          <Button
                            key="practice"
                            type="primary"
                            icon={<Mic />}
                            onClick={() => {
                              setCurrentExercise({
                                type: "pronunciation",
                                word: item.word,
                                phonetic: item.phonetic,
                              });
                              startRecording();
                            }}
                          >
                            Practice
                          </Button>,
                        ]}
                      >
                        <div style={{ textAlign: "center" }}>
                          <Text strong style={{ fontSize: "16px" }}>
                            {item.word}
                          </Text>
                          <br />
                          <Text type="secondary">{item.phonetic}</Text>
                          <br />
                          <Tag
                            color={
                              item.difficulty === 1
                                ? "green"
                                : item.difficulty === 2
                                ? "orange"
                                : "red"
                            }
                          >
                            {"⭐".repeat(item.difficulty)}
                          </Tag>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>

                {/* Recording Interface */}
                <Card title="🎙️ Pronunciation Recorder">
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <Button
                      type={isRecording ? "danger" : "primary"}
                      icon={isRecording ? <Square /> : <Mic />}
                      size="large"
                      onClick={isRecording ? stopRecording : startRecording}
                      style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "50%",
                      }}
                    >
                      {isRecording ? "Stop" : "Record"}
                    </Button>
                    <div style={{ marginTop: "16px" }}>
                      <Text type="secondary">
                        {isRecording
                          ? "🔴 Recording pronunciation..."
                          : "Click to record your pronunciation"}
                      </Text>
                    </div>
                  </div>
                </Card>
              </Space>
            </Card>
          )}

          {/* Grammar Coach */}
          {currentMode === "grammar" && (
            <Card title="📖 Grammar Coach with AI">
              <Space
                direction="vertical"
                size="large"
                style={{ width: "100%" }}
              >
                <Card size="small">
                  <Space>
                    <Avatar
                      icon={<BookOpen />}
                      style={{ backgroundColor: "var(--color-primary)" }}
                    />
                    <div>
                      <Text strong>AI Grammar Analysis</Text>
                      <br />
                      <Text type="secondary">
                        Write sentences and get detailed grammar feedback and
                        corrections
                      </Text>
                    </div>
                  </Space>
                </Card>

                {/* Grammar Input */}
                <Card title="✍️ Write Your Sentence">
                  <TextArea
                    rows={4}
                    placeholder="Write a sentence in English for grammar analysis..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    style={{ marginBottom: "16px" }}
                  />
                  <Button
                    type="primary"
                    icon={<Send />}
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    block
                  >
                    Analyze Grammar
                  </Button>
                </Card>

                {/* Grammar Messages */}
                <Card title="💬 Grammar Analysis Results">
                  <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                    {messages
                      .filter((m) => m.type === "ai")
                      .slice(-3)
                      .map((message) => (
                        <div key={message.id} style={{ marginBottom: "16px" }}>
                          <div
                            style={{
                              background: "#f6f6f6",
                              padding: "12px 16px",
                              borderRadius: "12px",
                              whiteSpace: "pre-line",
                            }}
                          >
                            {message.content}
                          </div>
                        </div>
                      ))}
                    {isTyping && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <Spin size="small" />
                        <Text type="secondary">Analyzing grammar...</Text>
                      </div>
                    )}
                  </div>
                </Card>
              </Space>
            </Card>
          )}

          {/* Vocabulary Master */}
          {currentMode === "vocabulary" && (
            <Card title="🧠 Vocabulary Master with AI">
              <Space
                direction="vertical"
                size="large"
                style={{ width: "100%" }}
              >
                <Card size="small">
                  <Space>
                    <Avatar
                      icon={<Brain />}
                      style={{ backgroundColor: "var(--color-chart-4)" }}
                    />
                    <div>
                      <Text strong>AI Vocabulary Analysis</Text>
                      <br />
                      <Text type="secondary">
                        Enter words or sentences for comprehensive vocabulary
                        analysis
                      </Text>
                    </div>
                  </Space>
                </Card>

                {/* Quick Vocabulary Practice */}
                <Row gutter={[16, 16]}>
                  {[
                    {
                      category: "Business",
                      words: ["negotiate", "proposal", "revenue"],
                    },
                    {
                      category: "Academic",
                      words: ["analyze", "hypothesis", "methodology"],
                    },
                    {
                      category: "Daily Life",
                      words: ["convenient", "schedule", "appointment"],
                    },
                  ].map((category, index) => (
                    <Col xs={24} md={8} key={index}>
                      <Card
                        size="small"
                        title={category.category}
                        hoverable
                        onClick={() => {
                          setInputMessage(category.words.join(", "));
                        }}
                      >
                        <Space wrap>
                          {category.words.map((word, idx) => (
                            <Tag key={idx} color="blue">
                              {word}
                            </Tag>
                          ))}
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>

                {/* Vocabulary Input */}
                <Card title="📝 Enter Words or Sentences">
                  <TextArea
                    rows={3}
                    placeholder="Enter words or sentences for vocabulary analysis..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    style={{ marginBottom: "16px" }}
                  />
                  <Button
                    type="primary"
                    icon={<Send />}
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    block
                  >
                    Analyze Vocabulary
                  </Button>
                </Card>

                {/* Vocabulary Analysis Results */}
                <Card title="📊 Vocabulary Analysis Results">
                  <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                    {messages
                      .filter((m) => m.type === "ai")
                      .slice(-3)
                      .map((message) => (
                        <div key={message.id} style={{ marginBottom: "16px" }}>
                          <div
                            style={{
                              background: "#f6f6f6",
                              padding: "12px 16px",
                              borderRadius: "12px",
                              whiteSpace: "pre-line",
                            }}
                          >
                            {message.content}
                          </div>
                        </div>
                      ))}
                    {isTyping && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <Spin size="small" />
                        <Text type="secondary">Analyzing vocabulary...</Text>
                      </div>
                    )}
                  </div>
                </Card>
              </Space>
            </Card>
          )}
        </Content>
      </Layout>

      {/* Score Modal */}
      <Modal
        title="🏆 Speaking Score"
        open={showScoreModal}
        onOk={() => setShowScoreModal(false)}
        onCancel={() => setShowScoreModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowScoreModal(false)}>
            Close
          </Button>,
          <Button
            key="retry"
            type="primary"
            onClick={() => setShowScoreModal(false)}
          >
            Try Again
          </Button>,
        ]}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{ fontSize: "48px", color: "var(--color-success)", marginBottom: "16px" }}
          >
            {speakingScore.toFixed(1)}
          </div>
          <Rate disabled value={Math.floor(speakingScore / 2)} />
          <Paragraph style={{ marginTop: "16px" }}>
            Great job! Your speaking skills are improving. Keep practicing!
          </Paragraph>
        </div>
      </Modal>
    </Layout>
  );
};

export default AITutor;
