import React, { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../../components/Admin/Layouts/AdminSidebar';
import HeaderComponent from '../../../components/Admin/Layouts/AdminHeader';
import TokenManager from '../../../components/Admin/Layouts/CheckAccessToken';
import './style.css';

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isAnimating, setIsAnimating] = useState(false);

    // Smooth initial load
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 100);
        
        return () => clearTimeout(timer);
    }, []);

    // Enhanced toggle with animation state management
    const toggleSidebar = useCallback(() => {
        if (isAnimating) return; // Prevent rapid toggling
        
        setIsAnimating(true);
        setIsSidebarOpen(prev => !prev);
        
        // Reset animation state after transition completes
        setTimeout(() => {
            setIsAnimating(false);
        }, 600); // Match longest transition duration
    }, [isAnimating]);

    // Theme functionality (unchanged)
    useEffect(() => {
        const initializeTheme = () => {
            const getStoredTheme = () => localStorage.getItem('theme');
            const setStoredTheme = theme => localStorage.setItem('theme', theme);

            const getPreferredTheme = () => {
                const storedTheme = getStoredTheme();
                if (storedTheme) {
                    return storedTheme;
                }
                return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            };

            const setTheme = theme => {
                if (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.setAttribute('data-bs-theme', 'dark');
                } else {
                    document.documentElement.setAttribute('data-bs-theme', theme);
                }
            };

            setTheme(getPreferredTheme());

            const showActiveTheme = (theme, focus = false) => {
                const themeSwitcher = document.querySelector('#bd-theme');
                if (!themeSwitcher) return;
                
                const themeSwitcherText = document.querySelector('#bd-theme-text');
                const activeThemeIcon = document.querySelector('.theme-icon-active use');
                const btnToActive = document.querySelector(`[data-bs-theme-value="${theme}"]`);
                
                if (!btnToActive) return;
                
                const svgOfActiveBtn = btnToActive.querySelector('svg use').getAttribute('href');

                document.querySelectorAll('[data-bs-theme-value]').forEach(element => {
                    element.classList.remove('active');
                    element.setAttribute('aria-pressed', 'false');
                });

                btnToActive.classList.add('active');
                btnToActive.setAttribute('aria-pressed', 'true');
                
                if (activeThemeIcon) {
                    activeThemeIcon.setAttribute('href', svgOfActiveBtn);
                }
                
                if (themeSwitcherText) {
                    const themeSwitcherLabel = `${themeSwitcherText.textContent} (${btnToActive.dataset.bsThemeValue})`;
                    themeSwitcher.setAttribute('aria-label', themeSwitcherLabel);
                }

                if (focus) {
                    themeSwitcher.focus();
                }
            };

            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
                const storedTheme = getStoredTheme();
                if (storedTheme !== 'light' && storedTheme !== 'dark') {
                    setTheme(getPreferredTheme());
                }
            });

            setTimeout(() => {
                showActiveTheme(getPreferredTheme());

                document.querySelectorAll('[data-bs-theme-value]')
                    .forEach(toggle => {
                        toggle.addEventListener('click', () => {
                            const theme = toggle.getAttribute('data-bs-theme-value');
                            setStoredTheme(theme);
                            setTheme(theme);
                            showActiveTheme(theme, true);
                        });
                    });
            }, 100);
        };

        initializeTheme();
    }, []);

    // Enhanced class generation
    const getWrapperClasses = useCallback(() => {
        let classes = 'd-flex';
        
        if (!isSidebarOpen) {
            classes += ' sidebar-hidden';
        }
        
        if (isLoading) {
            classes += ' wrapper-loading';
        }
        
        if (isAnimating) {
            classes += ' sidebar-animating';
        }
        
        return classes;
    }, [isSidebarOpen, isLoading, isAnimating]);

    return (
        <div className={getWrapperClasses()} id="wrapper">
            <TokenManager />

            {/* Sidebar with enhanced props */}
            <Sidebar 
                isToggled={isSidebarOpen} 
                isAnimating={isAnimating}
            />

            {/* Main Content */}
            <div className="container-fluid background">
                <HeaderComponent 
                    toggleSidebar={toggleSidebar} 
                    isSidebarOpen={isSidebarOpen}
                    isAnimating={isAnimating}
                />

                <div className="main-content">
                    <Outlet />
                </div>
            </div>

            {/* SVG Icons and Theme Toggle remain the same */}
            <svg xmlns="http://www.w3.org/2000/svg" className="d-none">
                {/* ... SVG symbols ... */}
            </svg>

            <div className="dropdown position-fixed bottom-0 start-0 mb-3 ms-3 bd-mode-toggle">
                {/* ... Theme toggle ... */}
            </div>
        </div>
    );
};

export default AdminLayout;