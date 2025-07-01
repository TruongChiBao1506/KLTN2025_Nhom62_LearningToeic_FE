import React, { useState, useEffect, useCallback } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faFileAlt,
  faBook,
  faChartLine,
  faUser,
  faSignOutAlt,
  faBell,
  faSearch,
  faBars,
  faTimes,
  faLanguage,
  faBookOpen,
  faStickyNote,
  faGraduationCap,
  faClipboardList,
  faNewspaper,
  faRocket,
  faMoon,
  faSun,
  faTrophy,
  faFire,
  faForward,
  faClock,
  faCreditCard,
  faLayerGroup,
  faPen,
  faFlask,
  faHeart,
  faGift,
  faStar,
  faCalendarAlt,
  faVideoCamera,
  faHeadphones,
  faLightbulb,
  faGlobe,
  faCog,
  faGamepad,
  faQuestion,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { toast } from "react-toastify";
import authService from "../services/authService";

import "./LearnerLayout.css";

const LearnerLayout = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedMenus, setExpandedMenus] = useState({
    exams: false,
    learning: false,
    vocabulary: false,
    practice: false,
    tools: false,
    community: false,
  });
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [studyStreak, setStudyStreak] = useState(
    parseInt(localStorage.getItem("studyStreak") || "0")
  );
  const [todayStudyTime, setTodayStudyTime] = useState(0);
  const user = useSelector((state) => state?.auth?.user);

  // Toggle submenu function
  const toggleSubMenu = (menuKey) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Toggle dark mode
  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
    document.documentElement.setAttribute(
      "data-theme",
      newDarkMode ? "dark" : "light"
    );
    toast.success(
      `Đã chuyển sang ${newDarkMode ? "chế độ tối" : "chế độ sáng"}`
    );
  };

  // Update study progress
  const updateStudyProgress = () => {
    const today = new Date().toDateString();
    const lastStudyDate = localStorage.getItem("lastStudyDate");
    const currentStreak = parseInt(localStorage.getItem("studyStreak") || "0");

    if (lastStudyDate === today) {
      setTodayStudyTime((prev) => prev + 5);
      localStorage.setItem("todayStudyTime", (todayStudyTime + 5).toString());
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastStudyDate === yesterday.toDateString()) {
        setStudyStreak(currentStreak + 1);
        localStorage.setItem("studyStreak", (currentStreak + 1).toString());
      } else {
        setStudyStreak(1);
        localStorage.setItem("studyStreak", "1");
      }

      localStorage.setItem("lastStudyDate", today);
      setTodayStudyTime(5);
      localStorage.setItem("todayStudyTime", "5");
    }

    toast.success(`🔥 Streak: ${studyStreak} ngày! Đã học thêm 5 phút!`);
  };

  // Check if the path starts with the given route
  const isActive = useCallback(
    (path) => {
      return (
        location.pathname === path || location.pathname.startsWith(`${path}/`)
      );
    },
    [location.pathname]
  );
  const handleLogout = async () => {
    try {
      // Sử dụng authService để đăng xuất
      await authService.signOut();

      // Xóa thông tin người học trong localStorage
      localStorage.removeItem("learnerToken");
      localStorage.removeItem("learnerRefreshToken");
      localStorage.removeItem("learnerAccessTokenExpirationTime");
      localStorage.removeItem("learnerRefreshTokenExpirationTime");
      localStorage.removeItem("LearnerAuthenticated");

      // Cập nhật Redux store nếu cần
      dispatch(logout());

      toast.success("Đăng xuất thành công!");

      // Chuyển hướng về trang đăng nhập
      window.location.href = "/signin";
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      toast.error("Đã xảy ra lỗi khi đăng xuất. Vui lòng thử lại.");
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    // Mark all as read if opening
    if (!showNotifications && notifications.some((n) => !n.read)) {
      // API call to mark notifications as read would go here
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search functionality would go here
    toast.info(`Đang tìm kiếm: ${searchQuery}`);
    setSearchQuery("");
  };

  // Fetch notifications on component mount
  useEffect(() => {
    // Set initial theme
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light"
    );

    // Auto-expand menu based on current route
    if (
      isActive("/learner/exams") ||
      isActive("/learner/full-test") ||
      isActive("/learner/mini-test") ||
      isActive("/learner/exam-question") ||
      isActive("/learner/exam-result")
    ) {
      setExpandedMenus((prev) => ({ ...prev, exams: true }));
    }
    if (
      isActive("/learner/materials") ||
      isActive("/learner/grammar") ||
      isActive("/learner/improve") ||
      isActive("/learner/section") ||
      isActive("/learner/lesson") ||
      isActive("/learner/study")
    ) {
      setExpandedMenus((prev) => ({ ...prev, learning: true }));
    }
    if (
      isActive("/learner/topics") ||
      isActive("/learner/vocabulary") ||
      isActive("/learner/dictionary") ||
      isActive("/learner/flashcards") ||
      isActive("/learner/quiz")
    ) {
      setExpandedMenus((prev) => ({ ...prev, vocabulary: true }));
    }
    if (
      isActive("/learner/notes") ||
      isActive("/learner/blog") ||
      isActive("/learner/practice-sw")
    ) {
      setExpandedMenus((prev) => ({ ...prev, practice: true }));
    }
    if (
      isActive("/learner/leaderboard") ||
      isActive("/learner/achievements") ||
      isActive("/learner/focus-mode") ||
      isActive("/learner/settings") ||
      isActive("/learner/progress") ||
      isActive("/learner/study-timer") ||
      isActive("/learner/audio-trainer")
    ) {
      setExpandedMenus((prev) => ({ ...prev, tools: true }));
    }
    if (
      isActive("/learner/events") ||
      isActive("/learner/study-groups") ||
      isActive("/learner/challenges") ||
      isActive("/learner/ai-tutor")
    ) {
      setExpandedMenus((prev) => ({ ...prev, community: true }));
    }

    // Load study progress
    const savedStreak = parseInt(localStorage.getItem("studyStreak") || "0");
    setStudyStreak(savedStreak);

    // Check if studied today
    const today = new Date().toDateString();
    const lastStudyDate = localStorage.getItem("lastStudyDate");
    if (lastStudyDate === today) {
      setTodayStudyTime(
        parseInt(localStorage.getItem("todayStudyTime") || "0")
      );
    }

    // Check if learner tokens exist in localStorage
    const learnerToken = localStorage.getItem("learnerToken");
    const learnerRefreshToken = localStorage.getItem("learnerRefreshToken");
    const learnerAuthenticated = localStorage.getItem("learnerAuthenticated");
    const accessTokenExpiration = localStorage.getItem(
      "learnerAccessTokenExpirationTime"
    );

    console.log("Token verification on layout mount:");
    console.log("learnerToken exists:", !!learnerToken);
    console.log("learnerRefreshToken exists:", !!learnerRefreshToken);
    console.log("learnerAuthenticated flag:", learnerAuthenticated);
    console.log(
      "Token expiration:",
      accessTokenExpiration
        ? new Date(parseInt(accessTokenExpiration)).toLocaleString()
        : "Not set"
    );

    // Check capitalization consistency for the authenticated flag
    const learnerAuthUppercase = localStorage.getItem("LearnerAuthenticated");
    if (learnerAuthUppercase !== null && learnerAuthenticated === null) {
      console.warn(
        "Warning: Authentication flag found as 'LearnerAuthenticated' (uppercase L) instead of 'learnerAuthenticated'"
      );
    }

    // Simulated API call for notifications
    const fetchNotifications = async () => {
      try {
        const dummyNotifications = [
          {
            id: 1,
            title: "🎉 Chúc mừng! Bạn đã đạt streak 7 ngày",
            message: "Tiếp tục duy trì thói quen học tập tuyệt vời này!",
            time: "5 phút trước",
            read: false,
          },
          {
            id: 2,
            title: "📚 Tài liệu mới",
            message: "Chúng tôi vừa thêm mới tài liệu TOEIC Part 7 Reading",
            time: "1 giờ trước",
            read: true,
          },
          {
            id: 3,
            title: "⏰ Nhắc nhở học tập",
            message: "Đã đến giờ ôn tập hàng ngày của bạn!",
            time: "3 giờ trước",
            read: true,
          },
        ];
        setNotifications(dummyNotifications);
      } catch (error) {
        console.error("Lỗi khi tải thông báo:", error);
      }
    };

    fetchNotifications();
  }, [isActive, darkMode]);
  return (
    <div className="learner-layout">
      {/* <CheckAccessToken /> */}
      {/* Mobile Menu Overlay */}
      <div
        className={`mobile-menu-overlay ${mobileMenuOpen ? "active" : ""}`}
        onClick={toggleMobileMenu}
      ></div>

      {/* Header */}
      <header className="learner-header">
        <div className="container">
          <div className="header-inner">
            <div className="logo-container">
              <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
                <FontAwesomeIcon icon={mobileMenuOpen ? faTimes : faBars} />
              </button>
              <Link to="/learner/dashboard" className="logo">
                TOEIC Learning
              </Link>
            </div>

            {/* Search Bar */}
            <div className="search-bar">
              <form onSubmit={handleSearch}>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm kiếm bài học, tài liệu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button className="btn btn-primary" type="submit">
                    <FontAwesomeIcon icon={faSearch} />
                  </button>
                </div>
              </form>
            </div>

            {/* User Actions */}
            <div className="user-actions">
              {/* Study Stats */}
              <div className="study-stats">
                <div
                  className="stat-item"
                  onClick={updateStudyProgress}
                  style={{ cursor: "pointer" }}
                  title="Click để cập nhật tiến độ"
                >
                  <FontAwesomeIcon icon={faFire} className="stat-icon streak" />
                  <span className="stat-value">{studyStreak}</span>
                  <span className="stat-label">Streak</span>
                </div>
                <div className="stat-item">
                  <FontAwesomeIcon icon={faClock} className="stat-icon time" />
                  <span className="stat-value">{todayStudyTime}</span>
                  <span className="stat-label">Phút</span>
                </div>
              </div>

              {/* Theme Toggle */}
              <button
                className="theme-toggle"
                onClick={toggleDarkMode}
                title="Chuyển đổi chế độ"
              >
                <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
              </button>

              {/* Notifications */}
              <div className="notification-container">
                <button
                  className={`notification-button ${
                    notifications.some((n) => !n.read) ? "has-new" : ""
                  }`}
                  onClick={toggleNotifications}
                >
                  <FontAwesomeIcon icon={faBell} />
                  {notifications.some((n) => !n.read) && (
                    <span className="notification-badge"></span>
                  )}
                </button>

                {/* Dropdown for Notifications */}
                {showNotifications && (
                  <div className="notification-dropdown">
                    <div className="notification-header">
                      <h6>Thông báo</h6>
                      <button className="btn btn-sm btn-link">
                        Đánh dấu đã đọc tất cả
                      </button>
                    </div>
                    <div className="notification-body">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`notification-item ${
                              !notification.read ? "unread" : ""
                            }`}
                          >
                            <div className="notification-content">
                              <h6 className="notification-title">
                                {notification.title}
                              </h6>
                              <p className="notification-message">
                                {notification.message}
                              </p>
                              <span className="notification-time">
                                {notification.time}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="no-notifications">
                          Không có thông báo nào
                        </p>
                      )}
                    </div>
                    <div className="notification-footer">
                      <Link
                        to="/learner/notifications"
                        onClick={() => setShowNotifications(false)}
                      >
                        Xem tất cả thông báo
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile */}
              <div className="user-profile-menu">
                <div className="user-avatar">
                  {user && user.avatar ? (
                    <img src={user.avatar} alt="Avatar" />
                  ) : (
                    <div className="default-avatar">
                      {user?.fullName?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
                <div className="user-dropdown">
                  <Link to="/learner/profile" className="dropdown-item">
                    <FontAwesomeIcon icon={faUser} className="me-2" />
                    Hồ sơ cá nhân
                  </Link>
                  <button className="dropdown-item" onClick={handleLogout}>
                    <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`learner-sidebar ${mobileMenuOpen ? "active" : ""}`}>
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {/* Dashboard */}
            <li className="nav-item">
              <Link
                to="/learner/dashboard"
                className={`nav-link ${
                  isActive("/learner/dashboard") ? "active" : ""
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <FontAwesomeIcon icon={faHouse} className="nav-icon" />
                <span className="nav-text">Trang chủ</span>
              </Link>
            </li>

            {/* Exams Section */}
            <li className="nav-item nav-category">
              <button
                className={`nav-link category-toggle ${
                  expandedMenus.exams ? "expanded" : ""
                }`}
                onClick={() => toggleSubMenu("exams")}
              >
                <FontAwesomeIcon icon={faFileAlt} className="nav-icon" />
                <span className="nav-text">Bài thi & Luyện tập</span>
                <FontAwesomeIcon icon={faLayerGroup} className="nav-arrow" />
              </button>
              <ul
                className={`nav-submenu ${
                  expandedMenus.exams ? "expanded" : ""
                }`}
              >
                <li>
                  <Link
                    to="/learner/exams"
                    className={isActive("/learner/exams") ? "active" : ""}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FontAwesomeIcon
                      icon={faClipboardList}
                      className="submenu-icon"
                    />
                    <span>Danh sách bài thi</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/learner/full-test"
                    className={isActive("/learner/full-test") ? "active" : ""}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FontAwesomeIcon
                      icon={faGraduationCap}
                      className="submenu-icon"
                    />
                    <span>Thi thử Full Test</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/learner/mini-test"
                    className={isActive("/learner/mini-test") ? "active" : ""}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FontAwesomeIcon icon={faRocket} className="submenu-icon" />
                    <span>Mini Test</span>
                  </Link>
                </li>
              </ul>
            </li>

            {/* Learning Materials Section */}
            <li className="nav-item nav-category">
              <button
                className={`nav-link category-toggle ${
                  expandedMenus.learning ? "expanded" : ""
                }`}
                onClick={() => toggleSubMenu("learning")}
              >
                <FontAwesomeIcon icon={faBook} className="nav-icon" />
                <span className="nav-text">Học tập</span>
                <FontAwesomeIcon icon={faLayerGroup} className="nav-arrow" />
              </button>
              <ul
                className={`nav-submenu ${
                  expandedMenus.learning ? "expanded" : ""
                }`}
              >
                <li>
                  <Link
                    to="/learner/materials"
                    className={isActive("/learner/materials") ? "active" : ""}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FontAwesomeIcon
                      icon={faBookOpen}
                      className="submenu-icon"
                    />
                    <span>Tài liệu học tập</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/learner/grammar"
                    className={isActive("/learner/grammar") ? "active" : ""}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FontAwesomeIcon
                      icon={faLanguage}
                      className="submenu-icon"
                    />
                    <span>Ngữ pháp</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/learner/improve"
                    className={isActive("/learner/improve") ? "active" : ""}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FontAwesomeIcon
                      icon={faForward}
                      className="submenu-icon"
                    />
                    <span>Cải thiện kỹ năng</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/learner/section"
                    className={isActive("/learner/section") ? "active" : ""}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FontAwesomeIcon
                      icon={faLayerGroup}
                      className="submenu-icon"
                    />
                    <span>Phần thi</span>
                  </Link>
                </li>
              </ul>
            </li>

            {/* Vocabulary Section */}
            <li className="nav-item nav-category">
              <button
                className={`nav-link category-toggle ${
                  expandedMenus.vocabulary ? "expanded" : ""
                }`}
                onClick={() => toggleSubMenu("vocabulary")}
              >
                <FontAwesomeIcon icon={faCreditCard} className="nav-icon" />
                <span className="nav-text">Từ vựng</span>
                <FontAwesomeIcon icon={faLayerGroup} className="nav-arrow" />
              </button>
              <ul
                className={`nav-submenu ${
                  expandedMenus.vocabulary ? "expanded" : ""
                }`}
              >
                <li>
                  <Link
                    to="/learner/topics"
                    className={isActive("/learner/topics") ? "active" : ""}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FontAwesomeIcon
                      icon={faBookOpen}
                      className="submenu-icon"
                    />
                    <span>Chủ đề từ vựng</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/learner/vocabulary"
                    className={isActive("/learner/vocabulary") ? "active" : ""}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FontAwesomeIcon icon={faHeart} className="submenu-icon" />
                    <span>Từ vựng đã lưu</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/learner/dictionary"
                    className={isActive("/learner/dictionary") ? "active" : ""}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FontAwesomeIcon icon={faSearch} className="submenu-icon" />
                    <span>Từ điển</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/learner/flashcards"
                    className={isActive("/learner/flashcards") ? "active" : ""}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FontAwesomeIcon
                      icon={faGamepad}
                      className="submenu-icon"
                    />
                    <span>Flashcards</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/learner/quiz"
                    className={isActive("/learner/quiz") ? "active" : ""}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FontAwesomeIcon
                      icon={faQuestion}
                      className="submenu-icon"
                    />
                    <span>Quiz từ vựng</span>
                  </Link>
                </li>
              </ul>
            </li>

            {/* Practice Section */}
            <li className="nav-item nav-category">
              <button
                className={`nav-link category-toggle ${
                  expandedMenus.practice ? "expanded" : ""
                }`}
                onClick={() => toggleSubMenu("practice")}
              >
                <FontAwesomeIcon icon={faPen} className="nav-icon" />
                <span className="nav-text">Luyện tập</span>
                <FontAwesomeIcon icon={faLayerGroup} className="nav-arrow" />
              </button>
              <ul
                className={`nav-submenu ${
                  expandedMenus.practice ? "expanded" : ""
                }`}
              >
                <li>
                  <Link
                    to="/learner/notes"
                    className={isActive("/learner/notes") ? "active" : ""}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FontAwesomeIcon
                      icon={faStickyNote}
                      className="submenu-icon"
                    />
                    <span>Ghi chú cá nhân</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/learner/blog"
                    className={isActive("/learner/blog") ? "active" : ""}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FontAwesomeIcon
                      icon={faNewspaper}
                      className="submenu-icon"
                    />
                    <span>Blog & Tin tức</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/learner/practice-sw"
                    className={isActive("/learner/practice-sw") ? "active" : ""}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FontAwesomeIcon icon={faPen} className="submenu-icon" />
                    <span>Luyện Speaking & Writing</span>
                  </Link>
                </li>
              </ul>
            </li>

            {/* Tools & Features Section */}
            <li className="nav-item nav-category">
              <button
                className={`nav-link category-toggle ${
                  expandedMenus.tools ? "expanded" : ""
                }`}
                onClick={() => toggleSubMenu("tools")}
              >
                <FontAwesomeIcon icon={faFlask} className="nav-icon" />
                <span className="nav-text">Công cụ & Tính năng</span>
                <FontAwesomeIcon icon={faLayerGroup} className="nav-arrow" />
              </button>
              <ul
                className={`nav-submenu ${
                  expandedMenus.tools ? "expanded" : ""
                }`}
              >
                <li>
                  <Link
                    to="/learner/progress"
                    className={isActive("/learner/progress") ? "active" : ""}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FontAwesomeIcon
                      icon={faChartLine}
                      className="submenu-icon"
                    />
                    <span>Tiến độ học tập</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/learner/leaderboard"
                    className={isActive("/learner/leaderboard") ? "active" : ""}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FontAwesomeIcon icon={faTrophy} className="submenu-icon" />
                    <span>Bảng xếp hạng</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/learner/achievements"
                    className={
                      isActive("/learner/achievements") ? "active" : ""
                    }
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FontAwesomeIcon icon={faStar} className="submenu-icon" />
                    <span>Thành tích</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/learner/study-timer"
                    className={isActive("/learner/study-timer") ? "active" : ""}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FontAwesomeIcon icon={faClock} className="submenu-icon" />
                    <span>Đồng hồ học tập</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/learner/focus-mode"
                    className={isActive("/learner/focus-mode") ? "active" : ""}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FontAwesomeIcon
                      icon={faForward}
                      className="submenu-icon"
                    />
                    <span>Chế độ tập trung</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/learner/audio-trainer"
                    className={
                      isActive("/learner/audio-trainer") ? "active" : ""
                    }
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FontAwesomeIcon
                      icon={faHeadphones}
                      className="submenu-icon"
                    />
                    <span>Luyện nghe</span>
                  </Link>
                </li>
              </ul>
            </li>

            {/* Community Section */}
            <li className="nav-item nav-category">
              <button
                className={`nav-link category-toggle ${
                  expandedMenus.community ? "expanded" : ""
                }`}
                onClick={() => toggleSubMenu("community")}
              >
                <FontAwesomeIcon icon={faGlobe} className="nav-icon" />
                <span className="nav-text">Cộng đồng</span>
                <FontAwesomeIcon icon={faLayerGroup} className="nav-arrow" />
              </button>
              <ul
                className={`nav-submenu ${
                  expandedMenus.community ? "expanded" : ""
                }`}
              >
                <li>
                  <Link
                    to="/learner/events"
                    className={isActive("/learner/events") ? "active" : ""}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      className="submenu-icon"
                    />
                    <span>Sự kiện</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/learner/study-groups"
                    className={
                      isActive("/learner/study-groups") ? "active" : ""
                    }
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FontAwesomeIcon
                      icon={faVideoCamera}
                      className="submenu-icon"
                    />
                    <span>Nhóm học tập</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/learner/challenges"
                    className={isActive("/learner/challenges") ? "active" : ""}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FontAwesomeIcon icon={faGift} className="submenu-icon" />
                    <span>Thử thách</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/learner/ai-tutor"
                    className={isActive("/learner/ai-tutor") ? "active" : ""}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FontAwesomeIcon
                      icon={faLightbulb}
                      className="submenu-icon"
                    />
                    <span>AI Gia sư</span>
                  </Link>
                </li>
              </ul>
            </li>

            {/* Settings */}
            <li className="nav-item">
              <Link
                to="/learner/profile"
                className={`nav-link ${
                  isActive("/learner/profile") ? "active" : ""
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <FontAwesomeIcon icon={faUser} className="nav-icon" />
                <span className="nav-text">Hồ sơ cá nhân</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/learner/settings"
                className={`nav-link ${
                  isActive("/learner/settings") ? "active" : ""
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <FontAwesomeIcon icon={faCog} className="nav-icon" />
                <span className="nav-text">Cài đặt</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="learner-main">
        <div className="main-content">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="learner-footer">
        <div className="container">
          <div className="footer-inner">
            <div className="footer-copyright">
              &copy; {new Date().getFullYear()} TOEIC Learning. Đã đăng ký bản
              quyền.
            </div>
            <div className="footer-links">
              <Link to="/help">Trợ giúp</Link>
              <Link to="/privacy">Chính sách bảo mật</Link>
              <Link to="/terms">Điều khoản sử dụng</Link>
              <Link to="/contact">Liên hệ</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LearnerLayout;
