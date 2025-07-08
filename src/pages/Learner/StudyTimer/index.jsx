import React, { useState, useEffect, useRef } from 'react';
import './style.css';

const StudyTimer = () => {
  const [time, setTime] = useState(25 * 60); // 25 minutes default
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [currentTask, setCurrentTask] = useState('');
  const [settings, setSettings] = useState({
    workTime: 25,
    shortBreak: 5,
    longBreak: 15,
    sessionsBeforeLongBreak: 4,
    autoStartBreaks: true,
    soundEnabled: true
  });
  const [stats, setStats] = useState({
    todayMinutes: 0,
    weekMinutes: 0,
    totalSessions: 0,
    streak: 0
  });
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    // Load saved data
    const savedSessions = JSON.parse(localStorage.getItem('studyTimer_sessions') || '[]');
    const savedStats = JSON.parse(localStorage.getItem('studyTimer_stats') || '{}');
    const savedSettings = JSON.parse(localStorage.getItem('studyTimer_settings') || '{}');

    setSessions(savedSessions);
    setStats(prevStats => ({ ...prevStats, ...savedStats }));
    setSettings(prevSettings => ({ ...prevSettings, ...savedSettings }));
  }, []);

  const startNextSession = React.useCallback(() => {
    const completedWorkSessions = sessions.filter(s => s.type === 'work').length;
    
    if (!isBreak) {
      // Start break
      setIsBreak(true);
      const breakDuration = completedWorkSessions % settings.sessionsBeforeLongBreak === 0 ? 
        settings.longBreak : settings.shortBreak;
      setTime(breakDuration * 60);
      setCurrentTask('');
    } else {
      // Start work session
      setIsBreak(false);
      setTime(settings.workTime * 60);
      setCurrentTask('');
    }
    
    setIsRunning(true);
  }, [sessions, isBreak, settings.sessionsBeforeLongBreak, settings.longBreak, settings.shortBreak, settings.workTime]);

  const handleTimerComplete = React.useCallback(() => {
    if (settings.soundEnabled) {
      // Play completion sound
      try {
        audioRef.current = new Audio('/notification.mp3');
        audioRef.current.play();
      } catch (error) {
        console.log('Sound not available');
      }
    }

    const newSession = {
      id: Date.now(),
      task: currentTask || (isBreak ? 'Break' : 'Study Session'),
      duration: isBreak ? 
        (sessions.length % settings.sessionsBeforeLongBreak === 0 ? settings.longBreak : settings.shortBreak) :
        settings.workTime,
      type: isBreak ? 'break' : 'work',
      completedAt: new Date().toISOString(),
      date: new Date().toDateString()
    };

    const updatedSessions = [...sessions, newSession];
    setSessions(updatedSessions);
    localStorage.setItem('studyTimer_sessions', JSON.stringify(updatedSessions));

    // Update stats
    setStats(prevStats => {
      const newStats = { ...prevStats };
      if (!isBreak) {
        newStats.totalSessions += 1;
        newStats.todayMinutes += settings.workTime;
        newStats.weekMinutes += settings.workTime;
        
        // Calculate streak
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        const todaySessions = updatedSessions.filter(s => s.date === today && s.type === 'work');
        const yesterdaySessions = updatedSessions.filter(s => s.date === yesterday && s.type === 'work');
        
        if (todaySessions.length === 1) {
          newStats.streak = yesterdaySessions.length > 0 ? newStats.streak + 1 : 1;
        }
      }
      
      localStorage.setItem('studyTimer_stats', JSON.stringify(newStats));
      return newStats;
    });

    // Auto start next session
    if (settings.autoStartBreaks) {
      startNextSession();
    } else {
      setIsRunning(false);
    }
  }, [settings, currentTask, isBreak, sessions, startNextSession]);

  useEffect(() => {
    if (isRunning && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime(time => time - 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
      if (time === 0) {
        handleTimerComplete();
      }
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, time, handleTimerComplete]);

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTime(isBreak ? 
      (sessions.length % settings.sessionsBeforeLongBreak === 0 ? settings.longBreak : settings.shortBreak) * 60 :
      settings.workTime * 60
    );
  };

  const skipSession = () => {
    setTime(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    const totalTime = isBreak ? 
      (sessions.length % settings.sessionsBeforeLongBreak === 0 ? settings.longBreak : settings.shortBreak) * 60 :
      settings.workTime * 60;
    return ((totalTime - time) / totalTime) * 100;
  };

  const updateSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('studyTimer_settings', JSON.stringify(newSettings));
    
    if (!isRunning) {
      setTime(isBreak ? 
        (sessions.length % settings.sessionsBeforeLongBreak === 0 ? newSettings.longBreak : newSettings.shortBreak) * 60 :
        newSettings.workTime * 60
      );
    }
  };

  const todaySessions = sessions.filter(s => s.date === new Date().toDateString());

  return (
    <div className="study-timer-container">
      <div className="timer-header">
        <h1>⏰ Study Timer</h1>
        <p>Pomodoro Technique cho việc học TOEIC hiệu quả</p>
      </div>

      <div className="timer-content">
        <div className="timer-main">
          <div className="timer-display">
            <div className={`timer-circle ${isBreak ? 'break' : 'work'} ${isRunning ? 'running' : ''}`}>
              <div 
                className="timer-progress" 
                style={{ 
                  background: `conic-gradient(${isBreak ? '#4ecdc4' : '#667eea'} ${getProgressPercentage() * 3.6}deg, #e0e0e0 0deg)` 
                }}
              >
                <div className="timer-inner">
                  <div className="timer-time">{formatTime(time)}</div>
                  <div className="timer-label">
                    {isBreak ? '🌸 Break Time' : '📚 Study Time'}
                  </div>
                  <div className="timer-session">
                    Session {sessions.filter(s => s.type === 'work').length + (isBreak ? 0 : 1)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="timer-controls">
            <input
              type="text"
              placeholder={isBreak ? "What are you doing on break?" : "What are you studying?"}
              value={currentTask}
              onChange={(e) => setCurrentTask(e.target.value)}
              className="task-input"
              disabled={isRunning}
            />
            
            <div className="control-buttons">
              {!isRunning ? (
                <button className="start-btn" onClick={startTimer}>
                  ▶️ Start
                </button>
              ) : (
                <button className="pause-btn" onClick={pauseTimer}>
                  ⏸️ Pause
                </button>
              )}
              <button className="reset-btn" onClick={resetTimer}>
                🔄 Reset
              </button>
              <button className="skip-btn" onClick={skipSession}>
                ⏭️ Skip
              </button>
            </div>
          </div>
        </div>

        <div className="timer-sidebar">
          <div className="stats-section">
            <h3>📊 Thống kê hôm nay</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">{stats.todayMinutes}</span>
                <span className="stat-label">Phút học</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{todaySessions.filter(s => s.type === 'work').length}</span>
                <span className="stat-label">Sessions</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.streak}</span>
                <span className="stat-label">Ngày liên tiếp</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{Math.round(stats.weekMinutes / 7)}</span>
                <span className="stat-label">Phút/ngày TB</span>
              </div>
            </div>
          </div>

          <div className="sessions-section">
            <h3>📝 Sessions hôm nay</h3>
            <div className="sessions-list">
              {todaySessions.slice(-5).map(session => (
                <div key={session.id} className={`session-item ${session.type}`}>
                  <div className="session-info">
                    <span className="session-task">
                      {session.task || (session.type === 'work' ? 'Study Session' : 'Break')}
                    </span>
                    <span className="session-time">{session.duration} phút</span>
                  </div>
                  <span className="session-icon">
                    {session.type === 'work' ? '📚' : '☕'}
                  </span>
                </div>
              ))}
              {todaySessions.length === 0 && (
                <div className="no-sessions">
                  Chưa có session nào hôm nay
                </div>
              )}
            </div>
          </div>

          <div className="settings-section">
            <button 
              className="settings-btn"
              onClick={() => setShowSettings(true)}
            >
              ⚙️ Cài đặt
            </button>
          </div>
        </div>
      </div>

      {showSettings && (
        <div className="settings-modal">
          <div className="settings-content">
            <div className="settings-header">
              <h3>⚙️ Cài đặt Timer</h3>
              <button 
                className="close-btn"
                onClick={() => setShowSettings(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="settings-form">
              <div className="setting-group">
                <label>Thời gian học (phút)</label>
                <input
                  type="number"
                  value={settings.workTime}
                  onChange={(e) => updateSettings({...settings, workTime: parseInt(e.target.value)})}
                  min="1"
                  max="60"
                />
              </div>
              
              <div className="setting-group">
                <label>Nghỉ ngắn (phút)</label>
                <input
                  type="number"
                  value={settings.shortBreak}
                  onChange={(e) => updateSettings({...settings, shortBreak: parseInt(e.target.value)})}
                  min="1"
                  max="30"
                />
              </div>
              
              <div className="setting-group">
                <label>Nghỉ dài (phút)</label>
                <input
                  type="number"
                  value={settings.longBreak}
                  onChange={(e) => updateSettings({...settings, longBreak: parseInt(e.target.value)})}
                  min="5"
                  max="60"
                />
              </div>
              
              <div className="setting-group">
                <label>Sessions trước khi nghỉ dài</label>
                <input
                  type="number"
                  value={settings.sessionsBeforeLongBreak}
                  onChange={(e) => updateSettings({...settings, sessionsBeforeLongBreak: parseInt(e.target.value)})}
                  min="2"
                  max="10"
                />
              </div>
              
              <div className="setting-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.autoStartBreaks}
                    onChange={(e) => updateSettings({...settings, autoStartBreaks: e.target.checked})}
                  />
                  Tự động bắt đầu nghỉ
                </label>
              </div>
              
              <div className="setting-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => updateSettings({...settings, soundEnabled: e.target.checked})}
                  />
                  Bật âm báo
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyTimer;
