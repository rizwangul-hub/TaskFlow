import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow, format } from "date-fns";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  removeNotification,
} from "../../features/notifications/notificationSlice.js";

const TYPE_CONFIG = {
  task_assigned: {
    label: "Task Assigned",
    bgIcon: "bg-blue-100",
    iconColor: "text-blue-600",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  deadline_reminder: {
    label: "Deadline",
    bgIcon: "bg-amber-100",
    iconColor: "text-amber-600",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  overdue: {
    label: "Overdue",
    bgIcon: "bg-rose-100",
    iconColor: "text-rose-600",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  comment: {
    label: "Comment",
    bgIcon: "bg-violet-100",
    iconColor: "text-violet-600",
    badgeClass: "bg-violet-50 text-violet-700 border-violet-200",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  status_changed: {
    label: "Status",
    bgIcon: "bg-emerald-100",
    iconColor: "text-emerald-600",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  welcome: {
    label: "Welcome",
    bgIcon: "bg-brand-100",
    iconColor: "text-brand-600",
    badgeClass: "bg-brand-50 text-brand-700 border-brand-200",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
};

const getConfig = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.task_assigned;

const NotificationCard = ({ notification, onMarkRead, onDelete }) => {
  const config = getConfig(notification.type);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.25 }}
      className={`group relative rounded-2xl border p-5 transition-all ${
        !notification.read
          ? "border-brand-200 bg-gradient-to-r from-brand-50/60 to-white shadow-sm"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${config.bgIcon} ${config.iconColor}`}>
          {config.icon}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${config.badgeClass}`}>
              {config.label}
            </span>
            {!notification.read && (
              <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                New
              </span>
            )}
          </div>

          <h3 className={`mt-1.5 text-sm font-semibold ${!notification.read ? "text-slate-900" : "text-slate-700"}`}>
            {notification.title}
          </h3>
          <p className="mt-1 text-sm text-slate-500 leading-relaxed">{notification.message}</p>

          <div className="mt-3 flex items-center gap-4">
            <span className="text-xs text-slate-400">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs text-slate-400">
              {format(new Date(notification.createdAt), "MMM d, yyyy 'at' h:mm a")}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {!notification.read && (
            <button
              onClick={() => onMarkRead(notification._id)}
              title="Mark as read"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}
          <button
            onClick={() => onDelete(notification._id)}
            title="Delete notification"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const SkeletonCard = () => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5">
    <div className="flex items-start gap-4">
      <div className="h-11 w-11 animate-pulse rounded-xl bg-slate-200" />
      <div className="flex-1 space-y-3">
        <div className="h-5 w-24 animate-pulse rounded-md bg-slate-200" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  </div>
);

const FILTER_TABS = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "task_assigned", label: "Assigned" },
  { id: "deadline_reminder", label: "Deadlines" },
  { id: "overdue", label: "Overdue" },
];

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const { notifications, loading, unreadCount } = useSelector((state) => state.notifications);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.read;
    return n.type === activeTab;
  });

  const handleMarkRead = (id) => dispatch(markNotificationRead(id));
  const handleDelete = (id) => dispatch(removeNotification(id));
  const handleMarkAllRead = () => dispatch(markAllNotificationsRead());

  return (
    <div className="mx-auto max-w-3xl">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">Notifications</h1>
            <p className="mt-1 text-sm text-slate-500">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                : "All caught up! No unread notifications."}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              id="mark-all-read-btn"
              className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-700 transition-all hover:bg-brand-100"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Mark all as read
            </button>
          )}
        </div>

        {/* Stats row */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total", count: notifications.length, color: "text-slate-700", bg: "bg-slate-50 border-slate-200" },
            { label: "Unread", count: unreadCount, color: "text-brand-700", bg: "bg-brand-50 border-brand-200" },
            { label: "Overdue", count: notifications.filter((n) => n.type === "overdue").length, color: "text-rose-700", bg: "bg-rose-50 border-rose-200" },
            { label: "Deadlines", count: notifications.filter((n) => n.type === "deadline_reminder").length, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-xl border p-3 ${stat.bg}`}>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-1">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
            {tab.id === "unread" && unreadCount > 0 && (
              <span className="ml-1.5 rounded-full bg-brand-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 text-center"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-slate-700">No notifications here</h3>
          <p className="mt-1 text-sm text-slate-400">
            {activeTab === "unread" ? "You've read everything!" : "Nothing to show for this filter."}
          </p>
        </motion.div>
      ) : (
        <motion.div layout className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification._id}
                notification={notification}
                onMarkRead={handleMarkRead}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default NotificationsPage;
