import React, { useState, useEffect } from 'react';
import './style.css';

const Settings = () => {
  const [settings, setSettings] = useState({
    // General Settings
    language: 'vi',
    theme: 'light',
    notifications: true,
    soundEffects: true,
    
    // Study Settings
    studyReminder: true,
    reminderTime: '19:00',
    dailyGoal: 30,
    weeklyGoal: 200,
    
    // Interface Settings
    fontSize: 'medium',
    autoplay: true,
    showHints: true,
    animationsEnabled: true,
    
    // Privacy Settings
    profileVisibility: 'public',
    showProgress: true,
    allowFriendRequests: true,
    
    // Audio Settings
    volume: 80,
    playbackSpeed: 1,
    subtitles: true
  });

  const [activeTab, setActiveTab] = useState('general');
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('toeicSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = () => {
    localStorage.setItem('toeicSettings', JSON.stringify(settings));
    setSaveStatus('✅ Đã lưu thành công!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const resetSettings = () => {
    if (window.confirm('Bạn có chắc muốn khôi phục cài đặt mặc định?')) {
      const defaultSettings = {
        language: 'vi',
        theme: 'light',
        notifications: true,
        soundEffects: true,
        studyReminder: true,
        reminderTime: '19:00',
        dailyGoal: 30,
        weeklyGoal: 200,
        fontSize: 'medium',
        autoplay: true,
        showHints: true,
        animationsEnabled: true,
        profileVisibility: 'public',
        showProgress: true,
        allowFriendRequests: true,
        volume: 80,
        playbackSpeed: 1,
        subtitles: true
      };
      setSettings(defaultSettings);
    }
  };

  const renderGeneralSettings = () => (
    <div className="settings-section">
      <h3>🌐 Cài đặt chung</h3>
      
      <div className="setting-item">
        <label>Ngôn ngữ giao diện:</label>
        <select 
          value={settings.language} 
          onChange={(e) => updateSetting('language', e.target.value)}
        >
          <option value="vi">Tiếng Việt</option>
          <option value="en">English</option>
        </select>
      </div>

      <div className="setting-item">
        <label>Giao diện:</label>
        <select 
          value={settings.theme} 
          onChange={(e) => updateSetting('theme', e.target.value)}
        >
          <option value="light">Sáng</option>
          <option value="dark">Tối</option>
          <option value="auto">Tự động</option>
        </select>
      </div>

      <div className="setting-item">
        <label>Cỡ chữ:</label>
        <select 
          value={settings.fontSize} 
          onChange={(e) => updateSetting('fontSize', e.target.value)}
        >
          <option value="small">Nhỏ</option>
          <option value="medium">Vừa</option>
          <option value="large">Lớn</option>
        </select>
      </div>

      <div className="setting-item">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.notifications}
            onChange={(e) => updateSetting('notifications', e.target.checked)}
          />
          Bật thông báo
        </label>
      </div>

      <div className="setting-item">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.soundEffects}
            onChange={(e) => updateSetting('soundEffects', e.target.checked)}
          />
          Hiệu ứng âm thanh
        </label>
      </div>

      <div className="setting-item">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.animationsEnabled}
            onChange={(e) => updateSetting('animationsEnabled', e.target.checked)}
          />
          Hiệu ứng chuyển động
        </label>
      </div>
    </div>
  );

  const renderStudySettings = () => (
    <div className="settings-section">
      <h3>📚 Cài đặt học tập</h3>
      
      <div className="setting-item">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.studyReminder}
            onChange={(e) => updateSetting('studyReminder', e.target.checked)}
          />
          Nhắc nhở học tập hàng ngày
        </label>
      </div>

      <div className="setting-item">
        <label>Thời gian nhắc nhở:</label>
        <input
          type="time"
          value={settings.reminderTime}
          onChange={(e) => updateSetting('reminderTime', e.target.value)}
          disabled={!settings.studyReminder}
        />
      </div>

      <div className="setting-item">
        <label>Mục tiêu học tập hàng ngày (phút):</label>
        <input
          type="number"
          min="5"
          max="300"
          value={settings.dailyGoal}
          onChange={(e) => updateSetting('dailyGoal', parseInt(e.target.value))}
        />
      </div>

      <div className="setting-item">
        <label>Mục tiêu học tập hàng tuần (phút):</label>
        <input
          type="number"
          min="30"
          max="2000"
          value={settings.weeklyGoal}
          onChange={(e) => updateSetting('weeklyGoal', parseInt(e.target.value))}
        />
      </div>

      <div className="setting-item">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.autoplay}
            onChange={(e) => updateSetting('autoplay', e.target.checked)}
          />
          Tự động phát bài tiếp theo
        </label>
      </div>

      <div className="setting-item">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.showHints}
            onChange={(e) => updateSetting('showHints', e.target.checked)}
          />
          Hiển thị gợi ý trong bài tập
        </label>
      </div>
    </div>
  );

  const renderAudioSettings = () => (
    <div className="settings-section">
      <h3>🎧 Cài đặt âm thanh</h3>
      
      <div className="setting-item">
        <label>Âm lượng: {settings.volume}%</label>
        <input
          type="range"
          min="0"
          max="100"
          value={settings.volume}
          onChange={(e) => updateSetting('volume', parseInt(e.target.value))}
          className="slider"
        />
      </div>

      <div className="setting-item">
        <label>Tốc độ phát mặc định:</label>
        <select 
          value={settings.playbackSpeed} 
          onChange={(e) => updateSetting('playbackSpeed', parseFloat(e.target.value))}
        >
          <option value={0.5}>0.5x</option>
          <option value={0.75}>0.75x</option>
          <option value={1}>1x (Bình thường)</option>
          <option value={1.25}>1.25x</option>
          <option value={1.5}>1.5x</option>
        </select>
      </div>

      <div className="setting-item">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.subtitles}
            onChange={(e) => updateSetting('subtitles', e.target.checked)}
          />
          Hiển thị phụ đề mặc định
        </label>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="settings-section">
      <h3>🔒 Cài đặt riêng tư</h3>
      
      <div className="setting-item">
        <label>Hiển thị hồ sơ:</label>
        <select 
          value={settings.profileVisibility} 
          onChange={(e) => updateSetting('profileVisibility', e.target.value)}
        >
          <option value="public">Công khai</option>
          <option value="friends">Chỉ bạn bè</option>
          <option value="private">Riêng tư</option>
        </select>
      </div>

      <div className="setting-item">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.showProgress}
            onChange={(e) => updateSetting('showProgress', e.target.checked)}
          />
          Hiển thị tiến độ học tập
        </label>
      </div>

      <div className="setting-item">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.allowFriendRequests}
            onChange={(e) => updateSetting('allowFriendRequests', e.target.checked)}
          />
          Cho phép lời mời kết bạn
        </label>
      </div>
    </div>
  );

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>⚙️ Cài đặt</h1>
        <p>Tùy chỉnh trải nghiệm học tập theo sở thích cá nhân của bạn</p>
      </div>

      <div className="settings-content">
        <div className="settings-tabs">
          <button 
            className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            🌐 Chung
          </button>
          <button 
            className={`tab-btn ${activeTab === 'study' ? 'active' : ''}`}
            onClick={() => setActiveTab('study')}
          >
            📚 Học tập
          </button>
          <button 
            className={`tab-btn ${activeTab === 'audio' ? 'active' : ''}`}
            onClick={() => setActiveTab('audio')}
          >
            🎧 Âm thanh
          </button>
          <button 
            className={`tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            🔒 Riêng tư
          </button>
        </div>

        <div className="settings-body">
          {activeTab === 'general' && renderGeneralSettings()}
          {activeTab === 'study' && renderStudySettings()}
          {activeTab === 'audio' && renderAudioSettings()}
          {activeTab === 'privacy' && renderPrivacySettings()}
        </div>

        <div className="settings-actions">
          <button className="btn-reset" onClick={resetSettings}>
            🔄 Khôi phục mặc định
          </button>
          <button className="btn-save" onClick={saveSettings}>
            💾 Lưu cài đặt
          </button>
        </div>

        {saveStatus && (
          <div className="save-status">
            {saveStatus}
          </div>
        )}
      </div>

      <div className="settings-info">
        <div className="info-card">
          <h4>💡 Mẹo</h4>
          <ul>
            <li>Bật nhắc nhở để duy trì thói quen học tập</li>
            <li>Điều chỉnh âm lượng phù hợp với môi trường học</li>
            <li>Thay đổi cỡ chữ để đọc dễ dàng hơn</li>
            <li>Tắt hiệu ứng nếu thiết bị chạy chậm</li>
          </ul>
        </div>

        <div className="info-card">
          <h4>🔐 Bảo mật</h4>
          <p>
            Tất cả cài đặt được lưu trữ cục bộ trên thiết bị của bạn. 
            Chúng tôi không thu thập hay chia sẻ thông tin cá nhân.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
