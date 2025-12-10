import React, { useState } from "react";
import { StreamTheme, useCall } from "@stream-io/video-react-sdk";
import CallLobby from "./CallLobby";
import CallActive from "./CallActive";
import CallEnded from "./CallEnded";

import "@stream-io/video-react-sdk/dist/css/styles.css";

const CallUI = ({ meetingName, meetingId, onClose }) => {
  const call = useCall();
  const [show, setShow] = useState("lobby"); // 'lobby' | 'call' | 'ended'

  const handleJoin = async () => {
    if (!call) return;

    try {
      await call.join();
      setShow("call");
    } catch (error) {
      console.error("Error joining call:", error);
    }
  };

  const handleLeave = async () => {
    if (!call) return;

    try {
      // Kiểm tra trạng thái trước khi leave
      const callingState = call.state.callingState;
      if (callingState !== "left") {
        await call.leave();
      }
      setShow("ended");
    } catch (error) {
      console.error("Error leaving call:", error);
      // Vẫn chuyển sang màn hình ended dù có lỗi
      setShow("ended");
    }
  };

  return (
    <StreamTheme className="h-screen">
      {show === "lobby" && (
        <CallLobby
          onJoin={handleJoin}
          onClose={onClose}
          meetingName={meetingName}
        />
      )}
      {show === "call" && (
        <CallActive
          meetingName={meetingName}
          meetingId={meetingId}
          onLeave={handleLeave}
        />
      )}
      {show === "ended" && <CallEnded onClose={onClose} />}
    </StreamTheme>
  );
};

export default CallUI;
