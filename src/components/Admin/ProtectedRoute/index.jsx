import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    // ✅ Check sessionStorage instead of localStorage
    const token = sessionStorage.getItem('adminToken');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token || !user?.role) {
        console.log('No token or user role - redirecting to signin');
        return <Navigate to="/auth/admin/signin" replace />;
    }

    const allowedRoles = ['admin', 'teacher'];
    
    if (!allowedRoles.includes(user.role)) {
        console.log('User role not allowed:', user.role);
        // ✅ Clear from sessionStorage
        sessionStorage.removeItem('adminToken');
        sessionStorage.removeItem('adminRefreshToken');
        sessionStorage.removeItem('adminAccessTokenExpirationTime');
        sessionStorage.removeItem('adminRefreshTokenExpirationTime');
        localStorage.removeItem('user');
        return <Navigate to="/auth/admin/signin" replace />;
    }

    console.log('User authorized:', user.username, '- Role:', user.role);
    return children;
};

export default ProtectedRoute;
