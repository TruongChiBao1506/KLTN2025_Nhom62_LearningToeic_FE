import React, { useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHome,
    faBars
} from '@fortawesome/free-solid-svg-icons';
import { Dropdown, Avatar, Space, Button, Badge, Typography } from 'antd';
import { User, Settings, LogOut, Bell, Clock, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../../../hooks/useAuthStore';
import { useDispatch, useSelector } from "react-redux";
import authService from '../../../../services/authService';
import {
  markAllAsRead,
} from "../../../../store/notificationSlice.js";
import { getNotificationsByRole, getRoleSpecificCounts } from '../../../../utils/notificationRoleFilter';
import './style.css';
import './notification-styles.css';

const HeaderComponent = ({ toggleSidebar }) => {
    // ✅ Use Redux store instead of local state
    const { info: adminUserData, setIsAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const allNotifications = useSelector((state) => state.notifications.notifications);
    const allCounts = useSelector((state) => state.notifications.counts);
    
    // Filter notifications for admin role
    const notifications = useMemo(() => 
        getNotificationsByRole(allNotifications, 'admin'), 
        [allNotifications]
    );
    
    const roleCounts = useMemo(() => 
        getRoleSpecificCounts(allCounts, 'admin'),
        [allCounts]
    );
    
    const unreadCount = roleCounts.total || 0;

    // ✅ Improved signOut with authService helper
    const signOut = async () => {
        try {
            await authService.signOut();
            // ✅ Clear ALL tokens (user might have multiple roles)
            authService.clearAuth();
            setIsAuthenticated(false);
            navigate('/auth/admin/signin');
        } catch (error) {
            console.error('Sign out error:', error);
            authService.clearAuth();
            setIsAuthenticated(false);
            navigate('/auth/admin/signin');
        }
    };
    const handleToggleClick = () => {
        console.log('🔘 Sidebar toggle button clicked');
        if (toggleSidebar) {
            toggleSidebar();
        } else {
            console.error('❌ toggleSidebar function not provided');
        }
    };

    // ✅ Simplified image URL helper
    const getImageUrl = (imageName) => {
        if (!imageName) return "https://png.pngtree.com/png-vector/20190321/ourmid/pngtree-vector-users-icon-png-image_856952.jpg";
        if (imageName.startsWith('http')) return imageName;
        return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/images/${imageName}`;
    };

    // ❌ REMOVED: getUserById function - use Redux store instead

    // Notification menu items
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
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
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
                            <span
                                style={{
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    color: "#1a202c",
                                }}
                            >
                                Thông báo
                            </span>
                        </div>
                        <Button
                            type="link"
                            size="small"
                            onClick={() => dispatch(markAllAsRead(adminUserData?.id))}
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
        ...(notifications.length > 0
            ? notifications.map((notification) => ({
                key: notification.id || notification._id,
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
                                    background: !notification.isRead
                                        ? "#2C5F8D"
                                        : "#ECF0F1",
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
                            <div
                                style={{
                                    fontSize: "12px",
                                    fontWeight: "500",
                                    marginBottom: "4px",
                                }}
                            >
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
                background:
                    "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.06) 50%, transparent 100%)",
            },
        },
        {
            key: "viewAll",
            label: (
                <Link
                    to="/admin/notifications"
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

    // Create user menu items similar to learner layout
    const createUserMenuItems = () => {
        return [
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
                            color: "#1a202c"
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <Avatar
                                size={48}
                                src={getImageUrl(adminUserData?.avatar)}
                                style={{
                                    background: "#2C5F8D",
                                    border: "2px solid rgba(103, 126, 234, 0.1)",
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: "var(--color-bg-primary)"
                                }}
                            >
                                {adminUserData?.name?.charAt(0) || adminUserData?.username?.charAt(0) || "A"}
                            </Avatar>
                            <div>
                                <div style={{ 
                                    fontSize: "12px", 
                                    fontWeight: "600", 
                                    marginBottom: "2px",
                                    color: "#1a202c"
                                }}>
                                    {adminUserData?.name || adminUserData?.username || "Admin"}
                                </div>
                                <div style={{ 
                                    fontSize: "12px", 
                                    color: "#64748b"
                                }}>
                                    {adminUserData?.email || "admin@example.com"}
                                </div>
                            </div>
                        </div>
                    </div>
                ),
                disabled: true,
            },
            {
                key: "/admin/score-table/all",
                label: (
                    <Link 
                        to="/admin/score-table/all" 
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
                            border: "1px solid rgba(16, 185, 129, 0.15)"
                        }}
                    >
                        <div style={{
                            background: "#27AE60",
                            borderRadius: "8px",
                            padding: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <Settings size={16} style={{ color: "var(--color-bg-primary)" }} />
                        </div>
                        <span style={{ fontWeight: "600", fontSize: "12px", color: "#1f2937" }}>Thiết lập điểm số</span>
                    </Link>
                ),
            },
            {
                key: "/admin/profile",
                label: (
                    <Link 
                        to="/admin/profile" 
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
                            border: "1px solid rgba(103, 126, 234, 0.15)"
                        }}
                    >
                        <div style={{
                            background: "#2C5F8D",
                            borderRadius: "8px",
                            padding: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <User size={16} style={{ color: "var(--color-bg-primary)" }} />
                        </div>
                        <span style={{ fontWeight: "600", fontSize: "12px", color: "#1f2937" }}>Hồ sơ cá nhân</span>
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
                        onClick={signOut}
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
                            border: "1px solid rgba(239, 68, 68, 0.2)"
                        }}
                    >
                        <div style={{
                            background: "#E74C3C",
                            borderRadius: "8px",
                            padding: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <LogOut size={16} style={{ color: "var(--color-bg-primary)" }} />
                        </div>
                        <span style={{ fontWeight: "600", fontSize: "12px", color: "#dc2626" }}>Đăng xuất</span>
                    </div>
                ),
            },
        ];
    };

    // ❌ REMOVED: useEffect getUserById - use Redux store instead

    return (
        <nav 
            className="navbar navbar-expand-lg navbar-light border-bottom shadow-lg mt-2 rounded-4"
            style={{
                background: "#2C5F8D",
                minHeight: "70px",
            }}
        >
            <div className="container-fluid">
                <button
                    className="btn border-0"
                    id="sidebarToggle"
                    onClick={handleToggleClick}
                    style={{
                        background: "rgba(255,255,255,0.15)",
                        color: "var(--color-bg-primary)",
                        borderRadius: "8px",
                        padding: "8px 12px",
                    }}
                >
                    <FontAwesomeIcon icon={faBars} />
                </button>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav ms-auto mt-2 mt-lg-0">
                        {/* Home menu item */}
                        <li className="nav-item active">
                            <Link 
                                className="nav-link" 
                                to="/admin/dashboard"
                                style={{
                                    color: "var(--color-bg-primary)",
                                    padding: "8px 12px",
                                    borderRadius: "8px",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                <FontAwesomeIcon icon={faHome} />
                            </Link>
                        </li>

                        {/* Notification bell with dropdown */}
                        <li className="nav-item me-2" style={{ fontSize: '18px' }}>
                            <Dropdown
                                menu={{ items: notificationMenuItems }}
                                trigger={["click"]}
                                placement="bottomRight"
                                overlayStyle={{
                                    borderRadius: "12px",
                                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                                    border: "1px solid rgba(0, 0, 0, 0.05)",
                                    background: "var(--color-bg-primary)",
                                    minWidth: "360px",
                                    maxWidth: "400px",
                                    padding: "0",
                                    overflow: "hidden",
                                }}
                                overlayClassName="custom-notification-dropdown"
                            >
                                <div className="nav-link" style={{ cursor: 'pointer', position: 'relative' }}>
                                    <Bell size={18} />
                                    {unreadCount > 0 && (
                                        <Badge
                                            count={unreadCount}
                                            size="small"
                                            style={{
                                                position: "absolute",
                                                top: -8,
                                                right: -8,
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
                        </li>

                        {/* User dropdown với Ant Design */}
                        <li className="nav-item">
                            <Dropdown
                                menu={{ items: createUserMenuItems() }}
                                trigger={["click"]}
                                placement="bottomRight"
                                overlayStyle={{
                                    borderRadius: "12px",
                                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                                    border: "1px solid rgba(0, 0, 0, 0.05)",
                                    background: "var(--color-bg-primary)",
                                    minWidth: "280px",
                                    padding: "0",
                                    overflow: "hidden"
                                }}
                                overlayClassName="custom-admin-dropdown"
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
                                >
                                    <Avatar
                                        size={32}
                                        src={getImageUrl(adminUserData?.avatar)}
                                        style={{
                                            background: "#2C5F8D",
                                            color: "var(--color-bg-primary)",
                                            border: "2px solid rgba(255,255,255,0.3)",
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        {adminUserData?.name?.charAt(0) || adminUserData?.username?.charAt(0) || "A"}
                                    </Avatar>
                                    <Typography.Text
                                        style={{
                                            color: "var(--color-bg-primary)",
                                            fontWeight: "500",
                                            fontSize: "12px",
                                            marginLeft: 6,
                                        }}
                                    >
                                        {adminUserData?.name || adminUserData?.username || "Admin"}
                                    </Typography.Text>
                                </Space>
                            </Dropdown>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default HeaderComponent;