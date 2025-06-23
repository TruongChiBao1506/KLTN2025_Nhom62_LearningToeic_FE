import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './style.css';
import toeic_logo from '../../../assets/Toeic_logo.png';

const Sidebar = ({ isToggled }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Define menu items with their routes and details
    const menuItems = [
        {
            key: 'dashboard',
            icon: 'fas fa-tachometer-alt',
            label: 'Dashboard',
            path: '/admin/dashboard',
            routeName: 'admin.dashboard.show'
        },
        {
            key: 'section',
            icon: 'fa-solid fa-section',
            label: 'Quản lý Section',
            path: '/admin/section',
            routeName: 'admin.section.all'
        },
        {
            key: 'topic',
            icon: 'fas fa-file-alt',
            label: 'Quản lý Topic',
            path: '/admin/topic',
            routeName: 'admin.topic.all'
        },
        {
            key: 'grammar',
            icon: 'fa-solid fa-spell-check',
            label: 'Quản lý Grammar',
            path: '/admin/grammar',
            routeName: 'admin.grammar.all'
        },
        {
            key: 'learner',
            icon: 'fas fa-users',
            label: 'Quản lý Learner',
            path: '/admin/learner',
            routeName: 'admin.learner.all'
        },
        {
            key: 'exam',
            icon: 'fa-solid fa-file',
            label: 'Quản lý Exam',
            path: '/admin/exam',
            routeName: 'admin.exam.all'
        },
        {
            key: 'feedback',
            icon: 'fa-solid fa-comment',
            label: 'Quản lý Feedback',
            path: '/admin/feedback',
            routeName: 'admin.feedback.all'
        },
        {
            key: 'freeMaterial',
            icon: 'fa-solid fa-layer-group',
            label: 'Free Materials',
            path: '/admin/free-material',
            routeName: 'admin.free-material.all'
        }
    ];

    // Navigation handlers
    const handleNavigation = (path) => {
        navigate(path);
    };

    // Check if current route is active
    const isActiveRoute = (path) => {
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    return (
        <div 
            className={`border-end bg-white p-2 ${isToggled ? 'active' : ''}`} 
            id="sidebar-wrapper"
        >
            {/* Logo/Header */}
            <div 
                className="d-flex justify-content-center align-items-center mb-4 border rounded-5" 
                style={{ backgroundColor: '#1c75bc' }}
            >
                <img 
                    className="rounded-circle my-2"
                    src={toeic_logo}
                    alt="TOEIC Image" 
                    width="100" 
                    height="100"
                />
            </div>
            
            {/* Menu Items */}
            <div className="list-group list-group-flush">
                {menuItems.map((item) => (
                    <button
                        key={item.key}
                        className={`custom-list-item rounded-5 ${isActiveRoute(item.path) ? 'active' : ''}`}
                        onClick={() => handleNavigation(item.path)}
                        type="button"
                    >
                        <div className="row">
                            <div className="col-10 d-flex justify-content-start align-items-center">
                                <i className={`${item.icon} me-2`}></i>
                                <span>{item.label}</span>
                            </div>
                            <div className="col text-end">
                                {isActiveRoute(item.path) && (
                                    <i className="fa-solid fa-chevron-right"></i>
                                )}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Sidebar;