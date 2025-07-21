import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, Row, Col, Typography, Input, Button, Spin, message } from "antd";
import { Volume2, BookOpen, Star, ArrowLeft, Search } from "lucide-react";
// import "./style.css";

// Import services
import topicService from "../../../services/topicService";
import vocabularyService from "../../../services/vocabularyService";
import userVocabularyService from "../../../services/userVocabularyService";

const { Title, Text, Paragraph } = Typography;

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
    <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <div style={{ padding: "0 16px" }}>
        {/* Compact Header */}
        <Row style={{ padding: "12px 0", borderBottom: "1px solid #d9d9d9" }}>
          <Col md={16}>
            <div style={{ marginBottom: "8px" }}>
              <Link
                to="/learner/topics"
                style={{
                  color: "#1890ff",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                <ArrowLeft size={16} style={{ marginRight: "8px" }} />
                Quay lại danh sách chủ đề
              </Link>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  backgroundColor: "#1890ff",
                  color: "white",
                  padding: "4px 12px",
                  borderRadius: "16px",
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  marginRight: "12px",
                }}
              >
                <BookOpen size={14} style={{ marginRight: "4px" }} />
                Chủ đề
              </div>
              <div>
                <Title level={3} style={{ margin: "0 0 4px 0" }}>
                  {topic.topicName || "Đang tải..."}
                </Title>
                <Text type="secondary">
                  {filteredVocabularies.length} từ vựng •{" "}
                  {favoriteVocabs.length} yêu thích
                </Text>
              </div>
            </div>
          </Col>
          <Col
            md={8}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <div
              style={{ position: "relative", width: "100%", maxWidth: "300px" }}
            >
              <Input
                prefix={<Search size={16} />}
                placeholder="Tìm kiếm từ vựng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ borderRadius: "8px" }}
              />
            </div>
          </Col>
        </Row>

        <Row>
          {/* Vocabulary List - Main Content */}
          <Col lg={18}>
            <div style={{ padding: "12px 0" }}>
              {filteredVocabularies.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <Search
                    size={48}
                    style={{ color: "#bfbfbf", marginBottom: "12px" }}
                  />
                  <Title level={4}>Không tìm thấy từ vựng</Title>
                  <Text type="secondary">
                    {searchTerm
                      ? "Thử tìm kiếm với từ khóa khác"
                      : "Chưa có từ vựng nào trong chủ đề này"}
                  </Text>
                </div>
              ) : (
                <Row gutter={[16, 16]}>
                  {filteredVocabularies.map((vocab, index) => (
                    <Col key={vocab._id} xs={24} sm={12} md={8} lg={6}>
                      <Card
                        hoverable
                        style={{
                          borderRadius: "12px",
                          overflow: "hidden",
                          height: "100%",
                          border: "1px solid #f0f0f0",
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
                              backgroundColor: "#f0f0f0",
                              borderRadius: "50%",
                              width: "24px",
                              height: "24px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "12px",
                              fontWeight: "bold",
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
                            style={{ border: "none", padding: "4px" }}
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
                              style={{ margin: 0, fontWeight: "bold" }}
                            >
                              {vocab.word}
                            </Title>
                            <Button
                              type="text"
                              icon={<Volume2 size={16} />}
                              onClick={() => playPronunciation(vocab.word)}
                              style={{ border: "none", padding: "4px" }}
                            />
                          </div>
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            {vocab.ipa}
                          </Text>
                        </div>

                        <div style={{ marginBottom: "8px" }}>
                          <Text strong>Nghĩa:</Text>{" "}
                          <Text>{vocab.meaning}</Text>
                          {(vocab.wordType || vocab.type) && (
                            <Text
                              type="secondary"
                              style={{ marginLeft: "8px" }}
                            >
                              ({vocab.wordType || vocab.type})
                            </Text>
                          )}
                        </div>

                        {vocab.exampleSentence && (
                          <div>
                            <Text strong>Ví dụ:</Text>
                            <Paragraph
                              italic
                              style={{ margin: "4px 0 0 0", fontSize: "12px" }}
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

          {/* Practice Sidebar */}
          <Col lg={6}>
            <div style={{ padding: "12px 0" }}>
              <Title
                level={4}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <BookOpen size={20} style={{ marginRight: "8px" }} />
                Phương pháp luyện tập
              </Title>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <Card
                  hoverable
                  style={{
                    borderRadius: "12px",
                    border: "1px solid #1890ff",
                  }}
                  bodyStyle={{ padding: "16px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <BookOpen
                      size={20}
                      style={{ marginRight: "8px", color: "#1890ff" }}
                    />
                    <Title level={5} style={{ margin: 0 }}>
                      Flashcards
                    </Title>
                  </div>
                  <Paragraph style={{ fontSize: "14px", marginBottom: "16px" }}>
                    Học từ vựng với thẻ ghi nhớ tương tác
                  </Paragraph>
                  <Link to={`/learner/flashcards/${topicId}`}>
                    <Button
                      type="primary"
                      block
                      size="large"
                      style={{ borderRadius: "8px" }}
                    >
                      Bắt đầu ôn tập
                    </Button>
                  </Link>
                </Card>

                <Card
                  hoverable
                  style={{
                    borderRadius: "12px",
                    border: "1px solid #52c41a",
                  }}
                  bodyStyle={{ padding: "16px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <Search
                      size={20}
                      style={{ marginRight: "8px", color: "#52c41a" }}
                    />
                    <Title level={5} style={{ margin: 0 }}>
                      Trắc nghiệm
                    </Title>
                  </div>
                  <Paragraph style={{ fontSize: "14px", marginBottom: "16px" }}>
                    Kiểm tra kiến thức với bài trắc nghiệm
                  </Paragraph>
                  <Link to={`/learner/quiz/${topicId}`}>
                    <Button
                      type="primary"
                      block
                      size="large"
                      style={{
                        borderRadius: "8px",
                        backgroundColor: "#52c41a",
                        borderColor: "#52c41a",
                      }}
                    >
                      Bắt đầu kiểm tra
                    </Button>
                  </Link>
                </Card>
              </div>

              <Card
                style={{ marginTop: "16px", borderRadius: "12px" }}
                bodyStyle={{ padding: "16px" }}
              >
                <Title level={5} style={{ marginBottom: "12px" }}>
                  Thống kê
                </Title>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Text>Tổng từ vựng:</Text>
                    <Text strong>{vocabularies.length}</Text>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Text>Đang hiển thị:</Text>
                    <Text strong>{filteredVocabularies.length}</Text>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Text>Yêu thích:</Text>
                    <Text strong style={{ color: "#faad14" }}>
                      {favoriteVocabs.length}
                    </Text>
                  </div>
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default TopicDetail;
