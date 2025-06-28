import { useSelector, useDispatch } from 'react-redux';
import { setUserInfo, setIsAuthenticatedUser, logoutUser } from '../store/store';

// Custom hook cho user
export const useUserStore = () => {
  const dispatch = useDispatch();
  const info = useSelector((state) => state.user.info);
  const isAuthenticatedUser = useSelector((state) => state.user.isAuthenticatedUser);

  return {
    info,
    isAuthenticatedUser,
    setUserInfo: (value) => dispatch(setUserInfo(value)),
    setIsAuthenticatedUser: (value) => dispatch(setIsAuthenticatedUser(value)),
    logoutUser: () => dispatch(logoutUser()),
  };
};