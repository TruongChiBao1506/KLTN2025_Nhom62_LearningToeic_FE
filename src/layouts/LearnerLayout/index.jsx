import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faFileAlt,
  faBook,
  faChartLine,
  faUser,
  faSignOutAlt,
  faBars,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import "./style.css";

const LearnerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const handleLogout = () => {
    // Implement logout logic here
    console.log("Logging out...");
  };

  return (
    <div className="learner-layout">
      {/* Sidebar */}
      <div className={`learner-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h3>TOEIC Learning</h3>
          <button className="close-sidebar" onClick={toggleSidebar}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className="profile-section">
          <div className="profile-image">
            <img src="/assets/images/user-avatar.png" alt="Profile" />
          </div>
          <div className="profile-info">
            <h5>John Doe</h5>
            <p>TOEIC Learner</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li
              className={
                isActive("/learner") || isActive("/learner/dashboard")
                  ? "active"
                  : ""
              }
            >
              <Link to="/learner/dashboard">
                <FontAwesomeIcon icon={faHome} />
                <span>Dashboard</span>
              </Link>
            </li>
            <li className={isActive("/learner/exams") ? "active" : ""}>
              <Link to="/learner/exams">
                <FontAwesomeIcon icon={faFileAlt} />
                <span>Practice Tests</span>
              </Link>
            </li>
            <li className={isActive("/learner/materials") ? "active" : ""}>
              <Link to="/learner/materials">
                <FontAwesomeIcon icon={faBook} />
                <span>Learning Materials</span>
              </Link>
            </li>
            <li className={isActive("/learner/progress") ? "active" : ""}>
              <Link to="/learner/progress">
                <FontAwesomeIcon icon={faChartLine} />
                <span>My Progress</span>
              </Link>
            </li>
            <li className={isActive("/learner/profile") ? "active" : ""}>
              <Link to="/learner/profile">
                <FontAwesomeIcon icon={faUser} />
                <span>My Profile</span>
              </Link>
            </li>
            <li>
              <button onClick={handleLogout} className="logout-btn">
                <FontAwesomeIcon icon={faSignOutAlt} />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className={`learner-main-content ${sidebarOpen ? "" : "expanded"}`}>
        {/* Top Navigation */}
        <header className="learner-header">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            <FontAwesomeIcon icon={faBars} />
          </button>
          <div className="header-right">
            <div className="notification-icon">
              <span className="badge">3</span>
            </div>
            <div className="user-menu">
              <img src="/assets/images/user-avatar.png" alt="User" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="learner-content">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="learner-footer">
          <p>
            © {new Date().getFullYear()} TOEIC Learning Platform. All Rights
            Reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default LearnerLayout;
