import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Typography,
  Badge,
  Space,
  Input,
  Row,
  Col,
  Progress,
  Divider,
  Alert,
  Tag,
  Spin,
} from "antd";
import {
  PenTool,
  Clock,
  Play,
  RotateCcw,
  Check,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Timer,
} from "lucide-react";
import "./style.css";
import TestService from "../../../services/testService";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const No1To5 = ({ testId }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isReadyToTest, setIsReadyToTest] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [preparingCountdown, setPreparingCountdown] = useState([]);
  const [writingCountdown, setWritingCountdown] = useState([]);
  const [isPreparingCountDown, setIsPreparingCountDown] = useState([]);
  const [isWritingCountDown, setIsWritingCountDown] = useState([]);
  const [isFinished, setIsFinished] = useState([]);

  // Interval refs để clear
  const preparationIntervalRef = React.useRef(null);
  const writingIntervalRef = React.useRef(null);

  // Lấy câu hỏi từ bài kiểm tra
  const retrieveQuestions = async () => {
    try {
      const response = await TestService.getQuestionsByTestId(testId);
      console.log("🚀 ~ retrieveQuestions ~ response:", response);

      setQuestions(response);

      // Khởi tạo các giá trị mặc định
      setAnswers(response.map(() => ""));
      setPreparingCountdown(response.map(() => 45)); // 45 seconds for preparation
      setWritingCountdown(response.map(() => 300)); // 5 minutes (300 sec) for writing
      setIsPreparingCountDown(response.map(() => false));
      setIsWritingCountDown(response.map(() => false));
      setIsFinished(response.map(() => false));
    } catch (error) {
      console.log(error);
    }
  };

  // Bắt đầu kiểm tra
  const startTest = () => {
    setIsReadyToTest(true);

    // Bắt đầu đếm ngược thời gian chuẩn bị cho câu đầu tiên
    const newIsPreparingCountDown = [...isPreparingCountDown];
    newIsPreparingCountDown[0] = true;
    setIsPreparingCountDown(newIsPreparingCountDown);

    // Cập nhật đếm ngược cho thời gian chuẩn bị
    preparationIntervalRef.current = setInterval(() => {
      setPreparingCountdown((prev) => {
        const updated = [...prev];
        if (isPreparingCountDown[currentIndex] && updated[currentIndex] > 0) {
          updated[currentIndex] = updated[currentIndex] - 1;

          // Khi hết thời gian chuẩn bị, bắt đầu thời gian viết
          if (updated[currentIndex] === 0) {
            startWriting(currentIndex);
          }
        }
        return updated;
      });
    }, 1000);

    // Cập nhật đếm ngược cho thời gian viết
    writingIntervalRef.current = setInterval(() => {
      setWritingCountdown((prev) => {
        const updated = [...prev];
        if (isWritingCountDown[currentIndex] && updated[currentIndex] > 0) {
          updated[currentIndex] = updated[currentIndex] - 1;

          // Khi hết thời gian viết, tự động kết thúc
          if (updated[currentIndex] === 0) {
            finishWriting(currentIndex);
          }
        }
        return updated;
      });
    }, 1000);
  };

  // Bắt đầu thời gian viết
  const startWriting = (index) => {
    // Dừng đếm ngược chuẩn bị
    const newIsPreparingCountDown = [...isPreparingCountDown];
    newIsPreparingCountDown[index] = false;
    setIsPreparingCountDown(newIsPreparingCountDown);

    // Bắt đầu đếm ngược thời gian viết
    const newIsWritingCountDown = [...isWritingCountDown];
    newIsWritingCountDown[index] = true;
    setIsWritingCountDown(newIsWritingCountDown);
  };

  // Hoàn thành viết
  const finishWriting = (index) => {
    // Dừng đếm ngược thời gian viết
    const newIsWritingCountDown = [...isWritingCountDown];
    newIsWritingCountDown[index] = false;
    setIsWritingCountDown(newIsWritingCountDown);

    // Đánh dấu là đã hoàn thành
    const newIsFinished = [...isFinished];
    newIsFinished[index] = true;
    setIsFinished(newIsFinished);
  };

  // Xử lý khi nhập câu trả lời
  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  // Quay lại câu trước
  const showPreviousQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Tiến đến câu tiếp theo
  const showNextQuestion = () => {
    if (currentIndex < questions.length - 1 && isFinished[currentIndex]) {
      setCurrentIndex(currentIndex + 1);

      // Nếu câu tiếp theo chưa bắt đầu, bắt đầu đếm ngược thời gian chuẩn bị
      if (
        !isPreparingCountDown[currentIndex + 1] &&
        !isWritingCountDown[currentIndex + 1] &&
        !isFinished[currentIndex + 1]
      ) {
        const newIsPreparingCountDown = [...isPreparingCountDown];
        newIsPreparingCountDown[currentIndex + 1] = true;
        setIsPreparingCountDown(newIsPreparingCountDown);
      }
    }
  };

  // Làm lại tất cả
  const refreshAllQuestions = () => {
    // Dừng tất cả đếm ngược
    clearInterval(preparationIntervalRef.current);
    clearInterval(writingIntervalRef.current);

    // Reset lại tất cả trạng thái
    setCurrentIndex(0);
    retrieveQuestions();
    startTest();
  };

  // Khởi tạo khi component mount
  useEffect(() => {
    retrieveQuestions();

    // Cleanup khi component unmount
    return () => {
      clearInterval(preparationIntervalRef.current);
      clearInterval(writingIntervalRef.current);
    };
  }, [testId]);

  // Format thời gian
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  return (
    <div style={{ padding: "24px", background: "#f5f5f5", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header Card */}
        <Card
          style={{
            marginBottom: "24px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={4} style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #722ed1 0%, #531dab 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                }}
              >
                <PenTool size={32} color="white" />
              </div>
            </Col>
            <Col xs={24} md={20}>
              <Space
                direction="vertical"
                size="small"
                style={{ width: "100%" }}
              >
                <Title level={2} style={{ margin: 0, color: "#722ed1" }}>
                  Writing: Viết câu trả lời ngắn
                </Title>
                <Paragraph
                  style={{ margin: 0, fontSize: "16px", color: "#666" }}
                >
                  Trong phần kiểm tra này, bạn sẽ viết câu trả lời cho câu hỏi
                  được đưa ra. Bạn sẽ có <Tag color="blue">45 giây</Tag> để
                  chuẩn bị và <Tag color="green">5 phút</Tag> để viết câu trả
                  lời.
                </Paragraph>
                <Space wrap>
                  <Tag color="success" icon={<BookOpen size={14} />}>
                    Nội dung
                  </Tag>
                  <Tag color="processing" icon={<PenTool size={14} />}>
                    Ngữ pháp
                  </Tag>
                  <Tag color="warning" icon={<Check size={14} />}>
                    Từ vựng
                  </Tag>
                  <Tag color="purple" icon={<Timer size={14} />}>
                    Tổ chức
                  </Tag>
                </Space>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Main Test Card */}
        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          {!isReadyToTest ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <div
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #722ed1 0%, #531dab 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px",
                }}
              >
                <Play size={48} color="white" />
              </div>
              <Title level={3} style={{ color: "#722ed1" }}>
                Sẵn sàng bắt đầu?
              </Title>
              <Paragraph style={{ color: "#666", marginBottom: "32px" }}>
                Hãy chuẩn bị tinh thần và bắt đầu bài kiểm tra Writing của bạn.
              </Paragraph>
              <Button
                type="primary"
                size="large"
                icon={<Play size={20} />}
                onClick={startTest}
                style={{
                  height: "56px",
                  padding: "0 40px",
                  fontSize: "16px",
                  fontWeight: "600",
                  borderRadius: "8px",
                  background:
                    "linear-gradient(135deg, #722ed1 0%, #531dab 100%)",
                  border: "none",
                }}
              >
                Sẵn sàng luyện tập
              </Button>
            </div>
          ) : (
            <div>
              {/* Action Bar */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "24px",
                  padding: "16px",
                  background: "#fafafa",
                  borderRadius: "8px",
                }}
              >
                <Space>
                  <Button
                    icon={<RotateCcw size={16} />}
                    onClick={refreshAllQuestions}
                    style={{
                      borderColor: "#722ed1",
                      color: "#722ed1",
                    }}
                  >
                    Làm lại
                  </Button>
                </Space>

                <Space>
                  {isPreparingCountDown[currentIndex] && (
                    <Badge
                      count={
                        <Space>
                          <Clock size={14} />
                          <span>
                            Chuẩn bị: {preparingCountdown[currentIndex]}s
                          </span>
                        </Space>
                      }
                      style={{
                        backgroundColor: "#1890ff",
                        color: "white",
                        fontSize: "14px",
                        borderRadius: "16px",
                        padding: "4px 12px",
                      }}
                    />
                  )}
                  {isWritingCountDown[currentIndex] && (
                    <Badge
                      count={
                        <Space>
                          <Timer size={14} />
                          <span>
                            Viết: {formatTime(writingCountdown[currentIndex])}
                          </span>
                        </Space>
                      }
                      style={{
                        backgroundColor: "#52c41a",
                        color: "white",
                        fontSize: "14px",
                        borderRadius: "16px",
                        padding: "4px 12px",
                      }}
                    />
                  )}
                </Space>
              </div>

              {/* Question Card */}
              <Card
                style={{
                  marginBottom: "24px",
                  borderRadius: "8px",
                  border: "1px solid #f0f0f0",
                }}
                title={
                  <Space>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "#722ed1",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      {currentIndex + 1}
                    </div>
                    <span style={{ fontSize: "16px", fontWeight: "600" }}>
                      Câu hỏi {currentIndex + 1}
                    </span>
                  </Space>
                }
              >
                <div
                  style={{
                    fontSize: "16px",
                    lineHeight: "1.6",
                    padding: "16px",
                    background: "#f9f9f9",
                    borderRadius: "8px",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: questions[currentIndex]?.questionText || "",
                  }}
                />
              </Card>

              {/* Answer Section */}
              <Card
                style={{
                  marginBottom: "24px",
                  borderRadius: "8px",
                  border: "1px solid #f0f0f0",
                }}
                title={
                  <Space>
                    <PenTool size={16} color="#722ed1" />
                    <span style={{ fontSize: "16px", fontWeight: "600" }}>
                      Câu trả lời của bạn
                    </span>
                  </Space>
                }
              >
                <TextArea
                  placeholder="Nhập câu trả lời của bạn tại đây..."
                  rows={8}
                  value={answers[currentIndex] || ""}
                  onChange={(e) =>
                    handleAnswerChange(currentIndex, e.target.value)
                  }
                  disabled={isFinished[currentIndex]}
                  style={{
                    fontSize: "16px",
                    borderRadius: "8px",
                    border: isFinished[currentIndex]
                      ? "2px solid #52c41a"
                      : "1px solid #d9d9d9",
                  }}
                />

                {/* Action Buttons */}
                <div style={{ marginTop: "16px", textAlign: "center" }}>
                  <Space>
                    {isWritingCountDown[currentIndex] && (
                      <Button
                        type="primary"
                        icon={<Check size={16} />}
                        onClick={() => finishWriting(currentIndex)}
                        style={{
                          background: "#52c41a",
                          borderColor: "#52c41a",
                          borderRadius: "6px",
                        }}
                      >
                        Hoàn thành
                      </Button>
                    )}
                    {isFinished[currentIndex] && (
                      <Tag
                        color="success"
                        style={{
                          padding: "8px 16px",
                          fontSize: "14px",
                          borderRadius: "16px",
                        }}
                      >
                        <Check size={16} style={{ marginRight: "8px" }} />
                        Đã hoàn thành
                      </Tag>
                    )}
                  </Space>
                </div>
              </Card>

              <Divider />

              {/* Navigation */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  {currentIndex > 0 && (
                    <Button
                      icon={<ChevronLeft size={16} />}
                      onClick={showPreviousQuestion}
                      style={{
                        borderColor: "#722ed1",
                        color: "#722ed1",
                      }}
                    >
                      Câu trước
                    </Button>
                  )}
                </div>

                <div style={{ textAlign: "center" }}>
                  <Progress
                    percent={Math.round(
                      ((currentIndex + 1) / questions.length) * 100
                    )}
                    size="small"
                    strokeColor="#722ed1"
                    style={{ width: "200px" }}
                  />
                  <Text
                    style={{
                      color: "#666",
                      fontSize: "12px",
                      marginTop: "4px",
                    }}
                  >
                    {currentIndex + 1} / {questions.length} câu hỏi
                  </Text>
                </div>

                <div>
                  {isFinished[currentIndex] &&
                    currentIndex < questions.length - 1 && (
                      <Button
                        type="primary"
                        icon={<ChevronRight size={16} />}
                        onClick={showNextQuestion}
                        style={{
                          background: "#722ed1",
                          borderColor: "#722ed1",
                        }}
                      >
                        Câu tiếp theo
                      </Button>
                    )}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default No1To5;
