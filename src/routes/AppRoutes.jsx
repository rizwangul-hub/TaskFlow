import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout.jsx";
import MainLayout from "../layouts/MainLayout.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import GuestRoute from "./GuestRoute.jsx";
import { ROUTES } from "../utils/constants.js";
import PageLoader from "../components/ui/PageLoader.jsx";

// ─── Lazy-loaded Auth Pages ──────────────────────────────────────────────────
const Login = lazy(() => import("../pages/auth/Login.jsx"));
const Register = lazy(() => import("../pages/auth/Register.jsx"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword.jsx"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword.jsx"));

// ─── Lazy-loaded App Pages ───────────────────────────────────────────────────
const Dashboard = lazy(() => import("../pages/Dashboard.jsx"));
const BoardsList = lazy(() => import("../pages/BoardsList.jsx"));
const Profile = lazy(() => import("../pages/Profile.jsx"));
const KanbanBoard = lazy(() => import("../pages/tasks/KanbanBoard.jsx"));
const TasksPage = lazy(() => import("../pages/tasks/TasksPage.jsx"));
const TeamPage = lazy(() => import("../pages/team/TeamPage.jsx"));
const TaskDetails = lazy(() => import("../pages/tasks/TaskDetails.jsx"));
const NotificationsPage = lazy(() =>
  import("../pages/notifications/NotificationsPage.jsx")
);
const AnalyticsPage = lazy(() =>
  import("../pages/dashboard/AnalyticsPage.jsx")
);

// ─── Lazy-loaded Error Pages ─────────────────────────────────────────────────
const NotFound = lazy(() => import("../pages/errors/404.jsx"));
const Forbidden = lazy(() => import("../pages/errors/403.jsx"));
const ServerError = lazy(() => import("../pages/errors/500.jsx"));

// ─── Suspense Fallback ────────────────────────────────────────────────────────
const SuspenseFallback = () => <PageLoader />;

const AppRoutes = () => {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <Routes>
        {/* ── Auth Routes ── */}
        <Route element={<AuthLayout />}>
          <Route
            path={ROUTES.LOGIN}
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path={ROUTES.REGISTER}
            element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            }
          />
          <Route
            path={ROUTES.FORGOT_PASSWORD}
            element={
              <GuestRoute>
                <ForgotPassword />
              </GuestRoute>
            }
          />
          <Route
            path={`${ROUTES.RESET_PASSWORD}/:token`}
            element={
              <GuestRoute>
                <ResetPassword />
              </GuestRoute>
            }
          />
          <Route
            path={ROUTES.RESET_PASSWORD}
            element={
              <GuestRoute>
                <ResetPassword />
              </GuestRoute>
            }
          />
        </Route>

        {/* ── Protected App Routes ── */}
        <Route element={<MainLayout />}>
          <Route
            path={ROUTES.HOME}
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.BOARDS}
            element={
              <ProtectedRoute>
                <BoardsList />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.BOARD_DETAILS}
            element={
              <ProtectedRoute>
                <KanbanBoard />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.BOARD_TASKS}
            element={
              <ProtectedRoute>
                <TasksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.BOARD_MEMBERS}
            element={
              <ProtectedRoute>
                <TeamPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.TASK_DETAILS}
            element={
              <ProtectedRoute>
                <TaskDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.PROFILE}
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.NOTIFICATIONS}
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ANALYTICS}
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* ── Error Pages (standalone, no layout) ── */}
        <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
        <Route path={ROUTES.FORBIDDEN} element={<Forbidden />} />
        <Route path={ROUTES.SERVER_ERROR} element={<ServerError />} />

        {/* ── Catch-all → 404 ── */}
        <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
