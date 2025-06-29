import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faBolt } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import "./style.css";

// Import services
import topicService from "../../../services/topicService";
import sectionService from "../../../services/sectionsService";

const Topic = () => {
  // States
  const [topics, setTopics] = useState([]);
  const [sections, setSections] = useState([]);
  const [transcript, setTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Refs
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Fetch topics and sections
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const topicResponse = await topicService.getAllEnabled();
        console.log("Topic response:", topicResponse);
        // Backend trả về array trực tiếp
        setTopics(Array.isArray(topicResponse) ? topicResponse : []);

        const sectionResponse = await sectionService.getAllEnabled();
        console.log("Section response:", sectionResponse);
        // Backend trả về array trực tiếp
        setSections(Array.isArray(sectionResponse) ? sectionResponse : []);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu chủ đề:", error);
        toast.error("Không thể tải dữ liệu chủ đề. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtered topics based on search
  const filteredTopics = topics.filter((topic) => {
    if (!transcript || transcript.trim() === "") return true;

    // Search in topic name specifically
    const searchTerm = transcript.toLowerCase().trim();
    return (
      topic.topicName && topic.topicName.toLowerCase().includes(searchTerm)
    );
  });

  // Debug logging
  console.log("Total topics:", topics.length);
  console.log("Filtered topics:", filteredTopics.length);
  console.log("Search term:", transcript);

  // Filtered sections for reading and listening
  const docngheSections = sections.filter(
    (section) => section.type === 1 || section.type === 2
  );

  const getImageUrl = (imageName) => {
    if (!imageName) {
      return "http://localhost:5000/images/default-image.png";
    }

    // If imageName already contains full URL, return as is
    if (imageName.startsWith("http")) {
      return imageName;
    }

    // If imageName starts with '/images/', use it directly
    if (imageName.startsWith("/images/")) {
      return `http://localhost:5000${imageName}`;
    }

    // Otherwise, assume it's just the filename
    return `http://localhost:5000/images/${imageName}`;
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = "en-US";
    recognitionRef.current.interimResults = true;

    setIsSpeaking(true);

    recognitionRef.current.addEventListener("result", (event) => {
      const lastResultIndex = event.results.length - 1;
      setTranscript(event.results[lastResultIndex][0].transcript);
    });

    recognitionRef.current.addEventListener("end", () => {
      recognitionRef.current.stop();
      setIsSpeaking(false);
    });

    recognitionRef.current.start();
  };

  return (
    <div className="container-fluid px-4">
      <div className="row">
        <div className="col-12">
          <h1 className="text-center mt-4 mb-5">
            <span>🎯 HỌC TỪ VỰNG TOEIC THEO CHỦ ĐỀ</span>
          </h1>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8 col-md-12">
          {/* Search Section */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="search-container">
                <div className="input-group input-group-lg">
                  <input
                    type="text"
                    className="form-control search-input"
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="🔍 Tìm kiếm chủ đề..."
                  />
                  <button
                    className="btn btn-voice"
                    onClick={startSpeechRecognition}
                    disabled={isSpeaking}
                  >
                    <FontAwesomeIcon
                      icon={faMicrophone}
                      className={isSpeaking ? "speaking" : ""}
                    />
                    {isSpeaking && <span className="ms-2">Đang nghe...</span>}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Topics Grid */}
          <div className="topics-container">
            {isLoading ? (
              <div className="loading-state">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Đang tải...</span>
                </div>
                <h5>Đang tải dữ liệu chủ đề...</h5>
                <p className="text-muted">Vui lòng đợi trong giây lát</p>
              </div>
            ) : filteredTopics.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <FontAwesomeIcon icon={faBolt} />
                </div>
                <h4>Không tìm thấy chủ đề nào</h4>
                <p className="text-muted">
                  {transcript
                    ? `Không có chủ đề nào chứa từ khóa "${transcript}". Thử tìm kiếm với từ khóa khác.`
                    : "Hiện tại chưa có chủ đề nào được kích hoạt trong hệ thống."}
                </p>
                {transcript && (
                  <button
                    className="btn btn-outline-primary mt-3"
                    onClick={() => setTranscript("")}
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="topics-header mb-4">
                  <h3>
                    📚 Chủ đề học tập
                    <span className="badge bg-primary ms-2">
                      {filteredTopics.length}
                    </span>
                  </h3>
                  {transcript && (
                    <p className="text-muted">
                      Tìm thấy {filteredTopics.length} chủ đề cho "{transcript}"
                    </p>
                  )}
                </div>
                <div className="row g-4">
                  {filteredTopics.map((topic, index) => (
                    <div
                      className="col-xl-4 col-lg-6 col-md-6 col-sm-12"
                      key={topic._id}
                    >
                      <div
                        className="topic-card"
                        style={{ "--delay": `${index * 0.1}s` }}
                      >
                        <Link
                          to={`/learner/topic/${topic._id}`}
                          className="topic-link"
                        >
                          <div className="topic-image-container">
                            <img
                              src={getImageUrl(topic.topicImage)}
                              className="topic-image"
                              alt={`Ảnh chủ đề ${topic.topicName}`}
                              loading="lazy"
                            />
                            <div className="topic-overlay">
                              <FontAwesomeIcon
                                icon={faBolt}
                                className="topic-icon"
                              />
                            </div>
                          </div>
                          <div className="topic-content">
                            <h5 className="topic-title">{topic.topicName}</h5>
                            <p className="topic-description">
                              Học từ vựng và cụm từ quan trọng trong lĩnh vực
                              này
                            </p>
                            <div className="topic-stats">
                              <span className="badge bg-success">
                                Kích hoạt
                              </span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sidebar - Practice Sections */}
        <div className="col-lg-4 col-md-12">
          <div className="sidebar-container">
            <div className="sidebar-header">
              <h4>
                <FontAwesomeIcon icon={faBolt} className="text-warning me-2" />
                Luyện tập khác
              </h4>
              <p className="text-muted">
                Các phần thi TOEIC Listening & Reading
              </p>
            </div>

            <div className="practice-sections">
              {isLoading ? (
                <div className="sidebar-loading">
                  <div
                    className="spinner-border spinner-border-sm text-primary mb-2"
                    role="status"
                  >
                    <span className="visually-hidden">Đang tải...</span>
                  </div>
                  <p className="text-muted">Đang tải phần luyện tập...</p>
                </div>
              ) : docngheSections.length === 0 ? (
                <div className="sidebar-empty">
                  <p className="text-muted">
                    Chưa có phần luyện tập nào được kích hoạt
                  </p>
                </div>
              ) : (
                docngheSections.map((section, index) => (
                  <div
                    className="practice-card"
                    key={section._id}
                    style={{ "--delay": `${index * 0.1}s` }}
                  >
                    <Link
                      className="practice-link"
                      to={`/learner/practice/${section._id}`}
                    >
                      <div className="practice-info">
                        <div className="practice-icon">
                          {section.type === 1 ? "🎧" : "📖"}
                        </div>
                        <div className="practice-details">
                          <h6 className="practice-title">{section.name}</h6>
                          <p className="practice-description">
                            {section.description
                              ? section.description.substring(0, 80) + "..."
                              : "Phần luyện tập TOEIC"}
                          </p>
                          <span className="practice-type">
                            {section.type === 1 ? "Listening" : "Reading"}
                          </span>
                        </div>
                      </div>
                      <div className="practice-arrow">→</div>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topic;
