import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow, format } from "date-fns";
import { fetchActivity, clearActivity } from "../../features/activity/activitySlice.js";

// ─── Activity type configs ────────────────────────────────────────────────────
const ACTIVITY_CONFIG = {
  task_created: {
    label: "Created task",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    dotColor: "bg-emerald-500",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  task_updated: {
    label: "Updated task",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    dotColor: "bg-blue-500",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  status_changed: {
    label: "Changed status",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    dotColor: "bg-violet-500",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  priority_changed: {
    label: "Changed priority",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    dotColor: "bg-amber-500",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
      </svg>
    ),
  },
  comment_added: {
    label: "Added a comment",
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
    dotColor: "bg-sky-500",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  file_uploaded: {
    label: "Uploaded a file",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    dotColor: "bg-teal-500",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
  },
  file_deleted: {
    label: "Deleted a file",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    dotColor: "bg-rose-500",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
  },
};

const getConfig = (type) => ACTIVITY_CONFIG[type] || ACTIVITY_CONFIG.task_updated;

// ─── Status label map ─────────────────────────────────────────────────────────
const STATUS_LABELS = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

const PRIORITY_LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

// ─── Activity detail text builder ─────────────────────────────────────────────
const buildDetailText = (activity) => {
  const { action, field, oldValue, newValue, metadata } = activity;

  if (action === "status_changed") {
    const from = STATUS_LABELS[oldValue] || oldValue || "—";
    const to = STATUS_LABELS[newValue] || newValue || "—";
    return { from, to, type: "transition" };
  }

  if (action === "priority_changed") {
    const from = PRIORITY_LABELS[oldValue] || oldValue || "—";
    const to = PRIORITY_LABELS[newValue] || newValue || "—";
    return { from, to, type: "transition" };
  }

  if (action === "comment_added" && metadata?.commentText) {
    return { comment: metadata.commentText, type: "comment" };
  }

  if (action === "file_uploaded" && metadata?.fileName) {
    return { file: metadata.fileName, type: "file" };
  }

  if (action === "file_deleted" && metadata?.fileName) {
    return { file: metadata.fileName, type: "file_deleted" };
  }

  return { type: "plain" };
};

// ─── Single Activity Item ─────────────────────────────────────────────────────
const ActivityItem = ({ activity, isLast }) => {
  const config = getConfig(activity.action);
  const detail = buildDetailText(activity);
  const user = activity.performedBy || {};

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="relative flex gap-4"
    >
      {/* Timeline connector */}
      {!isLast && (
        <div className="absolute left-[22px] top-12 h-full w-0.5 bg-gradient-to-b from-slate-200 to-transparent" />
      )}

      {/* Avatar */}
      <div className="relative z-10 flex-shrink-0">
        {user.avatar?.url ? (
          <img
            src={user.avatar.url}
            alt={user.name}
            className="h-11 w-11 rounded-full border-2 border-white object-cover shadow-sm"
          />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-brand-500 to-brand-600 text-sm font-bold text-white shadow-sm">
            {user.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
        )}
        {/* Action icon badge */}
        <div className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white ${config.iconBg} ${config.iconColor}`}>
          <div className="scale-75">{config.icon}</div>
        </div>
      </div>

      {/* Content card */}
      <div className="mb-6 flex-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
        {/* Action header */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate-800">
            {user.name || "Someone"}
          </span>
          <span className="text-sm text-slate-500">{config.label}</span>
        </div>

        {/* Detail content */}
        {detail.type === "transition" && (
          <div className="mt-2.5 flex items-center gap-2">
            <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
              {detail.from}
            </span>
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <span className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${
              config.dotColor.includes("violet")
                ? "border-violet-200 bg-violet-50 text-violet-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
            }`}>
              {detail.to}
            </span>
          </div>
        )}

        {detail.type === "comment" && (
          <div className="mt-2.5 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
            <p className="text-sm text-slate-600 italic">"{detail.comment}"</p>
          </div>
        )}

        {(detail.type === "file" || detail.type === "file_deleted") && (
          <div className="mt-2.5 flex items-center gap-2">
            <svg className={`h-4 w-4 ${detail.type === "file_deleted" ? "text-rose-400" : "text-teal-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            <span className={`text-sm ${detail.type === "file_deleted" ? "text-rose-600 line-through" : "text-slate-700"}`}>
              {detail.file}
            </span>
          </div>
        )}

        {/* Timestamp */}
        <div className="mt-3 flex items-center gap-2">
          <svg className="h-3.5 w-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs text-slate-400" title={format(new Date(activity.createdAt), "PPpp")}>
            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
          </span>
          <span className="text-xs text-slate-300">·</span>
          <span className="text-xs text-slate-400">
            {format(new Date(activity.createdAt), "MMM d, yyyy")}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Skeleton Loading ─────────────────────────────────────────────────────────
const ActivitySkeleton = () => (
  <div className="flex gap-4">
    <div className="h-11 w-11 animate-pulse rounded-full bg-slate-200 flex-shrink-0" />
    <div className="mb-6 flex-1 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="mt-3 h-8 w-3/4 animate-pulse rounded-xl bg-slate-200" />
      <div className="mt-3 h-3 w-24 animate-pulse rounded bg-slate-200" />
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ActivityTimeline = ({ taskId, className = "" }) => {
  const dispatch = useDispatch();
  const { activities, loading, error } = useSelector((state) => state.activity);

  useEffect(() => {
    if (taskId) {
      dispatch(fetchActivity(taskId));
    }
    return () => {
      dispatch(clearActivity());
    };
  }, [dispatch, taskId]);

  if (loading) {
    return (
      <div className={`space-y-0 ${className}`}>
        {[1, 2, 3].map((i) => <ActivitySkeleton key={i} />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center ${className}`}>
        <svg className="mb-3 h-10 w-10 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-sm font-medium text-rose-700">Failed to load activity</p>
        <p className="mt-1 text-xs text-rose-500">{error}</p>
        <button
          onClick={() => dispatch(fetchActivity(taskId))}
          className="mt-4 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className={`flex flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-14 text-center ${className}`}>
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
          <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-slate-600">No activity yet</h3>
        <p className="mt-1 text-xs text-slate-400">
          Activity will appear here as changes are made to this task.
        </p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
            <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-slate-700">Activity History</h3>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
          {activities.length} event{activities.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Timeline */}
      <AnimatePresence>
        <div className="relative">
          {activities.map((activity, index) => (
            <ActivityItem
              key={activity._id || index}
              activity={activity}
              isLast={index === activities.length - 1}
            />
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
};

export default ActivityTimeline;
