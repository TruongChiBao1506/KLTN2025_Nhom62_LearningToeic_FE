import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faFileAlt,
  faChartLine,
  faClock,
  faMedal,
  faCalendarCheck,
  faTrophy,
  faFire,
  faBullseye,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import userService from "../../../services/userService";
import "./style.css";

const LearnerDashboard = () => {
  // State for all dashboard data
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "Trang Chủ | Nền Tảng Học TOEIC";
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await userService.getLearnerDashboard();
      console.log("✅ Dashboard data loaded:", response);

      setDashboardData(response.data);
    } catch (error) {
      console.error("❌ Error fetching dashboard data:", error);
      setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  const getScoreColor = (score) => {
    if (score >= 800) return "#10b981"; // green
    if (score >= 650) return "#3b82f6"; // blue
    if (score >= 500) return "#f59e0b"; // yellow
    return "#ef4444"; // red
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 80) return "#10b981";
    if (accuracy >= 60) return "#f59e0b";
    return "#ef4444";
  };

  if (isLoading) {
    return (
      <div className="learner-dashboard-container learner-dashboard">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
          <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="learner-dashboard-container learner-dashboard">
        <div className="alert alert-danger m-4" role="alert">
          <h4 className="alert-heading">Lỗi!</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchDashboardData}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const { overview, skillAnalysis, accuracyByPart, scoreProgress, recentExams, insights } = dashboardData || {};

  return (
    <div className="learner-dashboard-container learner-dashboard">
      {/* Breadcrumb */}
      <div className="breadcrumb-container">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item active">
              <FontAwesomeIcon icon={faHouse} className="me-2" />
              Dashboard
            </li>
          </ol>
        </nav>
      </div>

      {/* Welcome Banner */}
      <div style={{ padding: "24px" }}>
        <div className="welcome-banner">
          <div className="banner-content">
            <h2 style={{ color: "var(--color-bg-primary)" }}>
              Chào mừng đến với Bảng điều khiển học TOEIC
            </h2>
            <p style={{ color: "var(--color-bg-primary)" }}>
              Theo dõi tiến độ, truy cập tài liệu học tập và chuẩn bị cho kỳ thi TOEIC tiếp theo của bạn.
            </p>
          </div>
        </div>

        {/* Main Statistics Cards */}
        <div className="row mt-4 g-4">
          {/* Completed Exams */}
          <div className="col-md-3">
            <div className="stat-card h-100">
              <div className="stat-card-body d-flex align-items-center">
                <div className="stat-card-icon bg-primary">
                  <FontAwesomeIcon icon={faFileAlt} />
                </div>
                <div className="stat-card-info">
                  <h5>Bài thi đã hoàn thành</h5>
                  <h3>{overview?.completedExamsCount || 0}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Average Score */}
          <div className="col-md-3">
            <div className="stat-card h-100">
              <div className="stat-card-body d-flex align-items-center">
                <div className="stat-card-icon bg-success">
                  <FontAwesomeIcon icon={faChartLine} />
                </div>
                <div className="stat-card-info">
                  <h5>Điểm trung bình</h5>
                  <h3>{overview?.averageScore || 0}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Study Hours */}
          <div className="col-md-3">
            <div className="stat-card h-100">
              <div className="stat-card-body d-flex align-items-center">
                <div className="stat-card-icon bg-info">
                  <FontAwesomeIcon icon={faClock} />
                </div>
                <div className="stat-card-info">
                  <h5>Giờ học tập</h5>
                  <h3>{overview?.studyHours || 0}h</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Best Score */}
          <div className="col-md-3">
            <div className="stat-card h-100">
              <div className="stat-card-body d-flex align-items-center">
                <div className="stat-card-icon" style={{ backgroundColor: "#10b981" }}>
                  <FontAwesomeIcon icon={faTrophy} />
                </div>
                <div className="stat-card-info">
                  <h5>Điểm cao nhất</h5>
                  <h3>{overview?.bestScore || 0}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Statistics Cards */}
        <div className="row mt-4 g-4">
          {/* Learning Streak */}
          <div className="col-md-3">
            <div className="stat-card h-100">
              <div className="stat-card-body d-flex align-items-center">
                <div className="stat-card-icon" style={{ backgroundColor: "#ff6b6b" }}>
                  <FontAwesomeIcon icon={faFire} />
                </div>
                <div className="stat-card-info">
                  <h5>Chuỗi học tập</h5>
                  <h3>{overview?.learningStreak || 0} ngày</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Goal Progress */}
          <div className="col-md-3">
            <div className="stat-card h-100">
              <div className="stat-card-body d-flex align-items-center">
                <div className="stat-card-icon" style={{ backgroundColor: "#4ecdc4" }}>
                  <FontAwesomeIcon icon={faBullseye} />
                </div>
                <div className="stat-card-info">
                  <h5>Tiến độ mục tiêu</h5>
                  <h3>{overview?.goalProgress || 0}%</h3>
                  {overview?.goalScore > 0 && <p className="mb-0">Mục tiêu: {overview.goalScore}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Overall Accuracy */}
          <div className="col-md-3">
            <div className="stat-card h-100">
              <div className="stat-card-body d-flex align-items-center">
                <div className="stat-card-icon" style={{ backgroundColor: "#a29bfe" }}>
                  <FontAwesomeIcon icon={faCheckCircle} />
                </div>
                <div className="stat-card-info">
                  <h5>Độ chính xác chung</h5>
                  <h3>{overview?.overallAccuracy || 0}%</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Next Exam */}
          <div className="col-md-3">
            <div className="stat-card h-100">
              <div className="stat-card-body d-flex align-items-center">
                <div className="stat-card-icon bg-warning">
                  <FontAwesomeIcon icon={faCalendarCheck} />
                </div>
                <div className="stat-card-info">
                  <h5>Kỳ thi tiếp theo</h5>
                  <h3>{overview?.nextExamDate ? formatDate(overview.nextExamDate) : "Chưa có lịch"}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skill Analysis Section */}
        {skillAnalysis && (
          <div className="row mt-4">
            <div className="col-12">
              <div className="chart-container">
                <div className="chart-header">
                  <h5>Phân tích kỹ năng</h5>
                </div>
                <div className="chart-body p-4">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="skill-card p-4" style={{ border: "2px solid #17a2b8", borderRadius: "12px" }}>
                        <h6 className="mb-3">🎧 Listening</h6>
                        <h2 className="mb-2" style={{ color: "#17a2b8" }}>
                          {skillAnalysis.listening}/495
                        </h2>
                        <div className="progress mb-2" style={{ height: "10px" }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: `${skillAnalysis.listeningPercentage}%`, backgroundColor: "#17a2b8" }}
                          />
                        </div>
                        <small className="text-muted">{skillAnalysis.listeningPercentage}% hoàn thành</small>
                        {skillAnalysis.improvement && (
                          <p className="mt-2 mb-0 text-success">
                            ↗ Cải thiện: +{skillAnalysis.improvement.listening} điểm
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="skill-card p-4" style={{ border: "2px solid #28a745", borderRadius: "12px" }}>
                        <h6 className="mb-3">📖 Reading</h6>
                        <h2 className="mb-2" style={{ color: "#28a745" }}>
                          {skillAnalysis.reading}/495
                        </h2>
                        <div className="progress mb-2" style={{ height: "10px" }}>
                          <div
                            className="progress-bar bg-success"
                            role="progressbar"
                            style={{ width: `${skillAnalysis.readingPercentage}%` }}
                          />
                        </div>
                        <small className="text-muted">{skillAnalysis.readingPercentage}% hoàn thành</small>
                        {skillAnalysis.improvement && (
                          <p className="mt-2 mb-0 text-success">
                            ↗ Cải thiện: +{skillAnalysis.improvement.reading} điểm
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {skillAnalysis.strongerSkill && (
                    <div className="alert alert-info mt-4 mb-0">
                      <strong>Kỹ năng mạnh:</strong> {skillAnalysis.strongerSkill}
                      {skillAnalysis.improvement && (
                        <span className="ms-3">
                          <strong>Tổng cải thiện:</strong> +{skillAnalysis.improvement.overall} điểm
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Accuracy by Part */}
        {accuracyByPart && accuracyByPart.length > 0 && (
          <div className="row mt-4">
            <div className="col-12">
              <div className="chart-container">
                <div className="chart-header">
                  <h5>Độ chính xác theo từng phần</h5>
                </div>
                <div className="chart-body p-4">
                  <div className="row g-3">
                    {accuracyByPart.map((part, index) => (
                      <div className="col-md-3 col-sm-6" key={index}>
                        <div className="part-card p-3" style={{ border: "1px solid #ddd", borderRadius: "8px" }}>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="mb-0">{part.part}</h6>
                            <span
                              className="badge"
                              style={{ backgroundColor: getAccuracyColor(part.accuracy), fontSize: "14px" }}
                            >
                              {part.accuracy}%
                            </span>
                          </div>
                          <div className="progress mb-2" style={{ height: "8px" }}>
                            <div
                              className="progress-bar"
                              role="progressbar"
                              style={{
                                width: `${part.accuracy}%`,
                                backgroundColor: getAccuracyColor(part.accuracy),
                              }}
                            />
                          </div>
                          <small className="text-muted">
                            {part.correctAnswers}/{part.totalQuestions} câu đúng
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Exams and Score Progress */}
        <div className="row mt-4 g-4">
          {/* Score Progress */}
          {scoreProgress && scoreProgress.length > 0 && (
            <div className="col-md-8">
              <div className="chart-container">
                <div className="chart-header">
                  <h5>Tiến độ điểm số (6 tháng gần đây)</h5>
                </div>
                <div className="chart-body p-4">
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Tháng</th>
                          <th>Listening</th>
                          <th>Reading</th>
                          <th>Tổng điểm</th>
                          <th>Số bài thi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scoreProgress.map((item, index) => (
                          <tr key={index}>
                            <td>{item.month}</td>
                            <td>{item.listening}</td>
                            <td>{item.reading}</td>
                            <td>
                              <strong style={{ color: getScoreColor(item.totalScore) }}>{item.totalScore}</strong>
                            </td>
                            <td>{item.examCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Exams */}
          {recentExams && recentExams.length > 0 && (
            <div className="col-md-4">
              <div className="chart-container">
                <div className="chart-header">
                  <h5>Kết quả thi gần đây</h5>
                </div>
                <div className="chart-body">
                  <div className="recent-exams-list">
                    {recentExams.map((exam, index) => (
                      <div className="recent-exam-item" key={index}>
                        <div className="exam-date">{formatDate(exam.completedAt)}</div>
                        <div className="exam-name">{exam.examName}</div>
                        <div className="exam-score">
                          <strong style={{ color: getScoreColor(exam.totalScore) }}>{exam.totalScore}</strong>
                          <FontAwesomeIcon
                            icon={faMedal}
                            className="ms-2"
                            style={{ color: exam.totalScore >= 800 ? "#ffc107" : "#6c757d" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Insights Section */}
        {insights && (
          <div className="row mt-4">
            <div className="col-12">
              <div className="chart-container">
                <div className="chart-header">
                  <h5>Nhận xét & Gợi ý</h5>
                </div>
                <div className="chart-body p-4">
                  <div className="row g-4">
                    <div className="col-md-3 text-center">
                      <div className="insight-card p-3">
                        <h6 className="mb-2">Điểm mạnh nhất</h6>
                        <h4 style={{ color: "#10b981" }}>{insights.strongestPart}</h4>
                      </div>
                    </div>
                    <div className="col-md-3 text-center">
                      <div className="insight-card p-3">
                        <h6 className="mb-2">Điểm yếu nhất</h6>
                        <h4 style={{ color: "#ef4444" }}>{insights.weakestPart}</h4>
                      </div>
                    </div>
                    <div className="col-md-3 text-center">
                      <div className="insight-card p-3">
                        <h6 className="mb-2">Tổng số câu đã làm</h6>
                        <h4 style={{ color: "#3b82f6" }}>{insights.totalQuestionsAttempted}</h4>
                      </div>
                    </div>
                    <div className="col-md-3 text-center">
                      <div className="insight-card p-3">
                        <h6 className="mb-2">Cần cải thiện?</h6>
                        <h4 style={{ color: insights.needsImprovement === "Yes" ? "#ef4444" : "#10b981" }}>
                          {insights.needsImprovement === "Yes" ? "Có" : "Không"}
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearnerDashboard;
