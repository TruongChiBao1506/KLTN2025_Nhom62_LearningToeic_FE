import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
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
    "#2C5F8D", // Purple gradient
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
  const navigate = useNavigate();

  // States
  const [topic, setTopic] = useState({});
  const [vocabularies, setVocabularies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [favoriteVocabs, setFavoriteVocabs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Game states (for display only)
  const [gameStarted] = useState(false);
  const [gameResult] = useState("");

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

  // Navigate to learning page
  const startLearning = () => {
    navigate(`/learner/vocabulary-learning/${topicId}`);
  };

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
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        minHeight: "100vh",
      }}
    >
      <div style={{ padding: "0 16px" }}>
        {/* Compact Header */}
        <Row
          style={{
            padding: "20px 24px",
            backgroundColor: "white",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            marginBottom: "20px",
            border: "1px solid rgba(102,126,234,0.1)",
          }}
        >
          <Col span={12}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <Link
                to="/learner/topics"
                style={{
                  color: "var(--color-brand-purple)",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  marginRight: "16px",
                  background: "rgba(102,126,234,0.1)",
                  padding: "8px 16px",
                  borderRadius: "12px",
                  transition: "all 0.3s ease"
                }}
              >
                <ArrowLeft size={16} style={{ marginRight: "6px" }} />
                <Text style={{ fontSize: "12px", color: "var(--color-brand-purple)", fontWeight: "500" }}>
                  Quay lại
                </Text>
              </Link>
              <div
                style={{
                  background: "#2C5F8D",
                  color: "white",
                  padding: "6px 16px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  marginRight: "16px",
                  boxShadow: "0 4px 12px rgba(102,126,234,0.3)",
                  fontWeight: "500"
                }}
              >
                <BookOpen size={14} style={{ marginRight: "6px" }} />
                Preview
              </div>
              <Title
                level={5}
                style={{ margin: 0, fontSize: "20px", color: "#2c3e50", fontWeight: "600" }}
              >
                {topic.topicName || "Đang tải..."}
              </Title>
            </div>
          </Col>
          
          <Col span={8}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Input
                prefix={<Search size={14} style={{ color: "var(--color-brand-purple)" }} />}
                placeholder="Tìm kiếm từ vựng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  borderRadius: "20px",
                  fontSize: "12px",
                  border: "2px solid #667eea",
                  boxShadow: "0 2px 4px rgba(102,126,234,0.2)",
                }}
                size="middle"
              />
            </div>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: "16px" }}>
          {/* Main Content - Vocabulary List (79% width) */}
          <Col span={19}>
            {/* Topic Info Section */}
            <Card
              style={{
                marginBottom: "20px",
                borderRadius: "20px",
                background: "white",
                boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
                border: "1px solid rgba(102,126,234,0.1)",
                overflow: "hidden",
                position: "relative"
              }}
              bodyStyle={{ padding: "30px" }}
            >
              {/* Decorative background */}
              <div style={{
                position: "absolute",
                top: "-50px",
                right: "-50px",
                width: "200px",
                height: "200px",
                background: "#2C5F8D",
                borderRadius: "50%",
                opacity: 0.05,
                zIndex: 0
              }} />
              
              <div style={{ position: "relative", zIndex: 1 }}>
                <Row gutter={24}>
                  <Col span={16}>
                    <div>
                      <Title level={3} style={{ margin: 0, marginBottom: "12px", color: "#2c3e50", fontSize: "24px", fontWeight: "600" }}>
                        {topic.topicName}
                      </Title>
                      {topic.description && (
                        <Paragraph style={{ margin: 0, color: "#7f8c8d", fontSize: "16px", lineHeight: 1.6 }}>
                          {topic.description}
                        </Paragraph>
                      )}
                    </div>
                  </Col>
                  <Col span={8}>
                    <Row gutter={12}>
                      <Col span={8}>
                        <div style={{ 
                          textAlign: "center", 
                          padding: "16px 12px", 
                          background: "#2C5F8D", 
                          borderRadius: "16px", 
                          color: "white",
                          boxShadow: "0 8px 24px rgba(102,126,234,0.3)"
                        }}>
                          <BookOpen size={24} style={{ marginBottom: "8px" }} />
                          <div style={{ fontSize: "20px", fontWeight: "bold" }}>{vocabularies.length}</div>
                          <div style={{ fontSize: "12px", opacity: 0.9 }}>Từ vựng</div>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div style={{ 
                          textAlign: "center", 
                          padding: "16px 12px", 
                          background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", 
                          borderRadius: "16px", 
                          color: "white",
                          boxShadow: "0 8px 24px rgba(250,112,154,0.3)"
                        }}>
                          <Star size={24} style={{ marginBottom: "8px" }} />
                        <div style={{ fontSize: "20px", fontWeight: "bold" }}>{favoriteVocabs.length}</div>
                        <div style={{ fontSize: "12px", opacity: 0.9 }}>Yêu thích</div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ 
                        textAlign: "center", 
                        padding: "16px 12px", 
                        background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", 
                        borderRadius: "16px", 
                        color: "white",
                        boxShadow: "0 8px 24px rgba(67,233,123,0.3)"
                      }}>
                        <Target size={24} style={{ marginBottom: "8px" }} />
                        <div style={{ fontSize: "20px", fontWeight: "bold" }}>
                          {gameStarted ? (gameResult === "win" ? "🎉" : gameResult === "lose" ? "😅" : "🎮") : "🎯"}
                        </div>
                        <div style={{ fontSize: "12px", opacity: 0.9 }}>Game</div>
                      </div>
                    </Col>
                  </Row>
                </Col>
              </Row>
              </div>
            </Card>

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
                    style={{ fontSize: "12px", color: "#7f8c8d" }}
                  >
                    {searchTerm
                      ? "Thử tìm kiếm với từ khóa khác"
                      : "Chưa có từ vựng nào trong chủ đề này"}
                  </Text>
                </div>
              ) : (
                <Row gutter={[16, 16]}>
                  {filteredVocabularies.map((vocab, index) => (
                    <Col key={vocab._id} xs={24} sm={12} md={8} xl={6}>
                      <Card
                        hoverable
                        style={{
                          borderRadius: "16px",
                          overflow: "hidden",
                          height: "100%",
                          border: "1px solid rgba(102,126,234,0.1)",
                          background: "white",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                          transition: "all 0.3s ease",
                          transform: "translateY(0)",
                        }}
                        bodyStyle={{ padding: "20px" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-4px)";
                          e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.15)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "16px",
                          }}
                        >
                          <span
                            style={{
                              background: `linear-gradient(45deg, ${getCardColor(
                                index
                              )})`,
                              color: "white",
                              borderRadius: "50%",
                              width: "28px",
                              height: "28px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "12px",
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
                                    ? "var(--color-warning)"
                                    : "none"
                                }
                                color={
                                  favoriteVocabs.includes(vocab._id)
                                    ? "var(--color-warning)"
                                    : "var(--color-border)"
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
                                  style={{ color: "var(--color-brand-purple)" }}
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
                  margin: "0 0 20px 0",
                  fontSize: "18px",
                  display: "flex",
                  alignItems: "center",
                  color: "#2c3e50",
                  fontWeight: "600"
                }}
              >
                <BookOpen
                  size={18}
                  style={{ marginRight: "8px", color: "var(--color-brand-purple)" }}
                />
                Luyện tập
              </Title>

              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <Card
                  size="small"
                  hoverable
                  style={{
                    borderRadius: "16px",
                    border: "1px solid rgba(102,126,234,0.1)",
                    background: "white",
                    boxShadow: "0 8px 24px rgba(102,126,234,0.15)",
                    transition: "all 0.3s ease",
                    transform: "translateY(0)"
                  }}
                  bodyStyle={{ padding: "20px" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 12px 32px rgba(102,126,234,0.25)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(102,126,234,0.15)";
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div style={{
                      background: "#2C5F8D",
                      borderRadius: "12px",
                      padding: "12px",
                      marginBottom: "12px",
                      display: "inline-block"
                    }}>
                      <Target
                        size={28}
                        style={{ color: "white" }}
                      />
                    </div>
                    <Text
                      strong
                      style={{
                        display: "block",
                        fontSize: "16px",
                        marginBottom: "6px",
                        color: "#2c3e50",
                        fontWeight: "600"
                      }}
                    >
                      Flashcards
                    </Text>
                    <Text
                      style={{
                        fontSize: "12px",
                        marginBottom: "16px",
                        color: "#7f8c8d",
                        display: "block",
                      }}
                    >
                      Thẻ ghi nhớ tương tác
                    </Text>
                    <Link to={`/learner/flashcards/${topicId}`}>
                      <Button
                        type="primary"
                        size="middle"
                        style={{
                          fontSize: "12px",
                          background: "#2C5F8D",
                          border: "none",
                          color: "white",
                          borderRadius: "12px",
                          fontWeight: "500",
                          width: "100%"
                        }}
                      >
                        <Play size={12} style={{ marginRight: "4px" }} />
                        Bắt đầu ôn tập
                      </Button>
                    </Link>
                  </div>
                </Card>

                {/* Game Card */}
                <Card
                  size="small"
                  hoverable
                  style={{
                    borderRadius: "16px",
                    border: "1px solid rgba(67,233,123,0.1)",
                    background: "white",
                    boxShadow: "0 8px 24px rgba(67,233,123,0.15)",
                    transition: "all 0.3s ease",
                    transform: "translateY(0)"
                  }}
                  bodyStyle={{ padding: "20px" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 12px 32px rgba(67,233,123,0.25)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(67,233,123,0.15)";
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div style={{
                      background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                      borderRadius: "12px",
                      padding: "12px",
                      marginBottom: "12px",
                      display: "inline-block"
                    }}>
                      <Target
                        size={28}
                        style={{ color: "white" }}
                      />
                    </div>
                    <Text
                      strong
                      style={{
                        display: "block",
                        fontSize: "16px",
                        marginBottom: "6px",
                        color: "#2c3e50",
                        fontWeight: "600"
                      }}
                    >
                      Đoán từ vựng
                    </Text>
                    <Text
                      style={{
                        fontSize: "12px",
                        marginBottom: "16px",
                        color: "#7f8c8d",
                        display: "block",
                      }}
                    >
                      Trò chơi thú vị
                    </Text>
                    
                    <Link to={`/learner/vocabulary-game/${topicId}`}>
                      <Button
                        type="primary"
                        size="middle"
                        style={{
                          fontSize: "12px",
                          background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                          border: "none",
                          color: "white",
                          borderRadius: "12px",
                          fontWeight: "500",
                          width: "100%"
                        }}
                      >
                        <Play size={14} style={{ marginRight: "6px" }} />
                        Chơi trò đoán từ
                      </Button>
                    </Link>
                  </div>
                </Card>

                {/* Quiz Card - Trắc nghiệm nghĩa từ vựng */}
                <Card
                  size="small"
                  hoverable
                  style={{
                    borderRadius: "16px",
                    border: "1px solid rgba(24,144,255,0.1)",
                    background: "white",
                    boxShadow: "0 8px 24px rgba(24,144,255,0.15)",
                    transition: "all 0.3s ease",
                    transform: "translateY(0)"
                  }}
                  bodyStyle={{ padding: "20px" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 12px 32px rgba(24,144,255,0.25)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(24,144,255,0.15)";
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div style={{
                      background: "linear-gradient(135deg, #1890ff 0%, #36cfc9 100%)",
                      borderRadius: "12px",
                      padding: "12px",
                      marginBottom: "12px",
                      display: "inline-block"
                    }}>
                      <CheckCircle
                        size={28}
                        style={{ color: "white" }}
                      />
                    </div>
                    <Text
                      strong
                      style={{
                        display: "block",
                        fontSize: "16px",
                        marginBottom: "6px",
                        color: "#2c3e50",
                        fontWeight: "600"
                      }}
                    >
                      Quiz nghĩa từ
                    </Text>
                    <Text
                      style={{
                        fontSize: "12px",
                        marginBottom: "16px",
                        color: "#7f8c8d",
                        display: "block",
                      }}
                    >
                      Chọn nghĩa đúng
                    </Text>
                    
                    <Link to={`/learner/quiz/${topicId}`}>
                      <Button
                        type="primary"
                        size="middle"
                        style={{
                          fontSize: "12px",
                          background: "linear-gradient(135deg, #1890ff 0%, #36cfc9 100%)",
                          border: "none",
                          color: "white",
                          borderRadius: "12px",
                          fontWeight: "500",
                          width: "100%"
                        }}
                      >
                        <Play size={14} style={{ marginRight: "6px" }} />
                        Bắt đầu quiz
                      </Button>
                    </Link>
                  </div>
                </Card>

                <Card
                  size="small"
                  hoverable
                  style={{
                    borderRadius: "16px",
                    border: "1px solid rgba(240,147,251,0.1)",
                    background: "white",
                    boxShadow: "0 8px 24px rgba(240,147,251,0.15)",
                    transition: "all 0.3s ease",
                    transform: "translateY(0)"
                  }}
                  bodyStyle={{ padding: "20px" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 12px 32px rgba(240,147,251,0.25)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(240,147,251,0.15)";
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div style={{
                      background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                      borderRadius: "12px",
                      padding: "12px",
                      marginBottom: "12px",
                      display: "inline-block"
                    }}>
                      <Zap
                        size={28}
                        style={{ color: "white" }}
                      />
                    </div>
                    <Text
                      strong
                      style={{
                        display: "block",
                        fontSize: "16px",
                        marginBottom: "6px",
                        color: "#2c3e50",
                        fontWeight: "600"
                      }}
                    >
                      Luyện tập từ vựng
                    </Text>
                    <Text
                      style={{
                        fontSize: "12px",
                        marginBottom: "16px",
                        color: "#7f8c8d",
                        display: "block",
                      }}
                    >
                      Trắc nghiệm nâng cao
                    </Text>
                    <Link to={`/learner/vocabulary-quiz/${topicId}`}>
                      <Button
                        type="primary"
                        size="middle"
                        style={{
                          fontSize: "12px",
                          background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                          border: "none",
                          color: "white",
                          borderRadius: "12px",
                          fontWeight: "500",
                          width: "100%"
                        }}
                      >
                        <CheckCircle size={14} style={{ marginRight: "6px" }} />
                        Luyện tập nâng cao
                      </Button>
                    </Link>
                  </div>
                </Card>
              </Space>

              <Card
                size="small"
                style={{
                  marginTop: "24px",
                  borderRadius: "16px",
                  border: "1px solid rgba(102,126,234,0.1)",
                  background: "white",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                }}
                bodyStyle={{ padding: "20px" }}
              >
                <Title
                  level={5}
                  style={{
                    margin: "0 0 16px 0",
                    fontSize: "16px",
                    color: "#2c3e50",
                    display: "flex",
                    alignItems: "center",
                    fontWeight: "600"
                  }}
                >
                  📊 Thống kê học tập
                </Title>
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "12px",
                      padding: "12px 16px",
                      backgroundColor: "rgba(102,126,234,0.08)",
                      borderRadius: "12px",
                      border: "1px solid rgba(102,126,234,0.1)"
                    }}
                  >
                    <Text style={{ color: "var(--color-brand-purple)", fontWeight: "600" }}>
                      📚 Tổng:
                    </Text>
                    <Text strong style={{ color: "#2c3e50", fontSize: "12px" }}>
                      {vocabularies.length} từ
                    </Text>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "12px",
                      padding: "12px 16px",
                      backgroundColor: "rgba(52,152,219,0.08)",
                      borderRadius: "12px",
                      border: "1px solid rgba(52,152,219,0.1)"
                    }}
                  >
                    <Text style={{ color: "#3498db", fontWeight: "600" }}>
                      👁️ Hiển thị:
                    </Text>
                    <Text strong style={{ color: "#2c3e50", fontSize: "12px" }}>
                      {filteredVocabularies.length} từ
                    </Text>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "12px",
                      padding: "12px 16px",
                      backgroundColor: "rgba(231,76,60,0.08)",
                      borderRadius: "12px",
                      border: "1px solid rgba(231,76,60,0.1)"
                    }}
                  >
                    <Text style={{ color: "#e74c3c", fontWeight: "600" }}>
                      ❤️ Yêu thích:
                    </Text>
                    <Text strong style={{ color: "#e74c3c", fontSize: "12px" }}>
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
