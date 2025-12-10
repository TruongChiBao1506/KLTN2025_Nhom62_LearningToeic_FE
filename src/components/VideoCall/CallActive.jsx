import React from "react";
import {
  CallControls,
  ParticipantView,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { Card, Badge, Avatar, Space, Typography } from "antd";
import {
  VideoCameraOutlined,
  RobotOutlined,
  UserOutlined,
  AudioOutlined,
} from "@ant-design/icons";
import AIParticipant from "./AIParticipant_Continuous";

const { Title, Text } = Typography;

const CallActive = ({ meetingName, meetingId, onLeave }) => {
  const call = useCall();
  const callId = call?.id || "unknown";
  const { useParticipants, useLocalParticipant } = useCallStateHooks();
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();

  // Tách AI và user
  const aiParticipant = participants.find((p) =>
    p.userId.startsWith("ai-tutor-")
  );
  const userParticipant = localParticipant;

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)",
        position: "relative",
      }}
    >
      {/* AI Participant - Pass USER'S CALL để lấy audio */}
      <AIParticipant callId={callId} meetingId={meetingId} userCall={call} />

      {/* Main video area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "24px",
        }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: "24px",
            borderRadius: "16px",
            padding: "20px 24px",
            background: "rgba(30, 30, 30, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
          }}
        >
          <Space
            size="large"
            style={{ width: "100%", justifyContent: "space-between" }}
          >
            <Space>
              <Avatar
                size={48}
                icon={<VideoCameraOutlined />}
                style={{
                  background:
                    "linear-gradient(135deg, #4A90E2 0%, #2C5F8D 100%)",
                }}
              />
              <div>
                <Title level={4} style={{ margin: 0, color: "#fff" }}>
                  {meetingName}
                </Title>
                <Text style={{ color: "rgba(255, 255, 255, 0.65)" }}>
                  Buổi Luyện Nói Với AI
                </Text>
              </div>
            </Space>

            <Space size="large">
              <Badge
                count={participants.length}
                style={{ backgroundColor: "#4A90E2" }}
              >
                <Avatar
                  icon={<UserOutlined />}
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    color: "#fff",
                  }}
                />
              </Badge>

              <Badge
                status="processing"
                text={<span style={{ color: "#52c41a" }}>Live</span>}
              />
            </Space>
          </Space>
        </div>

        {/* Video Grid - 2 columns */}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
            marginBottom: "24px",
          }}
        >
          {/* User Video - Bên Trái */}
          <div
            style={{
              borderRadius: "16px",
              overflow: "hidden",
              background: "rgba(30, 30, 30, 0.95)",
              border: "2px solid rgba(0, 198, 255, 0.3)",
              position: "relative",
              boxShadow: "0 8px 32px rgba(0, 198, 255, 0.2)",
            }}
          >
            {userParticipant && (
              <ParticipantView
                participant={userParticipant}
                style={{ height: "100%", width: "100%" }}
              />
            )}
            <div
              style={{
                position: "absolute",
                bottom: "16px",
                left: "16px",
                background: "rgba(0, 0, 0, 0.7)",
                backdropFilter: "blur(10px)",
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <Space>
                <Avatar
                  size={32}
                  icon={<UserOutlined />}
                  style={{ background: "#4A90E2" }}
                />
                <Text strong style={{ color: "#fff" }}>
                  Bạn
                </Text>
              </Space>
            </div>
          </div>

          {/* AI Video - Bên Phải */}
          <div
            style={{
              borderRadius: "16px",
              overflow: "hidden",
              background: "rgba(30, 30, 30, 0.95)",
              border: "2px solid rgba(82, 196, 26, 0.3)",
              position: "relative",
              boxShadow: "0 8px 32px rgba(82, 196, 26, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Luôn hiển thị avatar AI */}
            <div style={{ textAlign: "center" }}>
              <Avatar
                size={120}
                src="https://cdn-icons-png.flaticon.com/512/4712/4712027.png"
                icon={<RobotOutlined />}
                style={{
                  background:
                    "linear-gradient(135deg, #2C5F8D 0%, #4A90E2 100%)",
                  marginBottom: "16px",
                  boxShadow: "0 4px 20px rgba(44, 95, 141, 0.5)",
                }}
              />
              <div style={{ color: "rgba(255, 255, 255, 0.45)" }}>
                {aiParticipant
                  ? "Đang lắng nghe..."
                  : "Trợ lý AI đang tham gia..."}
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                bottom: "16px",
                left: "16px",
                background: "rgba(0, 0, 0, 0.7)",
                backdropFilter: "blur(10px)",
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <Space>
                <Avatar
                  size={32}
                  src="https://cdn-icons-png.flaticon.com/512/4712/4712027.png"
                  icon={<RobotOutlined />}
                  style={{
                    background:
                      "linear-gradient(135deg, #2C5F8D 0%, #4A90E2 100%)",
                  }}
                />
                <Space direction="vertical" size={0}>
                  <Text strong style={{ color: "#fff", fontSize: "14px" }}>
                    Trợ Lý AI
                  </Text>
                  <Space size={4}>
                    <AudioOutlined
                      style={{ color: "#52c41a", fontSize: "12px" }}
                    />
                    <Text
                      style={{
                        color: "rgba(255, 255, 255, 0.65)",
                        fontSize: "12px",
                      }}
                    >
                      Đang lắng nghe
                    </Text>
                  </Space>
                </Space>
              </Space>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div
          style={{
            borderRadius: "16px",
            background: "rgba(30, 30, 30, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "16px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
          }}
        >
          <CallControls onLeave={onLeave} />
        </div>
      </div>
    </div>
  );
};

export default CallActive;
