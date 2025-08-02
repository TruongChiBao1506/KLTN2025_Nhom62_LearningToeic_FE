import React, { useState, useEffect } from 'react';
import './style.css';

const Achievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [userLevel, setUserLevel] = useState({});
  const [stats, setStats] = useState({});

  // Mock data for achievements
  useEffect(() => {
    const mockAchievements = [
      {
        id: 1,
        title: 'First Steps',
        description: 'Hoàn thành bài học đầu tiên',
        icon: '👶',
        category: 'learning',
        points: 10,
        unlocked: true,
        unlockedAt: new Date('2024-11-01'),
        progress: 1,
        target: 1,
        rarity: 'common'
      },
      {
        id: 2,
        title: 'Streak Master',
        description: 'Học liên tục 7 ngày',
        icon: '🔥',
        category: 'streak',
        points: 50,
        unlocked: true,
        unlockedAt: new Date('2024-11-15'),
        progress: 7,
        target: 7,
        rarity: 'rare'
      },
      {
        id: 3,
        title: 'Vocabulary Expert',
        description: 'Học thuộc 100 từ vựng',
        icon: '📚',
        category: 'vocabulary',
        points: 100,
        unlocked: true,
        unlockedAt: new Date('2024-11-20'),
        progress: 100,
        target: 100,
        rarity: 'epic'
      },
      {
        id: 4,
        title: 'Perfect Score',
        description: 'Đạt 100% trong bài kiểm tra',
        icon: '💯',
        category: 'test',
        points: 75,
        unlocked: false,
        progress: 2,
        target: 1,
        rarity: 'rare'
      },
      {
        id: 5,
        title: 'Grammar Guru',
        description: 'Hoàn thành 50 bài tập ngữ pháp',
        icon: '📝',
        category: 'grammar',
        points: 80,
        unlocked: false,
        progress: 32,
        target: 50,
        rarity: 'epic'
      },
      {
        id: 6,
        title: 'Listening Champion',
        description: 'Hoàn thành 100 bài nghe',
        icon: '🎧',
        category: 'listening',
        points: 120,
        unlocked: false,
        progress: 67,
        target: 100,
        rarity: 'legendary'
      },
      {
        id: 7,
        title: 'Marathon Runner',
        description: 'Học liên tục 30 ngày',
        icon: '🏃‍♂️',
        category: 'streak',
        points: 200,
        unlocked: false,
        progress: 18,
        target: 30,
        rarity: 'legendary'
      },
      {
        id: 8,
        title: 'Speed Reader',
        description: 'Hoàn thành 20 bài đọc trong 1 ngày',
        icon: '⚡',
        category: 'reading',
        points: 60,
        unlocked: false,
        progress: 5,
        target: 20,
        rarity: 'rare'
      }
    ];

    setAchievements(mockAchievements);
    
    // User level and stats
    setUserLevel({
      current: 12,
      name: 'Advanced Learner',
      currentXP: 2350,
      nextLevelXP: 2500,
      totalXP: 2350
    });

    setStats({
      totalAchievements: mockAchievements.length,
      unlockedAchievements: mockAchievements.filter(a => a.unlocked).length,
      totalPoints: mockAchievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0),
      rareAchievements: mockAchievements.filter(a => a.unlocked && (a.rarity === 'epic' || a.rarity === 'legendary')).length
    });
  }, []);

  const filteredAchievements = achievements.filter(achievement => {
    if (activeTab === 'unlocked') return achievement.unlocked;
    if (activeTab === 'locked') return !achievement.unlocked;
    return true;
  });

  const openModal = (achievement) => {
    setSelectedAchievement(achievement);
    setShowModal(true);
  };

  const getRarityColor = (rarity) => {
    const colors = {
      common: '#9E9E9E',
      rare: '#2196F3',
      epic: '#9C27B0',
      legendary: '#FF9800'
    };
    return colors[rarity] || '#9E9E9E';
  };

  const getRarityLabel = (rarity) => {
    const labels = {
      common: 'Thường',
      rare: 'Hiếm',
      epic: 'Sử thi',
      legendary: 'Huyền thoại'
    };
    return labels[rarity] || 'Thường';
  };

  const getProgressPercentage = (progress, target) => {
    return Math.min(100, (progress / target) * 100);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      learning: '🎓',
      streak: '🔥',
      vocabulary: '📚',
      test: '📊',
      grammar: '📝',
      listening: '🎧',
      reading: '📖'
    };
    return icons[category] || '🏆';
  };

  return (
    <div className="achievements-container">
      <div className="achievements-header">
        <h1>⭐ Thành tích</h1>
        <p>Theo dõi tiến độ và mở khóa các thành tích đặc biệt trong hành trình học TOEIC!</p>
      </div>

      <div className="achievements-content">
        <div className="achievements-main">
          <div className="user-level-card">
            <div className="level-info">
              <div className="level-badge">
                <span className="level-number">{userLevel.current}</span>
              </div>
              <div className="level-details">
                <h3>{userLevel.name}</h3>
                <div className="xp-bar">
                  <div 
                    className="xp-fill"
                    style={{ width: `${(userLevel.currentXP / userLevel.nextLevelXP) * 100}%` }}
                  />
                </div>
                <p>{userLevel.currentXP} / {userLevel.nextLevelXP} XP</p>
              </div>
            </div>
          </div>

          <div className="achievements-tabs">
            <button 
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              🏆 Tất cả ({achievements.length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'unlocked' ? 'active' : ''}`}
              onClick={() => setActiveTab('unlocked')}
            >
              ✅ Đã mở khóa ({stats.unlockedAchievements})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'locked' ? 'active' : ''}`}
              onClick={() => setActiveTab('locked')}
            >
              🔒 Chưa mở khóa ({achievements.length - stats.unlockedAchievements})
            </button>
          </div>

          <div className="achievements-grid">
            {filteredAchievements.map(achievement => (
              <div 
                key={achievement.id} 
                className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'} ${achievement.rarity}`}
                onClick={() => openModal(achievement)}
              >
                <div className="achievement-icon">
                  {achievement.unlocked ? achievement.icon : '🔒'}
                </div>
                
                <div className="achievement-content">
                  <h4>{achievement.title}</h4>
                  <p>{achievement.description}</p>
                  
                  {!achievement.unlocked && (
                    <div className="progress-section">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${getProgressPercentage(achievement.progress, achievement.target)}%` }}
                        />
                      </div>
                      <span className="progress-text">
                        {achievement.progress}/{achievement.target}
                      </span>
                    </div>
                  )}
                  
                  <div className="achievement-meta">
                    <span 
                      className="rarity-badge"
                      style={{ backgroundColor: getRarityColor(achievement.rarity) }}
                    >
                      {getRarityLabel(achievement.rarity)}
                    </span>
                    <span className="points">+{achievement.points} XP</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="achievements-sidebar">
          <div className="stats-overview">
            <h3>📊 Tổng quan</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-number">{stats.unlockedAchievements}</span>
                <span className="stat-label">Đã mở khóa</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{stats.totalPoints}</span>
                <span className="stat-label">Tổng XP</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{stats.rareAchievements}</span>
                <span className="stat-label">Thành tích hiếm</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">
                  {Math.round((stats.unlockedAchievements / stats.totalAchievements) * 100)}%
                </span>
                <span className="stat-label">Hoàn thành</span>
              </div>
            </div>
          </div>

          <div className="recent-achievements">
            <h3>🏅 Mới mở khóa</h3>
            <div className="recent-list">
              {achievements
                .filter(a => a.unlocked)
                .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
                .slice(0, 3)
                .map(achievement => (
                  <div key={achievement.id} className="recent-item">
                    <span className="recent-icon">{achievement.icon}</span>
                    <div className="recent-info">
                      <strong>{achievement.title}</strong>
                      <p>{achievement.unlockedAt.toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="categories-overview">
            <h3>📁 Danh mục</h3>
            <div className="categories-list">
              {['learning', 'streak', 'vocabulary', 'test', 'grammar', 'listening', 'reading'].map(category => {
                const categoryAchievements = achievements.filter(a => a.category === category);
                const unlockedCount = categoryAchievements.filter(a => a.unlocked).length;
                
                return (
                  <div key={category} className="category-item">
                    <span className="category-icon">{getCategoryIcon(category)}</span>
                    <div className="category-info">
                      <span className="category-name">{category}</span>
                      <span className="category-progress">
                        {unlockedCount}/{categoryAchievements.length}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Achievement Detail Modal */}
      {showModal && selectedAchievement && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedAchievement.icon} {selectedAchievement.title}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <p className="achievement-description">{selectedAchievement.description}</p>
              
              <div className="achievement-details">
                <div className="detail-row">
                  <strong>Danh mục:</strong> {getCategoryIcon(selectedAchievement.category)} {selectedAchievement.category}
                </div>
                <div className="detail-row">
                  <strong>Độ hiếm:</strong> 
                  <span 
                    className="rarity-badge"
                    style={{ backgroundColor: getRarityColor(selectedAchievement.rarity) }}
                  >
                    {getRarityLabel(selectedAchievement.rarity)}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Điểm thưởng:</strong> +{selectedAchievement.points} XP
                </div>
                {selectedAchievement.unlocked ? (
                  <div className="detail-row">
                    <strong>Mở khóa:</strong> {selectedAchievement.unlockedAt.toLocaleDateString('vi-VN')}
                  </div>
                ) : (
                  <div className="progress-detail">
                    <strong>Tiến độ:</strong>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${getProgressPercentage(selectedAchievement.progress, selectedAchievement.target)}%` }}
                      />
                    </div>
                    <span>{selectedAchievement.progress}/{selectedAchievement.target}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Achievements;
