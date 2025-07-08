import React, { useState, useEffect } from 'react';
import './style.css';

const Challenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [userChallenges, setUserChallenges] = useState([]);
  const [activeTab, setActiveTab] = useState('daily');
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    completedChallenges: 0,
    currentStreak: 0,
    longestStreak: 0
  });

  // Mock data for challenges
  useEffect(() => {
    const mockChallenges = [
      {
        id: 1,
        title: 'Nghe 10 đoạn hội thoại',
        description: 'Hoàn thành 10 bài nghe Part 3 trong ngày hôm nay',
        type: 'daily',
        category: 'listening',
        difficulty: 'easy',
        points: 50,
        target: 10,
        current: 0,
        timeLimit: 24 * 60 * 60 * 1000, // 24 hours
        startDate: new Date(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        icon: '🎧',
        requirements: [
          'Hoàn thành 10 bài nghe Part 3',
          'Đạt tối thiểu 70% điểm',
          'Trong vòng 24 giờ'
        ],
        rewards: [
          '50 điểm kinh nghiệm',
          'Huy hiệu "Listener"',
          'Unlock bài học mới'
        ]
      },
      {
        id: 2,
        title: 'Streak Master',
        description: 'Học liên tục 7 ngày không nghỉ',
        type: 'weekly',
        category: 'general',
        difficulty: 'medium',
        points: 200,
        target: 7,
        current: 3,
        timeLimit: 7 * 24 * 60 * 60 * 1000, // 7 days
        startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        icon: '🔥',
        requirements: [
          'Đăng nhập mỗi ngày',
          'Hoàn thành ít nhất 1 bài tập',
          'Liên tục 7 ngày'
        ],
        rewards: [
          '200 điểm kinh nghiệm',
          'Huy hiệu "Streak Master"',
          'Premium content access'
        ]
      },
      {
        id: 3,
        title: 'Vocabulary Champion',
        description: 'Học thuộc 100 từ vựng mới trong tháng',
        type: 'monthly',
        category: 'vocabulary',
        difficulty: 'hard',
        points: 500,
        target: 100,
        current: 35,
        timeLimit: 30 * 24 * 60 * 60 * 1000, // 30 days
        startDate: new Date(2024, 11, 1), // December 1, 2024
        endDate: new Date(2024, 11, 31), // December 31, 2024
        icon: '📚',
        requirements: [
          'Học 100 từ vựng mới',
          'Đạt 80% trong quiz',
          'Trong vòng 30 ngày'
        ],
        rewards: [
          '500 điểm kinh nghiệm',
          'Huy hiệu "Vocabulary Master"',
          'Exclusive vocabulary pack'
        ]
      },
      {
        id: 4,
        title: 'Grammar Guru',
        description: 'Hoàn thành 50 câu hỏi ngữ pháp với độ chính xác 90%',
        type: 'weekly',
        category: 'grammar',
        difficulty: 'medium',
        points: 150,
        target: 50,
        current: 22,
        timeLimit: 7 * 24 * 60 * 60 * 1000,
        startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        icon: '📝',
        requirements: [
          'Hoàn thành 50 câu hỏi ngữ pháp',
          'Đạt độ chính xác 90%',
          'Trong vòng 7 ngày'
        ],
        rewards: [
          '150 điểm kinh nghiệm',
          'Huy hiệu "Grammar Guru"',
          'Advanced grammar lessons'
        ]
      },
      {
        id: 5,
        title: 'Reading Marathon',
        description: 'Đọc hiểu 20 đoạn văn trong ngày',
        type: 'daily',
        category: 'reading',
        difficulty: 'easy',
        points: 75,
        target: 20,
        current: 5,
        timeLimit: 24 * 60 * 60 * 1000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        icon: '📖',
        requirements: [
          'Hoàn thành 20 bài đọc hiểu',
          'Đạt tối thiểu 75% điểm',
          'Trong vòng 24 giờ'
        ],
        rewards: [
          '75 điểm kinh nghiệm',
          'Huy hiệu "Speed Reader"',
          'Reading tips & tricks'
        ]
      },
      {
        id: 6,
        title: 'Perfect Score',
        description: 'Đạt điểm tuyệt đối trong 3 bài test liên tiếp',
        type: 'special',
        category: 'test',
        difficulty: 'hard',
        points: 1000,
        target: 3,
        current: 1,
        timeLimit: null, // No time limit
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endDate: null,
        icon: '🏆',
        requirements: [
          'Đạt 100% trong 3 bài test',
          'Các bài test phải liên tiếp',
          'Không giới hạn thời gian'
        ],
        rewards: [
          '1000 điểm kinh nghiệm',
          'Huy hiệu "Perfect Master"',
          'VIP status + all features'
        ]
      }
    ];

    setChallenges(mockChallenges);
    
    // Mock user challenge progress
    setUserChallenges([1, 2, 3, 4, 5, 6]); // User has joined all challenges
    
    setUserStats({
      totalPoints: 1250,
      completedChallenges: 8,
      currentStreak: 5,
      longestStreak: 12
    });
  }, []);

  const filteredChallenges = challenges.filter(challenge => {
    if (activeTab === 'special') return challenge.type === 'special';
    return challenge.type === activeTab;
  });

  const joinChallenge = (challengeId) => {
    setUserChallenges(prev => [...prev, challengeId]);
  };

  const leaveChallenge = (challengeId) => {
    setUserChallenges(prev => prev.filter(id => id !== challengeId));
  };

  const openChallengeModal = (challenge) => {
    setSelectedChallenge(challenge);
    setShowModal(true);
  };

  const updateChallengeProgress = (challengeId, increment = 1) => {
    setChallenges(prev => prev.map(challenge => 
      challenge.id === challengeId 
        ? { 
            ...challenge, 
            current: Math.min(challenge.target, challenge.current + increment)
          }
        : challenge
    ));
  };

  const formatTimeRemaining = (endDate) => {
    if (!endDate) return 'Không giới hạn';
    
    const now = new Date();
    const remaining = endDate - now;
    
    if (remaining <= 0) return 'Đã hết hạn';
    
    const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
    const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    
    if (days > 0) return `${days} ngày ${hours} giờ`;
    if (hours > 0) return `${hours} giờ ${minutes} phút`;
    return `${minutes} phút`;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: '#4CAF50',
      medium: '#FF9800',
      hard: '#F44336'
    };
    return colors[difficulty] || '#666';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      listening: '🎧',
      reading: '📖',
      grammar: '📝',
      vocabulary: '📚',
      test: '📊',
      general: '🎯'
    };
    return icons[category] || '🎯';
  };

  const getProgress = (current, target) => {
    return Math.min(100, (current / target) * 100);
  };

  const isCompleted = (challenge) => {
    return challenge.current >= challenge.target;
  };

  const isExpired = (challenge) => {
    return challenge.endDate && new Date() > challenge.endDate;
  };

  return (
    <div className="challenges-container">
      <div className="challenges-header">
        <h1>🎁 Thử thách TOEIC</h1>
        <p>Hoàn thành các thử thách để nhận điểm thưởng và mở khóa thành tích đặc biệt!</p>
      </div>

      <div className="user-stats">
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon">🏆</span>
            <div className="stat-content">
              <span className="stat-number">{userStats.totalPoints}</span>
              <span className="stat-label">Tổng điểm</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">✅</span>
            <div className="stat-content">
              <span className="stat-number">{userStats.completedChallenges}</span>
              <span className="stat-label">Đã hoàn thành</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🔥</span>
            <div className="stat-content">
              <span className="stat-number">{userStats.currentStreak}</span>
              <span className="stat-label">Streak hiện tại</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📈</span>
            <div className="stat-content">
              <span className="stat-number">{userStats.longestStreak}</span>
              <span className="stat-label">Streak tối đa</span>
            </div>
          </div>
        </div>
      </div>

      <div className="challenges-content">
        <div className="challenges-tabs">
          <button 
            className={`tab-btn ${activeTab === 'daily' ? 'active' : ''}`}
            onClick={() => setActiveTab('daily')}
          >
            🌅 Hàng ngày
          </button>
          <button 
            className={`tab-btn ${activeTab === 'weekly' ? 'active' : ''}`}
            onClick={() => setActiveTab('weekly')}
          >
            📅 Hàng tuần
          </button>
          <button 
            className={`tab-btn ${activeTab === 'monthly' ? 'active' : ''}`}
            onClick={() => setActiveTab('monthly')}
          >
            🗓️ Hàng tháng
          </button>
          <button 
            className={`tab-btn ${activeTab === 'special' ? 'active' : ''}`}
            onClick={() => setActiveTab('special')}
          >
            ⭐ Đặc biệt
          </button>
        </div>

        <div className="challenges-grid">
          {filteredChallenges.map(challenge => (
            <div 
              key={challenge.id} 
              className={`challenge-card ${isCompleted(challenge) ? 'completed' : ''} ${isExpired(challenge) ? 'expired' : ''}`}
            >
              <div className="challenge-header">
                <div className="challenge-icon">{challenge.icon}</div>
                <div className="challenge-meta">
                  <span 
                    className="difficulty-badge"
                    style={{ backgroundColor: getDifficultyColor(challenge.difficulty) }}
                  >
                    {challenge.difficulty}
                  </span>
                  <span className="category-badge">
                    {getCategoryIcon(challenge.category)} {challenge.category}
                  </span>
                </div>
              </div>

              <div className="challenge-content">
                <h3>{challenge.title}</h3>
                <p>{challenge.description}</p>

                <div className="challenge-progress">
                  <div className="progress-info">
                    <span>Tiến độ: {challenge.current}/{challenge.target}</span>
                    <span className="progress-percentage">
                      {Math.round(getProgress(challenge.current, challenge.target))}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${getProgress(challenge.current, challenge.target)}%` }}
                    />
                  </div>
                </div>

                <div className="challenge-info">
                  <div className="info-item">
                    <span className="info-label">Phần thưởng:</span>
                    <span className="info-value">{challenge.points} điểm</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Thời hạn:</span>
                    <span className="info-value">{formatTimeRemaining(challenge.endDate)}</span>
                  </div>
                </div>
              </div>

              <div className="challenge-actions">
                <button 
                  className="btn-details"
                  onClick={() => openChallengeModal(challenge)}
                >
                  Chi tiết
                </button>
                
                {isCompleted(challenge) ? (
                  <button className="btn-completed" disabled>
                    ✅ Hoàn thành
                  </button>
                ) : isExpired(challenge) ? (
                  <button className="btn-expired" disabled>
                    ❌ Đã hết hạn
                  </button>
                ) : userChallenges.includes(challenge.id) ? (
                  <div className="challenge-controls">
                    <button 
                      className="btn-progress"
                      onClick={() => updateChallengeProgress(challenge.id)}
                      disabled={challenge.current >= challenge.target}
                    >
                      +1 Tiến độ
                    </button>
                    <button 
                      className="btn-leave"
                      onClick={() => leaveChallenge(challenge.id)}
                    >
                      Rời khỏi
                    </button>
                  </div>
                ) : (
                  <button 
                    className="btn-join"
                    onClick={() => joinChallenge(challenge.id)}
                  >
                    Tham gia
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Challenge Detail Modal */}
      {showModal && selectedChallenge && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedChallenge.icon} {selectedChallenge.title}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="modal-challenge-info">
                <p className="challenge-description">{selectedChallenge.description}</p>
                
                <div className="challenge-details">
                  <div className="detail-section">
                    <h4>📋 Yêu cầu:</h4>
                    <ul>
                      {selectedChallenge.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="detail-section">
                    <h4>🎁 Phần thưởng:</h4>
                    <ul>
                      {selectedChallenge.rewards.map((reward, index) => (
                        <li key={index}>{reward}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="challenge-stats">
                    <div className="stat-item">
                      <strong>Loại:</strong> {selectedChallenge.type}
                    </div>
                    <div className="stat-item">
                      <strong>Danh mục:</strong> {selectedChallenge.category}
                    </div>
                    <div className="stat-item">
                      <strong>Độ khó:</strong> {selectedChallenge.difficulty}
                    </div>
                    <div className="stat-item">
                      <strong>Điểm thưởng:</strong> {selectedChallenge.points}
                    </div>
                    <div className="stat-item">
                      <strong>Thời hạn:</strong> {formatTimeRemaining(selectedChallenge.endDate)}
                    </div>
                  </div>

                  <div className="progress-section">
                    <h4>📊 Tiến độ hiện tại:</h4>
                    <div className="modal-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${getProgress(selectedChallenge.current, selectedChallenge.target)}%` }}
                        />
                      </div>
                      <span className="progress-text">
                        {selectedChallenge.current}/{selectedChallenge.target} 
                        ({Math.round(getProgress(selectedChallenge.current, selectedChallenge.target))}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {isCompleted(selectedChallenge) ? (
                <button className="btn-completed" disabled>
                  ✅ Đã hoàn thành
                </button>
              ) : isExpired(selectedChallenge) ? (
                <button className="btn-expired" disabled>
                  ❌ Đã hết hạn
                </button>
              ) : userChallenges.includes(selectedChallenge.id) ? (
                <button 
                  className="btn-leave"
                  onClick={() => {
                    leaveChallenge(selectedChallenge.id);
                    setShowModal(false);
                  }}
                >
                  Rời khỏi thử thách
                </button>
              ) : (
                <button 
                  className="btn-join"
                  onClick={() => {
                    joinChallenge(selectedChallenge.id);
                    setShowModal(false);
                  }}
                >
                  Tham gia thử thách
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Challenges;
