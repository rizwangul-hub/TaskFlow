import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchDashboardAnalytics, fetchOverdueTasks } from "../features/tasks/taskSlice.js";
import Spinner from "../components/common/Spinner.jsx";
import { ROUTES } from "../utils/constants.js";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { analytics, overdueTasks, loading } = useSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(fetchDashboardAnalytics());
    dispatch(fetchOverdueTasks());
  }, [dispatch]);

  if (loading && !analytics) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const {
    totalBoards = 0,
    totalTasks = 0,
    overdueTasks: analyticsOverdueCount = 0,
    tasksByStatus = {},
    tasksByPriority = {},
  } = analytics || {};

  // Color mapping helpers
  const priorityColors = {
    critical: "bg-red-500",
    high: "bg-orange-500",
    medium: "bg-yellow-500",
    low: "bg-green-500",
  };

  const statusColors = {
    todo: "bg-slate-400",
    in_progress: "bg-blue-500",
    review: "bg-purple-500",
    done: "bg-emerald-500",
  };

  const statusLabels = {
    todo: "To Do",
    in_progress: "In Progress",
    review: "In Review",
    done: "Done",
  };

  const priorityLabels = {
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
  };

  return (
    <div className="space-y-8">
      {/* ─── Top Stats Cards ─── */}
      <div className="grid gap-6 sm:grid-cols-3">
        {/* Total Boards */}
        <div className="stat-card flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Boards</p>
            <h3 className="mt-2 font-display text-3xl font-bold text-slate-900">{totalBoards}</h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </div>

        {/* Total Tasks */}
        <div className="stat-card flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Tasks</p>
            <h3 className="mt-2 font-display text-3xl font-bold text-slate-900">{totalTasks}</h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>

        {/* Overdue Tasks */}
        <div className="stat-card flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Overdue Tasks</p>
            <h3 className="mt-2 font-display text-3xl font-bold text-red-600">{analyticsOverdueCount}</h3>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${analyticsOverdueCount > 0 ? "bg-red-50 text-red-600 animate-pulse" : "bg-slate-50 text-slate-400"}`}>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
      </div>

      {/* ─── Breakdown Columns ─── */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Tasks by Status */}
        <div className="section-card">
          <h4 className="font-display text-base font-bold text-slate-800">Tasks by Status</h4>
          <div className="mt-6 space-y-4">
            {["todo", "in_progress", "review", "done"].map((status) => {
              const count = tasksByStatus[status] || 0;
              const pct = totalTasks > 0 ? (count / totalTasks) * 100 : 0;
              return (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-600">{statusLabels[status]}</span>
                    <span className="font-semibold text-slate-800">
                      {count} <span className="text-xs font-normal text-slate-400">({pct.toFixed(0)}%)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full transition-all duration-500 ${statusColors[status]}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tasks by Priority */}
        <div className="section-card">
          <h4 className="font-display text-base font-bold text-slate-800">Tasks by Priority</h4>
          <div className="mt-6 space-y-4">
            {["critical", "high", "medium", "low"].map((priority) => {
              const count = tasksByPriority[priority] || 0;
              const pct = totalTasks > 0 ? (count / totalTasks) * 100 : 0;
              return (
                <div key={priority} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-600">{priorityLabels[priority]}</span>
                    <span className="font-semibold text-slate-800">
                      {count} <span className="text-xs font-normal text-slate-400">({pct.toFixed(0)}%)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full transition-all duration-500 ${priorityColors[priority]}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Overdue Tasks Section ─── */}
      <div className="section-card">
        <div className="flex items-center justify-between pb-4">
          <h4 className="font-display text-base font-bold text-slate-800">Overdue Task Alerts</h4>
          {overdueTasks.length > 0 && (
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800">
              {overdueTasks.length} Overdue
            </span>
          )}
        </div>

        {overdueTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-700">All caught up!</p>
            <p className="text-xs text-slate-400 mt-1">No tasks are past their deadlines.</p>
          </div>
        ) : (
          <div className="mt-4 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100 bg-white">
            {overdueTasks.map((task) => (
              <div key={task._id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Link to={`/boards/${task.boardId}`} className="text-sm font-semibold text-slate-800 hover:text-brand-600 hover:underline">
                      {task.title}
                    </Link>
                    <span className={`badge ${task.priority === "critical" ? "badge-red" : "badge-yellow"}`}>
                      {priorityLabels[task.priority]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>Due Date: <strong className="text-red-500">{new Date(task.dueDate).toLocaleDateString()}</strong></span>
                    <span>•</span>
                    <span>Status: <strong className="text-slate-600">{statusLabels[task.status]}</strong></span>
                  </div>
                </div>
                <Link
                  to={`/boards/${task.boardId}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Go to Board
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
