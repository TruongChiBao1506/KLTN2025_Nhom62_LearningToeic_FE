import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRobot,
  faPaperPlane,
  faUser,
  faMicrophone,
  faStop,
  faVolumeUp,
  faSpinner,
  faLightbulb,
  faBook,
  faQuestionCircle,
  faChartLine,
  faClock,
  faLanguage,
  faFileAlt,
  faRefresh,
  faSave
} from '@fortawesome/free-solid-svg-icons';
import './AITutor.css';

const AITutor = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Xin chào! Tôi là AI Gia sư TOEIC của bạn. Tôi có thể giúp bạn:',
      timestamp: new Date(),
      suggestions: [
        'Giải thích ngữ pháp',
        'Luyện từ vựng',
        'Phân tích đề thi',
        'Tư vấn lộ trình học'
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentTopic, setCurrentTopic] = useState('general');
  const [userLevel, setUserLevel] = useState('intermediate');
  const [sessionStats, setSessionStats] = useState({
    questionsAsked: 0,
    topicsDiscussed: [],
    sessionTime: 0
  });
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionStats(prev => ({
        ...prev,
        sessionTime: prev.sessionTime + 1
      }));
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Speech Recognition Setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'vi-VN';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
    }
  }, []);

  // AI Response Generator (simulated)
  const generateAIResponse = async (message, topic) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const responses = {
      grammar: {
        present_perfect: "Present Perfect được dùng để diễn tả hành động đã xảy ra trong quá khứ nhưng có liên quan đến hiện tại. Cấu trúc: S + have/has + V3/ed. Ví dụ: 'I have studied English for 5 years.'",
        past_simple: "Past Simple diễn tả hành động đã hoàn thành trong quá khứ. Cấu trúc: S + V2/ed. Ví dụ: 'I studied English yesterday.'",
        future: "Có nhiều cách diễn tả tương lai: will + V, be going to + V, Present Continuous for future plans. Mỗi cách có ngữ cảnh sử dụng riêng."
      },
      vocabulary: {
        business: "Từ vựng business quan trọng: meeting (cuộc họp), deadline (hạn chót), proposal (đề xuất), budget (ngân sách), profit (lợi nhuận)...",
        travel: "Từ vựng du lịch: accommodation (chỗ ở), itinerary (lịch trình), departure (khởi hành), arrival (đến nơi), luggage (hành lý)..."
      },
      reading: {
        strategies: "Chiến lược đọc hiểu TOEIC: 1) Đọc lướt để nắm ý chính, 2) Tìm từ khóa trong câu hỏi, 3) Quét văn bản tìm thông tin cụ thể, 4) Chú ý đến từ đồng nghĩa và paraphrase.",
        time_management: "Quản lý thời gian Part 7: Dành 1 phút cho single passage, 2-3 phút cho double passage, 4-5 phút cho triple passage."
      },
      listening: {
        tips: "Mẹo nghe hiểu: 1) Đọc trước câu hỏi và đáp án, 2) Tập trung vào từ khóa, 3) Chú ý ngữ điệu và nhấn mạnh, 4) Đừng bỏ lỡ thông tin đầu đoạn hội thoại.",
        practice: "Luyện nghe hiệu quả: Nghe podcast tiếng Anh, xem phim có phụ đề, shadowing technique, dictation practice."
      }
    };

    // Simple keyword matching for demo
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('ngữ pháp') || lowerMessage.includes('grammar')) {
      if (lowerMessage.includes('present perfect')) return responses.grammar.present_perfect;
      if (lowerMessage.includes('past') || lowerMessage.includes('quá khứ')) return responses.grammar.past_simple;
      if (lowerMessage.includes('future') || lowerMessage.includes('tương lai')) return responses.grammar.future;
      return "Ngữ pháp nào bạn muốn học? Tôi có thể giải thích về các thì, cấu trúc câu, hoặc các điểm ngữ pháp khó trong TOEIC.";
    }
    
    if (lowerMessage.includes('từ vựng') || lowerMessage.includes('vocabulary')) {
      if (lowerMessage.includes('business') || lowerMessage.includes('kinh doanh')) return responses.vocabulary.business;
      if (lowerMessage.includes('travel') || lowerMessage.includes('du lịch')) return responses.vocabulary.travel;
      return "Bạn muốn học từ vựng theo chủ đề nào? Business, Travel, Daily Life, hay Healthcare?";
    }
    
    if (lowerMessage.includes('reading') || lowerMessage.includes('đọc')) {
      if (lowerMessage.includes('strategy') || lowerMessage.includes('chiến lược')) return responses.reading.strategies;
      if (lowerMessage.includes('time') || lowerMessage.includes('thời gian')) return responses.reading.time_management;
      return "Tôi có thể giúp bạn cải thiện kỹ năng đọc hiểu qua các chiến lược làm bài và quản lý thời gian hiệu quả.";
    }
    
    if (lowerMessage.includes('listening') || lowerMessage.includes('nghe')) {
      if (lowerMessage.includes('tip') || lowerMessage.includes('mẹo')) return responses.listening.tips;
      if (lowerMessage.includes('practice') || lowerMessage.includes('luyện')) return responses.listening.practice;
      return "Kỹ năng nghe hiểu rất quan trọng trong TOEIC. Tôi có thể chia sẻ các mẹo và bài tập luyện nghe hiệu quả.";
    }
    
    if (lowerMessage.includes('điểm') || lowerMessage.includes('score')) {
      return "Để cải thiện điểm TOEIC, bạn cần: 1) Xác định điểm yếu qua mock test, 2) Luyện tập có hệ thống, 3) Học từ vựng theo chủ đề, 4) Thực hành đề thi thường xuyên. Bạn đang ở mức điểm nào?";
    }
    
    if (lowerMessage.includes('lộ trình') || lowerMessage.includes('plan')) {
      return `Dựa trên level ${userLevel} của bạn, tôi đề xuất lộ trình 3 tháng: Tháng 1 - Củng cố nền tảng từ vựng và ngữ pháp, Tháng 2 - Luyện kỹ năng từng Part, Tháng 3 - Làm đề thi thực chiến và đánh giá. Bạn có muốn chi tiết hơn không?`;
    }

    // Default responses
    const defaultResponses = [
      "Đây là một câu hỏi thú vị! Dựa trên kinh nghiệm dạy TOEIC, tôi khuyên bạn nên...",
      "Để trả lời câu hỏi này một cách chính xác, tôi cần hiểu rõ hơn về trình độ hiện tại của bạn...",
      "Trong TOEIC, vấn đề này thường xuất hiện ở Part... Hãy cùng tôi phân tích nhé!",
      "Tôi có thể giúp bạn với vấn đề này. Trước tiên, chúng ta hãy xem xét các khái niệm cơ bản..."
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  // Handle sending message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Update stats
    setSessionStats(prev => ({
      ...prev,
      questionsAsked: prev.questionsAsked + 1,
      topicsDiscussed: [...new Set([...prev.topicsDiscussed, currentTopic])]
    }));

    try {
      const aiResponse = await generateAIResponse(inputMessage, currentTopic);
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
        suggestions: generateSuggestions(currentTopic)
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'Xin lỗi, tôi gặp sự cố kỹ thuật. Vui lòng thử lại sau.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate contextual suggestions
  const generateSuggestions = (topic) => {
    const suggestions = {
      grammar: ['Giải thích thì hiện tại hoàn thành', 'So sánh Past Simple vs Present Perfect', 'Cách dùng Modal Verbs'],
      vocabulary: ['Học từ vựng Business', 'Từ vựng Part 1 - Pictures', 'Phrasal Verbs thường gặp'],
      reading: ['Chiến lược skimming & scanning', 'Cách làm câu hỏi inference', 'Time management tips'],
      listening: ['Luyện nghe Part 2', 'Cách nghe keywords', 'Accent recognition'],
      general: ['Tạo lộ trình học 3 tháng', 'Đánh giá trình độ hiện tại', 'Mẹo thi TOEIC hiệu quả']
    };
    
    return suggestions[topic] || suggestions.general;
  };

  // Handle voice input
  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Trình duyệt không hỗ trợ nhận diện giọng nói');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  };

  // Text to speech
  const handleTextToSpeech = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      speechSynthesis.speak(utterance);
    }
  };

  // Save conversation
  const handleSaveConversation = () => {
    const conversation = messages.map(msg => 
      `${msg.type === 'user' ? 'Bạn' : 'AI'}: ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([conversation], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-tutor-conversation-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Clear conversation
  const handleClearConversation = () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ cuộc trò chuyện?')) {
      setMessages([messages[0]]); // Keep initial message
      setSessionStats({
        questionsAsked: 0,
        topicsDiscussed: [],
        sessionTime: 0
      });
    }
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="ai-tutor-container">
      {/* Header */}
      <div className="ai-tutor-header">
        <div className="tutor-info">
          <div className="tutor-avatar">
            <FontAwesomeIcon icon={faRobot} className="tutor-icon" />
          </div>
          <div className="tutor-details">
            <h1>AI Gia sư TOEIC</h1>
            <p>Trợ lý học tập thông minh • Hỗ trợ 24/7</p>
          </div>
        </div>
        
        <div className="session-stats">
          <div className="stat-item">
            <FontAwesomeIcon icon={faQuestionCircle} />
            <span>{sessionStats.questionsAsked} câu hỏi</span>
          </div>
          <div className="stat-item">
            <FontAwesomeIcon icon={faClock} />
            <span>{formatTime(sessionStats.sessionTime)}</span>
          </div>
          <div className="stat-item">
            <FontAwesomeIcon icon={faBook} />
            <span>{sessionStats.topicsDiscussed.length} chủ đề</span>
          </div>
        </div>
      </div>

      {/* Topic Selector */}
      <div className="topic-selector">
        <div className="topic-tabs">
          {[
            { key: 'general', label: 'Tổng quát', icon: faLightbulb },
            { key: 'grammar', label: 'Ngữ pháp', icon: faLanguage },
            { key: 'vocabulary', label: 'Từ vựng', icon: faBook },
            { key: 'reading', label: 'Đọc hiểu', icon: faFileAlt },
            { key: 'listening', label: 'Nghe hiểu', icon: faVolumeUp },
            { key: 'strategy', label: 'Chiến lược', icon: faChartLine }
          ].map(topic => (
            <button
              key={topic.key}
              className={`topic-tab ${currentTopic === topic.key ? 'active' : ''}`}
              onClick={() => setCurrentTopic(topic.key)}
            >
              <FontAwesomeIcon icon={topic.icon} />
              {topic.label}
            </button>
          ))}
        </div>
        
        <div className="level-selector">
          <select 
            value={userLevel} 
            onChange={(e) => setUserLevel(e.target.value)}
            className="level-dropdown"
          >
            <option value="beginner">Beginner (0-400)</option>
            <option value="intermediate">Intermediate (400-700)</option>
            <option value="advanced">Advanced (700-900)</option>
            <option value="expert">Expert (900+)</option>
          </select>
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        <div className="messages-container">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-avatar">
                <FontAwesomeIcon 
                  icon={message.type === 'user' ? faUser : faRobot} 
                />
              </div>
              <div className="message-content">
                <div className="message-text">
                  {message.content}
                </div>
                <div className="message-meta">
                  <span className="message-time">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                  {message.type === 'ai' && (
                    <button 
                      className="tts-button"
                      onClick={() => handleTextToSpeech(message.content)}
                      title="Đọc to"
                    >
                      <FontAwesomeIcon icon={faVolumeUp} />
                    </button>
                  )}
                </div>
                {message.suggestions && (
                  <div className="message-suggestions">
                    <div className="suggestions-title">Gợi ý câu hỏi:</div>
                    <div className="suggestions-list">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          className="suggestion-chip"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message ai">
              <div className="message-avatar">
                <FontAwesomeIcon icon={faRobot} />
              </div>
              <div className="message-content">
                <div className="message-text loading">
                  <FontAwesomeIcon icon={faSpinner} className="spinner" />
                  Đang suy nghĩ...
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="input-area">
        <div className="input-container">
          <div className="input-group">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Hỏi AI gia sư về TOEIC..."
              className="message-input"
              disabled={isLoading}
            />
            
            <button
              className={`voice-button ${isListening ? 'listening' : ''}`}
              onClick={handleVoiceInput}
              title="Nhập bằng giọng nói"
            >
              <FontAwesomeIcon icon={isListening ? faStop : faMicrophone} />
            </button>
            
            <button
              className="send-button"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
            >
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </div>
        </div>
        
        <div className="chat-actions">
          <button className="action-button" onClick={handleSaveConversation}>
            <FontAwesomeIcon icon={faSave} />
            Lưu cuộc trò chuyện
          </button>
          <button className="action-button" onClick={handleClearConversation}>
            <FontAwesomeIcon icon={faRefresh} />
            Bắt đầu mới
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <div className="quick-actions-title">Câu hỏi nhanh:</div>
        <div className="quick-buttons">
          {[
            'Làm thế nào để đạt 800+ TOEIC?',
            'Giải thích ngữ pháp câu điều kiện',
            'Từ vựng Business English',
            'Chiến lược làm bài Reading',
            'Mẹo nghe hiểu Part 2',
            'Tạo lộ trình học 3 tháng'
          ].map((question, index) => (
            <button
              key={index}
              className="quick-button"
              onClick={() => handleSuggestionClick(question)}
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AITutor;
