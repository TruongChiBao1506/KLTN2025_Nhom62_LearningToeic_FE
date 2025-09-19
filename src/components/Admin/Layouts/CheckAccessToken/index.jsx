import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../../../services/authService';
import { useAuthStore } from '../../../../hooks/useAuthStore';

const TokenManager = () => {
    const { setIsAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const tokenRefreshIntervalRef = useRef(null);
    const refreshTokenTimeoutRef = useRef(null);

    const handleLogout = () => {
        console.log("Logging out admin...");
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminRefreshToken");
        localStorage.removeItem("adminAccessTokenExpirationTime");
        localStorage.removeItem("adminRefreshTokenExpirationTime");
        localStorage.setItem('theme', 'light');
    setIsAuthenticated(false);
        navigate('/admin/signin');
    };

    const hasValidTokens = () => {
        const adminToken = localStorage.getItem("adminToken");
        const adminRefreshToken = localStorage.getItem("adminRefreshToken");
        
        if (!adminToken || !adminRefreshToken) {
            console.log("No admin tokens found");
            return false;
        }
        
        return true;
    };

    // Function to schedule the refreshToken check
    const scheduleRefreshToken = async () => {
        const refreshTokenExpireTime = Number(localStorage.getItem("adminRefreshTokenExpirationTime"));
        const timeUntilRefreshTokenExpiry = refreshTokenExpireTime - Date.now();

        const bufferTime = 5 * 60 * 1000; // 5 minutes

        if (timeUntilRefreshTokenExpiry > bufferTime) {
            refreshTokenTimeoutRef.current = setTimeout(async () => {
                try {
                    // Gọi checkTokenValidity để kiểm tra refreshToken và refresh token
                    const isValid = await AuthService.checkTokensValidity(true);
                    
                    if (!isValid) {
                        handleLogout();
                    } else {
                        // Lên lịch kiểm tra tiếp theo
                        scheduleRefreshToken();
                    }
                } catch (error) {
                    console.error('Error checking refresh token validity:', error);
                    handleLogout();
                }
            }, timeUntilRefreshTokenExpiry - bufferTime);
        } else if (timeUntilRefreshTokenExpiry <= 0) {
            console.log("Refresh token has expired. User needs to sign in again.");
            handleLogout();
        }
    };

    useEffect(() => {
        const initializeTokenManagement = async () => {
            try {
                if (!hasValidTokens()) {
                    console.log("No valid tokens found, redirecting to signin");
                    handleLogout();
                    return;
                }

                // Get the jwtExpirationTime from localStorage
                const jwtExpirationTime = Number(localStorage.getItem("adminAccessTokenExpirationTime"));
                const now = Date.now();
                const timeUntilTokenExpiry = jwtExpirationTime - now;

                console.log("Token expiry time:", new Date(jwtExpirationTime));
                console.log("Current time:", new Date(now));
                console.log("Time until expiry (minutes):", Math.floor(timeUntilTokenExpiry / (1000 * 60)));

                // Nếu token sắp hết hạn (trong vòng 5 phút), thử refresh
                const bufferTime = 5 * 60 * 1000; // 5 minutes
                
                if (timeUntilTokenExpiry <= bufferTime && timeUntilTokenExpiry > 0) {
                    console.log("Token expiring soon, attempting refresh...");
                    try {
                        const isValid = await AuthService.checkTokensValidity(true);
                        if (!isValid) {
                            handleLogout();
                            return;
                        }
                    } catch (error) {
                        console.error('Error refreshing token:', error);
                        handleLogout();
                        return;
                    }
                } else if (timeUntilTokenExpiry <= 0) {
                    console.log("Token has expired, attempting refresh...");
                    try {
                        const isValid = await AuthService.checkTokensValidity(true);
                        if (!isValid) {
                            handleLogout();
                            return;
                        }
                    } catch (error) {
                        console.error('Error refreshing expired token:', error);
                        handleLogout();
                        return;
                    }
                }

                // Chỉ set interval nếu token còn hạn lâu
                if (timeUntilTokenExpiry > bufferTime) {
                    // Set the token refresh interval - check every 10 minutes
                    const intervalTime = 10 * 60 * 1000; // 10 minutes
                    
                    tokenRefreshIntervalRef.current = setInterval(async () => {
                        try {
                            const currentExpiry = Number(localStorage.getItem("adminAccessTokenExpirationTime"));
                            const currentTime = Date.now();
                            const timeLeft = currentExpiry - currentTime;
                            
                            // Chỉ refresh nếu token sắp hết hạn
                            if (timeLeft <= bufferTime) {
                                await AuthService.checkTokensValidity(true);
                            }
                        } catch (error) {
                            console.error('Error in token refresh interval:', error);
                            if (tokenRefreshIntervalRef.current) {
                                clearInterval(tokenRefreshIntervalRef.current);
                                tokenRefreshIntervalRef.current = null;
                            }
                        }
                    }, intervalTime);
                }

                // Schedule the refreshToken check
                await scheduleRefreshToken();
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
    }, [navigate, setIsAuthenticated]);

    return null;
};

export default TokenManager;