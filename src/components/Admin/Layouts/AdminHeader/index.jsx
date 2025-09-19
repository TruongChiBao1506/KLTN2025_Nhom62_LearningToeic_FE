import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHome,
    faBell,
    faBars
} from '@fortawesome/free-solid-svg-icons';
import { Dropdown, Avatar, Space } from 'antd';
import { User, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../../../../hooks/useAuthStore';
import userService from '../../../../services/userService';
import { jwtDecode } from 'jwt-decode';
import './style.css';

const HeaderComponent = ({ toggleSidebar }) => {
    const { setIsAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const [profileImage, setProfileImage] = useState('');
    const [adminUserData, setAdminUserData] = useState(null);

    // Existing functions...
    const signOut = async () => {
        try {
            await userService.signOut();

            localStorage.removeItem('adminRefreshToken');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminAccessTokenExpirationTime');
            localStorage.removeItem('adminRefreshTokenExpirationTime');

            setIsAuthenticated(false);
            navigate('/admin/signin');
        } catch (error) {
            console.log('Sign out error:', error);
            localStorage.removeItem('adminRefreshToken');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminAccessTokenExpirationTime');
            localStorage.removeItem('adminRefreshTokenExpirationTime');
            setIsAuthenticated(false);
            navigate('/admin/signin');
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

    const getImageUrl = (imageName) => {
        if (imageName) {
            return `http://localhost:5000/images/${imageName}`;
        }
        return "https://png.pngtree.com/png-vector/20190321/ourmid/pngtree-vector-users-icon-png-image_856952.jpg";
    };

    const getUserById = async () => {
        try {
            const adminToken = localStorage.getItem("adminToken");
            if (!adminToken) {
                console.log('No admin token found');
                return;
            }

            const decoded = jwtDecode(adminToken);
            const username = decoded.username;

            const userIdResult = await userService.getUserIdByUsername(username);
            let actualUserId;

            if (userIdResult !== null) {
                actualUserId = userIdResult.userId;
            }

            const userDataResult = await userService.getUserById(actualUserId);
            let userData;

            if (userDataResult !== null) {
                userData = userDataResult;
            }

            console.log('User data:', userData);
            setProfileImage(userData.image);
            setAdminUserData(userData);
            console.log('Profile image:', userData.image);

        } catch (error) {
            console.log('Get user error:', error);
        }
    };

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
                            background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                            borderRadius: "12px 12px 0 0",
                            margin: "-8px -8px 12px",
                            color: "#1a202c"
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <Avatar
                                size={48}
                                src={getImageUrl(profileImage)}
                                style={{
                                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                                    border: "2px solid rgba(103, 126, 234, 0.1)",
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: "#fff"
                                }}
                            >
                                {adminUserData?.fullName?.charAt(0) || adminUserData?.username?.charAt(0) || "A"}
                            </Avatar>
                            <div>
                                <div style={{ 
                                    fontSize: "15px", 
                                    fontWeight: "600", 
                                    marginBottom: "2px",
                                    color: "#1a202c"
                                }}>
                                    {adminUserData?.fullName || adminUserData?.username || "Admin"}
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
                            <Settings size={16} style={{ color: "#fff" }} />
                        </div>
                        <span style={{ fontWeight: "600", fontSize: "14px", color: "#1f2937" }}>Thiết lập điểm số</span>
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
    };

    useEffect(() => {
        getUserById();
    }, []);

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-lg mt-2 rounded-4">
            <div className="container-fluid">
                <button
                    className="btn btn-white border-0"
                    id="sidebarToggle"
                    onClick={handleToggleClick}
                >
                    <FontAwesomeIcon icon={faBars} />
                </button>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav ms-auto mt-2 mt-lg-0">
                        {/* Home menu item */}
                        <li className="nav-item active">
                            <Link className="nav-link" to="/admin/dashboard">
                                <FontAwesomeIcon icon={faHome} />
                            </Link>
                        </li>

                        {/* Notification bell */}
                        <li className="nav-item me-2" style={{ fontSize: '18px' }}>
                            <a className="nav-link" href="#!">
                                <FontAwesomeIcon icon={faBell} />
                            </a>
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
                                    background: "#fff",
                                    minWidth: "280px",
                                    padding: "0",
                                    overflow: "hidden"
                                }}
                                overlayClassName="custom-admin-dropdown"
                            >
                                <Space
                                    style={{
                                        cursor: "pointer",
                                        padding: "4px",
                                        borderRadius: "50%",
                                        transition: "all 0.2s ease",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}
                                >
                                    <Avatar
                                        size={32}
                                        src={getImageUrl(profileImage)}
                                        style={{
                                            background: "linear-gradient(135deg, #667eea, #764ba2)",
                                            color: "#fff",
                                            border: "2px solid transparent",
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        {adminUserData?.fullName?.charAt(0) || adminUserData?.username?.charAt(0) || "A"}
                                    </Avatar>
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