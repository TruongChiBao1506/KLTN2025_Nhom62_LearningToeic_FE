import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './style.css';
import { 
  HomeOutlined,
  FileTextOutlined,
  BookOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  FileOutlined,
  CommentOutlined,
  AppstoreOutlined,
  EditOutlined
} from '@ant-design/icons';

const Sidebar = ({ isToggled, isAnimating }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Define menu items - keeping original admin content
    const menuItems = [
        {
            key: '/admin/dashboard',
            icon: <HomeOutlined />,
            label: 'Dashboard',
        },
        {
            key: '/admin/section',
            icon: <FileTextOutlined />,
            label: 'Xem danh sách phần thi',
        },
        {
            key: '/admin/topic',
            icon: <BookOutlined />,
            label: 'Quản lý chủ đề',
        },
        {
            key: '/admin/blog',
            icon: <EditOutlined />,
            label: 'Quản lý Blog',
        },
        {
            key: '/admin/grammar',
            icon: <CheckCircleOutlined />,
            label: 'Quản lý ngữ pháp',
        },
        {
            key: '/admin/learner',
            icon: <TeamOutlined />,
            label: 'Quản lý học viên',
        },
        {
            key: '/admin/exam',
            icon: <FileOutlined />,
            label: 'Quản lý đề thi',
        },
        {
            key: '/admin/feedback',
            icon: <CommentOutlined />,
            label: 'Quản lý phản hồi',
        },
        {
            key: '/admin/free-material',
            icon: <AppstoreOutlined />,
            label: 'Free Materials',
        }
    ];

    // Handle menu click
    const handleMenuClick = (key) => {
        navigate(key);
    };

    // Check if menu item is active
    const isActive = (key) => {
        return location.pathname === key;
    };

    // Render simple menu item (no submenus for admin)
    const renderMenuItem = (item) => {
        const itemIsActive = isActive(item.key);
        
        return (
            <li key={item.key} className="nav-item">
                <div
                    className={`nav-link ${itemIsActive ? 'active' : ''}`}
                    onClick={() => handleMenuClick(item.key)}
                    data-tooltip={item.label}
                >
                    <span className="nav-icon">{item.icon}</span>
                    {isToggled && <span className="nav-text">{item.label}</span>}
                </div>
            </li>
        );
    };

    return (
        <div
            className={`learner-sidebar ${isToggled ? 'active' : ''}`}
        >
            {/* Header Section */}
            <div className="sidebar-header">
                <div className="logo-container">
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: isToggled ? '12px' : '0',
                        flexShrink: 0
                    }}>
                        🎓
                    </div>
                    {isToggled && (
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
                                Admin Panel
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Menu */}
            <div className="sidebar-nav">
                <ul className="nav-list">
                    {menuItems.map(item => renderMenuItem(item))}
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;