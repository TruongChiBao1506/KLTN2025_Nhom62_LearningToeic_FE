import axios from 'axios';
import queryString from 'query-string';

const getToken = () => {
    // Ưu tiên admin token trước
    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    
    return adminToken || userToken;
};

const getRefreshToken = () => {
    const adminRefreshToken = localStorage.getItem('adminRefreshToken');
    const userRefreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
    
    return adminRefreshToken || userRefreshToken;
};

const isRemembered = () => {
    return localStorage.getItem('rememberMe') === 'true';
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
                
                const newToken = response.data.accessToken;
                
                // ✅ Lưu token mới vào đúng storage
                const hasAdminToken = localStorage.getItem('adminToken');
                if (hasAdminToken) {
                    // Nếu đang dùng admin token, lưu vào admin storage
                    localStorage.setItem('adminToken', newToken);
                    if (response.data.refreshToken) {
                        localStorage.setItem('adminRefreshToken', response.data.refreshToken);
                    }
                } else {
                    // Nếu là user token thường
                    const remembered = isRemembered();
                    const storage = remembered ? localStorage : sessionStorage;
                    storage.setItem('accessToken', newToken);
                    
                    if (response.data.refreshToken) {
                        storage.setItem('refreshToken', response.data.refreshToken);
                    }
                }
                
                // Retry request với token mới
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                return axiosClient(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminRefreshToken');
                localStorage.removeItem('adminAccessTokenExpirationTime');
                localStorage.removeItem('adminRefreshTokenExpirationTime');
                sessionStorage.removeItem('accessToken');
                sessionStorage.removeItem('refreshToken');
                sessionStorage.removeItem('user');
                
                // Redirect về trang phù hợp
                const isAdminPage = window.location.pathname.includes('/admin');
                window.location.href = isAdminPage ? '/admin/signin' : '/signin';
                return Promise.reject(refreshError);
            }
        }
        
        // Trả về lỗi để component xử lý
        return Promise.reject(error);
    }
);

export default axiosClient;