import React from "react";
import { Card, Button, Space, Typography, List, Result } from "antd";
import {
  CheckCircleOutlined,
  HomeOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const CallEnded = ({ onClose }) => {
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
      <div style={{ width: "100%", maxWidth: "600px", padding: "24px" }}>
        <Card
          style={{
            borderRadius: "16px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            textAlign: "center",
          }}
        >
          <Result
            icon={
              <TrophyOutlined style={{ color: "#52c41a", fontSize: "80px" }} />
            }
            title={
              <Title level={2} style={{ color: "#262626" }}>
                Buổi Luyện Tập Hoàn Tất!
              </Title>
            }
            subTitle={
              <Text style={{ fontSize: "16px", color: "#595959" }}>
                Làm tốt lắm! Bạn đã hoàn thành buổi luyện nói với AI.
              </Text>
            }
            extra={[
              <Button
                key="home"
                type="primary"
                size="large"
                icon={<HomeOutlined />}
                onClick={onClose}
                style={{
                  height: "48px",
                  fontSize: "16px",
                  background:
                    "linear-gradient(135deg, #2C5F8D 0%, #4A90E2 100%)",
                  border: "none",
                  borderRadius: "12px",
                  width: "100%",
                  marginBottom: "24px",
                }}
              >
                Quay Lại Trang Chủ
              </Button>,
            ]}
          />

          <Card
            style={{
              background: "#f6ffed",
              border: "1px solid #b7eb8f",
              borderRadius: "12px",
              textAlign: "left",
            }}
          >
            <Space align="start" style={{ marginBottom: "12px" }}>
              <CheckCircleOutlined
                style={{ color: "#52c41a", fontSize: "18px", marginTop: "2px" }}
              />
              <Title level={5} style={{ margin: 0, color: "#52c41a" }}>
                Bước Tiếp Theo:
              </Title>
            </Space>
            <List
              size="small"
              dataSource={[
                "Xem lại buổi luyện tập của bạn",
                "Kiểm tra phản hồi về phát âm",
                "Luyện tập nhiều hơn để tiến bộ",
                "Theo dõi tiến độ của bạn",
              ]}
              renderItem={(item) => (
                <List.Item style={{ border: "none", padding: "6px 0" }}>
                  <Space>
                    <CheckCircleOutlined
                      style={{ color: "#52c41a", fontSize: "14px" }}
                    />
                    <Text style={{ color: "#389e0d" }}>{item}</Text>
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

export default CallEnded;
