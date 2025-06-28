import React, { useState, useEffect } from "react";
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
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { toast } from "react-toastify";
import CheckAccessToken from "../components/Learner/Layouts/CheckAccessToken";
import authService from "../services/authService";

import "./LearnerLayout.css";

const LearnerLayout = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const user = useSelector((state) => state?.auth?.user);

  // Check if the path starts with the given route
  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };
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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
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
        // This would be replaced with actual API call
        const dummyNotifications = [
          {
            id: 1,
            title: "Giáo viên đã trả lời câu hỏi của bạn",
            message:
              "Giáo viên Kevin đã trả lời câu hỏi của bạn trong bài Grammar",
            time: "10 phút trước",
            read: false,
          },
          {
            id: 2,
            title: "Tài liệu mới",
            message: "Chúng tôi vừa thêm mới tài liệu TOEIC Part 7 Reading",
            time: "1 giờ trước",
            read: true,
          },
          {
            id: 3,
            title: "Nhắc nhở học tập",
            message: "Đã 3 ngày kể từ lần học gần nhất của bạn",
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
  }, []);
  return (
    <div className="learner-layout">
      <CheckAccessToken />
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
          <ul>
            <li>
              <Link
                to="/learner/dashboard"
                className={isActive("/learner/dashboard") ? "active" : ""}
                onClick={() => setMobileMenuOpen(false)}
              >
                <FontAwesomeIcon icon={faHouse} className="nav-icon" />
                <span>Trang chủ</span>
              </Link>
            </li>
            <li>
              <Link
                to="/learner/exams"
                className={isActive("/learner/exams") ? "active" : ""}
                onClick={() => setMobileMenuOpen(false)}
              >
                <FontAwesomeIcon icon={faFileAlt} className="nav-icon" />
                <span>Bài thi thực hành</span>
              </Link>
            </li>{" "}
            <li>
              <Link
                to="/learner/materials"
                className={isActive("/learner/materials") ? "active" : ""}
                onClick={() => setMobileMenuOpen(false)}
              >
                <FontAwesomeIcon icon={faBook} className="nav-icon" />
                <span>Tài liệu học tập</span>
              </Link>
            </li>
            <li>
              <Link
                to="/learner/grammar"
                className={isActive("/learner/grammar") ? "active" : ""}
                onClick={() => setMobileMenuOpen(false)}
              >
                <FontAwesomeIcon icon={faLanguage} className="nav-icon" />
                <span>Ngữ pháp</span>
              </Link>
            </li>
            <li>
              <Link
                to="/learner/topics"
                className={isActive("/learner/topics") ? "active" : ""}
                onClick={() => setMobileMenuOpen(false)}
              >
                <FontAwesomeIcon icon={faBookOpen} className="nav-icon" />
                <span>Từ vựng theo chủ đề</span>
              </Link>
            </li>
            <li>
              <Link
                to="/learner/notes"
                className={isActive("/learner/notes") ? "active" : ""}
                onClick={() => setMobileMenuOpen(false)}
              >
                <FontAwesomeIcon icon={faStickyNote} className="nav-icon" />
                <span>Ghi chú cá nhân</span>
              </Link>
            </li>
            <li>
              <Link
                to="/learner/progress"
                className={isActive("/learner/progress") ? "active" : ""}
                onClick={() => setMobileMenuOpen(false)}
              >
                <FontAwesomeIcon icon={faChartLine} className="nav-icon" />
                <span>Tiến độ học tập</span>
              </Link>
            </li>
            <li>
              <Link
                to="/learner/profile"
                className={isActive("/learner/profile") ? "active" : ""}
                onClick={() => setMobileMenuOpen(false)}
              >
                <FontAwesomeIcon icon={faUser} className="nav-icon" />
                <span>Hồ sơ cá nhân</span>
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
