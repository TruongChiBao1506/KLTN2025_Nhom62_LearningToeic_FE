import axios from 'axios';
import queryString from 'query-string';

const getToken = () => {
    // ✅ Priority: admin -> teacher -> learner -> general user
    // ✅ Read from sessionStorage (security improvement)
    const adminToken = sessionStorage.getItem('adminToken');
    const teacherToken = sessionStorage.getItem('teacherToken');
    const learnerToken = sessionStorage.getItem('learnerToken');
    const userToken = sessionStorage.getItem('accessToken');
    
    return adminToken || teacherToken || learnerToken || userToken;
};

const getRefreshToken = () => {
    // ✅ Read from sessionStorage
    const adminRefreshToken = sessionStorage.getItem('adminRefreshToken');
    const teacherRefreshToken = sessionStorage.getItem('teacherRefreshToken');
    const learnerRefreshToken = sessionStorage.getItem('learnerRefreshToken');
    const userRefreshToken = sessionStorage.getItem('refreshToken');
    
    return adminRefreshToken || teacherRefreshToken || learnerRefreshToken || userRefreshToken;
};

const getUserType = () => {
    // ✅ Check sessionStorage for token presence
    if (sessionStorage.getItem('adminToken')) return 'admin';
    if (sessionStorage.getItem('teacherToken')) return 'teacher';
    if (sessionStorage.getItem('learnerToken')) return 'learner';
    return 'user';
};

const axiosClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {
        'content-type': 'application/json',
    },
    paramsSerializer: (params) => queryString.stringify(params),
});

axiosClient.interceptors.request.use(async (config) => {
    const token = getToken();
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosClient.interceptors.response.use(
    (response) => {
        if (response && response.data) {
            return response.data;
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        const refreshToken = getRefreshToken();
        
        //Kiểm tra nếu là auth endpoint
        const isAuthEndpoint = originalRequest.url.includes('/auth/signin') || 
                              originalRequest.url.includes('/auth/signup') ||
                              originalRequest.url.includes('/auth/refresh');
        
        // Nếu lỗi 401 NHƯNG là auth endpoint, không refresh token
        if (error.response?.status === 401 && isAuthEndpoint) {
            return Promise.reject(error);
        }
        
        // Nếu lỗi 401 và KHÔNG phải auth endpoint, thử refresh token
        if (error.response?.status === 401 && !isAuthEndpoint && refreshToken && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const response = await axios.post('http://localhost:5000/api/auth/refreshtoken', {
                    refreshToken,
                });
                
                const newToken = response.data.token || response.data.accessToken;
                const userType = getUserType();
                
                // ✅ Save new token to sessionStorage based on user type
                if (userType === 'admin') {
                    sessionStorage.setItem('adminToken', newToken);
                    if (response.data.refreshToken) {
                        sessionStorage.setItem('adminRefreshToken', response.data.refreshToken);
                    }
                    if (response.data.jwtExpirationTime) {
                        sessionStorage.setItem('adminAccessTokenExpirationTime', 
                            (Date.now() + response.data.jwtExpirationTime).toString());
                    }
                } else if (userType === 'teacher') {
                    sessionStorage.setItem('teacherToken', newToken);
                    if (response.data.refreshToken) {
                        sessionStorage.setItem('teacherRefreshToken', response.data.refreshToken);
                    }
                    if (response.data.jwtExpirationTime) {
                        sessionStorage.setItem('teacherAccessTokenExpirationTime', 
                            (Date.now() + response.data.jwtExpirationTime).toString());
                    }
                } else if (userType === 'learner') {
                    sessionStorage.setItem('learnerToken', newToken);
                    if (response.data.refreshToken) {
                        sessionStorage.setItem('learnerRefreshToken', response.data.refreshToken);
                    }
                    if (response.data.jwtExpirationTime) {
                        sessionStorage.setItem('learnerAccessTokenExpirationTime', 
                            (Date.now() + response.data.jwtExpirationTime).toString());
                    }
                } else {
                    // General user tokens
                    sessionStorage.setItem('accessToken', newToken);
                    if (response.data.refreshToken) {
                        sessionStorage.setItem('refreshToken', response.data.refreshToken);
                    }
                }
                
                // Retry request với token mới
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                return axiosClient(originalRequest);
            } catch (refreshError) {
                // ✅ Clear all tokens from both storages on refresh failure
                sessionStorage.clear();
                
                // Clear user data from localStorage
                localStorage.removeItem('user');
                localStorage.removeItem('learnerUser');
                
                // Clean up old localStorage tokens (backward compatibility)
                const oldKeys = [
                    'accessToken', 'refreshToken',
                    'adminToken', 'adminRefreshToken', 'adminAccessTokenExpirationTime', 'adminRefreshTokenExpirationTime',
                    'teacherToken', 'teacherRefreshToken', 'teacherAccessTokenExpirationTime', 'teacherRefreshTokenExpirationTime',
                    'learnerToken', 'learnerRefreshToken', 'learnerAccessTokenExpirationTime', 'learnerRefreshTokenExpirationTime',
                    'learnerAuthenticated'
                ];
                oldKeys.forEach(key => localStorage.removeItem(key));
                
                // ✅ Redirect based on current page
                const currentPath = window.location.pathname;
                if (currentPath.includes('/admin')) {
                    window.location.href = '/auth/admin/signin';
                } else if (currentPath.includes('/teacher')) {
                    window.location.href = '/auth/admin/signin';
                } else {
                    window.location.href = '/auth/signin';
                }
                return Promise.reject(refreshError);
            }
        }
        
        // Trả về lỗi để component xử lý
        return Promise.reject(error);
    }
);

export default axiosClient;