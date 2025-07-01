import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlay,
  faPause,
  faRefresh,
  faCog,
  faChartLine,
  faClock,
  faFire,
  faForward,
  faBell,
  faVolumeUp,
  faVolumeOff,
  faCheck,
  faPlus,
  faMinus,
  faCalendarAlt,
  faTrophy,
  faBookOpen,
  faGraduationCap
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import './StudyTimer.css';

const StudyTimer = () => {
  // Timer states
  const [currentPhase, setCurrentPhase] = useState('work'); // 'work', 'shortBreak', 'longBreak'
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [totalWorkTime, setTotalWorkTime] = useState(0);
  
  // Settings
  const [settings, setSettings] = useState({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    cyclesBeforeLongBreak: 4,
    autoStartBreaks: true,
    autoStartWork: false,
    soundEnabled: true,
    notificationsEnabled: true
  });
  
  // UI states
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [currentTask, setCurrentTask] = useState('');
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Học từ vựng TOEIC Part 1', completed: false, cycles: 0 },
    { id: 2, text: 'Làm bài Reading Comprehension', completed: false, cycles: 0 },
    { id: 3, text: 'Luyện nghe Part 2', completed: false, cycles: 0 }
  ]);
  
  // Daily stats
  const [dailyStats] = useState({
    totalCycles: 12,
    totalWorkTime: 300, // in minutes
    streak: 5,
    tasksCompleted: 8
  });
  
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('/notification-sound.mp3'); // You'd need to add this sound file
  }, []);

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Could not play sound:', e));
    }
  };

  // Handle phase completion
  const handlePhaseComplete = React.useCallback(() => {
    setIsRunning(false);
    
    if (settings.soundEnabled) {
      playNotificationSound();
    }
    
    if (currentPhase === 'work') {
      const newCompletedCycles = completedCycles + 1;
      setCompletedCycles(newCompletedCycles);
      setTotalWorkTime(prev => prev + settings.workDuration);
      
      // Update task cycles
      if (currentTask) {
        setTasks(prev => prev.map(task => 
          task.text === currentTask 
            ? { ...task, cycles: task.cycles + 1 }
            : task
        ));
      }
      
      // Determine next break type
      const isLongBreak = newCompletedCycles % settings.cyclesBeforeLongBreak === 0;
      const nextPhase = isLongBreak ? 'longBreak' : 'shortBreak';
      const nextDuration = isLongBreak ? settings.longBreakDuration : settings.shortBreakDuration;
      
      setCurrentPhase(nextPhase);
      setTimeLeft(nextDuration * 60);
      
      toast.success(`🎉 Hoàn thành 1 Pomodoro! ${isLongBreak ? 'Nghỉ dài' : 'Nghỉ ngắn'} thôi!`);
      
      if (settings.autoStartBreaks) {
        setIsRunning(true);
      }
    } else {
      // Break completed
      setCurrentPhase('work');
      setTimeLeft(settings.workDuration * 60);
      
      toast.info('⏰ Hết giờ nghỉ! Sẵn sàng làm việc tiếp chưa?');
      
      if (settings.autoStartWork) {
        setIsRunning(true);
      }
    }
    
    if (settings.notificationsEnabled && 'Notification' in window) {
      new Notification('Pomodoro Timer', {
        body: currentPhase === 'work' ? 'Hoàn thành 1 chu kỳ làm việc!' : 'Hết giờ nghỉ!',
        icon: '/favicon.ico'
      });
    }
  }, [currentPhase, completedCycles, settings, currentTask]);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            handlePhaseComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft, handlePhaseComplete]);

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    const duration = currentPhase === 'work' 
      ? settings.workDuration 
      : currentPhase === 'shortBreak' 
        ? settings.shortBreakDuration 
        : settings.longBreakDuration;
    setTimeLeft(duration * 60);
  };

  const skipPhase = () => {
    handlePhaseComplete();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseColor = () => {
    switch (currentPhase) {
      case 'work': return '#e74c3c';
      case 'shortBreak': return '#27ae60';
      case 'longBreak': return '#3498db';
      default: return '#e74c3c';
    }
  };

  const getPhaseLabel = () => {
    switch (currentPhase) {
      case 'work': return 'Làm việc';
      case 'shortBreak': return 'Nghỉ ngắn';
      case 'longBreak': return 'Nghỉ dài';
      default: return 'Làm việc';
    }
  };

  const addTask = () => {
    const taskText = prompt('Nhập nhiệm vụ mới:');
    if (taskText && taskText.trim()) {
      const newTask = {
        id: Date.now(),
        text: taskText.trim(),
        completed: false,
        cycles: 0
      };
      setTasks(prev => [...prev, newTask]);
    }
  };

  const toggleTask = (id) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const updateSettings = (newSettings) => {
    setSettings(newSettings);
    // Reset timer with new settings if not running
    if (!isRunning) {
      const duration = currentPhase === 'work' 
        ? newSettings.workDuration 
        : currentPhase === 'shortBreak' 
          ? newSettings.shortBreakDuration 
          : newSettings.longBreakDuration;
      setTimeLeft(duration * 60);
    }
  };

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const progress = currentPhase === 'work' 
    ? ((settings.workDuration * 60 - timeLeft) / (settings.workDuration * 60)) * 100
    : currentPhase === 'shortBreak'
      ? ((settings.shortBreakDuration * 60 - timeLeft) / (settings.shortBreakDuration * 60)) * 100
      : ((settings.longBreakDuration * 60 - timeLeft) / (settings.longBreakDuration * 60)) * 100;

  return (
    <div className="study-timer-container">
      {/* Header */}
      <div className="timer-header">
        <h1>
          <FontAwesomeIcon icon={faClock} className="header-icon" />
          Pomodoro Study Timer
        </h1>
        <div className="header-actions">
          <button 
            className="action-btn"
            onClick={() => setShowStats(!showStats)}
            title="Thống kê"
          >
            <FontAwesomeIcon icon={faChartLine} />
          </button>
          <button 
            className="action-btn"
            onClick={() => setShowSettings(!showSettings)}
            title="Cài đặt"
          >
            <FontAwesomeIcon icon={faCog} />
          </button>
        </div>
      </div>

      <div className="timer-content">
        {/* Main Timer */}
        <div className="timer-main">
          <div className="timer-circle" style={{ borderColor: getPhaseColor() }}>
            <div 
              className="timer-progress" 
              style={{ 
                background: `conic-gradient(${getPhaseColor()} 0deg, ${getPhaseColor()} ${progress * 3.6}deg, #f0f0f0 ${progress * 3.6}deg)`
              }}
            >
              <div className="timer-inner">
                <div className="phase-label" style={{ color: getPhaseColor() }}>
                  {getPhaseLabel()}
                </div>
                <div className="timer-display">
                  {formatTime(timeLeft)}
                </div>
                <div className="cycle-counter">
                  Chu kỳ: {completedCycles}
                </div>
              </div>
            </div>
          </div>

          {/* Timer Controls */}
          <div className="timer-controls">
            {!isRunning ? (
              <button className="control-btn primary" onClick={startTimer}>
                <FontAwesomeIcon icon={faPlay} />
                Bắt đầu
              </button>
            ) : (
              <button className="control-btn warning" onClick={pauseTimer}>
                <FontAwesomeIcon icon={faPause} />
                Tạm dừng
              </button>
            )}
            
            <button className="control-btn secondary" onClick={resetTimer}>
              <FontAwesomeIcon icon={faRefresh} />
              Đặt lại
            </button>
            
            <button className="control-btn info" onClick={skipPhase}>
              <FontAwesomeIcon icon={faForward} />
              Bỏ qua
            </button>
          </div>

          {/* Current Task */}
          <div className="current-task">
            <label>Nhiệm vụ hiện tại:</label>
            <select 
              value={currentTask} 
              onChange={(e) => setCurrentTask(e.target.value)}
              className="task-selector"
            >
              <option value="">Chọn nhiệm vụ...</option>
              {tasks.filter(task => !task.completed).map(task => (
                <option key={task.id} value={task.text}>
                  {task.text} ({task.cycles} chu kỳ)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Side Panel */}
        <div className="timer-sidebar">
          {/* Quick Stats */}
          <div className="quick-stats">
            <div className="stat-card">
              <FontAwesomeIcon icon={faFire} className="stat-icon" />
              <div className="stat-value">{dailyStats.streak}</div>
              <div className="stat-label">Ngày liên tiếp</div>
            </div>
            <div className="stat-card">
              <FontAwesomeIcon icon={faTrophy} className="stat-icon" />
              <div className="stat-value">{dailyStats.totalCycles}</div>
              <div className="stat-label">Chu kỳ hôm nay</div>
            </div>
            <div className="stat-card">
              <FontAwesomeIcon icon={faClock} className="stat-icon" />
              <div className="stat-value">{Math.floor(dailyStats.totalWorkTime / 60)}h</div>
              <div className="stat-label">Thời gian học</div>
            </div>
          </div>

          {/* Task List */}
          <div className="task-list">
            <div className="task-list-header">
              <h3>Nhiệm vụ hôm nay</h3>
              <button className="add-task-btn" onClick={addTask}>
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
            
            <div className="tasks">
              {tasks.map(task => (
                <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                  <div className="task-content">
                    <button 
                      className="task-checkbox"
                      onClick={() => toggleTask(task.id)}
                    >
                      {task.completed && <FontAwesomeIcon icon={faCheck} />}
                    </button>
                    <div className="task-text">{task.text}</div>
                    <div className="task-cycles">{task.cycles} chu kỳ</div>
                  </div>
                  <button 
                    className="delete-task"
                    onClick={() => deleteTask(task.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cài đặt Pomodoro</h3>
              <button className="close-btn" onClick={() => setShowSettings(false)}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="setting-group">
                <label>Thời gian làm việc (phút)</label>
                <div className="time-input">
                  <button onClick={() => updateSettings({...settings, workDuration: Math.max(1, settings.workDuration - 1)})}>
                    <FontAwesomeIcon icon={faMinus} />
                  </button>
                  <span>{settings.workDuration}</span>
                  <button onClick={() => updateSettings({...settings, workDuration: settings.workDuration + 1})}>
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </div>
              </div>

              <div className="setting-group">
                <label>Nghỉ ngắn (phút)</label>
                <div className="time-input">
                  <button onClick={() => updateSettings({...settings, shortBreakDuration: Math.max(1, settings.shortBreakDuration - 1)})}>
                    <FontAwesomeIcon icon={faMinus} />
                  </button>
                  <span>{settings.shortBreakDuration}</span>
                  <button onClick={() => updateSettings({...settings, shortBreakDuration: settings.shortBreakDuration + 1})}>
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </div>
              </div>

              <div className="setting-group">
                <label>Nghỉ dài (phút)</label>
                <div className="time-input">
                  <button onClick={() => updateSettings({...settings, longBreakDuration: Math.max(1, settings.longBreakDuration - 1)})}>
                    <FontAwesomeIcon icon={faMinus} />
                  </button>
                  <span>{settings.longBreakDuration}</span>
                  <button onClick={() => updateSettings({...settings, longBreakDuration: settings.longBreakDuration + 1})}>
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </div>
              </div>

              <div className="setting-group">
                <label>Chu kỳ trước khi nghỉ dài</label>
                <div className="time-input">
                  <button onClick={() => updateSettings({...settings, cyclesBeforeLongBreak: Math.max(2, settings.cyclesBeforeLongBreak - 1)})}>
                    <FontAwesomeIcon icon={faMinus} />
                  </button>
                  <span>{settings.cyclesBeforeLongBreak}</span>
                  <button onClick={() => updateSettings({...settings, cyclesBeforeLongBreak: settings.cyclesBeforeLongBreak + 1})}>
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </div>
              </div>

              <div className="setting-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={settings.autoStartBreaks}
                    onChange={e => updateSettings({...settings, autoStartBreaks: e.target.checked})}
                  />
                  Tự động bắt đầu nghỉ
                </label>
              </div>

              <div className="setting-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={settings.autoStartWork}
                    onChange={e => updateSettings({...settings, autoStartWork: e.target.checked})}
                  />
                  Tự động bắt đầu làm việc
                </label>
              </div>

              <div className="setting-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={settings.soundEnabled}
                    onChange={e => updateSettings({...settings, soundEnabled: e.target.checked})}
                  />
                  <FontAwesomeIcon icon={settings.soundEnabled ? faVolumeUp : faVolumeOff} />
                  Âm thanh thông báo
                </label>
              </div>

              <div className="setting-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={settings.notificationsEnabled}
                    onChange={e => updateSettings({...settings, notificationsEnabled: e.target.checked})}
                  />
                  <FontAwesomeIcon icon={faBell} />
                  Thông báo desktop
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {showStats && (
        <div className="modal-overlay" onClick={() => setShowStats(false)}>
          <div className="modal large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Thống kê học tập</h3>
              <button className="close-btn" onClick={() => setShowStats(false)}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="stats-grid">
                <div className="stat-box">
                  <FontAwesomeIcon icon={faCalendarAlt} className="stat-box-icon" />
                  <div className="stat-box-value">{dailyStats.streak}</div>
                  <div className="stat-box-label">Ngày liên tiếp</div>
                </div>
                
                <div className="stat-box">
                  <FontAwesomeIcon icon={faTrophy} className="stat-box-icon" />
                  <div className="stat-box-value">{dailyStats.totalCycles}</div>
                  <div className="stat-box-label">Chu kỳ hôm nay</div>
                </div>
                
                <div className="stat-box">
                  <FontAwesomeIcon icon={faBookOpen} className="stat-box-icon" />
                  <div className="stat-box-value">{dailyStats.tasksCompleted}</div>
                  <div className="stat-box-label">Nhiệm vụ hoàn thành</div>
                </div>
                
                <div className="stat-box">
                  <FontAwesomeIcon icon={faGraduationCap} className="stat-box-icon" />
                  <div className="stat-box-value">{Math.floor(totalWorkTime / 60)}h {totalWorkTime % 60}m</div>
                  <div className="stat-box-label">Tổng thời gian học</div>
                </div>
              </div>

              <div className="achievement-section">
                <h4>Thành tích gần đây</h4>
                <div className="achievements">
                  <div className="achievement">🔥 Streak 5 ngày</div>
                  <div className="achievement">🎯 Hoàn thành 50 chu kỳ</div>
                  <div className="achievement">⏰ Học 3 giờ trong ngày</div>
                  <div className="achievement">📚 Hoàn thành 10 nhiệm vụ</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyTimer;
