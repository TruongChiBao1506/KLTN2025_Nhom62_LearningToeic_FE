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
  Progress,
  message,
  Pagination,
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
  Users,
  Trash2,
} from "lucide-react";
import userVocabularyService from "../../../services/userVocabularyService";

const { Title, Text } = Typography;

const UserVocabulary = () => {
  const [userVocabularies, setUserVocabularies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statistics, setStatistics] = useState({
    total: 0,
    learned: 0,
    practicing: 0,
    mastered: 0,
  });

  useEffect(() => {

    // Đặt tiêu đề cho tab trình duyệt
    document.title = "Từ vựng đã lưu | TOEIC Learning Platform";

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

  const practicePronunciation = (record, displayIndex) => {
    // Tính toán index thực trong danh sách tổng
    const actualIndex = (currentPage - 1) * pageSize + displayIndex;
    
    // Nếu đang thu âm, dừng lại
    if (isSpeaking && activeIndex === actualIndex) {
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
    setActiveIndex(actualIndex);
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

      updatedVocabularies[actualIndex] = currentRecord;
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

  // Hàm xóa từ vựng khỏi danh sách yêu thích
  const removeVocabularyFromFavorites = async (record) => {
    try {
      setLoading(true);
      
      // Sử dụng vocabularyId từ record
      const vocabularyId = record.vocabulary._id || record.vocabulary;
      
      console.log("Removing vocabulary with ID:", vocabularyId);
      
      await userVocabularyService.removeFromFavorites(vocabularyId);
      
      // Cập nhật danh sách từ vựng local
      const updatedVocabularies = userVocabularies.filter(
        (item) => item._id !== record._id
      );
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
      
      // Reset về trang 1 nếu trang hiện tại không còn dữ liệu
      const totalPages = Math.ceil(updatedVocabularies.length / pageSize);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(1);
      }
      
      message.success(`Đã xóa "${record.vocabulary.word}" khỏi danh sách yêu thích`);
    } catch (error) {
      console.error("Lỗi khi xóa từ vựng:", error);
      message.error("Không thể xóa từ vựng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Định nghĩa columns cho Ant Design Table
  const columns = [
    {
      title: "Chủ đề",
      dataIndex: ["vocabulary", "topic", "topicName"],
      key: "topic",
      width: 140,
      render: (text) => (
        <div style={{
          background: "linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)",
          padding: "8px 12px",
          borderRadius: "10px",
          border: "1px solid #91d5ff",
          textAlign: "center"
        }}>
          <BookOpen size={14} style={{ color: "#1890ff", marginBottom: "4px", display: "block", margin: "0 auto 4px" }} />
          <Text style={{ 
            color: "#0958d9", 
            fontSize: "12px", 
            fontWeight: "600",
            display: "block",
            lineHeight: "1.2"
          }}>
            {text}
          </Text>
        </div>
      ),
    },
    {
      title: "Từ vựng",
      dataIndex: ["vocabulary", "word"],
      key: "word",
      width: 200,
      render: (text, record, index) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Image
            src={getImageUrl(record.vocabulary)}
            alt={record.vocabulary.word}
            width={50}
            height={50}
            style={{
              borderRadius: "10px",
              objectFit: "cover",
              border: "2px solid #f0f0f0",
            }}
            placeholder={
              <div
                style={{
                  width: 50,
                  height: 50,
                  background: "linear-gradient(135deg, #f0f0f0 0%, #e6f7ff 100%)",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #d6e4ff",
                }}
              >
                <BookOpen size={18} style={{ color: "#1890ff" }} />
              </div>
            }
            fallback="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop"
          />
          <div>
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
                display: "block",
                marginBottom: "4px"
              }}
            >
              {text}
            </Text>
            {record.vocabulary.ipa && (
              <Text
                code
                style={{
                  background: "linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)",
                  color: "#389e0d",
                  borderRadius: "4px",
                  border: "1px solid #b7eb8f",
                  fontSize: "12px",
                  padding: "2px 6px"
                }}
              >
                {record.vocabulary.ipa}
              </Text>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Nghĩa",
      dataIndex: ["vocabulary", "meaning"],
      key: "meaning",
      width: 180,
      render: (text) => (
        <div style={{
          padding: "6px 10px",
          background: "linear-gradient(135deg, #fff7e6 0%, #ffd591 100%)",
          borderRadius: "6px",
          border: "1px solid #ffec8b",
          fontSize: "13px",
          color: "#d46b08",
          fontWeight: "500",
          maxWidth: "160px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }}
        title={text}
        >
          {text}
        </div>
      ),
    },
    {
      title: "Trạng thái & Tiến độ",
      key: "status",
      width: 200,
      render: (_, record) => {
        let status = { color: "default", icon: null, text: "Chưa học", bgColor: "#f5f5f5" };

        if (record.isLearned) {
          status = {
            color: "success",
            icon: <CheckCircle size={12} />,
            text: "Đã học",
            bgColor: "linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)"
          };
        } else if (record.proficiencyLevel >= 80) {
          status = {
            color: "success",
            icon: <Trophy size={12} />,
            text: "Thành thạo",
            bgColor: "linear-gradient(135deg, #fff0f6 0%, #ffadd6 100%)"
          };
        } else if (record.reviewCount > 0) {
          status = {
            color: "processing",
            icon: <RotateCcw size={12} />,
            text: "Đang học",
            bgColor: "linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)"
          };
        }

        return (
          <div className={record.isCorrect !== null ? "status-change" : ""}>
            {/* Status Tag */}
            <div style={{
              background: status.bgColor,
              padding: "6px 12px",
              borderRadius: "8px",
              border: `1px solid ${
                status.color === "success" ? "#b7eb8f" : 
                status.color === "processing" ? "#91d5ff" : "#d9d9d9"
              }`,
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}>
              {status.icon}
              <Text style={{ 
                fontSize: "12px", 
                fontWeight: "500",
                color: status.color === "success" ? "#389e0d" : 
                       status.color === "processing" ? "#0958d9" : "#8c8c8c"
              }}>
                {status.text}
              </Text>
            </div>
            
            {/* Progress Bar */}
            <div style={{ width: "100%" }}>
              <Progress
                percent={record.proficiencyLevel}
                size="small"
                strokeColor={
                  record.proficiencyLevel >= 80 
                    ? "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)" 
                    : record.proficiencyLevel >= 50 
                      ? "linear-gradient(135deg, #faad14 0%, #ffc53d 100%)" 
                      : "linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)"
                }
                trailColor="#f5f5f5"
                format={(percent) => `${percent}%`}
                style={{
                  transition: "all 0.3s ease-in-out",
                }}
                strokeWidth={8}
              />
            </div>
            
            {/* Review Count */}
            {record.reviewCount > 0 && (
              <div style={{
                marginTop: "6px",
                fontSize: "11px",
                color: "#8c8c8c",
                textAlign: "center",
                background: "#fafafa",
                padding: "2px 6px",
                borderRadius: "4px",
                border: "1px solid #f0f0f0"
              }}>
                🎯 {record.reviewCount} lần thử
              </div>
            )}
            
            {/* Success/Error feedback */}
            {record.isCorrect === true && (
              <div style={{
                marginTop: "6px",
                fontSize: "11px",
                color: "#52c41a",
                fontWeight: "500",
                animation: "fadeIn 0.5s ease-in-out",
                textAlign: "center",
                background: "linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)",
                padding: "3px 8px",
                borderRadius: "6px",
                border: "1px solid #b7eb8f"
              }}>
                +10 điểm! 🎯
              </div>
            )}
            {record.isCorrect === false && (
              <div style={{
                marginTop: "6px",
                fontSize: "11px",
                color: "#ff4d4f",
                fontWeight: "500",
                animation: "fadeIn 0.5s ease-in-out",
                textAlign: "center",
                background: "linear-gradient(135deg, #fff2f0 0%, #ffccc7 100%)",
                padding: "3px 8px",
                borderRadius: "6px",
                border: "1px solid #ffaaa5"
              }}>
                -5 điểm 📚
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Phát âm của bạn",
      key: "pronunciation",
      width: 180,
      render: (_, record, index) => {
        const actualIndex = (currentPage - 1) * pageSize + index;
        return (
        <Space size="middle" direction="vertical" style={{ width: "100%" }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Button
              type="primary"
              size="small"
              icon={<Volume2 size={14} />}
              onClick={() => speakWord(record.vocabulary)}
              style={{ 
                borderRadius: "8px",
                background: "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
                border: "none",
                boxShadow: "0 2px 8px rgba(24, 144, 255, 0.3)",
              }}
              className="pronunciation-btn"
            >
              Nghe
            </Button>
            <Button
              type={isSpeaking && activeIndex === actualIndex ? "danger" : "default"}
              size="small"
              icon={
                isSpeaking && activeIndex === actualIndex ? (
                  <MicOff size={14} />
                ) : (
                  <Mic size={14} />
                )
              }
              onClick={() => practicePronunciation(record, index)}
              style={{ 
                borderRadius: "8px",
                background: isSpeaking && activeIndex === actualIndex 
                  ? "linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)"
                  : "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                border: "none",
                color: "white",
                boxShadow: isSpeaking && activeIndex === actualIndex
                  ? "0 2px 8px rgba(255, 77, 79, 0.3)"
                  : "0 2px 8px rgba(82, 196, 26, 0.3)",
              }}
              loading={isSpeaking && activeIndex === actualIndex}
              className="pronunciation-btn"
            >
              {isSpeaking && activeIndex === actualIndex ? "Đang nghe" : "Thử"}
            </Button>
          </div>
          
          {/* Hiển thị kết quả phát âm */}
          {record.isCorrect !== null && (
            <div style={{
              padding: "6px 10px",
              borderRadius: "6px",
              fontSize: "12px",
              textAlign: "center",
              background: record.isCorrect 
                ? "linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)"
                : "linear-gradient(135deg, #fff2f0 0%, #ffccc7 100%)",
              border: `1px solid ${record.isCorrect ? "#b7eb8f" : "#ffaaa5"}`,
              color: record.isCorrect ? "#389e0d" : "#cf1322",
              fontWeight: "500"
            }}>
              {record.isCorrect ? (
                <span>✅ Chính xác!</span>
              ) : (
                <span>❌ Thử lại: "{record.lowerTranscript}"</span>
              )}
            </div>
          )}
        </Space>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <div style={{ textAlign: "center" }}>
          <Button
            type="text"
            danger
            icon={<Trash2 size={16} />}
            onClick={() => removeVocabularyFromFavorites(record)}
            style={{
              borderRadius: "8px",
              background: "linear-gradient(135deg, #fff2f0 0%, #ffccc7 100%)",
              border: "1px solid #ffaaa5",
              color: "#cf1322",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              width: "100%",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)";
              e.target.style.color = "white";
              e.target.style.borderColor = "#ff4d4f";
              e.target.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "linear-gradient(135deg, #fff2f0 0%, #ffccc7 100%)";
              e.target.style.color = "#cf1322";
              e.target.style.borderColor = "#ffaaa5";
              e.target.style.transform = "scale(1)";
            }}
            title="Xóa khỏi danh sách yêu thích"
          >
            Xóa
          </Button>
        </div>
      ),
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

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes sparkle {
          0% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.2) rotate(180deg); }
          100% { transform: scale(1) rotate(360deg); }
        }

        .proficiency-update {
          animation: pulse 0.6s ease-in-out;
        }

        .status-change {
          animation: fadeIn 0.8s ease-in-out;
        }

        .pronunciation-btn {
          transition: all 0.3s ease;
        }

        .pronunciation-btn:hover {
          transform: scale(1.05);
        }

        .success-sparkle {
          animation: sparkle 0.8s ease-in-out;
        }

        /* Custom Pagination Styles */
        .custom-pagination {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .custom-pagination .ant-pagination-item {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 32px !important;
          height: 32px !important;
          min-width: 32px !important;
          margin-inline-end: 8px !important;
          border-radius: 6px !important;
          border: 1px solid #d9d9d9 !important;
          background: white !important;
          transition: all 0.3s ease !important;
          line-height: 30px !important;
        }

        .custom-pagination .ant-pagination-item a {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 100% !important;
          height: 100% !important;
          color: #262626 !important;
          font-weight: 500 !important;
          font-size: 14px !important;
          text-decoration: none !important;
        }

        .custom-pagination .ant-pagination-item-active {
          background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%) !important;
          border-color: #1890ff !important;
          box-shadow: 0 2px 4px rgba(24, 144, 255, 0.3) !important;
        }

        .custom-pagination .ant-pagination-item-active a {
          color: white !important;
        }

        .custom-pagination .ant-pagination-prev,
        .custom-pagination .ant-pagination-next {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 32px !important;
          height: 32px !important;
          margin-inline-end: 8px !important;
          border-radius: 6px !important;
          border: 1px solid #d9d9d9 !important;
          background: white !important;
          transition: all 0.3s ease !important;
          line-height: 30px !important;
        }

        .custom-pagination .ant-pagination-prev .ant-pagination-item-link,
        .custom-pagination .ant-pagination-next .ant-pagination-item-link {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 100% !important;
          height: 100% !important;
          border: none !important;
          background: transparent !important;
          color: #8c8c8c !important;
          font-size: 14px !important;
        }

        .custom-pagination .ant-pagination-jump-prev,
        .custom-pagination .ant-pagination-jump-next {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 32px !important;
          height: 32px !important;
          margin-inline-end: 8px !important;
          border-radius: 6px !important;
          border: 1px solid #d9d9d9 !important;
          background: white !important;
          transition: all 0.3s ease !important;
          line-height: 30px !important;
        }

        .custom-pagination .ant-pagination-jump-prev .ant-pagination-item-link,
        .custom-pagination .ant-pagination-jump-next .ant-pagination-item-link {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 100% !important;
          height: 100% !important;
          border: none !important;
          background: transparent !important;
          color: #8c8c8c !important;
          font-size: 12px !important;
        }

        .custom-pagination .ant-pagination-prev:hover,
        .custom-pagination .ant-pagination-next:hover,
        .custom-pagination .ant-pagination-jump-prev:hover,
        .custom-pagination .ant-pagination-jump-next:hover,
        .custom-pagination .ant-pagination-item:hover {
          border-color: #1890ff !important;
          background: #f0f8ff !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 2px 6px rgba(24, 144, 255, 0.2) !important;
        }

        .custom-pagination .ant-pagination-item:hover a {
          color: #1890ff !important;
        }

        .custom-pagination .ant-pagination-options {
          margin-left: 16px !important;
        }

        .custom-pagination .ant-pagination-simple-pager {
          margin-left: 8px !important;
        }

        .custom-pagination .ant-select-selector {
          height: 32px !important;
          border-radius: 6px !important;
        }

        .custom-pagination .ant-pagination-simple-pager input {
          height: 32px !important;
          border-radius: 6px !important;
          text-align: center !important;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .ant-pagination {
            flex-wrap: wrap !important;
            justify-content: center !important;
            gap: 8px !important;
          }
        }
      `}</style>

      {/* Header - Keep Original */}
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
          Quản lý và luyện tập từ vựng đã học • Phát âm chính xác để tăng độ thành thạo
        </Text>
      </div>

      {/* Statistics Cards - Keep Original */}
      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: "12px", border: "1px solid #d6e4ff" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#1890ff", marginBottom: "8px" }}>
                <Users size={20} />
              </div>
              <Text strong style={{ fontSize: "24px", color: "#1890ff", display: "block" }}>
                {statistics.total}
              </Text>
              <Text type="secondary">Tổng từ vựng</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: "12px", border: "1px solid #d9f7be" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#52c41a", marginBottom: "8px" }}>
                <CheckCircle size={20} />
              </div>
              <Text strong style={{ fontSize: "24px", color: "#52c41a", display: "block" }}>
                {statistics.learned}
              </Text>
              <Text type="secondary">Đã học</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: "12px", border: "1px solid #fff7e6" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#fa8c16", marginBottom: "8px" }}>
                <Target size={20} />
              </div>
              <Text strong style={{ fontSize: "24px", color: "#fa8c16", display: "block" }}>
                {statistics.practicing}
              </Text>
              <Text type="secondary">Đang luyện tập</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: "12px", border: "1px solid #fff0f6" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#eb2f96", marginBottom: "8px" }}>
                <Trophy size={20} />
              </div>
              <Text strong style={{ fontSize: "24px", color: "#eb2f96", display: "block" }}>
                {statistics.mastered}
              </Text>
              <Text type="secondary">Thành thạo</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Enhanced Vocabulary Table Only */}
      <Card
        style={{
          borderRadius: "12px",
          border: "none",
          background: "white",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          overflow: "hidden",
        }}
        bodyStyle={{ padding: "0" }}
      >
        {/* Table Header */}
        <div style={{
          background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
          padding: "24px 32px",
          borderBottom: "1px solid #f0f0f0"
        }}>
          <Title level={3} style={{ 
            margin: 0, 
            color: "#1890ff",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <BookOpen size={24} />
            Danh sách từ vựng
            <Tag 
              color="blue" 
              style={{ 
                marginLeft: "8px",
                borderRadius: "12px",
                padding: "4px 12px",
                fontSize: "14px"
              }}
            >
              {statistics.total} từ
            </Tag>
          </Title>
          <Text type="secondary" style={{ fontSize: "14px", marginTop: "4px", display: "block" }}>
            Luyện tập phát âm để nâng cao độ thành thạo
          </Text>
        </div>
        
        <div style={{ padding: "0" }}>
          <div style={{ padding: "24px 32px", paddingBottom: "0" }}>
            <Table
              columns={columns}
              dataSource={userVocabularies.slice(
                (currentPage - 1) * pageSize,
                currentPage * pageSize
              )}
              pagination={false}
              scroll={{ x: 1100 }}
              size="middle"
              style={{ 
                borderRadius: "12px",
                background: "white"
              }}
              rowClassName={(record, index) => 
                record.isCorrect === true ? "success-sparkle" : ""
              }
            />
          </div>
          
          {/* Custom Pagination */}
          <div style={{
            padding: "20px 32px",
            borderTop: "1px solid #f0f0f0",
            background: "linear-gradient(135deg, #fafbfc 0%, #ffffff 100%)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            minHeight: "60px"
          }}>
            <div style={{
              color: "#8c8c8c",
              fontSize: "14px",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flex: "0 0 auto"
            }}>
              <span style={{
                background: "linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)",
                padding: "4px 8px",
                borderRadius: "12px",
                border: "1px solid #91d5ff",
                fontSize: "12px",
                color: "#0958d9",
                fontWeight: "600",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                📚
              </span>
              Hiển thị {Math.min(pageSize, userVocabularies.length - (currentPage - 1) * pageSize)} 
              {userVocabularies.length > pageSize ? ` / ${userVocabularies.length}` : ''} từ vựng
            </div>
            
            {userVocabularies.length > pageSize && (
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: "0 0 auto"
              }}>
                <Pagination
                  current={currentPage}
                  total={userVocabularies.length}
                  pageSize={pageSize}
                  showSizeChanger={true}
                  showQuickJumper={true}
                  size="default"
                  responsive={true}
                  pageSizeOptions={['10', '20', '50', '100']}
                  onShowSizeChange={(current, size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                  onChange={(page, pageSize) => {
                    setCurrentPage(page);
                  }}
                  className="custom-pagination"
                />
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserVocabulary;
