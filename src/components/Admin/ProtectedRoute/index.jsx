import { Navigate } from 'react-router-dom';
import authService from '../../../services/authService';

const ProtectedRoute = ({ children }) => {
    const isLoggedIn = authService.isAuthenticated();
    
    if (!isLoggedIn) {
        return <Navigate to="/admin/signin" replace />;
    }
    
    return children;
};

export default ProtectedRoute;