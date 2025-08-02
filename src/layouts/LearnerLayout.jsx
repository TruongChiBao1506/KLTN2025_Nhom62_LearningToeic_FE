import React, { useState, useEffect, useCallback } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Layout,
  Menu,
  Avatar,
  Badge,
  Dropdown,
  Input,
  Button,
  Space,
  Card,
  Drawer,
  Typography,
  Divider,
  Row,
  Col,
  FloatButton,
} from "antd";
import {
  Home,
  FileText,
  Book,
  BookOpen,
  Languages,
  ArrowRight,
  Layers,
  CreditCard,
  Heart,
  Search,
  Gamepad2,
  HelpCircle,
  PenTool,
  StickyNote,
  Newspaper,
  Beaker,
  TrendingUp,
  Trophy,
  Star,
  Clock,
  Headphones,
  Globe,
  Calendar,
  Video,
  Gift,
  Lightbulb,
  User,
  Settings,
  Menu as MenuIcon,
  X,
  Bell,
  Moon,
  Sun,
  Flame,
  LogOut,
  ClipboardList,
  GraduationCap,
  Rocket,
  Target,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { toast } from "react-toastify";
import authService from "../services/authService";
import ChatbotButton from "../components/Learner/Chatbot/ChatbotButton";

import "./LearnerLayout.css";

const { Header, Sider, Content, Footer } = Layout;
const { Title, Text } = Typography;

const LearnerLayout = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  // States
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [studyStreak, setStudyStreak] = useState(
    parseInt(localStorage.getItem("studyStreak") || "0")
  );
  const [todayStudyTime, setTodayStudyTime] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const user = useSelector((state) => state?.auth?.user);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
  // Menu items configuration
  const menuItems = [
    {
      key: "/learner/dashboard",
      icon: <Home size={18} />,
      label: <Link to="/learner/dashboard">Trang chủ</Link>,
    },
    {
      key: "exams",
      icon: <FileText size={18} />,
      label: "Bài thi & Luyện tập",
      children: [
        {
          key: "/learner/exams",
          icon: <ClipboardList size={16} />,
          label: <Link to="/learner/exams">Danh sách bài thi</Link>,
        },
        {
          key: "/learner/full-test",
          icon: <GraduationCap size={16} />,
          label: <Link to="/learner/full-test">Thi thử Full Test</Link>,
        },
        {
          key: "/learner/mini-test",
          icon: <Rocket size={16} />,
          label: <Link to="/learner/mini-test">Mini Test</Link>,
        },
      ],
    },
    {
      key: "learning",
      icon: <Book size={18} />,
      label: "Học tập",
      children: [
        {
          key: "/learner/materials",
          icon: <BookOpen size={16} />,
          label: <Link to="/learner/materials">Tài liệu học tập</Link>,
        },
        {
          key: "/learner/grammar",
          icon: <Languages size={16} />,
          label: <Link to="/learner/grammar">Ngữ pháp</Link>,
        },
        {
          key: "/learner/improve",
          icon: <ArrowRight size={16} />,
          label: <Link to="/learner/improve">Cải thiện kỹ năng</Link>,
        },
        {
          key: "/learner/section",
          icon: <Layers size={16} />,
          label: <Link to="/learner/section">Phần thi</Link>,
        },
      ],
    },
    {
      key: "vocabulary",
      icon: <CreditCard size={18} />,
      label: "Từ vựng",
      children: [
        {
          key: "/learner/topics",
          icon: <BookOpen size={16} />,
          label: <Link to="/learner/topics">Chủ đề từ vựng</Link>,
        },
        {
          key: "/learner/vocabulary",
          icon: <Heart size={16} />,
          label: <Link to="/learner/vocabulary">Từ vựng đã lưu</Link>,
        },
        {
          key: "/learner/dictionary",
          icon: <Search size={16} />,
          label: <Link to="/learner/dictionary">Từ điển</Link>,
        },
      ],
    },
    {
      key: "practice",
      icon: <PenTool size={18} />,
      label: "Luyện tập",
      children: [
        {
          key: "/learner/notes",
          icon: <StickyNote size={16} />,
          label: <Link to="/learner/notes">Ghi chú cá nhân</Link>,
        },
        {
          key: "/learner/blog",
          icon: <Newspaper size={16} />,
          label: <Link to="/learner/blog">Blog & Tin tức</Link>,
        },
        {
          key: "/learner/practice-sw",
          icon: <PenTool size={16} />,
          label: (
            <Link to="/learner/practice-sw">Luyện Speaking & Writing</Link>
          ),
        },
      ],
    },
    {
      key: "tools",
      icon: <Beaker size={18} />,
      label: "Công cụ & Tính năng",
      children: [
        {
          key: "/learner/progress",
          icon: <TrendingUp size={16} />,
          label: <Link to="/learner/progress">Tiến độ học tập</Link>,
        },
        {
          key: "/learner/leaderboard",
          icon: <Trophy size={16} />,
          label: <Link to="/learner/leaderboard">Bảng xếp hạng</Link>,
        },
        {
          key: "/learner/achievements",
          icon: <Star size={16} />,
          label: <Link to="/learner/achievements">Thành tích</Link>,
        },
        {
          key: "/learner/study-timer",
          icon: <Clock size={16} />,
          label: <Link to="/learner/study-timer">Đồng hồ học tập</Link>,
        },
        {
          key: "/learner/focus-mode",
          icon: <Target size={16} />,
          label: <Link to="/learner/focus-mode">Chế độ tập trung</Link>,
        },
        {
          key: "/learner/audio-trainer",
          icon: <Headphones size={16} />,
          label: <Link to="/learner/audio-trainer">Luyện nghe</Link>,
        },
      ],
    },
    {
      key: "community",
      icon: <Globe size={18} />,
      label: "Cộng đồng",
      children: [
        {
          key: "/learner/events",
          icon: <Calendar size={16} />,
          label: <Link to="/learner/events">Sự kiện</Link>,
        },
        {
          key: "/learner/study-groups",
          icon: <Video size={16} />,
          label: <Link to="/learner/study-groups">Nhóm học tập</Link>,
        },
        {
          key: "/learner/challenges",
          icon: <Gift size={16} />,
          label: <Link to="/learner/challenges">Thử thách</Link>,
        },
        {
          key: "/learner/ai-tutor",
          icon: <Lightbulb size={16} />,
          label: <Link to="/learner/ai-tutor">AI Gia sư</Link>,
        },
      ],
    },
    {
      key: "/learner/profile",
      icon: <User size={18} />,
      label: <Link to="/learner/profile">Hồ sơ cá nhân</Link>,
    },
    {
      key: "/learner/settings",
      icon: <Settings size={18} />,
      label: <Link to="/learner/settings">Cài đặt</Link>,
    },
  ];

  // Get current menu key based on location
  const getCurrentMenuKey = () => {
    const path = location.pathname;
    // Find exact match first
    for (const item of menuItems) {
      if (item.key === path) return [item.key];
      if (item.children) {
        for (const child of item.children) {
          if (child.key === path) return [child.key];
        }
      }
    }
    return [path];
  };

  // Get current open keys for submenu
  const getCurrentOpenKeys = () => {
    const path = location.pathname;
    for (const item of menuItems) {
      if (item.children) {
        for (const child of item.children) {
          if (child.key === path) return [item.key];
        }
      }
    }
    return [];
  };

  // User menu items
  const userMenuItems = [
    {
      key: "profile",
      icon: <User size={16} />,
      label: <Link to="/learner/profile">Hồ sơ cá nhân</Link>,
    },
    {
      key: "settings",
      icon: <Settings size={16} />,
      label: <Link to="/learner/settings">Cài đặt</Link>,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogOut size={16} />,
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ];

  // Notification menu items
  const notificationMenuItems = [
    {
      key: "header",
      label: (
        <div style={{ padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
          <Text strong>Thông báo</Text>
          <Button
            type="link"
            size="small"
            style={{ float: "right", padding: 0 }}
          >
            Đánh dấu đã đọc
          </Button>
        </div>
      ),
      disabled: true,
    },
    ...(notifications.length > 0
      ? notifications.map((notification) => ({
          key: notification.id,
          label: (
            <div style={{ padding: "8px 0" }}>
              <div
                style={{ fontWeight: !notification.read ? "bold" : "normal" }}
              >
                {notification.title}
              </div>
              <div
                style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}
              >
                {notification.message}
              </div>
              <div
                style={{ fontSize: "11px", color: "#999", marginTop: "4px" }}
              >
                {notification.time}
              </div>
            </div>
          ),
        }))
      : [
          {
            key: "empty",
            label: (
              <div
                style={{ padding: "20px", textAlign: "center", color: "#999" }}
              >
                Không có thông báo nào
              </div>
            ),
            disabled: true,
          },
        ]),
    {
      type: "divider",
    },
    {
      key: "viewAll",
      label: <Link to="/learner/notifications">Xem tất cả thông báo</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Mobile Drawer */}
      <Drawer
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              margin: "-24px -24px 0 -24px",
              padding: "20px 24px",
              color: "#fff",
            }}
          >
            <Space>
              <div
                style={{
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: "10px",
                  padding: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <GraduationCap size={24} style={{ color: "#fff" }} />
              </div>
              <Title
                level={4}
                style={{ margin: 0, color: "#fff", fontWeight: "600" }}
              >
                TOEIC Learning
              </Title>
            </Space>
            <Button
              type="text"
              icon={<X size={20} />}
              onClick={() => setMobileDrawerVisible(false)}
              style={{
                color: "#fff",
                background: "rgba(255,255,255,0.15)",
                border: "none",
                borderRadius: "8px",
              }}
            />
          </div>
        }
        placement="left"
        onClose={() => setMobileDrawerVisible(false)}
        open={mobileDrawerVisible}
        bodyStyle={{
          padding: 0,
          background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        }}
        width={280}
        closable={false}
      >
        <div style={{ padding: "16px 0" }}>
          <Menu
            mode="inline"
            selectedKeys={getCurrentMenuKey()}
            defaultOpenKeys={getCurrentOpenKeys()}
            items={menuItems}
            style={{
              border: "none",
              background: "transparent",
            }}
          />
        </div>
      </Drawer>

      {/* Desktop Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={280}
        style={{
          background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
          boxShadow: "4px 0 20px rgba(0,0,0,0.08)",
          zIndex: 100,
          borderRight: "1px solid rgba(0,0,0,0.06)",
        }}
        breakpoint="lg"
        collapsedWidth={0}
        onBreakpoint={(broken) => {
          if (broken) {
            setCollapsed(true);
          }
        }}
        className="desktop-sider"
      >
        <div
          style={{
            padding: "24px 20px",
            borderBottom: "1px solid rgba(0,0,0,0.08)",
            textAlign: collapsed ? "center" : "left",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background pattern */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="M20 20c0-11.046-8.954-20-20-20v40c11.046 0 20-8.954 20-20z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              opacity: 0.3,
            }}
          />

          <Link
            to="/learner/dashboard"
            style={{ textDecoration: "none", position: "relative", zIndex: 1 }}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <div
                style={{
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: "12px",
                  padding: "8px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <GraduationCap
                  size={collapsed ? 20 : 24}
                  style={{ color: "#fff" }}
                />
              </div>
              {!collapsed && (
                <Title
                  level={4}
                  style={{
                    margin: 0,
                    color: "#fff",
                    fontSize: "18px",
                    fontWeight: "600",
                    textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  TOEIC Learning
                </Title>
              )}
            </Space>
          </Link>
        </div>

        <div style={{ padding: "16px 0" }}>
          <Menu
            mode="inline"
            selectedKeys={getCurrentMenuKey()}
            defaultOpenKeys={getCurrentOpenKeys()}
            items={menuItems}
            style={{
              border: "none",
              background: "transparent",
            }}
          />
        </div>
      </Sider>

      <Layout>
        {/* Header */}
        <Header
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            padding: "0 24px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            overflow: "hidden",
            height: "64px",
          }}
        >
          {/* Background decoration */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="3"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              opacity: 0.6,
            }}
          />

          <Space size="medium" style={{ position: "relative", zIndex: 1 }}>
            {/* Mobile menu button */}
            <Button
              type="text"
              icon={<MenuIcon size={20} />}
              onClick={() => setMobileDrawerVisible(true)}
              className="mobile-menu-btn"
              style={{
                display: "none",
                color: "#fff",
                backgroundColor: "rgba(255,255,255,0.15)",
                border: "none",
                borderRadius: "8px",
              }}
            />

            {/* Search */}
            <div style={{ position: "relative" }}>
              <Input
                placeholder="Tìm kiếm..."
                prefix={<Search size={14} style={{ color: "#8c8c8c" }} />}
                style={{
                  width:
                    windowWidth > 1200 ? 200 : windowWidth > 992 ? 180 : 160,
                  borderRadius: "14px",
                  border: "none",
                  background: "rgba(255,255,255,0.92)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  display: windowWidth > 768 ? "block" : "none",
                  fontSize: "13px",
                  height: "32px",
                }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onPressEnter={handleSearch}
              />
            </div>
          </Space>

          <Space size={16} style={{ position: "relative", zIndex: 1 }}>
            {/* Study Stats */}
            <Space
              size="small"
              style={{ display: windowWidth > 576 ? "flex" : "none" }}
            >
              <Card
                size="small"
                style={{
                  background: "linear-gradient(135deg, #ff6b6b, #ee5a52)",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(238, 90, 82, 0.2)",
                  transition: "all 0.3s ease",
                }}
                onClick={updateStudyProgress}
                bodyStyle={{ padding: "6px 10px" }}
                hoverable
              >
                <Space size="small">
                  <div
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      borderRadius: "5px",
                      padding: "2px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Flame size={14} style={{ color: "#fff" }} />
                  </div>
                  <div style={{ color: "#fff" }}>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "bold",
                        lineHeight: 1,
                      }}
                    >
                      {studyStreak}
                    </div>
                    <div style={{ fontSize: "9px", opacity: 0.9 }}>Streak</div>
                  </div>
                </Space>
              </Card>

              <Card
                size="small"
                style={{
                  background: "linear-gradient(135deg, #4facfe, #00f2fe)",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(79, 172, 254, 0.2)",
                }}
                bodyStyle={{ padding: "6px 10px" }}
              >
                <Space size="small">
                  <div
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      borderRadius: "5px",
                      padding: "2px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Clock size={14} style={{ color: "#fff" }} />
                  </div>
                  <div style={{ color: "#fff" }}>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "bold",
                        lineHeight: 1,
                      }}
                    >
                      {todayStudyTime}
                    </div>
                    <div style={{ fontSize: "9px", opacity: 0.9 }}>Phút</div>
                  </div>
                </Space>
              </Card>
            </Space>

            {/* Theme Toggle */}
            <Button
              type="text"
              icon={darkMode ? <Sun size={18} /> : <Moon size={18} />}
              onClick={toggleDarkMode}
              style={{
                background: "linear-gradient(135deg, #feca57, #ff9ff3)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(254, 202, 87, 0.25)",
                transition: "all 0.3s ease",
              }}
            />

            {/* Notifications */}
            <Dropdown
              menu={{ items: notificationMenuItems }}
              trigger={["click"]}
              placement="bottomRight"
              onOpenChange={setShowNotifications}
            >
              <div style={{ position: "relative" }}>
                <Button
                  type="text"
                  icon={<Bell size={18} />}
                  style={{
                    background: notifications.some((n) => !n.read)
                      ? "linear-gradient(135deg, #a8edea, #fed6e3)"
                      : "rgba(255,255,255,0.15)",
                    color: notifications.some((n) => !n.read)
                      ? "#722ed1"
                      : "#fff",
                    border: "none",
                    borderRadius: "8px",
                    width: "36px",
                    height: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: notifications.some((n) => !n.read)
                      ? "0 2px 8px rgba(168, 237, 234, 0.3)"
                      : "0 2px 8px rgba(0,0,0,0.08)",
                    transition: "all 0.3s ease",
                  }}
                />
                {notifications.filter((n) => !n.read).length > 0 && (
                  <Badge
                    count={notifications.filter((n) => !n.read).length}
                    size="small"
                    style={{
                      position: "absolute",
                      top: "-5px",
                      right: "-5px",
                      background: "#ff4d4f",
                      boxShadow: "0 2px 8px rgba(255, 77, 79, 0.3)",
                    }}
                  />
                )}
              </div>
            </Dropdown>

            {/* User Profile */}
            <Dropdown
              menu={{ items: userMenuItems }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Space
                style={{
                  cursor: "pointer",
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: "18px",
                  padding: "4px 10px",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  transition: "all 0.3s ease",
                }}
                className="user-profile-hover"
              >
                <Avatar
                  size={32}
                  src={user?.avatar}
                  style={{
                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                    color: "#fff",
                    border: "2px solid rgba(255,255,255,0.3)",
                  }}
                >
                  {user?.fullName?.charAt(0) || "U"}
                </Avatar>
                <Text
                  style={{
                    display: windowWidth > 768 ? "block" : "none",
                    color: "#fff",
                    fontWeight: "500",
                    fontSize: "14px",
                  }}
                >
                  {user?.fullName || "User"}
                </Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* Main Content */}
        <Content
          style={{
            margin: "20px",
            padding: 0,
            minHeight: "calc(100vh - 104px)",
            background: "transparent",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              minHeight: "100%",
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <Outlet />
          </div>
        </Content>

        {/* Footer */}
        <Footer
          style={{
            textAlign: "center",
            background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
            borderTop: "1px solid rgba(0,0,0,0.06)",
            padding: "32px 24px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Footer background pattern */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23667eea" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              opacity: 0.6,
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            <Row justify="center" align="middle" gutter={[32, 16]}>
              <Col>
                <Space direction="vertical" align="center">
                  <div
                    style={{
                      background: "linear-gradient(135deg, #667eea, #764ba2)",
                      borderRadius: "12px",
                      padding: "8px",
                      display: "inline-flex",
                      marginBottom: "8px",
                    }}
                  >
                    <GraduationCap size={20} style={{ color: "#fff" }} />
                  </div>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: "14px",
                      background: "linear-gradient(135deg, #667eea, #764ba2)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontWeight: "500",
                    }}
                  >
                    &copy; {new Date().getFullYear()} TOEIC Learning. Đã đăng ký
                    bản quyền.
                  </Text>
                </Space>
              </Col>
            </Row>
            <Row justify="center" style={{ marginTop: "16px" }}>
              <Col>
                <Space
                  split={
                    <Divider
                      type="vertical"
                      style={{ borderColor: "rgba(102, 126, 234, 0.3)" }}
                    />
                  }
                  size="large"
                >
                  <Link
                    to="/help"
                    style={{
                      color: "#8c8c8c",
                      textDecoration: "none",
                      fontSize: "13px",
                      fontWeight: "500",
                      transition: "color 0.3s ease",
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "#667eea")}
                    onMouseLeave={(e) => (e.target.style.color = "#8c8c8c")}
                  >
                    Trợ giúp
                  </Link>
                  <Link
                    to="/privacy"
                    style={{
                      color: "#8c8c8c",
                      textDecoration: "none",
                      fontSize: "13px",
                      fontWeight: "500",
                      transition: "color 0.3s ease",
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "#667eea")}
                    onMouseLeave={(e) => (e.target.style.color = "#8c8c8c")}
                  >
                    Chính sách bảo mật
                  </Link>
                  <Link
                    to="/terms"
                    style={{
                      color: "#8c8c8c",
                      textDecoration: "none",
                      fontSize: "13px",
                      fontWeight: "500",
                      transition: "color 0.3s ease",
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "#667eea")}
                    onMouseLeave={(e) => (e.target.style.color = "#8c8c8c")}
                  >
                    Điều khoản sử dụng
                  </Link>
                  <Link
                    to="/contact"
                    style={{
                      color: "#8c8c8c",
                      textDecoration: "none",
                      fontSize: "13px",
                      fontWeight: "500",
                      transition: "color 0.3s ease",
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "#667eea")}
                    onMouseLeave={(e) => (e.target.style.color = "#8c8c8c")}
                  >
                    Liên hệ
                  </Link>
                </Space>
              </Col>
            </Row>
          </div>
        </Footer>
      </Layout>

      {/* Floating Action Button */}
      <FloatButton.BackTop
        style={{
          background: "linear-gradient(135deg, #667eea, #764ba2)",
          border: "none",
          boxShadow: "0 4px 16px rgba(102, 126, 234, 0.3)",
        }}
        icon={<ArrowRight style={{ transform: "rotate(-90deg)" }} />}
      />

      {/* AI Chatbot Button */}
      <ChatbotButton />

      <style jsx global>{`
        .mobile-menu-btn {
          display: none !important;
        }

        @media (max-width: 992px) {
          .desktop-sider {
            display: none !important;
          }
          .mobile-menu-btn {
            display: inline-flex !important;
          }
        }

        @media (max-width: 768px) {
          .ant-layout-header {
            padding: 0 20px !important;
            height: 64px !important;
          }
        }

        @media (max-width: 576px) {
          .ant-layout-header {
            padding: 0 16px !important;
          }
        }

        /* Menu Styling */
        .ant-menu-item,
        .ant-menu-submenu {
          border-radius: 8px !important;
          margin: 4px 12px !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .ant-menu-item-selected {
          background: linear-gradient(135deg, #e6f7ff, #bae7ff) !important;
          color: #1890ff !important;
          box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15) !important;
          transform: translateX(4px) !important;
        }

        .ant-menu-item:hover {
          background: linear-gradient(135deg, #f0f9ff, #e1f5fe) !important;
          transform: translateX(2px) !important;
        }

        .ant-menu-submenu-title:hover {
          background: linear-gradient(135deg, #f0f9ff, #e1f5fe) !important;
          transform: translateX(2px) !important;
        }

        .ant-menu-submenu-selected > .ant-menu-submenu-title {
          color: #1890ff !important;
          background: linear-gradient(135deg, #e6f7ff, #bae7ff) !important;
        }

        .ant-layout-sider-collapsed .ant-menu-item-icon {
          font-size: 18px !important;
        }

        /* Header User Profile Hover Effect */
        .user-profile-hover:hover {
          background: rgba(255, 255, 255, 0.25) !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }

        /* Notification and button hover effects */
        .ant-btn:hover {
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }

        /* Card hover effects */
        .ant-card:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
        }

        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #764ba2, #667eea);
        }
      `}</style>
    </Layout>
  );
};

export default LearnerLayout;
