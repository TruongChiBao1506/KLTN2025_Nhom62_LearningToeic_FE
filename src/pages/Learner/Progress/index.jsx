import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faHeadphones,
  faBook,
  faLanguage,
  faCheckCircle,
  faClock,
  faCalendarDay,
  faListAlt,
  faGraduationCap,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import Highcharts from "highcharts";
import AOS from "aos";
import "aos/dist/aos.css";
import { toast } from "react-toastify";
import "./style.css";

// Import services
import learnerProgressService from "../../../services/learnerProgressService";
import learnerExamService from "../../../services/learnerExamService";

const Progress = () => {
  // States
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState({
    totalExams: 0,
    averageScore: 0,
    listeningAverage: 0,
    readingAverage: 0,
    studyHours: 0,
    completedLessons: 0,
    strengths: [],
    weaknesses: [],
    recentActivity: [],
    examHistory: [],
    progressByMonth: {},
    skillBreakdown: {
      listening: 0,
      reading: 0,
      grammar: 0,
      vocabulary: 0,
    },
  });

  const [chartType, setChartType] = useState("progress"); // "progress" or "skills"
  const chartRef = useRef(null);
  const skillsChartRef = useRef(null);

  useEffect(() => {
    // Initialize AOS animation library
    AOS.init({
      duration: 800,
      easing: "ease-in-out",
    });

    // Fetch progress data
    const fetchProgressData = async () => {
      try {
        setLoading(true);

        // Fetch progress overview
        const progressResponse = await learnerProgressService.getUserProgress();

        // Fetch exam history
        const examHistoryResponse =
          await learnerExamService.getUserExamHistory();

        // Process and combine data
        const userData = {
          totalExams: progressResponse.data.totalExams || 0,
          averageScore: progressResponse.data.averageScore || 0,
          listeningAverage: progressResponse.data.listeningAverage || 0,
          readingAverage: progressResponse.data.readingAverage || 0,
          studyHours: progressResponse.data.studyHours || 0,
          completedLessons: progressResponse.data.completedLessons || 0,
          strengths: progressResponse.data.strengths || [],
          weaknesses: progressResponse.data.weaknesses || [],
          recentActivity: progressResponse.data.recentActivity || [],
          examHistory: examHistoryResponse.data || [],
          progressByMonth: progressResponse.data.progressByMonth || {},
          skillBreakdown: progressResponse.data.skillBreakdown || {
            listening: 0,
            reading: 0,
            grammar: 0,
            vocabulary: 0,
          },
        };

        setProgressData(userData);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu tiến trình:", error);
        toast.error("Không thể tải dữ liệu tiến trình. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, []);

  useEffect(() => {
    // Render progress chart when data is available
    if (!loading && progressData.progressByMonth && chartRef.current) {
      renderProgressChart();
    }
  }, [loading, progressData, chartType, chartRef.current]);

  useEffect(() => {
    // Render skills chart when data is available
    if (!loading && progressData.skillBreakdown && skillsChartRef.current) {
      renderSkillsChart();
    }
  }, [loading, progressData, chartType, skillsChartRef.current]);

  const renderProgressChart = () => {
    const months = Object.keys(progressData.progressByMonth);
    const scoreData = months.map(
      (month) => progressData.progressByMonth[month].averageScore || 0
    );
    const listeningData = months.map(
      (month) => progressData.progressByMonth[month].listeningAverage || 0
    );
    const readingData = months.map(
      (month) => progressData.progressByMonth[month].readingAverage || 0
    );

    Highcharts.chart(chartRef.current, {
      chart: {
        type: "line",
        backgroundColor: "transparent",
      },
      title: {
        text: "Tiến độ điểm số theo thời gian",
        style: {
          fontWeight: "600",
          fontSize: "16px",
        },
      },
      xAxis: {
        categories: months,
        crosshair: true,
      },
      yAxis: {
        min: 0,
        max: 990,
        title: {
          text: "Điểm số",
        },
      },
      tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat:
          '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
          '<td style="padding:0"><b>{point.y} điểm</b></td></tr>',
        footerFormat: "</table>",
        shared: true,
        useHTML: true,
      },
      plotOptions: {
        line: {
          marker: {
            enabled: true,
            radius: 4,
          },
        },
      },
      series: [
        {
          name: "Điểm trung bình",
          data: scoreData,
          color: "#3498db",
        },
        {
          name: "Listening",
          data: listeningData,
          color: "#9b59b6",
        },
        {
          name: "Reading",
          data: readingData,
          color: "#2ecc71",
        },
      ],
      credits: {
        enabled: false,
      },
    });
  };

  const renderSkillsChart = () => {
    Highcharts.chart(skillsChartRef.current, {
      chart: {
        type: "column",
        backgroundColor: "transparent",
      },
      title: {
        text: "Phân tích kỹ năng",
        style: {
          fontWeight: "600",
          fontSize: "16px",
        },
      },
      xAxis: {
        categories: ["Listening", "Reading", "Grammar", "Vocabulary"],
        crosshair: true,
      },
      yAxis: {
        min: 0,
        max: 100,
        title: {
          text: "Tỉ lệ chính xác (%)",
        },
      },
      tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat:
          '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
          '<td style="padding:0"><b>{point.y}%</b></td></tr>',
        footerFormat: "</table>",
        shared: true,
        useHTML: true,
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0,
        },
      },
      series: [
        {
          name: "Tỉ lệ chính xác",
          data: [
            progressData.skillBreakdown.listening || 0,
            progressData.skillBreakdown.reading || 0,
            progressData.skillBreakdown.grammar || 0,
            progressData.skillBreakdown.vocabulary || 0,
          ],
          colors: ["#3498db", "#2ecc71", "#9b59b6", "#f39c12"],
          colorByPoint: true,
        },
      ],
      credits: {
        enabled: false,
      },
    });
  };

  const getBadgeClass = (type) => {
    switch (type.toLowerCase()) {
      case "listening":
        return "badge-listening";
      case "reading":
        return "badge-reading";
      case "grammar":
        return "badge-grammar";
      case "vocabulary":
        return "badge-vocabulary";
      default:
        return "";
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  const getActivityIcon = (activity) => {
    switch (activity.type) {
      case "exam":
        return { icon: faListAlt, color: "#3498db" };
      case "lesson":
        return { icon: faGraduationCap, color: "#2ecc71" };
      case "grammar":
        return { icon: faLanguage, color: "#9b59b6" };
      case "vocabulary":
        return { icon: faBook, color: "#f39c12" };
      default:
        return { icon: faCheckCircle, color: "#7f8c8d" };
    }
  };

  if (loading) {
    return (
      <div className="progress-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="progress-title mb-4">
        <FontAwesomeIcon icon={faChartLine} className="me-2" />
        Tiến độ học tập của tôi
      </h2>

      {/* Overview Stats */}
      <div className="row mb-4" data-aos="fade-up">
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="progress-card bg-white">
            <div className="progress-stat">
              <div
                className="progress-stat-icon"
                style={{ backgroundColor: "#3498db" }}
              >
                <FontAwesomeIcon icon={faListAlt} />
              </div>
              <div>
                <div className="progress-stat-label">Tổng số bài thi</div>
                <div className="progress-stat-value">
                  {progressData.totalExams}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="progress-card bg-white">
            <div className="progress-stat">
              <div
                className="progress-stat-icon"
                style={{ backgroundColor: "#2ecc71" }}
              >
                <FontAwesomeIcon icon={faCheckCircle} />
              </div>
              <div>
                <div className="progress-stat-label">Điểm trung bình</div>
                <div className="progress-stat-value">
                  {progressData.averageScore}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="progress-card bg-white">
            <div className="progress-stat">
              <div
                className="progress-stat-icon"
                style={{ backgroundColor: "#9b59b6" }}
              >
                <FontAwesomeIcon icon={faClock} />
              </div>
              <div>
                <div className="progress-stat-label">Giờ học tập</div>
                <div className="progress-stat-value">
                  {progressData.studyHours}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="progress-card bg-white">
            <div className="progress-stat">
              <div
                className="progress-stat-icon"
                style={{ backgroundColor: "#f39c12" }}
              >
                <FontAwesomeIcon icon={faGraduationCap} />
              </div>
              <div>
                <div className="progress-stat-label">Bài học đã hoàn thành</div>
                <div className="progress-stat-value">
                  {progressData.completedLessons}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="row mb-4" data-aos="fade-up" data-aos-delay="100">
        <div className="col-lg-8 mb-4">
          <div className="progress-container">
            <h5 className="progress-title">Phân tích tiến độ</h5>
            <div className="chart-selector">
              <button
                className={chartType === "progress" ? "active" : ""}
                onClick={() => setChartType("progress")}
              >
                Tiến độ theo thời gian
              </button>
              <button
                className={chartType === "skills" ? "active" : ""}
                onClick={() => setChartType("skills")}
              >
                Phân tích kỹ năng
              </button>
            </div>
            {chartType === "progress" && (
              <div className="chart-container" ref={chartRef}></div>
            )}
            {chartType === "skills" && (
              <div className="chart-container" ref={skillsChartRef}></div>
            )}
          </div>
        </div>
        <div className="col-lg-4 mb-4">
          <div className="progress-container">
            <h5 className="progress-title">Điểm mạnh và điểm yếu</h5>

            <div className="mb-4">
              <h6 className="mb-2">
                <FontAwesomeIcon
                  icon={faChartLine}
                  className="me-2 text-success"
                />
                Điểm mạnh
              </h6>
              <div className="tag-cloud">
                {progressData.strengths.map((strength, index) => (
                  <span key={index} className="tag strength">
                    {strength}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h6 className="mb-2">
                <FontAwesomeIcon
                  icon={faChartLine}
                  className="me-2 text-danger"
                />
                Cần cải thiện
              </h6>
              <div className="tag-cloud">
                {progressData.weaknesses.map((weakness, index) => (
                  <span key={index} className="tag weakness">
                    {weakness}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exam History */}
      <div className="row mb-4" data-aos="fade-up" data-aos-delay="200">
        <div className="col-lg-8 mb-4">
          <div className="progress-container">
            <h5 className="progress-title">Lịch sử làm bài</h5>
            <div className="table-responsive">
              <table className="progress-table">
                <thead>
                  <tr>
                    <th>Bài thi</th>
                    <th>Ngày hoàn thành</th>
                    <th>Loại</th>
                    <th>Điểm</th>
                  </tr>
                </thead>
                <tbody>
                  {progressData.examHistory.map((exam, index) => (
                    <tr key={index}>
                      <td>{exam.examName}</td>
                      <td>{formatDate(exam.completedAt)}</td>
                      <td>
                        <span
                          className={`progress-badge ${getBadgeClass(
                            exam.type
                          )}`}
                        >
                          {exam.type}
                        </span>
                      </td>
                      <td>
                        <strong>{exam.score}</strong> /{" "}
                        {exam.totalPossibleScore}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="progress-container">
            <h5 className="progress-title">Hoạt động gần đây</h5>
            <div className="activity-list">
              {progressData.recentActivity.map((activity, index) => {
                const { icon, color } = getActivityIcon(activity);
                return (
                  <div className="activity-item" key={index}>
                    <div
                      className="activity-icon"
                      style={{ backgroundColor: color }}
                    >
                      <FontAwesomeIcon icon={icon} />
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">{activity.title}</div>
                      <div className="activity-meta">
                        {formatDate(activity.date)} • {activity.duration} phút
                      </div>
                    </div>
                    {activity.score !== undefined && (
                      <div className="activity-score">
                        {activity.score} điểm
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Learning Tips */}
      <div className="row" data-aos="fade-up" data-aos-delay="300">
        <div className="col-12">
          <div className="progress-container">
            <h5 className="progress-title">Gợi ý học tập</h5>
            <div className="row">
              <div className="col-md-6 mb-3">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <h6 className="card-title">
                      <FontAwesomeIcon
                        icon={faHeadphones}
                        className="me-2 text-primary"
                      />
                      Cải thiện Listening
                    </h6>
                    <p className="card-text">
                      Dựa trên kết quả gần đây, bạn nên tập trung vào phần
                      Listening Part 3 và 4. Hãy luyện tập nghe các đoạn hội
                      thoại và bài giảng dài với tốc độ nói nhanh.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <h6 className="card-title">
                      <FontAwesomeIcon
                        icon={faBook}
                        className="me-2 text-success"
                      />
                      Cải thiện Reading
                    </h6>
                    <p className="card-text">
                      Phần Reading của bạn đang tiến bộ tốt! Để đạt điểm cao
                      hơn, hãy luyện tập đọc nhanh với các bài đọc dài trong
                      Part 7 và cải thiện kỹ năng đọc lướt.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;
