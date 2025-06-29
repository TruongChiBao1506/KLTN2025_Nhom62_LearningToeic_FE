import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpenReader,
  faBolt,
  faMicrophone,
  faSearch,
  faBook,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import "./style.css";

// Import services
import grammarService from "../../../services/grammarService";
import sectionService from "../../../services/sectionsService";

const Grammar = () => {
  // States
  const [grammars, setGrammars] = useState([]);
  const [sections, setSections] = useState([]);
  const [transcript, setTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Refs
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Fetch grammars and sections
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [grammarResponse, sectionResponse] = await Promise.all([
          grammarService.getAllEnabled(),
          sectionService.getAllEnabled(),
        ]);
        console.log("🚀 ~ fetchData ~ grammarResponse:", grammarResponse);
        console.log("🚀 ~ fetchData ~ sectionResponse:", sectionResponse);

        // Backend giờ trả về array trực tiếp
        console.log("🚀 ~ grammarResponse.data:", grammarResponse.data);
        console.log("🚀 ~ sectionResponse.data:", sectionResponse.data);
        
        // Data giờ là array trực tiếp, không có wrapper object
        const grammarData = grammarResponse.data || grammarResponse || [];
        const sectionData = sectionResponse.data || sectionResponse || [];
        
        console.log("🚀 ~ grammarData final:", grammarData);
        console.log("🚀 ~ sectionData final:", sectionData);
        
        setGrammars(Array.isArray(grammarData) ? grammarData : []);
        setSections(Array.isArray(sectionData) ? sectionData : []);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu ngữ pháp:", error);
        setError("Không thể tải dữ liệu ngữ pháp. Vui lòng thử lại sau.");
        toast.error("Không thể tải dữ liệu ngữ pháp. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtered grammars based on search
  const filteredGrammars = grammars.filter((grammar) => {
    if (!transcript.trim()) return true;
    const searchTerm = transcript.toLowerCase().trim();
    return (
      (grammar.grammarName && grammar.grammarName.toLowerCase().includes(searchTerm)) ||
      (grammar.description && grammar.description.toLowerCase().includes(searchTerm)) ||
      (grammar.content && grammar.content.toLowerCase().includes(searchTerm))
    );
  });
  console.log("🚀 ~ filteredGrammars:", filteredGrammars);
  console.log("🚀 ~ grammars original:", grammars);


  // Filtered sections for reading and listening
  const docngheSections = sections.filter(
    (section) => section.type === 1 || section.type === 2
  );
  console.log("🚀 ~ Grammar ~ docngheSections:", docngheSections);


  const startSpeechRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = "vi-VN"; // Changed to Vietnamese for better recognition
    recognitionRef.current.interimResults = true;
    recognitionRef.current.continuous = false;

    setIsSpeaking(true);

    recognitionRef.current.addEventListener("result", (event) => {
      const lastResultIndex = event.results.length - 1;
      setTranscript(event.results[lastResultIndex][0].transcript);
    });

    recognitionRef.current.addEventListener("end", () => {
      recognitionRef.current.stop();
      setIsSpeaking(false);
    });

    recognitionRef.current.addEventListener("error", (event) => {
      console.error("Speech recognition error:", event.error);
      setIsSpeaking(false);
      toast.error("Lỗi nhận dạng giọng nói. Vui lòng thử lại.");
    });

    recognitionRef.current.start();
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsSpeaking(false);
    }
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
        <p className="mt-3">Đang tải dữ liệu...</p>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger text-center">
          <FontAwesomeIcon icon={faBook} size="3x" className="mb-3" />
          <h4>Có lỗi xảy ra</h4>
          <p>{error}</p>
          <button
            className="btn btn-outline-danger"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grammar-page">
      <div className="container">
        <div className="page-header text-center">
          <h1 className="page-title">
            <FontAwesomeIcon icon={faBook} className="me-3" />
            <span>LUYỆN NGỮ PHÁP TOEIC</span>
          </h1>
          <p className="page-subtitle">
            Học và luyện tập ngữ pháp TOEIC một cách hiệu quả
          </p>
        </div>

        <div className="row mt-5">
          <div className="col-lg-8 col-md-8">
            {/* Enhanced Modern Search Bar */}
            <div className="search-container mb-4">
              <div className="search-wrapper">
                <div className="search-icon-left">
                  <FontAwesomeIcon icon={faSearch} />
                </div>
                <input
                  type="text"
                  className="search-input-modern"
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Tìm kiếm ngữ pháp TOEIC..."
                />
                <div className="search-actions">
                  {transcript && (
                    <button
                      className="clear-btn"
                      type="button"
                      onClick={() => setTranscript("")}
                      title="Xóa tìm kiếm"
                    >
                      ×
                    </button>
                  )}
                  <button
                    className={`voice-btn-modern ${isSpeaking ? "listening" : ""}`}
                    type="button"
                    onClick={isSpeaking ? stopSpeechRecognition : startSpeechRecognition}
                    title={isSpeaking ? "Dừng ghi âm" : "Tìm kiếm bằng giọng nói"}
                  >
                    <FontAwesomeIcon
                      icon={faMicrophone}
                      className={isSpeaking ? "pulse" : ""}
                    />
                  </button>
                </div>
              </div>
              {isSpeaking && (
                <div className="listening-indicator-modern">
                  <div className="sound-wave">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="listening-text">
                    Đang nghe... Hãy nói tên ngữ pháp bạn muốn tìm
                  </span>
                </div>
              )}
              {transcript && (
                <div className="search-results-info">
                  <small className="text-muted">
                    Tìm thấy {filteredGrammars.length} kết quả cho "{transcript}"
                  </small>
                </div>
              )}
            </div>

            {/* Grammar Cards Grid */}
            <div className="grammar-container">
              <div className="grammar-header">
                <h4 className="section-title">
                  <FontAwesomeIcon icon={faBookOpenReader} className="me-2" />
                  Danh sách ngữ pháp
                  <span className="grammar-count">({filteredGrammars.length})</span>
                </h4>
              </div>
              <div className="grammar-body">
                {filteredGrammars.length > 0 ? (
                  <div className="grammar-grid">
                    {filteredGrammars.map((grammar, index) => (
                      <div
                        className="grammar-item"
                        key={grammar._id || grammar.grammarId || index}
                      >
                        <Link
                          to={`/learner/grammar/${
                            grammar._id || grammar.grammarId
                          }`}
                          className="grammar-link"
                        >
                          <div className="grammar-card">
                            <div className="grammar-card-header">
                              <div className="grammar-icon">
                                <FontAwesomeIcon
                                  icon={faBookOpenReader}
                                />
                              </div>
                              <div className="grammar-badge">
                                Ngữ pháp #{index + 1}
                              </div>
                            </div>
                            <div className="grammar-card-body">
                              <h6 className="grammar-name">
                                {grammar.grammarName || "Chưa có tên"}
                              </h6>
                              <p className="grammar-description">
                                {grammar.description || "Nhấp để học chi tiết về ngữ pháp này"}
                              </p>
                            </div>
                            <div className="grammar-card-footer">
                              <span className="learn-more">
                                Học ngay
                                <FontAwesomeIcon icon={faBookOpenReader} className="ms-1" />
                              </span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-results">
                    <div className="no-results-icon">
                      <FontAwesomeIcon icon={faBook} />
                    </div>
                    <h5 className="no-results-title">
                      {transcript
                        ? "Không tìm thấy ngữ pháp nào"
                        : "Chưa có dữ liệu ngữ pháp"}
                    </h5>
                    <p className="no-results-description">
                      {transcript
                        ? "Thử tìm kiếm với từ khóa khác hoặc kiểm tra chính tả"
                        : "Dữ liệu đang được cập nhật, vui lòng thử lại sau"}
                    </p>
                    {transcript && (
                      <button
                        className="clear-search-btn"
                        onClick={() => setTranscript("")}
                      >
                        Xóa tìm kiếm
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="col-lg-4 col-md-4">
            <div className="sidebar-section">
              <h5 className="sidebar-title">
                <FontAwesomeIcon icon={faBolt} className="text-warning me-2" />
                CÁC BÀI LUYỆN TẬP KHÁC
              </h5>

              <div className="practice-sections">
                {docngheSections.length > 0 ? (
                  docngheSections.map((section) => (
                    <div
                      className="practice-card mb-2"
                      key={section._id || section.id}
                    >
                      <Link
                        className="practice-link"
                        to={`/learner/practice/${section._id || section.id}`}
                      >
                        <div className="practice-content">
                          <h6 className="practice-name">{section.name}</h6>
                          <small className="practice-description">
                            {section.description || "Luyện tập kỹ năng"}
                          </small>
                        </div>
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="no-practices text-center py-3">
                    <p className="text-muted mb-0">Chưa có bài luyện tập nào</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Grammar;
