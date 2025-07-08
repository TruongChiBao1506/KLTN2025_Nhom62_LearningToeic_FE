import React, { useRef, useEffect, useState } from "react";
import { Space, Button, Alert } from "antd";
import { Volume2, Play, Pause, AlertCircle } from "lucide-react";
import audioRegistry from "../utils/AudioRegistry";

// Maintain compatibility with existing code
if (!window.stopAllAudio) {
  window.stopAllAudio = () => audioRegistry.stopAll();
}

const AudioPlayer = ({ src, style = {}, questionId }) => {
  // Debug log when component renders
  console.log(
    `🔊 AudioPlayer rendering with src: ${src} and questionId: ${questionId}`
  );

  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canPlay, setCanPlay] = useState(false);

  // Register with audioRegistry when component mounts
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !questionId) return;

    console.log("📝 AudioPlayer mounted/updated for question:", questionId);

    // Register this audio element with the registry
    audioRegistry.register(questionId, audio);

    // Reset local state
    setIsPlaying(audioRegistry.isPlaying(questionId));

    return () => {
      // Unregister when component unmounts
      audioRegistry.unregister(questionId);
    };
  }, [questionId]);

  // Force update source when questionId or src changes
  useEffect(() => {
    console.log("🔄 Question ID or src changed:", { questionId, src });

    const audio = audioRef.current;
    if (!audio) return;

    // Always stop all audio when questionId or src changes
    console.log("🛑 Force stopping ALL audio due to question/source change");
    audioRegistry.stopAll();

    // Reset the audio element completely and force reload
    console.log("🔄 Explicitly updating audio element src to:", src);
    audio.src = src;
    audio.load(); // Force reload with new source

    // Reset UI state
    setIsPlaying(false);
    setLoading(true);
    setCanPlay(false);
    setError(null);
  }, [questionId, src]);

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadStart = () => {
      console.log(
        "🎵 Audio loading started for question:",
        questionId,
        "URL:",
        src
      );
      setLoading(true);
      setError(null);
    };

    const handleCanPlay = () => {
      console.log("✅ Audio can play for question:", questionId, "URL:", src);
      setLoading(false);
      setCanPlay(true);
    };

    const handleError = (e) => {
      console.error(
        "❌ Audio error for question:",
        questionId,
        "Error:",
        e,
        "Source:",
        src
      );

      // Lấy thông tin lỗi chi tiết
      let errorMessage = "Unknown error";
      if (e.target?.error) {
        errorMessage = e.target.error.message || e.target.error.code;
      }

      // Kiểm tra trường hợp src rỗng
      if (
        !audio.src ||
        audio.src === "about:blank" ||
        audio.src === window.location.href
      ) {
        console.error("Audio src is empty or invalid:", audio.src);
        errorMessage = `Empty or invalid audio source. Original source: ${src}`;
      }

      setError(`Không thể tải audio: ${errorMessage}`);
      setLoading(false);
      setCanPlay(false);
    };

    const handlePlay = () => {
      console.log("▶️ Audio PLAY event for question:", questionId);
      setIsPlaying(true);
    };

    const handlePause = () => {
      console.log("⏸️ Audio paused for question:", questionId);
      setIsPlaying(false);
    };

    const handleEnded = () => {
      console.log("⏹️ Audio ended for question:", questionId);
      setIsPlaying(false);
    };

    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleError);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [src, questionId]);

  // Keep UI in sync with actual audio state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const checkPlayingState = () => {
      // Sync UI state with actual audio element state
      if (audio.paused && isPlaying) {
        setIsPlaying(false);
      } else if (!audio.paused && !isPlaying) {
        setIsPlaying(true);
      }
    };

    // Check every 100ms if audio state has changed
    const interval = setInterval(checkPlayingState, 100);

    return () => {
      clearInterval(interval);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !questionId) return;

    if (isPlaying) {
      console.log("⏸️ User clicked PAUSE for question:", questionId);
      audioRegistry.stopAudio(questionId);
    } else {
      console.log("▶️ User clicked PLAY for question:", questionId);
      audioRegistry.playAudio(questionId);
    }
  };

  // Hàm để thử tải lại audio khi gặp lỗi
  const reloadAudio = () => {
    console.log(
      "🔄 Trying to reload audio for question:",
      questionId,
      "Source:",
      src
    );
    setError(null);
    setLoading(true);
    setCanPlay(false);

    const audio = audioRef.current;
    if (audio) {
      // Đảm bảo source được thiết lập lại chính xác
      audio.src = src;
      audio.load();
    }
  };

  if (error) {
    return (
      <Alert
        message="Lỗi audio"
        description={
          <div>
            <div>{error}</div>
            <div style={{ marginTop: "8px" }}>
              <small>URL: {src}</small>
            </div>
            <div style={{ marginTop: "8px" }}>
              <Space>
                <Button size="small" onClick={reloadAudio}>
                  Thử tải lại
                </Button>
                <Button size="small" onClick={() => window.open(src, "_blank")}>
                  Mở audio trong tab mới
                </Button>
              </Space>
            </div>
          </div>
        }
        type="warning"
        showIcon
        icon={<AlertCircle size={16} />}
        style={{ maxWidth: "400px" }}
      />
    );
  }

  return (
    <Space align="center" style={style}>
      <Volume2 size={16} style={{ color: "#1890ff" }} />
      <Button
        type="primary"
        icon={isPlaying ? <Pause size={14} /> : <Play size={14} />}
        onClick={togglePlay}
        disabled={!canPlay}
        loading={loading}
        size="small"
        data-question-id={questionId}
      >
        {loading ? "Đang tải..." : isPlaying ? "Dừng" : "Phát"}
      </Button>

      {/* Hidden audio element - controlled by our AudioRegistry */}
      <audio
        ref={audioRef}
        preload="auto"
        crossOrigin="anonymous"
        style={{ display: "none" }}
        data-question-id={questionId}
        key={`${questionId}-${src}`} /* Sử dụng cả questionId và src để key thay đổi khi bất kỳ cái nào thay đổi */
        src={
          src
        } /* Thêm trực tiếp src attribute để đảm bảo nó luôn được cập nhật */
      >
        {/* Sử dụng cả source tags và src attribute để tăng khả năng tương thích */}
        <source src={src} type="audio/mpeg" />
        <source src={src} type="audio/mp3" />
        <source src={src} type="audio/wav" />
        Trình duyệt không hỗ trợ audio.
      </audio>
    </Space>
  );
};

export default AudioPlayer;
