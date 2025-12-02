import React, { useState, useEffect, useRef, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faHeadphones,
  faBook,
  faLanguage,
  faCheckCircle,
  faClock,
  faListAlt,
  faGraduationCap,
} from "@fortawesome/free-solid-svg-icons";
import { Card, Row, Col, Statistic, Table, Typography, Space, Button, Tag } from "antd";
import { TrendingUp, Clock, BookOpen, Award, Target, CheckCircle } from "lucide-react";
import Highcharts from "highcharts";
import AOS from "aos";
import "aos/dist/aos.css";
import "./style.css";

// Import services
import learningProgressService from "../../../services/learningProgressService";

const { Title, Text } = Typography;

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
    // Đặt tiêu đề cho tab trình duyệt
    document.title = "Tiến Độ Học Tập | TOEIC Learning Platform";
    
    // Initialize AOS animation library
    AOS.init({
      duration: 800,
      easing: "ease-in-out",
    });

    // Fetch progress data
    const fetchProgressData = async () => {
      try {
        setLoading(true);

        // Sử dụng learning progress service mới
        const [
          overviewResponse,
          skillsResponse,
          timeProgressResponse,
          strengthsWeaknessesResponse,
          dashboardResponse,
        ] = await Promise.all([
          learningProgressService.getOverview().catch((error) => {
            console.log('Overview API not available:', error.message);
            return { data: { 
              totalExams: 7, 
              averageScore: 720, 
              totalStudyTime: 45, 
              completedLessons: 23 
            }};
          }),
          learningProgressService.getSkillProgress().catch((error) => {
            console.log('Skills API not available:', error.message);
            return { data: { 
              listening: 75, 
              reading: 82, 
              grammar: 78, 
              vocabulary: 88,
              comparison: [
                { month: "Jan", listening: 65, reading: 70 },
                { month: "Feb", listening: 68, reading: 73 },
                { month: "Mar", listening: 72, reading: 76 },
                { month: "Apr", listening: 75, reading: 80 },
                { month: "May", listening: 73, reading: 82 },
                { month: "Jun", listening: 75, reading: 82 }
              ]
            }};
          }),
          learningProgressService.getTimeProgress().catch((error) => {
            console.log('Time Progress API not available:', error.message);
            return { data: {
              progressByMonth: {
                "Jan 2025": { averageScore: 600, listeningAverage: 300, readingAverage: 300 },
                "Feb 2025": { averageScore: 640, listeningAverage: 320, readingAverage: 320 },
                "Mar 2025": { averageScore: 670, listeningAverage: 335, readingAverage: 335 },
                "Apr 2025": { averageScore: 690, listeningAverage: 345, readingAverage: 345 },
                "May 2025": { averageScore: 710, listeningAverage: 355, readingAverage: 355 },
                "Jun 2025": { averageScore: 720, listeningAverage: 360, readingAverage: 360 }
              },
              studyTimeData: [
                { date: "2025-06-01", studyTime: 60 },
                { date: "2025-06-02", studyTime: 45 },
                { date: "2025-06-03", studyTime: 90 },
                { date: "2025-06-04", studyTime: 30 },
                { date: "2025-06-05", studyTime: 75 }
              ]
            }};
          }),
          learningProgressService.getStrengthsWeaknesses().catch((error) => {
            console.log('Strengths/Weaknesses API not available:', error.message);
            return { data: {
              strengths: ["Grammar", "Vocabulary", "Reading Part 5"],
              weaknesses: ["Listening Part 3", "Reading Part 7", "Time Management"],
              skillsRadar: [
                { skill: "Listening", score: 75 },
                { skill: "Reading", score: 82 },
                { skill: "Grammar", score: 78 },
                { skill: "Vocabulary", score: 88 }
              ]
            }};
          }),
          learningProgressService.getDashboard().catch((error) => {
            console.log('Dashboard API not available:', error.message);
            return { data: {
              goalProgress: {
                currentScore: 720,
                targetScore: 850,
                progressPercentage: 85,
                isAchieved: false,
                highestScore: 720
              },
              recentActivity: [
                {
                  examName: "TOEIC Practice Test 1",
                  score: 720,
                  date: "2025-06-28T10:00:00Z",
                  type: "Mixed"
                },
                {
                  examName: "Listening Skills Test",
                  score: 380,
                  date: "2025-06-26T15:30:00Z",
                  type: "Listening"
                },
                {
                  examName: "Reading Comprehension",
                  score: 340,
                  date: "2025-06-24T09:00:00Z",
                  type: "Reading"
                }
              ],
              currentStreak: 5,
              studyTimeThisWeek: 12
            }};
          }),
        ]);
        
        // Xử lý và kết hợp dữ liệu từ API responses (cập nhật cho response format mới)
        const overviewData = overviewResponse?.data || {};
        const skillsData = skillsResponse?.data || {};
        const timeProgressData = timeProgressResponse?.data || {};
        const strengthsData = strengthsWeaknessesResponse?.data || {};
        const dashboardData = dashboardResponse?.data || {};

        // Tạo dữ liệu progress hoàn chỉnh
        const userData = {
          totalExams: overviewData.totalExams || 0,
          averageScore: overviewData.averageScore || 0,
          listeningAverage: overviewData.listeningAverage || Math.round((overviewData.averageScore || 0) / 2),
          readingAverage: overviewData.readingAverage || Math.round((overviewData.averageScore || 0) / 2),
          studyHours: overviewData.studyHours || overviewData.totalStudyTime || 0,
          completedLessons: overviewData.completedLessons || 0,
          strengths: strengthsData.strengths || ["Grammar", "Vocabulary"],
          weaknesses: strengthsData.weaknesses || ["Listening Part 3", "Reading Part 7"],
          recentActivity: (dashboardData.recentActivity || []).map(activity => ({
            type: "exam",
            title: activity.examName || activity.title || "Bài thi TOEIC",
            date: activity.date || activity.createdAt || new Date().toISOString(),
            duration: activity.duration || 120,
            score: activity.score || activity.totalScore || 0
          })),
          examHistory: dashboardData.examHistory || dashboardData.recentActivity || [],
          progressByMonth: timeProgressData.progressByMonth || timeProgressData.monthlyProgress || {
            "Jan 2025": { averageScore: 600, listeningAverage: 300, readingAverage: 300 },
            "Feb 2025": { averageScore: 640, listeningAverage: 320, readingAverage: 320 },
            "Mar 2025": { averageScore: 670, listeningAverage: 335, readingAverage: 335 },
            "Apr 2025": { averageScore: 690, listeningAverage: 345, readingAverage: 345 },
            "May 2025": { averageScore: 710, listeningAverage: 355, readingAverage: 355 },
            "Jun 2025": { averageScore: 720, listeningAverage: 360, readingAverage: 360 }
          },
          skillBreakdown: {
            listening: skillsData.listening || skillsData.listeningScore || 75,
            reading: skillsData.reading || skillsData.readingScore || 82,
            grammar: skillsData.grammar || skillsData.grammarScore || 78,
            vocabulary: skillsData.vocabulary || skillsData.vocabularyScore || 88,
          },
          // Thêm dữ liệu mở rộng từ dashboard
          goalProgress: dashboardData.goalProgress || {
            currentScore: overviewData.averageScore || 0,
            targetScore: 850,
            progressPercentage: Math.min(Math.round(((overviewData.averageScore || 0) / 850) * 100), 100),
            isAchieved: (overviewData.averageScore || 0) >= 850,
            highestScore: overviewData.averageScore || 0
          },
          currentStreak: dashboardData.currentStreak || 0,
          studyTimeThisWeek: dashboardData.studyTimeThisWeek || overviewData.studyTimeThisWeek || 0,
          skillsComparison: skillsData.comparison || skillsData.monthlyComparison || [],
          studyTimeData: timeProgressData.studyTimeData || timeProgressData.dailyStudyTime || [],
          skillsRadar: strengthsData.skillsRadar || strengthsData.radarData || []
        };

        setProgressData(userData);
      } catch (error) {
        console.error("Error fetching progress data:", error);
        
        // Fallback data nếu có lỗi
        setProgressData({
          totalExams: 7,
          averageScore: 720,
          listeningAverage: 360,
          readingAverage: 360,
          studyHours: 45,
          completedLessons: 23,
          strengths: ["Grammar", "Vocabulary"],
          weaknesses: ["Listening Part 3", "Reading Part 7", "Time Management"],
          recentActivity: [
            {
              type: "exam",
              title: "TOEIC Practice Test 1",
              date: "2025-06-28T10:00:00Z",
              duration: 120,
              score: 720
            }
          ],
          examHistory: [
            {
              examName: "TOEIC Practice Test 1",
              completedAt: "2025-06-28T10:00:00Z",
              score: 720,
              type: "Mixed",
              maxScore: 990
            }
          ],
          progressByMonth: {
            "Jan 2025": { averageScore: 600, listeningAverage: 300, readingAverage: 300 },
            "Feb 2025": { averageScore: 640, listeningAverage: 320, readingAverage: 320 },
            "Mar 2025": { averageScore: 670, listeningAverage: 335, readingAverage: 335 },
            "Apr 2025": { averageScore: 690, listeningAverage: 345, readingAverage: 345 },
            "May 2025": { averageScore: 710, listeningAverage: 355, readingAverage: 355 },
            "Jun 2025": { averageScore: 720, listeningAverage: 360, readingAverage: 360 }
          },
          skillBreakdown: {
            listening: 75,
            reading: 82,
            grammar: 78,
            vocabulary: 88,
          },
          goalProgress: {
            currentScore: 720,
            targetScore: 850,
            progressPercentage: 85,
            isAchieved: false,
            highestScore: 720
          },
          currentStreak: 5,
          studyTimeThisWeek: 12,
          skillsComparison: [
            { month: "Jan", listening: 65, reading: 70 },
            { month: "Feb", listening: 68, reading: 73 },
            { month: "Mar", listening: 72, reading: 76 },
            { month: "Apr", listening: 75, reading: 80 },
            { month: "May", listening: 73, reading: 82 },
            { month: "Jun", listening: 75, reading: 82 }
          ],
          studyTimeData: [
            { date: "2025-06-01", studyTime: 60 },
            { date: "2025-06-02", studyTime: 45 },
            { date: "2025-06-03", studyTime: 90 },
            { date: "2025-06-04", studyTime: 30 },
            { date: "2025-06-05", studyTime: 75 }
          ],
          skillsRadar: [
            { skill: "Listening", score: 75 },
            { skill: "Reading", score: 82 },
            { skill: "Grammar", score: 78 },
            { skill: "Vocabulary", score: 88 }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, []);
       

    


  const renderProgressChart = useCallback(() => {
    if (!chartRef.current || chartType !== "progress") return;
    
    // Clear any existing chart
    if (chartRef.current.innerHTML) {
      chartRef.current.innerHTML = '';
    }
    
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
        height: 400,
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
  }, [progressData.progressByMonth, chartType]);

  const renderSkillsChart = useCallback(() => {
    if (!skillsChartRef.current || chartType !== "skills") return;
    
    // Clear any existing chart
    if (skillsChartRef.current.innerHTML) {
      skillsChartRef.current.innerHTML = '';
    }
    
    Highcharts.chart(skillsChartRef.current, {
      chart: {
        type: "column",
        backgroundColor: "transparent",
        height: 400,
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
  }, [progressData.skillBreakdown, chartType]);

  useEffect(() => {
    // Render progress chart when data is available and chart type is progress
    if (!loading && chartType === "progress" && progressData.progressByMonth && Object.keys(progressData.progressByMonth).length > 0) {
      // Small delay to ensure DOM element is ready
      setTimeout(() => {
        renderProgressChart();
      }, 100);
    }
  }, [loading, progressData.progressByMonth, renderProgressChart, chartType]);

  useEffect(() => {
    // Render skills chart when data is available and chart type is skills
    if (!loading && chartType === "skills" && progressData.skillBreakdown) {
      // Small delay to ensure DOM element is ready
      setTimeout(() => {
        renderSkillsChart();
      }, 100);
    }
  }, [loading, progressData.skillBreakdown, renderSkillsChart, chartType]);

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
      <div className="progress-loading" style={{ minHeight: "50vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  // Định nghĩa columns cho bảng lịch sử thi
  const examHistoryColumns = [
    {
      title: "Bài thi",
      dataIndex: "examName",
      key: "examName",
      width: 250,
      render: (text, record) => (
        <Text strong style={{ color: "var(--color-primary)" }}>
          {text || record.name || `Bài thi ${record.id || "Unknown"}`}
        </Text>
      ),
    },
    {
      title: "Ngày hoàn thành",
      dataIndex: "completedAt",
      key: "completedAt",
      width: 150,
      render: (date) => formatDate(date),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (type) => (
        <Tag color={
          type === "Listening" ? "blue" : 
          type === "Reading" ? "green" : 
          type === "Grammar" ? "purple" : 
          type === "Vocabulary" ? "orange" : "default"
        }>
          {type || "Mixed"}
        </Tag>
      ),
    },
    {
      title: "Điểm số",
      key: "score",
      width: 120,
      render: (_, record) => (
        <Space>
          <Text strong style={{ color: "var(--color-success)", fontSize: "16px" }}>
            {record.score || 0}
          </Text>
          <Text type="secondary">
            / {record.totalPossibleScore || record.maxScore || 990}
          </Text>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", background: "var(--color-bg-tertiary)", minHeight: "100vh" }}>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <Title
          level={2}
          style={{
            marginBottom: "8px",
            background: "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          <TrendingUp
            size={28}
            style={{ marginRight: "12px", color: "var(--color-primary)" }}
          />
          Tiến độ học tập của tôi
        </Title>
        <Text type="secondary" style={{ fontSize: "16px" }}>
          Theo dõi tiến độ học tập và phân tích kết quả • Cải thiện điểm số TOEIC của bạn
        </Text>
      </div>

      {/* Goal Progress Section */}
      {progressData.goalProgress && (
        <Row gutter={16} style={{ marginBottom: "24px" }}>
          <Col span={24}>
            <Card
              style={{
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                border: "none",
                background: "#2C5F8D",
              }}
            >
              <div style={{ color: "white" }}>
                <Title level={4} style={{ color: "white", marginBottom: "16px" }}>
                  <Target size={20} style={{ marginRight: "8px" }} />
                  Tiến độ mục tiêu
                </Title>
                <Row gutter={16} align="middle">
                  <Col xs={24} md={12}>
                    <Text style={{ color: "white", fontSize: "16px" }}>
                      Mục tiêu: <strong>{progressData.goalProgress.targetScore} điểm</strong>
                    </Text>
                    <br />
                    <Text style={{ color: "white", fontSize: "16px" }}>
                      Điểm cao nhất: <strong>{progressData.goalProgress.highestScore} điểm</strong>
                    </Text>
                    <div style={{ marginTop: "12px" }}>
                      <div
                        style={{
                          background: "rgba(255,255,255,0.3)",
                          borderRadius: "10px",
                          height: "20px",
                          position: "relative",
                          overflow: "hidden"
                        }}
                      >
                        <div
                          style={{
                            background: "linear-gradient(90deg, #4ade80, #22c55e)",
                            height: "100%",
                            width: `${progressData.goalProgress.progressPercentage}%`,
                            borderRadius: "10px",
                            transition: "width 1s ease-in-out"
                          }}
                        />
                      </div>
                      <Text style={{ color: "white", fontSize: "12px", marginTop: "4px" }}>
                        {progressData.goalProgress.progressPercentage}% hoàn thành
                      </Text>
                    </div>
                  </Col>
                  <Col xs={24} md={12} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "48px", color: "white", marginBottom: "8px" }}>
                      {progressData.goalProgress.isAchieved ? "🎉" : "🎯"}
                    </div>
                    <Text style={{ color: "white", fontSize: "16px" }}>
                      {progressData.goalProgress.isAchieved 
                        ? "Mục tiêu đã đạt được!" 
                        : `Còn ${progressData.goalProgress.targetScore - progressData.goalProgress.highestScore} điểm để đạt mục tiêu`
                      }
                    </Text>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* Study Streak Section */}
      {(progressData.currentStreak > 0 || progressData.studyTimeThisWeek > 0) && (
        <Row gutter={16} style={{ marginBottom: "24px" }}>
          <Col xs={24} md={12}>
            <Card style={{ borderRadius: "12px", border: "1px solid #ffd6e7" }}>
              <Statistic
                title="Chuỗi học tập hiện tại"
                value={progressData.currentStreak}
                suffix="ngày"
                prefix={<FontAwesomeIcon icon={faCheckCircle} style={{ color: "var(--color-danger)" }} />}
                valueStyle={{ color: "var(--color-danger)", fontSize: "32px" }}
              />
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Tiếp tục duy trì để đạt kỷ lục mới! 🔥
              </Text>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card style={{ borderRadius: "12px", border: "1px solid #e6f7ff" }}>
              <Statistic
                title="Thời gian học tuần này"
                value={progressData.studyTimeThisWeek}
                suffix="giờ"
                prefix={<Clock size={20} style={{ color: "var(--color-primary)" }} />}
                valueStyle={{ color: "var(--color-primary)", fontSize: "32px" }}
              />
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Tuyệt vời! Hãy duy trì nhịp độ này 📚
              </Text>
            </Card>
          </Col>
        </Row>
      )}

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: "12px", border: "1px solid #d6e4ff" }}>
            <Statistic
              title="Tổng số bài thi"
              value={progressData.totalExams}
              prefix={<BookOpen size={20} style={{ color: "var(--color-primary)" }} />}
              valueStyle={{ color: "var(--color-primary)" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: "12px", border: "1px solid #d9f7be" }}>
            <Statistic
              title="Điểm trung bình"
              value={progressData.averageScore}
              prefix={<CheckCircle size={20} style={{ color: "var(--color-success)" }} />}
              valueStyle={{ color: "var(--color-success)" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: "12px", border: "1px solid #fff7e6" }}>
            <Statistic
              title="Giờ học tập"
              value={progressData.studyHours}
              prefix={<Clock size={20} style={{ color: "var(--color-chart-6)" }} />}
              valueStyle={{ color: "var(--color-chart-6)" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: "12px", border: "1px solid #fff0f6" }}>
            <Statistic
              title="Bài học hoàn thành"
              value={progressData.completedLessons}
              prefix={<Award size={20} style={{ color: "var(--color-chart-5)" }} />}
              valueStyle={{ color: "var(--color-chart-5)" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col xs={24} lg={16}>
          <Card
            style={{
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              border: "none",
            }}
          >
            <Title level={4} style={{ marginBottom: "16px" }}>
              Phân tích tiến độ
            </Title>
            <div className="chart-selector" style={{ marginBottom: "20px" }}>
              <Button
                type={chartType === "progress" ? "primary" : "default"}
                onClick={() => setChartType("progress")}
                style={{ marginRight: "8px" }}
              >
                Tiến độ theo thời gian
              </Button>
              <Button
                type={chartType === "skills" ? "primary" : "default"}
                onClick={() => setChartType("skills")}
                style={{ marginRight: "8px" }}
              >
                Phân tích kỹ năng
              </Button>
              <Button
                type={chartType === "comparison" ? "primary" : "default"}
                onClick={() => setChartType("comparison")}
              >
                So sánh Listening vs Reading
              </Button>
            </div>
            <div className="chart-wrapper" style={{ minHeight: "400px", position: "relative" }}>
              {chartType === "progress" && (
                <div className="chart-container" ref={chartRef} style={{ width: "100%", height: "400px" }}></div>
              )}
              {chartType === "skills" && (
                <div className="chart-container" ref={skillsChartRef} style={{ width: "100%", height: "400px" }}></div>
              )}
              {chartType === "comparison" && progressData.skillsComparison && progressData.skillsComparison.length > 0 && (
                <div style={{ width: "100%", height: "400px", padding: "20px", overflow: "hidden" }}>
                  <Title level={5} style={{ textAlign: "center", marginBottom: "20px" }}>
                    So sánh điểm số Listening vs Reading theo tháng
                  </Title>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "center", 
                    alignItems: "end", 
                    flexWrap: "wrap",
                    gap: "12px",
                    maxWidth: "100%",
                    padding: "0 10px",
                    height: "280px",
                    overflowX: "auto"
                  }}>
                    {progressData.skillsComparison.map((item, index) => (
                      <div key={index} style={{ 
                        textAlign: "center", 
                        minWidth: "80px",
                        flex: "0 0 auto"
                      }}>
                        <Text strong style={{ 
                          display: "block", 
                          marginBottom: "8px",
                          fontSize: "12px"
                        }}>
                          {item.month}
                        </Text>
                        <div style={{ 
                          display: "flex", 
                          gap: "4px", 
                          alignItems: "end",
                          justifyContent: "center",
                          height: "200px"
                        }}>
                          <div style={{ textAlign: "center" }}>
                            <div
                              style={{
                                width: "32px",
                                height: `${Math.min(item.listening * 2, 180)}px`,
                                backgroundColor: "var(--color-success)",
                                borderRadius: "4px 4px 0 0",
                                marginBottom: "4px",
                                minHeight: "20px",
                                transition: "height 0.5s ease-in-out"
                              }}
                            />
                            <Text style={{ 
                              fontSize: "10px", 
                              color: "var(--color-success)",
                              display: "block",
                              fontWeight: "600"
                            }}>
                              L: {item.listening}
                            </Text>
                          </div>
                          <div style={{ textAlign: "center" }}>
                            <div
                              style={{
                                width: "32px",
                                height: `${Math.min(item.reading * 2, 180)}px`,
                                backgroundColor: "var(--color-primary)",
                                borderRadius: "4px 4px 0 0",
                                marginBottom: "4px",
                                minHeight: "20px",
                                transition: "height 0.5s ease-in-out"
                              }}
                            />
                            <Text style={{ 
                              fontSize: "10px", 
                              color: "var(--color-primary)",
                              display: "block",
                              fontWeight: "600"
                            }}>
                              R: {item.reading}
                            </Text>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ 
                    textAlign: "center", 
                    marginTop: "20px",
                    paddingTop: "16px",
                    borderTop: "1px solid #f0f0f0"
                  }}>
                    <Space size="large">
                      <span style={{ 
                        color: "var(--color-success)", 
                        fontSize: "12px",
                        fontWeight: "600"
                      }}>
                        ● Listening
                      </span>
                      <span style={{ 
                        color: "var(--color-primary)", 
                        fontSize: "12px",
                        fontWeight: "600"
                      }}>
                        ● Reading
                      </span>
                    </Space>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            style={{
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              border: "none",
            }}
          >
            <Title level={4} style={{ marginBottom: "16px" }}>
              Điểm mạnh và điểm yếu
            </Title>

            <div style={{ marginBottom: "20px" }}>
              <Text strong style={{ color: "var(--color-success)", fontSize: "16px" }}>
                <Target size={16} style={{ marginRight: "8px" }} />
                Điểm mạnh
              </Text>
              <div className="tag-cloud" style={{ marginTop: "8px" }}>
                {progressData.strengths.map((strength, index) => (
                  <Tag key={index} color="success" style={{ marginBottom: "8px" }}>
                    {strength}
                  </Tag>
                ))}
              </div>
            </div>

            <div>
              <Text strong style={{ color: "var(--color-danger)", fontSize: "16px" }}>
                <Target size={16} style={{ marginRight: "8px" }} />
                Cần cải thiện
              </Text>
              <div className="tag-cloud" style={{ marginTop: "8px" }}>
                {progressData.weaknesses.map((weakness, index) => (
                  <Tag key={index} color="error" style={{ marginBottom: "8px" }}>
                    {weakness}
                  </Tag>
                ))}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Skills Radar Chart */}
      {progressData.skillsRadar && progressData.skillsRadar.length > 0 && (
        <Row gutter={16} style={{ marginBottom: "24px" }}>
          <Col span={24}>
            <Card
              style={{
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                border: "none",
              }}
            >
              <Title level={4} style={{ marginBottom: "16px" }}>
                Biểu đồ radar kỹ năng
              </Title>
              <div style={{ textAlign: "center", padding: "20px" }}>
                <div style={{ position: "relative", display: "inline-block" }}>
                  {/* Simple radar chart using CSS */}
                  <div style={{ 
                    width: "300px", 
                    height: "300px", 
                    position: "relative",
                    border: "2px solid #e8e8e8",
                    borderRadius: "50%",
                    margin: "0 auto"
                  }}>
                    {/* Inner circles */}
                    <div style={{
                      position: "absolute",
                      top: "25%",
                      left: "25%",
                      width: "50%",
                      height: "50%",
                      border: "1px solid #f0f0f0",
                      borderRadius: "50%"
                    }} />
                    <div style={{
                      position: "absolute",
                      top: "12.5%",
                      left: "12.5%",
                      width: "75%",
                      height: "75%",
                      border: "1px solid #f5f5f5",
                      borderRadius: "50%"
                    }} />
                    
                    {/* Skill points */}
                    {progressData.skillsRadar.map((skill, index) => {
                      const angle = (index * 90) - 90; // 4 skills, 90 degrees apart, starting from top
                      const radius = (skill.score / 100) * 120; // Scale to fit within circle
                      const x = 150 + radius * Math.cos(angle * Math.PI / 180);
                      const y = 150 + radius * Math.sin(angle * Math.PI / 180);
                      
                      return (
                        <div key={skill.skill}>
                          {/* Skill point */}
                          <div style={{
                            position: "absolute",
                            left: `${x - 8}px`,
                            top: `${y - 8}px`,
                            width: "16px",
                            height: "16px",
                            backgroundColor: index === 0 ? "var(--color-success)" : index === 1 ? "var(--color-primary)" : index === 2 ? "var(--color-chart-6)" : "var(--color-chart-5)",
                            borderRadius: "50%",
                            border: "2px solid white",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                          }} />
                          
                          {/* Skill label */}
                          <div style={{
                            position: "absolute",
                            left: `${x + (x > 150 ? 20 : -80)}px`,
                            top: `${y - 10}px`,
                            fontSize: "12px",
                            fontWeight: "600",
                            color: "var(--color-text-secondary)"
                          }}>
                            {skill.skill}: {skill.score}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Legend */}
                <div style={{ marginTop: "20px" }}>
                  <Space wrap>
                    <span style={{ color: "var(--color-success)" }}>● Listening</span>
                    <span style={{ color: "var(--color-primary)" }}>● Reading</span>
                    <span style={{ color: "var(--color-chart-6)" }}>● Grammar</span>
                    <span style={{ color: "var(--color-chart-5)" }}>● Vocabulary</span>
                  </Space>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* Exam History and Recent Activity */}
      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col xs={24} lg={16}>
          <Card
            style={{
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              border: "none",
            }}
          >
            <Title level={4} style={{ marginBottom: "16px" }}>
              Lịch sử làm bài
            </Title>
            <Table
              columns={examHistoryColumns}
              dataSource={progressData.examHistory}
              pagination={{
                pageSize: 5,
                showSizeChanger: false,
                showQuickJumper: false,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} bài thi`,
              }}
              scroll={{ x: 600 }}
              size="middle"
              locale={{
                emptyText: "Chưa có lịch sử làm bài"
              }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            style={{
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              border: "none",
            }}
          >
            <Title level={4} style={{ marginBottom: "16px" }}>
              Hoạt động gần đây
            </Title>
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              {progressData.recentActivity.length > 0 ? (
                progressData.recentActivity.map((activity, index) => {
                  const { icon, color } = getActivityIcon(activity);
                  return (
                    <div key={index} style={{ 
                      padding: "12px 0", 
                      borderBottom: index < progressData.recentActivity.length - 1 ? "1px solid #f0f0f0" : "none",
                      display: "flex",
                      alignItems: "center"
                    }}>
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          backgroundColor: color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: "12px",
                          color: "white"
                        }}
                      >
                        <FontAwesomeIcon icon={icon} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <Text strong style={{ display: "block", color: "#262626" }}>
                          {activity.title}
                        </Text>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          {formatDate(activity.date)} • {activity.duration} phút
                        </Text>
                      </div>
                      {activity.score !== undefined && (
                        <Tag color="blue" style={{ margin: 0 }}>
                          {activity.score} điểm
                        </Tag>
                      )}
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <Text type="secondary">Chưa có hoạt động gần đây</Text>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Study Time Analysis */}
      {progressData.studyTimeData && progressData.studyTimeData.length > 0 && (
        <Row gutter={16} style={{ marginBottom: "24px" }}>
          <Col span={24}>
            <Card
              style={{
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                border: "none",
              }}
            >
              <Title level={4} style={{ marginBottom: "16px" }}>
                Thời gian học tập gần đây
              </Title>
              <div style={{ padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: "20px" }}>
                  {progressData.studyTimeData.map((item, index) => (
                    <div key={index} style={{ textAlign: "center", flex: 1 }}>
                      <div
                        style={{
                          height: `${item.studyTime * 2}px`,
                          backgroundColor: index % 2 === 0 ? "var(--color-primary)" : "var(--color-success)",
                          borderRadius: "4px 4px 0 0",
                          marginBottom: "8px",
                          minHeight: "10px",
                          margin: "0 auto 8px",
                          width: "40px",
                          transition: "height 0.5s ease-in-out"
                        }}
                      />
                      <Text style={{ fontSize: "12px", display: "block" }}>
                        {new Date(item.date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })}
                      </Text>
                      <Text style={{ fontSize: "12px", color: "var(--color-text-secondary)", display: "block" }}>
                        {item.studyTime}p
                      </Text>
                    </div>
                  ))}
                </div>
                <div style={{ textAlign: "center" }}>
                  <Text type="secondary">Thời gian học tập hàng ngày (phút)</Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* Learning Tips */}
      <Row gutter={16}>
        <Col span={24}>
          <Card
            style={{
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              border: "none",
            }}
          >
            <Title level={4} style={{ marginBottom: "16px" }}>
              Gợi ý học tập
            </Title>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Card
                  style={{
                    border: "1px solid #d6e4ff",
                    borderRadius: "8px",
                    marginBottom: "16px",
                  }}
                  bodyStyle={{ padding: "16px" }}
                >
                  <Title level={5} style={{ color: "var(--color-primary)", marginBottom: "8px" }}>
                    <FontAwesomeIcon
                      icon={faHeadphones}
                      style={{ marginRight: "8px" }}
                    />
                    Cải thiện Listening
                  </Title>
                  <Text style={{ fontSize: "12px", lineHeight: "1.6" }}>
                    Dựa trên kết quả gần đây, bạn nên tập trung vào phần
                    Listening Part 3 và 4. Hãy luyện tập nghe các đoạn hội
                    thoại và bài giảng dài với tốc độ nói nhanh.
                  </Text>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card
                  style={{
                    border: "1px solid #d9f7be",
                    borderRadius: "8px",
                    marginBottom: "16px",
                  }}
                  bodyStyle={{ padding: "16px" }}
                >
                  <Title level={5} style={{ color: "var(--color-success)", marginBottom: "8px" }}>
                    <FontAwesomeIcon
                      icon={faBook}
                      style={{ marginRight: "8px" }}
                    />
                    Cải thiện Reading
                  </Title>
                  <Text style={{ fontSize: "12px", lineHeight: "1.6" }}>
                    Phần Reading của bạn đang tiến bộ tốt! Để đạt điểm cao
                    hơn, hãy luyện tập đọc nhanh với các bài đọc dài trong
                    Part 7 và cải thiện kỹ năng đọc lướt.
                  </Text>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// Export utility functions for recording progress
export const recordVocabularyProgress = async (vocabularyId, isCorrect, timeSpent = 0) => {
  try {
    const progressData = {
      vocabularyId,
      isCorrect,
      timeSpent,
      timestamp: new Date().toISOString()
    };
    
    const response = await learningProgressService.recordVocabularyAnswer(progressData);
    console.log('Vocabulary progress recorded:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to record vocabulary progress:', error);
    return null;
  }
};

export const recordGrammarProgress = async (grammarId, isCorrect, timeSpent = 0) => {
  try {
    const progressData = {
      grammarId,
      isCorrect,
      timeSpent,
      timestamp: new Date().toISOString()
    };
    
    const response = await learningProgressService.recordGrammarAnswer(progressData);
    console.log('Grammar progress recorded:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to record grammar progress:', error);
    return null;
  }
};

// Export the main component
export default Progress;
