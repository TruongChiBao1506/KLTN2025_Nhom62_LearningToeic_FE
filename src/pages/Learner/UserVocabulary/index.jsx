import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Typography,
  Button,
  Space,
  Image,
  Tag,
  Spin,
  Alert,
  Row,
  Col,
  Statistic,
  Progress,
  message,
} from "antd";
import {
  Volume2,
  Mic,
  MicOff,
  BookOpen,
  Target,
  Trophy,
  RotateCcw,
  CheckCircle,
  XCircle,
  Users,
} from "lucide-react";
import userVocabularyService from "../../../services/userVocabularyService";

const { Title, Text } = Typography;

const UserVocabulary = () => {
  const [userVocabularies, setUserVocabularies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [statistics, setStatistics] = useState({
    total: 0,
    learned: 0,
    practicing: 0,
    mastered: 0,
  });

  useEffect(() => {
    const loadUserVocabularies = async () => {
      try {
        setLoading(true);
        const response = await userVocabularyService.getUserVocabularies();
        console.log("🚀 ~ loadUserVocabularies ~ response:", response);

        if (response && response.userVocabularies) {
          // Xử lý dữ liệu từ API response
          const vocabulariesWithStatus = response.userVocabularies.map(
            (item) => ({
              ...item,
              isCorrect: null,
              lowerTranscript: "",
              key: item._id, // Thêm key cho Ant Design Table
            })
          );

          setUserVocabularies(vocabulariesWithStatus);

          // Tính toán thống kê
          const stats = {
            total: vocabulariesWithStatus.length,
            learned: vocabulariesWithStatus.filter((item) => item.isLearned)
              .length,
            practicing: vocabulariesWithStatus.filter(
              (item) => item.reviewCount > 0 && !item.isLearned
            ).length,
            mastered: vocabulariesWithStatus.filter(
              (item) => item.proficiencyLevel >= 80
            ).length,
          };
          setStatistics(stats);
        }
      } catch (error) {
        console.error("Lỗi khi tải từ vựng:", error);
        setError("Không thể tải từ vựng. Vui lòng thử lại sau.");
        message.error("Không thể tải từ vựng. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    loadUserVocabularies();
  }, []);

  const getImageUrl = (vocabularyData) => {
    // Mapping hình ảnh phù hợp với từ vựng và chủ đề
    const word = vocabularyData.word.toLowerCase();
    const topicName = vocabularyData.topic.topicName.toLowerCase();

    // Mapping theo từ vựng cụ thể
    const specificWordImages = {
      exchange:
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
      shopping:
        "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=300&fit=crop",
      retail:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
      store:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      payment:
        "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop",
      customer:
        "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=300&fit=crop",
      business:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
      travel:
        "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop",
      hotel:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
      restaurant:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
      food: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop",
      technology:
        "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
      computer:
        "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=400&h=300&fit=crop",
      education:
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop",
      health:
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop",
      environment:
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
    };

    // Mapping theo chủ đề
    const topicImages = {
      shopping:
        "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=300&fit=crop",
      retail:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
      business:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
      travel:
        "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop",
      food: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop",
      technology:
        "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
      education:
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop",
      health:
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop",
      environment:
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
    };

    // Ưu tiên từ vựng cụ thể trước, sau đó đến chủ đề
    return (
      specificWordImages[word] ||
      topicImages[topicName] ||
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop"
    ); // Default image
  };

  const speakWord = (vocabulary) => {
    const utterance = new SpeechSynthesisUtterance(vocabulary.word);
    utterance.lang = "en-US";
    utterance.rate = 0.8;

    // Kiểm tra và chọn giọng nói phù hợp
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(
      (voice) =>
        voice.name === "Google US English" ||
        voice.name ===
          "Microsoft Aria Online (Natural) - English (United States)" ||
        voice.lang === "en-US"
    );

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    window.speechSynthesis.speak(utterance);
    message.success(`Đang phát âm: ${vocabulary.word}`);
  };

  const practicePronunciation = (record, index) => {
    // Nếu đang thu âm, dừng lại
    if (isSpeaking && activeIndex === index) {
      if (window.currentRecognition) {
        window.currentRecognition.stop();
      }
      setIsSpeaking(false);
      setActiveIndex(null);
      message.info("Đã dừng thu âm");
      return;
    }

    // Bắt đầu thu âm
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      message.error("Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;

    setIsSpeaking(true);
    setActiveIndex(index);
    message.info("Đang thu âm... Hãy nói từ: " + record.vocabulary.word);

    recognition.onresult = (event) => {
      const lastResultIndex = event.results.length - 1;
      const transcriptValue = event.results[lastResultIndex][0].transcript;
      const lowerTranscript = transcriptValue.toLowerCase().trim();

      const isCorrect =
        lowerTranscript === record.vocabulary.word.toLowerCase();

      // Cập nhật state cho từ vựng hiện tại
      const updatedVocabularies = [...userVocabularies];
      const currentRecord = { ...record };

      // Cập nhật phát âm
      currentRecord.isCorrect = isCorrect;
      currentRecord.lowerTranscript = lowerTranscript;

      // Cập nhật độ thành thạo và trạng thái
      if (isCorrect) {
        // Tăng độ thành thạo khi phát âm đúng
        const newProficiencyLevel = Math.min(
          100,
          currentRecord.proficiencyLevel + 10
        );
        currentRecord.proficiencyLevel = newProficiencyLevel;

        // Tăng số lần review
        currentRecord.reviewCount = (currentRecord.reviewCount || 0) + 1;

        // Cập nhật trạng thái học tập
        if (newProficiencyLevel >= 80 && currentRecord.reviewCount >= 3) {
          currentRecord.isLearned = true;
        }

        message.success(
          `Phát âm chính xác! 🎉 Độ thành thạo: ${newProficiencyLevel}%`
        );
      } else {
        // Giảm độ thành thạo nhẹ khi phát âm sai (nhưng không xuống dưới 0)
        const newProficiencyLevel = Math.max(
          0,
          currentRecord.proficiencyLevel - 5
        );
        currentRecord.proficiencyLevel = newProficiencyLevel;

        // Vẫn tăng số lần review (thử nghiệm)
        currentRecord.reviewCount = (currentRecord.reviewCount || 0) + 1;

        message.warning(
          `Phát âm chưa chính xác. Bạn nói: "${lowerTranscript}". Độ thành thạo: ${newProficiencyLevel}%`
        );
      }

      updatedVocabularies[index] = currentRecord;
      setUserVocabularies(updatedVocabularies);

      // Cập nhật lại thống kê
      const stats = {
        total: updatedVocabularies.length,
        learned: updatedVocabularies.filter((item) => item.isLearned).length,
        practicing: updatedVocabularies.filter(
          (item) => item.reviewCount > 0 && !item.isLearned
        ).length,
        mastered: updatedVocabularies.filter(
          (item) => item.proficiencyLevel >= 80
        ).length,
      };
      setStatistics(stats);
    };

    recognition.onend = () => {
      setIsSpeaking(false);
      setActiveIndex(null);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      message.error("Lỗi nhận dạng giọng nói. Vui lòng thử lại.");
      setIsSpeaking(false);
      setActiveIndex(null);
    };

    recognition.start();
    window.currentRecognition = recognition;
  };

  // Cấu hình giọng nói khi component mount
  useEffect(() => {
    const setupVoices = () => {
      window.speechSynthesis.getVoices();
    };

    setupVoices();

    // Đăng ký event listener cho 'voiceschanged'
    if (window.speechSynthesis) {
      window.speechSynthesis.addEventListener("voiceschanged", setupVoices);
    }

    // Cleanup khi component unmount
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.removeEventListener(
          "voiceschanged",
          setupVoices
        );
        window.speechSynthesis.cancel();
      }

      if (window.currentRecognition) {
        window.currentRecognition.stop();
      }
    };
  }, []);

  // Định nghĩa columns cho Ant Design Table
  const columns = [
    {
      title: "Chủ đề",
      dataIndex: ["vocabulary", "topic", "topicName"],
      key: "topic",
      width: 150,
      render: (text) => (
        <Tag color="blue" style={{ borderRadius: "6px" }}>
          <BookOpen size={12} style={{ marginRight: "4px" }} />
          {text}
        </Tag>
      ),
    },
    {
      title: "Từ vựng",
      dataIndex: ["vocabulary", "word"],
      key: "word",
      width: 150,
      render: (text, record, index) => (
        <Text
          strong
          style={{
            color:
              record.isCorrect === null
                ? "#262626"
                : record.isCorrect
                ? "#52c41a"
                : "#ff4d4f",
            fontSize: "16px",
          }}
        >
          {text}
        </Text>
      ),
    },
    {
      title: "Hình ảnh",
      dataIndex: ["vocabulary", "image"],
      key: "image",
      width: 100,
      render: (image, record) => (
        <Image
          src={getImageUrl(record.vocabulary)}
          alt={record.vocabulary.word}
          width={60}
          height={60}
          style={{
            borderRadius: "8px",
            objectFit: "cover",
          }}
          placeholder={
            <div
              style={{
                width: 60,
                height: 60,
                background: "#f0f0f0",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BookOpen size={20} style={{ color: "#bfbfbf" }} />
            </div>
          }
          fallback="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop"
        />
      ),
    },
    {
      title: "Phiên âm",
      dataIndex: ["vocabulary", "ipa"],
      key: "ipa",
      width: 120,
      render: (text) => (
        <Text
          code
          style={{
            background: "#f6ffed",
            color: "#52c41a",
            borderRadius: "4px",
          }}
        >
          {text}
        </Text>
      ),
    },
    {
      title: "Nghĩa",
      dataIndex: ["vocabulary", "meaning"],
      key: "meaning",
      width: 200,
      render: (text) => <Text style={{ fontSize: "14px" }}>{text}</Text>,
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 140,
      render: (_, record) => {
        let status = { color: "default", icon: null, text: "Chưa học" };

        if (record.isLearned) {
          status = {
            color: "success",
            icon: <CheckCircle size={12} />,
            text: "Đã học",
          };
        } else if (record.proficiencyLevel >= 80) {
          status = {
            color: "success",
            icon: <Trophy size={12} />,
            text: "Thành thạo",
          };
        } else if (record.reviewCount > 0) {
          status = {
            color: "processing",
            icon: <RotateCcw size={12} />,
            text: "Đang học",
          };
        }

        return (
          <div className={record.isCorrect !== null ? "status-change" : ""}>
            <Tag color={status.color} icon={status.icon}>
              {status.text}
            </Tag>
            {record.reviewCount > 0 && (
              <div
                style={{
                  fontSize: "10px",
                  color: "#8c8c8c",
                  marginTop: "2px",
                }}
              >
                {record.reviewCount} lần thử
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Độ thành thạo",
      dataIndex: "proficiencyLevel",
      key: "proficiencyLevel",
      width: 150,
      render: (level, record) => (
        <div style={{ width: "100%" }}>
          <Progress
            percent={level}
            size="small"
            strokeColor={
              level >= 80 ? "#52c41a" : level >= 50 ? "#faad14" : "#ff4d4f"
            }
            format={(percent) => `${percent}%`}
            style={{
              transition: "all 0.3s ease-in-out",
            }}
          />
          {/* Hiển thị badge nếu vừa thay đổi */}
          {record.isCorrect === true && (
            <div
              style={{
                marginTop: "4px",
                fontSize: "10px",
                color: "#52c41a",
                fontWeight: "500",
                animation: "fadeIn 0.5s ease-in-out",
              }}
            >
              +10 điểm! 🎯
            </div>
          )}
          {record.isCorrect === false && (
            <div
              style={{
                marginTop: "4px",
                fontSize: "10px",
                color: "#ff4d4f",
                fontWeight: "500",
                animation: "fadeIn 0.5s ease-in-out",
              }}
            >
              -5 điểm 📚
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 150,
      render: (_, record, index) => (
        <Space size="small">
          <Button
            type="primary"
            ghost
            size="small"
            icon={<Volume2 size={14} />}
            onClick={() => speakWord(record.vocabulary)}
            style={{ borderRadius: "6px" }}
          />
          <Button
            type={isSpeaking && activeIndex === index ? "danger" : "default"}
            size="small"
            icon={
              isSpeaking && activeIndex === index ? (
                <MicOff size={14} />
              ) : (
                <Mic size={14} />
              )
            }
            onClick={() => practicePronunciation(record, index)}
            style={{ borderRadius: "6px" }}
            loading={isSpeaking && activeIndex === index}
          />
        </Space>
      ),
    },
    {
      title: "Phát âm của bạn",
      dataIndex: "lowerTranscript",
      key: "transcript",
      width: 180,
      render: (text, record) => {
        if (!text) return <Text type="secondary">Chưa thử</Text>;

        return (
          <Space direction="vertical" size={0}>
            <Text
              style={{
                color: record.isCorrect ? "#52c41a" : "#ff4d4f",
                fontWeight: "500",
              }}
            >
              {text}
            </Text>
            {record.isCorrect !== null && (
              <Tag
                color={record.isCorrect ? "success" : "error"}
                size="small"
                icon={
                  record.isCorrect ? (
                    <CheckCircle size={10} />
                  ) : (
                    <XCircle size={10} />
                  )
                }
              >
                {record.isCorrect ? "Chính xác" : "Chưa đúng"}
              </Tag>
            )}
          </Space>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          background: "linear-gradient(135deg, #f0f2f5 0%, #ffffff 100%)",
        }}
      >
        <Card
          style={{
            textAlign: "center",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            padding: "24px",
            border: "none",
          }}
        >
          <Spin size="large" />
          <Title
            level={4}
            style={{ marginTop: "16px", marginBottom: "8px", color: "#1890ff" }}
          >
            Đang tải từ vựng cá nhân...
          </Title>
          <Text type="secondary">Vui lòng chờ trong giây lát</Text>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "24px" }}>
        <Alert
          message="Lỗi tải dữ liệu"
          description={error}
          type="error"
          showIcon
          style={{ borderRadius: "8px" }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "24px",
        background: "linear-gradient(135deg, #f0f2f5 0%, #ffffff 100%)",
        minHeight: "100vh",
      }}
    >
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }

        .proficiency-update {
          animation: pulse 0.6s ease-in-out;
        }

        .status-change {
          animation: fadeIn 0.8s ease-in-out;
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <Title
          level={2}
          style={{
            marginBottom: "8px",
            background: "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          <BookOpen
            size={28}
            style={{ marginRight: "12px", color: "#1890ff" }}
          />
          Từ vựng cá nhân
        </Title>
        <Text type="secondary" style={{ fontSize: "16px" }}>
          Quản lý và luyện tập từ vựng đã học • Phát âm chính xác để tăng độ
          thành thạo
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: "12px", border: "1px solid #d6e4ff" }}>
            <Statistic
              title="Tổng từ vựng"
              value={statistics.total}
              prefix={<Users size={20} style={{ color: "#1890ff" }} />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: "12px", border: "1px solid #d9f7be" }}>
            <Statistic
              title="Đã học"
              value={statistics.learned}
              prefix={<CheckCircle size={20} style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: "12px", border: "1px solid #fff7e6" }}>
            <Statistic
              title="Đang luyện tập"
              value={statistics.practicing}
              prefix={<Target size={20} style={{ color: "#fa8c16" }} />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: "12px", border: "1px solid #fff0f6" }}>
            <Statistic
              title="Thành thạo"
              value={statistics.mastered}
              prefix={<Trophy size={20} style={{ color: "#eb2f96" }} />}
              valueStyle={{ color: "#eb2f96" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Vocabulary Table */}
      <Card
        style={{
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          border: "none",
        }}
      >
        <Table
          columns={columns}
          dataSource={userVocabularies}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} từ vựng`,
          }}
          scroll={{ x: 1200 }}
          size="middle"
          style={{ borderRadius: "8px" }}
        />
      </Card>
    </div>
  );
};

export default UserVocabulary;
