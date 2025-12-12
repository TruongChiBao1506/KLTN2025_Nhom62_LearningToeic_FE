import { useEffect, useRef, useState } from "react";
import { StreamVideoClient } from "@stream-io/video-react-sdk";
import { Card, Badge, Spin, Typography, Space, Avatar } from "antd";
import {
  RobotOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  SoundOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

/**
 * AIParticipant - Continuous Recording Version
 * Ghi âm liên tục mỗi 5 giây, KHÔNG phát hiện im lặng
 */
const AIParticipant = ({ callId, meetingId, userCall }) => {
  const [aiJoined, setAiJoined] = useState(false);
  const [error, setError] = useState(null);
  const aiClientRef = useRef(null);
  const aiCallRef = useRef(null);
  const activeRecordersRef = useRef(new Set());
  const mediaRecorderRef = useRef(null); // Lưu mediaRecorder để restart
  const audioStreamRef = useRef(null); // Lưu audioStream

  /**
   * Phát audio phản hồi từ AI trong cuộc gọi
   *
   * @param {string} audioBase64 - Audio dạng base64 từ backend (MP3)
   * @param {Object} aiCall - Stream video call object của AI
   *
   * Luồng hoạt động:
   * 1. Set flag AI_SPEAKING để tạm dừng ghi âm từ user
   * 2. Chuyển đổi base64 thành audio blob
   * 3. Bật microphone của AI để phát audio
   * 4. Phát audio qua AI's microphone
   * 5. Khi kết thúc, tắt mic và xóa flag để tiếp tục ghi âm
   */
  const playAIAudioInCall = async (audioBase64, aiCall) => {
    try {
      console.log("🔊 Playing AI response");
      // Set flag để báo hiệu AI đang nói, dừng ghi âm user
      activeRecordersRef.current.add("AI_SPEAKING");
      console.log("🚫 Set AI_SPEAKING flag - recording should pause");

      // Chuyển đổi base64 string thành binary data
      const byteCharacters = atob(audioBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      // Tạo audio blob từ binary data (MP3 format)
      const audioBlob = new Blob([byteArray], { type: "audio/mpeg" });

      // Tạo URL từ blob để phát audio
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      console.log("🎤 Enabling AI microphone...");
      // Bật microphone của AI để các participant khác nghe được
      await aiCall.microphone.enable();
      console.log("▶️ Playing audio...");
      // Phát audio qua browser
      await audio.play();

      // Xử lý khi audio phát xong
      audio.onended = async () => {
        // Giải phóng memory của blob URL
        URL.revokeObjectURL(audioUrl);
        // Tắt microphone của AI sau khi phát xong
        await aiCall.microphone.disable();
        console.log("✅ AI done speaking");

        // Xóa flag AI_SPEAKING để cho phép ghi âm user tiếp tục
        activeRecordersRef.current.delete("AI_SPEAKING");
        console.log("✅ Removed AI_SPEAKING flag - recording can resume");

        // QUAN TRỌNG: Không force restart ở đây
        // Để interval (mỗi 1 giây) tự động kiểm tra và restart recorder
        // Tránh xung đột giữa manual restart và interval restart
      };
    } catch (error) {
      console.error("❌ Error playing:", error);
      activeRecordersRef.current.delete("AI_SPEAKING");
      try {
        await aiCall.microphone.disable();
      } catch (e) {}
    }
  };

  /**
   * Xử lý ghi âm liên tục từ audio stream của user
   *
   * @param {MediaStream} audioStream - Audio stream từ microphone của user
   * @param {string} userId - ID của user đang nói
   * @param {Object} aiCall - Stream video call object của AI
   *
   * Luồng hoạt động:
   * 1. Kiểm tra codec hỗ trợ (ưu tiên opus)
   * 2. Khởi tạo MediaRecorder
   * 3. Ghi âm liên tục mỗi 1 giây
   * 4. Khi stop: gửi audio lên backend để AI xử lý
   * 5. Nhận phản hồi và phát audio từ AI
   * 6. Tự động restart recorder sau khi gửi xong
   *
   * Cơ chế FORCE START:
   * - Nếu recorder bị stuck ở trạng thái inactive
   * - Interval sẽ tự động force start lại
   */
  const processParticipantAudio = async (audioStream, userId, aiCall) => {
    // Ngăn duplicate recording cho cùng 1 user
    if (activeRecordersRef.current.has(userId)) {
      console.log("⏭️ Already recording:", userId);
      return;
    }

    console.log("🎙️ START continuous recording for:", userId);
    activeRecordersRef.current.add(userId);

    // Flag để tránh gửi audio đang được xử lý
    let isProcessing = false;
    // Interval ID để dừng khi cleanup
    let recordingInterval = null;

    try {
      // Auto-detect codec được hỗ trợ bởi browser
      // Ưu tiên: opus (chất lượng cao, dung lượng nhỏ)
      let mimeType = "audio/webm;codecs=opus";
      const supportedTypes = [
        "audio/webm;codecs=opus", // Chrome, Firefox (tốt nhất)
        "audio/webm", // Chrome fallback
        "audio/ogg;codecs=opus", // Firefox fallback
        "audio/mp4", // Safari
      ];

      // Tìm codec đầu tiên được hỗ trợ
      for (const type of supportedTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          console.log("✅ Format:", type);
          break;
        }
      }

      // Khởi tạo MediaRecorder với codec đã detect
      const mediaRecorder = new MediaRecorder(audioStream, {
        mimeType,
        audioBitsPerSecond: 128000, // 128 kbps - cân bằng chất lượng/dung lượng
      });

      // Lưu vào ref để truy cập từ interval và các function khác
      // Cần thiết để restart recorder khi bị stuck inactive
      mediaRecorderRef.current = mediaRecorder;
      audioStreamRef.current = audioStream;

      // Mảng chứa các audio chunks khi recording
      let audioChunks = [];

      // Event khi có data audio mới (được gọi khi recorder.stop())
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      // Event khi recorder dừng - gửi audio lên backend
      mediaRecorder.onstop = async () => {
        // Skip nếu đang xử lý request khác hoặc không có data
        if (isProcessing || audioChunks.length === 0) {
          audioChunks = [];
          return;
        }

        // Ghép các chunks thành 1 blob hoàn chỉnh
        const audioBlob = new Blob(audioChunks, { type: mimeType });
        console.log("📦 Audio:", audioBlob.size, "bytes");

        // Lọc bỏ audio quá nhỏ (có thể là im lặng hoặc noise)
        // 1000 bytes ≈ 0.06 giây audio
        if (audioBlob.size < 1000) {
          console.log("⏭️ Too small (silence, no speaking detected)");
          audioChunks = [];
          return;
        }

        // Set flag để tránh gửi duplicate requests
        isProcessing = true;
        console.log("📤 SENDING...");

        // Lấy auth token từ session (hỗ trợ cả learner, admin, teacher)
        const authToken =
          sessionStorage.getItem("learnerToken") ||
          sessionStorage.getItem("adminToken") ||
          sessionStorage.getItem("teacherToken");

        // Chuẩn bị FormData để upload file
        const formData = new FormData();
        formData.append(
          "audio",
          audioBlob,
          `speech.${mimeType.split("/")[1].split(";")[0]}` // Tên file: speech.webm, speech.ogg, etc.
        );
        formData.append("callId", aiCall.id); // Để backend track conversation
        formData.append("userId", userId); // Để backend biết ai đang nói

        try {
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}/ai/chat`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${authToken}` },
              body: formData,
            }
          );

          console.log("📡 Status:", response.status);

          if (response.ok) {
            const data = await response.json();

            // Backend có thể skip nếu phát hiện im lặng hoặc noise
            if (data.skipped || !data.aiText) {
              console.log("⏭️ Skipped");
            } else {
              // Log phản hồi của AI (50 ký tự đầu)
              console.log("✅ AI:", data.aiText.substring(0, 50));

              // Nếu có audio base64, phát qua AI's microphone
              if (data.audioBase64) {
                await playAIAudioInCall(data.audioBase64, aiCall);
              }
            }
          } else {
            console.error("❌ Error:", response.status);
          }
        } catch (error) {
          console.error("❌ Failed:", error);
        }

        isProcessing = false;
        audioChunks = [];
      };

      // BẮT ĐẦU GHI ÂM LIÊN TỤC
      mediaRecorder.start();
      console.log("▶️ Recording started");

      // Kiểm tra mức âm thanh
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(audioStream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const checkAudioLevel = () => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteTimeDomainData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += Math.abs(dataArray[i] - 128);
        }
        const average = sum / dataArray.length;
        if (average > 0.1) {
          console.log("🎚️ Audio detected! Level:", average.toFixed(2));
        }
      };

      // Kiểm tra mức âm thanh mỗi 2 giây (cho debugging)
      const audioCheckInterval = setInterval(checkAudioLevel, 2000);

      /**
       * INTERVAL CHÍNH - Chạy mỗi 1 giây
       *
       * Nhiệm vụ:
       * 1. Kiểm tra nếu AI đang nói → skip
       * 2. Kiểm tra nếu recorder bị stuck inactive → FORCE START
       * 3. Nếu đang recording bình thường → stop để gửi → restart sau 300ms
       *
       * Tại sao 1 giây?
       * - Phản hồi cực nhanh, tăng trải nghiệm real-time
       * - User không phải đợi lâu để nhận phản hồi
       * - Tối ưu cho cuộc hội thoại tự nhiên
       */
      recordingInterval = setInterval(() => {
        // RULE 1: Không ghi âm khi AI đang phát audio
        if (activeRecordersRef.current.has("AI_SPEAKING")) {
          console.log("🔇 AI speaking, skip cycle");
          return;
        }

        console.log(
          "🔄 Interval check - state:",
          mediaRecorder.state,
          "processing:",
          isProcessing
        );

        /**
         * RULE 2: FORCE START nếu recorder bị stuck
         *
         * Vấn đề: Sau khi AI nói xong, recorder có thể không tự restart
         * Nguyên nhân: Race condition giữa audio.onended và interval
         * Giải pháp: Interval chủ động force start khi phát hiện inactive
         *
         * Điều kiện force start:
         * - Recorder đang inactive (không recording)
         * - Không có request đang xử lý
         * - Audio track vẫn live (microphone vẫn hoạt động)
         */
        if (mediaRecorder.state === "inactive" && !isProcessing) {
          const tracks = audioStream.getTracks();
          if (tracks.length > 0 && tracks[0].readyState === "live") {
            audioChunks = []; // Reset chunks trước khi start mới
            try {
              mediaRecorder.start();
              console.log("FORCE START from inactive state");
            } catch (e) {
              console.error("Force start failed:", e);
            }
          } else {
            console.log("Track not ready, state:", tracks[0]?.readyState);
          }
          return; // Exit early, để cycle sau xử lý stop/send
        }

        /**
         * RULE 3: Chu kỳ ghi âm bình thường
         *
         * Luồng:
         * 1. Stop recorder (trigger ondataavailable + onstop)
         * 2. onstop sẽ gửi audio lên backend
         * 3. Sau 300ms, restart recorder để tiếp tục ghi
         *
         * Tại sao 300ms delay?
         * - Đủ thời gian để stop event hoàn tất
         * - Tránh conflict giữa stop và start
         * - Nhanh đủ để không mất audio
         */
        if (mediaRecorder.state === "recording" && !isProcessing) {
          console.log(
            "⏸️ Stopping to send... (state: recording, processing: " +
              isProcessing +
              ")"
          );
          // Stop để trigger gửi audio lên backend
          mediaRecorder.stop();

          // Đợi 300ms rồi restart (tối ưu tốc độ phản hồi)
          setTimeout(() => {
            // Kiểm tra lại điều kiện trước khi restart
            // - AI không đang nói (có thể vừa bắt đầu trong 300ms)
            // - Recorder đã inactive (stop thành công)
            // - Không có request đang xử lý
            if (
              !activeRecordersRef.current.has("AI_SPEAKING") &&
              mediaRecorder.state === "inactive" &&
              !isProcessing
            ) {
              const tracks = audioStream.getTracks();
              if (tracks.length > 0 && tracks[0].readyState === "live") {
                audioChunks = []; // Reset chunks cho recording mới
                try {
                  mediaRecorder.start();
                  console.log(
                    " Restarted from interval (state: " +
                      mediaRecorder.state +
                      ")"
                  );
                } catch (e) {
                  console.error(" Restart failed:", e);
                }
              } else {
                console.log(" Track not ready, state:", tracks[0]?.readyState);
              }
            } else {
              // Skip restart nếu điều kiện không đúng
              console.log(
                " Skip restart - AI_SPEAKING:",
                activeRecordersRef.current.has("AI_SPEAKING"),
                "state:",
                mediaRecorder.state,
                "processing:",
                isProcessing
              );
            }
          }, 300);
        } else {
          console.log(
            " Skip send - state:",
            mediaRecorder.state,
            "processing:",
            isProcessing
          );
        }
      }, 1000);

      // Cleanup khi stream kết thúc
      const track = audioStream.getTracks()[0];
      track.addEventListener("ended", () => {
        console.log(" Stream ended");
        if (recordingInterval) clearInterval(recordingInterval);
        if (audioCheckInterval) clearInterval(audioCheckInterval);
        activeRecordersRef.current.delete(userId);
      });
    } catch (error) {
      console.error(" Error:", error);
      if (recordingInterval) clearInterval(recordingInterval);
      activeRecordersRef.current.delete(userId);
    }
  };

  /**
   * Khởi động xử lý audio từ user's microphone
   *
   * @param {Object} aiCall - Stream video call object của AI
   *
   * QUAN TRỌNG:
   * - Phải lấy audio từ USER's call, KHÔNG PHẢI AI's call
   * - AI's call chỉ dùng để phát audio phản hồi
   * - User's call chứa localParticipant.audioStream (microphone của user)
   *
   * Luồng:
   * 1. Clear active recorders để reset state
   * 2. Lấy localParticipant từ userCall (không phải aiCall)
   * 3. Truy cập audioStream từ localParticipant
   * 4. Gọi processParticipantAudio để bắt đầu ghi âm
   */
  const startAIAudioProcessing = async (aiCall) => {
    console.log(" AI listening...");

    // Clear tất cả flags/states từ session trước (nếu có)
    activeRecordersRef.current.clear();
    console.log(" Cleared active recorders");

    // Kiểm tra userCall được truyền vào (từ props)
    // CRITICAL: Phải có userCall để lấy audio stream của user
    if (!userCall) {
      console.error(" No user call provided!");
      return;
    }

    try {
      /**
       * LẤY AUDIO STREAM TỪ USER
       *
       * Cấu trúc Stream Video SDK:
       * userCall (user's video call)
       *   └─ state
       *       └─ localParticipant (chính user đang join)
       *           ├─ userId
       *           ├─ audioStream (MediaStream từ microphone)
       *           └─ publishedTracks
       *
       * KHÔNG LẤY từ aiCall vì:
       * - aiCall.localParticipant là AI agent (không có mic)
       * - AI chỉ dùng để phát audio, không record
       */
      const localParticipant = userCall.state.localParticipant;

      // Debug info ể kiểm tra participant state
      console.log(" User's local participant:", {
        userId: localParticipant?.userId,
        hasAudio: !!localParticipant?.audioStream,
        publishedTracks: localParticipant?.publishedTracks,
      });

      // Kiểm tra có audio stream (user đã enable microphone)
      if (localParticipant && localParticipant.audioStream) {
        console.log(" Found USER'S audio stream!");
        const audioTracks = localParticipant.audioStream.getAudioTracks();
        console.log(" User audio tracks:", audioTracks.length);

        if (audioTracks.length > 0) {
          // Debug thông tin audio track
          console.log(" User track:", {
            id: audioTracks[0].id,
            label: audioTracks[0].label, // e.g., "Default - Microphone"
            enabled: audioTracks[0].enabled, // true nếu mic đang bật
            readyState: audioTracks[0].readyState, // "live" nếu đang hoạt động
          });

          // Bắt đầu ghi âm liên tục từ microphone của user
          processParticipantAudio(
            localParticipant.audioStream, // MediaStream object
            localParticipant.userId, // ID của user
            aiCall // AI's call để phát response
          );
          return;
        }
      }

      console.error(" Could not get user's audio stream");
    } catch (error) {
      console.error(" Error:", error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const joinAIToCall = async () => {
      try {
        console.log(" AI joining...");

        const authToken =
          sessionStorage.getItem("learnerToken") ||
          sessionStorage.getItem("adminToken") ||
          sessionStorage.getItem("teacherToken");

        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/stream/meetings/${meetingId}/ai-token`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );

        if (!response.ok) throw new Error("Failed to get AI token");

        const { agentUserId, agentToken } = await response.json();
        console.log(`✅ Token for: ${agentUserId}`);

        const aiClient = new StreamVideoClient({
          apiKey: process.env.REACT_APP_STREAM_VIDEO_API_KEY,
          user: {
            id: agentUserId,
            name: "AI English Tutor",
            image: "https://i.imgur.com/9KVJYaP.png",
          },
          token: agentToken,
        });

        if (!mounted) {
          aiClient.disconnectUser();
          return;
        }

        aiClientRef.current = aiClient;

        const aiCall = aiClient.call("default", callId);
        aiCallRef.current = aiCall;

        await aiCall.join({ create: false });
        await aiCall.microphone.disable();
        console.log(" Mic disabled");

        if (mounted) {
          console.log(" AI joined!");
          setAiJoined(true);
          startAIAudioProcessing(aiCall);
        }
      } catch (error) {
        console.error(" Error:", error);
        if (mounted) setError(error.message);
      }
    };

    const timer = setTimeout(joinAIToCall, 2000);

    return () => {
      mounted = false;
      clearTimeout(timer);
      activeRecordersRef.current.clear();
      if (aiCallRef.current) aiCallRef.current.leave().catch(console.error);
      if (aiClientRef.current)
        aiClientRef.current.disconnectUser().catch(console.error);
    };
  }, [callId, meetingId]);

  if (error) {
    return (
      <Card
        style={{
          position: "absolute",
          top: "24px",
          right: "24px",
          maxWidth: "320px",
          zIndex: 1000,
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(255, 77, 79, 0.3)",
          background: "rgba(26, 26, 26, 0.95)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 77, 79, 0.3)",
        }}
      >
        <Space>
          <Badge status="error" />
          <div>
            <Text strong style={{ color: "#ff4d4f" }}>
              AI Không Khả Dụng
            </Text>
            <br />
            <Text
              style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.45)" }}
            >
              {error}
            </Text>
          </div>
        </Space>
      </Card>
    );
  }

  if (aiJoined) {
    return (
      <Card
        style={{
          position: "absolute",
          top: "24px",
          right: "24px",
          maxWidth: "360px",
          zIndex: 1000,
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0, 198, 255, 0.3)",
          background:
            "linear-gradient(135deg, rgba(15, 15, 15, 0.95) 0%, rgba(26, 26, 26, 0.95) 100%)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(0, 198, 255, 0.3)",
          animation: "slideIn 0.5s ease-out",
        }}
        bodyStyle={{ padding: "20px" }}
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Space>
            <Avatar
              size={40}
              src="https://cdn-icons-png.flaticon.com/512/4712/4712027.png"
              icon={<RobotOutlined />}
              style={{
                background: "linear-gradient(135deg, #2C5F8D 0%, #4A90E2 100%)",
                boxShadow: "0 4px 16px rgba(44, 95, 141, 0.4)",
              }}
            />
            <div>
              <Space size={4}>
                <Badge
                  status="success"
                  style={{
                    animation: "pulse 2s infinite",
                  }}
                />
                <Text strong style={{ color: "#fff", fontSize: "16px" }}>
                  Trợ Lý AI Đang Hoạt Động
                </Text>
              </Space>
              <div
                style={{
                  color: "rgba(255, 255, 255, 0.45)",
                  fontSize: "12px",
                  marginTop: "4px",
                }}
              >
                Luyện Nói Tiếng Anh
              </div>
            </div>
          </Space>
          <Space
            size={8}
            style={{
              background: "rgba(0, 198, 255, 0.1)",
              padding: "12px 16px",
              borderRadius: "12px",
              width: "100%",
              border: "1px solid rgba(0, 198, 255, 0.2)",
            }}
          >
            <SoundOutlined
              style={{
                color: "#52c41a",
                fontSize: "18px",
                animation: "wave 1.5s ease-in-out infinite",
              }}
            />
            <Text
              style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.85)" }}
            >
              🎤 Đang lắng nghe • Hãy nói tự nhiên
            </Text>
          </Space>
        </Space>
        <style>{`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          @keyframes wave {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
          }
        `}</style>
      </Card>
    );
  }

  return (
    <Card
      style={{
        position: "absolute",
        top: "24px",
        right: "24px",
        maxWidth: "320px",
        zIndex: 1000,
        borderRadius: "16px",
        boxShadow: "0 8px 32px rgba(0, 198, 255, 0.2)",
        background: "rgba(26, 26, 26, 0.95)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(0, 198, 255, 0.2)",
      }}
    >
      <Space>
        <Spin
          indicator={
            <LoadingOutlined style={{ fontSize: 20, color: "#4A90E2" }} spin />
          }
        />
        <div>
          <Text strong style={{ color: "#fff" }}>
            AI Đang Tham Gia...
          </Text>
          <br />
          <Text
            style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.45)" }}
          >
            Đang kết nối Trợ Lý AI
          </Text>
        </div>
      </Space>
    </Card>
  );
};

export default AIParticipant;
