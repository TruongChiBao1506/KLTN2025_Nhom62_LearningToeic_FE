import React, { useState, useEffect, useCallback, useRef } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
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
  Trophy,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { toast } from "react-toastify";
import authService from "../services/authService";
import sectionService from "../services/sectionsService";
import ChatbotButton from "../components/Learner/Chatbot/ChatbotButton";
import { useAuthStore } from '../hooks/useAuthStore';
import { fetchNotifications, markAsRead, markAllAsRead, addNotification } from '../store/notificationSlice.js';
import socketService from '../services/socketService';

import "./LearnerLayout.css";

import { Layout, Typography, Button, Drawer, Space, Card, Input, Dropdown, Badge, Avatar, Row, Col, Divider, FloatButton, Menu } from "antd";

const { Header, Sider, Content, Footer } = Layout;
const { Title, Text } = Typography;
const { RightOutlined, DownOutlined } = require("@ant-design/icons");



const LearnerLayout = () => {
  // State for submenu open keys (for sidebar)
  const [openKeys, setOpenKeys] = useState([]);
  const { info } = useAuthStore();
  const dispatch = useDispatch();
  const notifications = useSelector(state => state.notifications.notifications);
  const unreadCount = useSelector(state => state.notifications.unreadCount);



  // Debug: Log info để kiểm tra avatar
  useEffect(() => {
    console.log('🎯 LearnerLayout - Current info from Redux:', info);
    console.log('🖼️ LearnerLayout - Avatar value:', info?.avatar);
  }, [info]);

  // Kết nối socket và setup listener khi LearnerLayout mount
  useEffect(() => {
    if (info?.id) {
      console.log('🔌 Connecting socket in LearnerLayout for user:', info.id);
      socketService.connect(info.id); // Connect socket với userId

      // Setup listener cho notification
      const handleNewNotification = (notification) => {
        console.log('🔔 Real-time notification received in LearnerLayout:', notification);
        dispatch(addNotification(notification)); // Thêm vào Redux store
      };
      socketService.on('notification', handleNewNotification);

      // Fetch initial notifications
      dispatch(fetchNotifications(info.id));

      return () => {
        socketService.off('notification', handleNewNotification);
      };
    }
  }, [info?.id, dispatch]);

  // Toggle submenu open/close
  const handleToggleSubmenu = (keys) => {
    // Handle array from Menu onOpenChange
    if (Array.isArray(keys)) {
      // For accordion behavior, we need to handle the open/close logic properly
      // Ant Design Menu onOpenChange gives us the new array of open keys
      setOpenKeys(keys);

      // Load sections when opening listening-reading submenu
      if (keys.includes("listening-reading") && !openKeys.includes("listening-reading") && sections.length === 0) {
        fetchSections();
      }
    }
  };
  // Xử lý sự kiện tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    // Xử lý tìm kiếm, ví dụ:
    toast.info(`Đang tìm kiếm: ${searchQuery}`);
    setSearchQuery("");
  };
  const location = useLocation();

  // States
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
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

  // Load sections on component mount
  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const openKeysRef = useRef(openKeys);
  
  // Keep ref in sync with state
  useEffect(() => {
    openKeysRef.current = openKeys;
  }, [openKeys]);

  // Update openKeys when location changes to keep submenu open for current page
  useEffect(() => {
    const path = location.pathname;
    const currentOpenKeys = openKeysRef.current;
    let newOpenKeys = [...currentOpenKeys];
    let shouldUpdate = false;
    
    // Check if current path is in listening-reading submenu
    if (path.startsWith('/learner/listening-reading/')) {
      if (!newOpenKeys.includes('listening-reading')) {
        newOpenKeys.push('listening-reading');
        shouldUpdate = true;
      }
    }
    
    // Check if current path is in learning submenu
    if (path.startsWith('/learner/dictionary') || path.startsWith('/learner/grammar') || path.startsWith('/learner/topics')) {
      if (!newOpenKeys.includes('learning')) {
        newOpenKeys.push('learning');
        shouldUpdate = true;
      }
    }
    
    // Check if current path is in practice-tests submenu
    if (path.startsWith('/learner/practice-tests/') || path === '/learner/practice-tests') {
      if (!newOpenKeys.includes('practice-tests')) {
        newOpenKeys.push('practice-tests');
        shouldUpdate = true;
      }
    }
    
    if (shouldUpdate) {
      setOpenKeys(newOpenKeys);
    }
  }, [location.pathname]);

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

  const handleLogout = async () => {
    try {
      // Sử dụng authService để đăng xuất
      await authService.signOut();
      localStorage.removeItem("learnerToken");
      localStorage.removeItem("learnerRefreshToken");
      localStorage.removeItem("learnerAccessTokenExpirationTime");
      localStorage.removeItem("learnerRefreshTokenExpirationTime");
      localStorage.removeItem("LearnerAuthenticated");
      dispatch(logout());
      toast.success("Đăng xuất thành công!");
      window.location.href = "/auth/signin";
    } catch (error) {
      console.error(error);
      toast.error("Đã xảy ra lỗi khi đăng xuất.");
    }
  };

  // Generate dynamic menu items for L&R sections
  const generateListeningReadingMenuItems = () => {
    const listeningReadingSections = sections.filter(section =>
      section.type === 1 || section.type === 2 // Listening and Reading
    );

    // Sort sections by Part number for proper ordering
    const sortedSections = listeningReadingSections.sort((a, b) => {
      // Extract part number from section name
      const getPartNumber = (name) => {
        const partMatch = name.match(/Part\s*(\d+)/i);
        return partMatch ? parseInt(partMatch[1]) : 999; // Default high number for non-Part sections
      };

      const partA = getPartNumber(a.name);
      const partB = getPartNumber(b.name);

      return partA - partB;
    });

    // Always include "Luyện theo chuyên đề" item
    const menuItems = [{
      key: "/learner/improve",
      icon: <Target size={16} />,
      label: <Link to="/learner/improve">Luyện theo chuyên đề</Link>,
    }];

    // If sections are loading and we have no sections yet, show loading indicator
    if (sectionsLoading && listeningReadingSections.length === 0) {
      menuItems.unshift({
        key: "loading",
        icon: <FileText size={16} />,
        label: <span style={{ color: '#999' }}>Đang tải...</span>,
        disabled: true,
      });
      return menuItems;
    }

    // Map sections to menu items and add them before "Luyện theo chuyên đề"
    const sectionMenuItems = sortedSections.map(section => {
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

    // Add section items at the beginning, before "Luyện theo chuyên đề"
    menuItems.unshift(...sectionMenuItems);

    return menuItems;
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
          key: "/learner/topics",
          icon: <BookOpen size={16} />,
          label: <Link to="/learner/topics">Học từ vựng</Link>,
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
      key: "/learner/leaderboard",
      icon: <Trophy size={18} />,
      label: <Link to="/learner/leaderboard">Bảng xếp hạng</Link>,
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

  // User menu items with enhanced styling
  const userMenuItems = [
    {
      key: "user-header",
      label: (
        <div 
          style={{ 
            padding: "16px 20px 12px", 
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
            borderRadius: "12px 12px 0 0",
            margin: "-8px -8px 12px",
            color: "#1a202c"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Avatar
              size={48}
              src={info?.avatar}
              style={{
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                border: "2px solid rgba(103, 126, 234, 0.1)",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: "#fff"
              }}
            >
              {info?.name?.charAt(0) || "U"}
            </Avatar>
            <div>
              <div style={{ 
                fontSize: "15px", 
                fontWeight: "600", 
                marginBottom: "2px",
                color: "#1a202c"
              }}>
                {info?.name || "User"}
              </div>
              <div style={{ 
                fontSize: "12px", 
                color: "#64748b"
              }}>
                {info?.email || "user@example.com"}
              </div>
            </div>
          </div>
        </div>
      ),
      disabled: true,
    },
    {
      key: "profile",
      label: (
        <Link 
          to="/learner/profile" 
          className="dropdown-menu-item"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 16px",
            borderRadius: "8px",
            margin: "2px 8px",
            textDecoration: "none",
            color: "#1f2937",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            position: "relative",
            overflow: "hidden",
            background: "#ffffff",
            border: "1px solid rgba(103, 126, 234, 0.15)"
          }}
        >
          <div style={{
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            borderRadius: "8px",
            padding: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <User size={16} style={{ color: "#fff" }} />
          </div>
          <span style={{ fontWeight: "600", fontSize: "14px", color: "#1f2937" }}>Hồ sơ cá nhân</span>
        </Link>
      ),
    },
    {
      key: "/learner/progress",
      label: (
        <Link 
          to="/learner/progress" 
          className="dropdown-menu-item"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 16px",
            borderRadius: "8px",
            margin: "2px 8px",
            textDecoration: "none",
            color: "#1f2937",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            position: "relative",
            overflow: "hidden",
            background: "#ffffff",
            border: "1px solid rgba(16, 185, 129, 0.15)"
          }}
        >
          <div style={{
            background: "linear-gradient(135deg, #10b981, #059669)",
            borderRadius: "8px",
            padding: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <TrendingUp size={16} style={{ color: "#fff" }} />
          </div>
          <span style={{ fontWeight: "600", fontSize: "14px", color: "#1f2937" }}>Tiến độ học tập</span>
        </Link>
      ),
    },
    {
      key: "/learner/notes",
      label: (
        <Link 
          to="/learner/notes" 
          className="dropdown-menu-item"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 16px",
            borderRadius: "8px",
            margin: "2px 8px",
            textDecoration: "none",
            color: "#1f2937",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            position: "relative",
            overflow: "hidden",
            background: "#ffffff",
            border: "1px solid rgba(245, 158, 11, 0.15)"
          }}
        >
          <div style={{
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            borderRadius: "8px",
            padding: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <StickyNote size={16} style={{ color: "#fff" }} />
          </div>
          <span style={{ fontWeight: "600", fontSize: "14px", color: "#1f2937" }}>Ghi chú cá nhân</span>
        </Link>
      ),
    },
    {
      key: "/learner/vocabulary",
      label: (
        <Link 
          to="/learner/vocabulary" 
          className="dropdown-menu-item"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 16px",
            borderRadius: "8px",
            margin: "2px 8px",
            textDecoration: "none",
            color: "#1f2937",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            position: "relative",
            overflow: "hidden",
            background: "#ffffff",
            border: "1px solid rgba(239, 68, 68, 0.15)"
          }}
        >
          <div style={{
            background: "linear-gradient(135deg, #ef4444, #dc2626)",
            borderRadius: "8px",
            padding: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Heart size={16} style={{ color: "#fff" }} />
          </div>
          <span style={{ fontWeight: "600", fontSize: "14px", color: "#1f2937" }}>Từ vựng đã lưu</span>
        </Link>
      ),
    },
    {
      key: "/learner/achievements",
      label: (
        <Link 
          to="/learner/achievements" 
          className="dropdown-menu-item"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 16px",
            borderRadius: "8px",
            margin: "2px 8px",
            textDecoration: "none",
            color: "#1f2937",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            position: "relative",
            overflow: "hidden",
            background: "#ffffff",
            border: "1px solid rgba(139, 92, 246, 0.15)"
          }}
        >
          <div style={{
            background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
            borderRadius: "8px",
            padding: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Star size={16} style={{ color: "#fff" }} />
          </div>
          <span style={{ fontWeight: "600", fontSize: "14px", color: "#1f2937" }}>Thành tích</span>
        </Link>
      ),
    },
    {
      key: "settings",
      label: (
        <Link 
          to="/learner/settings" 
          className="dropdown-menu-item"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 16px",
            borderRadius: "8px",
            margin: "2px 8px",
            textDecoration: "none",
            color: "#1f2937",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            position: "relative",
            overflow: "hidden",
            background: "#ffffff",
            border: "1px solid rgba(107, 114, 128, 0.15)"
          }}
        >
          <div style={{
            background: "linear-gradient(135deg, #6b7280, #4b5563)",
            borderRadius: "8px",
            padding: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Settings size={16} style={{ color: "#fff" }} />
          </div>
          <span style={{ fontWeight: "600", fontSize: "14px", color: "#1f2937" }}>Cài đặt</span>
        </Link>
      ),
    },
    {
      type: "divider",
      style: { 
        margin: "12px 8px",
        background: "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.06) 50%, transparent 100%)"
      }
    },
    {
      key: "logout",
      label: (
        <div 
          onClick={handleLogout}
          className="dropdown-menu-item logout-item"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 16px",
            borderRadius: "8px",
            margin: "2px 8px 8px",
            cursor: "pointer",
            color: "#dc2626",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            position: "relative",
            overflow: "hidden",
            background: "#ffffff",
            border: "1px solid rgba(239, 68, 68, 0.2)"
          }}
        >
          <div style={{
            background: "linear-gradient(135deg, #ef4444, #dc2626)",
            borderRadius: "8px",
            padding: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <LogOut size={16} style={{ color: "#fff" }} />
          </div>
          <span style={{ fontWeight: "600", fontSize: "14px", color: "#dc2626" }}>Đăng xuất</span>
        </div>
      ),
    },
  ];

  // Notification menu items with enhanced styling
  const notificationMenuItems = [
    {
      key: "header",
      label: (
        <div 
          className="notification-dropdown-header"
          style={{ 
            padding: "16px 20px 12px", 
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
            borderRadius: "12px 12px 0 0",
            margin: "-8px -8px 8px",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                borderRadius: "6px",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Bell size={14} style={{ color: "#fff" }} />
              </div>
              <Text strong style={{ fontSize: "15px", fontWeight: "600", color: "#1a202c" }}>
                Thông báo
              </Text>
            </div>
            <Button
              type="link"
              size="small"
              onClick={() => dispatch(markAllAsRead(info.id))}
              style={{ 
                padding: "4px 8px", 
                fontSize: "12px",
                background: "rgba(103, 126, 234, 0.1)",
                borderRadius: "6px",
                color: "#667eea",
                fontWeight: "500",
                border: "none",
                height: "auto"
              }}
              className="mark-read-btn"
            >
              Đánh dấu đã đọc
            </Button>
          </div>
        </div>
      ),
      disabled: true,
    },
    ...(notifications.length > 0
      ? notifications.map((notification, index) => ({
        key: notification.id,
        label: (
          <div 
            className="notification-dropdown-item"
            style={{ 
              padding: "14px 16px",
              borderRadius: "8px",
              margin: "4px 8px",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              cursor: "pointer",
              border: "1px solid transparent",
              background: !notification.isRead 
                ? "linear-gradient(135deg, rgba(103, 126, 234, 0.05) 0%, rgba(79, 172, 254, 0.05) 100%)"
                : "transparent",
              position: "relative",
              overflow: "hidden"
            }}
          >
            {!notification.isRead && (
              <div style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: "3px",
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                borderRadius: "0 2px 2px 0"
              }} />
            )}
            <div style={{ 
              display: "flex", 
              alignItems: "flex-start", 
              gap: "12px",
              paddingLeft: !notification.isRead ? "8px" : "0"
            }}>
              <div style={{
                background: !notification.isRead 
                  ? "linear-gradient(135deg, #667eea, #764ba2)"
                  : "linear-gradient(135deg, #e2e8f0, #cbd5e0)",
                borderRadius: "8px",
                padding: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "32px",
                height: "32px",
                marginTop: "2px"
              }}>
                <Bell size={14} style={{ 
                  color: !notification.isRead ? "#fff" : "#64748b" 
                }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ 
                  fontWeight: !notification.isRead ? "600" : "500",
                  fontSize: "14px",
                  color: !notification.isRead ? "#1a202c" : "#4a5568",
                  marginBottom: "4px",
                  lineHeight: "1.4",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden"
                }}>
                  {notification.title}
                </div>
                <div style={{ 
                  fontSize: "13px", 
                  color: "#64748b", 
                  marginBottom: "6px",
                  lineHeight: "1.4",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden"
                }}>
                  {notification.message}
                </div>
                <div style={{ 
                  fontSize: "11px", 
                  color: "#94a3b8",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}>
                  <Clock size={10} />
                  {notification.timestamp ? new Date(notification.timestamp).toLocaleString('vi-VN') : notification.createdAt ? new Date(notification.createdAt).toLocaleString('vi-VN') : 'Vừa xong'}
                </div>
              </div>
            </div>
          </div>
        ),
      }))
      : [
        {
          key: "empty",
          label: (
            <div
              style={{ 
                padding: "32px 20px", 
                textAlign: "center",
                color: "#94a3b8"
              }}
            >
              <div style={{
                background: "linear-gradient(135deg, #e2e8f0, #cbd5e0)",
                borderRadius: "50%",
                width: "48px",
                height: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px"
              }}>
                <Bell size={20} style={{ color: "#64748b" }} />
              </div>
              <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>
                Không có thông báo nào
              </div>
              <div style={{ fontSize: "12px", color: "#cbd5e0" }}>
                Bạn sẽ nhận được thông báo tại đây
              </div>
            </div>
          ),
          disabled: true,
        },
      ]),
    {
      type: "divider",
      style: { 
        margin: "8px 0",
        background: "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.06) 50%, transparent 100%)"
      }
    },
    {
      key: "viewAll",
      label: (
        <Link 
          to="/learner/notifications" 
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 16px",
            margin: "4px 8px 8px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            color: "#fff",
            textDecoration: "none",
            fontWeight: "500",
            fontSize: "14px",
            transition: "all 0.3s ease",
            gap: "6px"
          }}
          className="view-all-notifications"
        >
          <span>Xem tất cả thông báo</span>
          <ArrowRight size={14} />
        </Link>
      ),
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
            openKeys={openKeys}
            onOpenChange={handleToggleSubmenu}
            items={menuItems}
            style={{
              border: "none",
              background: "transparent",
            }}
          />
        </div>
      </Drawer>

      {/* Sidebar learner style giống admin, giữ submenu */}
      <div className={`learner-sidebar ${collapsed ? '' : 'active'}`}> 
        {/* Header Section */}
        <div className="sidebar-header" style={{display: 'flex', alignItems: 'center'}}>
          <div className="logo-container" style={{display: 'flex', alignItems: 'center'}}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: collapsed ? '0' : '12px',
              flexShrink: 0
            }}>
              <GraduationCap size={24} style={{ color: '#764ba2' }} />
            </div>
            {!collapsed && (
              <div style={{ overflow: 'hidden' }}>
                <div style={{
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  lineHeight: '1.2'
                }}>
                  TOEIC Learning
                </div>
                <div style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '12px',
                  fontWeight: '500',
                  marginTop: '2px'
                }}>
                  Learner Panel
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Navigation Menu */}
        <div className="sidebar-nav">
          <ul className="nav-list">
            {menuItems.map(item => (
              <li key={item.key} className="nav-item">
                <div
                  className={`nav-link ${location.pathname === item.key ? 'active' : ''}`}
                  onClick={() => {
                    if (item.children) {
                      // Toggle submenu for sidebar
                      const newOpenKeys = openKeys.includes(item.key)
                        ? openKeys.filter(key => key !== item.key)
                        : [...openKeys, item.key];
                      setOpenKeys(newOpenKeys);
                      
                      // Load sections when opening listening-reading submenu
                      if (newOpenKeys.includes("listening-reading") && !openKeys.includes("listening-reading") && sections.length === 0) {
                        fetchSections();
                      }
                    } else {
                      window.location.pathname = item.key;
                    }
                  }}
                  data-tooltip={item.label?.props?.children || item.label}
                  style={{ cursor: item.children ? 'pointer' : 'default' }}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {!collapsed && <span className="nav-text">{item.label?.props?.children || item.label}</span>}
                  {/* Arrow for submenu */}
                  {item.children && !collapsed && (
                    <span className="nav-arrow" style={{ marginLeft: 8, transition: 'transform 0.3s' }}>
                      {openKeys.includes(item.key) ? <DownOutlined /> : <RightOutlined />}
                    </span>
                  )}
                </div>
                {item.children && !collapsed && (
                  <ul className={`nav-submenu ${openKeys.includes(item.key) ? 'expanded' : 'collapsed'}`}>
                    {item.children.map((sub, index) => (
                      <li key={sub.key}>
                        <div
                          className={`nav-link ${location.pathname === sub.key ? 'active' : ''}`}
                          onClick={() => window.location.pathname = sub.key}
                          data-tooltip={sub.label?.props?.children || sub.label}
                        >
                          <span className="nav-icon">{sub.icon}</span>
                          <span className="nav-text">{sub.label?.props?.children || sub.label}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Layout style={{ marginLeft: collapsed ? '80px' : '280px', transition: 'margin-left 0.3s ease' }}>
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
            {/* Sidebar Toggle Button - moved to header */}
            <button
              className="sidebar-toggle-btn"
              onClick={() => setCollapsed(!collapsed)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '22px',
                marginRight: '12px',
                padding: '4px 8px'
              }}
              aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu nhỏ sidebar'}
            >
              {collapsed ? <MenuIcon size={22} /> : <MenuIcon size={22} />}
            </button>
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
              overlayStyle={{
                borderRadius: "12px",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                border: "1px solid rgba(0, 0, 0, 0.05)",
                background: "#fff",
                minWidth: "360px",
                maxWidth: "400px",
                padding: "0",
                overflow: "hidden"
              }}
              overlayClassName="custom-notification-dropdown"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', position: 'relative' }}>
                <Button
                  type="text"
                  icon={<Bell size={18} />}
                  style={{
                    background: unreadCount > 0
                      ? "linear-gradient(135deg, #a8edea, #fed6e3)"
                      : "rgba(255,255,255,0.15)",
                    color: unreadCount > 0
                      ? "#722ed1"
                      : "#fff",
                    border: "none",
                    borderRadius: "8px",
                    width: "36px",
                    height: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: unreadCount > 0
                      ? "0 2px 8px rgba(168, 237, 234, 0.3)"
                      : "0 2px 8px rgba(0,0,0,0.08)",
                    transition: "all 0.3s ease",
                  }}
                />
                {unreadCount > 0 && (
                  <Badge
                    count={unreadCount}
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
            <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <Dropdown
                menu={{ items: userMenuItems }}
                trigger={["click"]}
                placement="bottomRight"
                overlayStyle={{
                  borderRadius: "12px",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  border: "1px solid rgba(0, 0, 0, 0.05)",
                  background: "#fff",
                  minWidth: "280px",
                  padding: "0",
                  overflow: "hidden"
                }}
                overlayClassName="custom-user-dropdown"
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
                    src={info?.avatar}
                    style={{
                      background: "linear-gradient(135deg, #667eea, #764ba2)",
                      color: "#fff",
                      border: "2px solid rgba(255,255,255,0.3)",
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {info?.name?.charAt(0) || "U"}
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
                    {info?.name || "User"}
                  </Text>
                </Space>
              </Dropdown>
            </div>
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

        /* ✅ CUSTOM DROPDOWN MENU STYLING */
        .custom-notification-dropdown .ant-dropdown-menu,
        .custom-user-dropdown .ant-dropdown-menu {
          padding: 0 !important;
          border-radius: 12px !important;
          background: #fff !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
          border: 1px solid rgba(0, 0, 0, 0.05) !important;
          overflow: hidden !important;
          animation: dropdownSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          transform-origin: top right !important;
        }

        @keyframes dropdownSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        /* Notification dropdown specific styling */
        .custom-notification-dropdown .notification-dropdown-item:hover {
          background: linear-gradient(135deg, rgba(103, 126, 234, 0.08) 0%, rgba(79, 172, 254, 0.08) 100%) !important;
          border-color: rgba(103, 126, 234, 0.1) !important;
          transform: translateX(2px) !important;
          box-shadow: 0 4px 12px rgba(103, 126, 234, 0.1) !important;
        }

        .custom-notification-dropdown .mark-read-btn:hover {
          background: rgba(103, 126, 234, 0.15) !important;
          transform: translateY(-1px) !important;
        }

        .custom-notification-dropdown .view-all-notifications:hover {
          background: linear-gradient(135deg, #764ba2, #667eea) !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 6px 20px rgba(118, 75, 162, 0.3) !important;
        }

            /* User dropdown specific styling */
            .custom-user-dropdown .dropdown-menu-item:hover {
              background: rgba(248, 250, 252, 0.8) !important;
              border-color: rgba(103, 126, 234, 0.2) !important;
              transform: translateX(2px) !important;
              box-shadow: 0 4px 12px rgba(103, 126, 234, 0.1) !important;
            }

            .custom-user-dropdown .logout-item:hover {
              background: rgba(254, 242, 242, 0.9) !important;
              border-color: rgba(239, 68, 68, 0.25) !important;
              transform: translateX(2px) !important;
              box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15) !important;
            }        /* Enhanced dropdown item animations */
        .custom-notification-dropdown .ant-dropdown-menu-item,
        .custom-user-dropdown .ant-dropdown-menu-item {
          padding: 0 !important;
          margin: 0 !important;
          border-radius: 0 !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .custom-notification-dropdown .ant-dropdown-menu-item:hover,
        .custom-user-dropdown .ant-dropdown-menu-item:hover {
          background: transparent !important;
        }

        /* Responsive dropdown styling */
        @media (max-width: 768px) {
          .custom-notification-dropdown .ant-dropdown-menu,
          .custom-user-dropdown .ant-dropdown-menu {
            min-width: 300px !important;
            max-width: 90vw !important;
          }
          
          .custom-notification-dropdown {
            transform: translateX(-20px) !important;
          }
          
          .custom-user-dropdown {
            transform: translateX(-10px) !important;
          }
        }

        @media (max-width: 480px) {
          .custom-notification-dropdown .ant-dropdown-menu,
          .custom-user-dropdown .ant-dropdown-menu {
            min-width: 280px !important;
            max-width: 85vw !important;
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

        /* Additional dropdown enhancements */
        .custom-notification-dropdown .ant-dropdown-menu-item-disabled,
        .custom-user-dropdown .ant-dropdown-menu-item-disabled {
          opacity: 1 !important;
        }

        .custom-notification-dropdown .ant-dropdown-menu-item-divider,
        .custom-user-dropdown .ant-dropdown-menu-item-divider {
          margin: 8px 0 !important;
          background: linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.06) 50%, transparent 100%) !important;
          height: 1px !important;
        }

        /* Notification badge pulse animation */
        .ant-badge-count {
          animation: badgePulse 2s ease-in-out infinite !important;
        }

        @keyframes badgePulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.7);
          }
          70% {
            transform: scale(1.05);
            box-shadow: 0 0 0 6px rgba(255, 77, 79, 0);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(255, 77, 79, 0);
          }
        }

        /* Backdrop blur effect for dropdowns */
        .ant-dropdown-open .ant-dropdown-trigger {
          backdrop-filter: blur(4px) !important;
        }
      `}</style>
    </Layout>
  );
};

export default LearnerLayout;
