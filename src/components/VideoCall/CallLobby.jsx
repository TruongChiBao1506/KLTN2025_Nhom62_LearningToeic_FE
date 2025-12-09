import React, { useState, useEffect } from "react";
import { useCall } from "@stream-io/video-react-sdk";
import { Card, Button, Space, Typography, List, Avatar } from "antd";
import {
  CameraOutlined,
  AudioOutlined,
  AudioMutedOutlined,
  PhoneOutlined,
  CloseOutlined,
  VideoCameraOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const CallLobby = ({ onJoin, onClose, meetingName }) => {
  const call = useCall();
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);

  useEffect(() => {
    // Initialize with camera and mic off
    if (call) {
      call.camera.disable();
      call.microphone.disable();
    }
  }, [call]);

  const toggleCamera = async () => {
    if (!call) return;

    if (isCameraOn) {
      await call.camera.disable();
    } else {
      await call.camera.enable();
    }
    setIsCameraOn(!isCameraOn);
  };

  const toggleMic = async () => {
    if (!call) return;

    if (isMicOn) {
      await call.microphone.disable();
    } else {
      await call.microphone.enable();
    }
    setIsMicOn(!isMicOn);
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #2C5F8D 0%, #4A90E2 100%)",
      }}
    >
      <div style={{ width: "100%", maxWidth: "800px", padding: "24px" }}>
        <Card
          style={{
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #2C5F8D 0%, #4A90E2 100%)",
              padding: "24px",
              marginTop: "-24px",
              marginLeft: "-24px",
              marginRight: "-24px",
              marginBottom: "24px",
            }}
          >
            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              <Space size="large">
                <Avatar
                  size={56}
                  icon={<VideoCameraOutlined />}
                  style={{ background: "rgba(255,255,255,0.2)" }}
                />
                <div>
                  <Title level={2} style={{ color: "white", margin: 0 }}>
                    Luyện Nói Với AI
                  </Title>
                  <Text
                    style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px" }}
                  >
                    {meetingName}
                  </Text>
                </div>
              </Space>
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={onClose}
                style={{ color: "white" }}
                size="large"
              />
            </Space>
          </div>

          {/* Video Preview */}
          <div
            style={{
              background: "#1a1a1a",
              aspectRatio: "16/9",
              borderRadius: "12px",
              overflow: "hidden",
              marginBottom: "24px",
            }}
          >
            {isCameraOn ? (
              <video
                id="camera-preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                autoPlay
                muted
                playsInline
              />
            ) : (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
              >
                <CameraOutlined
                  style={{
                    fontSize: "64px",
                    color: "#666",
                    marginBottom: "16px",
                  }}
                />
                <Text style={{ color: "#999" }}>Camera đang tắt</Text>
              </div>
            )}
          </div>

          {/* Device Controls */}
          <Space
            size="large"
            style={{
              width: "100%",
              justifyContent: "center",
              marginBottom: "24px",
            }}
          >
            <Button
              type={isCameraOn ? "primary" : "default"}
              shape="circle"
              size="large"
              icon={isCameraOn ? <CameraOutlined /> : <CameraOutlined />}
              onClick={toggleCamera}
              style={{
                width: "64px",
                height: "64px",
                fontSize: "24px",
                background: isCameraOn
                  ? "linear-gradient(135deg, #2C5F8D 0%, #4A90E2 100%)"
                  : undefined,
                border: isCameraOn ? "none" : undefined,
              }}
            />
            <Button
              type={isMicOn ? "primary" : "default"}
              shape="circle"
              size="large"
              icon={isMicOn ? <AudioOutlined /> : <AudioMutedOutlined />}
              onClick={toggleMic}
              style={{
                width: "64px",
                height: "64px",
                fontSize: "24px",
                background: isMicOn
                  ? "linear-gradient(135deg, #2C5F8D 0%, #4A90E2 100%)"
                  : undefined,
                border: isMicOn ? "none" : undefined,
              }}
            />
          </Space>

          {/* Join Button */}
          <Button
            type="primary"
            size="large"
            icon={<PhoneOutlined />}
            onClick={onJoin}
            block
            style={{
              height: "56px",
              fontSize: "16px",
              fontWeight: 600,
              background: "linear-gradient(135deg, #2C5F8D 0%, #4A90E2 100%)",
              border: "none",
              borderRadius: "12px",
              marginBottom: "24px",
            }}
          >
            Tham Gia Luyện Nói Với AI
          </Button>

          {/* Info */}
          <Card
            style={{
              background: "#f0f5ff",
              border: "1px solid #adc6ff",
              borderRadius: "12px",
            }}
          >
            <Title level={5} style={{ color: "#1890ff", marginBottom: "12px" }}>
              Trước khi tham gia:
            </Title>
            <List
              size="small"
              dataSource={[
                "Đảm bảo micro của bạn hoạt động tốt",
                "Tìm một nơi yên tĩnh để luyện tập",
                "AI sẽ giúp bạn luyện tập nói tiếng Anh",
                "Bạn có thể bật/tắt camera và micro bất cứ lúc nào",
              ]}
              renderItem={(item) => (
                <List.Item style={{ border: "none", padding: "4px 0" }}>
                  <Space>
                    <CheckCircleOutlined style={{ color: "#52c41a" }} />
                    <Text style={{ color: "#1890ff" }}>{item}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Card>
      </div>
    </div>
  );
};

export default CallLobby;
