import React, { useEffect, useState } from "react";
import { StreamCall } from "@stream-io/video-react-sdk";
import { Loader2 } from "lucide-react";
import CallUI from "./CallUI";
import "../VideoCall/VideoCall.css";

const CallConnect = ({ meetingId, meetingName, client, onClose }) => {
  const [call, setCall] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!client) return;

    const initializeCall = async () => {
      try {
        console.log("Creating call:", meetingId);

        const streamVideoCall = client.call("default", meetingId);

        // Create or get existing call with AI enabled
        await streamVideoCall.getOrCreate({
          data: {
            custom: {
              meetingName: meetingName,
              enableAI: true, // Enable AI agent
            },
          },
        });

        console.log("Call created successfully");

        // Request AI agent from backend
        try {
          const authToken =
            sessionStorage.getItem("learnerToken") ||
            sessionStorage.getItem("adminToken") ||
            sessionStorage.getItem("teacherToken");

          const response = await fetch(
            `${process.env.REACT_APP_API_URL}/stream/meetings/create`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
              },
              body: JSON.stringify({
                meetingName,
                meetingType: "default",
                enableAI: true,
              }),
            }
          );

          if (response.ok) {
            console.log("✅ AI agent requested successfully");
          } else {
            console.warn(
              "⚠️ Failed to request AI agent, continuing without AI"
            );
          }
        } catch (aiError) {
          console.warn("⚠️ AI agent request failed:", aiError);
          // Continue without AI
        }

        // Disable camera and microphone initially
        streamVideoCall.camera.disable();
        streamVideoCall.microphone.disable();

        setCall(streamVideoCall);
        setIsLoading(false);
      } catch (error) {
        console.error("Error creating call:", error);
        setIsLoading(false);
      }
    };

    initializeCall();

    // Không cleanup ở đây vì call state chưa được set
    // Cleanup sẽ được xử lý bởi CallUI component khi user rời call
  }, [client, meetingId, meetingName]);

  if (isLoading || !call) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{
          height: "100vh",
          background: "linear-gradient(135deg, #2C5F8D 0%, #4A90E2 100%)",
        }}
      >
        <div className="text-center text-white">
          <Loader2 className="mb-3 animate-spin" size={48} />
          <p>Tạo phòng họp...</p>
        </div>
      </div>
    );
  }

  return (
    <StreamCall call={call}>
      <CallUI
        meetingName={meetingName}
        meetingId={meetingId}
        onClose={onClose}
      />
    </StreamCall>
  );
};

export default CallConnect;
