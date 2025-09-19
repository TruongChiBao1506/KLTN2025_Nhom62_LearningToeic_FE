
import { useSelector, useDispatch } from 'react-redux';
import { setInfo, setIsAuthenticated, setRole, logout } from '../store/store';

// Hook cho auth (không phân biệt admin/user)
export const useAuthStore = () => {
  const dispatch = useDispatch();
  const info = useSelector((state) => state.auth.info);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const role = useSelector((state) => state.auth.role); // 'admin' hoặc 'user'

  return {
    info,
    isAuthenticated,
    role,
    setInfo: (value) => dispatch(setInfo(value)),
    setIsAuthenticated: (value) => dispatch(setIsAuthenticated(value)),
    setRole: (value) => dispatch(setRole(value)),
    logout: () => dispatch(logout()),
  };
};
