import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVolumeUp,
  faBook,
  faCheck,
  faPlus,
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
        setTopic(topicResponse.data);

        // Get vocabularies by topic ID
        const vocabResponse = await vocabularyService.getByTopicId(topicId);
        setVocabularies(vocabResponse.data);

        // Get user's favorite vocabularies
        const favoritesResponse =
          await userVocabularyService.getUserVocabularies();
        const favoriteIds = favoritesResponse.data.map((v) => v.vocabularyId);
        setFavoriteVocabs(favoriteIds);
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
  const filteredVocabularies = vocabularies.filter((vocab) => {
    if (!searchTerm) return true;
    return (
      vocab.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vocab.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vocab.example.toLowerCase().includes(searchTerm.toLowerCase())
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
    try {
      if (favoriteVocabs.includes(vocabularyId)) {
        // Remove from favorites
        await userVocabularyService.removeFromFavorites(vocabularyId);
        setFavoriteVocabs(favoriteVocabs.filter((id) => id !== vocabularyId));
        toast.success("Đã xóa từ vựng khỏi danh sách yêu thích");
      } else {
        // Add to favorites
        await userVocabularyService.addToFavorites(vocabularyId);
        setFavoriteVocabs([...favoriteVocabs, vocabularyId]);
        toast.success("Đã thêm từ vựng vào danh sách yêu thích");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật từ vựng yêu thích:", error);
      toast.error(
        "Không thể cập nhật từ vựng yêu thích. Vui lòng thử lại sau."
      );
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
    <div className="container py-4">
      <div className="mb-4">
        <Link to="/learner/topics" className="btn btn-outline-primary">
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Quay lại danh sách chủ đề
        </Link>
      </div>

      <div className="topic-header mb-4">
        <h2 className="mb-3">
          <FontAwesomeIcon icon={faBook} className="me-2 text-primary" />
          {topic.topicName}
        </h2>
        <p className="lead">{topic.description}</p>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="card-title mb-0">
              Danh sách từ vựng ({filteredVocabularies.length})
            </h5>
            <div className="search-box">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                className="form-control"
                placeholder="Tìm kiếm từ vựng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="table vocabulary-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Từ vựng</th>
                  <th>Phát âm</th>
                  <th>Nghĩa</th>
                  <th>Loại từ</th>
                  <th>Ví dụ</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredVocabularies.map((vocab, index) => (
                  <tr key={vocab.vocabularyId}>
                    <td>{index + 1}</td>
                    <td className="fw-bold">{vocab.word}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => playPronunciation(vocab.word)}
                      >
                        <FontAwesomeIcon icon={faVolumeUp} />
                      </button>
                    </td>
                    <td>{vocab.meaning}</td>
                    <td>
                      <span className="badge bg-light text-dark">
                        {vocab.type}
                      </span>
                    </td>
                    <td>{vocab.example}</td>
                    <td>
                      <button
                        className={`btn btn-sm ${
                          favoriteVocabs.includes(vocab.vocabularyId)
                            ? "btn-warning"
                            : "btn-outline-warning"
                        }`}
                        onClick={() => toggleFavorite(vocab.vocabularyId)}
                        title={
                          favoriteVocabs.includes(vocab.vocabularyId)
                            ? "Xóa khỏi yêu thích"
                            : "Thêm vào yêu thích"
                        }
                      >
                        <FontAwesomeIcon
                          icon={
                            favoriteVocabs.includes(vocab.vocabularyId)
                              ? faStar
                              : faPlus
                          }
                        />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredVocabularies.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-3">
                      Không tìm thấy từ vựng phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="practice-options">
        <div className="row">
          <div className="col-md-6 mb-3">
            <div className="card h-100 practice-card">
              <div className="card-body">
                <h5 className="card-title">Ôn tập với Flashcards</h5>
                <p className="card-text">
                  Học từ vựng nhanh chóng với phương pháp flashcard hiệu quả.
                </p>
                <Link
                  to={`/learner/flashcards/${topicId}`}
                  className="btn btn-primary"
                >
                  Bắt đầu ôn tập
                </Link>
              </div>
            </div>
          </div>
          <div className="col-md-6 mb-3">
            <div className="card h-100 practice-card">
              <div className="card-body">
                <h5 className="card-title">Luyện tập với bài trắc nghiệm</h5>
                <p className="card-text">
                  Kiểm tra kiến thức từ vựng với bài trắc nghiệm tương tác.
                </p>
                <Link
                  to={`/learner/quiz/${topicId}`}
                  className="btn btn-success"
                >
                  Bắt đầu kiểm tra
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicDetail;
