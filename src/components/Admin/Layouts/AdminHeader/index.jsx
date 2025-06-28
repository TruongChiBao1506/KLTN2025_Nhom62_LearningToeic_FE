import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHome,
    faBell,
    faBars,
    faGear,
    faUser,
    faRightFromBracket
} from '@fortawesome/free-solid-svg-icons';
import { useAdminStore } from '../../../../hooks/useAdminStore';
import userService from '../../../../services/userService';
import { jwtDecode } from 'jwt-decode';
import './style.css';

const HeaderComponent = ({ toggleSidebar }) => {
    const { setIsAuthenticatedAdmin } = useAdminStore();
    const navigate = useNavigate();
    const [userId, setUserId] = useState(null);
    const [profileImage, setProfileImage] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const timeoutRef = useRef(null);

    // Existing functions...
    const signOut = async () => {
        try {
            const result = await userService.signOut();

            localStorage.removeItem('adminRefreshToken');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminAccessTokenExpirationTime');
            localStorage.removeItem('adminRefreshTokenExpirationTime');

            setIsAuthenticatedAdmin(false);
            navigate('/admin/signin');
        } catch (error) {
            console.log('Sign out error:', error);
            localStorage.removeItem('adminRefreshToken');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminAccessTokenExpirationTime');
            localStorage.removeItem('adminRefreshTokenExpirationTime');
            setIsAuthenticatedAdmin(false);
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
            return `http://localhost:9004/images/${imageName}`;
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

            setUserId(actualUserId);

            const userDataResult = await userService.getUserById(actualUserId);
            let userData;

            if (userDataResult !== null) {
                userData = userDataResult;
            }

            console.log('User data:', userData);
            setProfileImage(userData.image);
            console.log('Profile image:', userData.image);

        } catch (error) {
            console.log('Get user error:', error);
        }
    };

    // Dropdown handlers với delay
    const handleMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsDropdownOpen(true);
    };

    const handleMouseLeave = () => {
        // Thêm delay 300ms trước khi đóng dropdown
        timeoutRef.current = setTimeout(() => {
            setIsDropdownOpen(false);
        }, 300);
    };

    useEffect(() => {
        getUserById();

        // Cleanup timeout khi component unmount
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
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

                        {/* User dropdown với improved hover */}
                        <li
                            className="nav-item dropdown"
                            ref={dropdownRef}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <a
                                href="#"
                                className="d-block link-body-emphasis text-decoration-none dropdown-toggle"
                                style={{ marginTop: '4px' }}
                                aria-expanded={isDropdownOpen}
                            >
                                <img
                                    src={getImageUrl(profileImage)}
                                    alt="User avatar"
                                    width="32"
                                    height="32"
                                    className="rounded-circle"
                                />
                            </a>
                            <ul
                                className={`dropdown-menu text-small custom-dropdown ${isDropdownOpen ? 'show' : ''}`}
                                style={{
                                    visibility: isDropdownOpen ? 'visible' : 'hidden',
                                    opacity: isDropdownOpen ? 1 : 0,
                                    transform: isDropdownOpen ? 'translateY(0)' : 'translateY(10px)'
                                }}
                            >
                                <li>
                                    <Link
                                        to="/admin/score-table/all"
                                        className="text-dark"
                                    >
                                        <div className="dropdown-item">
                                            <FontAwesomeIcon icon={faGear} className="me-2" />
                                            Thiết lập điểm số
                                        </div>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/admin/profile"
                                        className="text-dark"
                                    >
                                        <div className="dropdown-item">
                                            <FontAwesomeIcon icon={faUser} className="me-2" />
                                            Hồ sơ cá nhân
                                        </div>
                                    </Link>
                                </li>
                                <li>
                                    <hr className="dropdown-divider" />
                                </li>
                                <li>
                                    <div
                                        className="dropdown-item"
                                        onClick={signOut}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <FontAwesomeIcon icon={faRightFromBracket} className="me-2" />
                                        Đăng xuất
                                    </div>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default HeaderComponent;