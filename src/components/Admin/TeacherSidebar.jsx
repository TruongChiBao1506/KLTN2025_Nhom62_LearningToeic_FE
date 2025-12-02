import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../Admin/Layouts/AdminSidebar/style.css'; // Sử dụng chung CSS với AdminSidebar
import { 
  HomeOutlined,
  FileTextOutlined,
  BookOutlined,
  FileOutlined,
  CommentOutlined,
  EditOutlined,
  ReadOutlined,
  FileWordOutlined,
  OrderedListOutlined,
  TrophyOutlined,
  LineChartOutlined
} from '@ant-design/icons';

const TeacherSidebar = ({ isToggled, isAnimating }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Define teacher menu items
    const menuItems = [
        {
            key: '/teacher/dashboard',
            icon: <HomeOutlined />,
            label: 'Dashboard',
        },
        {
            key: '/teacher/sections',
            icon: <BookOutlined />,
            label: 'Danh sách phần thi',
        },
        {
            key: '/teacher/topics',
            icon: <BookOutlined />,
            label: 'Quản lý chủ đề',
        },
        {
            key: '/teacher/grammar',
            icon: <FileWordOutlined />,
            label: 'Quản lý bài học ngữ pháp',
        },
        {
            key: '/teacher/exams',
            icon: <FileOutlined />,
            label: 'Quản lý đề thi',
        },
        {
            key: '/teacher/free-materials',
            icon: <FileTextOutlined />,
            label: 'Tài liệu miễn phí',
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

    // Render menu item
    const renderMenuItem = (item) => {
        const itemIsActive = isActive(item.key);
        
        return (
            <li key={item.key} className="nav-item">
                <div
                    className={`nav-link ${itemIsActive ? 'active' : ''}`}
                    onClick={() => handleMenuClick(item.key)}
                    style={{ cursor: 'pointer' }}
                >
                    {item.icon && (
                        <span className="nav-icon" style={{ 
                            fontSize: '18px',
                            marginRight: isToggled ? '12px' : '0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: isToggled ? 'flex-start' : 'center'
                        }}>
                            {item.icon}
                        </span>
                    )}
                    {isToggled && (
                        <span className="nav-text">
                            {item.label}
                        </span>
                    )}
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
                        👨‍🏫
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
                                color: 'var(--color-success)',
                                fontSize: '12px',
                                fontWeight: '600',
                                marginTop: '2px',
                                background: 'rgba(255,255,255,0.2)',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                display: 'inline-block'
                            }}>
                                Teacher Panel
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

            {/* Role indicator at bottom when collapsed */}
            {!isToggled && (
                <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '40px',
                    height: '40px',
                    background: 'var(--color-success)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}>
                    👨‍🏫
                </div>
            )}
        </div>
    );
};

export default TeacherSidebar;