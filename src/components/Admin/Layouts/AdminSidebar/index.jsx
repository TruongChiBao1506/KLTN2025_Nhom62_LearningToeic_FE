// import React, { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { Badge } from 'antd';
// import './style.css';
// import { 
//   HomeOutlined,
//   FileTextOutlined,
//   BookOutlined,
//   CheckCircleOutlined,
//   TeamOutlined,
//   FileOutlined,
//   CommentOutlined,
//   AppstoreOutlined,
//   EditOutlined,
//   CheckSquareOutlined,
//   UserAddOutlined
// } from '@ant-design/icons';
// import socketService from '../../../../services/socketService';

// const Sidebar = ({ isToggled, isAnimating }) => {
//     const navigate = useNavigate();
//     const location = useLocation();
//     const [pendingContentCount, setPendingContentCount] = useState(0);
//     const [pendingRequestCount, setPendingRequestCount] = useState(0);

//     useEffect(() => {
//         fetchPendingCounts();
        
//         // Setup real-time listeners
//         socketService.on('new_pending_content', () => {
//             fetchPendingCounts();
//         });
//         socketService.on('new_teacher_request', () => {
//             fetchPendingCounts();
//         });
        
//         return () => {
//             socketService.off('new_pending_content');
//             socketService.off('new_teacher_request');
//         };
//     }, []);

//     const fetchPendingCounts = async () => {
//         try {
//             const token = localStorage.getItem('token');
            
//             // Fetch content approval count
//             const contentRes = await fetch('http://localhost:5000/api/admin/pending/count', {
//                 headers: {
//                     'Authorization': `Bearer ${token}`
//                 }
//             });
//             const contentData = await contentRes.json();
//             if (contentData.success) {
//                 setPendingContentCount(contentData.data.total);
//             }

//             // Fetch teacher request count
//             const requestRes = await fetch('http://localhost:5000/api/teacher-requests/pending/count', {
//                 headers: {
//                     'Authorization': `Bearer ${token}`
//                 }
//             });
//             const requestData = await requestRes.json();
//             if (requestData.success) {
//                 setPendingRequestCount(requestData.data.count);
//             }
//         } catch (error) {
//             console.error('Failed to fetch pending counts:', error);
//         }
//     };

//     // Define menu items - keeping original admin content
//     const menuItems = [
//         {
//             key: '/admin/dashboard',
//             icon: <HomeOutlined />,
//             label: 'Dashboard',
//         },
//         {
//             key: '/admin/content-approval',
//             icon: <CheckSquareOutlined />,
//             label: 'Content Approval',
//             badge: pendingContentCount
//         },
//         {
//             key: '/admin/teacher-requests',
//             icon: <UserAddOutlined />,
//             label: 'Teacher Requests',
//             badge: pendingRequestCount
//         },
//         {
//             key: '/admin/section',
//             icon: <FileTextOutlined />,
//             label: 'Xem danh sách phần thi',
//         },
//         {
//             key: '/admin/topic',
//             icon: <BookOutlined />,
//             label: 'Quản lý chủ đề',
//         },
//         {
//             key: '/admin/blog',
//             icon: <EditOutlined />,
//             label: 'Quản lý Blog',
//         },
//         {
//             key: '/admin/grammar',
//             icon: <CheckCircleOutlined />,
//             label: 'Quản lý ngữ pháp',
//         },
//         {
//             key: '/admin/learner',
//             icon: <TeamOutlined />,
//             label: 'Quản lý học viên',
//         },
//         {
//             key: '/admin/exam',
//             icon: <FileOutlined />,
//             label: 'Quản lý đề thi',
//         },
//         {
//             key: '/admin/feedback',
//             icon: <CommentOutlined />,
//             label: 'Quản lý phản hồi',
//         },
//         {
//             key: '/admin/free-material',
//             icon: <AppstoreOutlined />,
//             label: 'Free Materials',
//         }
//     ];

//     // Handle menu click
//     const handleMenuClick = (key) => {
//         navigate(key);
//     };

//     // Check if menu item is active
//     const isActive = (key) => {
//         return location.pathname === key;
//     };

//     // Render simple menu item (no submenus for admin)
//     const renderMenuItem = (item) => {
//         const itemIsActive = isActive(item.key);
        
//         return (
//             <li key={item.key} className="nav-item">
//                 <div
//                     className={`nav-link ${itemIsActive ? 'active' : ''}`}
//                     onClick={() => handleMenuClick(item.key)}
//                     data-tooltip={item.label}
//                 >
//                     <span className="nav-icon">
//                         {item.badge > 0 ? (
//                             <Badge count={item.badge} size="small" offset={[10, 0]}>
//                                 {item.icon}
//                             </Badge>
//                         ) : (
//                             item.icon
//                         )}
//                     </span>
//                     {isToggled && (
//                         <span className="nav-text">
//                             {item.label}
//                             {item.badge > 0 && (
//                                 <Badge 
//                                     count={item.badge} 
//                                     style={{ marginLeft: 8 }}
//                                 />
//                             )}
//                         </span>
//                     )}
//                 </div>
//             </li>
//         );
//     };

//     return (
//         <div
//             className={`learner-sidebar ${isToggled ? 'active' : ''}`}
//         >
//             {/* Header Section */}
//             <div className="sidebar-header">
//                 <div className="logo-container">
//                     <div style={{
//                         width: '40px',
//                         height: '40px',
//                         background: 'white',
//                         borderRadius: '50%',
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         marginRight: isToggled ? '12px' : '0',
//                         flexShrink: 0
//                     }}>
//                         🎓
//                     </div>
//                     {isToggled && (
//                         <div style={{ overflow: 'hidden' }}>
//                             <div style={{
//                                 color: 'white',
//                                 fontSize: '16px',
//                                 fontWeight: '600',
//                                 lineHeight: '1.2'
//                             }}>
//                                 TOEIC Learning
//                             </div>
//                             <div style={{
//                                 color: 'rgba(255,255,255,0.8)',
//                                 fontSize: '12px',
//                                 fontWeight: '500',
//                                 marginTop: '2px'
//                             }}>
//                                 Admin Panel
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* Navigation Menu */}
//             <div className="sidebar-nav">
//                 <ul className="nav-list">
//                     {menuItems.map(item => renderMenuItem(item))}
//                 </ul>
//             </div>
//         </div>
//     );
// };

// export default Sidebar;

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Badge } from 'antd';
import './style.css';
import toeicLogo from '../../../../assets/Toeic_logo.png';
import { 
  HomeOutlined,
  FileTextOutlined,
  BookOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  FileOutlined,
  CommentOutlined,
  AppstoreOutlined,
  EditOutlined,
  CheckSquareOutlined,
  UserAddOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import socketService from '../../../../services/socketService';
import topicSubmissionService from '../../../../services/topicSubmissionService';

const Sidebar = ({ isToggled, isAnimating }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [pendingContentCount, setPendingContentCount] = useState(0);
    const [pendingRequestCount, setPendingRequestCount] = useState(0);
    const [userRole, setUserRole] = useState('admin'); // Get from auth context or localStorage

    const fetchPendingCounts = useCallback(async () => {
        try {
            // ✅ Use topicSubmissionService instead of direct fetch
            const topicResponse = await topicSubmissionService.getPendingTopics();
            if (topicResponse.success) {
                const topicCount = topicResponse.data?.length || 0;
                setPendingContentCount(topicCount);
                console.log('📊 Sidebar badge updated:', topicCount);
            }

            // Fetch teacher request count
            // ✅ Check sessionStorage instead of localStorage
            const token = sessionStorage.getItem('adminToken') || sessionStorage.getItem('token');
            const requestRes = await fetch('http://localhost:5000/api/teacher-requests/pending/count', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const requestData = await requestRes.json();
            if (requestData.success) {
                setPendingRequestCount(requestData.data.count);
            }
        } catch (error) {
            console.error('Failed to fetch pending counts:', error);
            // Reset counts on error
            setPendingContentCount(0);
        }
    }, []);

    // Handle real-time updates
    const handlePendingUpdate = useCallback((data) => {
        console.log('🔔 Pending counts update received:', data);
        fetchPendingCounts();
    }, [fetchPendingCounts]);

    useEffect(() => {
        // Get user role from localStorage or auth context
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setUserRole(user.role || 'admin');
        
        // Only fetch pending counts if admin
        if (user.role === 'admin') {
            fetchPendingCounts();
            
            // Setup real-time listeners
            console.log('🔔 Setting up sidebar listeners...');
            socketService.on('new_pending_content', handlePendingUpdate);
            socketService.on('new_teacher_request', handlePendingUpdate);
            socketService.on('teacher_request_approved', handlePendingUpdate);
            socketService.on('teacher_request_rejected', handlePendingUpdate);
            socketService.on('teacher_request_status_changed', handlePendingUpdate); // 🔧 NEW: Listen for status changes
            socketService.on('content_approved', handlePendingUpdate);
            socketService.on('content_rejected', handlePendingUpdate);
            socketService.on('content_withdrawn', handlePendingUpdate);
            
            // Listen for browser custom events from TeacherRequests page
            const handleBadgeUpdate = (event) => {
                console.log('🔔 Sidebar received badge update event:', event.detail);
                fetchPendingCounts();
            };
            window.addEventListener('sidebar-update-badge', handleBadgeUpdate);
            
            return () => {
                console.log('🔕 Cleaning up sidebar listeners...');
                socketService.off('new_pending_content', handlePendingUpdate);
                socketService.off('new_teacher_request', handlePendingUpdate);
                socketService.off('teacher_request_approved', handlePendingUpdate);
                socketService.off('teacher_request_rejected', handlePendingUpdate);
                socketService.off('teacher_request_status_changed', handlePendingUpdate); // 🔧 NEW: Cleanup
                socketService.off('content_approved', handlePendingUpdate);
                socketService.off('content_rejected', handlePendingUpdate);
                socketService.off('content_withdrawn', handlePendingUpdate);
                
                // 🔧 NEW: Cleanup browser event listener
                window.removeEventListener('sidebar-update-badge', handleBadgeUpdate);
            };
        }
    }, [fetchPendingCounts, handlePendingUpdate]);

    // ADMIN MENU - Chỉ duyệt nội dung và quản lý user
    const adminMenuItems = [
        {
            key: '/admin/dashboard',
            icon: <HomeOutlined />,
            label: 'Dashboard',
        },
        {
            key: '/admin/content-approval',
            icon: <CheckSquareOutlined />,
            label: 'Duyệt nội dung',
            badge: pendingContentCount
        },
        {
            key: '/admin/teacher-requests',
            icon: <UserAddOutlined />,
            label: 'Duyệt yêu cầu giáo viên',
            badge: pendingRequestCount
        },
        {
            key: '/admin/learner',
            icon: <TeamOutlined />,
            label: 'Quản lý người dùng',
        },
        {
            key: '/admin/feedback',
            icon: <CommentOutlined />,
            label: 'Quản lý phản hồi',
        },
                {
            key: '/admin/blog',
            icon: <EditOutlined />,
            label: 'Quản lý Blog',
        },
    ];

    // TEACHER MENU - Quản lý tất cả nội dung
    const teacherMenuItems = [
        {
            key: '/admin/dashboard',
            icon: <HomeOutlined />,
            label: 'Dashboard',
        },
        {
            key: '/admin/section',
            icon: <FileTextOutlined />,
            label: 'Quản lý Section',
        },
        {
            key: '/admin/topic',
            icon: <BookOutlined />,
            label: 'Quản lý Topic',
        },
        {
            key: '/admin/grammar',
            icon: <CheckCircleOutlined />,
            label: 'Quản lý Grammar',
        },
        {
            key: '/admin/exam',
            icon: <FileOutlined />,
            label: 'Quản lý Exam',
        },
        {
            key: '/admin/free-material',
            icon: <AppstoreOutlined />,
            label: 'Free Materials',
        },
        {
            key: '/admin/my-content',
            icon: <BarChartOutlined />,
            label: 'My Content Stats',
        }
    ];

    // Select menu items based on role
    const menuItems = userRole === 'admin' ? adminMenuItems : teacherMenuItems;

    // Handle menu click
    const handleMenuClick = (key) => {
        navigate(key);
    };

    // Check if menu item is active
    const isActive = (key) => {
        return location.pathname === key;
    };

    // Render simple menu item
    const renderMenuItem = (item) => {
        const itemIsActive = isActive(item.key);
        
        return (
            <li key={item.key} className="nav-item">
                <div
                    className={`nav-link ${itemIsActive ? 'active' : ''}`}
                    onClick={() => handleMenuClick(item.key)}
                    data-tooltip={item.label}
                >
                    <span className="nav-icon">
                        {item.badge > 0 ? (
                            <Badge count={item.badge} size="small" offset={[10, 0]}>
                                {item.icon}
                            </Badge>
                        ) : (
                            item.icon
                        )}
                    </span>
                    {isToggled && (
                        <span className="nav-text">
                            {item.label}
                            {item.badge > 0 && (
                                <Badge 
                                    count={item.badge} 
                                    style={{ marginLeft: 8 }}
                                />
                            )}
                        </span>
                    )}
                </div>
            </li>
        );
    };

    // Get role display name and color
    const getRoleDisplay = () => {
        if (userRole === 'admin') {
            return { name: 'Quản trị viên', color: 'var(--color-danger)' };
        }
        return { name: 'Giáo viên', color: 'var(--color-success)' };
    };

    const roleDisplay = getRoleDisplay();

    return (
        <div
            className={`admin-sidebar ${isToggled ? 'active' : ''}`}
        >
            {/* Header Section */}
            <div className="admin-sidebar-header">
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
                        flexShrink: 0,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        border: '2px solid rgba(255,255,255,0.3)',
                        padding: '4px'
                    }}>
                        <img 
                            src={toeicLogo} 
                            alt="TOEIC Logo" 
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain'
                            }}
                        />
                    </div>
                    {isToggled && (
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{
                                color: roleDisplay.color,
                                fontSize: '13px',
                                fontWeight: '600',
                                background: 'rgba(255,255,255,0.15)',
                                padding: '6px 12px',
                                borderRadius: '12px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                                <span>{userRole === 'admin' ? '👨‍💼' : '👨‍🏫'}</span>
                                {roleDisplay.name}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Menu */}
            <div className="admin-sidebar-nav">
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
                    background: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    border: '2px solid rgba(255,255,255,0.3)',
                    padding: '4px'
                }}>
                    <img 
                        src={toeicLogo} 
                        alt="TOEIC Logo" 
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain'
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default Sidebar;