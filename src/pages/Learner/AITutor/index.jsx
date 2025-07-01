import React, { useState, useEffect } from "react";
import "./style.css";

const AITutor = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentTopic, setCurrentTopic] = useState("general");
  const [tutorPersonality, setTutorPersonality] = useState("friendly");

  // Mock conversation history
  useEffect(() => {
    const initialMessages = [
      {
        id: 1,
        type: "ai",
        content:
          "Xin chào! Tôi là AI Tutor của bạn. Tôi có thể giúp bạn học TOEIC, giải thích ngữ pháp, từ vựng và làm bài tập. Bạn muốn học gì hôm nay?",
        timestamp: new Date().toISOString(),
        avatar: "🤖",
      },
    ];
    setMessages(initialMessages);
  }, []);

  const topics = [
    { id: "general", name: "Tổng quát", icon: "💬" },
    { id: "grammar", name: "Ngữ pháp", icon: "📖" },
    { id: "vocabulary", name: "Từ vựng", icon: "📚" },
    { id: "listening", name: "Nghe", icon: "👂" },
    { id: "reading", name: "Đọc", icon: "👁️" },
    { id: "speaking", name: "Nói", icon: "🗣️" },
    { id: "writing", name: "Viết", icon: "✍️" },
  ];

  const personalities = [
    {
      id: "friendly",
      name: "Thân thiện",
      description: "Vui vẻ và khuyến khích",
    },
    {
      id: "professional",
      name: "Chuyên nghiệp",
      description: "Nghiêm túc và chi tiết",
    },
    {
      id: "patient",
      name: "Kiên nhẫn",
      description: "Giải thích chậm và rõ ràng",
    },
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = {
        grammar: [
          "Tôi sẽ giúp bạn hiểu về ngữ pháp này. Đây là một chủ đề quan trọng trong TOEIC.",
          "Hãy để tôi giải thích từng bước một cách chi tiết.",
          "Bạn có muốn tôi đưa ra ví dụ cụ thể không?",
        ],
        vocabulary: [
          "Từ vựng này thường xuất hiện trong TOEIC. Hãy cùng học nghĩa và cách sử dụng.",
          "Tôi sẽ giúp bạn ghi nhớ từ này bằng các phương pháp hiệu quả.",
          "Bạn có muốn tôi tạo câu ví dụ với từ này không?",
        ],
        listening: [
          "Kỹ năng nghe rất quan trọng trong TOEIC. Tôi sẽ đưa ra những tips hữu ích.",
          "Hãy thực hành nghe thường xuyên với các chủ đề khác nhau.",
          "Bạn có muốn tôi gợi ý một số bài tập nghe không?",
        ],
        general: [
          "Tôi hiểu câu hỏi của bạn. Hãy để tôi giải thích chi tiết.",
          "Đây là một câu hỏi hay! Tôi sẽ trả lời một cách đầy đủ nhất.",
          "Bạn có thể hỏi tôi bất cứ điều gì về TOEIC.",
        ],
      };

      const responses = aiResponses[currentTopic] || aiResponses.general;
      const randomResponse =
        responses[Math.floor(Math.random() * responses.length)];

      const aiMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: randomResponse,
        timestamp: new Date().toISOString(),
        avatar: "🤖",
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: "ai",
        content:
          "Chat đã được xóa. Bạn muốn bắt đầu cuộc trò chuyện mới về chủ đề gì?",
        timestamp: new Date().toISOString(),
        avatar: "🤖",
      },
    ]);
  };

  return (
    <div className="ai-tutor-container">
      <div className="ai-tutor-header">
        <div className="header-info">
          <h1>🤖 AI Tutor</h1>
          <p>Trợ lý AI thông minh cho việc học TOEIC</p>
        </div>
        <div className="header-controls">
          <button className="clear-chat-btn" onClick={clearChat}>
            🗑️ Xóa chat
          </button>
        </div>
      </div>

      <div className="ai-tutor-content">
        <div className="sidebar">
          <div className="sidebar-section">
            <h3>Chủ đề</h3>
            <div className="topic-list">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  className={`topic-btn ${
                    currentTopic === topic.id ? "active" : ""
                  }`}
                  onClick={() => setCurrentTopic(topic.id)}
                >
                  <span className="topic-icon">{topic.icon}</span>
                  <span className="topic-name">{topic.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Tính cách AI</h3>
            <div className="personality-list">
              {personalities.map((personality) => (
                <label key={personality.id} className="personality-item">
                  <input
                    type="radio"
                    name="personality"
                    value={personality.id}
                    checked={tutorPersonality === personality.id}
                    onChange={(e) => setTutorPersonality(e.target.value)}
                  />
                  <div className="personality-info">
                    <span className="personality-name">{personality.name}</span>
                    <span className="personality-desc">
                      {personality.description}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Thống kê</h3>
            <div className="stats">
              <div className="stat-item">
                <span className="stat-label">Tin nhắn hôm nay</span>
                <span className="stat-value">
                  {messages.filter((m) => m.type === "user").length}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Chủ đề hiện tại</span>
                <span className="stat-value">
                  {topics.find((t) => t.id === currentTopic)?.name}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="chat-area">
          <div className="messages-container">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.type}`}>
                {message.type === "ai" && (
                  <div className="message-avatar">{message.avatar}</div>
                )}
                <div className="message-content">
                  <div className="message-text">{message.content}</div>
                  <div className="message-time">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                {message.type === "user" && (
                  <div className="message-avatar">👤</div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="message ai typing">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="input-area">
            <div className="input-container">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Hỏi về ${topics
                  .find((t) => t.id === currentTopic)
                  ?.name.toLowerCase()}...`}
                rows="3"
              />
              <button
                className="send-btn"
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
              >
                📤
              </button>
            </div>
            <div className="input-hints">
              <span>
                💡 Gợi ý: "Giải thích thì hiện tại", "Từ vựng về kinh doanh",
                "Tips làm bài nghe"
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITutor;
