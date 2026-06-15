import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { logout as logoutThunk } from "../features/auth/authSlice.js";
import Button from "../components/common/Button.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { ROUTES } from "../utils/constants.js";

const roleLabels = {
  admin: "Administrator",
  project_manager: "Project Manager",
  team_member: "Team Member",
};

const Home = () => {
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();

  const handleLogout = async () => {
    const result = await logout();
    if (logoutThunk.fulfilled.match(result)) {
      toast.success("Logged out successfully");
      navigate(ROUTES.LOGIN, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-brand-50">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white">
              TF
            </div>
            <span className="text-lg font-bold text-slate-900">TaskFlow</span>
          </div>
          <Button
            variant="secondary"
            className="!w-auto px-5"
            onClick={handleLogout}
            loading={loading}
          >
            Logout
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <p className="text-sm font-medium text-brand-600">Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Welcome back, {user?.name?.split(" ")[0] || "there"}!
          </h1>
          <p className="mt-2 text-slate-500">
            You&apos;re signed in as{" "}
            <span className="font-medium text-slate-700">
              {roleLabels[user?.role] || user?.role}
            </span>
            . Your workspace is ready — boards and tasks modules coming next.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Email", value: user?.email },
              { label: "Role", value: roleLabels[user?.role] },
              {
                label: "Status",
                value: user?.isVerified ? "Verified" : "Pending verification",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {item.label}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Home;
