import React, { useState, useEffect, useCallback, useRef } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import toeicLogo from "../assets/Toeic_logo.png";
import {
  User,
  Settings,
  Menu as MenuIcon,
  X,
  Bell,
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
  UserPlus,
  Video,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { toast } from "react-toastify";
import authService from "../services/authService";
import sectionService from "../services/sectionsService";
import ChatbotButton from "../components/Learner/Chatbot/ChatbotButton";
import { useAuthStore } from "../hooks/useAuthStore";
import useNotifications from "../hooks/useNotifications";
import {
  fetchNotifications,
  markAllAsRead,
} from "../store/notificationSlice.js";
import socketService from "../services/socketService";
import {
  getNotificationsByRole,
  getRoleSpecificCounts,
} from "../utils/notificationRoleFilter";

import "./LearnerLayout.css";

import {
  Layout,
  Typography,
  Button,
  Drawer,
  Space,
  Card,
  Input,
  Dropdown,
  Badge,
  Avatar,
  Row,
  Col,
  Divider,
  FloatButton,
  Menu,
} from "antd";

const { Header, Content, Footer } = Layout;
const { Text } = Typography;
const { RightOutlined, DownOutlined } = require("@ant-design/icons");

const LearnerLayout = () => {
  // State for submenu open keys (for sidebar)
  const [openKeys, setOpenKeys] = useState([]);
  const { info } = useAuthStore();
  const dispatch = useDispatch();

  // Helper function to check if user is a teacher (memoized)
  const isTeacher = useCallback(() => {
    console.log("🔍 isTeacher check - info:", info);

    if (!info) {
      console.log("❌ No info");
      return false;
    }

    // ✅ FIX: Check if roles array contains role object with name 'ROLE_TEACHER'
    if (Array.isArray(info.roles)) {
      console.log("📋 info.roles:", info.roles);

      // Check if any role object has name 'ROLE_TEACHER'
      const hasTeacherRole = info.roles.some((role) => {
        // Handle both string and object formats
        if (typeof role === "string") {
          return role === "ROLE_TEACHER";
        }
        // Handle object format: {_id: '...', name: 'ROLE_TEACHER'}
        return role.name === "ROLE_TEACHER";
      });

      console.log("✅ hasTeacherRole:", hasTeacherRole);
      return hasTeacherRole;
    }

    // Check if role string is 'ROLE_TEACHER' (legacy format)
    if (typeof info.role === "string") {
      console.log("📝 info.role (string):", info.role);
      return info.role === "ROLE_TEACHER";
    }

    // Fallback to isTeacher boolean field
    const fallbackCheck = info.isTeacher === true;
    console.log("⚠️ Fallback isTeacher:", fallbackCheck);
    return fallbackCheck;
  }, [info]);

  // Get hook and create stable reference
  const notificationHook = useNotifications();
  const handleNotificationRef = useRef(notificationHook.handleNotification);

  // Update ref when hook changes (won't trigger re-render)
  useEffect(() => {
    handleNotificationRef.current = notificationHook.handleNotification;
  }, [notificationHook.handleNotification]);

  const allNotifications = useSelector(
    (state) => state.notifications.notifications
  );
  const allCounts = useSelector((state) => state.notifications.counts);

  // Filter notifications for learner role
  const notifications = React.useMemo(
    () => getNotificationsByRole(allNotifications, "learner"),
    [allNotifications]
  );

  const roleCounts = React.useMemo(
    () => getRoleSpecificCounts(allCounts, "learner"),
    [allCounts]
  );

  const unreadCount = roleCounts.total || 0;

  // Kết nối socket và setup listener khi LearnerLayout mount
  // Use stable callback with useRef to prevent duplicate listeners
  const handleNewNotification = useCallback((notification) => {
    console.log(
      "🔔 Real-time notification received in LearnerLayout:",
      notification
    );
    // Use ref to get latest handler without recreating callback
    handleNotificationRef.current(notification);
  }, []); // ← Empty deps = STABLE callback

  useEffect(() => {
    if (!info?.id) {
      console.log("⚠️ No user info, skipping socket connection");
      return;
    }

    console.log("🔌 Setting up socket connection for user:", info.id);

    // Connect socket
    socketService.connect(info.id);

    // Register listener ONCE
    console.log("📝 Registering notification listener...");
    socketService.on("notification", handleNewNotification);

    // Fetch initial notifications
    dispatch(fetchNotifications(info.id));

    // Log listener count for debugging
    const counts = socketService.getListenerCounts();
    console.log("📊 Listener counts after registration:", counts);

    // 🔧 CRITICAL: Cleanup function to remove listener on unmount
    return () => {
      console.log("🧹 Cleaning up notification listener in LearnerLayout");
      socketService.off("notification", handleNewNotification);

      const countsAfter = socketService.getListenerCounts();
      console.log("📊 Listener counts after cleanup:", countsAfter);
    };
  }, [info?.id, dispatch, handleNewNotification]); // handleNewNotification is now STABLE

  // Toggle submenu open/close
  const handleToggleSubmenu = (keys) => {
    // Handle array from Menu onOpenChange
    if (Array.isArray(keys)) {
      // For accordion behavior, we need to handle the open/close logic properly
      // Ant Design Menu onOpenChange gives us the new array of open keys
      setOpenKeys(keys);

      // Load sections when opening listening-reading submenu
      if (
        keys.includes("listening-reading") &&
        !openKeys.includes("listening-reading") &&
        sections.length === 0
      ) {
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
  const [studyStreak, setStudyStreak] = useState(
    parseInt(localStorage.getItem("studyStreak") || "0")
  );
  const [todayStudyTime, setTodayStudyTime] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [sections, setSections] = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [, setLastSectionsUpdate] = useState(Date.now());
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
    if (path.startsWith("/learner/listening-reading/")) {
      if (!newOpenKeys.includes("listening-reading")) {
        newOpenKeys.push("listening-reading");
        shouldUpdate = true;
      }
    }

    // Check if current path is in learning submenu
    if (
      path.startsWith("/learner/dictionary") ||
      path.startsWith("/learner/grammar") ||
      path.startsWith("/learner/topics")
    ) {
      if (!newOpenKeys.includes("learning")) {
        newOpenKeys.push("learning");
        shouldUpdate = true;
      }
    }

    // Check if current path is in practice-tests submenu
    if (
      path.startsWith("/learner/practice-tests/") ||
      path === "/learner/practice-tests"
    ) {
      if (!newOpenKeys.includes("practice-tests")) {
        newOpenKeys.push("practice-tests");
        shouldUpdate = true;
      }
    }

    if (shouldUpdate) {
      setOpenKeys(newOpenKeys);
    }
  }, [location.pathname]);

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
      // ✅ Clear ALL tokens (user might have multiple roles)
      authService.clearAuth();
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
    const listeningReadingSections = sections.filter(
      (section) => section.type === 1 || section.type === 2 // Listening and Reading
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
    const menuItems = [
      {
        key: "/learner/improve",
        icon: <Target size={16} />,
        label: <Link to="/learner/improve">Luyện theo chuyên đề</Link>,
      },
    ];

    // If sections are loading and we have no sections yet, show loading indicator
    if (sectionsLoading && listeningReadingSections.length === 0) {
      menuItems.unshift({
        key: "loading",
        icon: <FileText size={16} />,
        label: (
          <span style={{ color: "var(--color-text-disabled)" }}>
            Đang tải...
          </span>
        ),
        disabled: true,
      });
      return menuItems;
    }

    // Map sections to menu items and add them before "Luyện theo chuyên đề"
    const sectionMenuItems = sortedSections.map((section) => {
      // Generate route based on section name for backward compatibility
      // let routePath = "";
      // if (section.name.includes("Part 1")) routePath = "/learner/part-1";
      // else if (section.name.includes("Part 2")) routePath = "/learner/part-2";
      // else if (section.name.includes("Part 3")) routePath = "/learner/part-3";
      // else if (section.name.includes("Part 4")) routePath = "/learner/part-4";
      // else if (section.name.includes("Part 5")) routePath = "/learner/part-5";
      // else if (section.name.includes("Part 6")) routePath = "/learner/part-6";
      // else if (section.name.includes("Part 7")) routePath = "/learner/part-7";
      // else routePath = `/learner/section/${section._id}`;
      // Extract part number from section name
      const partMatch = section.name.match(/Part\s*(\d+)/i);
      const partNumber = partMatch ? partMatch[1] : null;
      let routePath = partNumber
        ? `/learner/part-${partNumber}/${section._id}`
        : `/learner/section/${section._id}`;
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
      label: <Link to="/learner/speaking-writing">Luyện Speaking & Writing</Link>,
    },

    // {
    //   key: "/learner/improve",
    //   icon: <Headphones size={18} />,
    //   label: <Link to="/learner/improve">Cải thiện kỹ năng</Link>,
    // },
    {
      key: "/learner/listening-reading",
      icon: <Headphones size={18} />,
      label: "Luyện Listening & Reading",
      children: generateListeningReadingMenuItems(),
    },
    {
      key: "practice-tests",
      icon: <ClipboardList size={18} />,
      label: "Thi mô phỏng",
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
        {
          key: "/learner/ai-speaking",
          icon: <Video size={16} />,
          label: <Link to="/learner/ai-speaking">Luyện Nói AI</Link>,
        },
      ],
    },
    {
      key: "/learner/leaderboard",
      icon: <Trophy size={18} />,
      label: <Link to="/learner/leaderboard">Bảng xếp hạng</Link>,
    },
    {
      key: "/learner/blog",
      icon: <FileText size={18} />,
      label: <Link to="/learner/blog">Blog</Link>,
    },
    {
      key: "others",
      icon: <Settings size={18} />,
      label: "Khác",
      children: [
        {
          key: "/learner/become-teacher",
          icon: <UserPlus size={16} />,
          label: <Link to="/learner/become-teacher">Đăng ký làm giáo viên</Link>,
        },
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

  // User menu items with enhanced styling
  const userMenuItems = [
    {
      key: "user-header",
      label: (
        <div
          style={{
            padding: "16px 20px 12px",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            background: "#F8F9FA",
            borderRadius: "12px 12px 0 0",
            margin: "-8px -8px 12px",
            color: "#1a202c",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Avatar
              size={48}
              src={info?.avatar}
              style={{
                background: "#2C5F8D",
                border: "2px solid rgba(103, 126, 234, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-bg-primary)",
              }}
            >
              {info?.name?.charAt(0) || "U"}
            </Avatar>
            <div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  marginBottom: "2px",
                  color: "#1a202c",
                }}
              >
                {info?.name || "User"}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                }}
              >
                {info?.email || "user@example.com"}
              </div>
              {/* Teacher badge - show if user has ROLE_TEACHER */}
              {isTeacher() && (
                <div
                  style={{
                    fontSize: "11px",
                    marginTop: "4px",
                    padding: "2px 8px",
                    background: "#27AE60",
                    color: "var(--color-bg-primary)",
                    borderRadius: "4px",
                    display: "inline-block",
                    fontWeight: "500",
                  }}
                >
                  Teacher
                </div>
              )}
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
            background: "var(--color-bg-primary)",
            border: "1px solid rgba(103, 126, 234, 0.15)",
          }}
        >
          <div
            style={{
              background: "#2C5F8D",
              borderRadius: "8px",
              padding: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <User size={16} style={{ color: "var(--color-bg-primary)" }} />
          </div>
          <span
            style={{ fontWeight: "600", fontSize: "12px", color: "#1f2937" }}
          >
            Hồ sơ cá nhân
          </span>
        </Link>
      ),
    },
    // Teacher Content Management - Only show if user has ROLE_TEACHER
    ...(isTeacher()
      ? [
          {
            key: "teacher-content",
            label: (
              <Link
                to="/teacher/"
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
                  background: "var(--color-bg-primary)",
                  border: "1px solid rgba(16, 185, 129, 0.15)",
                }}
              >
                <div
                  style={{
                    background: "#27AE60",
                    borderRadius: "8px",
                    padding: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <BookOpen
                    size={16}
                    style={{ color: "var(--color-bg-primary)" }}
                  />
                </div>
                <span
                  style={{
                    fontWeight: "600",
                    fontSize: "12px",
                    color: "#1f2937",
                  }}
                >
                  Quản lý nội dung
                </span>
              </Link>
            ),
          },
        ]
      : []),
    // {
    //   key: "/learner/progress",
    //   label: (
    //     <Link
    //       to="/learner/progress"
    //       className="dropdown-menu-item"
    //       style={{
    //         display: "flex",
    //         alignItems: "center",
    //         gap: "12px",
    //         padding: "12px 16px",
    //         borderRadius: "8px",
    //         margin: "2px 8px",
    //         textDecoration: "none",
    //         color: "#1f2937",
    //         transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    //         position: "relative",
    //         overflow: "hidden",
    //         background: "var(--color-bg-primary)",
    //         border: "1px solid rgba(16, 185, 129, 0.15)",
    //       }}
    //     >
    //       <div
    //         style={{
    //           background: "#27AE60",
    //           borderRadius: "8px",
    //           padding: "8px",
    //           display: "flex",
    //           alignItems: "center",
    //           justifyContent: "center",
    //         }}
    //       >
    //         <TrendingUp
    //           size={16}
    //           style={{ color: "var(--color-bg-primary)" }}
    //         />
    //       </div>
    //       <span
    //         style={{ fontWeight: "600", fontSize: "12px", color: "#1f2937" }}
    //       >
    //         Tiến độ học tập
    //       </span>
    //     </Link>
    //   ),
    // },
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
            background: "var(--color-bg-primary)",
            border: "1px solid rgba(245, 158, 11, 0.15)",
          }}
        >
          <div
            style={{
              background: "#F39C12",
              borderRadius: "8px",
              padding: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <StickyNote
              size={16}
              style={{ color: "var(--color-bg-primary)" }}
            />
          </div>
          <span
            style={{ fontWeight: "600", fontSize: "12px", color: "#1f2937" }}
          >
            Ghi chú cá nhân
          </span>
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
            background: "var(--color-bg-primary)",
            border: "1px solid rgba(239, 68, 68, 0.15)",
          }}
        >
          <div
            style={{
              background: "#E74C3C",
              borderRadius: "8px",
              padding: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Heart size={16} style={{ color: "var(--color-bg-primary)" }} />
          </div>
          <span
            style={{ fontWeight: "600", fontSize: "12px", color: "#1f2937" }}
          >
            Từ vựng đã lưu
          </span>
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
            background: "var(--color-bg-primary)",
            border: "1px solid rgba(139, 92, 246, 0.15)",
          }}
        >
          <div
            style={{
              background: "#8E44AD",
              borderRadius: "8px",
              padding: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Star size={16} style={{ color: "var(--color-bg-primary)" }} />
          </div>
          <span
            style={{ fontWeight: "600", fontSize: "12px", color: "#1f2937" }}
          >
            Thành tích
          </span>
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
            background: "var(--color-bg-primary)",
            border: "1px solid rgba(107, 114, 128, 0.15)",
          }}
        >
          <div
            style={{
              background: "#7F8C8D",
              borderRadius: "8px",
              padding: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Settings size={16} style={{ color: "var(--color-bg-primary)" }} />
          </div>
          <span
            style={{ fontWeight: "600", fontSize: "12px", color: "#1f2937" }}
          >
            Cài đặt
          </span>
        </Link>
      ),
    },
    {
      type: "divider",
      style: {
        margin: "12px 8px",
        background:
          "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.06) 50%, transparent 100%)",
      },
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
            background: "var(--color-bg-primary)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
          }}
        >
          <div
            style={{
              background: "#E74C3C",
              borderRadius: "8px",
              padding: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LogOut size={16} style={{ color: "var(--color-bg-primary)" }} />
          </div>
          <span
            style={{ fontWeight: "600", fontSize: "12px", color: "#dc2626" }}
          >
            Đăng xuất
          </span>
        </div>
      ),
    },
  ];

  // Notification menu items with enhanced styling
  const renderNotificationLabel = (notification) => (
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
        overflow: "hidden",
      }}
    >
      {!notification.isRead && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "3px",
            background: "#2C5F8D",
            borderRadius: "0 2px 2px 0",
          }}
        />
      )}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
          paddingLeft: !notification.isRead ? "8px" : "0",
        }}
      >
        <div
          style={{
            background: !notification.isRead ? "#2C5F8D" : "#ECF0F1",
            borderRadius: "8px",
            padding: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: "32px",
            height: "32px",
            marginTop: "2px",
          }}
        >
          <Bell
            size={14}
            style={{
              color: !notification.isRead ? "var(--color-bg-primary)" : "#64748b",
            }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: !notification.isRead ? "600" : "500",
              fontSize: "12px",
              color: !notification.isRead ? "#1a202c" : "#4a5568",
              marginBottom: "4px",
              lineHeight: "1.4",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {notification.title}
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "#64748b",
              marginBottom: "6px",
              lineHeight: "1.4",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {notification.message}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "#94a3b8",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <Clock size={10} />
            {notification.timestamp
              ? new Date(notification.timestamp).toLocaleString("vi-VN")
              : notification.createdAt
              ? new Date(notification.createdAt).toLocaleString("vi-VN")
              : "Vừa xong"}
          </div>
        </div>
      </div>
    </div>
  );

  const notificationItems = notifications.length > 0
    ? notifications.map((notification) => ({ key: notification.id, label: renderNotificationLabel(notification) }))
    : [
      {
        key: "empty",
        label: (
          <div
            style={{
              padding: "32px 20px",
              textAlign: "center",
              color: "#94a3b8",
            }}
          >
            <div
              style={{
                background: "#ECF0F1",
                borderRadius: "50%",
                width: "48px",
                height: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
              }}
            >
              <Bell size={20} style={{ color: "#64748b" }} />
            </div>
            <div style={{ fontSize: "12px", fontWeight: "500", marginBottom: "4px" }}>
              Không có thông báo nào
            </div>
            <div style={{ fontSize: "12px", color: "#cbd5e0" }}>
              Bạn sẽ nhận được thông báo tại đây
            </div>
          </div>
        ),
        disabled: true,
      },
    ];

  const notificationMenuItems = [
    {
      key: "header",
      label: (
        <div
          className="notification-dropdown-header"
          style={{
            padding: "16px 20px 12px",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            background: "#F8F9FA",
            borderRadius: "12px 12px 0 0",
            margin: "-8px -8px 8px",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  background: "#2C5F8D",
                  borderRadius: "6px",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Bell size={14} style={{ color: "var(--color-bg-primary)" }} />
              </div>
              <span style={{ fontSize: "12px", fontWeight: "600", color: "#1a202c" }}>
                Thông báo {unreadCount > 0 && `(${unreadCount})`}
              </span>
            </div>
            <Button
              type="link"
              size="small"
              onClick={() => dispatch(markAllAsRead(info?.id))}
              style={{
                padding: "4px 8px",
                fontSize: "12px",
                background: "rgba(103, 126, 234, 0.1)",
                borderRadius: "6px",
                color: "var(--color-brand-purple)",
                fontWeight: "500",
                border: "none",
                height: "auto",
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
    ...(notificationItems.length > 0 ? notificationItems.slice(0, 5) : notificationItems),
    {
      type: "divider",
      style: {
        margin: "8px 0",
        background: "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.06) 50%, transparent 100%)",
      },
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
            background: "#2C5F8D",
            color: "var(--color-bg-primary)",
            textDecoration: "none",
            fontWeight: "500",
            fontSize: "12px",
            transition: "all 0.3s ease",
            gap: "6px",
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
              background: "#2C5F8D",
              margin: "-24px -24px 0 -24px",
              padding: "20px 24px",
              color: "var(--color-bg-primary)",
            }}
          >
            <Space>
              <div
                style={{
                  background: "white",
                  borderRadius: "10px",
                  padding: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "40px",
                  height: "40px",
                }}
              >
                <img
                  src={toeicLogo}
                  alt="TOEIC Logo"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
              <div
                style={{
                  color: "var(--color-bg-primary)",
                  fontSize: "13px",
                  fontWeight: "700",
                  background: "rgba(255,255,255,0.2)",
                  padding: "6px 12px",
                  borderRadius: "10px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                📚 Học viên
              </div>
            </Space>
            <Button
              type="text"
              icon={<X size={20} />}
              onClick={() => setMobileDrawerVisible(false)}
              style={{
                color: "var(--color-bg-primary)",
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
          background: "#FFFFFF",
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
      <div className={`learner-sidebar ${collapsed ? "" : "active"}`}>
        {/* Header Section */}
        <div
          className="sidebar-header"
          style={{ display: "flex", alignItems: "center" }}
        >
          <div
            className="logo-container"
            style={{ display: "flex", alignItems: "center" }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                background: "white",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: collapsed ? "0" : "12px",
                flexShrink: 0,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                border: "2px solid rgba(255,255,255,0.3)",
                padding: "4px",
              }}
            >
              <img
                src={toeicLogo}
                alt="TOEIC Logo"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            </div>
            {!collapsed && (
              <div style={{ overflow: "hidden" }}>
                <div
                  style={{
                    color: "#5DADE2",
                    fontSize: "13px",
                    fontWeight: "600",
                    background: "rgba(255,255,255,0.15)",
                    padding: "6px 12px",
                    borderRadius: "12px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  <span>📚</span>
                  Học viên
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Navigation Menu */}
        <div className="sidebar-nav">
          <ul className="nav-list">
            {menuItems.map((item) => (
              <li key={item.key} className="nav-item">
                <div
                  className={`nav-link ${location.pathname === item.key ? "active" : ""
                    }`}
                  onClick={() => {
                    if (item.children) {
                      // Toggle submenu for sidebar
                      const newOpenKeys = openKeys.includes(item.key)
                        ? openKeys.filter((key) => key !== item.key)
                        : [...openKeys, item.key];
                      setOpenKeys(newOpenKeys);

                      // Load sections when opening listening-reading submenu
                      if (
                        newOpenKeys.includes("listening-reading") &&
                        !openKeys.includes("listening-reading") &&
                        sections.length === 0
                      ) {
                        fetchSections();
                      }
                    } else {
                      window.location.pathname = item.key;
                    }
                  }}
                  data-tooltip={item.label?.props?.children || item.label}
                  style={{ cursor: item.children ? "pointer" : "default" }}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {!collapsed && (
                    <span className="nav-text">
                      {item.label?.props?.children || item.label}
                    </span>
                  )}
                  {/* Arrow for submenu */}
                  {item.children && !collapsed && (
                    <span
                      className="nav-arrow"
                      style={{ marginLeft: 8, transition: "transform 0.3s" }}
                    >
                      {openKeys.includes(item.key) ? (
                        <DownOutlined />
                      ) : (
                        <RightOutlined />
                      )}
                    </span>
                  )}
                </div>
                {item.children && !collapsed && (
                  <ul
                    className={`nav-submenu ${openKeys.includes(item.key) ? "expanded" : "collapsed"
                      }`}
                  >
                    {item.children.map((sub, index) => (
                      <li key={sub.key}>
                        <div
                          className={`nav-link ${location.pathname === sub.key ? "active" : ""
                            }`}
                          onClick={() => (window.location.pathname = sub.key)}
                          data-tooltip={sub.label?.props?.children || sub.label}
                        >
                          <span className="nav-icon">{sub.icon}</span>
                          <span className="nav-text">
                            {sub.label?.props?.children || sub.label}
                          </span>
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

      <Layout
        style={{
          marginLeft: collapsed ? "80px" : "280px",
          transition: "margin-left 0.3s ease",
        }}
      >
        {/* Header */}
        <Header
          style={{
            background: "#2C5F8D",
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
            margin: "5px 25px",
            borderRadius: "10px",
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

          <Space
            size={24}
            style={{
              position: "relative",
              zIndex: 1,
              height: "100%",
              alignItems: "center",
            }}
          >
            {/* Sidebar Toggle Button - moved to header */}
            <button
              className="sidebar-toggle-btn"
              onClick={() => setCollapsed(!collapsed)}
              style={{
                background: "transparent",
                border: "none",
                color: "white",
                cursor: "pointer",
                fontSize: "20px",
                marginRight: "12px",
                padding: "4px 8px",
              }}
              aria-label={collapsed ? "Mở rộng sidebar" : "Thu nhỏ sidebar"}
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
                color: "var(--color-bg-primary)",
                backgroundColor: "rgba(255,255,255,0.15)",
                border: "none",
                borderRadius: "8px",
              }}
            />

            {/* Search */}
            <div
              style={{
                position: "relative",
                display: windowWidth > 768 ? "flex" : "none",
                height: "40px",
                alignItems: "center",
              }}
            >
              <Input
                placeholder="Tìm kiếm..."
                prefix={<Search size={14} style={{ color: "#8c8c8c" }} />}
                style={{
                  width:
                    windowWidth > 1200 ? 220 : windowWidth > 992 ? 180 : 140,
                  borderRadius: "18px",
                  border: "none",
                  background: "rgba(255,255,255,0.96)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  fontSize: "12px",
                  height: "38px",
                  paddingLeft: 32,
                }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onPressEnter={handleSearch}
              />
            </div>
          </Space>

          <Space
            size={20}
            style={{
              position: "relative",
              zIndex: 1,
              height: "100%",
              alignItems: "center",
            }}
          >
            {/* Study Stats */}
            <Space
              size={12}
              style={{
                display: windowWidth > 576 ? "flex" : "none",
                alignItems: "center",
                height: "100%",
              }}
            >
              <Card
                size="small"
                style={{
                  background: "#E74C3C",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "10px",
                  boxShadow: "0 2px 8px rgba(238, 90, 82, 0.2)",
                  transition: "all 0.3s ease",
                  minWidth: 60,
                  minHeight: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={updateStudyProgress}
                bodyStyle={{
                  padding: "6px 10px",
                  display: "flex",
                  alignItems: "center",
                  minHeight: 32,
                }}
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
                    <Flame
                      size={14}
                      style={{ color: "var(--color-bg-primary)" }}
                    />
                  </div>
                  <div style={{ color: "var(--color-bg-primary)" }}>
                    <div
                      style={{
                        fontSize: "12px",
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
                  background: "#3498DB",
                  border: "none",
                  borderRadius: "10px",
                  boxShadow: "0 2px 8px rgba(79, 172, 254, 0.2)",
                  minWidth: 60,
                  minHeight: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                bodyStyle={{
                  padding: "6px 10px",
                  display: "flex",
                  alignItems: "center",
                  minHeight: 32,
                }}
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
                    <Clock
                      size={14}
                      style={{ color: "var(--color-bg-primary)" }}
                    />
                  </div>
                  <div style={{ color: "var(--color-bg-primary)" }}>
                    <div
                      style={{
                        fontSize: "12px",
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

            {/* Notifications */}
            <Dropdown
              menu={{ items: notificationMenuItems }}
              trigger={["click"]}
              placement="bottomRight"
              overlayStyle={{
                borderRadius: "12px",
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                border: "1px solid rgba(0, 0, 0, 0.05)",
                background: "var(--color-bg-primary)",
                minWidth: "360px",
                maxWidth: "400px",
                padding: "0",
                overflow: "hidden",
              }}
              overlayClassName="custom-notification-dropdown"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  position: "relative",
                }}
              >
                <Button
                  type="text"
                  icon={<Bell size={18} />}
                  style={{
                    background:
                      unreadCount > 0
                        ? "linear-gradient(135deg, #a8edea, #fed6e3)"
                        : "rgba(255,255,255,0.15)",
                    color:
                      unreadCount > 0
                        ? "var(--color-chart-4)"
                        : "var(--color-bg-primary)",
                    border: "none",
                    borderRadius: "8px",
                    width: "36px",
                    height: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow:
                      unreadCount > 0
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
                      background: "var(--color-danger)",
                      boxShadow: "0 2px 8px rgba(255, 77, 79, 0.3)",
                      minWidth: 16,
                      height: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      padding: 0,
                    }}
                  />
                )}
              </div>
            </Dropdown>

            {/* User Profile */}
            <div
              style={{ display: "flex", alignItems: "center", height: "100%" }}
            >
              <Dropdown
                menu={{ items: userMenuItems }}
                trigger={["click"]}
                placement="bottomRight"
                overlayStyle={{
                  borderRadius: "12px",
                  boxShadow:
                    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  border: "1px solid rgba(0, 0, 0, 0.05)",
                  background: "var(--color-bg-primary)",
                  minWidth: "280px",
                  padding: "0",
                  overflow: "hidden",
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
                    alignItems: "center",
                  }}
                  className="user-profile-hover"
                >
                  <Avatar
                    size={32}
                    src={info?.avatar}
                    style={{
                      background: "#2C5F8D",
                      color: "var(--color-bg-primary)",
                      border: "2px solid rgba(255,255,255,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {info?.name?.charAt(0) || "U"}
                  </Avatar>
                  <Text
                    style={{
                      display: windowWidth > 768 ? "block" : "none",
                      color: "var(--color-bg-primary)",
                      fontWeight: "500",
                      fontSize: "12px",
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
              background: "var(--color-bg-primary)",
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
                      background: "#2C5F8D",
                      borderRadius: "12px",
                      padding: "8px",
                      display: "inline-flex",
                      marginBottom: "8px",
                    }}
                  >
                    <GraduationCap
                      size={20}
                      style={{ color: "var(--color-bg-primary)" }}
                    />
                  </div>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: "12px",
                      background: "#2C5F8D",
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
                      fontSize: "12px",
                      fontWeight: "500",
                      transition: "color 0.3s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.color = "var(--color-brand-purple)")
                    }
                    onMouseLeave={(e) => (e.target.style.color = "#8c8c8c")}
                  >
                    Trợ giúp
                  </Link>
                  <Link
                    to="/privacy"
                    style={{
                      color: "#8c8c8c",
                      textDecoration: "none",
                      fontSize: "12px",
                      fontWeight: "500",
                      transition: "color 0.3s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.color = "var(--color-brand-purple)")
                    }
                    onMouseLeave={(e) => (e.target.style.color = "#8c8c8c")}
                  >
                    Chính sách bảo mật
                  </Link>
                  <Link
                    to="/terms"
                    style={{
                      color: "#8c8c8c",
                      textDecoration: "none",
                      fontSize: "12px",
                      fontWeight: "500",
                      transition: "color 0.3s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.color = "var(--color-brand-purple)")
                    }
                    onMouseLeave={(e) => (e.target.style.color = "#8c8c8c")}
                  >
                    Điều khoản sử dụng
                  </Link>
                  <Link
                    to="/contact"
                    style={{
                      color: "#8c8c8c",
                      textDecoration: "none",
                      fontSize: "12px",
                      fontWeight: "500",
                      transition: "color 0.3s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.color = "var(--color-brand-purple)")
                    }
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
          background: "#2C5F8D",
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
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
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
          background: linear-gradient(
            135deg,
            rgba(103, 126, 234, 0.08) 0%,
            rgba(79, 172, 254, 0.08) 100%
          ) !important;
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
        } /* Enhanced dropdown item animations */
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
          color: var(--color-primary) !important;
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
          color: var(--color-primary) !important;
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
          background: #2c5f8d;
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
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(0, 0, 0, 0.06) 50%,
            transparent 100%
          ) !important;
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
