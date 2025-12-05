import React, { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import TeacherSidebar from '../components/Admin/TeacherSidebar';
import TeacherHeader from '../components/Teacher/Layouts/TeacherHeader';
import TokenManager from '../components/Admin/Layouts/CheckAccessToken';
import { useAuthStore } from '../hooks/useAuthStore';
import socketService from '../services/socketService';
import { fetchNotifications, addNotification } from '../store/notificationSlice';
import '../pages/Admin/AdminLayout/style.css'; // Sử dụng chung CSS với AdminLayout

const TeacherLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isAnimating, setIsAnimating] = useState(false);
    
    // Get teacher info from auth store
    const { info: teacherUserData } = useAuthStore();
    const dispatch = useDispatch();

    // Smooth initial load
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 100);
        
        return () => clearTimeout(timer);
    }, []);
    
    // Setup socket connection for teacher - only update Redux, no toast
    const handleNewNotification = useCallback((notification) => {
        console.log('🔔 Real-time notification received in TeacherLayout:', notification);
        // Only add to Redux store, no toast
        dispatch(addNotification(notification));
    }, [dispatch]);
    
    useEffect(() => {
        if (!teacherUserData?.id) {
            console.log('⚠️ No teacher user info, skipping socket connection');
            return;
        }
        
        console.log('🔌 Setting up socket connection for teacher:', teacherUserData.id);
        
        // Connect socket
        socketService.connect(teacherUserData.id);
        
        // Register listener ONCE - only update notification list, no toast
        console.log('📝 Registering notification listener for teacher (no toast)...');
        socketService.on('notification', handleNewNotification);
        
        // Fetch initial notifications
        dispatch(fetchNotifications(teacherUserData.id));
        
        // Cleanup function to remove listener on unmount
        return () => {
            console.log('🧹 Cleaning up notification listener in TeacherLayout');
            socketService.off('notification', handleNewNotification);
        };
    }, [teacherUserData?.id, dispatch, handleNewNotification]);

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

            {/* Teacher Sidebar with enhanced props */}
            <TeacherSidebar 
                isToggled={isSidebarOpen} 
                isAnimating={isAnimating}
            />

            {/* Main Content */}
            <div className="container-fluid background">
                <TeacherHeader 
                    toggleSidebar={toggleSidebar} 
                    isSidebarOpen={isSidebarOpen}
                    isAnimating={isAnimating}
                />

                <div className="main-content">
                    <Outlet />
                </div>
            </div>

            {/* Debug Component (optional, only in development) */}
            {process.env.NODE_ENV === 'development' && (
                <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 9999 }}>
                    {/* DebugNotifications component could be added here if needed */}
                </div>
            )}
        </div>
    );
};

export default TeacherLayout;