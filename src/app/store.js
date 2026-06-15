import { configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import authReducer from "../features/auth/authSlice.js";
import boardReducer from "../features/boards/boardSlice.js";
import taskReducer from "../features/tasks/taskSlice.js";
import teamReducer from "../features/team/teamSlice.js";
import commentReducer from "../features/comments/commentSlice.js";
import attachmentReducer from "../features/attachments/attachmentSlice.js";
import notificationReducer from "../features/notifications/notificationSlice.js";
import activityReducer from "../features/activity/activitySlice.js";
import { injectStore } from "../api/axios.js";


// Custom localStorage adapter with promise-based API
const storage = {
  getItem: (key) => {
    return new Promise((resolve) => {
      try {
        const value = window.localStorage.getItem(key);
        resolve(value);
      } catch (error) {
        console.error("Error reading from localStorage:", error);
        resolve(null);
      }
    });
  },
  setItem: (key, value) => {
    return new Promise((resolve) => {
      try {
        window.localStorage.setItem(key, value);
        resolve();
      } catch (error) {
        console.error("Error writing to localStorage:", error);
        resolve();
      }
    });
  },
  removeItem: (key) => {
    return new Promise((resolve) => {
      try {
        window.localStorage.removeItem(key);
        resolve();
      } catch (error) {
        console.error("Error removing from localStorage:", error);
        resolve();
      }
    });
  },
};

const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["user", "token", "isAuthenticated", "rememberMe"],
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    boards: boardReducer,
    tasks: taskReducer,
    team: teamReducer,
    comments: commentReducer,
    attachments: attachmentReducer,
    notifications: notificationReducer,
    activity: activityReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredPaths: ["auth.error"],
      },
    }),
  devTools: import.meta.env.DEV,
});

export const persistor = persistStore(store);

injectStore(store);

export default store;
