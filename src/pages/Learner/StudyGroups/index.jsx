import React, { useState, useEffect } from "react";
import "./style.css";

const StudyGroups = () => {
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    level: "beginner",
    maxMembers: 10,
    isPrivate: false,
    password: "",
  });

  useEffect(() => {
    const mockGroups = [
      {
        id: 1,
        name: "TOEIC 900+ Club",
        description: "Nhóm dành cho những người muốn đạt điểm cao trong TOEIC",
        level: "advanced",
        members: 25,
        maxMembers: 30,
        isPrivate: false,
        admin: "Nguyễn Văn A",
        created: new Date("2024-01-15"),
        tags: ["listening", "reading", "advanced"],
        avatar: "https://via.placeholder.com/60x60/4CAF50/white?text=900+",
        lastActivity: new Date("2024-12-10"),
        isActive: true,
      },
      {
        id: 2,
        name: "Beginner Study Circle",
        description: "Nhóm hỗ trợ người mới bắt đầu học TOEIC",
        level: "beginner",
        members: 15,
        maxMembers: 20,
        isPrivate: false,
        admin: "Trần Thị B",
        created: new Date("2024-02-01"),
        tags: ["beginner", "basics", "vocabulary"],
        avatar: "https://via.placeholder.com/60x60/2196F3/white?text=BEG",
        lastActivity: new Date("2024-12-11"),
        isActive: true,
      },
      {
        id: 3,
        name: "Business English Masters",
        description: "Tập trung vào Business English và TOEIC Part 7",
        level: "intermediate",
        members: 18,
        maxMembers: 25,
        isPrivate: true,
        admin: "Lê Văn C",
        created: new Date("2024-03-10"),
        tags: ["business", "reading", "part7"],
        avatar: "https://via.placeholder.com/60x60/FF9800/white?text=BIZ",
        lastActivity: new Date("2024-12-09"),
        isActive: true,
      },
      {
        id: 4,
        name: "Listening Champions",
        description: "Chuyên luyện kỹ năng nghe với các bài tập thực tế",
        level: "intermediate",
        members: 22,
        maxMembers: 30,
        isPrivate: false,
        admin: "Phạm Thị D",
        created: new Date("2024-04-05"),
        tags: ["listening", "part1", "part2", "part3", "part4"],
        avatar: "https://via.placeholder.com/60x60/9C27B0/white?text=HEAR",
        lastActivity: new Date("2024-12-11"),
        isActive: true,
      },
      {
        id: 5,
        name: "Grammar Warriors",
        description: "Chinh phục ngữ pháp TOEIC một cách có hệ thống",
        level: "beginner",
        members: 12,
        maxMembers: 15,
        isPrivate: false,
        admin: "Hoàng Văn E",
        created: new Date("2024-05-20"),
        tags: ["grammar", "part5", "part6"],
        avatar: "https://via.placeholder.com/60x60/F44336/white?text=GRAM",
        lastActivity: new Date("2024-12-08"),
        isActive: true,
      },
      {
        id: 6,
        name: "Speed Reading Squad",
        description: "Nhóm luyện đọc nhanh và hiểu sâu cho TOEIC Reading",
        level: "advanced",
        members: 8,
        maxMembers: 12,
        isPrivate: true,
        admin: "Ngô Thị F",
        created: new Date("2024-06-15"),
        tags: ["reading", "speed", "comprehension"],
        avatar: "https://via.placeholder.com/60x60/795548/white?text=FAST",
        lastActivity: new Date("2024-12-07"),
        isActive: false,
      },
    ];

    setGroups(mockGroups);
    setMyGroups([1, 2]); // User is member of groups 1 and 2
  }, []);

  const filteredGroups = groups.filter((group) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "my" && myGroups.includes(group.id)) ||
      (activeTab === "public" && !group.isPrivate) ||
      (activeTab === "private" && group.isPrivate);

    const matchesSearch =
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLevel =
      selectedLevel === "all" || group.level === selectedLevel;

    return matchesTab && matchesSearch && matchesLevel;
  });

  const joinGroup = (groupId) => {
    const group = groups.find((g) => g.id === groupId);
    if (group.isPrivate) {
      setSelectedGroup(group);
      setShowJoinModal(true);
    } else {
      setMyGroups((prev) => [...prev, groupId]);
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId ? { ...g, members: g.members + 1 } : g
        )
      );
    }
  };

  const leaveGroup = (groupId) => {
    setMyGroups((prev) => prev.filter((id) => id !== groupId));
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, members: Math.max(0, g.members - 1) } : g
      )
    );
  };

  const createGroup = () => {
    const group = {
      id: Date.now(),
      ...newGroup,
      members: 1,
      admin: "Bạn",
      created: new Date(),
      tags: [],
      avatar: `https://via.placeholder.com/60x60/607D8B/white?text=${newGroup.name
        .slice(0, 3)
        .toUpperCase()}`,
      lastActivity: new Date(),
      isActive: true,
    };

    setGroups((prev) => [group, ...prev]);
    setMyGroups((prev) => [group.id, ...prev]);
    setShowCreateModal(false);
    setNewGroup({
      name: "",
      description: "",
      level: "beginner",
      maxMembers: 10,
      isPrivate: false,
      password: "",
    });
  };

  const joinPrivateGroup = (password) => {
    if (selectedGroup) {
      // In real app, validate password here
      setMyGroups((prev) => [...prev, selectedGroup.id]);
      setGroups((prev) =>
        prev.map((g) =>
          g.id === selectedGroup.id ? { ...g, members: g.members + 1 } : g
        )
      );
      setShowJoinModal(false);
      setSelectedGroup(null);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getLevelColor = (level) => {
    const colors = {
      beginner: "#4CAF50",
      intermediate: "#FF9800",
      advanced: "#F44336",
    };
    return colors[level] || "#666";
  };

  const getLevelText = (level) => {
    const texts = {
      beginner: "Cơ bản",
      intermediate: "Trung cấp",
      advanced: "Nâng cao",
    };
    return texts[level] || level;
  };

  return (
    <div className="study-groups-container">
      <div className="study-groups-header">
        <h1>👥 Nhóm học tập</h1>
        <p>
          Kết nối với các học viên khác và cùng nhau tiến bộ trong việc học
          TOEIC!
        </p>
      </div>

      <div className="study-groups-controls">
        <div className="tabs-section">
          <button
            className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            📋 Tất cả ({groups.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "my" ? "active" : ""}`}
            onClick={() => setActiveTab("my")}
          >
            👤 Nhóm của tôi ({myGroups.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "public" ? "active" : ""}`}
            onClick={() => setActiveTab("public")}
          >
            🌍 Công khai
          </button>
          <button
            className={`tab-btn ${activeTab === "private" ? "active" : ""}`}
            onClick={() => setActiveTab("private")}
          >
            🔒 Riêng tư
          </button>
        </div>

        <div className="controls-section">
          <div className="search-controls">
            <input
              type="text"
              placeholder="Tìm kiếm nhóm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />

            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="level-filter"
            >
              <option value="all">Tất cả cấp độ</option>
              <option value="beginner">Cơ bản</option>
              <option value="intermediate">Trung cấp</option>
              <option value="advanced">Nâng cao</option>
            </select>
          </div>

          <button
            className="create-group-btn"
            onClick={() => setShowCreateModal(true)}
          >
            ➕ Tạo nhóm mới
          </button>
        </div>
      </div>

      <div className="study-groups-content">
        <div className="groups-grid">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className={`group-card ${!group.isActive ? "inactive" : ""}`}
            >
              <div className="group-header">
                <div className="group-avatar">
                  <img src={group.avatar} alt={group.name} />
                  {group.isPrivate && (
                    <div className="private-indicator">🔒</div>
                  )}
                </div>
                <div className="group-info">
                  <h3>{group.name}</h3>
                  <p>{group.description}</p>
                </div>
              </div>

              <div className="group-meta">
                <div className="meta-item">
                  <span className="meta-label">Cấp độ:</span>
                  <span
                    className="level-badge"
                    style={{ backgroundColor: getLevelColor(group.level) }}
                  >
                    {getLevelText(group.level)}
                  </span>
                </div>

                <div className="meta-item">
                  <span className="meta-label">Thành viên:</span>
                  <span className="member-count">
                    {group.members}/{group.maxMembers}
                  </span>
                </div>

                <div className="meta-item">
                  <span className="meta-label">Quản trị:</span>
                  <span className="admin-name">{group.admin}</span>
                </div>

                <div className="meta-item">
                  <span className="meta-label">Hoạt động:</span>
                  <span className="last-activity">
                    {formatDate(group.lastActivity)}
                  </span>
                </div>
              </div>

              {group.tags.length > 0 && (
                <div className="group-tags">
                  {group.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="group-actions">
                {myGroups.includes(group.id) ? (
                  <>
                    <button className="btn-view">💬 Xem nhóm</button>
                    <button
                      className="btn-leave"
                      onClick={() => leaveGroup(group.id)}
                    >
                      🚪 Rời nhóm
                    </button>
                  </>
                ) : (
                  <button
                    className="btn-join"
                    onClick={() => joinGroup(group.id)}
                    disabled={group.members >= group.maxMembers}
                  >
                    {group.members >= group.maxMembers
                      ? "👥 Đã đầy"
                      : group.isPrivate
                      ? "🔑 Yêu cầu tham gia"
                      : "➕ Tham gia"}
                  </button>
                )}
              </div>

              {!group.isActive && (
                <div className="inactive-overlay">
                  <span>Nhóm không hoạt động</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredGroups.length === 0 && (
          <div className="no-groups">
            <h3>Không tìm thấy nhóm nào</h3>
            <p>Thử thay đổi bộ lọc hoặc tạo nhóm mới!</p>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ Tạo nhóm học tập mới</h2>
              <button
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Tên nhóm:</label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) =>
                    setNewGroup((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="VD: TOEIC 800+ Challenge"
                />
              </div>

              <div className="form-group">
                <label>Mô tả:</label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) =>
                    setNewGroup((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Mô tả mục tiêu và hoạt động của nhóm..."
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Cấp độ:</label>
                  <select
                    value={newGroup.level}
                    onChange={(e) =>
                      setNewGroup((prev) => ({
                        ...prev,
                        level: e.target.value,
                      }))
                    }
                  >
                    <option value="beginner">Cơ bản</option>
                    <option value="intermediate">Trung cấp</option>
                    <option value="advanced">Nâng cao</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Số thành viên tối đa:</label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={newGroup.maxMembers}
                    onChange={(e) =>
                      setNewGroup((prev) => ({
                        ...prev,
                        maxMembers: parseInt(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newGroup.isPrivate}
                    onChange={(e) =>
                      setNewGroup((prev) => ({
                        ...prev,
                        isPrivate: e.target.checked,
                      }))
                    }
                  />
                  Nhóm riêng tư (cần mật khẩu để tham gia)
                </label>
              </div>

              {newGroup.isPrivate && (
                <div className="form-group">
                  <label>Mật khẩu nhóm:</label>
                  <input
                    type="password"
                    value={newGroup.password}
                    onChange={(e) =>
                      setNewGroup((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    placeholder="Nhập mật khẩu cho nhóm riêng tư"
                  />
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowCreateModal(false)}
              >
                Hủy
              </button>
              <button
                className="btn-create"
                onClick={createGroup}
                disabled={!newGroup.name.trim() || !newGroup.description.trim()}
              >
                Tạo nhóm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Private Group Modal */}
      {showJoinModal && selectedGroup && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🔑 Tham gia nhóm riêng tư</h2>
              <button
                className="modal-close"
                onClick={() => setShowJoinModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="group-info-modal">
                <h3>{selectedGroup.name}</h3>
                <p>{selectedGroup.description}</p>
              </div>

              <div className="form-group">
                <label>Mật khẩu nhóm:</label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu để tham gia nhóm"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      joinPrivateGroup(e.target.value);
                    }
                  }}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowJoinModal(false)}
              >
                Hủy
              </button>
              <button
                className="btn-join"
                onClick={() => {
                  const password = document.querySelector(
                    'input[type="password"]'
                  ).value;
                  joinPrivateGroup(password);
                }}
              >
                Tham gia
              </button>
            </div>
          </div>
        </div>
      )}

      {/* My Groups Summary */}
      <div className="my-groups-summary">
        <h3>📊 Thống kê nhóm của tôi</h3>
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-number">{myGroups.length}</span>
            <span className="stat-label">Nhóm đã tham gia</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {
                groups.filter((g) => myGroups.includes(g.id) && g.isActive)
                  .length
              }
            </span>
            <span className="stat-label">Nhóm hoạt động</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {groups
                .filter((g) => myGroups.includes(g.id))
                .reduce((sum, g) => sum + g.members, 0)}
            </span>
            <span className="stat-label">Tổng thành viên</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyGroups;
