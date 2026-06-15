import { useSelector, useDispatch } from "react-redux";
import {
  login,
  register,
  logout,
  fetchCurrentUser,
  requestPasswordReset,
  resetPassword,
  updateProfile,
  updateAvatar,
  clearError,
  setRememberMe,
} from "../features/auth/authSlice.js";

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  return {
    ...auth,
    login: (credentials) => dispatch(login(credentials)),
    register: (userData) => dispatch(register(userData)),
    logout: () => dispatch(logout()),
    fetchCurrentUser: () => dispatch(fetchCurrentUser()),
    forgotPassword: (email) => dispatch(requestPasswordReset(email)),
    resetUserPassword: (payload) => dispatch(resetPassword(payload)),
    updateProfile: (profileData) => dispatch(updateProfile(profileData)),
    updateAvatar: (avatarFormData) => dispatch(updateAvatar(avatarFormData)),
    clearError: () => dispatch(clearError()),
    setRememberMe: (value) => dispatch(setRememberMe(value)),
  };
};

export default useAuth;
