import React, { useState, useEffect, useCallback } from 'react';
import './style.css';
import { useAuthStore } from '../../../hooks/useAuthStore';
import leaderboardService from '../../../services/leaderboardService';

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
        const transformedLeaderboard = processedLeaderboard.map(player => ({
          ...player,
          name: player.username || player.name,
          avatar: player.avatar,
          achievementPoints: player.achievementPoints,
          userId: player.userId || player._id,
          email: player.email,
          totalQuestions: player.totalQuestions,
          currentStreak: player.currentStreak
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
        const transformedTopPlayers = processedTopPlayers.map(player => ({
          ...player,
          name: player.username || player.name,
          avatar: player.avatar,
          achievementPoints: player.achievementPoints,
          userId: player.userId || player._id,
          email: player.email,
          totalQuestions: player.totalQuestions,
          currentStreak: player.currentStreak
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
    fetchLeaderboardData();
  }, [fetchLeaderboardData]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
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
        <h1>🏆 Bảng Xếp Hạng</h1>
        <p>Đua top với cộng đồng TOEIC learners!</p>
      </div>

      {/* Period Filter */}
      <div className="period-filter">
        <button
          className={`period-btn ${activePeriod === 'all' ? 'active' : ''}`}
          onClick={() => setActivePeriod('all')}
        >
          🏅 Tất cả
        </button>
        <button
          className={`period-btn ${activePeriod === 'month' ? 'active' : ''}`}
          onClick={() => setActivePeriod('month')}
        >
          📅 Tháng này
        </button>
        <button
          className={`period-btn ${activePeriod === 'week' ? 'active' : ''}`}
          onClick={() => setActivePeriod('week')}
        >
          📊 Tuần này
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '20px' }}>⏳</div>
          <div style={{ color: '#4f46e5', fontSize: '1.2rem', fontWeight: '600' }}>
            Đang tải bảng xếp hạng...
          </div>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>❌</div>
          <div style={{ color: '#e53e3e', fontSize: '1.2rem', fontWeight: '600', marginBottom: '20px' }}>
            {error}
          </div>
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
              cursor: 'pointer'
            }}
          >
            🔄 Thử lại
          </button>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {topPlayers.length > 0 && (
            <div className="top-players-podium">
              {topPlayers.slice(0, 3).map((player, index) => {
                const rank = index + 1;
                return (
                  <div key={player._id || player.userId} className={`podium-item rank-${rank}`}>
                    <div className="podium-avatar">
                      <div className="avatar-circle">
                        {player.avatar ? (
                          <img src={player.avatar} alt={player.name || 'Player'} />
                        ) : (
                          <div className="avatar-placeholder">
                            {(player.name || 'Player').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="rank-badge" style={{ backgroundColor: getRankColor(rank) }}>
                        {getRankIcon(rank)}
                      </div>
                    </div>
                    <div className="podium-info">
                      <h3>{player.name || 'Unknown Player'}</h3>
                      <div className="podium-points">
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
            <div className="user-rank-card">
              <div className="user-rank-header">
                <span className="rank-label">Thứ hạng của bạn</span>
                <span className="rank-number" style={{ color: getRankColor(userRank.rank) }}>
                  {getRankIcon(userRank.rank)}
                </span>
              </div>
              <div className="user-rank-content">
                <div className="user-rank-info">
                  <div className="user-avatar">
                    {userRank.avatar ? (
                      <img src={userRank.avatar} alt={userRank.name || 'You'} />
                    ) : (
                      <div className="avatar-placeholder">
                        {(userRank.name || 'You').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="user-details">
                    <h4>{userRank.name || 'Bạn'}</h4>
                    <div className="user-points">{userRank.achievementPoints || 0} XP</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard Table */}
          <div className="leaderboard-table">
            <div className="table-header">
              <span>Hạng</span>
              <span>Người chơi</span>
              <span>Điểm</span>
            </div>
            <div className="table-body">
              {leaderboard.map((player, index) => {
                const rank = index + 1;
                const isCurrentUser = info && player.userId === info.id;

                return (
                  <div key={player.userId} className={`table-row ${isCurrentUser ? 'current-user' : ''}`}>
                    <div className="rank-cell">
                      <span className="rank-number" style={{ color: getRankColor(rank) }}>
                        {getRankIcon(rank)}
                      </span>
                    </div>
                    <div className="player-cell">
                      <div className="player-avatar">
                        {player.avatar ? (
                          <img src={player.avatar} alt={player.name || 'Player'} />
                        ) : (
                          <div className="avatar-placeholder">
                            {(player.name || 'Player').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="player-info">
                        <div className="player-name">{player.name || 'Unknown Player'}</div>
                        {isCurrentUser && <div className="current-user-badge">Bạn</div>}
                      </div>
                    </div>
                    <div className="points-cell">
                      <span className="points-value">{player.achievementPoints || 0}</span>
                      <span className="points-label">XP</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {leaderboard.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📊</div>
              <div style={{ fontSize: '1.1rem' }}>
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
