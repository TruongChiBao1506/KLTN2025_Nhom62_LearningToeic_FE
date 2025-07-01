import React, { useState, useEffect, useRef } from "react";
import "./style.css";

const AudioTrainer = () => {
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState("beginner");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [audioList, setAudioList] = useState([]);
  const [currentSubtitle, setCurrentSubtitle] = useState("");
  const [statistics, setStatistics] = useState({
    totalListened: 0,
    totalTime: 0,
    streakDays: 0,
    completedLessons: 0,
  });

  const audioRef = useRef(null);

  // Mock data for audio lessons
  useEffect(() => {
    const mockAudioLessons = [
      {
        id: 1,
        title: "Business Phone Calls",
        category: "business",
        level: "intermediate",
        duration: 180,
        audioUrl: "/audio/business-calls.mp3",
        description: "Practice listening to professional phone conversations",
        subtitles: [
          {
            start: 0,
            end: 5,
            text: "Good morning, ABC Company, how may I help you?",
          },
          {
            start: 5,
            end: 10,
            text: "I'd like to speak with Mr. Johnson, please.",
          },
          {
            start: 10,
            end: 15,
            text: "I'm sorry, he's in a meeting right now.",
          },
        ],
        difficulty: 6,
      },
      {
        id: 2,
        title: "Airport Announcements",
        category: "travel",
        level: "beginner",
        duration: 120,
        audioUrl: "/audio/airport.mp3",
        description:
          "Understanding airport announcements and travel information",
        subtitles: [
          {
            start: 0,
            end: 4,
            text: "Attention passengers on flight 245 to New York.",
          },
          {
            start: 4,
            end: 8,
            text: "Your flight has been delayed by 30 minutes.",
          },
          { start: 8, end: 12, text: "Please wait in the departure lounge." },
        ],
        difficulty: 3,
      },
      {
        id: 3,
        title: "Restaurant Conversations",
        category: "daily",
        level: "beginner",
        duration: 150,
        audioUrl: "/audio/restaurant.mp3",
        description: "Common phrases used in restaurants and ordering food",
        subtitles: [
          { start: 0, end: 3, text: "Welcome to our restaurant!" },
          { start: 3, end: 7, text: "Table for two, please." },
          { start: 7, end: 11, text: "Right this way, please follow me." },
        ],
        difficulty: 2,
      },
      {
        id: 4,
        title: "News Report - Technology",
        category: "news",
        level: "advanced",
        duration: 240,
        audioUrl: "/audio/tech-news.mp3",
        description: "Technology news report with advanced vocabulary",
        subtitles: [
          {
            start: 0,
            end: 6,
            text: "Scientists have developed a new artificial intelligence system.",
          },
          {
            start: 6,
            end: 12,
            text: "This breakthrough could revolutionize the healthcare industry.",
          },
          {
            start: 12,
            end: 18,
            text: "The technology uses machine learning algorithms.",
          },
        ],
        difficulty: 9,
      },
      {
        id: 5,
        title: "University Lecture - Part 1",
        category: "academic",
        level: "advanced",
        duration: 300,
        audioUrl: "/audio/lecture.mp3",
        description: "Academic lecture about environmental science",
        subtitles: [
          {
            start: 0,
            end: 8,
            text: "Today we'll discuss the impact of climate change on ecosystems.",
          },
          {
            start: 8,
            end: 16,
            text: "Global warming affects biodiversity in various ways.",
          },
          {
            start: 16,
            end: 24,
            text: "Let's examine some specific examples from recent studies.",
          },
        ],
        difficulty: 10,
      },
    ];
    setAudioList(mockAudioLessons);
    setStatistics({
      totalListened: 25,
      totalTime: 1250,
      streakDays: 7,
      completedLessons: 12,
    });
  }, []);

  const filteredAudio = audioList.filter((audio) => {
    const levelMatch = selectedLevel === "all" || audio.level === selectedLevel;
    const categoryMatch =
      selectedCategory === "all" || audio.category === selectedCategory;
    return levelMatch && categoryMatch;
  });

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const playAudio = (audio) => {
    setCurrentAudio(audio);
    if (audioRef.current) {
      audioRef.current.src = audio.audioUrl;
      audioRef.current.load();
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);

      // Update current subtitle
      if (currentAudio && showSubtitles) {
        const currentSub = currentAudio.subtitles.find(
          (sub) =>
            audioRef.current.currentTime >= sub.start &&
            audioRef.current.currentTime <= sub.end
        );
        setCurrentSubtitle(currentSub ? currentSub.text : "");
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const seekTo = (percentage) => {
    if (audioRef.current && duration > 0) {
      const newTime = (percentage / 100) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const skipTime = (seconds) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        0,
        Math.min(duration, currentTime + seconds)
      );
    }
  };

  const getDifficultyColor = (difficulty) => {
    if (difficulty <= 3) return "#4CAF50";
    if (difficulty <= 6) return "#FF9800";
    return "#F44336";
  };

  const getDifficultyLabel = (difficulty) => {
    if (difficulty <= 3) return "Dễ";
    if (difficulty <= 6) return "Trung bình";
    return "Khó";
  };

  return (
    <div className="audio-trainer-container">
      <div className="audio-trainer-header">
        <h1>🎧 Luyện nghe TOEIC</h1>
        <p>
          Cải thiện kỹ năng nghe với các bài luyện tập đa dạng và công cụ hỗ trợ
          hiện đại
        </p>
      </div>

      <div className="audio-trainer-content">
        <div className="audio-player-section">
          {currentAudio ? (
            <div className="audio-player">
              <div className="audio-info">
                <h3>{currentAudio.title}</h3>
                <p className="audio-description">{currentAudio.description}</p>
                <div className="audio-meta">
                  <span className="category">{currentAudio.category}</span>
                  <span className="level">{currentAudio.level}</span>
                  <span
                    className="difficulty"
                    style={{
                      backgroundColor: getDifficultyColor(
                        currentAudio.difficulty
                      ),
                    }}
                  >
                    {getDifficultyLabel(currentAudio.difficulty)} (
                    {currentAudio.difficulty}/10)
                  </span>
                </div>
              </div>

              <div className="audio-controls">
                <div className="main-controls">
                  <button
                    className="control-btn skip"
                    onClick={() => skipTime(-10)}
                  >
                    ⏪ 10s
                  </button>

                  <button
                    className="control-btn play-pause"
                    onClick={togglePlayPause}
                  >
                    {isPlaying ? "⏸️" : "▶️"}
                  </button>

                  <button
                    className="control-btn skip"
                    onClick={() => skipTime(10)}
                  >
                    10s ⏩
                  </button>
                </div>

                <div className="progress-section">
                  <span className="time">{formatTime(currentTime)}</span>
                  <div
                    className="progress-bar"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const percentage =
                        ((e.clientX - rect.left) / rect.width) * 100;
                      seekTo(percentage);
                    }}
                  >
                    <div
                      className="progress-fill"
                      style={{
                        width: `${
                          duration > 0 ? (currentTime / duration) * 100 : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="time">{formatTime(duration)}</span>
                </div>

                <div className="speed-controls">
                  <label>Tốc độ:</label>
                  {[0.5, 0.75, 1, 1.25, 1.5].map((speed) => (
                    <button
                      key={speed}
                      className={`speed-btn ${
                        playbackSpeed === speed ? "active" : ""
                      }`}
                      onClick={() => handleSpeedChange(speed)}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>

                <div className="subtitle-controls">
                  <label>
                    <input
                      type="checkbox"
                      checked={showSubtitles}
                      onChange={(e) => setShowSubtitles(e.target.checked)}
                    />
                    Hiển thị phụ đề
                  </label>
                </div>
              </div>

              {showSubtitles && (
                <div className="subtitle-display">
                  <p>{currentSubtitle || "Đang chờ âm thanh..."}</p>
                </div>
              )}

              <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            </div>
          ) : (
            <div className="no-audio-selected">
              <div className="placeholder">
                <h3>🎧 Chọn bài nghe để bắt đầu</h3>
                <p>Hãy chọn một bài luyện nghe từ danh sách bên cạnh</p>
              </div>
            </div>
          )}
        </div>

        <div className="audio-list-section">
          <div className="filters">
            <div className="filter-group">
              <label>Cấp độ:</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="beginner">Cơ bản</option>
                <option value="intermediate">Trung cấp</option>
                <option value="advanced">Nâng cao</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Thể loại:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="business">Kinh doanh</option>
                <option value="travel">Du lịch</option>
                <option value="daily">Hàng ngày</option>
                <option value="news">Tin tức</option>
                <option value="academic">Học thuật</option>
              </select>
            </div>
          </div>

          <div className="audio-list">
            <h3>📚 Danh sách bài nghe ({filteredAudio.length})</h3>
            {filteredAudio.map((audio) => (
              <div
                key={audio.id}
                className={`audio-item ${
                  currentAudio?.id === audio.id ? "active" : ""
                }`}
                onClick={() => playAudio(audio)}
              >
                <div className="audio-item-info">
                  <h4>{audio.title}</h4>
                  <p>{audio.description}</p>
                  <div className="audio-item-meta">
                    <span className="duration">
                      {formatTime(audio.duration)}
                    </span>
                    <span className="category">{audio.category}</span>
                    <span
                      className="difficulty-badge"
                      style={{
                        backgroundColor: getDifficultyColor(audio.difficulty),
                      }}
                    >
                      {getDifficultyLabel(audio.difficulty)}
                    </span>
                  </div>
                </div>
                <button className="play-btn">
                  {currentAudio?.id === audio.id && isPlaying ? "⏸️" : "▶️"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="statistics-section">
        <h3>📊 Thống kê luyện nghe</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-number">{statistics.totalListened}</span>
            <span className="stat-label">Bài đã nghe</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {Math.floor(statistics.totalTime / 60)}
            </span>
            <span className="stat-label">Phút luyện nghe</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{statistics.streakDays}</span>
            <span className="stat-label">Ngày liên tiếp</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{statistics.completedLessons}</span>
            <span className="stat-label">Bài hoàn thành</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioTrainer;
