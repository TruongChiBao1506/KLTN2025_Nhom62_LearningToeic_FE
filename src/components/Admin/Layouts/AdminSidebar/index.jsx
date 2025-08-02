import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './style.css';
import toeic_logo from '../../../../assets/Toeic_logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

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
            className="border-end bg-white p-2"
            id="sidebar-wrapper"
            style={{
                /* Remove any inline styles that might hide sidebar */
                display: 'block',
                visibility: 'visible',
                opacity: 1
            }}
        >
            {/* Logo/Header */}
            <div
                className="logo-header-glass mb-2"
                style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '25px',
                    padding: '25px 20px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    position: 'relative'
                }}
            >
                <div className="d-flex flex-column align-items-center">
                    {/* Logo with glow effect */}
                    <div
                        className="position-relative mb-3"
                        style={{
                            background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
                            borderRadius: '50%',
                            padding: '12px',
                            boxShadow: '0 0 30px rgba(28, 117, 188, 0.5)',
                            border: '2px solid rgba(28, 117, 188, 0.3)'
                        }}
                    >
                        <img
                            src={toeic_logo}
                            alt="TOEIC Admin"
                            width="90"
                            height="90"
                            className="rounded-circle"
                            style={{
                                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
                                transition: 'all 0.3s ease'
                            }}
                        />

                        {/* Pulse animation ring */}
                        <div
                            style={{
                                position: 'absolute',
                                top: '-5px',
                                left: '-5px',
                                right: '-5px',
                                bottom: '-5px',
                                borderRadius: '50%',
                                border: '2px solid rgba(28, 117, 188, 0.3)',
                                animation: 'pulse 2s infinite'
                            }}
                        ></div>
                    </div>

                    {/* Brand info */}
                    <div className="text-center">
                        <h4 className="fw-bold mb-2" style={{
                            color: '#1c75bc',
                            fontSize: '16px',
                            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            🎓 TOEIC ACADEMY
                        </h4>
                        {/* <div className="d-flex align-items-center justify-content-center">
                            <span className="badge bg-success me-2" style={{ fontSize: '10px' }}>
                                ADMIN
                            </span>
                            <small className="text-muted">Dashboard</small>
                        </div> */}
                    </div>
                </div>
            </div>

            {/* Menu Items */}
            <div className="list-group list-group-flush">
                {menuItems.map((item) => (
                    <button
                        key={item.key}
                        className={`custom-list-item ${isActiveRoute(item.path) ? 'active' : ''}`}
                        onClick={() => handleNavigation(item.path)}
                        type="button"
                    >
                        <div className="d-flex align-items-center justify-content-between w-100">
                            <div className="d-flex align-items-center">
                                <i className={`${item.icon} me-3`}></i>
                                <span>{item.label}</span>
                            </div>
                            <div>
                                {isActiveRoute(item.path) && (
                                    <FontAwesomeIcon
                                        icon={faChevronRight}
                                        className="text-white"
                                        style={{ fontSize: '12px' }}
                                    />
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