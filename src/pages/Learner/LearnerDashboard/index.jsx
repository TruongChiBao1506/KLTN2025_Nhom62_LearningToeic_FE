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
import userService from "../../../services/userService";
import "./style.css";

const LearnerDashboard = () => {
  console.log("🚀 LearnerDashboard component rendered");
  
  // State for statistics
  const [totalExams, setTotalExams] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [studyHours, setStudyHours] = useState(0);
  const [nextExam, setNextExam] = useState(null);
  const [recentExams, setRecentExams] = useState([]);
  const [performanceData, setPerformanceData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Gọi các API thật từ backend
      const [statisticsResponse, activityResponse] = await Promise.allSettled([
        userService.getUserStatistics(),
        userService.getRecentActivity(10)
      ]);

      let statsData = {};
      let activityData = [];

      // Xử lý statistics data
      if (statisticsResponse.status === 'fulfilled') {
        statsData = statisticsResponse.value;
        console.log("✅ Dashboard statistics loaded:", statsData);
      } else {
        console.warn("⚠️ Statistics API failed:", statisticsResponse.reason?.message);
      }

      // Xử lý activity data
      if (activityResponse.status === 'fulfilled') {
        activityData = Array.isArray(activityResponse.value) ? activityResponse.value : [];
        console.log("✅ Dashboard activity loaded:", activityData);
      } else {
        console.warn("⚠️ Activity API failed:", activityResponse.reason?.message);
      }

      // Map dữ liệu thật từ backend
      setTotalExams(statsData.examsCompleted || 0);
      setAverageScore(Math.round(statsData.averageScore || 0));
      setStudyHours(statsData.totalStudyTime || 0);

      // Tạo mock data cho next exam (có thể implement endpoint riêng sau)
      setNextExam({
        date: "2025-07-15",
        name: "TOEIC Official Test"
      });

      // Map activity data thành format cho recent exams
      const mappedExams = activityData
        .filter(activity => activity.type === 'exam' && activity.score)
        .slice(0, 5)
        .map(activity => ({
          date: activity.timestamp || activity.date,
          name: activity.title || activity.name || "TOEIC Test",
          score: activity.score
        }));

      setRecentExams(mappedExams);

      // Mock performance data (có thể implement endpoint riêng sau)
      const mockPerformanceData = {
        listening: Math.round((statsData.averageScore || 0) * 0.45 / 495 * 100), // Listening = 45% của total
        reading: Math.round((statsData.averageScore || 0) * 0.55 / 495 * 100), // Reading = 55% của total  
        speaking: Math.round(Math.random() * 30 + 70), // Mock data
        writing: Math.round(Math.random() * 30 + 70) // Mock data
      };

      setPerformanceData(mockPerformanceData);

      // Create charts với dữ liệu thật
      createScoreProgressChart(mappedExams);
      createSkillPerformanceChart(mockPerformanceData);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);

      // Fallback với mock data nếu API fails
      setTotalExams(5);
      setAverageScore(650);
      setStudyHours(24);
      setNextExam({
        date: "2025-07-15",
        name: "TOEIC Official Test"
      });
      setRecentExams([
        { date: "2025-06-25", name: "Practice Test 1", score: 720 },
        { date: "2025-06-20", name: "Practice Test 2", score: 680 },
        { date: "2025-06-15", name: "Practice Test 3", score: 650 }
      ]);

      const fallbackPerformance = {
        listening: 75,
        reading: 70,
        speaking: 65,
        writing: 68
      };
      setPerformanceData(fallbackPerformance);

      createScoreProgressChart([
        { date: "2025-06-25", name: "Practice Test 1", score: 720 },
        { date: "2025-06-20", name: "Practice Test 2", score: 680 },
        { date: "2025-06-15", name: "Practice Test 3", score: 650 }
      ]);
      createSkillPerformanceChart(fallbackPerformance);

    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Trang Chủ | Nền Tảng Học TOEIC";

    // Initialize AOS
    AOS.init({
      duration: 800,
      once: true,
    });

    // Call fetchDashboardData directly
    fetchDashboardData();
    
    // Disable exhaustive-deps warning for this specific case
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              colors: ["#17a2b8", "var(--color-approved)", "#ffc107", "var(--color-danger)"],
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
    <div className="learner-dashboard-container learner-dashboard">
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
      <div style={{padding:"24px"}}>
        <div className="welcome-banner" data-aos="fade-up">
          <div className="banner-content">
            <h2 style={{color:"var(--color-bg-primary)"}}>Chào mừng đến với Bảng điều khiển học TOEIC</h2>
            <p style={{color:"var(--color-bg-primary)"}}>
              Theo dõi tiến độ, truy cập tài liệu học tập và chuẩn bị cho kỳ thi
              TOEIC tiếp theo của bạn.
            </p>
          </div>
        </div>
  {/* Statistics Cards */}
  <div className="row mt-4 d-flex align-items-stretch">
          {/* Completed Exams Card */}
          <div className="col-md-3 d-flex" data-aos="fade-up" data-aos-delay="100">
            <div className="stat-card w-100 d-flex flex-column justify-content-between">
              <div className="stat-card-body flex-grow-1 d-flex align-items-center">
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
          <div className="col-md-3 d-flex" data-aos="fade-up" data-aos-delay="200">
            <div className="stat-card w-100 d-flex flex-column justify-content-between">
              <div className="stat-card-body flex-grow-1 d-flex align-items-center">
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
          <div className="col-md-3 d-flex" data-aos="fade-up" data-aos-delay="300">
            <div className="stat-card w-100 d-flex flex-column justify-content-between">
              <div className="stat-card-body flex-grow-1 d-flex align-items-center">
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
          <div className="col-md-3 d-flex" data-aos="fade-up" data-aos-delay="400">
            <div className="stat-card w-100 d-flex flex-column justify-content-between">
              <div className="stat-card-body flex-grow-1 d-flex align-items-center">
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
                            className={`ms-2 ${exam.score >= 800
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
    </div>
  );
};

export default LearnerDashboard;
