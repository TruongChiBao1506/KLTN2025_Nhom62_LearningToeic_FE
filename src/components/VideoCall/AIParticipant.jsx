import { useEffect, useRef, useState } from "react";
import { StreamVideoClient } from "@stream-io/video-react-sdk";

/**
 * AIParticipant component
 * Makes AI join the video call as an actual participant
 */
const AIParticipant = ({ callId, meetingId }) => {
  const [aiJoined, setAiJoined] = useState(false);
  const [error, setError] = useState(null);
  const aiClientRef = useRef(null);
  const aiCallRef = useRef(null);
  const activeRecordersRef = useRef(new Set()); // Track active recorders by userId

  // Audio processing functions
  const playAIAudioInCall = async (audioBase64, aiCall) => {
    try {
      console.log("🔊 Playing AI response in call...");

      // Mark that AI is speaking - prevent listening to self
      activeRecordersRef.current.add("AI_SPEAKING");

      // Convert base64 to blob
      const byteCharacters = atob(audioBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const audioBlob = new Blob([byteArray], { type: "audio/mpeg" });

      // Create audio element and play
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      // ONLY enable microphone when playing
      await aiCall.microphone.enable();

      await audio.play();

      audio.onended = async () => {
        URL.revokeObjectURL(audioUrl);

        // IMMEDIATELY disable microphone after playing
        await aiCall.microphone.disable();

        console.log("AI finished speaking");
        // Allow listening again after 1 second delay
        setTimeout(() => {
          activeRecordersRef.current.delete("AI_SPEAKING");
          console.log(" AI ready to listen again");
        }, 1000);
      };
    } catch (error) {
      console.error(" Error playing AI audio:", error);
      activeRecordersRef.current.delete("AI_SPEAKING");
      // Ensure mic is disabled on error
      try {
        await aiCall.microphone.disable();
      } catch (e) {
        console.error("Failed to disable mic:", e);
      }
    }
  };

  const processParticipantAudio = async (audioStream, userId, aiCall) => {
    // Check if already processing this user
    if (activeRecordersRef.current.has(userId)) {
      console.log(" Already recording from:", userId);
      return;
    }

    // Don't process while AI is speaking
    if (activeRecordersRef.current.has("AI_SPEAKING")) {
      console.log(" AI is speaking, skipping user audio");
      return;
    }

    console.log(" Processing audio from:", userId);
    activeRecordersRef.current.add(userId);

    let isProcessing = false; // Flag to prevent duplicate processing

    try {
      // Find supported audio format - prefer higher quality
      let mimeType = "audio/webm;codecs=opus";
      const supportedTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/mp4",
        "audio/mpeg",
        "audio/wav",
      ];

      for (const type of supportedTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          console.log(" Using audio format:", type);
          break;
        }
      }

      // Create MediaRecorder with higher quality settings
      const mediaRecorder = new MediaRecorder(audioStream, {
        mimeType,
        audioBitsPerSecond: 128000, // Higher bitrate for better quality
      });

      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
          console.log(
            " Audio chunk:",
            event.data.size,
            "bytes, total:",
            audioChunks.length,
            "chunks"
          );
        }
      };

      mediaRecorder.onstop = async () => {
        if (audioChunks.length === 0) return;

        // Prevent duplicate processing
        if (isProcessing) {
          console.log(" Already processing, skipping this chunk");
          audioChunks.length = 0;
          return;
        }

        // Use the same mimeType for blob as MediaRecorder
        const audioBlob = new Blob(audioChunks, { type: mimeType });

        // Check minimum size to avoid sending noise
        if (audioBlob.size < 10000) {
          console.log(" Audio too small (likely noise), skipping");
          audioChunks.length = 0;
          return;
        }

        isProcessing = true;
        console.log("📤 SENDING:", audioBlob.size, "bytes");

        // Send to backend for processing
        const authToken =
          sessionStorage.getItem("learnerToken") ||
          sessionStorage.getItem("adminToken") ||
          sessionStorage.getItem("teacherToken");

        const formData = new FormData();
        formData.append(
          "audio",
          audioBlob,
          `user-speech.${mimeType.split("/")[1].split(";")[0]}`
        );
        formData.append("callId", aiCall.id);
        formData.append("userId", userId);

        try {
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}/ai/chat`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
              body: formData,
            }
          );

          console.log("📡 Response status:", response.status);

          if (response.ok) {
            const data = await response.json();

            // Skip if no actual content
            if (data.skipped || !data.aiText) {
              console.log(" Skipped (noise)");
              isProcessing = false;
              return;
            }

            console.log(" AI says:", data.aiText?.substring(0, 50) + "...");

            // Play AI audio response in the call
            if (data.audioBase64) {
              console.log(" Playing...");
              await playAIAudioInCall(data.audioBase64, aiCall);
              console.log(" Done playing");
            } else {
              console.warn(" No audio");
            }

            isProcessing = false;
          } else {
            const errorText = await response.text();
            console.error("Error:", response.status, errorText);
            isProcessing = false;
          }
        } catch (error) {
          console.error(" Failed:", error);
          isProcessing = false;
        }

        audioChunks.length = 0;
      };

      // Start recording in chunks
      console.log(" Started recording for:", userId);
      mediaRecorder.start(100); // Record in 100ms chunks for better quality

      // Detect silence and stop recording
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(audioStream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256; // Phản ứng nhanh hơn
      analyser.smoothingTimeConstant = 0.3; // Ít làm mịn để nhạy hơn
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      let consecutiveSilence = 0;
      const SILENCE_THRESHOLD = 0.5; // Rất nhạy để bắt giọng nói nhỏ
      const SILENCE_FRAMES_NEEDED = 40; // ~4 giây chờ sau khi nói xong

      const detectSilence = () => {
        analyser.getByteTimeDomainData(dataArray);

        // Calculate volume
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += Math.abs(dataArray[i] - 128);
        }
        const average = sum / bufferLength;

        // Log every 20 frames để theo dõi
        if (consecutiveSilence % 20 === 0) {
          console.log(
            " Audio level:",
            average.toFixed(2),
            "threshold:",
            SILENCE_THRESHOLD
          );
        }

        // Count consecutive silent frames
        if (average < SILENCE_THRESHOLD) {
          consecutiveSilence++;

          // If enough silence detected, process the audio
          if (consecutiveSilence >= SILENCE_FRAMES_NEEDED) {
            // Don't process if AI is speaking or already processing
            if (activeRecordersRef.current.has("AI_SPEAKING")) {
              consecutiveSilence = 0;
            } else if (isProcessing) {
              consecutiveSilence = 0;
            } else if (mediaRecorder.state === "recording") {
              console.log("Stopping recorder (silence detected)");
              mediaRecorder.stop();
              consecutiveSilence = 0;

              setTimeout(() => {
                // Check if recorder is still valid and not processing
                if (mediaRecorder.state === "inactive" && !isProcessing) {
                  try {
                    // Verify stream is still active
                    const tracks = audioStream.getTracks();
                    if (tracks.length > 0 && tracks[0].readyState === "live") {
                      mediaRecorder.start(100);
                    } else {
                      console.warn(" Audio stream ended, stopping recorder");
                    }
                  } catch (e) {
                    console.error(" Failed to restart recorder:", e);
                  }
                }
              }, 100);
            }
          }
        } else {
          // Reset silence counter when sound is detected
          consecutiveSilence = 0;
        }

        // Check if stream is still alive before continuing
        const tracks = audioStream.getTracks();
        if (tracks.length > 0 && tracks[0].readyState === "live") {
          requestAnimationFrame(detectSilence);
        } else {
          console.warn(" Audio stream ended, stopping detection");
          if (mediaRecorder.state === "recording") {
            mediaRecorder.stop();
          }
        }
      };

      detectSilence();
    } catch (error) {
      console.error(" Error in audio processing:", error);
      // Cleanup on error
      activeRecordersRef.current.delete(userId);
      isProcessing = false;
    }
  };

  const startAIAudioProcessing = async (aiCall) => {
    console.log(" AI is now listening to the call...");

    try {
      const processNewParticipant = (participant) => {
        console.log("👤 Processing participant:", {
          userId: participant.userId,
          publishedTracks: participant.publishedTracks,
          hasAudioStream: !!participant.audioStream,
          audioStreamType: participant.audioStream
            ? participant.audioStream.constructor.name
            : "none",
        });

        // Skip if it's the AI itself
        if (participant.userId.startsWith("ai-tutor-")) {
          console.log(" Skipping AI user");
          return;
        }

        // Get audio from published tracks (user's microphone)
        const audioTracks = participant.publishedTracks.filter(
          (track) => track.trackType === "audio"
        );

        console.log(
          "Found",
          audioTracks.length,
          "audio tracks for:",
          participant.userId
        );

        if (audioTracks.length > 0) {
          // Create MediaStream from the audio track
          const mediaStreamTrack = audioTracks[0].track;

          if (!mediaStreamTrack) {
            console.warn(" No MediaStreamTrack found");
            return;
          }

          console.log(" Got audio track:", {
            id: mediaStreamTrack.id,
            kind: mediaStreamTrack.kind,
            enabled: mediaStreamTrack.enabled,
            readyState: mediaStreamTrack.readyState,
            label: mediaStreamTrack.label,
          });

          const audioStream = new MediaStream([mediaStreamTrack]);
          processParticipantAudio(audioStream, participant.userId, aiCall);
        } else {
          console.log(" No audio stream for participant:", participant.userId);
        }
      };

      // Listen to current participants
      console.log(
        " Current participants:",
        aiCall.state.remoteParticipants.length
      );
      aiCall.state.remoteParticipants.forEach(processNewParticipant);

      // Listen for new participants joining or track changes
      const unsubscribe = aiCall.state.remoteParticipants$.subscribe(
        (participants) => {
          console.log(" Participants updated, count:", participants.length);
          participants.forEach(processNewParticipant);
        }
      );

      return () => {
        if (unsubscribe) unsubscribe();
      };
    } catch (error) {
      console.error(" Error setting up AI audio processing:", error);
    }
  };

  useEffect(() => {
    let mounted = true;
    const activeRecorders = activeRecordersRef.current;

    const joinAIToCall = async () => {
      try {
        console.log(" Attempting to join AI to call...");

        // Get AI token from backend
        const authToken =
          sessionStorage.getItem("learnerToken") ||
          sessionStorage.getItem("adminToken") ||
          sessionStorage.getItem("teacherToken");

        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/stream/meetings/${meetingId}/ai-token`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to get AI token");
        }

        const { agentUserId, agentToken } = await response.json();
        console.log(` AI token received for user: ${agentUserId}`);

        // Create Stream client for AI
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

        // Join the call
        const aiCall = aiClient.call("default", callId);
        aiCallRef.current = aiCall;

        await aiCall.join({
          create: false, // Don't create, just join existing call
        });

        // IMPORTANT: Disable AI microphone by default to prevent echo/feedback
        await aiCall.microphone.disable();
        console.log(" AI microphone disabled (will enable only when speaking)");

        if (mounted) {
          console.log(" AI joined the call successfully!");
          setAiJoined(true);

          // Start AI audio processing (connect to backend AI service)
          startAIAudioProcessing(aiCall);
        }
      } catch (error) {
        console.error(" Error joining AI to call:", error);
        if (mounted) {
          setError(error.message);
        }
      }
    };

    // Wait a bit for user to join first
    const timer = setTimeout(() => {
      joinAIToCall();
    }, 2000);

    return () => {
      mounted = false;
      clearTimeout(timer);

      // Cleanup: Clear active recorders
      activeRecorders.clear();

      // Cleanup: Leave call and disconnect
      if (aiCallRef.current) {
        aiCallRef.current.leave().catch(console.error);
      }
      if (aiClientRef.current) {
        aiClientRef.current.disconnectUser().catch(console.error);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callId, meetingId]);

  if (error) {
    return (
      <div
        style={{
          position: "absolute",
          top: "80px",
          right: "20px",
          padding: "12px",
          background: "#fff3cd",
          border: "1px solid #ffc107",
          borderRadius: "8px",
          maxWidth: "300px",
          fontSize: "14px",
          zIndex: 1000,
        }}
      >
        <strong>⚠️ AI Not Available</strong>
        <p style={{ margin: "4px 0 0 0", fontSize: "12px" }}>{error}</p>
      </div>
    );
  }

  if (aiJoined) {
    return (
      <div
        style={{
          position: "absolute",
          top: "80px",
          right: "20px",
          padding: "12px",
          background: "#d1f2eb",
          border: "1px solid #0f5132",
          borderRadius: "8px",
          maxWidth: "320px",
          fontSize: "14px",
          zIndex: 1000,
        }}
      >
        <div
          style={{ fontWeight: "bold", color: "#0f5132", marginBottom: "8px" }}
        >
          ✅ AI Tutor Active
        </div>
      </div>
    );
  }

  if (!aiJoined) {
    return (
      <div
        style={{
          position: "absolute",
          top: "80px",
          right: "20px",
          padding: "12px",
          background: "#d1ecf1",
          border: "1px solid #0dcaf0",
          borderRadius: "8px",
          maxWidth: "300px",
          fontSize: "14px",
          zIndex: 1000,
        }}
      >
        <strong>🤖 AI Joining...</strong>
        <p style={{ margin: "4px 0 0 0", fontSize: "12px" }}>
          AI English Tutor is joining the call
        </p>
        <div
          style={{
            marginTop: "8px",
            width: "100%",
            height: "4px",
            background: "#ccc",
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "50%",
              height: "100%",
              background: "#0dcaf0",
              animation: "loading 1.5s ease-in-out infinite",
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        top: "80px",
        right: "20px",
        padding: "12px",
        background: "#d1e7dd",
        border: "1px solid #198754",
        borderRadius: "8px",
        maxWidth: "300px",
        fontSize: "14px",
        zIndex: 1000,
      }}
    >
      <strong>✅ AI Active</strong>
      <p style={{ margin: "4px 0 0 0", fontSize: "12px" }}>
        AI English Tutor is in the call
      </p>
    </div>
  );
};

export default AIParticipant;
