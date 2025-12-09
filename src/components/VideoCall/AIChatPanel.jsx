import React, { useState } from "react";
import { MessageCircle, Send, Loader2 } from "lucide-react";

const AIChatPanel = ({ callId }) => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm your AI English tutor. Let's practice speaking English together! How are you doing today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const authToken =
        sessionStorage.getItem("learnerToken") ||
        sessionStorage.getItem("adminToken") ||
        sessionStorage.getItem("teacherToken");

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/stream/ai/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            callId,
            message: input,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const aiMessage = {
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);

        // Play audio if available
        if (data.audioUrl) {
          const audio = new Audio(data.audioUrl);
          audio.play();
        }
      } else {
        throw new Error("Failed to get AI response");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      className="card h-100 d-flex flex-column"
      style={{
        maxHeight: "500px",
        background: "white",
        borderRadius: "12px",
      }}
    >
      {/* Header */}
      <div
        className="card-header d-flex align-items-center"
        style={{
          background: "linear-gradient(135deg, #2C5F8D 0%, #4A90E2 100%)",
          color: "white",
          borderTopLeftRadius: "12px",
          borderTopRightRadius: "12px",
        }}
      >
        <MessageCircle className="me-2" size={20} />
        <h6 className="mb-0">AI English Tutor</h6>
      </div>

      {/* Messages */}
      <div className="card-body flex-grow-1 overflow-auto p-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-3 d-flex ${
              msg.role === "user"
                ? "justify-content-end"
                : "justify-content-start"
            }`}
          >
            <div
              className="p-2 rounded"
              style={{
                maxWidth: "80%",
                background:
                  msg.role === "user"
                    ? "linear-gradient(135deg, #2C5F8D 0%, #4A90E2 100%)"
                    : "#f0f0f0",
                color: msg.role === "user" ? "white" : "black",
              }}
            >
              <p className="mb-1 small">{msg.content}</p>
              <small style={{ opacity: 0.7, fontSize: "0.7rem" }}>
                {msg.timestamp.toLocaleTimeString()}
              </small>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="d-flex justify-content-start mb-3">
            <div className="p-2 rounded" style={{ background: "#f0f0f0" }}>
              <Loader2 className="animate-spin" size={16} />
              <small className="ms-2">AI is thinking...</small>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="card-footer border-top p-3">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <button
            className="btn"
            style={{
              background: "linear-gradient(135deg, #2C5F8D 0%, #4A90E2 100%)",
              color: "white",
              border: "none",
            }}
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
          >
            <Send size={18} />
          </button>
        </div>
        <small className="text-muted d-block mt-2">
          💡 Tip: Practice speaking naturally and ask questions!
        </small>
      </div>
    </div>
  );
};

export default AIChatPanel;
