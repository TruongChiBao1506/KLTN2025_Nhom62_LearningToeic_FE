import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../../../services/authService';
import { useAuthStore } from '../../../../hooks/useAuthStore';

const TokenManager = () => {
    const { setIsAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const tokenRefreshIntervalRef = useRef(null);
    const refreshTokenTimeoutRef = useRef(null);

    const handleLogout = useCallback(() => {
        console.log("Logging out admin/teacher...");
        
        // Determine current user type and clear appropriate tokens
        const currentUserType = AuthService.getCurrentUserType();
        if (currentUserType === 'admin' || currentUserType === 'teacher') {
            AuthService.clearTokens(currentUserType);
        } else {
            // Fallback: clear both admin and teacher tokens
            AuthService.clearTokens('admin');
            AuthService.clearTokens('teacher');
        }
        
        localStorage.removeItem('user');
        localStorage.setItem('theme', 'light');
        setIsAuthenticated(false);
        navigate('/auth/admin/signin');
    }, [navigate, setIsAuthenticated]);

    const hasValidTokens = () => {
        // ✅ Check sessionStorage for tokens (security improvement)
        const adminToken = sessionStorage.getItem("adminToken");
        const teacherToken = sessionStorage.getItem("teacherToken");
        const adminRefreshToken = sessionStorage.getItem("adminRefreshToken");
        const teacherRefreshToken = sessionStorage.getItem("teacherRefreshToken");
        
        const hasAdminTokens = adminToken && adminRefreshToken;
        const hasTeacherTokens = teacherToken && teacherRefreshToken;
        
        if (!hasAdminTokens && !hasTeacherTokens) {
            console.log("No admin or teacher tokens found");
            return false;
        }
        
        return hasAdminTokens ? 'admin' : 'teacher';
    };

    // Function to schedule the refreshToken check
    const scheduleRefreshToken = useCallback(async (userType) => {
        const refreshExpireKey = userType === 'admin' ? 'adminRefreshTokenExpirationTime' : 'teacherRefreshTokenExpirationTime';
        const refreshTokenExpireTime = Number(sessionStorage.getItem(refreshExpireKey));
        const timeUntilRefreshTokenExpiry = refreshTokenExpireTime - Date.now();

        const bufferTime = 5 * 60 * 1000; // 5 minutes

        if (timeUntilRefreshTokenExpiry > bufferTime) {
            refreshTokenTimeoutRef.current = setTimeout(async () => {
                try {
                    // ✅ Chuẩn hóa: Sử dụng checkTokensValidity với userType
                    const isValid = await AuthService.checkTokensValidity(userType);
                    
                    if (!isValid) {
                        handleLogout();
                    } else {
                        // Lên lịch kiểm tra tiếp theo
                        scheduleRefreshToken(userType);
                    }
                } catch (error) {
                    console.error(`Error checking refresh token validity (${userType}):`, error);
                    handleLogout();
                }
            }, timeUntilRefreshTokenExpiry - bufferTime);
        } else if (timeUntilRefreshTokenExpiry <= 0) {
            console.log(`Refresh token has expired (${userType}). User needs to sign in again.`);
            handleLogout();
        }
    }, [handleLogout]);

    useEffect(() => {
        const initializeTokenManagement = async () => {
            try {
                const userType = hasValidTokens();
                if (!userType) {
                    console.log("No valid tokens found, redirecting to signin");
                    handleLogout();
                    return;
                }

                console.log(`🔍 Initializing token management for ${userType}`);

                // Get the jwtExpirationTime from sessionStorage
                const accessExpireKey = userType === 'admin' ? 'adminAccessTokenExpirationTime' : 'teacherAccessTokenExpirationTime';
                const jwtExpirationTime = Number(sessionStorage.getItem(accessExpireKey));
                const now = Date.now();
                const timeUntilTokenExpiry = jwtExpirationTime - now;

                console.log(`Token expiry time (${userType}):`, new Date(jwtExpirationTime));
                console.log("Current time:", new Date(now));
                console.log("Time until expiry (minutes):", Math.floor(timeUntilTokenExpiry / (1000 * 60)));

                // Nếu token sắp hết hạn (trong vòng 5 phút), thử refresh
                const bufferTime = 5 * 60 * 1000; // 5 minutes
                
                if (timeUntilTokenExpiry <= bufferTime && timeUntilTokenExpiry > 0) {
                    console.log(`Token expiring soon (${userType}), attempting refresh...`);
                    try {
                        // ✅ Chuẩn hóa: Sử dụng checkTokensValidity với userType
                        const isValid = await AuthService.checkTokensValidity(userType);
                        if (!isValid) {
                            handleLogout();
                            return;
                        }
                    } catch (error) {
                        console.error(`Error refreshing token (${userType}):`, error);
                        handleLogout();
                        return;
                    }
                } else if (timeUntilTokenExpiry <= 0) {
                    console.log(`Token has expired (${userType}), attempting refresh...`);
                    try {
                        // ✅ Chuẩn hóa: Sử dụng checkTokensValidity với userType  
                        const isValid = await AuthService.checkTokensValidity(userType);
                        if (!isValid) {
                            handleLogout();
                            return;
                        }
                    } catch (error) {
                        console.error(`Error refreshing expired token (${userType}):`, error);
                        handleLogout();
                        return;
                    }
                }

                // Chỉ set interval nếu token còn hạn lâu
                if (timeUntilTokenExpiry > bufferTime) {
                    // Set the token refresh interval - check every 15 minutes để giảm tần suất gọi
                    const intervalTime = 15 * 60 * 1000; // 15 minutes
                    
                    tokenRefreshIntervalRef.current = setInterval(async () => {
                        try {
                            const currentAccessExpireKey = userType === 'admin' ? 'adminAccessTokenExpirationTime' : 'teacherAccessTokenExpirationTime';
                            const currentExpiry = Number(sessionStorage.getItem(currentAccessExpireKey));
                            const currentTime = Date.now();
                            const timeLeft = currentExpiry - currentTime;
                            
                            // Chỉ refresh nếu token thực sự sắp hết hạn (trong vòng 3 phút)
                            if (timeLeft <= (3 * 60 * 1000)) {
                                console.log(`🔄 Token refresh triggered for ${userType} (${Math.floor(timeLeft/1000/60)} minutes left)`);
                                await AuthService.checkTokensValidity(userType);
                            }
                        } catch (error) {
                            console.error(`Error in token refresh interval (${userType}):`, error);
                            if (tokenRefreshIntervalRef.current) {
                                clearInterval(tokenRefreshIntervalRef.current);
                                tokenRefreshIntervalRef.current = null;
                            }
                        }
                    }, intervalTime);
                }

                // Schedule the refreshToken check
                await scheduleRefreshToken(userType);
            } catch (error) {
                console.error('Error initializing token management:', error);
                handleLogout();
            }
        };

        initializeTokenManagement();

        // Cleanup function
        return () => {
            if (tokenRefreshIntervalRef.current) {
                clearInterval(tokenRefreshIntervalRef.current);
                tokenRefreshIntervalRef.current = null;
            }

            if (refreshTokenTimeoutRef.current) {
                clearTimeout(refreshTokenTimeoutRef.current);
                refreshTokenTimeoutRef.current = null;
            }
        };
    }, [handleLogout, scheduleRefreshToken]);

    return null;
};

export default TokenManager;