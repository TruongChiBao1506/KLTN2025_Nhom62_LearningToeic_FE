import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVolumeUp,
  faBook,
  faStar,
  faArrowLeft,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import "./style.css";

// Import services
import topicService from "../../../services/topicService";
import vocabularyService from "../../../services/vocabularyService";
import userVocabularyService from "../../../services/userVocabularyService";

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
          console.warn("Không thể tải danh sách từ vựng yêu thích:", favoriteError);
          console.warn("favoriteError details:", favoriteError.response?.data);
          // Continue without favorites - not critical
          setFavoriteVocabs([]);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu từ vựng:", error);
        toast.error("Không thể tải dữ liệu từ vựng. Vui lòng thử lại sau.");
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
      (vocab.exampleSentence && vocab.exampleSentence.toLowerCase().includes(searchLower))
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
      toast.error("ID từ vựng không hợp lệ");
      return;
    }

    // Check if user is authenticated
    const token = localStorage.getItem("learnerToken");
    if (!token) {
      toast.warning("Vui lòng đăng nhập để sử dụng tính năng yêu thích");
      return;
    }

    try {
      const isCurrentlyFavorite = favoriteVocabs.includes(vocabularyId);
      console.log("🚀 ~ toggleFavorite ~ isCurrentlyFavorite:", isCurrentlyFavorite);
      console.log("🚀 ~ toggleFavorite ~ vocabularyId:", vocabularyId);
      console.log("🚀 ~ toggleFavorite ~ favoriteVocabs:", favoriteVocabs);
      
      if (isCurrentlyFavorite) {
        // Remove from favorites
        try {
          await userVocabularyService.removeFromFavorites(vocabularyId);
          setFavoriteVocabs(favoriteVocabs.filter((id) => id !== vocabularyId));
          toast.success("Đã xóa từ vựng khỏi danh sách yêu thích");
        } catch (removeError) {
          console.warn("Remove error:", removeError);
          // Even if backend says "not found", update frontend state
          setFavoriteVocabs(favoriteVocabs.filter((id) => id !== vocabularyId));
          if (removeError.response?.data?.message?.includes("không có trong danh sách")) {
            toast.info("Từ vựng đã được xóa khỏi danh sách");
          } else {
            toast.success("Đã xóa từ vựng khỏi danh sách yêu thích");
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
          toast.success("Đã thêm từ vựng vào danh sách yêu thích");
        } catch (addError) {
          console.warn("Add error:", addError);
          console.warn("Add error details:", addError.response?.data);
          
          // Xử lý trường hợp từ vựng đã tồn tại trong backend
          if (addError.response?.status === 400 && 
              addError.response?.data?.message?.includes("đã có trong danh sách")) {
            
            console.log("Vocabulary already exists in backend, syncing frontend state");
            // Từ vựng đã có trong backend, đồng bộ state frontend
            if (!favoriteVocabs.includes(vocabularyId)) {
              setFavoriteVocabs([...favoriteVocabs, vocabularyId]);
            }
            toast.info("Từ vựng đã có trong danh sách yêu thích");
            
            // Refresh toàn bộ danh sách để đảm bảo đồng bộ
            setTimeout(async () => {
              console.log("Refreshing favorites to ensure sync...");
              await refreshFavorites();
            }, 300);
            
          } else {
            // Lỗi khác - hiển thị thông báo lỗi
            console.error("Unexpected add error:", addError);
            if (addError.response?.status === 401) {
              toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            } else {
              toast.error("Không thể thêm từ vựng vào danh sách yêu thích. Vui lòng thử lại.");
            }
          }
        }
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật từ vựng yêu thích:", error);
      if (error.response?.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else if (error.response?.status === 400) {
        toast.warning("Có lỗi xảy ra với từ vựng này");
      } else {
        toast.error("Không thể cập nhật từ vựng yêu thích. Vui lòng thử lại sau.");
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
      const favoritesResponse = await userVocabularyService.getUserVocabularies();
      console.log("🚀 ~ refreshFavorites ~ favoritesResponse:", favoritesResponse);
      
      // Backend trả về object có userVocabularies array
      const userVocabularies = favoritesResponse?.userVocabularies || [];
      console.log("🚀 ~ refreshFavorites ~ userVocabularies:", userVocabularies);
      
      const favoriteIds = Array.isArray(userVocabularies) 
        ? userVocabularies.map((v, index) => {
            console.log(`🚀 ~ refreshFavorites ~ Processing item [${index}]:`, v);
            if (v.vocabulary?._id) {
              console.log(`🚀 ~ Using v.vocabulary._id: ${v.vocabulary._id}`);
              return v.vocabulary._id;
            }
            if (v.vocabulary && typeof v.vocabulary === 'string') {
              console.log(`🚀 ~ Using v.vocabulary as string: ${v.vocabulary}`);
              return v.vocabulary;
            }
            console.log(`🚀 ~ Could not extract ID from:`, v);
            return null;
          }).filter(Boolean) 
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
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="topic-detail-container">
      <div className="container-fluid px-4">
        {/* Compact Header */}
        <div className="row py-3 border-bottom">
          <div className="col-md-8">
            <Link to="/learner/topics" className="back-link mb-2 d-inline-flex align-items-center">
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              Quay lại danh sách chủ đề
            </Link>
            <div className="d-flex align-items-center">
              <div className="topic-badge me-3">
                <FontAwesomeIcon icon={faBook} className="me-1" />
                Chủ đề
              </div>
              <div>
                <h1 className="topic-title mb-1">{topic.topicName || 'Đang tải...'}</h1>
                <p className="topic-subtitle mb-0 text-muted">
                  {filteredVocabularies.length} từ vựng • {favoriteVocabs.length} yêu thích
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4 d-flex align-items-center justify-content-end">
            <div className="search-compact">
              <FontAwesomeIcon icon={faSearch} className="search-icon-compact" />
              <input
                type="text"
                className="search-input-compact"
                placeholder="Tìm kiếm từ vựng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="row">
          {/* Vocabulary List - Main Content */}
          <div className="col-lg-8">
            <div className="vocabulary-content py-3">
              {filteredVocabularies.length === 0 ? (
                <div className="empty-state text-center py-5">
                  <FontAwesomeIcon icon={faSearch} className="empty-icon mb-3" />
                  <h4>Không tìm thấy từ vựng</h4>
                  <p className="text-muted">
                    {searchTerm 
                      ? 'Thử tìm kiếm với từ khóa khác' 
                      : 'Chưa có từ vựng nào trong chủ đề này'}
                  </p>
                </div>
              ) : (
                <div className="vocab-grid">
                  {filteredVocabularies.map((vocab, index) => (
                    <div key={vocab._id} className="vocab-card">
                      <div className="vocab-card-header">
                        <div className="vocab-number">{index + 1}</div>
                        <button
                          className={`favorite-btn ${
                            favoriteVocabs.includes(vocab._id) ? "active" : ""
                          }`}
                          onClick={() => toggleFavorite(vocab._id)}
                        >
                          <FontAwesomeIcon icon={faStar} />
                        </button>
                      </div>
                      
                      <div className="vocab-word-section">
                        <div className="d-flex align-items-center justify-content-between">
                          <h3 className="vocab-word">{vocab.word}</h3>
                          <button
                            className="sound-btn"
                            onClick={() => playPronunciation(vocab.word)}
                          >
                            <FontAwesomeIcon icon={faVolumeUp} />
                          </button>
                        </div>
                        <div className="vocab-pronunciation text-muted">
                          {vocab.ipa}
                        </div>
                      </div>
                      
                      <div className="vocab-details">
                        <div className="vocab-meaning">
                          <strong>Nghĩa:</strong> {vocab.meaning}
                          {(vocab.wordType || vocab.type) && (
                            <span className="word-type ms-2">({vocab.wordType || vocab.type})</span>
                          )}
                        </div>
                        
                        {vocab.exampleSentence && (
                          <div className="vocab-example mt-2">
                            <strong>Ví dụ:</strong>
                            <em className="d-block mt-1">"{vocab.exampleSentence}"</em>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Practice Sidebar */}
          <div className="col-lg-4">
            <div className="practice-sidebar py-3">
              <h4 className="sidebar-title mb-3">
                <FontAwesomeIcon icon={faBook} className="me-2" />
                Phương pháp luyện tập
              </h4>
              
              <div className="practice-options">
                <div className="practice-option flashcard">
                  <div className="option-header">
                    <FontAwesomeIcon icon={faBook} className="option-icon" />
                    <h5>Flashcards</h5>
                  </div>
                  <p className="option-desc">Học từ vựng với thẻ ghi nhớ tương tác</p>
                  <Link
                    to={`/learner/flashcards/${topicId}`}
                    className="btn-practice btn-flashcard"
                  >
                    Bắt đầu ôn tập
                  </Link>
                </div>
                
                <div className="practice-option quiz">
                  <div className="option-header">
                    <FontAwesomeIcon icon={faSearch} className="option-icon" />
                    <h5>Trắc nghiệm</h5>
                  </div>
                  <p className="option-desc">Kiểm tra kiến thức với bài trắc nghiệm</p>
                  <Link
                    to={`/learner/quiz/${topicId}`}
                    className="btn-practice btn-quiz"
                  >
                    Bắt đầu kiểm tra
                  </Link>
                </div>
              </div>
              
              <div className="stats-summary mt-4">
                <h6 className="stats-title">Thống kê</h6>
                <div className="stats-item">
                  <span>Tổng từ vựng:</span>
                  <strong>{vocabularies.length}</strong>
                </div>
                <div className="stats-item">
                  <span>Đang hiển thị:</span>
                  <strong>{filteredVocabularies.length}</strong>
                </div>
                <div className="stats-item">
                  <span>Yêu thích:</span>
                  <strong>{favoriteVocabs.length}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicDetail;
