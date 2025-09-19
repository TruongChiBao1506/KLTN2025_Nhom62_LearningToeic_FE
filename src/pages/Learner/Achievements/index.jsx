import React, { useState, useEffect, useCallback } from 'react';
import './style.css';
import { useAuthStore } from '../../../hooks/useAuthStore';
import achievementService from '../../../services/achievementService';
import useAchievementNotifications from '../../../hooks/useAchievementNotifications';

const Achievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    totalAchievements: 0,
    unlockedAchievements: 0,
    totalPoints: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { info } = useAuthStore();
  const { recordContributeContent } = useAchievementNotifications();

  const fetchAchievements = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await achievementService.getUserAchievements(info.id);

      if (response.success && response.data) {
        const achievementsData = Array.isArray(response.data) ? response.data : [];

        // Transform data for UI
        const transformedData = achievementsData.map(achievement => ({
          id: achievement._id || achievement.id || `achievement-${Math.random()}`,
          code: achievement.code || 'unknown',
          title: typeof achievement.name === 'string' ? achievement.name : 'Unknown Achievement',
          description: typeof achievement.description === 'string' ? achievement.description : 'No description available',
          category: achievement.type || 'general',
          target: typeof achievement.target === 'number' ? achievement.target : 1,
          points: typeof achievement.points === 'number' ? achievement.points : 0,
          isHidden: Boolean(achievement.isHidden),
          unlocked: Boolean(achievement.isUnlocked),
          unlockedAt: achievement.unlockedAt ? new Date(achievement.unlockedAt) : null,
          progress: typeof achievement.progress === 'number' ? achievement.progress : 0,
          rarity: achievement.isHidden ? 'legendary' : 'common'
        }));

        setAchievements(transformedData);

        // Calculate stats
        const unlockedCount = transformedData.filter(a => a.unlocked).length;
        const totalPoints = transformedData
          .filter(a => a.unlocked)
          .reduce((sum, a) => sum + (a.points || 0), 0);
        const completionRate = transformedData.length > 0
          ? Math.round((unlockedCount / transformedData.length) * 100)
          : 0;

        setStats({
          totalAchievements: transformedData.length,
          unlockedAchievements: unlockedCount,
          totalPoints,
          completionRate
        });
      } else {
        setError('Không thể tải dữ liệu thành tích');
      }
    } catch (err) {
      console.error('Achievement fetch error:', err);
      if (err.response?.status === 404) {
        setError('Chức năng thành tích đang được phát triển');
      } else {
        setError('Không thể tải dữ liệu thành tích. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  }, [info.id]);

  // Fetch achievements data
  useEffect(() => {
    const originalTitle = document.title;
    document.title = "Thành tích | TOEIC Learning Platform";

    if (info && info.id) {
      fetchAchievements();
    }

    return () => {
      document.title = originalTitle;
    };
  }, [info, fetchAchievements]);

  const filteredAchievements = achievements.filter(achievement => {
    if (activeTab === 'unlocked') return achievement.unlocked;
    if (activeTab === 'locked') return !achievement.unlocked;
    return true;
  });

  const retryFetch = () => {
    fetchAchievements();
  };

  const testNotification = async () => {
    if (!info || !info.id) {
      alert('Vui lòng đăng nhập để test thông báo');
      return;
    }

    try {
      // Test với một thành tích mẫu - hiển thị trực tiếp
      const mockAchievement = {
        id: 'test-achievement',
        title: 'Test Achievement',
        description: 'Đây là thông báo test để kiểm tra tính năng hiển thị thành tích',
        category: 'contribution',
        rarity: 'rare',
        points: 50,
        icon: '🎯'
      };

      // Hiển thị notification trực tiếp để test UI
      alert(`Thông báo test: ${mockAchievement.title}\n${mockAchievement.description}`);
      
      alert('Thông báo test đã được hiển thị!');
    } catch (error) {
      console.error('Test notification error:', error);
      alert('Lỗi khi test thông báo: ' + error.message);
    }
  };

  const testAPI = async () => {
    if (!info || !info.id) {
      alert('Vui lòng đăng nhập để test API');
      return;
    }

    try {
      console.log('🧪 Testing API call...');
      const result = await recordContributeContent(info.id, 'test', 'test-exam-id');
      console.log('📡 API Response:', result);
      
      alert(`API test hoàn thành! Kiểm tra Console để xem response.\nSuccess: ${result.success}\nUnlocked: ${result.unlockedAchievements?.length || 0}`);
    } catch (error) {
      console.error('API test error:', error);
      alert('Lỗi khi test API: ' + error.message);
    }
  };

  const testCommentAction = async () => {
    if (!info || !info.id) {
      alert('Vui lòng đăng nhập để test comment action');
      return;
    }

    try {
      console.log('💬 Testing comment action...');
      const result = await recordContributeContent(info.id, 'comment', 'test-exam-123');
      console.log('💬 Comment API Response:', result);
      
      alert(`Comment test hoàn thành! Kiểm tra Console để xem response.\nSuccess: ${result.success}\nUnlocked: ${result.unlockedAchievements?.length || 0}`);
    } catch (error) {
      console.error('Comment test error:', error);
      alert('Lỗi khi test comment: ' + error.message);
    }
  };

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
    if (target === 0) return 0;
    return Math.min(100, (progress / target) * 100);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      streak: '🔥',
      progress: '📈',
      learning: '🎓',
      vocabulary: '📚',
      test: '📊',
      grammar: '📝',
      listening: '🎧',
      reading: '📖'
    };
    return icons[category] || '🏆';
  };

  const getCategoryLabel = (category) => {
    const labels = {
      streak: 'Chuỗi học',
      progress: 'Tiến độ',
      learning: 'Học tập',
      vocabulary: 'Từ vựng',
      test: 'Bài kiểm tra',
      grammar: 'Ngữ pháp',
      listening: 'Nghe',
      reading: 'Đọc'
    };
    return labels[category] || category;
  };

  return (
    <div className="achievements-container">
      <div className="achievements-header">
        <h1>⭐ Thành tích</h1>
        <p>Theo dõi tiến độ và mở khóa các thành tích đặc biệt trong hành trình học TOEIC của bạn!</p>
        <div style={{ marginTop: '16px' }}>
          <button
            onClick={testNotification}
            style={{
              background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)',
              marginRight: '12px'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(255, 107, 53, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(255, 107, 53, 0.3)';
            }}
          >
            🧪 Test Thông Báo Thành Tích
          </button>
          <button
            onClick={testAPI}
            style={{
              background: 'linear-gradient(135deg, #1890ff, #36cfc9)',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)',
              marginRight: '12px'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(24, 144, 255, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(24, 144, 255, 0.3)';
            }}
          >
            🔍 Test API Achievement
          </button>
          <button
            onClick={testCommentAction}
            style={{
              background: 'linear-gradient(135deg, #52c41a, #73d13d)',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(82, 196, 26, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(82, 196, 26, 0.3)';
            }}
          >
            💬 Test Comment Action
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '20px' }}>⏳</div>
          <div style={{ color: '#4f46e5', fontSize: '1.2rem', fontWeight: '600' }}>
            Đang tải dữ liệu thành tích...
          </div>
          <div style={{ color: '#666', marginTop: '10px' }}>
            Vui lòng đợi trong giây lát
          </div>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>
            {typeof error === 'string' && error.includes('phát triển') ? '🚧' : '❌'}
          </div>
          <div style={{ color: '#e53e3e', fontSize: '1.2rem', fontWeight: '600', marginBottom: '20px' }}>
            {typeof error === 'string' ? error : 'Đã xảy ra lỗi không xác định'}
          </div>
          {!(typeof error === 'string' && error.includes('phát triển')) && (
            <button
              onClick={retryFetch}
              style={{
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              🔄 Thử lại
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="stats-overview">
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-number">{stats.unlockedAchievements || 0}</span>
                <span className="stat-label">Đã mở khóa</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{stats.totalPoints || 0}</span>
                <span className="stat-label">Tổng XP</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{(stats.completionRate || 0)}%</span>
                <span className="stat-label">Hoàn thành</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{stats.totalAchievements || 0}</span>
                <span className="stat-label">Tổng thành tích</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="achievements-tabs">
            <button
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              🏆 Tất cả ({achievements.length || 0})
            </button>
            <button
              className={`tab-btn ${activeTab === 'unlocked' ? 'active' : ''}`}
              onClick={() => setActiveTab('unlocked')}
            >
              ✅ Đã mở khóa ({stats.unlockedAchievements || 0})
            </button>
            <button
              className={`tab-btn ${activeTab === 'locked' ? 'active' : ''}`}
              onClick={() => setActiveTab('locked')}
            >
              🔒 Chưa mở khóa ({(achievements.length || 0) - (stats.unlockedAchievements || 0)})
            </button>
          </div>

          {/* Achievements Grid */}
          <div className="achievements-grid">
            {filteredAchievements.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', gridColumn: '1 / -1' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>
                  {activeTab === 'unlocked' ? '🏆' : '🔒'}
                </div>
                <div style={{ color: '#666', fontSize: '1.1rem' }}>
                  {activeTab === 'unlocked'
                    ? 'Bạn chưa mở khóa thành tích nào trong danh mục này'
                    : 'Không có thành tích nào trong danh mục này'
                  }
                </div>
              </div>
            ) : (
              filteredAchievements.map(achievement => (
                <div
                  key={achievement.id}
                  className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'} ${achievement.rarity}`}
                  onClick={() => openModal(achievement)}
                >
                  <div className="achievement-icon">
                    {achievement.unlocked ? getCategoryIcon(achievement.category) : '🔒'}
                  </div>

                  <div className="achievement-content">
                    <h4>{achievement.title || 'Unknown Achievement'}</h4>
                    <p>{achievement.description || 'No description available'}</p>

                    {!achievement.unlocked && (
                      <div className="progress-section">
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${getProgressPercentage(achievement.progress || 0, achievement.target || 1)}%` }}
                          />
                        </div>
                        <span className="progress-text">
                          {(achievement.progress || 0)}/{(achievement.target || 1)}
                        </span>
                      </div>
                    )}

                    <div className="achievement-meta">
                      <span
                        className="rarity-badge"
                        style={{ backgroundColor: getRarityColor(achievement.rarity || 'common') }}
                      >
                        {getRarityLabel(achievement.rarity || 'common')}
                      </span>
                      <span className="category-badge">
                        {getCategoryIcon(achievement.category || 'general')} {getCategoryLabel(achievement.category || 'general')}
                      </span>
                      <span className="points">+{(achievement.points || 0)} XP</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && selectedAchievement && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {selectedAchievement.unlocked
                  ? getCategoryIcon(selectedAchievement.category || 'general')
                  : '🔒'
                } {selectedAchievement.title || 'Unknown Achievement'}
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="achievement-description">{selectedAchievement.description || 'No description available'}</p>
              <div className="achievement-details">
                <div className="detail-row">
                  <strong>Danh mục:</strong> {getCategoryIcon(selectedAchievement.category || 'general')} {getCategoryLabel(selectedAchievement.category || 'general')}
                </div>
                <div className="detail-row">
                  <strong>Độ hiếm:</strong>
                  <span
                    className="rarity-badge"
                    style={{ backgroundColor: getRarityColor(selectedAchievement.rarity || 'common') }}
                  >
                    {getRarityLabel(selectedAchievement.rarity || 'common')}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Điểm thưởng:</strong> +{(selectedAchievement.points || 0)} XP
                </div>
                <div className="detail-row">
                  <strong>Mục tiêu:</strong> {selectedAchievement.target || 1}
                </div>
                {selectedAchievement.unlocked ? (
                  <div className="detail-row">
                    <strong>Mở khóa:</strong> {selectedAchievement.unlockedAt && selectedAchievement.unlockedAt instanceof Date
                      ? selectedAchievement.unlockedAt.toLocaleDateString('vi-VN')
                      : 'N/A'}
                  </div>
                ) : (
                  <div className="progress-detail">
                    <strong>Tiến độ:</strong>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${getProgressPercentage(selectedAchievement.progress || 0, selectedAchievement.target || 1)}%` }}
                      />
                    </div>
                    <span>{(selectedAchievement.progress || 0)}/{(selectedAchievement.target || 1)}</span>
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