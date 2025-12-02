// import React, { useState, useEffect, useCallback, useRef } from "react";
// import { Outlet, Link, useLocation } from "react-router-dom";
// import { useNotificationContext } from '../contexts/NotificationContext';
// import {
//   User,
//   Settings,
//   Menu as MenuIcon,
//   X,
//   Bell,
//   Moon,
//   Sun,
//   Flame,
//   LogOut,
//   ClipboardList,
//   GraduationCap,
//   Rocket,
//   Home,
//   TrendingUp,
//   FileText,
//   BookOpen,
//   Languages,
//   ArrowRight,
//   Heart,
//   Search,
//   PenTool,
//   StickyNote,
//   Clock,
//   Headphones,
//   Star,
//   Target,
//   Trophy,
// } from "lucide-react";
// import { useDispatch, useSelector } from "react-redux";
// import { logout } from "../store/slices/authSlice";
// import { toast } from "react-toastify";
// import authService from "../services/authService";
// import sectionService from "../services/sectionsService";
// import ChatbotButton from "../components/Learner/Chatbot/ChatbotButton";
// import { useAuthStore } from '../hooks/useAuthStore';

// import "../layouts/LearnerLayout.css";

// import { Layout, Typography, Button, Drawer, Space, Card, Input, Dropdown, Badge, Avatar, Row, Col, Divider, FloatButton, Menu } from "antd";

// const { Header, Sider, Content, Footer } = Layout;
// const { Title, Text } = Typography;
// const { RightOutlined, DownOutlined } = require("@ant-design/icons");

// // Component chính sử dụng NotificationContext
// const LearnerLayoutContent = () => {
//   // Use notification context
//   const { notifications, markAsRead, markAllAsRead } = useNotificationContext();

//   // State for submenu open keys (for sidebar)
//   const [openKeys, setOpenKeys] = useState([]);
//   const { info } = useAuthStore();

//   // Toggle submenu open/close
//   const handleToggleSubmenu = (keys) => {
//     // Handle array from Menu onOpenChange
//     if (Array.isArray(keys)) {
//       // For accordion behavior, we need to handle the open/close logic properly
//       // Ant Design Menu onOpenChange gives us the new array of open keys
//       setOpenKeys(keys);

//       // Load sections when opening listening-reading submenu
//       if (keys.includes("listening-reading") && !openKeys.includes("listening-reading") && sections.length === 0) {
//         fetchSections();
//       }
//     }
//   };

//   // Xử lý sự kiện tìm kiếm
//   const handleSearch = (e) => {
//     e.preventDefault();
//     // Xử lý tìm kiếm, ví dụ:
//     toast.info(`Đang tìm kiếm: ${searchQuery}`);
//     setSearchQuery("");
//   };

//   const location = useLocation();
//   const dispatch = useDispatch();

//   // States
//   const [collapsed, setCollapsed] = useState(false);
//   const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [darkMode, setDarkMode] = useState(
//     localStorage.getItem("darkMode") === "true"
//   );
//   const [studyStreak, setStudyStreak] = useState(
//     parseInt(localStorage.getItem("studyStreak") || "0")
//   );
//   const [todayStudyTime, setTodayStudyTime] = useState(0);
//   const [windowWidth, setWindowWidth] = useState(window.innerWidth);
//   const [sections, setSections] = useState([]);
//   const [sectionsLoading, setSectionsLoading] = useState(false);
//   const [lastSectionsUpdate, setLastSectionsUpdate] = useState(Date.now());
//   const sectionsRef = useRef([]);

//   // Load sections for dynamic menu
//   const fetchSections = useCallback(async () => {
//     try {
//       setSectionsLoading(true);
//       const response = await sectionService.getAllEnabled();
//       const enabledSections = response.data || [];
//       setSections(enabledSections);
//       sectionsRef.current = enabledSections;
//       setLastSectionsUpdate(Date.now());
//     } catch (error) {
//       console.error("Error fetching sections:", error);
//       toast.error("Không thể tải danh sách phần học");
//     } finally {
//       setSectionsLoading(false);
//     }
//   }, []);

//   // Handle logout
//   const handleLogout = async () => {
//     try {
//       await authService.logout();
//       dispatch(logout());
//       toast.success("Đăng xuất thành công!");
//     } catch (error) {
//       console.error("Logout error:", error);
//       toast.error("Có lỗi xảy ra khi đăng xuất");
//     }
//   };

//   // Handle window resize
//   useEffect(() => {
//     const handleResize = () => {
//       setWindowWidth(window.innerWidth);
//     };

//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   // Load sections on mount
//   useEffect(() => {
//     fetchSections();
//   }, [fetchSections]);

//   // Update study streak and time (mock data for now)
//   useEffect(() => {
//     const updateStudyStats = () => {
//       const now = new Date();
//       const today = now.toDateString();
//       const lastUpdate = localStorage.getItem("lastStudyUpdate");

//       if (lastUpdate !== today) {
//         // Reset daily stats
//         setTodayStudyTime(0);
//         localStorage.setItem("lastStudyUpdate", today);

//         // Update streak
//         const currentStreak = parseInt(localStorage.getItem("studyStreak") || "0");
//         setStudyStreak(currentStreak + 1);
//         localStorage.setItem("studyStreak", (currentStreak + 1).toString());
//       }
//     };

//     updateStudyStats();
//   }, []);

//   // Menu items for user dropdown
//   const userMenuItems = [
//     {
//       key: "profile",
//       icon: <User size={16} />,
//       label: (
//         <Link to="/learner/profile" style={{ textDecoration: "none", color: "inherit" }}>
//           Hồ sơ cá nhân
//         </Link>
//       ),
//     },
//     {
//       key: "settings",
//       icon: <Settings size={16} />,
//       label: (
//         <Link to="/learner/settings" style={{ textDecoration: "none", color: "inherit" }}>
//           Cài đặt
//         </Link>
//       ),
//     },
//     {
//       type: "divider",
//     },
//     {
//       key: "logout",
//       icon: <LogOut size={16} />,
//       label: (
//         <div
//           onClick={handleLogout}
//           style={{
//             cursor: "pointer",
//             padding: "8px 12px",
//             borderRadius: "8px",
//             margin: "2px 8px 8px",
//             color: "#dc2626",
//             transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
//             position: "relative",
//             overflow: "hidden",
//             background: "var(--color-bg-primary)",
//             border: "1px solid rgba(239, 68, 68, 0.2)"
//           }}
//         >
//           <div style={{
//             background: "#E74C3C",
//             borderRadius: "8px",
//             padding: "8px",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center"
//           }}>
//             <LogOut size={16} style={{ color: "var(--color-bg-primary)" }} />
//           </div>
//           <span style={{ fontWeight: "600", fontSize: "12px", color: "#dc2626" }}>Đăng xuất</span>
//         </div>
//       ),
//     },
//   ];

//   // Notification menu items with enhanced styling
//   const notificationMenuItems = [
//     {
//       key: "header",
//       label: (
//         <div
//           className="notification-dropdown-header"
//           style={{
//             padding: "16px 20px 12px",
//             borderBottom: "1px solid rgba(0,0,0,0.06)",
//             background: "#F8F9FA",
//             borderRadius: "12px 12px 0 0",
//             margin: "-8px -8px 8px",
//             position: "sticky",
//             top: 0,
//             zIndex: 10,
//           }}
//         >
//           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//             <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//               <div style={{
//                 background: "#2C5F8D",
//                 borderRadius: "6px",
//                 padding: "4px",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center"
//               }}>
//                 <Bell size={14} style={{ color: "var(--color-bg-primary)" }} />
//               </div>
//               <Text strong style={{ fontSize: "12px", fontWeight: "600", color: "#1a202c" }}>
//                 Thông báo
//               </Text>
//             </div>
//             <Button
//               type="link"
//               size="small"
//               style={{
//                 padding: "4px 8px",
//                 fontSize: "12px",
//                 background: "rgba(103, 126, 234, 0.1)",
//                 borderRadius: "6px",
//                 color: "var(--color-brand-purple)",
//                 fontWeight: "500",
//                 border: "none",
//                 height: "auto"
//               }}
//               className="mark-read-btn"
//             >
//               Đánh dấu đã đọc
//             </Button>
//           </div>
//         </div>
//       ),
//       disabled: true,
//     },
//     ...(notifications.length > 0
//       ? notifications.map((notification, index) => ({
//         key: notification.id,
//         label: (
//           <div
//             className="notification-dropdown-item"
//             onClick={() => markAsRead(notification.id)}
//             style={{
//               padding: "14px 16px",
//               borderRadius: "8px",
//               margin: "4px 8px",
//               transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
//               cursor: "pointer",
//               border: "1px solid transparent",
//               background: !notification.read
//                 ? "linear-gradient(135deg, rgba(103, 126, 234, 0.05) 0%, rgba(79, 172, 254, 0.05) 100%)"
//                 : "transparent",
//               position: "relative",
//               overflow: "hidden"
//             }}
//           >
//             {!notification.read && (
//               <div style={{
//                 position: "absolute",
//                 left: 0,
//                 top: 0,
//                 bottom: 0,
//                 width: "3px",
//                 background: "#2C5F8D",
//                 borderRadius: "0 2px 2px 0"
//               }} />
//             )}
//             <div style={{
//               display: "flex",
//               alignItems: "flex-start",
//               gap: "12px",
//               paddingLeft: !notification.read ? "8px" : "0"
//             }}>
//               <div style={{
//                 background: !notification.read
//                   ? "#2C5F8D"
//                   : "#ECF0F1",
//                 borderRadius: "8px",
//                 padding: "6px",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 minWidth: "32px",
//                 height: "32px",
//                 marginTop: "2px"
//               }}>
//                 <Bell size={14} style={{
//                   color: !notification.read ? "var(--color-bg-primary)" : "#64748b"
//                 }} />
//               </div>
//               <div style={{ flex: 1, minWidth: 0 }}>
//                 <div style={{
//                   fontWeight: !notification.read ? "600" : "500",
//                   fontSize: "12px",
//                   color: !notification.read ? "#1a202c" : "#4a5568",
//                   marginBottom: "4px",
//                   lineHeight: "1.4",
//                   display: "-webkit-box",
//                   WebkitLineClamp: 2,
//                   WebkitBoxOrient: "vertical",
//                   overflow: "hidden"
//                 }}>
//                   {notification.title}
//                 </div>
//                 <div style={{
//                   fontSize: "12px",
//                   color: "#64748b",
//                   marginBottom: "6px",
//                   lineHeight: "1.4",
//                   display: "-webkit-box",
//                   WebkitBoxOrient: "vertical",
//                   overflow: "hidden"
//                 }}>
//                   {notification.message}
//                 </div>
//                 <div style={{
//                   fontSize: "11px",
//                   color: "#94a3b8",
//                   fontWeight: "500",
//                   display: "flex",
//                   alignItems: "center",
//                   gap: "4px"
//                 }}>
//                   <Clock size={10} />
//                   {notification.time}
//                 </div>
//               </div>
//             </div>
//           </div>
//         ),
//       }))
//       : [
//         {
//           key: "empty",
//           label: (
//             <div
//               style={{
//                 padding: "32px 20px",
//                 textAlign: "center",
//                 color: "#94a3b8"
//               }}
//             >
//               <div style={{
//                 background: "#ECF0F1",
//                 borderRadius: "50%",
//                 width: "48px",
//                 height: "48px",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 margin: "0 auto 12px"
//               }}>
//                 <Bell size={20} style={{ color: "#64748b" }} />
//               </div>
//               <div style={{ fontSize: "12px", fontWeight: "500", marginBottom: "4px" }}>
//                 Không có thông báo nào
//               </div>
//               <div style={{ fontSize: "12px", color: "#cbd5e0" }}>
//                 Bạn sẽ nhận được thông báo tại đây
//               </div>
//             </div>
//           ),
//           disabled: true,
//         },
//       ]),
//     {
//       type: "divider",
//       style: {
//         margin: "8px 0",
//         background: "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.06) 50%, transparent 100%)"
//       }
//     },
//     {
//       key: "viewAll",
//       label: (
//         <Link
//           to="/learner/notifications"
//           style={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             padding: "12px 16px",
//             margin: "4px 8px 8px",
//             borderRadius: "8px",
//             background: "#2C5F8D",
//             color: "var(--color-bg-primary)",
//             textDecoration: "none",
//             fontWeight: "500",
//             fontSize: "12px",
//             transition: "all 0.3s ease",
//             gap: "6px"
//           }}
//           className="view-all-notifications"
//         >
//           <span>Xem tất cả thông báo</span>
//           <ArrowRight size={14} />
//         </Link>
//       ),
//     },
//   ];

//   return (
//     <Layout style={{ minHeight: "100vh" }}>
//     {/* Mobile Drawer */}
//     <Drawer
//       title={
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: "12px",
//             fontSize: "18px",
//             fontWeight: "600",
//           }}
//         >
//           <div
//             style={{
//               background: "#2C5F8D",
//               borderRadius: "8px",
//               padding: "8px",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//             }}
//           >
//             <GraduationCap size={20} style={{ color: "var(--color-bg-primary)" }} />
//           </div>
//           <span>Menu</span>
//         </div>
//       }
//       placement="left"
//       onClose={() => setMobileDrawerVisible(false)}
//       open={mobileDrawerVisible}
//       width={280}
//       bodyStyle={{
//         padding: 0,
//         background: "#F8F9FA",
//       }}
//       headerStyle={{
//         background: "#2C5F8D",
//         color: "var(--color-bg-primary)",
//         borderBottom: "none",
//       }}
//     >
//       {/* Mobile menu content */}
//       <div style={{ padding: "16px" }}>
//         <Menu
//           mode="inline"
//           selectedKeys={[location.pathname]}
//           openKeys={openKeys}
//           onOpenChange={handleToggleSubmenu}
//           style={{
//             background: "transparent",
//             border: "none",
//             fontSize: "12px",
//           }}
//           items={[
//             {
//               key: "/learner/dashboard",
//               icon: <Home size={16} />,
//               label: <Link to="/learner/dashboard">Trang chủ</Link>,
//             },
//             {
//               key: "/learner/achievements",
//               icon: <Trophy size={16} />,
//               label: <Link to="/learner/achievements">Thành tựu</Link>,
//             },
//             {
//               key: "/learner/progress",
//               icon: <TrendingUp size={16} />,
//               label: <Link to="/learner/progress">Tiến độ học</Link>,
//             },
//             {
//               key: "/learner/practice",
//               icon: <BookOpen size={16} />,
//               label: <Link to="/learner/practice">Luyện tập</Link>,
//             },
//             {
//               key: "/learner/test",
//               icon: <FileText size={16} />,
//               label: <Link to="/learner/test">Kiểm tra</Link>,
//             },
//             {
//               key: "/learner/vocabulary",
//               icon: <Languages size={16} />,
//               label: <Link to="/learner/vocabulary">Từ vựng</Link>,
//             },
//             {
//               key: "/learner/grammar",
//               icon: <PenTool size={16} />,
//               label: <Link to="/learner/grammar">Ngữ pháp</Link>,
//             },
//             {
//               key: "/learner/notes",
//               icon: <StickyNote size={16} />,
//               label: <Link to="/learner/notes">Ghi chú</Link>,
//             },
//             {
//               key: "/learner/listening-reading",
//               icon: <Headphones size={16} />,
//               label: "Nghe - Đọc",
//               children: sectionsLoading
//                 ? [
//                     {
//                       key: "loading",
//                       label: "Đang tải...",
//                       disabled: true,
//                     },
//                   ]
//                 : sections.map((section) => ({
//                     key: `/learner/section/${section.id}`,
//                     label: (
//                       <Link to={`/learner/section/${section.id}`}>
//                         {section.name}
//                       </Link>
//                     ),
//                   })),
//             },
//           ]}
//         />
//       </div>
//     </Drawer>

//     {/* Sidebar */}
//     <Sider
//       collapsible
//       collapsed={collapsed}
//       onCollapse={setCollapsed}
//       width={280}
//       style={{
//         background: "#F8F9FA",
//         borderRight: "1px solid rgba(0,0,0,0.06)",
//         boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
//       }}
//       className="learner-sidebar"
//     >
//       {/* Logo */}
//       <div
//         style={{
//           padding: "16px",
//           textAlign: "center",
//           borderBottom: "1px solid rgba(0,0,0,0.06)",
//           background: "#2C5F8D",
//           margin: collapsed ? "0 8px 16px" : "0 0 16px",
//           borderRadius: collapsed ? "8px" : "0 0 12px 12px",
//           transition: "all 0.3s ease",
//         }}
//       >
//         {!collapsed && (
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               gap: "12px",
//               marginBottom: "8px",
//             }}
//           >
//             <div
//               style={{
//                 background: "var(--color-bg-primary)",
//                 borderRadius: "8px",
//                 padding: "8px",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//               }}
//             >
//               <GraduationCap size={24} style={{ color: "var(--color-brand-purple)" }} />
//             </div>
//             <div>
//               <div
//                 style={{
//                   fontSize: "18px",
//                   fontWeight: "700",
//                   color: "var(--color-bg-primary)",
//                   lineHeight: "1.2",
//                 }}
//               >
//                 TOEIC
//               </div>
//               <div
//                 style={{
//                   fontSize: "12px",
//                   color: "rgba(255,255,255,0.8)",
//                   fontWeight: "500",
//                 }}
//               >
//                 Học viện
//               </div>
//             </div>
//           </div>
//         )}
//         {collapsed && (
//           <div
//             style={{
//               background: "var(--color-bg-primary)",
//               borderRadius: "8px",
//               padding: "8px",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//             }}
//           >
//             <GraduationCap size={20} style={{ color: "var(--color-brand-purple)" }} />
//           </div>
//         )}
//       </div>

//       {/* Menu */}
//       <Menu
//         mode="inline"
//         selectedKeys={[location.pathname]}
//         openKeys={openKeys}
//         onOpenChange={handleToggleSubmenu}
//         style={{
//           background: "transparent",
//           border: "none",
//           fontSize: "12px",
//         }}
//         items={[
//           {
//             key: "/learner/dashboard",
//             icon: <Home size={16} />,
//             label: <Link to="/learner/dashboard">Trang chủ</Link>,
//           },
//           {
//             key: "/learner/achievements",
//             icon: <Trophy size={16} />,
//             label: <Link to="/learner/achievements">Thành tựu</Link>,
//           },
//           {
//             key: "/learner/progress",
//             icon: <TrendingUp size={16} />,
//             label: <Link to="/learner/progress">Tiến độ học</Link>,
//           },
//           {
//             key: "/learner/practice",
//             icon: <BookOpen size={16} />,
//             label: <Link to="/learner/practice">Luyện tập</Link>,
//           },
//           {
//             key: "/learner/test",
//             icon: <FileText size={16} />,
//             label: <Link to="/learner/test">Kiểm tra</Link>,
//           },
//           {
//             key: "/learner/vocabulary",
//             icon: <Languages size={16} />,
//             label: <Link to="/learner/vocabulary">Từ vựng</Link>,
//           },
//           {
//             key: "/learner/grammar",
//             icon: <PenTool size={16} />,
//             label: <Link to="/learner/grammar">Ngữ pháp</Link>,
//           },
//           {
//             key: "/learner/notes",
//             icon: <StickyNote size={16} />,
//             label: <Link to="/learner/notes">Ghi chú</Link>,
//           },
//           {
//             key: "/learner/listening-reading",
//             icon: <Headphones size={16} />,
//             label: "Nghe - Đọc",
//             children: sectionsLoading
//               ? [
//                   {
//                     key: "loading",
//                     label: "Đang tải...",
//                     disabled: true,
//                   },
//                 ]
//               : sections.map((section) => ({
//                   key: `/learner/section/${section.id}`,
//                   label: (
//                     <Link to={`/learner/section/${section.id}`}>
//                       {section.name}
//                     </Link>
//                   ),
//                 })),
//           },
//         ]}
//       />
//     </Sider>

//     {/* Main Layout */}
//     <Layout>
//       {/* Header */}
//       <Header
//         style={{
//           background: "var(--color-bg-primary)",
//           padding: "0 24px",
//           boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
//           borderBottom: "1px solid rgba(0,0,0,0.06)",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           height: "64px",
//           position: "sticky",
//           top: 0,
//           zIndex: 1000,
//         }}
//       >
//         {/* Left side - Menu toggle and search */}
//         <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
//           {/* Mobile menu button */}
//           <Button
//             type="text"
//             icon={<MenuIcon size={20} />}
//             onClick={() => setMobileDrawerVisible(true)}
//             style={{
//               display: windowWidth <= 768 ? "block" : "none",
//               color: "var(--color-brand-purple)",
//             }}
//           />

//           {/* Desktop menu toggle */}
//           <Button
//             type="text"
//             icon={collapsed ? <MenuIcon size={20} /> : <X size={20} />}
//             onClick={() => setCollapsed(!collapsed)}
//             style={{
//               display: windowWidth > 768 ? "block" : "none",
//               color: "var(--color-brand-purple)",
//             }}
//           />

//           {/* Search */}
//           <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//             <Input
//               placeholder="Tìm kiếm..."
//               prefix={<Search size={16} style={{ color: "#94a3b8" }} />}
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               onPressEnter={handleSearch}
//               style={{
//                 width: windowWidth > 768 ? 250 : 150,
//                 borderRadius: "20px",
//                 border: "1px solid rgba(0,0,0,0.1)",
//               }}
//             />
//           </div>
//         </div>

//         {/* Right side - Notifications, user menu */}
//         <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
//           {/* Study streak */}
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: "6px",
//               padding: "6px 12px",
//               background: "linear-gradient(135deg, #f093fb, #f5576c)",
//               borderRadius: "16px",
//               color: "var(--color-bg-primary)",
//               fontSize: "12px",
//               fontWeight: "600",
//             }}
//           >
//             <Flame size={14} />
//             <span>{studyStreak} ngày</span>
//           </div>

//           {/* Notifications */}
//           <Dropdown
//             menu={{ items: notificationMenuItems }}
//             trigger={["click"]}
//             placement="bottomRight"
//             overlayStyle={{
//               borderRadius: "12px",
//               boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
//               border: "1px solid rgba(0,0,0,0.08)",
//             }}
//           >
//             <div
//               style={{
//                 position: "relative",
//                 cursor: "pointer",
//                 padding: "8px",
//                 borderRadius: "8px",
//                 transition: "all 0.3s ease",
//                 background: notifications.filter((n) => !n.read).length > 0
//                   ? "linear-gradient(135deg, rgba(103, 126, 234, 0.1) 0%, rgba(79, 172, 254, 0.1) 100%)"
//                   : "transparent",
//                 border: notifications.filter((n) => !n.read).length > 0
//                   ? "1px solid rgba(103, 126, 234, 0.2)"
//                   : "1px solid transparent",
//               }}
//             >
//               <Bell
//                 size={20}
//                 style={{
//                   color: notifications.filter((n) => !n.read).length > 0 ? "var(--color-brand-purple)" : "#64748b",
//                   transition: "all 0.3s ease",
//                 }}
//               />
//               {notifications.filter((n) => !n.read).length > 0 && (
//                 <Badge
//                   count={notifications.filter((n) => !n.read).length}
//                   size="small"
//                   style={{
//                     position: "absolute",
//                     top: 8,
//                     right: 2,
//                     background: "var(--color-danger)",
//                     boxShadow: "0 2px 8px rgba(255, 77, 79, 0.3)",
//                     minWidth: 16,
//                   }}
//                 />
//               )}
//             </div>
//           </Dropdown>

//           {/* User menu */}
//           <Dropdown
//             menu={{ items: userMenuItems }}
//             trigger={["click"]}
//             placement="bottomRight"
//             overlayStyle={{
//               borderRadius: "12px",
//               boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
//               border: "1px solid rgba(0,0,0,0.08)",
//             }}
//           >
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "8px",
//                 cursor: "pointer",
//                 padding: "6px 8px",
//                 borderRadius: "8px",
//                 transition: "all 0.3s ease",
//                 background: "#F8F9FA",
//                 border: "1px solid rgba(0,0,0,0.06)",
//               }}
//             >
//               <Avatar
//                 size={32}
//                 style={{
//                   background: "#2C5F8D",
//                   color: "var(--color-bg-primary)",
//                   fontWeight: "600",
//                 }}
//               >
//                 {info?.name?.charAt(0)?.toUpperCase() || "U"}
//               </Avatar>
//               <div
//                 style={{
//                   display: windowWidth > 768 ? "block" : "none",
//                   lineHeight: "1.2",
//                 }}
//               >
//                 <div
//                   style={{
//                     fontSize: "12px",
//                     fontWeight: "600",
//                     color: "#1a202c",
//                   }}
//                 >
//                   {info?.name || "Người dùng"}
//                 </div>
//                 <div
//                   style={{
//                     fontSize: "12px",
//                     color: "#64748b",
//                   }}
//                 >
//                   Học viên
//                 </div>
//               </div>
//               <DownOutlined style={{ color: "#64748b", fontSize: "12px" }} />
//             </div>
//           </Dropdown>
//         </div>
//       </Header>

//       {/* Content */}
//       <Content
//         style={{
//           margin: "24px 16px",
//           padding: 24,
//           background: "var(--color-bg-primary)",
//           borderRadius: "12px",
//           boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
//           minHeight: "calc(100vh - 140px)",
//         }}
//       >
//         <Outlet />
//       </Content>

//       {/* Footer */}
//       <Footer
//         style={{
//           textAlign: "center",
//           background: "#F8F9FA",
//           borderTop: "1px solid rgba(0,0,0,0.06)",
//           color: "#64748b",
//           padding: "16px",
//         }}
//       >
//         <div style={{ marginBottom: "8px" }}>
//           <Text strong style={{ color: "#1a202c" }}>
//             TOEIC Learning Platform
//           </Text>
//         </div>
//         <div>
//           © 2024 - Phát triển bởi đội ngũ công nghệ
//         </div>
//       </Footer>
//     </Layout>
//   </Layout>
//   );
// };

// export default LearnerLayoutContent;