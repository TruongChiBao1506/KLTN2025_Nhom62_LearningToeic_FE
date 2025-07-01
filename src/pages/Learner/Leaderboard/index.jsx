import React, { useState, useEffect } from "react";
import "./style.css";

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [activeTab, setActiveTab] = useState("overall");
  const [timeFilter, setTimeFilter] = useState("all");
  const [userRank, setUserRank] = useState(null);
  const [userStats, setUserStats] = useState({});

  // Mock data for leaderboard
  useEffect(() => {
    const mockData = [
      {
        id: 1,
        name: "Nguyễn Văn An",
        avatar: "https://via.placeholder.com/50x50/667eea/white?text=NA",
        score: 2850,
        level: "Expert",
        streak: 45,
        badges: ["🏆", "⭐", "🔥"],
        weeklyScore: 420,
        monthlyScore: 1650,
      },
      {
        id: 2,
        name: "Trần Thị Bình",
        avatar: "https://via.placeholder.com/50x50/764ba2/white?text=TB",
        score: 2720,
        level: "Advanced",
        streak: 32,
        badges: ["⭐", "🔥"],
        weeklyScore: 380,
        monthlyScore: 1580,
      },
      {
        id: 3,
        name: "Lê Hoàng Cường",
        avatar: "https://via.placeholder.com/50x50/4CAF50/white?text=LC",
        score: 2650,
        level: "Advanced",
        streak: 28,
        badges: ["🔥", "📚"],
        weeklyScore: 350,
        monthlyScore: 1520,
      },
      {
        id: 4,
        name: "Phạm Thị Dung",
        avatar: "https://via.placeholder.com/50x50/FF9800/white?text=PD",
        score: 2580,
        level: "Intermediate",
        streak: 21,
        badges: ["📚"],
        weeklyScore: 320,
        monthlyScore: 1480,
      },
      {
        id: 5,
        name: "Võ Minh Hưng",
        avatar: "https://via.placeholder.com/50x50/9C27B0/white?text=VH",
        score: 2420,
        level: "Intermediate",
        streak: 15,
        badges: ["🎯"],
        weeklyScore: 290,
        monthlyScore: 1350,
      },
    ];

    setLeaderboardData(mockData);

    // Set current user rank and stats
    setUserRank({
      rank: 12,
      score: 1850,
      level: "Intermediate",
      streak: 8,
    });

    setUserStats({
      totalStudyTime: 156,
      completedLessons: 89,
      averageScore: 82,
      improvement: "+15%",
    });
  }, []);

  const getFilteredData = () => {
    let data = [...leaderboardData];

    if (timeFilter === "week") {
      data = data.sort((a, b) => b.weeklyScore - a.weeklyScore);
    } else if (timeFilter === "month") {
      data = data.sort((a, b) => b.monthlyScore - a.monthlyScore);
    } else {
      data = data.sort((a, b) => b.score - a.score);
    }

    return data;
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const getLevelColor = (level) => {
    const colors = {
      Beginner: "#4CAF50",
      Intermediate: "#FF9800",
      Advanced: "#9C27B0",
      Expert: "#F44336",
    };
    return colors[level] || "#666";
  };

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h1>🏆 Bảng xếp hạng</h1>
        <p>Cạnh tranh với các học viên khác và leo lên top!</p>
      </div>

      <div className="leaderboard-content">
        <div className="leaderboard-main">
          <div className="leaderboard-filters">
            <div className="tab-filters">
              <button
                className={`tab-btn ${activeTab === "overall" ? "active" : ""}`}
                onClick={() => setActiveTab("overall")}
              >
                🏆 Tổng điểm
              </button>
              <button
                className={`tab-btn ${activeTab === "streak" ? "active" : ""}`}
                onClick={() => setActiveTab("streak")}
              >
                🔥 Streak
              </button>
            </div>

            <div className="time-filters">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
              >
                <option value="all">Tất cả thời gian</option>
                <option value="month">Tháng này</option>
                <option value="week">Tuần này</option>
              </select>
            </div>
          </div>

          <div className="leaderboard-list">
            {getFilteredData().map((user, index) => (
              <div key={user.id} className="leaderboard-item">
                <div className="rank">{getRankIcon(index + 1)}</div>

                <div className="user-info">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="user-avatar"
                  />
                  <div className="user-details">
                    <h4>{user.name}</h4>
                    <span
                      className="user-level"
                      style={{ backgroundColor: getLevelColor(user.level) }}
                    >
                      {user.level}
                    </span>
                  </div>
                </div>

                <div className="user-stats">
                  <div className="stat">
                    <span className="stat-value">
                      {timeFilter === "week"
                        ? user.weeklyScore
                        : timeFilter === "month"
                        ? user.monthlyScore
                        : user.score}
                    </span>
                    <span className="stat-label">điểm</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{user.streak}</span>
                    <span className="stat-label">streak</span>
                  </div>
                </div>

                <div className="user-badges">
                  {user.badges.map((badge, idx) => (
                    <span key={idx} className="badge">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="leaderboard-sidebar">
          <div className="user-rank-card">
            <h3>🎯 Vị trí của bạn</h3>
            <div className="current-rank">
              <div className="rank-number">#{userRank?.rank}</div>
              <div className="rank-info">
                <div className="rank-score">{userRank?.score} điểm</div>
                <div className="rank-level">{userRank?.level}</div>
                <div className="rank-streak">🔥 {userRank?.streak} ngày</div>
              </div>
            </div>
          </div>

          <div className="stats-card">
            <h3>📊 Thống kê</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">{userStats.totalStudyTime}</span>
                <span className="stat-label">Giờ học</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {userStats.completedLessons}
                </span>
                <span className="stat-label">Bài hoàn thành</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{userStats.averageScore}%</span>
                <span className="stat-label">Điểm TB</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{userStats.improvement}</span>
                <span className="stat-label">Tiến bộ</span>
              </div>
            </div>
          </div>

          <div className="recent-achievements">
            <h3>🏅 Thành tích gần đây</h3>
            <div className="achievement-list">
              <div className="achievement-item">
                <span className="achievement-icon">🎯</span>
                <div className="achievement-info">
                  <strong>Perfect Week</strong>
                  <p>Học 7 ngày liên tiếp</p>
                </div>
              </div>
              <div className="achievement-item">
                <span className="achievement-icon">📚</span>
                <div className="achievement-info">
                  <strong>Vocabulary Master</strong>
                  <p>Học 100 từ vựng mới</p>
                </div>
              </div>
              <div className="achievement-item">
                <span className="achievement-icon">🔥</span>
                <div className="achievement-info">
                  <strong>Speed Learner</strong>
                  <p>Hoàn thành 10 bài trong 1 ngày</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
