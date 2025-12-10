import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Send, Loader2, Volume2 } from "lucide-react";

const VoiceChat = ({ callId }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I'm your AI English tutor. Press the microphone button and start speaking in English!",
      timestamp: new Date(),
    },
  ]);
  const [audioUrl, setAudioUrl] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null);

  // Request microphone permission on mount
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => console.log(" Microphone permission granted"))
      .catch((err) => console.error(" Microphone permission denied:", err));
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        await sendAudioToAI(audioBlob);

        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      console.log(" Recording started...");
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Failed to access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      console.log("Recording stopped");
    }
  };

  const sendAudioToAI = async (audioBlob) => {
    setIsProcessing(true);

    try {
      const authToken =
        sessionStorage.getItem("learnerToken") ||
        sessionStorage.getItem("adminToken") ||
        sessionStorage.getItem("teacherToken");

      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("callId", callId);

      console.log("📤 Sending audio to AI...");

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/ai/voice-to-voice`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to process audio: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ AI response received:", data);

      // Add user message
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          text: data.userText,
          timestamp: new Date(),
        },
      ]);

      // Add AI response
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.aiText,
          timestamp: new Date(),
          hasAudio: true,
        },
      ]);

      // Play AI audio response
      if (data.audioBase64) {
        playAudioFromBase64(data.audioBase64);
      }
    } catch (error) {
      console.error("Error processing audio:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry, I encountered an error processing your speech. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudioFromBase64 = (base64Audio) => {
    try {
      const audioBlob = base64ToBlob(base64Audio, "audio/mpeg");
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = url;
        audioPlayerRef.current.play();
      }
    } catch (error) {
      console.error("Error playing audio:", error);
    }
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
        <h6 className="mb-0">🎙️ Voice Chat with AI Tutor</h6>
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
              className="p-3 rounded"
              style={{
                maxWidth: "80%",
                background:
                  msg.role === "user"
                    ? "linear-gradient(135deg, #2C5F8D 0%, #4A90E2 100%)"
                    : "#f0f0f0",
                color: msg.role === "user" ? "white" : "black",
              }}
            >
              {msg.hasAudio && (
                <div className="mb-2">
                  <Volume2 size={16} className="me-1" />
                  <small>Audio response</small>
                </div>
              )}
              <p className="mb-1">{msg.text}</p>
              <small style={{ opacity: 0.7, fontSize: "0.7rem" }}>
                {msg.timestamp.toLocaleTimeString()}
              </small>
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="d-flex justify-content-start mb-3">
            <div className="p-3 rounded" style={{ background: "#f0f0f0" }}>
              <Loader2 className="animate-spin me-2" size={16} />
              <small>AI is processing your speech...</small>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="card-footer p-3 text-center">
        {!isRecording && !isProcessing && (
          <button
            className="btn btn-lg rounded-circle"
            style={{
              width: "80px",
              height: "80px",
              background: "linear-gradient(135deg, #2C5F8D 0%, #4A90E2 100%)",
              color: "white",
              border: "none",
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
            }}
            onClick={startRecording}
          >
            <Mic size={32} />
          </button>
        )}

        {isRecording && (
          <button
            className="btn btn-lg rounded-circle btn-danger"
            style={{
              width: "80px",
              height: "80px",
              animation: "pulse 1.5s infinite",
            }}
            onClick={stopRecording}
          >
            <MicOff size={32} />
          </button>
        )}

        {isProcessing && (
          <button
            className="btn btn-lg rounded-circle"
            style={{
              width: "80px",
              height: "80px",
              background: "#6c757d",
              color: "white",
            }}
            disabled
          >
            <Loader2 className="animate-spin" size={32} />
          </button>
        )}

        <div className="mt-3">
          <small className="text-muted">
            {isRecording
              ? "🎤 Recording... Click to stop"
              : isProcessing
              ? "⏳ Processing..."
              : "🎙️ Click to start speaking"}
          </small>
        </div>

        <div className="mt-2">
          <small className="text-muted d-block">
            💡 Speak clearly and naturally in English
          </small>
        </div>
      </div>

      {/* Hidden audio player */}
      <audio ref={audioPlayerRef} style={{ display: "none" }} />

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 6px 20px rgba(220, 53, 69, 0.6);
          }
        }
      `}</style>
    </div>
  );
};

export default VoiceChat;
