import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Loader2, Volume2, MessageCircle } from "lucide-react";

const ContinuousVoiceChat = ({ callId }) => {
  const [isActive, setIsActive] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [conversation, setConversation] = useState([]);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const conversationHistoryRef = useRef([]);

  useEffect(() => {
    // Check browser support
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Speech recognition not supported in this browser. Please use Chrome or Edge."
      );
      return;
    }

    // Initialize speech recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      setCurrentTranscript(finalTranscript || interimTranscript);

      // When user finishes speaking (final result)
      if (finalTranscript) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          handleUserFinishedSpeaking(finalTranscript.trim());
        }, 1500); // Wait 1.5s of silence before processing
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "no-speech") {
        // Restart if no speech detected
        if (isActive) {
          setTimeout(() => recognition.start(), 100);
        }
      }
    };

    recognition.onend = () => {
      // Restart recognition if still active
      if (isActive && !isAISpeaking) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch (e) {
            console.log("Recognition restart failed:", e);
          }
        }, 100);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isActive, isAISpeaking]);

  const startConversation = async () => {
    try {
      // Request mic permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      setIsActive(true);
      setError(null);

      // AI greets first
      await getAIResponse(
        "Hello! I'm your AI tutor. Let's practice English together!"
      );

      // Start listening after AI finishes greeting
      setTimeout(() => {
        if (recognitionRef.current) {
          recognitionRef.current.start();
        }
      }, 2000);
    } catch (err) {
      console.error("Error starting conversation:", err);
      setError("Failed to access microphone. Please grant permission.");
    }
  };

  const stopConversation = () => {
    setIsActive(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    setCurrentTranscript("");
  };

  const handleUserFinishedSpeaking = async (userText) => {
    if (!userText || userText.length < 3) return;

    console.log("👤 User said:", userText);

    // Stop recognition while AI is speaking
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Add to conversation
    setConversation((prev) => [
      ...prev,
      {
        role: "user",
        text: userText,
        timestamp: new Date(),
      },
    ]);

    conversationHistoryRef.current.push({
      role: "user",
      content: userText,
    });

    setCurrentTranscript("");

    // Get AI response
    await getAIResponse(userText);
  };

  const getAIResponse = async (userText) => {
    setIsAISpeaking(true);

    try {
      const authToken =
        sessionStorage.getItem("learnerToken") ||
        sessionStorage.getItem("adminToken") ||
        sessionStorage.getItem("teacherToken");

      const response = await fetch(`${process.env.REACT_APP_API_URL}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          callId,
          message: userText,
          conversationHistory: conversationHistoryRef.current,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI response failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("🤖 AI said:", data.response);

      // Add AI response to conversation
      setConversation((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.response,
          timestamp: new Date(),
        },
      ]);

      conversationHistoryRef.current.push({
        role: "assistant",
        content: data.response,
      });

      // Play AI audio
      if (data.audioBase64) {
        await playAudioFromBase64(data.audioBase64);
      }

      // Resume listening after AI finishes speaking
      setTimeout(() => {
        setIsAISpeaking(false);
        if (isActive && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.log("Failed to restart recognition:", e);
          }
        }
      }, 500);
    } catch (error) {
      console.error("Error getting AI response:", error);
      setError("Failed to get AI response. Please check your connection.");
      setIsAISpeaking(false);
    }
  };

  const playAudioFromBase64 = (base64Audio) => {
    return new Promise((resolve, reject) => {
      try {
        const audioBlob = base64ToBlob(base64Audio, "audio/mpeg");
        const url = URL.createObjectURL(audioBlob);

        if (audioPlayerRef.current) {
          audioPlayerRef.current.src = url;
          audioPlayerRef.current.onended = () => {
            URL.revokeObjectURL(url);
            resolve();
          };
          audioPlayerRef.current.onerror = reject;
          audioPlayerRef.current.play();
        }
      } catch (error) {
        console.error("Error playing audio:", error);
        reject(error);
      }
    });
  };

  const base64ToBlob = (base64, mimeType) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

  return (
    <div
      className="card h-100 d-flex flex-column"
      style={{ maxHeight: "600px" }}
    >
      {/* Header */}
      <div
        className="card-header"
        style={{
          background: "linear-gradient(135deg, #2C5F8D 0%, #4A90E2 100%)",
          color: "white",
        }}
      >
        <h6 className="mb-0">🎙️ Live AI Conversation</h6>
      </div>

      {/* Conversation Display */}
      <div className="card-body flex-grow-1 overflow-auto p-3">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {conversation.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-3 d-flex ${
              msg.role === "user"
                ? "justify-content-end"
                : "justify-content-start"
            }`}
          >
            <div
              className="p-3 rounded"
              style={{
                maxWidth: "85%",
                background:
                  msg.role === "user"
                    ? "linear-gradient(135deg, #2C5F8D 0%, #4A90E2 100%)"
                    : "#f0f0f0",
                color: msg.role === "user" ? "white" : "black",
              }}
            >
              {msg.role === "assistant" && (
                <div className="mb-2">
                  <Volume2 size={16} className="me-1" />
                  <small>AI Speaking</small>
                </div>
              )}
              <p className="mb-1">{msg.text}</p>
              <small style={{ opacity: 0.7, fontSize: "0.7rem" }}>
                {msg.timestamp.toLocaleTimeString()}
              </small>
            </div>
          </div>
        ))}

        {/* Live transcript */}
        {currentTranscript && (
          <div className="d-flex justify-content-end mb-3">
            <div
              className="p-3 rounded"
              style={{
                maxWidth: "85%",
                background:
                  "linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)",
                border: "2px dashed #2C5F8D",
                color: "#2C5F8D",
              }}
            >
              <small className="d-block mb-1">🎤 You're saying...</small>
              <p className="mb-0">{currentTranscript}</p>
            </div>
          </div>
        )}

        {isAISpeaking && (
          <div className="d-flex justify-content-start mb-3">
            <div className="p-3 rounded" style={{ background: "#f0f0f0" }}>
              <Loader2 className="animate-spin me-2" size={16} />
              <small>AI is thinking and speaking...</small>
            </div>
          </div>
        )}
      </div>

      {/* Status & Controls */}
      <div className="card-footer p-3">
        {!isActive ? (
          <div className="text-center">
            <button
              className="btn btn-lg"
              style={{
                background: "linear-gradient(135deg, #2C5F8D 0%, #4A90E2 100%)",
                color: "white",
                border: "none",
                padding: "12px 48px",
                borderRadius: "25px",
                fontSize: "18px",
                fontWeight: 600,
              }}
              onClick={startConversation}
            >
              <Mic className="me-2" size={24} />
              Start Conversation
            </button>
            <p className="text-muted small mt-3 mb-0">
              AI will greet you and listen continuously
            </p>
          </div>
        ) : (
          <div className="text-center">
            {/* Status indicator */}
            <div
              className="mb-3 p-3 rounded"
              style={{
                background: isAISpeaking
                  ? "rgba(102, 126, 234, 0.1)"
                  : "rgba(34, 197, 94, 0.1)",
                border: `2px solid ${isAISpeaking ? "#2C5F8D" : "#22c55e"}`,
              }}
            >
              <div className="d-flex align-items-center justify-content-center">
                {isAISpeaking ? (
                  <>
                    <Volume2
                      className="me-2"
                      size={20}
                      style={{ color: "#2C5F8D" }}
                    />
                    <strong style={{ color: "#2C5F8D" }}>
                      AI is speaking...
                    </strong>
                  </>
                ) : (
                  <>
                    <Mic
                      className="me-2"
                      size={20}
                      style={{ color: "#22c55e" }}
                    />
                    <strong style={{ color: "#22c55e" }}>
                      Listening... Speak now!
                    </strong>
                  </>
                )}
              </div>
            </div>

            <button
              className="btn btn-lg btn-danger"
              style={{
                padding: "12px 48px",
                borderRadius: "25px",
                fontSize: "18px",
                fontWeight: 600,
              }}
              onClick={stopConversation}
            >
              <MicOff className="me-2" size={24} />
              End Conversation
            </button>
          </div>
        )}

        <div className="mt-3 text-center">
          <small className="text-muted d-block">
            💡 Tip: Speak naturally, AI will respond automatically
          </small>
          <small className="text-muted d-block mt-1">
            Works best in Chrome or Edge browser
          </small>
        </div>
      </div>

      {/* Hidden audio player */}
      <audio ref={audioPlayerRef} style={{ display: "none" }} />
    </div>
  );
};

export default ContinuousVoiceChat;
