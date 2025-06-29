import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faHeadphones,
  faBook,
  faLanguage,
  faVolumeUp,
  faCalendarAlt,
  faEye,
  faUser,
  faDownload,
  faFileAlt,
  faSadTear,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import AOS from "aos";
import "aos/dist/aos.css";
import "./style.css";

// Import services
import freeMaterialService from "../../../services/freeMaterialService";
import lessonService from "../../../services/lessonService";

const LearningMaterials = () => {
  // States
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTags, setActiveTags] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const materialsPerPage = 12;

  // Popular tags
  const popularTags = [
    "Listening",
    "Reading",
    "Grammar",
    "Vocabulary",
    "Part 1",
    "Part 2",
    "Part 3",
    "Part 4",
    "Part 5",
    "Part 6",
    "Part 7",
    "Beginner",
    "Intermediate",
    "Advanced",
  ];

  const fetchMaterials = useCallback(async () => {
    try {
      setLoading(true);
      let response;
      let mergedData = [];

      if (activeFilter === "lessons") {
        response = await lessonService.all();
        mergedData = Array.isArray(response) ? response : response.data;
        // Gắn type cho từng lesson
        mergedData = mergedData.map((lesson) => ({
          ...lesson,
          type: "lesson",
        }));
      } else if (activeFilter === "free-materials") {
        response = await freeMaterialService.all();
        mergedData = Array.isArray(response) ? response : response.data;
        // Gắn type cho từng material
        mergedData = mergedData.map((material) => ({
          ...material,
          type: "material",
        }));
      } else {
        const lessonResponse = await lessonService.all();
        const materialResponse = await freeMaterialService.all();

        const lessons = Array.isArray(lessonResponse)
          ? lessonResponse
          : lessonResponse.data;
        const materials = Array.isArray(materialResponse)
          ? materialResponse
          : materialResponse.data;

        mergedData = [
          ...lessons.map((lesson) => ({
            ...lesson,
            type: "lesson",
          })),
          ...materials.map((material) => ({
            ...material,
            type: "material",
          })),
        ];
      }

      // Lọc theo tag nếu có
      let filteredMaterials = mergedData;

      if (activeTags.length > 0) {
        filteredMaterials = filteredMaterials.filter(
          (material) =>
            material.tags &&
            material.tags.some((tag) => activeTags.includes(tag))
        );
      }
      console.log(
        "🚀 ~ fetchMaterials ~ filteredMaterials:",
        filteredMaterials
      );

      setMaterials(filteredMaterials);
    } catch (error) {
      console.error("Lỗi khi tải tài liệu học tập:", error);
      toast.error("Không thể tải tài liệu học tập. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, [activeFilter, activeTags]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handleTagToggle = (tag) => {
    if (activeTags.includes(tag)) {
      setActiveTags(activeTags.filter((t) => t !== tag));
    } else {
      setActiveTags([...activeTags, tag]);
    }
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Filter materials by search term
    setCurrentPage(1);
  };

  const filteredMaterials = materials.filter((material) => {
    const name =
      material.title || material.lessonName || material.materialName || "";
    const desc =
      material.description ||
      material.lessonDescription ||
      material.materialDescription ||
      "";
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      desc.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Pagination
  const indexOfLastMaterial = currentPage * materialsPerPage;
  const indexOfFirstMaterial = indexOfLastMaterial - materialsPerPage;
  const currentMaterials = filteredMaterials.slice(
    indexOfFirstMaterial,
    indexOfLastMaterial
  );
  const totalPages = Math.ceil(filteredMaterials.length / materialsPerPage);

  const getMaterialTypeIcon = (material) => {
    switch (material.category?.toLowerCase()) {
      case "listening":
        return { icon: faHeadphones, className: "icon-listening" };
      case "reading":
        return { icon: faBook, className: "icon-reading" };
      case "grammar":
        return { icon: faLanguage, className: "icon-grammar" };
      case "vocabulary":
        return { icon: faVolumeUp, className: "icon-vocabulary" };
      default:
        return { icon: faFileAlt, className: "icon-reading" };
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  useEffect(() => {
    // Initialize AOS animation library
    AOS.init({
      duration: 800,
      easing: "ease-in-out",
    });

    fetchMaterials();
  }, [fetchMaterials]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="materials-container">
      {/* Header with search */}
      <div className="materials-header text-center" data-aos="fade-up">
        <h2 className="materials-title">Tài liệu học tập TOEIC</h2>
        <p className="materials-subtitle">
          Khám phá các tài liệu, bài học và tài nguyên để cải thiện kỹ năng
          TOEIC của bạn
        </p>
        <div className="search-container">
          <form onSubmit={handleSearch}>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Tìm kiếm tài liệu học tập..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">
                <FontAwesomeIcon icon={faSearch} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs" data-aos="fade-up">
        <button
          className={`filter-tab ${activeFilter === "all" ? "active" : ""}`}
          onClick={() => handleFilterChange("all")}
        >
          Tất cả
        </button>
        <button
          className={`filter-tab ${activeFilter === "lessons" ? "active" : ""}`}
          onClick={() => handleFilterChange("lessons")}
        >
          Bài học
        </button>
        <button
          className={`filter-tab ${
            activeFilter === "free-materials" ? "active" : ""
          }`}
          onClick={() => handleFilterChange("free-materials")}
        >
          Tài liệu miễn phí
        </button>
      </div>

      {/* Popular tags */}
      <div className="popular-tags" data-aos="fade-up">
        <h5 className="tags-title">Chủ đề phổ biến:</h5>
        <div className="tags-container">
          {popularTags.map((tag, index) => (
            <span
              key={index}
              className={`tag ${activeTags.includes(tag) ? "active" : ""}`}
              onClick={() => handleTagToggle(tag)}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Materials grid */}
      {currentMaterials.length > 0 ? (
        <div className="materials-grid">
          {currentMaterials.map((material, index) => {
            const { icon, className } = getMaterialTypeIcon(material);
            return (
              <div
                className="material-card"
                key={index}
                data-aos="fade-up"
                data-aos-delay={(index % 4) * 100}
              >
                <div className="material-image-container">
                  <img
                    src={
                      material.imageUrl ||
                      "https://via.placeholder.com/300x160?text=TOEIC+Learning"
                    }
                    alt={material.title}
                    className="material-image"
                  />
                  <span
                    className={`material-badge ${
                      material.isPremium ? "badge-premium" : "badge-free"
                    }`}
                  >
                    {material.isPremium ? "Premium" : "Miễn phí"}
                  </span>
                  <div className={`material-type-icon ${className}`}>
                    <FontAwesomeIcon icon={icon} />
                  </div>
                </div>
                <div className="material-content">
                  <h5 className="material-title">{material.title}</h5>
                  <p className="material-description">{material.description}</p>
                  <div className="material-meta">
                    <span className="material-stat">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      {material.updatedAt
                        ? formatDate(material.updatedAt)
                        : "Không xác định"}
                    </span>
                    <span className="material-stat">
                      <FontAwesomeIcon icon={faEye} />
                      {material.views || 0}
                    </span>
                    <Link
                      to={`/learner/materials/${material._id || material.materialId}`}
                      className="material-button"
                    >
                      Xem
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="no-results" data-aos="fade-up">
          <div className="no-results-icon">
            <FontAwesomeIcon icon={faSadTear} />
          </div>
          <h4 className="no-results-text">Không tìm thấy tài liệu phù hợp</h4>
          <button
            className="btn btn-outline-primary"
            onClick={() => {
              setSearchTerm("");
              setActiveTags([]);
              setActiveFilter("all");
            }}
          >
            Xóa bộ lọc
          </button>
        </div>
      )}

      {/* Pagination */}
      {filteredMaterials.length > materialsPerPage && (
        <div className="materials-pagination" data-aos="fade-up">
          <nav>
            <ul className="pagination">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  &laquo;
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <li
                    key={page}
                    className={`page-item ${
                      page === currentPage ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  </li>
                )
              )}
              <li
                className={`page-item ${
                  currentPage === totalPages ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  &raquo;
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Featured Courses Section */}
      <div className="mt-5 pt-3 pb-5" data-aos="fade-up">
        <h3 className="text-center mb-4">Tài liệu nổi bật</h3>
        <div className="row">
          <div className="col-md-4 mb-4">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <h4 className="card-title">TOEIC 101: Cho người mới bắt đầu</h4>
                <p className="card-text">
                  Khóa học cung cấp kiến thức và kỹ thuật làm bài cơ bản cho
                  người mới học TOEIC.
                </p>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <FontAwesomeIcon
                      icon={faHeadphones}
                      className="me-2 text-primary"
                    />
                    Học nghe hiệu quả
                  </li>
                  <li className="mb-2">
                    <FontAwesomeIcon
                      icon={faBook}
                      className="me-2 text-success"
                    />
                    Cải thiện đọc hiểu
                  </li>
                  <li>
                    <FontAwesomeIcon
                      icon={faLanguage}
                      className="me-2 text-info"
                    />
                    Ngữ pháp căn bản
                  </li>
                </ul>
                <button className="btn btn-primary mt-3">Học ngay</button>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <h4 className="card-title">Từ 500 đến 700+ TOEIC</h4>
                <p className="card-text">
                  Chiến lược và phương pháp học tập để đạt được điểm số cao
                  trong bài thi TOEIC.
                </p>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <FontAwesomeIcon
                      icon={faVolumeUp}
                      className="me-2 text-warning"
                    />
                    Kỹ thuật nghe nâng cao
                  </li>
                  <li className="mb-2">
                    <FontAwesomeIcon
                      icon={faFileAlt}
                      className="me-2 text-danger"
                    />
                    Bí quyết làm Part 7
                  </li>
                  <li>
                    <FontAwesomeIcon
                      icon={faDownload}
                      className="me-2 text-dark"
                    />
                    Tài liệu độc quyền
                  </li>
                </ul>
                <button className="btn btn-outline-primary mt-3">
                  Xem thêm
                </button>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <h4 className="card-title">TOEIC Vocabulary Master</h4>
                <p className="card-text">
                  Phương pháp học từ vựng hiệu quả và dễ nhớ cho tất cả các phần
                  của bài thi TOEIC.
                </p>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="me-2 text-secondary"
                    />
                    5000+ học viên
                  </li>
                  <li className="mb-2">
                    <FontAwesomeIcon
                      icon={faBook}
                      className="me-2 text-success"
                    />
                    Từ vựng theo chủ đề
                  </li>
                  <li>
                    <FontAwesomeIcon
                      icon={faLanguage}
                      className="me-2 text-info"
                    />
                    Học nhanh, nhớ lâu
                  </li>
                </ul>
                <button className="btn btn-outline-primary mt-3">
                  Tham gia
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningMaterials;
