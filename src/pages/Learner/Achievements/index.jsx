import React, { useState, useEffect, useCallback } from 'react';
import './style.css';
import { useAuthStore } from '../../../hooks/useAuthStore';
import achievementService from '../../../services/achievementService';

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

      {/* Enhanced Modal */}
      {showModal && selectedAchievement && (
        <div
          className="modal-overlay"
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'modalFadeIn 0.3s ease-out'
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff', // Solid white background
              borderRadius: '20px',
              boxShadow: selectedAchievement.unlocked
                ? `0 25px 50px rgba(${getRarityColor(selectedAchievement.rarity || 'common').slice(1, 3)}, ${getRarityColor(selectedAchievement.rarity || 'common').slice(3, 5)}, ${getRarityColor(selectedAchievement.rarity || 'common').slice(5, 7)}, 0.3)`
                : '0 25px 50px rgba(0, 0, 0, 0.15)',
              border: selectedAchievement.unlocked
                ? `2px solid ${getRarityColor(selectedAchievement.rarity || 'common')}40`
                : '1px solid rgba(0, 0, 0, 0.1)',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'hidden',
              animation: 'modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              position: 'relative'
            }}
          >
            {/* Achievement Icon Background */}
            {selectedAchievement.unlocked && (
              <div
                style={{
                  position: 'absolute',
                  top: '-50px',
                  right: '-50px',
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${getRarityColor(selectedAchievement.rarity || 'common')}30, transparent)`,
                  opacity: 0.6,
                  animation: 'iconGlow 2s ease-in-out infinite alternate'
                }}
              />
            )}

            <div className="modal-header" style={{
              padding: '30px 30px 20px',
              borderBottom: selectedAchievement.unlocked
                ? `1px solid ${getRarityColor(selectedAchievement.rarity || 'common')}30`
                : '1px solid rgba(0, 0, 0, 0.1)',
              position: 'relative',
              zIndex: 1,
              background: 'rgba(255, 255, 255, 0.95)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                <div
                  style={{
                    fontSize: '3rem',
                    filter: selectedAchievement.unlocked ? 'none' : 'grayscale(100%)',
                    opacity: selectedAchievement.unlocked ? 1 : 0.5,
                    animation: selectedAchievement.unlocked ? 'iconBounce 0.6s ease-out' : 'none'
                  }}
                >
                  {selectedAchievement.unlocked
                    ? getCategoryIcon(selectedAchievement.category || 'general')
                    : '🔒'
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{
                    margin: 0,
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: selectedAchievement.unlocked ? '#1a202c' : '#718096',
                    lineHeight: '1.3'
                  }}>
                    {selectedAchievement.title || 'Unknown Achievement'}
                  </h2>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginTop: '8px'
                  }}>
                    <span
                      className="rarity-badge"
                      style={{
                        background: `linear-gradient(135deg, ${getRarityColor(selectedAchievement.rarity || 'common')}, ${getRarityColor(selectedAchievement.rarity || 'common')}dd)`,
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        boxShadow: `0 4px 12px rgba(${getRarityColor(selectedAchievement.rarity || 'common').slice(1, 3)}, ${getRarityColor(selectedAchievement.rarity || 'common').slice(3, 5)}, ${getRarityColor(selectedAchievement.rarity || 'common').slice(5, 7)}, 0.3)`
                      }}
                    >
                      {getRarityLabel(selectedAchievement.rarity || 'common')}
                    </span>
                    {selectedAchievement.unlocked && (
                      <span style={{
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        animation: 'statusPulse 2s ease-in-out infinite'
                      }}>
                        ✅ Đã mở khóa
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'rgba(0, 0, 0, 0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  color: '#666',
                  transition: 'all 0.3s ease',
                  zIndex: 2
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(0, 0, 0, 0.2)';
                  e.target.style.transform = 'scale(1.1)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'rgba(0, 0, 0, 0.1)';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                ×
              </button>
            </div>

            <div className="modal-body" style={{
              padding: '20px 30px 30px',
              position: 'relative',
              zIndex: 1,
              background: 'rgba(255, 255, 255, 0.95)'
            }}>
              <p className="achievement-description" style={{
                fontSize: '1rem',
                lineHeight: '1.6',
                color: '#4a5568',
                marginBottom: '25px',
                fontStyle: 'italic',
                textAlign: 'center',
                padding: '15px',
                background: selectedAchievement.unlocked
                  ? 'rgba(255, 255, 255, 0.95)'
                  : 'rgba(248, 250, 252, 0.8)',
                borderRadius: '12px',
                border: selectedAchievement.unlocked
                  ? `1px solid ${getRarityColor(selectedAchievement.rarity || 'common')}30`
                  : '1px solid rgba(0, 0, 0, 0.05)'
              }}>
                "{selectedAchievement.description || 'No description available'}"
              </p>

              <div className="achievement-details" style={{
                display: 'grid',
                gap: '15px'
              }}>
                <div className="detail-row" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: 'rgba(248, 250, 252, 0.8)',
                  borderRadius: '10px',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.2rem' }}>
                      {getCategoryIcon(selectedAchievement.category || 'general')}
                    </span>
                    <strong style={{ color: '#2d3748' }}>Danh mục:</strong>
                  </div>
                  <span style={{ color: '#4a5568', fontWeight: '500' }}>
                    {getCategoryLabel(selectedAchievement.category || 'general')}
                  </span>
                </div>

                <div className="detail-row" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: 'rgba(248, 250, 252, 0.8)',
                  borderRadius: '10px',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.2rem' }}>⭐</span>
                    <strong style={{ color: '#2d3748' }}>Điểm thưởng:</strong>
                  </div>
                  <span style={{
                    color: '#4f46e5',
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    +{(selectedAchievement.points || 0)} XP
                  </span>
                </div>

                <div className="detail-row" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: 'rgba(248, 250, 252, 0.8)',
                  borderRadius: '10px',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.2rem' }}>🎯</span>
                    <strong style={{ color: '#2d3748' }}>Mục tiêu:</strong>
                  </div>
                  <span style={{ color: '#4a5568', fontWeight: '500' }}>
                    {selectedAchievement.target || 1}
                  </span>
                </div>

                {selectedAchievement.unlocked ? (
                  <div className="detail-row" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: 'linear-gradient(135deg, #10b98120, #05966920)',
                    borderRadius: '10px',
                    border: '1px solid #10b98140',
                    animation: 'successGlow 2s ease-in-out infinite alternate'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.2rem' }}>🎉</span>
                      <strong style={{ color: '#065f46' }}>Mở khóa:</strong>
                    </div>
                    <span style={{ color: '#065f46', fontWeight: '600' }}>
                      {selectedAchievement.unlockedAt && selectedAchievement.unlockedAt instanceof Date
                        ? selectedAchievement.unlockedAt.toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'N/A'}
                    </span>
                  </div>
                ) : (
                  <div className="progress-detail" style={{
                    padding: '20px 16px',
                    background: 'rgba(248, 250, 252, 0.8)',
                    borderRadius: '10px',
                    border: '1px solid rgba(0, 0, 0, 0.05)'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '15px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.2rem' }}>📊</span>
                        <strong style={{ color: '#2d3748' }}>Tiến độ:</strong>
                      </div>
                      <span style={{
                        color: '#4a5568',
                        fontWeight: '600',
                        background: 'rgba(0, 0, 0, 0.05)',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.9rem'
                      }}>
                        {(selectedAchievement.progress || 0)}/{(selectedAchievement.target || 1)}
                      </span>
                    </div>
                    <div className="progress-bar" style={{
                      height: '12px',
                      background: 'rgba(0, 0, 0, 0.1)',
                      borderRadius: '20px',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <div
                        className="progress-fill"
                        style={{
                          width: `${getProgressPercentage(selectedAchievement.progress || 0, selectedAchievement.target || 1)}%`,
                          height: '100%',
                          background: `linear-gradient(90deg, ${getRarityColor(selectedAchievement.rarity || 'common')}, ${getRarityColor(selectedAchievement.rarity || 'common')}dd)`,
                          borderRadius: '20px',
                          transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                          animation: 'progressShine 2s ease-in-out infinite'
                        }} />
                      </div>
                    </div>
                    <div style={{
                      textAlign: 'center',
                      marginTop: '10px',
                      fontSize: '0.9rem',
                      color: '#718096',
                      fontWeight: '500'
                    }}>
                      {Math.round(getProgressPercentage(selectedAchievement.progress || 0, selectedAchievement.target || 1))}% hoàn thành
                    </div>
                  </div>
                )}
              </div>

              {selectedAchievement.unlocked && (
                <div style={{
                  textAlign: 'center',
                  marginTop: '25px',
                  padding: '15px',
                  background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                  borderRadius: '12px',
                  border: '1px solid #f59e0b40',
                  animation: 'congratsPulse 3s ease-in-out infinite'
                }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>🎊</div>
                  <div style={{ fontWeight: '600', color: '#92400e' }}>
                    Chúc mừng! Bạn đã mở khóa thành tích này!
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes iconBounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }

        @keyframes iconGlow {
          from { transform: scale(1); opacity: 0.6; }
          to { transform: scale(1.2); opacity: 0.8; }
        }

        @keyframes statusPulse {
          from { transform: scale(1); }
          to { transform: scale(1.05); }
        }

        @keyframes successGlow {
          from { box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
          to { box-shadow: 0 0 30px rgba(16, 185, 129, 0.5); }
        }

        @keyframes progressShine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes congratsPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }

        .modal-overlay {
          animation-fill-mode: both;
        }

        .modal-content {
          animation-fill-mode: both;
        }

        .detail-row:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .progress-detail:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 768px) {
          .modal-content {
            width: 95% !important;
            margin: 20px;
          }

          .modal-header {
            padding: 20px !important;
          }

          .modal-body {
            padding: 20px !important;
          }

          .detail-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default Achievements;