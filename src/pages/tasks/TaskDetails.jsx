import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSingleTask,
  updateTask,
  updateTaskStatus,
  updateTaskPriority,
  deleteTask,
  fetchTaskActivity,
  clearCurrentTask,
} from "../../features/tasks/taskSlice.js";
import { fetchBoardById, fetchBoardMembers } from "../../features/boards/boardSlice.js";
import { setAttachments } from "../../features/attachments/attachmentSlice.js";
import { useAuth } from "../../hooks/useAuth.js";
import Spinner from "../../components/common/Spinner.jsx";
import CommentsSection from "../../components/comments/CommentsSection.jsx";
import AttachmentsSection from "../../components/attachments/AttachmentsSection.jsx";
import ActivityTimeline from "../../components/activity/ActivityTimeline.jsx";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

// ─── Priority / Status badge helpers ────────────────────────────────────────

const PRIORITY_STYLES = {
  low: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  medium: "bg-amber-50 text-amber-700 ring-amber-200",
  high: "bg-orange-50 text-orange-700 ring-orange-200",
  critical: "bg-red-50 text-red-700 ring-red-200",
};

const STATUS_STYLES = {
  todo: "bg-slate-100 text-slate-600 ring-slate-200",
  in_progress: "bg-blue-50 text-blue-700 ring-blue-200",
  review: "bg-violet-50 text-violet-700 ring-violet-200",
  done: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

const STATUS_LABELS = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

// ─── Activity Timeline Item ──────────────────────────────────────────────────

const ActivityItem = ({ act, index }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.04 }}
    className="relative text-xs"
  >
    <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-violet-500 border-2 border-white shadow-sm" />
    <div className="flex justify-between font-bold text-slate-800">
      <span>{act.user?.name || "System"}</span>
      <span className="text-[10px] text-slate-400 font-normal">
        {new Date(act.createdAt || act.timestamp).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}
      </span>
    </div>
    <p className="text-slate-500 mt-0.5 leading-relaxed">{act.action || act.details}</p>
  </motion.div>
);

// ─── Tab definition ──────────────────────────────────────────────────────────

const TABS = [
  { id: "comments", label: "Comments", icon: (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )},
  { id: "attachments", label: "Files", icon: (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
    </svg>
  )},
  { id: "activity", label: "Activity", icon: (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )},
];

// ─── Main Component ──────────────────────────────────────────────────────────

const TaskDetails = () => {
  const { boardId, taskId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { currentBoard, members } = useSelector((state) => state.boards);
  const {
    currentTask,
    activity,
    loading,
    activityLoading,
  } = useSelector((state) => state.tasks);

  const { comments, totalComments } = useSelector((s) => s.comments);
  const { attachments: sliceAttachments, uploading } = useSelector((s) => s.attachments);

  const [activeTab, setActiveTab] = useState("comments");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  useEffect(() => {
    dispatch(fetchBoardById(boardId));
    dispatch(fetchBoardMembers(boardId));
    dispatch(fetchSingleTask(taskId));
    dispatch(fetchTaskActivity(taskId));

    return () => {
      dispatch(clearCurrentTask());
    };
  }, [dispatch, boardId, taskId]);

  // Sync task fields
  useEffect(() => {
    if (currentTask) {
      setTitle(currentTask.title || "");
      setDescription(currentTask.description || "");
      setStatus(currentTask.status || "todo");
      setPriority(currentTask.priority || "medium");
      setDueDate(
        currentTask.dueDate
          ? new Date(currentTask.dueDate).toISOString().split("T")[0]
          : ""
      );
      setAssignedTo(currentTask.assignedTo?._id || currentTask.assignedTo || "");

      // Seed attachment slice from task data (so FileCard has data immediately)
      if (currentTask.attachments?.length) {
        dispatch(setAttachments(currentTask.attachments));
      }
    }
  }, [currentTask, dispatch]);

  const handleUpdateField = async (updatedFields) => {
    try {
      const payload = {
        title: updatedFields.title ?? title,
        description: updatedFields.description ?? description,
        status: updatedFields.status ?? status,
        priority: updatedFields.priority ?? priority,
        assignedTo:
          updatedFields.assignedTo !== undefined
            ? updatedFields.assignedTo || null
            : assignedTo || null,
        dueDate:
          updatedFields.dueDate !== undefined
            ? updatedFields.dueDate
              ? new Date(updatedFields.dueDate)
              : null
            : dueDate
            ? new Date(dueDate)
            : null,
      };
      const result = await dispatch(updateTask({ id: taskId, taskData: payload }));
      if (updateTask.fulfilled.match(result)) {
        toast.success("Task updated");
        dispatch(fetchTaskActivity(taskId));
      } else {
        toast.error(result.payload || "Failed to update");
      }
    } catch {
      toast.error("An error occurred");
    }
  };

  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus);
    const result = await dispatch(updateTaskStatus({ id: taskId, status: newStatus }));
    if (updateTaskStatus.fulfilled.match(result)) {
      toast.success(`Moved to ${STATUS_LABELS[newStatus] || newStatus}`);
      dispatch(fetchTaskActivity(taskId));
    } else {
      toast.error(result.payload || "Failed to update status");
    }
  };

  const handlePriorityChange = async (newPriority) => {
    setPriority(newPriority);
    const result = await dispatch(updateTaskPriority({ id: taskId, priority: newPriority }));
    if (updateTaskPriority.fulfilled.match(result)) {
      toast.success(`Priority set to ${newPriority}`);
      dispatch(fetchTaskActivity(taskId));
    } else {
      toast.error(result.payload || "Failed to update priority");
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm("Permanently delete this task?")) return;
    const result = await dispatch(deleteTask(taskId));
    if (deleteTask.fulfilled.match(result)) {
      toast.success("Task deleted");
      navigate(`/boards/${boardId}`);
    } else {
      toast.error(result.payload || "Failed to delete task");
    }
  };

  // Badge counts for tabs
  const tabCounts = {
    comments: totalComments || comments.length,
    attachments:
      (sliceAttachments.length > 0 || uploading
        ? sliceAttachments.length
        : currentTask?.attachments?.length) || 0,
    activity: activity.length,
  };

  if (loading && !currentTask) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!currentTask) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h3 className="text-lg font-bold text-slate-800">Task not found</h3>
        <p className="text-slate-400 mt-2">It may have been deleted or moved.</p>
        <Link to={`/boards/${boardId}`} className="btn-primary mt-6 !w-auto">
          Back to Board
        </Link>
      </div>
    );
  }

  const assignedMember = members.find((m) => m._id === assignedTo);
  const isOverdue =
    dueDate && new Date(dueDate) < new Date() && status !== "done";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* ── Back nav ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <Link
          to={`/boards/${boardId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-violet-600 transition"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Board
        </Link>
        <span className="text-slate-200">/</span>
        <span className="text-xs text-slate-400 truncate max-w-[180px]">{currentTask.title}</span>
      </div>

      {/* ── Main Grid ───────────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* ── Left: Title + Tabs ─────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Title & Description Card */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ${STATUS_STYLES[status]}`}>
                {STATUS_LABELS[status] || status}
              </span>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ${PRIORITY_STYLES[priority]}`}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </span>
              {isOverdue && (
                <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-red-600 ring-1 ring-red-200">
                  Overdue
                </span>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Task Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => handleUpdateField({ title })}
                className="mt-1 w-full bg-transparent border-0 text-xl font-extrabold text-slate-800 focus:ring-0 px-0 py-1 font-display"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Description
              </label>
              {isEditingDesc ? (
                <div className="space-y-2">
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full resize-none rounded-xl border border-violet-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none ring-2 ring-violet-100 transition"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        handleUpdateField({ description });
                        setIsEditingDesc(false);
                      }}
                      className="rounded-xl bg-violet-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-violet-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setDescription(currentTask.description || "");
                        setIsEditingDesc(false);
                      }}
                      className="rounded-xl border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingDesc(true)}
                  className="cursor-pointer rounded-xl border border-dashed border-slate-200 bg-slate-50/30 p-4 text-sm text-slate-600 hover:border-violet-300 hover:bg-violet-50/10 transition min-h-[72px]"
                >
                  {description || (
                    <span className="text-slate-400 italic">
                      No description yet — click to add details…
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Tabs Card ─────────────────────────────────────────────── */}
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-slate-100 bg-slate-50/60 px-2 pt-2 gap-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-1.5 rounded-t-xl px-4 py-2.5 text-xs font-bold transition ${
                    activeTab === tab.id
                      ? "bg-white text-violet-600 shadow-sm"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {tabCounts[tab.id] > 0 && (
                    <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                      activeTab === tab.id
                        ? "bg-violet-100 text-violet-600"
                        : "bg-slate-200 text-slate-500"
                    }`}>
                      {tabCounts[tab.id]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab panels */}
            <div className="p-5">
              <AnimatePresence mode="wait">
                {activeTab === "comments" && (
                  <motion.div
                    key="comments"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                  >
                    <CommentsSection taskId={taskId} />
                  </motion.div>
                )}

                {activeTab === "attachments" && (
                  <motion.div
                    key="attachments"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                  >
                    <AttachmentsSection
                      taskId={taskId}
                      attachments={currentTask.attachments || []}
                    />
                  </motion.div>
                )}

                {activeTab === "activity" && (
                  <motion.div
                    key="activity"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                  >
                    <ActivityTimeline taskId={taskId} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── Right Sidebar ──────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Task Attributes */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-100">
              Task Attributes
            </h3>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</label>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="input-field py-2.5 text-xs"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Priority</label>
              <select
                value={priority}
                onChange={(e) => handlePriorityChange(e.target.value)}
                className="input-field py-2.5 text-xs"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            {/* Assignee */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assignee</label>
              {assignedMember && (
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">
                    {assignedMember.name?.charAt(0)}
                  </div>
                  <span className="text-xs font-semibold text-slate-700">{assignedMember.name}</span>
                </div>
              )}
              <select
                value={assignedTo}
                onChange={(e) => {
                  setAssignedTo(e.target.value);
                  handleUpdateField({ assignedTo: e.target.value });
                }}
                className="input-field py-2.5 text-xs"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  handleUpdateField({ dueDate: e.target.value });
                }}
                className={`input-field py-2.5 text-xs ${isOverdue ? "border-red-300 text-red-600" : ""}`}
              />
              {isOverdue && (
                <p className="text-[10px] font-semibold text-red-500">This task is overdue!</p>
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-100 mb-4">
              Summary
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Comments", value: tabCounts.comments, icon: "💬" },
                { label: "Files", value: tabCounts.attachments, icon: "📎" },
                { label: "Activities", value: activity.length, icon: "📋" },
                { label: "Days Left", value: dueDate ? Math.ceil((new Date(dueDate) - new Date()) / 86400000) : "—", icon: "📅" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-lg">{stat.icon}</p>
                  <p className="text-sm font-extrabold text-slate-800">{stat.value}</p>
                  <p className="text-[10px] text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-2xl border border-red-100 bg-red-50/40 p-5 shadow-sm text-center space-y-3">
            <h4 className="text-xs font-bold text-red-700 uppercase tracking-wide">Danger Zone</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Permanently delete this task. This action cannot be undone.
            </p>
            <button
              onClick={handleDeleteTask}
              className="btn-danger w-full py-2.5 text-xs font-semibold justify-center"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Task
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskDetails;
