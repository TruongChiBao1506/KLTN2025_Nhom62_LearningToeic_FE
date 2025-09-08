import React, { useState, useEffect, useCallback, useRef } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
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
  Home,
  TrendingUp,
  FileText,
  BookOpen,
  Languages,
  ArrowRight,
  Heart,
  Search,
  PenTool,
  StickyNote,
  Clock,
  Headphones,
  Star,
  Target,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { toast } from "react-toastify";
import authService from "../services/authService";
import sectionService from "../services/sectionsService";
import ChatbotButton from "../components/Learner/Chatbot/ChatbotButton";

import "./LearnerLayout.css";

import { Layout, Typography, Button, Drawer, Space, Card, Input, Dropdown, Badge, Avatar, Row, Col, Divider, FloatButton, Menu } from "antd";

const { Header, Sider, Content, Footer } = Layout;
const { Title, Text } = Typography;

const LearnerLayout = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  // States
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [studyStreak, setStudyStreak] = useState(
    parseInt(localStorage.getItem("studyStreak") || "0")
  );
  const [todayStudyTime, setTodayStudyTime] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [sections, setSections] = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [lastSectionsUpdate, setLastSectionsUpdate] = useState(Date.now());
  const sectionsRef = useRef([]);
  const user = useSelector((state) => state?.auth?.user);

  // Load sections for dynamic menu
  const fetchSections = useCallback(async () => {
    try {
      setSectionsLoading(true);
      const response = await sectionService.getAllEnabled();
      // Handle both response formats for consistency
      const sectionsData = response.data || response;
      
      // Only update if data actually changed
      const sectionsString = JSON.stringify(sectionsData);
      const currentSectionsString = JSON.stringify(sectionsRef.current);
      
      if (sectionsString !== currentSectionsString) {
        setSections(sectionsData);
        sectionsRef.current = sectionsData;
        setLastSectionsUpdate(Date.now());
      }
    } catch (error) {
      console.error("Lỗi khi tải sections:", error);
    } finally {
      setSectionsLoading(false);
    }
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    
    // Refresh sections when window gets focus (user comes back to app)
    const handleFocus = () => {
      fetchSections();
    };
    
    window.addEventListener("resize", handleResize);
    window.addEventListener("focus", handleFocus);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchSections]);

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
      window.location.href = "/auth/signin";
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      toast.error("Đã xảy ra lỗi khi đăng xuất. Vui lòng thử lại.");
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

  useEffect(() => {
    fetchSections();

    // Poll for section changes every 30 seconds
    const pollInterval = setInterval(fetchSections, 30000);

    // Listen for page visibility changes (when user switches tabs)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchSections();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchSections]);

  // Function to manually refresh sections
  const refreshSections = async () => {
    await fetchSections();
  };

  // Generate dynamic menu items for L&R sections
  const generateListeningReadingMenuItems = () => {
    const listeningReadingSections = sections.filter(section => 
      section.type === 1 || section.type === 2 // Listening and Reading
    );
    
    // If sections are loading, show loading indicator
    if (sectionsLoading && listeningReadingSections.length === 0) {
      return [{
        key: "loading",
        icon: <FileText size={16} />,
        label: <span style={{ color: '#999' }}>Đang tải...</span>,
        disabled: true,
      }];
    }
    
    // Map sections to menu items
    const sectionMenuItems = listeningReadingSections.map(section => {
      // Generate route based on section name for backward compatibility
      let routePath = '';
      if (section.name.includes('Part 1')) routePath = '/learner/part-1';
      else if (section.name.includes('Part 2')) routePath = '/learner/part-2';
      else if (section.name.includes('Part 3')) routePath = '/learner/part-3';
      else if (section.name.includes('Part 4')) routePath = '/learner/part-4';
      else if (section.name.includes('Part 5')) routePath = '/learner/part-5';
      else if (section.name.includes('Part 6')) routePath = '/learner/part-6';
      else if (section.name.includes('Part 7')) routePath = '/learner/part-7';
      else routePath = `/learner/section/${section._id}`;

      return {
        key: routePath,
        icon: <FileText size={16} />,
        label: <Link to={routePath}>{section.name}</Link>,
      };
    });

    // Add the "Luyện theo chuyên đề" item at the end
    sectionMenuItems.push({
      key: "/learner/improve",
      icon: <Target size={16} />,
      label: <Link to="/learner/improve">Luyện theo chuyên đề</Link>,
    });

    return sectionMenuItems;
  };

  // Menu items configuration
  const menuItems = [
    {
      key: "/learner/dashboard",
      icon: <Home size={18} />,
      label: <Link to="/learner/dashboard">Trang chủ</Link>,
    },
    {
      key: "/learner/learning-path",
      icon: <BookOpen size={18} />,
      label: <Link to="/learner/learning-path">Quản lý lộ trình học tập</Link>,
    },
    {
      key: "learning",
      icon: <GraduationCap size={18} />,
      label: "Học tập",
      children: [
        {
          key: "/learner/dictionary",
          icon: <Search size={16} />,
          label: <Link to="/learner/dictionary">Tra cứu từ điển</Link>,
        },
        {
          key: "/learner/grammar",
          icon: <Languages size={16} />,
          label: <Link to="/learner/grammar">Học ngữ pháp</Link>,
        },
        {
          key: "/learner/vocabulary-topics",
          icon: <BookOpen size={16} />,
          label: <Link to="/learner/vocabulary-topics">Học từ vựng</Link>,
        },
      ],
    },
    {
      key: "/learner/speaking-writing",
      icon: <PenTool size={18} />,
      label: <Link to="/learner/speaking-writing">Luyện S&W</Link>,
    },
    {
      key: "listening-reading",
      icon: <Headphones size={18} />,
      label: "Luyện L&R",
      children: generateListeningReadingMenuItems(),
    },
    {
      key: "practice-tests",
      icon: <ClipboardList size={18} />,
      label: "Làm đề thi thử",
      children: [
        {
          key: "/learner/mini-test",
          icon: <Rocket size={16} />,
          label: <Link to="/learner/mini-test">Mini Test</Link>,
        },
        {
          key: "/learner/full-test",
          icon: <GraduationCap size={16} />,
          label: <Link to="/learner/full-test">Full Test</Link>,
        },
      ],
    },
    {
      key: "others",
      icon: <Settings size={18} />,
      label: "Khác",
      children: [
        {
          key: "/learner/feedback",
          icon: <Star size={16} />,
          label: <Link to="/learner/feedback">Góp ý</Link>,
        },
        {
          key: "/learner/settings",
          icon: <Settings size={16} />,
          label: <Link to="/learner/settings">Cài đặt</Link>,
        },
      ],
    }
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
      key: "/learner/progress",
      icon: <TrendingUp size={16} />,
      label: <Link to="/learner/progress">Tiến độ học tập</Link>,
    },
    {
      key: "/learner/notes",
      icon: <StickyNote size={16} />,
      label: <Link to="/learner/notes">Ghi chú cá nhân</Link>,
    },
    {
      key: "/learner/vocabulary",
      icon: <Heart size={16} />,
      label: <Link to="/learner/vocabulary">Từ vựng đã lưu</Link>,
    },
    {
      key: "/learner/achievements",
      icon: <Star size={16} />,
      label: <Link to="/learner/achievements">Thành tích</Link>,
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
            padding: "0 32px 0 32px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            overflow: "hidden",
            height: "70px",
            minHeight: 64,
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

          <Space size={24} style={{ position: "relative", zIndex: 1, height: '100%', alignItems: 'center' }}>
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
            <div style={{ position: "relative", display: windowWidth > 768 ? 'flex' : 'none', height: '40px', alignItems: 'center' }}>
              <Input
                placeholder="Tìm kiếm..."
                prefix={<Search size={14} style={{ color: "#8c8c8c" }} />}
                style={{
                  width: windowWidth > 1200 ? 220 : windowWidth > 992 ? 180 : 140,
                  borderRadius: "18px",
                  border: "none",
                  background: "rgba(255,255,255,0.96)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  fontSize: "15px",
                  height: "38px",
                  paddingLeft: 32,
                }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onPressEnter={handleSearch}
              />
            </div>
          </Space>

          <Space size={20} style={{ position: "relative", zIndex: 1, height: '100%', alignItems: 'center' }}>
            {/* Study Stats */}
            <Space
              size={12}
              style={{ display: windowWidth > 576 ? "flex" : "none", alignItems: 'center', height: '100%' }}
            >
              <Card
                size="small"
                style={{
                  background: "linear-gradient(135deg, #ff6b6b, #ee5a52)",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "10px",
                  boxShadow: "0 2px 8px rgba(238, 90, 82, 0.2)",
                  transition: "all 0.3s ease",
                  minWidth: 60,
                  minHeight: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={updateStudyProgress}
                bodyStyle={{ padding: "6px 10px", display: 'flex', alignItems: 'center', minHeight: 32 }}
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
                  borderRadius: "10px",
                  boxShadow: "0 2px 8px rgba(79, 172, 254, 0.2)",
                  minWidth: 60,
                  minHeight: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                bodyStyle={{ padding: "6px 10px", display: 'flex', alignItems: 'center', minHeight: 32 }}
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
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', position: 'relative' }}>
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
                      top: 8,
                      right: 2,
                      background: "#ff4d4f",
                      boxShadow: "0 2px 8px rgba(255, 77, 79, 0.3)",
                      minWidth: 16,
                      height: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      padding: 0,
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
                  padding: "4px 12px 4px 8px",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  transition: "all 0.3s ease",
                  height: 40,
                  alignItems: 'center',
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
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {user?.fullName?.charAt(0) || "U"}
                </Avatar>
                <Text
                  style={{
                    display: windowWidth > 768 ? "block" : "none",
                    color: "#fff",
                    fontWeight: "500",
                    fontSize: "15px",
                    marginLeft: 6,
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

        /* ✅ LOẠI BỎ GẠCH CHÂN TRONG DROPDOWN MENU */
        .ant-dropdown-menu .ant-dropdown-menu-item a,
        .ant-dropdown-menu .ant-dropdown-menu-submenu-title a,
        .ant-dropdown a,
        .ant-dropdown-menu a,
        .ant-menu-item a,
        .ant-menu-submenu-title a {
          text-decoration: none !important;
        }

        /* Đảm bảo hover states vẫn hoạt động */
        .ant-dropdown a:hover,
        .ant-dropdown-menu a:hover,
        .ant-menu-item a:hover,
        .ant-menu-submenu-title a:hover {
          text-decoration: none !important;
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
