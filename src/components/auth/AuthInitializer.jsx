import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCurrentUser,
  setInitialized,
} from "../../features/auth/authSlice.js";

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const { token, isInitialized } = useSelector((state) => state.auth);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        await dispatch(fetchCurrentUser());
      } else {
        dispatch(setInitialized());
      }
    };

    if (!isInitialized) {
      initAuth();
    }
  }, [dispatch, token, isInitialized]);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          <p className="text-sm text-slate-500">Restoring session...</p>
        </div>
      </div>
    );
  }

  return children;
};

export default AuthInitializer;
