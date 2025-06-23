import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faFileAlt,
  faChartLine,
  faClock,
  faMedal,
  faCalendarCheck,
} from "@fortawesome/free-solid-svg-icons";
import Highcharts from "highcharts";
import AOS from "aos";
import "aos/dist/aos.css";

// Import services
import learnerExamService from "../../../services/learnerExamService";
import learnerProgressService from "../../../services/learnerProgressService";
import "./style.css";

const LearnerDashboard = () => {
  // State for statistics
  const [totalExams, setTotalExams] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [studyHours, setStudyHours] = useState(0);
  const [nextExam, setNextExam] = useState(null);
  const [recentExams, setRecentExams] = useState([]);
  const [performanceData, setPerformanceData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    document.title = "Trang Chủ | Nền Tảng Học TOEIC";

    // Initialize AOS
    AOS.init({
      duration: 800,
      once: true,
    });

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch all data in parallel
      const [
        examsCompleted,
        avgScore,
        hours,
        upcoming,
        recent,
        performanceStats,
      ] = await Promise.all([
        learnerExamService.getCompletedExamsCount(),
        learnerExamService.getAverageScore(),
        learnerProgressService.getTotalStudyHours(),
        learnerExamService.getUpcomingExam(),
        learnerExamService.getRecentExams(5),
        learnerProgressService.getPerformanceBySkill(),
      ]);

      setTotalExams(examsCompleted.count || 0);
      setAverageScore(avgScore.score || 0);
      setStudyHours(hours.total || 0);
      setNextExam(upcoming.exam || null);
      setRecentExams(recent.exams || []);
      setPerformanceData(performanceStats.data || {});

      // Create charts once data is loaded
      createScoreProgressChart(recent.exams || []);
      createSkillPerformanceChart(performanceStats.data || {});
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createScoreProgressChart = (examData) => {
    const dates = examData.map((exam) => exam.date);
    const scores = examData.map((exam) => exam.score);

    setTimeout(() => {
      const chartElem = document.getElementById("scoreProgressChart");
      if (chartElem) {
        Highcharts.chart("scoreProgressChart", {
          title: {
            text: "Your Recent TOEIC Score Progress",
          },
          xAxis: {
            categories: dates,
            title: {
              text: "Exam Date",
            },
          },
          yAxis: {
            title: {
              text: "Score",
            },
            min: 0,
            max: 990,
          },
          series: [
            {
              name: "Điểm TOEIC",
              data: scores,
              color: "#17a2b8",
            },
          ],
          credits: {
            enabled: false,
          },
          accessibility: {
            enabled: false,
          },
        });
      }
    }, 300);
  };

  const createSkillPerformanceChart = (skillData) => {
    setTimeout(() => {
      const chartElem = document.getElementById("skillPerformanceChart");
      if (chartElem) {
        Highcharts.chart("skillPerformanceChart", {
          chart: {
            type: "column",
          },
          title: {
            text: "Hiệu suất theo kỹ năng",
          },
          xAxis: {
            categories: ["Nghe", "Đọc", "Nói", "Viết"],
            crosshair: true,
          },
          yAxis: {
            min: 0,
            max: 100,
            title: {
              text: "Hiệu suất (%)",
            },
          },
          series: [
            {
              name: "Hiệu suất kỹ năng",
              data: [
                skillData.listening || 0,
                skillData.reading || 0,
                skillData.speaking || 0,
                skillData.writing || 0,
              ],
              colorByPoint: true,
              colors: ["#17a2b8", "#28a745", "#ffc107", "#dc3545"],
            },
          ],
          credits: {
            enabled: false,
          },
          accessibility: {
            enabled: false,
          },
        });
      }
    }, 300);
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Calculate time remaining until next exam
  const getTimeRemaining = (examDate) => {
    if (!examDate) return "Not scheduled";

    const now = new Date();
    const exam = new Date(examDate);
    const diffTime = exam - now;

    if (diffTime < 0) return "Expired";

    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );

    return `${diffDays}d ${diffHours}h remaining`;
  };

  return (
    <div className="learner-dashboard">
      {/* Breadcrumb */}
      <div className="breadcrumb-container" data-aos="fade-down">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item active">
              <FontAwesomeIcon icon={faHouse} className="me-2" />
              Dashboard
            </li>
          </ol>
        </nav>
      </div>{" "}
      {/* Welcome Banner */}
      <div className="welcome-banner" data-aos="fade-up">
        <div className="banner-content">
          <h2>Chào mừng đến với Bảng điều khiển học TOEIC</h2>
          <p>
            Theo dõi tiến độ, truy cập tài liệu học tập và chuẩn bị cho kỳ thi
            TOEIC tiếp theo của bạn.
          </p>
        </div>
      </div>
      {/* Statistics Cards */}
      <div className="row mt-4">
        {/* Completed Exams Card */}
        <div className="col-md-3" data-aos="fade-up" data-aos-delay="100">
          <div className="stat-card">
            <div className="stat-card-body">
              <div className="stat-card-icon bg-primary">
                <FontAwesomeIcon icon={faFileAlt} />
              </div>{" "}
              <div className="stat-card-info">
                <h5>Bài thi đã hoàn thành</h5>
                <h3>{isLoading ? "-" : totalExams}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Average Score Card */}
        <div className="col-md-3" data-aos="fade-up" data-aos-delay="200">
          <div className="stat-card">
            <div className="stat-card-body">
              <div className="stat-card-icon bg-success">
                <FontAwesomeIcon icon={faChartLine} />
              </div>{" "}
              <div className="stat-card-info">
                <h5>Điểm trung bình</h5>
                <h3>{isLoading ? "-" : averageScore}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Study Hours Card */}
        <div className="col-md-3" data-aos="fade-up" data-aos-delay="300">
          <div className="stat-card">
            <div className="stat-card-body">
              <div className="stat-card-icon bg-info">
                <FontAwesomeIcon icon={faClock} />
              </div>{" "}
              <div className="stat-card-info">
                <h5>Giờ học tập</h5>
                <h3>{isLoading ? "-" : studyHours}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Next Exam Card */}
        <div className="col-md-3" data-aos="fade-up" data-aos-delay="400">
          <div className="stat-card">
            <div className="stat-card-body">
              <div className="stat-card-icon bg-warning">
                <FontAwesomeIcon icon={faCalendarCheck} />
              </div>{" "}
              <div className="stat-card-info">
                <h5>Kỳ thi tiếp theo</h5>
                <h3>
                  {isLoading
                    ? "-"
                    : nextExam
                    ? formatDate(nextExam.date)
                    : "Chưa có lịch"}
                </h3>
                {nextExam && <p>{getTimeRemaining(nextExam.date)}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Charts and Tables */}
      <div className="row mt-4">
        {/* Score Progress Chart */}
        <div className="col-md-8" data-aos="fade-up" data-aos-delay="100">
          <div className="chart-container">
            {" "}
            <div className="chart-header">
              <h5>Tiến độ điểm TOEIC của bạn</h5>
            </div>
            <div className="chart-body">
              {isLoading ? (
                <div className="loader-container">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <div id="scoreProgressChart" style={{ height: "300px" }}></div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Exam Results */}
        <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
          <div className="chart-container">
            {" "}
            <div className="chart-header">
              <h5>Kết quả thi gần đây</h5>
            </div>
            <div className="chart-body">
              {isLoading ? (
                <div className="loader-container">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : recentExams.length > 0 ? (
                <div className="recent-exams-list">
                  {recentExams.map((exam, index) => (
                    <div className="recent-exam-item" key={index}>
                      <div className="exam-date">{formatDate(exam.date)}</div>
                      <div className="exam-name">{exam.name}</div>
                      <div className="exam-score">
                        {exam.score}
                        <FontAwesomeIcon
                          icon={faMedal}
                          className={`ms-2 ${
                            exam.score >= 800
                              ? "text-warning"
                              : exam.score >= 700
                              ? "text-secondary"
                              : exam.score >= 600
                              ? "text-bronze"
                              : ""
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data-message">
                  Không tìm thấy bài thi nào gần đây. Hãy làm bài thi thực hành
                  đầu tiên của bạn để xem kết quả ở đây.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Skill Performance Chart */}
      <div className="row mt-4">
        <div className="col-12" data-aos="fade-up" data-aos-delay="300">
          <div className="chart-container">
            <div className="chart-header">
              <h5>Performance by Skill</h5>
            </div>
            <div className="chart-body">
              {isLoading ? (
                <div className="loader-container">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <div
                  id="skillPerformanceChart"
                  style={{ height: "300px" }}
                ></div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Study Recommendations */}
      <div className="row mt-4" data-aos="fade-up" data-aos-delay="400">
        <div className="col-12">
          <div className="recommendations-container">
            <div className="recommendations-header">
              <h5>Recommended Study Focus</h5>
            </div>
            <div className="recommendations-body">
              {isLoading ? (
                <div className="loader-container">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <div className="row">
                  {performanceData &&
                    Object.entries({
                      listening: performanceData.listening || 0,
                      reading: performanceData.reading || 0,
                      speaking: performanceData.speaking || 0,
                      writing: performanceData.writing || 0,
                    })
                      .sort(([_, a], [__, b]) => a - b)
                      .slice(0, 2)
                      .map(([skill, score], index) => (
                        <div className="col-md-6" key={index}>
                          <div className="recommendation-card">
                            <h6>
                              Improve your{" "}
                              {skill.charAt(0).toUpperCase() + skill.slice(1)}{" "}
                              Skills
                            </h6>
                            <div className="progress mb-3">
                              <div
                                className="progress-bar"
                                role="progressbar"
                                style={{ width: `${score}%` }}
                                aria-valuenow={score}
                                aria-valuemin="0"
                                aria-valuemax="100"
                              >
                                {score}%
                              </div>
                            </div>
                            <p>
                              Your performance in this area is below average.
                              Focus on practicing more {skill} exercises.
                            </p>
                            <a
                              href={`/learner/materials?skill=${skill}`}
                              className="btn btn-sm btn-outline-primary"
                            >
                              View Study Materials
                            </a>
                          </div>
                        </div>
                      ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnerDashboard;
