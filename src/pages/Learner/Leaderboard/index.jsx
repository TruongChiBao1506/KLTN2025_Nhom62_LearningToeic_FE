import React, { useState, useEffect, useCallback } from 'react';
import './style.css';
import { useAuthStore } from '../../../hooks/useAuthStore';
import leaderboardService from '../../../services/leaderboardService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faMedal, faClock, faCalendarWeek, faCalendarDays, faRotate, faSpinner } from '@fortawesome/free-solid-svg-icons';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [topPlayers, setTopPlayers] = useState([]);
  const [activePeriod, setActivePeriod] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { info } = useAuthStore();

  const fetchLeaderboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch leaderboard and top players in parallel
      const [leaderboardRes, topPlayersRes] = await Promise.all([
        leaderboardService.getLeaderboard(50, activePeriod),
        leaderboardService.getTopPlayers()
      ]);

      console.log('Leaderboard Response:', leaderboardRes);
      console.log('Top Players Response:', topPlayersRes);

      if (leaderboardRes.success && leaderboardRes.data) {
        // Handle new flat response format: { success, data: [...], total }
        const leaderboardData = leaderboardRes.data.data || leaderboardRes.data || [];
        const processedLeaderboard = Array.isArray(leaderboardData) ? leaderboardData : [];

        // Transform data to match component expectations
        const transformedLeaderboard = processedLeaderboard.map((player, index) => ({
          ...player,
          rank: player.rank || index + 1,
          name: player.name || player.username,
          avatar: player.image || player.avatar,
          achievementPoints: player.achievementPoints || 0,
          userId: player.userId || player._id,
          email: player.email,
          totalQuestions: player.totalQuestions || 0,
          currentStreak: player.currentStreak || 0
        }));

        setLeaderboard(transformedLeaderboard);

        // Find current user's rank
        if (info && info.id) {
          const currentUserRank = transformedLeaderboard.findIndex(player =>
            player.userId === info.id
          );
          if (currentUserRank !== -1) {
            setUserRank({
              ...transformedLeaderboard[currentUserRank],
              rank: currentUserRank + 1
            });
          }
        }
      }

      if (topPlayersRes.success && topPlayersRes.data) {
        // Handle new response format for top players
        const topPlayersData = topPlayersRes.data.data || topPlayersRes.data || [];
        const processedTopPlayers = Array.isArray(topPlayersData) ? topPlayersData : [];

        // Transform top players data
        const transformedTopPlayers = processedTopPlayers.map((player, index) => ({
          ...player,
          rank: player.rank || index + 1,
          name: player.name || player.username,
          avatar: player.image || player.avatar,
          achievementPoints: player.achievementPoints || 0,
          userId: player.userId || player._id,
          email: player.email,
          totalQuestions: player.totalQuestions || 0,
          currentStreak: player.currentStreak || 0
        }));

        setTopPlayers(transformedTopPlayers);
      }

    } catch (err) {
      console.error('Leaderboard fetch error:', err);
      setError('Không thể tải dữ liệu bảng xếp hạng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [activePeriod, info]);

  // Fetch leaderboard data
  useEffect(() => {
    document.title = "Bảng xếp hạng | TOEIC Learning Platform";

    fetchLeaderboardData();
  }, [fetchLeaderboardData]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <FontAwesomeIcon icon={faMedal} style={{ color: '#FFD700' }} />;
      case 2: return <FontAwesomeIcon icon={faMedal} style={{ color: '#C0C0C0' }} />;
      case 3: return <FontAwesomeIcon icon={faMedal} style={{ color: '#CD7F32' }} />;
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return '#FFD700';
      case 2: return '#C0C0C0';
      case 3: return '#CD7F32';
      default: return '#64748b';
    }
  };

  const formatPeriodLabel = (period) => {
    switch (period) {
      case 'all': return 'Tất cả thời gian';
      case 'month': return 'Tháng này';
      case 'week': return 'Tuần này';
      default: return 'Tất cả thời gian';
    }
  };

  const retryFetch = () => {
    fetchLeaderboardData();
  };

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h1>
          <FontAwesomeIcon icon={faTrophy} style={{ marginRight: '12px' }} />
          Bảng Xếp Hạng
        </h1>
        <p>Đua top với cộng đồng TOEIC learners!</p>
      </div>

      {/* Period Filter */}
      <div className="leaderboard-period-filter">
        <button
          className={`leaderboard-period-btn ${activePeriod === 'all' ? 'active' : ''}`}
          onClick={() => setActivePeriod('all')}
        >
          <FontAwesomeIcon icon={faClock} style={{ marginRight: '8px' }} />
          Tất cả
        </button>
        <button
          className={`leaderboard-period-btn ${activePeriod === 'month' ? 'active' : ''}`}
          onClick={() => setActivePeriod('month')}
        >
          <FontAwesomeIcon icon={faCalendarDays} style={{ marginRight: '8px' }} />
          Tháng này
        </button>
        <button
          className={`leaderboard-period-btn ${activePeriod === 'week' ? 'active' : ''}`}
          onClick={() => setActivePeriod('week')}
        >
          <FontAwesomeIcon icon={faCalendarWeek} style={{ marginRight: '8px' }} />
          Tuần này
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px', color: 'var(--color-primary)' }}>
            <FontAwesomeIcon icon={faSpinner} spin />
          </div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '1.2rem', fontWeight: '600' }}>
            Đang tải bảng xếp hạng...
          </div>
        </div>
      ) : error ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          background: 'var(--color-bg-primary)',
          borderRadius: '12px',
          maxWidth: '500px',
          margin: '0 auto',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ 
            width: '80px',
            height: '80px',
            margin: '0 auto 24px',
            background: 'var(--color-error-lighter)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            color: 'var(--color-error)'
          }}>
            ✕
          </div>
          <div style={{ 
            color: 'var(--color-error)', 
            fontSize: '1.1rem', 
            fontWeight: '600', 
            marginBottom: '24px' 
          }}>
            {error}
          </div>
          <button
            onClick={retryFetch}
            style={{
              background: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.3s ease'
            }}
          >
            <FontAwesomeIcon icon={faRotate} style={{ marginRight: '8px' }} />
            Thử lại
          </button>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {topPlayers.length > 0 && (
            <div className="leaderboard-top-players-podium">
              {topPlayers.slice(0, 3).map((player, index) => {
                const rank = index + 1;
                return (
                  <div key={player._id || player.userId} className={`leaderboard-podium-item rank-${rank}`}>
                    <div className="leaderboard-podium-avatar">
                      <div className="leaderboard-avatar-circle">
                        {player.avatar ? (
                          <img src={player.avatar} alt={player.name || 'Player'} />
                        ) : (
                          <div className="leaderboard-avatar-placeholder">
                            {(player.name || 'Player').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="leaderboard-rank-badge" style={{ backgroundColor: getRankColor(rank) }}>
                        {getRankIcon(rank)}
                      </div>
                    </div>
                    <div className="leaderboard-podium-info">
                      <h3>{player.name || 'Unknown Player'}</h3>
                      <div className="leaderboard-podium-points">
                        {player.achievementPoints || 0} XP
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Current User Rank Card */}
          {userRank && (
            <div className="leaderboard-user-rank-card">
              <div className="leaderboard-user-rank-header">
                <span className="leaderboard-rank-label">Thứ hạng của bạn</span>
                <span className="leaderboard-rank-number" style={{ color: getRankColor(userRank.rank) }}>
                  {getRankIcon(userRank.rank)}
                </span>
              </div>
              <div className="leaderboard-user-rank-content">
                <div className="leaderboard-user-rank-info">
                  <div className="leaderboard-user-avatar">
                    {userRank.avatar ? (
                      <img src={userRank.avatar} alt={userRank.name || 'You'} />
                    ) : (
                      <div className="avatar-placeholder">
                        {(userRank.name || 'You').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="leaderboard-user-details">
                    <h4>{userRank.name || 'Bạn'}</h4>
                    <div className="leaderboard-user-points">{userRank.achievementPoints || 0} XP</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard Table */}
          <div className="leaderboard-leaderboard-table">
            <div className="leaderboard-table-header">
              <span>Hạng</span>
              <span>Người chơi</span>
              <span>Điểm</span>
            </div>
            <div className="leaderboard-table-body">
              {leaderboard.map((player, index) => {
                const rank = index + 1;
                const isCurrentUser = info && player.userId === info.id;

                return (
                  <div key={player.userId} className={`leaderboard-table-row ${isCurrentUser ? 'current-user' : ''}`}>
                    <div className="leaderboard-rank-cell">
                      <span className="leaderboard-rank-number" style={{ color: getRankColor(rank) }}>
                        {getRankIcon(rank)}
                      </span>
                    </div>
                    <div className="leaderboard-player-cell">
                      <div className="leaderboard-player-avatar">
                        {player.avatar ? (
                          <img src={player.avatar} alt={player.name || 'Player'} />
                        ) : (
                          <div className="leaderboard-avatar-placeholder">
                            {(player.name || 'Player').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="leaderboard-player-info">
                        <div className="leaderboard-player-name">{player.name || 'Unknown Player'}</div>
                        {isCurrentUser && <div className="leaderboard-current-user-badge">Bạn</div>}
                      </div>
                    </div>
                    <div className="leaderboard-points-cell">
                      <span className="leaderboard-points-value">{player.achievementPoints || 0}</span>
                      <span className="leaderboard-points-label">XP</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {leaderboard.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px', 
              background: 'var(--color-bg-primary)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-md)'
            }}>
              <div style={{ 
                fontSize: '3rem', 
                marginBottom: '20px',
                color: 'var(--color-text-secondary)'
              }}>
                <FontAwesomeIcon icon={faTrophy} />
              </div>
              <div style={{ 
                fontSize: '1.1rem',
                color: 'var(--color-text-secondary)',
                fontWeight: '500'
              }}>
                Chưa có dữ liệu bảng xếp hạng cho {formatPeriodLabel(activePeriod).toLowerCase()}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Leaderboard;
