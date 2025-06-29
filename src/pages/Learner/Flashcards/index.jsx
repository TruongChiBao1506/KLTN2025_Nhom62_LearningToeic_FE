import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVolumeUp,
  faArrowLeft,
  faArrowRight,
  faRotateRight,
  faHome,
  faCheck,
  faTimes,
  faGraduationCap,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import "./style.css";

// Import services
import topicService from "../../../services/topicService";
import vocabularyService from "../../../services/vocabularyService";

const Flashcards = () => {
  const { topicId } = useParams();

  // States
  const [topic, setTopic] = useState({});
  const [vocabularies, setVocabularies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({ correct: 0, total: 0 });
  const [answered, setAnswered] = useState([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get topic details
        const topicResponse = await topicService.getById(topicId);
        setTopic(topicResponse);

        // Get vocabularies by topic ID
        const vocabResponse = await vocabularyService.getByTopicId(topicId);
        const vocabList = Array.isArray(vocabResponse) ? vocabResponse : [];
        setVocabularies(vocabList);
        
        if (vocabList.length === 0) {
          toast.warning("Chủ đề này chưa có từ vựng nào");
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        toast.error("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [topicId]);

  const currentVocab = vocabularies[currentIndex];

  // Play pronunciation
  const playPronunciation = (word) => {
    const speech = new SpeechSynthesisUtterance(word);
    speech.lang = "en-US";
    window.speechSynthesis.speak(speech);
  };

  // Flip card
  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  // Next card
  const nextCard = () => {
    if (currentIndex < vocabularies.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      setShowResults(true);
    }
  };

  // Previous card
  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  // Mark as correct/incorrect
  const markAnswer = (isCorrect) => {
    const newAnswered = [...answered];
    newAnswered[currentIndex] = isCorrect;
    setAnswered(newAnswered);

    const correctCount = newAnswered.filter(Boolean).length;
    setProgress({ correct: correctCount, total: newAnswered.length });

    setTimeout(() => {
      nextCard();
    }, 500);
  };

  // Reset flashcards
  const resetFlashcards = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setAnswered([]);
    setProgress({ correct: 0, total: 0 });
    setShowResults(false);
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

  if (vocabularies.length === 0) {
    return (
      <div className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 text-center">
            <FontAwesomeIcon icon={faGraduationCap} className="fs-1 text-muted mb-4" />
            <h3 className="text-muted mb-3">Chưa có từ vựng</h3>
            <p className="text-muted mb-4">Chủ đề này chưa có từ vựng nào để luyện tập.</p>
            <Link to={`/learner/topic/${topicId}`} className="btn btn-primary">
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              Quay lại chi tiết chủ đề
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const percentage = Math.round((progress.correct / vocabularies.length) * 100);
    return (
      <div className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card results-card">
              <div className="card-body text-center py-5">
                <div className="results-icon mb-4">
                  <FontAwesomeIcon 
                    icon={percentage >= 70 ? faStar : faGraduationCap} 
                    className={`fs-1 ${percentage >= 70 ? 'text-warning' : 'text-primary'}`} 
                  />
                </div>
                <h2 className="mb-3">Kết quả luyện tập</h2>
                <h3 className="text-primary mb-4">{percentage}%</h3>
                <p className="fs-5 mb-4">
                  Bạn đã trả lời đúng <span className="fw-bold text-success">{progress.correct}</span> / <span className="fw-bold">{vocabularies.length}</span> từ vựng
                </p>
                
                <div className="d-flex gap-3 justify-content-center">
                  <button onClick={resetFlashcards} className="btn btn-primary btn-lg">
                    <FontAwesomeIcon icon={faRotateRight} className="me-2" />
                    Luyện tập lại
                  </button>
                  <Link to={`/learner/topic/${topicId}`} className="btn btn-outline-primary btn-lg">
                    <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                    Quay lại chủ đề
                  </Link>
                  <Link to="/learner/topics" className="btn btn-outline-secondary btn-lg">
                    <FontAwesomeIcon icon={faHome} className="me-2" />
                    Danh sách chủ đề
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid flashcards-container">
      {/* Header */}
      <div className="row mb-3">
        <div className="col-12">
          <div className="flashcards-header d-flex justify-content-between align-items-center">
            <Link to={`/learner/topic/${topicId}`} className="btn btn-outline-primary btn-sm">
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              Quay lại
            </Link>
            <div className="text-center">
              <h4 className="topic-title">{topic.topicName}</h4>
              <span className="flashcards-subtitle">Flashcards</span>
            </div>
            <div className="progress-info">
              <span className="badge progress-badge">
                {currentIndex + 1} / {vocabularies.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="row mb-3">
        <div className="col-12">
          <div className="progress-section">
            <div className="progress">
              <div 
                className="progress-bar bg-primary" 
                style={{ width: `${((currentIndex + 1) / vocabularies.length) * 100}%` }}
              ></div>
            </div>
            <div className="progress-stats">
              <span className="text-success stat-item">
                <FontAwesomeIcon icon={faCheck} className="me-1" />
                Đúng: {progress.correct}
              </span>
              <span className="text-danger stat-item">
                <FontAwesomeIcon icon={faTimes} className="me-1" />
                Sai: {progress.total - progress.correct}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Flashcard */}
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-10">
          <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={flipCard}>
            <div className="flashcard-inner">
              {/* Front Side */}
              <div className="flashcard-front">
                <div className="card-content">
                  <div className="word-section">
                    <h1 className="word">{currentVocab?.word}</h1>
                    {currentVocab?.ipa && (
                      <div className="pronunciation">
                        <span className="ipa">{currentVocab.ipa}</span>
                        <button 
                          className="btn btn-pronounce"
                          onClick={(e) => {
                            e.stopPropagation();
                            playPronunciation(currentVocab.word);
                          }}
                        >
                          <FontAwesomeIcon icon={faVolumeUp} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="instruction">
                    <p className="text-muted">Nhấp để xem nghĩa</p>
                  </div>
                </div>
              </div>

              {/* Back Side */}
              <div className="flashcard-back">
                <div className="card-content">
                  <div className="meaning-section">
                    <h2 className="meaning">{currentVocab?.meaning}</h2>
                    {currentVocab?.wordType && (
                      <span className="badge word-type">{currentVocab.wordType}</span>
                    )}
                  </div>
                  {currentVocab?.exampleSentence && (
                    <div className="example-section">
                      <h6 className="example-label">Ví dụ:</h6>
                      <p className="example">{currentVocab.exampleSentence}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isFlipped && (
            <div className="action-buttons">
              <div className="d-flex justify-content-center gap-3">
                <button 
                  className="btn btn-difficulty-hard action-btn"
                  onClick={() => markAnswer(false)}
                >
                  <FontAwesomeIcon icon={faTimes} className="me-2" />
                  Khó
                </button>
                <button 
                  className="btn btn-difficulty-easy action-btn"
                  onClick={() => markAnswer(true)}
                >
                  <FontAwesomeIcon icon={faCheck} className="me-2" />
                  Dễ
                </button>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="navigation-buttons mt-3">
            <div className="d-flex justify-content-between">
              <button 
                className="btn nav-btn"
                onClick={prevCard}
                disabled={currentIndex === 0}
              >
                <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                Trước
              </button>
              <button 
                className="btn nav-btn"
                onClick={nextCard}
                disabled={currentIndex === vocabularies.length - 1}
              >
                Tiếp theo
                <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcards;
