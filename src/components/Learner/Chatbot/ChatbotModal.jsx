import React, { useState, useRef, useEffect } from "react";
import {
  Modal,
  Input,
  Button,
  Typography,
  Spin,
  Avatar,
  Divider,
  Space,
  message,
  Tooltip,
  Card,
  FloatButton,
  Badge,
  Drawer,
} from "antd";
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  CloseOutlined,
  DeleteOutlined,
  MessageOutlined,
  MinusOutlined,
  ExpandOutlined,
  CompressOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { io } from "socket.io-client";
import axios from "axios";

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

// Custom styles for the chat
const chatStyles = {
  messageContainer: {
    scrollBehavior: "smooth",
    "&::-webkit-scrollbar": {
      width: "6px",
    },
    "&::-webkit-scrollbar-track": {
      background: "#f1f1f1",
      borderRadius: "3px",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#c1c1c1",
      borderRadius: "3px",
    },
    "&::-webkit-scrollbar-thumb:hover": {
      background: "#a8a8a8",
    },
  },
  inputContainer: {
    transition: "all 0.3s ease",
    borderTop: "1px solid #f0f0f0",
    backgroundColor: "var(--color-bg-primary)",
  },
  floatingCard: {
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    backdropFilter: "blur(8px)",
  },
  floatingButton: {
    background: "linear-gradient(135deg, #1890ff 0%, #40a9ff 50%, #1890ff 100%)",
    boxShadow: "0 4px 20px rgba(24, 144, 255, 0.4), 0 2px 8px rgba(0, 0, 0, 0.1)",
    border: "none",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    transform: "scale(1)",
    "&:hover": {
      transform: "scale(1.05)",
      boxShadow: "0 6px 25px rgba(24, 144, 255, 0.5), 0 4px 12px rgba(0, 0, 0, 0.15)",
    },
  },
  "@keyframes pulse": {
    "0%": {
      transform: "scale(1)",
    },
    "50%": {
      transform: "scale(1.1)",
    },
    "100%": {
      transform: "scale(1)",
    },
  },
};

// Loading indicator for AI responses
const LoadingMessage = () => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      marginBottom: "12px",
    }}
  >
    <Avatar
      icon={<RobotOutlined />}
      style={{
        backgroundColor: "var(--color-primary)",
        marginRight: "8px",
        marginTop: "4px",
        flexShrink: 0,
      }}
      size="small"
    />
    <div
      style={{
        padding: "10px 14px",
        borderRadius: "18px",
        backgroundColor: "var(--color-bg-primary)",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Spin
        indicator={
          <LoadingOutlined style={{ fontSize: 16, color: "var(--color-primary)" }} />
        }
        style={{ marginRight: "8px" }}
      />
      <Text type="secondary" style={{ fontSize: "12px" }}>
        Đang trả lời...
      </Text>
    </div>
  </div>
);

const ChatbotModal = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      content:
        "Xin chào! Tôi là TOEIC AI Assistant. Tôi có thể giúp gì cho bạn hôm nay? Bạn có thể hỏi tôi về các chủ đề liên quan đến TOEIC, phương pháp học tiếng Anh, hoặc cần giúp đỡ về ngữ pháp.",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [sessionId, setSessionId] = useState(`session-${Date.now()}`);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Toggle functions
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (!isMinimized) {
      setUnreadCount(0); // Clear unread when expanding
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (isExpanded) {
      setIsMinimized(false); // Reset minimize state when exiting expand
    }
  };

  const handleClose = () => {
    setIsMinimized(false);
    setIsExpanded(false);
    setUnreadCount(0);
    onClose();
  };

  // Connect to socket on component mount
  useEffect(() => {
    if (isOpen) {
      const newSocket = io(
        window.location.hostname === "localhost"
          ? "http://localhost:5000"
          :  process.env.REACT_APP_URL
      );
      setSocket(newSocket);

      // Socket event listeners
      newSocket.on("chatbot-response", (data) => {
        console.log("Received chatbot-response:", data);

        // Check if response is successful
        if (data.success && data.data) {
          const newMessage = {
            content: data.data.text,
            isUser: false,
            timestamp: new Date(data.timestamp),
            source: data.data.source || "gemini",
          };
          console.log("New message to add:", newMessage);

          setMessages((prev) => [...prev, newMessage]);
          setIsLoading(false);

          // Add unread count if minimized
          if (isMinimized) {
            setUnreadCount((prev) => prev + 1);
          }
        } else {
          // Handle error response
          console.error("Chatbot response error:", data.error);
          message.error(data.error || "Đã xảy ra lỗi khi xử lý tin nhắn của bạn. Vui lòng thử lại.");
          setIsLoading(false);
        }
      });

      newSocket.on("chatbot-error", (data) => {
        console.error("Chatbot error received:", data);
        message.error(data.error || "Đã xảy ra lỗi khi xử lý tin nhắn của bạn. Vui lòng thử lại.");
        setIsLoading(false);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isOpen, sessionId, isMinimized]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      content: inputValue.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setInputValue("");

    try {
      if (socket?.connected) {
        // Use socket for real-time communication
        socket.emit("chatbot-message", {
          prompt: userMessage.content,
          userId: "user123", // Replace with actual user ID if available
          sessionId,
          history: messages,
        });
      } else {
        // Fallback to REST API
        const response = await axios.post("/api/chatbot", {
          prompt: userMessage.content,
          history: messages,
        });

        if (response.data.success && response.data.data) {
          const newMessage = {
            content: response.data.data.text,
            isUser: false,
            timestamp: new Date(),
            source: response.data.data.source || "gemini",
          };

          setMessages((prev) => [...prev, newMessage]);

          // Add unread count if minimized
          if (isMinimized) {
            setUnreadCount((prev) => prev + 1);
          }
        } else {
          // Handle error response
          console.error("HTTP API error:", response.data.error);
          message.error(response.data.error || "Đã xảy ra lỗi khi xử lý tin nhắn của bạn.");
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      message.error("Đã xảy ra lỗi khi gửi tin nhắn. Vui lòng thử lại.");
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearConversation = () => {
    setMessages([
      {
        content:
          "Tôi đã xóa cuộc trò chuyện trước đó. Bạn có thể bắt đầu cuộc trò chuyện mới!",
        isUser: false,
        timestamp: new Date(),
      },
    ]);
    setSessionId(`session-${Date.now()}`);
  };

  const formatTimestamp = (timestamp) => {
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "numeric",
      minute: "numeric",
    }).format(new Date(timestamp));
  };

  // Floating Button Component
  if (!isOpen) {
    const isMobile = window.innerWidth <= 768;

    return (
      <FloatButton
        icon={
          <Badge count={unreadCount} size="small">
            <MessageOutlined style={{color: "var(--color-bg-primary)", fontSize: "20px"}}/>
          </Badge>
        }
        onClick={() => {
          onClose(); // This actually opens the chat (parent handles the toggle)
          setUnreadCount(0); // Clear unread count when opening
        }}
        type="primary"
        tooltip="TOEIC AI Assistant"
      />
    );
  }

  // Chat Interface
  const chatContent = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "var(--color-primary)",
          color: "white",
        }}
      >
        <Space align="center">
          <Avatar
            icon={<RobotOutlined />}
            size="small"
            style={{ backgroundColor: "var(--color-bg-primary)", color: "var(--color-primary)" }}
          />
          <Text style={{ color: "white", fontWeight: 500 }}>
            TOEIC AI Assistant
          </Text>
        </Space>
        <Space>
          <Tooltip title={isExpanded ? "Thu nhỏ" : "Mở rộng"}>
            <Button
              type="text"
              icon={isExpanded ? <CompressOutlined /> : <ExpandOutlined />}
              onClick={toggleExpand}
              style={{ color: "white" }}
              size="small"
            />
          </Tooltip>
          <Tooltip title={isMinimized ? "Mở rộng" : "Thu gọn"}>
            <Button
              type="text"
              icon={<MinusOutlined />}
              onClick={toggleMinimize}
              style={{ color: "white" }}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Đóng">
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={handleClose}
              style={{ color: "white" }}
              size="small"
            />
          </Tooltip>
        </Space>
      </div>

      {/* Minimized State */}
      {isMinimized ? (
        <div style={{ padding: "12px 16px", textAlign: "center" }}>
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              Chat đã được thu gọn
            </Text>
            {unreadCount > 0 && (
              <Badge count={unreadCount} style={{ fontSize: "10px" }}>
                <Text type="secondary" style={{ fontSize: "11px" }}>
                  Tin nhắn mới
                </Text>
              </Badge>
            )}
            <Button
              type="link"
              size="small"
              onClick={toggleMinimize}
              style={{ fontSize: "11px", padding: 0 }}
            >
              Nhấn để mở rộng
            </Button>
          </Space>
        </div>
      ) : (
        <>
          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              backgroundColor: "var(--color-bg-secondary)",
              maxHeight: isExpanded ? "70vh" : "400px",
            }}
            css={chatStyles.messageContainer}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.isUser ? "flex-end" : "flex-start",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    maxWidth: "85%",
                  }}
                >
                  {!msg.isUser && (
                    <Avatar
                      icon={<RobotOutlined />}
                      style={{
                        backgroundColor: "var(--color-primary)",
                        marginRight: "8px",
                        marginTop: "4px",
                        flexShrink: 0,
                      }}
                      size="small"
                    />
                  )}
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: "18px",
                      backgroundColor: msg.isUser ? "var(--color-primary)" : "var(--color-bg-primary)",
                      color: msg.isUser ? "var(--color-bg-primary)" : "var(--color-text-primary)",
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                      border:
                        msg.source === "fallback"
                          ? "1px solid #faad14"
                          : "none",
                    }}
                  >
                    {msg.source === "fallback" && !msg.isUser && (
                      <Text
                        type="warning"
                        style={{
                          display: "block",
                          fontSize: "11px",
                          marginBottom: "4px",
                        }}
                      >
                        (Trả lời dự phòng)
                      </Text>
                    )}
                    <Paragraph
                      style={{
                        margin: 0,
                        whiteSpace: "pre-wrap",
                        fontSize: "12px",
                      }}
                    >
                      {msg.content}
                    </Paragraph>
                  </div>
                  {msg.isUser && (
                    <Avatar
                      icon={<UserOutlined />}
                      style={{
                        backgroundColor: "#f56a00",
                        marginLeft: "8px",
                        marginTop: "4px",
                        flexShrink: 0,
                      }}
                      size="small"
                    />
                  )}
                </div>
                <Text
                  type="secondary"
                  style={{
                    fontSize: "11px",
                    marginTop: "4px",
                    alignSelf: msg.isUser ? "flex-end" : "flex-start",
                    marginLeft: msg.isUser ? 0 : 32,
                    marginRight: msg.isUser ? 32 : 0,
                  }}
                >
                  {formatTimestamp(msg.timestamp)}
                </Text>
              </div>
            ))}
            {isLoading && <LoadingMessage />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div
            style={{
              padding: "12px 16px",
              borderTop: "1px solid #f0f0f0",
              backgroundColor: "var(--color-bg-primary)",
            }}
          >
            {/* <div style={{ marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Text type="secondary" style={{ fontSize: "11px" }}>
                Enter để gửi, Shift+Enter để xuống dòng
              </Text>
              <Tooltip title="Xóa cuộc trò chuyện">
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={clearConversation}
                  size="small"
                />
              </Tooltip>
            </div> */}
            <div
              style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}
            >
              <TextArea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Nhập tin nhắn của bạn..."
                autoSize={{ minRows: 1, maxRows: 3 }}
                onKeyPress={handleKeyPress}
                ref={inputRef}
                disabled={isLoading}
                style={{
                  flex: 1,
                  borderRadius: "20px",
                  padding: "8px 12px",
                  resize: "none",
                  border: "1px solid #d9d9d9",
                  transition: "border-color 0.3s, box-shadow 0.3s",
                }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                shape="circle"
                size="large"
                style={{ minWidth: "40px", height: "40px" }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );

  // Get responsive dimensions
  const isMobile = window.innerWidth <= 768;
  const isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;

  const getCardStyle = () => {
    if (isMobile) {
      return {
        position: "fixed",
        right: isMinimized ? 16 : 8,
        bottom: isMinimized ? 16 : 8,
        left: isMinimized ? "auto" : 8,
        width: isMinimized ? 240 : "auto",
        height: isMinimized ? "auto" : "85vh",
        zIndex: 1000,
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
        borderRadius: "12px",
        overflow: "hidden",
      };
    }

    return {
      position: "fixed",
      right: 24,
      bottom: 24,
      width: isMinimized ? 280 : isTablet ? 350 : 400,
      height: isMinimized ? "auto" : isTablet ? 450 : 500,
      zIndex: 1000,
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
      borderRadius: "12px",
      overflow: "hidden",
    };
  };

  // Return different components based on state
  if (isExpanded) {
    // Full screen drawer for expanded mode
    return (
      <Drawer
        title={null}
        placement="right"
        closable={false}
        open={isOpen}
        width={isMobile ? "100%" : isTablet ? 400 : 500}
        style={{ zIndex: 1001 }}
        bodyStyle={{ padding: 0 }}
      >
        {chatContent}
      </Drawer>
    );
  }

  // Default floating card
  return (
    <Card
      style={getCardStyle()}
      bodyStyle={{ padding: 0, height: "100%" }}
      bordered={false}
      css={chatStyles.floatingCard}
    >
      {chatContent}
    </Card>
  );
};

export default ChatbotModal;
