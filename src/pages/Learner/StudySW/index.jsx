import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import sectionService from "../../../services/sectionsService";

// Import components Speaking
import No1To2 from "../../../components/Learner/Speaking/No1To2";
import No3To4 from "../../../components/Learner/Speaking/No3To4";
import No5To7 from "../../../components/Learner/Speaking/No5To7";

// Import components Writing
import No1To5 from "../../../components/Learner/Writing/No1To5";

import "./style.css";

const StudySW = () => {
  const { sectionId, testId } = useParams();
  const [section, setSection] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch section data để xác định type
  useEffect(() => {
    const fetchSection = async () => {
      if (!sectionId) return;

      try {
        const response = await sectionService.get(sectionId);
        console.log("📋 Section data:", response);
        console.log("📋 Section type:", response.type);
        setSection(response);
      } catch (error) {
        console.error("Error fetching section:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSection();
  }, [sectionId]);

  // Render component tương ứng dựa vào sectionId hoặc section type
  const renderComponent = () => {
    // Handle old hardcoded section IDs for backward compatibility
    switch (sectionId) {
      // Old Speaking IDs
      case "6894cc50892a33de30593472":
        return <No1To2 testId={testId} />;
      case "6894cc50892a33de30593473":
        return <No3To4 testId={testId} />;
      case "6894cc50892a33de30593474":
        return <No5To7 testId={testId} />;
      // Old Writing IDs
      case "6894cc50892a33de30593475":
        return <No1To5 testId={testId} />;

      // Handle legacy cases
      case "107":
      case "108":
      case "110":
      case "111":
        return (
          <div className="col-12 text-center py-5">
            <div className="card">
              <div className="card-body">
                <h2>Đang phát triển</h2>
                <p className="lead">
                  Component cho phần này đang trong quá trình phát triển. Vui
                  lòng quay lại sau.
                </p>
                <div className="coming-soon">
                  <i className="fas fa-tools fa-3x mt-3"></i>
                  <p className="mt-3">
                    {sectionId === "107" && "Speaking Tasks 8-10"}
                    {sectionId === "108" && "Speaking Task 11"}
                    {sectionId === "110" && "Writing Tasks 6-7"}
                    {sectionId === "111" && "Writing Task 8"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      // Handle new dynamic sections based on type
      default:
        if (loading) {
          return (
            <div className="col-12 text-center py-5">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Đang tải...</span>
                    </div>
                  </div>
                  <p className="mt-3">Đang tải thông tin bài luyện tập...</p>
                </div>
              </div>
            </div>
          );
        }

        if (!section) {
          return (
            <div className="col-12 text-center py-5">
              <div className="card">
                <div className="card-body">
                  <h2>❌ Lỗi</h2>
                  <p className="lead">Không thể tải thông tin section</p>
                </div>
              </div>
            </div>
          );
        }

        // Determine component based on section type and name
        if (section.type === 3) {
          // Speaking - Always use No1To2 which has recording functionality
          console.log("🎤 Loading Speaking component with recording");
          return <No1To2 testId={testId} />;
        } else if (section.type === 4) {
          // Writing
          console.log("✍️ Loading Writing component");
          return <No1To5 testId={testId} />;
        }
        // Fallback for new sections - show a modern practice interface
        return (
          <div className="col-12 text-center py-5">
            <div
              className="card shadow-lg border-0"
              style={{ borderRadius: "20px" }}
            >
              <div className="card-body p-5">
                <div className="mb-4">
                  <div
                    className="mx-auto mb-3"
                    style={{
                      width: "80px",
                      height: "80px",
                      background:
                        section.type === 3
                          ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                          : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "2rem",
                      color: "white",
                    }}
                  >
                    {section.type === 3 ? "🗣️" : "✍️"}
                  </div>
                </div>

                <h2
                  className="mb-3"
                  style={{
                    background:
                      section.type === 3
                        ? "linear-gradient(45deg, #667eea 0%, #764ba2 100%)"
                        : "linear-gradient(45deg, #f093fb 0%, #f5576c 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {section.name}
                </h2>

                <p className="lead text-muted mb-4">{section.description}</p>

                <div className="row g-3 justify-content-center">
                  <div className="col-auto">
                    <button
                      className="btn btn-lg px-4"
                      style={{
                        background:
                          section.type === 3
                            ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                            : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                        border: "none",
                        color: "white",
                        borderRadius: "25px",
                      }}
                    >
                      <i className="fas fa-play me-2"></i>
                      Bắt đầu luyện tập
                    </button>
                  </div>
                  <div className="col-auto">
                    <button
                      className="btn btn-outline-secondary btn-lg px-4"
                      style={{ borderRadius: "25px" }}
                    >
                      <i className="fas fa-info-circle me-2"></i>
                      Hướng dẫn
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-top">
                  <small className="text-muted">
                    <i className="fas fa-flask me-2"></i>
                    Tính năng đang được phát triển với AI
                  </small>
                  <br />
                  <small className="text-muted">
                    Section ID: {sectionId} | Test ID: {testId}
                  </small>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-test">
      <div className="container-fluid">
        <div className="row mt-3">{renderComponent()}</div>
      </div>
    </div>
  );
};

export default StudySW;
