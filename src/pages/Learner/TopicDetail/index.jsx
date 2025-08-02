import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Input,
  Button,
  Space,
  Spin,
  message,
} from "antd";
import {
  Volume2,
  BookOpen,
  Star,
  ArrowLeft,
  Search,
  Target,
  Zap,
  Play,
  CheckCircle,
} from "lucide-react";
// import "./style.css";

// Import services
import topicService from "../../../services/topicService";
import vocabularyService from "../../../services/vocabularyService";
import userVocabularyService from "../../../services/userVocabularyService";

const { Title, Text, Paragraph } = Typography;

// Function to get card color based on index
const getCardColor = (index) => {
  const colors = [
    "#667eea, #764ba2", // Purple gradient
    "#f093fb, #f5576c", // Pink gradient
    "#4facfe, #00f2fe", // Blue gradient
    "#43e97b, #38f9d7", // Green gradient
    "#ffecd2, #fcb69f", // Orange gradient
    "#a8edea, #fed6e3", // Mint gradient
    "#ffeaa7, #fab1a0", // Yellow gradient
    "#fd79a8, #fdcb6e", // Rose gradient
    "#6c5ce7, #a29bfe", // Violet gradient
    "#00b894, #00cec9", // Teal gradient
  ];
  return colors[index % colors.length];
};

const TopicDetail = () => {
  const { topicId } = useParams();

  // States
  const [topic, setTopic] = useState({});
  const [vocabularies, setVocabularies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [favoriteVocabs, setFavoriteVocabs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch topic and vocabulary data
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get topic details
        const topicResponse = await topicService.getById(topicId);
        console.log("🚀 ~ fetchData ~ topicResponse:", topicResponse);

        // Backend trả về data trực tiếp
        setTopic(topicResponse);

        // Get vocabularies by topic ID
        const vocabResponse = await vocabularyService.getByTopicId(topicId);
        console.log("🚀 ~ fetchData ~ vocabResponse:", vocabResponse);

        // Backend trả về array trực tiếp
        setVocabularies(Array.isArray(vocabResponse) ? vocabResponse : []);

        // Get user's favorite vocabularies (optional - user might not be logged in)
        try {
          const token = localStorage.getItem("learnerToken");
          if (token) {
            console.log("🚀 ~ fetchData ~ Loading user favorites...");
            // Sử dụng hàm refreshFavorites để tái sử dụng logic
            await refreshFavorites();
          } else {
            // User not logged in, skip favorites
            console.log("🚀 ~ User not logged in, skipping favorites");
            setFavoriteVocabs([]);
          }
        } catch (favoriteError) {
          console.warn(
            "Không thể tải danh sách từ vựng yêu thích:",
            favoriteError
          );
          console.warn("favoriteError details:", favoriteError.response?.data);
          // Continue without favorites - not critical
          setFavoriteVocabs([]);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu từ vựng:", error);
        message.error("Không thể tải dữ liệu từ vựng. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [topicId]);

  // Filter vocabularies based on search
  const filteredVocabularies = (vocabularies || []).filter((vocab) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (vocab.word && vocab.word.toLowerCase().includes(searchLower)) ||
      (vocab.meaning && vocab.meaning.toLowerCase().includes(searchLower)) ||
      (vocab.exampleSentence &&
        vocab.exampleSentence.toLowerCase().includes(searchLower))
    );
  });

  // Play pronunciation
  const playPronunciation = (word) => {
    const speech = new SpeechSynthesisUtterance(word);
    speech.lang = "en-US";
    window.speechSynthesis.speak(speech);
  };

  // Add vocabulary to favorites
  const toggleFavorite = async (vocabularyId) => {
    if (!vocabularyId) {
      message.error("ID từ vựng không hợp lệ");
      return;
    }

    // Check if user is authenticated
    const token = localStorage.getItem("learnerToken");
    if (!token) {
      message.warning("Vui lòng đăng nhập để sử dụng tính năng yêu thích");
      return;
    }

    try {
      const isCurrentlyFavorite = favoriteVocabs.includes(vocabularyId);
      console.log(
        "🚀 ~ toggleFavorite ~ isCurrentlyFavorite:",
        isCurrentlyFavorite
      );
      console.log("🚀 ~ toggleFavorite ~ vocabularyId:", vocabularyId);
      console.log("🚀 ~ toggleFavorite ~ favoriteVocabs:", favoriteVocabs);

      if (isCurrentlyFavorite) {
        // Remove from favorites
        try {
          await userVocabularyService.removeFromFavorites(vocabularyId);
          setFavoriteVocabs(favoriteVocabs.filter((id) => id !== vocabularyId));
          message.success("Đã xóa từ vựng khỏi danh sách yêu thích");
        } catch (removeError) {
          console.warn("Remove error:", removeError);
          // Even if backend says "not found", update frontend state
          setFavoriteVocabs(favoriteVocabs.filter((id) => id !== vocabularyId));
          if (
            removeError.response?.data?.message?.includes(
              "không có trong danh sách"
            )
          ) {
            message.info("Từ vựng đã được xóa khỏi danh sách");
          } else {
            message.success("Đã xóa từ vựng khỏi danh sách yêu thích");
          }
        }
      } else {
        // Add to favorites
        try {
          await userVocabularyService.addToFavorites(vocabularyId);
          // Thành công - cập nhật state frontend
          if (!favoriteVocabs.includes(vocabularyId)) {
            setFavoriteVocabs([...favoriteVocabs, vocabularyId]);
          }
          message.success("Đã thêm từ vựng vào danh sách yêu thích");
        } catch (addError) {
          console.warn("Add error:", addError);
          console.warn("Add error details:", addError.response?.data);

          // Xử lý trường hợp từ vựng đã tồn tại trong backend
          if (
            addError.response?.status === 400 &&
            addError.response?.data?.message?.includes("đã có trong danh sách")
          ) {
            console.log(
              "Vocabulary already exists in backend, syncing frontend state"
            );
            // Từ vựng đã có trong backend, đồng bộ state frontend
            if (!favoriteVocabs.includes(vocabularyId)) {
              setFavoriteVocabs([...favoriteVocabs, vocabularyId]);
            }
            message.info("Từ vựng đã có trong danh sách yêu thích");

            // Refresh toàn bộ danh sách để đảm bảo đồng bộ
            setTimeout(async () => {
              console.log("Refreshing favorites to ensure sync...");
              await refreshFavorites();
            }, 300);
          } else {
            // Lỗi khác - hiển thị thông báo lỗi
            console.error("Unexpected add error:", addError);
            if (addError.response?.status === 401) {
              message.error(
                "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
              );
            } else {
              message.error(
                "Không thể thêm từ vựng vào danh sách yêu thích. Vui lòng thử lại."
              );
            }
          }
        }
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật từ vựng yêu thích:", error);
      if (error.response?.status === 401) {
        message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else if (error.response?.status === 400) {
        message.warning("Có lỗi xảy ra với từ vựng này");
      } else {
        message.error(
          "Không thể cập nhật từ vựng yêu thích. Vui lòng thử lại sau."
        );
      }
    }
  };

  // Refresh favorites from backend
  const refreshFavorites = async () => {
    try {
      const token = localStorage.getItem("learnerToken");
      if (!token) {
        console.log("🚀 ~ refreshFavorites ~ No token, skipping");
        return [];
      }

      console.log("🚀 ~ refreshFavorites ~ Fetching from backend...");
      const favoritesResponse =
        await userVocabularyService.getUserVocabularies();
      console.log(
        "🚀 ~ refreshFavorites ~ favoritesResponse:",
        favoritesResponse
      );

      // Backend trả về object có userVocabularies array
      const userVocabularies = favoritesResponse?.userVocabularies || [];
      console.log(
        "🚀 ~ refreshFavorites ~ userVocabularies:",
        userVocabularies
      );

      const favoriteIds = Array.isArray(userVocabularies)
        ? userVocabularies
            .map((v, index) => {
              console.log(
                `🚀 ~ refreshFavorites ~ Processing item [${index}]:`,
                v
              );
              if (v.vocabulary?._id) {
                console.log(`🚀 ~ Using v.vocabulary._id: ${v.vocabulary._id}`);
                return v.vocabulary._id;
              }
              if (v.vocabulary && typeof v.vocabulary === "string") {
                console.log(
                  `🚀 ~ Using v.vocabulary as string: ${v.vocabulary}`
                );
                return v.vocabulary;
              }
              console.log(`🚀 ~ Could not extract ID from:`, v);
              return null;
            })
            .filter(Boolean)
        : [];

      console.log("🚀 ~ refreshFavorites ~ favoriteIds:", favoriteIds);
      setFavoriteVocabs(favoriteIds);
      return favoriteIds;
    } catch (error) {
      console.warn("Cannot refresh favorites:", error);
      return [];
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        minHeight: "100vh",
      }}
    >
      <div style={{ padding: "0 16px" }}>
        {/* Compact Header */}
        <Row
          style={{
            padding: "8px 0",
            borderBottom: "1px solid rgba(255,255,255,0.2)",
            backgroundColor: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(10px)",
            borderRadius: "0 0 12px 12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Col span={18}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <Link
                  to="/learner/topics"
                  style={{
                    color: "#667eea",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    marginRight: "16px",
                  }}
                >
                  <ArrowLeft size={14} style={{ marginRight: "4px" }} />
                  <Text style={{ fontSize: "12px", color: "#667eea" }}>
                    Quay lại
                  </Text>
                </Link>
                <div
                  style={{
                    background: "linear-gradient(45deg, #667eea, #764ba2)",
                    color: "white",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "10px",
                    display: "flex",
                    alignItems: "center",
                    marginRight: "8px",
                    boxShadow: "0 2px 4px rgba(102,126,234,0.3)",
                  }}
                >
                  <BookOpen size={10} style={{ marginRight: "2px" }} />
                  Chủ đề
                </div>
                <Title
                  level={5}
                  style={{ margin: 0, fontSize: "16px", color: "#2c3e50" }}
                >
                  {topic.topicName || "Đang tải..."}
                </Title>
                <Text
                  type="secondary"
                  style={{
                    marginLeft: "8px",
                    fontSize: "11px",
                    color: "#7f8c8d",
                  }}
                >
                  {filteredVocabularies.length} từ • {favoriteVocabs.length}{" "}
                  <span style={{ color: "#e74c3c" }}>❤️</span>
                </Text>
              </div>
            </div>
          </Col>
          <Col
            span={6}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <Input
              prefix={<Search size={14} style={{ color: "#667eea" }} />}
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                borderRadius: "20px",
                fontSize: "12px",
                border: "2px solid #667eea",
                boxShadow: "0 2px 4px rgba(102,126,234,0.2)",
              }}
              size="small"
            />
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: "16px" }}>
          {/* Main Content - Vocabulary List (79% width) */}
          <Col span={19}>
            <div style={{ padding: "8px 0" }}>
              {filteredVocabularies.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 20px",
                    backgroundColor: "rgba(255,255,255,0.9)",
                    borderRadius: "16px",
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                >
                  <Search
                    size={48}
                    style={{ color: "#bfbfbf", marginBottom: "12px" }}
                  />
                  <Title
                    level={4}
                    style={{
                      fontSize: "18px",
                      color: "#2c3e50",
                      marginBottom: "8px",
                    }}
                  >
                    Không tìm thấy từ vựng
                  </Title>
                  <Text
                    type="secondary"
                    style={{ fontSize: "14px", color: "#7f8c8d" }}
                  >
                    {searchTerm
                      ? "Thử tìm kiếm với từ khóa khác"
                      : "Chưa có từ vựng nào trong chủ đề này"}
                  </Text>
                </div>
              ) : (
                <Row gutter={[12, 12]}>
                  {filteredVocabularies.map((vocab, index) => (
                    <Col key={vocab._id} xs={24} sm={12} md={8} xl={6}>
                      <Card
                        hoverable
                        style={{
                          borderRadius: "12px",
                          overflow: "hidden",
                          height: "100%",
                          border: "none",
                          background: "rgba(255,255,255,0.95)",
                          backdropFilter: "blur(10px)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          transition: "all 0.3s ease",
                        }}
                        bodyStyle={{ padding: "16px" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "12px",
                          }}
                        >
                          <span
                            style={{
                              background: `linear-gradient(45deg, ${getCardColor(
                                index
                              )})`,
                              color: "white",
                              borderRadius: "50%",
                              width: "24px",
                              height: "24px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "11px",
                              fontWeight: "bold",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                            }}
                          >
                            {index + 1}
                          </span>
                          <Button
                            type="text"
                            icon={
                              <Star
                                size={16}
                                fill={
                                  favoriteVocabs.includes(vocab._id)
                                    ? "#faad14"
                                    : "none"
                                }
                                color={
                                  favoriteVocabs.includes(vocab._id)
                                    ? "#faad14"
                                    : "#d9d9d9"
                                }
                              />
                            }
                            onClick={() => toggleFavorite(vocab._id)}
                            style={{
                              border: "none",
                              padding: "4px",
                              borderRadius: "50%",
                              backgroundColor: favoriteVocabs.includes(
                                vocab._id
                              )
                                ? "rgba(250,173,20,0.1)"
                                : "rgba(0,0,0,0.05)",
                            }}
                          />
                        </div>

                        <div style={{ marginBottom: "12px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: "4px",
                            }}
                          >
                            <Title
                              level={5}
                              style={{
                                margin: 0,
                                fontWeight: "bold",
                                fontSize: "16px",
                                color: "#2c3e50",
                              }}
                            >
                              {vocab.word}
                            </Title>
                            <Button
                              type="text"
                              icon={
                                <Volume2
                                  size={16}
                                  style={{ color: "#667eea" }}
                                />
                              }
                              onClick={() => playPronunciation(vocab.word)}
                              style={{
                                border: "none",
                                padding: "4px",
                                borderRadius: "50%",
                                backgroundColor: "rgba(102,126,234,0.1)",
                              }}
                            />
                          </div>
                          <Text
                            type="secondary"
                            style={{
                              fontSize: "12px",
                              color: "#95a5a6",
                              fontStyle: "italic",
                            }}
                          >
                            {vocab.ipa}
                          </Text>
                        </div>

                        <div style={{ marginBottom: "8px" }}>
                          <Text
                            strong
                            style={{ fontSize: "12px", color: "#e67e22" }}
                          >
                            Nghĩa:
                          </Text>
                          <Text
                            style={{
                              fontSize: "12px",
                              color: "#2c3e50",
                              marginLeft: "4px",
                            }}
                          >
                            {vocab.meaning}
                          </Text>
                          {(vocab.wordType || vocab.type) && (
                            <span
                              style={{
                                marginLeft: "8px",
                                fontSize: "10px",
                                backgroundColor: "#3498db",
                                color: "white",
                                padding: "2px 6px",
                                borderRadius: "8px",
                              }}
                            >
                              {vocab.wordType || vocab.type}
                            </span>
                          )}
                        </div>

                        {vocab.exampleSentence && (
                          <div
                            style={{
                              backgroundColor: "rgba(52,152,219,0.1)",
                              padding: "8px",
                              borderRadius: "8px",
                              borderLeft: "3px solid #3498db",
                            }}
                          >
                            <Text
                              strong
                              style={{ fontSize: "11px", color: "#2980b9" }}
                            >
                              Ví dụ:
                            </Text>
                            <Paragraph
                              italic
                              style={{
                                margin: "4px 0 0 0",
                                fontSize: "11px",
                                color: "#34495e",
                              }}
                            >
                              "{vocab.exampleSentence}"
                            </Paragraph>
                          </div>
                        )}
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </div>
          </Col>

          {/* Compact Practice Sidebar (21% width) */}
          <Col span={5}>
            <div style={{ padding: "8px 0" }}>
              <Title
                level={5}
                style={{
                  margin: "0 0 12px 0",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  color: "white",
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                <BookOpen
                  size={16}
                  style={{ marginRight: "6px", color: "#fff" }}
                />
                🎯 Luyện tập
              </Title>

              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <Card
                  size="small"
                  hoverable
                  style={{
                    borderRadius: "12px",
                    border: "none",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    boxShadow: "0 4px 12px rgba(102,126,234,0.3)",
                    transition: "all 0.3s ease",
                  }}
                  bodyStyle={{ padding: "16px" }}
                >
                  <div style={{ textAlign: "center" }}>
                    <Target
                      size={24}
                      style={{ color: "white", marginBottom: "8px" }}
                    />
                    <Text
                      strong
                      style={{
                        display: "block",
                        fontSize: "14px",
                        marginBottom: "4px",
                        color: "white",
                      }}
                    >
                      Flashcards
                    </Text>
                    <Text
                      style={{
                        fontSize: "11px",
                        marginBottom: "12px",
                        color: "rgba(255,255,255,0.8)",
                        display: "block",
                      }}
                    >
                      Thẻ ghi nhớ tương tác
                    </Text>
                    <Link to={`/learner/flashcards/${topicId}`}>
                      <Button
                        type="primary"
                        size="small"
                        style={{
                          fontSize: "11px",
                          backgroundColor: "rgba(255,255,255,0.2)",
                          borderColor: "rgba(255,255,255,0.3)",
                          color: "white",
                          backdropFilter: "blur(10px)",
                          borderRadius: "20px",
                        }}
                      >
                        <Play size={12} style={{ marginRight: "4px" }} />
                        Bắt đầu ôn tập
                      </Button>
                    </Link>
                  </div>
                </Card>

                <Card
                  size="small"
                  hoverable
                  style={{
                    borderRadius: "12px",
                    border: "none",
                    background:
                      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    boxShadow: "0 4px 12px rgba(240,147,251,0.3)",
                    transition: "all 0.3s ease",
                  }}
                  bodyStyle={{ padding: "16px" }}
                >
                  <div style={{ textAlign: "center" }}>
                    <Zap
                      size={24}
                      style={{ color: "white", marginBottom: "8px" }}
                    />
                    <Text
                      strong
                      style={{
                        display: "block",
                        fontSize: "14px",
                        marginBottom: "4px",
                        color: "white",
                      }}
                    >
                      Trắc nghiệm
                    </Text>
                    <Text
                      style={{
                        fontSize: "11px",
                        marginBottom: "12px",
                        color: "rgba(255,255,255,0.8)",
                        display: "block",
                      }}
                    >
                      Kiểm tra kiến thức
                    </Text>
                    <Link to={`/learner/quiz/${topicId}`}>
                      <Button
                        type="primary"
                        size="small"
                        style={{
                          fontSize: "11px",
                          backgroundColor: "rgba(255,255,255,0.2)",
                          borderColor: "rgba(255,255,255,0.3)",
                          color: "white",
                          backdropFilter: "blur(10px)",
                          borderRadius: "20px",
                        }}
                      >
                        <CheckCircle size={12} style={{ marginRight: "4px" }} />
                        Bắt đầu kiểm tra
                      </Button>
                    </Link>
                  </div>
                </Card>
              </Space>

              <Card
                size="small"
                style={{
                  marginTop: "16px",
                  borderRadius: "12px",
                  border: "none",
                  background: "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                bodyStyle={{ padding: "16px" }}
              >
                <Title
                  level={5}
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: "14px",
                    color: "#2c3e50",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  📊 Thống kê học tập
                </Title>
                <Space direction="vertical" size={8} style={{ width: "100%" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "12px",
                      padding: "8px 12px",
                      backgroundColor: "rgba(102,126,234,0.1)",
                      borderRadius: "8px",
                    }}
                  >
                    <Text style={{ color: "#667eea", fontWeight: "bold" }}>
                      📚 Tổng:
                    </Text>
                    <Text strong style={{ color: "#2c3e50" }}>
                      {vocabularies.length} từ
                    </Text>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "12px",
                      padding: "8px 12px",
                      backgroundColor: "rgba(52,152,219,0.1)",
                      borderRadius: "8px",
                    }}
                  >
                    <Text style={{ color: "#3498db", fontWeight: "bold" }}>
                      👁️ Hiển thị:
                    </Text>
                    <Text strong style={{ color: "#2c3e50" }}>
                      {filteredVocabularies.length} từ
                    </Text>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "12px",
                      padding: "8px 12px",
                      backgroundColor: "rgba(231,76,60,0.1)",
                      borderRadius: "8px",
                    }}
                  >
                    <Text style={{ color: "#e74c3c", fontWeight: "bold" }}>
                      ❤️ Yêu thích:
                    </Text>
                    <Text strong style={{ color: "#e74c3c" }}>
                      {favoriteVocabs.length} từ
                    </Text>
                  </div>
                </Space>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default TopicDetail;
