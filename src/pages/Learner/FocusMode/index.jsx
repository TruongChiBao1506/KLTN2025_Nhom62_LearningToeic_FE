import React, { useState, useEffect, useRef, useCallback } from 'react';
import './style.css';

const FocusMode = () => {
  const [isActive, setIsActive] = useState(false);
  const [timer, setTimer] = useState(25 * 60); // 25 minutes default
  const [isRunning, setIsRunning] = useState(false);
  const [currentActivity, setCurrentActivity] = useState('');
  const [focusSessions, setFocusSessions] = useState([]);
  const [settings, setSettings] = useState({
    focusTime: 25,
    shortBreak: 5,
    longBreak: 15,
    backgroundMusic: 'nature',
    notifications: true
  });
  const [sessionCount, setSessionCount] = useState(0);
  const intervalRef = useRef(null);

  // Mock data for focus sessions
  useEffect(() => {
    const mockSessions = [
      {
        id: 1,
        activity: 'Ôn tập ngữ pháp',
        duration: 25,
        completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        type: 'focus'
      },
      {
        id: 2,
        activity: 'Luyện listening',
        duration: 30,
        completedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        type: 'focus'
      },
      {
        id: 3,
        activity: 'Nghỉ ngắn',
        duration: 5,
        completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        type: 'break'
      }
    ];
    setFocusSessions(mockSessions);
  }, []);

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);
    setSessionCount(prev => prev + 1);
    
    // Add completed session
    const newSession = {
      id: Date.now(),
      activity: currentActivity || 'Phiên tập trung',
      duration: settings.focusTime,
      completedAt: new Date(),
      type: 'focus'
    };
    setFocusSessions(prev => [newSession, ...prev]);

    // Show notification
    if (settings.notifications && 'Notification' in window) {
      new Notification('Phiên tập trung hoàn thành!', {
        body: `Bạn đã hoàn thành ${settings.focusTime} phút tập trung.`,
        icon: '/favicon.ico'
      });
    }

    // Reset timer for break
    setTimer(settings.shortBreak * 60);
  }, [currentActivity, settings.focusTime, settings.notifications, settings.shortBreak]);

  useEffect(() => {
    if (isRunning && timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      handleTimerComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timer, handleTimerComplete]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startFocusSession = () => {
    if (!currentActivity.trim()) {
      alert('Vui lòng nhập hoạt động bạn muốn tập trung!');
      return;
    }
    setIsActive(true);
    setIsRunning(true);
    setTimer(settings.focusTime * 60);
  };

  const pauseTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimer(settings.focusTime * 60);
  };

  const exitFocusMode = () => {
    setIsActive(false);
    setIsRunning(false);
    setTimer(settings.focusTime * 60);
    setCurrentActivity('');
  };

  const backgroundMusic = {
    nature: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    rain: 'https://www.soundjay.com/weather/sounds/rain-01.wav',
    waves: 'https://www.soundjay.com/nature/sounds/waves-01.wav',
    cafe: 'https://www.soundjay.com/misc/sounds/bell-ringing-01.wav'
  };

  if (isActive) {
    return (
      <div className="focus-mode-active">
        <div className="focus-background">
          <div className="focus-content">
            <div className="focus-timer">
              <h1 className="timer-display">{formatTime(timer)}</h1>
              <p className="current-activity">{currentActivity}</p>
              
              <div className="timer-controls">
                <button 
                  className={`timer-btn ${isRunning ? 'pause' : 'play'}`}
                  onClick={pauseTimer}
                >
                  {isRunning ? '⏸️' : '▶️'}
                </button>
                <button className="timer-btn reset" onClick={resetTimer}>
                  🔄
                </button>
                <button className="timer-btn exit" onClick={exitFocusMode}>
                  ❌
                </button>
              </div>
            </div>

            <div className="focus-stats">
              <div className="stat-item">
                <span className="stat-number">{sessionCount}</span>
                <span className="stat-label">Phiên hôm nay</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{Math.floor(sessionCount * settings.focusTime / 60)}</span>
                <span className="stat-label">Giờ tập trung</span>
              </div>
            </div>

            {settings.backgroundMusic && (
              <div className="background-music">
                <audio autoPlay loop>
                  <source src={backgroundMusic[settings.backgroundMusic]} type="audio/wav" />
                </audio>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="focus-mode-container">
      <div className="focus-mode-header">
        <h1>🎯 Chế độ tập trung</h1>
        <p>Loại bỏ mọi yếu tố gây xao nhãng để tập trung hoàn toàn vào việc học!</p>
      </div>

      <div className="focus-mode-content">
        <div className="focus-setup">
          <div className="setup-card">
            <h3>Bắt đầu phiên tập trung</h3>
            
            <div className="form-group">
              <label htmlFor="activity">Hoạt động học tập:</label>
              <input
                type="text"
                id="activity"
                value={currentActivity}
                onChange={(e) => setCurrentActivity(e.target.value)}
                placeholder="VD: Ôn tập ngữ pháp, Luyện listening..."
                className="activity-input"
              />
            </div>

            <div className="timer-setup">
              <div className="timer-option">
                <label>Thời gian tập trung:</label>
                <select 
                  value={settings.focusTime}
                  onChange={(e) => setSettings(prev => ({...prev, focusTime: parseInt(e.target.value)}))}
                >
                  <option value={15}>15 phút</option>
                  <option value={25}>25 phút</option>
                  <option value={30}>30 phút</option>
                  <option value={45}>45 phút</option>
                  <option value={60}>60 phút</option>
                </select>
              </div>
            </div>

            <button 
              className="start-focus-btn"
              onClick={startFocusSession}
              disabled={!currentActivity.trim()}
            >
              🎯 Bắt đầu tập trung
            </button>
          </div>

          <div className="settings-card">
            <h3>⚙️ Cài đặt</h3>
            
            <div className="setting-group">
              <label>Nhạc nền:</label>
              <select 
                value={settings.backgroundMusic}
                onChange={(e) => setSettings(prev => ({...prev, backgroundMusic: e.target.value}))}
              >
                <option value="">Không có</option>
                <option value="nature">Thiên nhiên</option>
                <option value="rain">Tiếng mưa</option>
                <option value="waves">Sóng biển</option>
                <option value="cafe">Quán cafe</option>
              </select>
            </div>

            <div className="setting-group">
              <label>
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => setSettings(prev => ({...prev, notifications: e.target.checked}))}
                />
                Bật thông báo
              </label>
            </div>
          </div>
        </div>

        <div className="focus-history">
          <h3>📊 Lịch sử tập trung</h3>
          <div className="history-stats">
            <div className="stat-card">
              <span className="stat-number">{focusSessions.filter(s => s.type === 'focus').length}</span>
              <span className="stat-label">Phiên đã hoàn thành</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                {Math.floor(focusSessions.filter(s => s.type === 'focus').reduce((acc, s) => acc + s.duration, 0) / 60)}
              </span>
              <span className="stat-label">Giờ tập trung</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                {focusSessions.filter(s => s.completedAt.toDateString() === new Date().toDateString()).length}
              </span>
              <span className="stat-label">Phiên hôm nay</span>
            </div>
          </div>

          <div className="history-list">
            {focusSessions.slice(0, 10).map(session => (
              <div key={session.id} className={`history-item ${session.type}`}>
                <div className="session-info">
                  <span className="session-activity">{session.activity}</span>
                  <span className="session-duration">{session.duration} phút</span>
                </div>
                <span className="session-time">
                  {session.completedAt.toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusMode;
