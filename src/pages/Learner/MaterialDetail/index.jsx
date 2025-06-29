import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faDownload,
  faFileAlt,
  faCalendarAlt,
  faSpinner,
  faExclamationTriangle,
  faBook,
  faTag,
  faShare,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import AOS from "aos";
import "aos/dist/aos.css";
import "./style.css";

// Import services
import freeMaterialService from "../../../services/freeMaterialService";

const MaterialDetail = () => {
  const { id } = useParams();
  console.log("🚀 ~ MaterialDetail ~ id:", id);

  const navigate = useNavigate();

  // States
  const [material, setMaterial] = useState(null);
  console.log("🚀 ~ MaterialDetail ~ material:", material);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  // Fetch material detail
  useEffect(() => {
    const fetchMaterialDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await freeMaterialService.get(id);
        console.log("🚀 ~ fetchMaterialDetail ~ response:", response);

        // Handle response structure - check if data is nested
        const materialData = response.data?.data || response.data || response;
        console.log("🚀 ~ fetchMaterialDetail ~ materialData:", materialData);
        
        setMaterial(materialData);
      } catch (error) {
        console.error("Error fetching material detail:", error);
        setError("Không thể tải thông tin tài liệu. Vui lòng thử lại sau.");
        toast.error("Không thể tải thông tin tài liệu");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMaterialDetail();
    }
  }, [id]);

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  // Handle download
  const handleDownload = async () => {
    if (!material?.fileName) {
      toast.error("Không tìm thấy file để tải xuống");
      return;
    }

    try {
      setDownloading(true);

      // Use the fileName from the response structure
      await freeMaterialService.downloadFile(material.fileName);

      toast.success("Bắt đầu tải xuống tài liệu");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Lỗi khi tải xuống tài liệu");
    } finally {
      setDownloading(false);
    }
  };

  // Handle back navigation
  const handleBackClick = () => {
    navigate("/learner/materials");
  };

  // Loading state
  if (loading) {
    return (
      <div className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="text-center">
              <FontAwesomeIcon
                icon={faSpinner}
                spin
                size="3x"
                className="text-primary mb-3"
              />
              <h4>Đang tải thông tin tài liệu...</h4>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !material) {
    return (
      <div className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="text-center">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                size="3x"
                className="text-warning mb-3"
              />
              <h4 className="mb-3">Không tìm thấy tài liệu</h4>
              <p className="text-muted mb-4">
                {error || "Tài liệu không tồn tại hoặc đã bị xóa."}
              </p>
              <button className="btn btn-primary" onClick={handleBackClick}>
                <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                Quay lại danh sách tài liệu
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="material-detail-container">
      <div className="container-fluid py-4">
        {/* Breadcrumb */}
        <div className="row mb-4">
          <div className="col-12">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link
                    to="/learner/dashboard"
                    className="text-decoration-none"
                  >
                    Trang chủ
                  </Link>
                </li>
                <li className="breadcrumb-item">
                  <Link
                    to="/learner/materials"
                    className="text-decoration-none"
                  >
                    Tài liệu học tập
                  </Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  {material.title}
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Back button */}
        <div className="row mb-4">
          <div className="col-12">
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={handleBackClick}
              data-aos="fade-right"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              Quay lại danh sách
            </button>
          </div>
        </div>

        {/* Material Detail Content */}
        <div className="row">
          <div className="col-lg-8 col-xl-9">
            {/* Main Material Card */}
            <div
              className="card material-main-card shadow-sm mb-4"
              data-aos="fade-up"
            >
              <div className="card-body p-4">
                {/* Header */}
                <div className="material-header mb-4">
                  <div className="d-flex align-items-start justify-content-between">
                    <div className="flex-grow-1">
                      <h1 className="material-title mb-3">{material.title}</h1>

                      {/* Meta Information */}
                      <div className="material-meta d-flex flex-wrap gap-3 mb-3">
                        <span className="meta-item">
                          <FontAwesomeIcon
                            icon={faCalendarAlt}
                            className="me-1 text-muted"
                          />
                          {new Date(material.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                        <span className="meta-item">
                          <FontAwesomeIcon
                            icon={faFileAlt}
                            className="me-1 text-muted"
                          />
                          {material.fileExtension?.toUpperCase() || 'PDF'} Document
                        </span>
                        <span className="meta-item">
                          <FontAwesomeIcon
                            icon={faTag}
                            className="me-1 text-muted"
                          />
                          Tài liệu miễn phí
                        </span>
                      </div>

                      {/* Status Badge */}
                      <div className="mb-3">
                        <span
                          className={`badge ${
                            material.materialStatus === 1
                              ? "bg-success"
                              : "bg-secondary"
                          }`}
                        >
                          {material.statusDisplay || (material.materialStatus === 1
                            ? "Đang hoạt động"
                            : "Không hoạt động")}
                        </span>
                      </div>
                    </div>

                    {/* Download Button */}
                    <div className="download-section">
                      <button
                        className="btn btn-primary btn-lg"
                        onClick={handleDownload}
                        disabled={downloading || material.materialStatus !== 1}
                        title={
                          material.materialStatus !== 1
                            ? "Tài liệu này hiện không khả dụng"
                            : "Tải xuống tài liệu"
                        }
                      >
                        <FontAwesomeIcon
                          icon={downloading ? faSpinner : faDownload}
                          spin={downloading}
                          className="me-2"
                        />
                        {downloading ? "Đang tải..." : "Tải xuống"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {(material.description || material.shortDescription) && (
                  <div className="material-description">
                    <h3 className="section-title mb-3">
                      <FontAwesomeIcon
                        icon={faBook}
                        className="me-2 text-primary"
                      />
                      Mô tả tài liệu
                    </h3>
                    <div className="description-content p-3 bg-light rounded">
                      <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
                        {material.description || material.shortDescription}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div
              className="card shadow-sm"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <div className="card-body">
                <h3 className="section-title mb-3">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="me-2 text-primary"
                  />
                  Thông tin bổ sung
                </h3>

                <div className="row">
                  <div className="col-md-6">
                    <div className="info-item mb-3">
                      <strong>Tên file:</strong>
                      <p className="mb-0 text-muted">{material.fileName || material.filePdf}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="info-item mb-3">
                      <strong>Định dạng:</strong>
                      <p className="mb-0 text-muted">{material.fileExtension?.toUpperCase() || 'PDF'}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="info-item mb-3">
                      <strong>Ngày tạo:</strong>
                      <p className="mb-0 text-muted">
                        {new Date(material.createdAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="info-item mb-3">
                      <strong>Cập nhật lần cuối:</strong>
                      <p className="mb-0 text-muted">
                        {new Date(material.updatedAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4 col-xl-3">
            <div className="material-sidebar">
              {/* Quick Actions */}
              <div className="card shadow-sm mb-4" data-aos="fade-left">
                <div className="card-body">
                  <h5 className="card-title mb-3">Thao tác nhanh</h5>

                  <div className="d-grid gap-2">
                    <button
                      className="btn btn-outline-primary"
                      onClick={handleDownload}
                      disabled={downloading || material.materialStatus !== 1}
                    >
                      <FontAwesomeIcon icon={faDownload} className="me-2" />
                      Tải xuống
                    </button>

                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        navigator.share &&
                          navigator.share({
                            title: material.title,
                            text: material.description || material.shortDescription,
                            url: window.location.href,
                          });
                      }}
                      disabled={!navigator.share}
                    >
                      <FontAwesomeIcon icon={faShare} className="me-2" />
                      Chia sẻ
                    </button>
                  </div>
                </div>
              </div>

              {/* File Information */}
              <div
                className="card shadow-sm mb-4"
                data-aos="fade-left"
                data-aos-delay="100"
              >
                <div className="card-body">
                  <h5 className="card-title mb-3">Thông tin file</h5>

                  <div className="file-info">
                    <div className="info-row d-flex justify-content-between mb-2">
                      <span className="text-muted">Định dạng:</span>
                      <span>{material.fileExtension?.toUpperCase() || 'PDF'}</span>
                    </div>
                    <div className="info-row d-flex justify-content-between mb-2">
                      <span className="text-muted">Trạng thái:</span>
                      <span
                        className={`badge ${
                          material.materialStatus === 1
                            ? "bg-success"
                            : "bg-secondary"
                        }`}
                      >
                        {material.statusDisplay || (material.materialStatus === 1
                          ? "Khả dụng"
                          : "Không khả dụng")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Help Section */}
              <div
                className="card shadow-sm"
                data-aos="fade-left"
                data-aos-delay="200"
              >
                <div className="card-body">
                  <h5 className="card-title mb-3">Cần hỗ trợ?</h5>
                  <p className="text-muted small mb-3">
                    Nếu bạn gặp vấn đề với việc tải xuống hoặc sử dụng tài liệu,
                    hãy liên hệ với chúng tôi.
                  </p>
                  <button className="btn btn-outline-info btn-sm">
                    Liên hệ hỗ trợ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialDetail;
