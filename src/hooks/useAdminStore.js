import { useSelector, useDispatch } from 'react-redux';
import { setIsAuthenticatedAdmin } from '../store/store';

// Custom hook để dễ sử dụng hơn
export const useAdminStore = () => {
  const dispatch = useDispatch();
  const isAuthenticatedAdmin = useSelector((state) => state.admin.isAuthenticatedAdmin);

  return {
    isAuthenticatedAdmin,
    setIsAuthenticatedAdmin: (value) => dispatch(setIsAuthenticatedAdmin(value)),
  };
};