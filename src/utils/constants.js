export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  BOARDS: "/boards",
  BOARD_DETAILS: "/boards/:boardId",
  BOARD_TASKS: "/boards/:boardId/tasks",
  BOARD_MEMBERS: "/boards/:boardId/team",
  TASK_DETAILS: "/boards/:boardId/tasks/:taskId",
  PROFILE: "/profile",
  NOTIFICATIONS: "/notifications",
  ANALYTICS: "/analytics",
  NOT_FOUND: "/404",
  FORBIDDEN: "/403",
  SERVER_ERROR: "/500",
};

export const USER_ROLES = {
  ADMIN: "admin",
  PROJECT_MANAGER: "project_manager",
  TEAM_MEMBER: "team_member",
};
