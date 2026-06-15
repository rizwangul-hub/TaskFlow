import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchBoardById, inviteBoardMember, removeBoardMember, clearCurrentBoard } from "../features/boards/boardSlice.js";
import { fetchTasksByBoard, createTask, updateTaskStatus, deleteTask } from "../features/tasks/taskSlice.js";
import { useAuth } from "../hooks/useAuth.js";
import Spinner from "../components/common/Spinner.jsx";
import toast from "react-hot-toast";
import api from "../api/axios.js";
import TaskDetailModal from "../components/tasks/TaskDetailModal.jsx";

const BoardDetails = () => {
  const { boardId } = useParams();
  const dispatch = useDispatch();
  const { user } = useAuth();

  const { currentBoard, members, loading: boardLoading } = useSelector((state) => state.boards);
  const { tasks, loading: tasksLoading } = useSelector((state) => state.tasks);

  // Kanban status columns
  const statuses = [
    { key: "todo", label: "To Do", bg: "bg-slate-100/70", dot: "bg-slate-400" },
    { key: "in_progress", label: "In Progress", bg: "bg-blue-50/50", dot: "bg-blue-500" },
    { key: "review", label: "In Review", bg: "bg-purple-50/50", dot: "bg-purple-500" },
    { key: "done", label: "Done", bg: "bg-emerald-50/50", dot: "bg-emerald-500" },
  ];

  // UI States
  const [membersDrawerOpen, setMembersDrawerOpen] = useState(false);
  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [addTaskStatus, setAddTaskStatus] = useState("todo");
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  // Add Task Form States
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState("medium");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskAssignedTo, setTaskAssignedTo] = useState("");
  const [submittingTask, setSubmittingTask] = useState(false);

  // Member Search State
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);

  useEffect(() => {
    dispatch(fetchBoardById(boardId));
    dispatch(fetchTasksByBoard({ boardId }));
    return () => {
      dispatch(clearCurrentBoard());
    };
  }, [dispatch, boardId]);

  // Handle user search for invitations
  useEffect(() => {
    const searchUsers = async () => {
      if (memberSearchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      setSearchingUsers(true);
      try {
        const { data } = await api.get(`/v1/users?search=${memberSearchQuery}`);
        // Filter out users who are already members
        const filtered = (data.users || []).filter(
          (u) => !members.some((m) => m._id === u._id)
        );
        setSearchResults(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setSearchingUsers(false);
      }
    };

    const timer = setTimeout(searchUsers, 300);
    return () => clearTimeout(timer);
  }, [memberSearchQuery, members]);

  if (boardLoading && !currentBoard) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!currentBoard) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h3 className="text-lg font-bold text-slate-800">Board not found</h3>
        <p className="text-slate-400 mt-2">You may not have permissions to view this board or it was deleted.</p>
        <Link to="/boards" className="btn-primary mt-6 !w-auto">
          Back to Boards
        </Link>
      </div>
    );
  }

  const isOwner = currentBoard.createdBy?._id === user?._id || user?.role === "admin";
  const isManagerOrAdmin = user?.role === "admin" || user?.role === "project_manager";

  // Filter Tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter ? t.priority === priorityFilter : true;
    return matchesSearch && matchesPriority;
  });

  const handleOpenAddTask = (status) => {
    setAddTaskStatus(status);
    setTaskTitle("");
    setTaskDescription("");
    setTaskPriority("medium");
    setTaskDueDate("");
    setTaskAssignedTo("");
    setAddTaskModalOpen(true);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      toast.error("Task title is required");
      return;
    }
    setSubmittingTask(true);
    try {
      const payload = {
        title: taskTitle,
        description: taskDescription,
        status: addTaskStatus,
        priority: taskPriority,
        boardId,
      };
      if (taskDueDate) payload.dueDate = taskDueDate;
      if (taskAssignedTo) payload.assignedTo = taskAssignedTo;

      const result = await dispatch(createTask(payload));
      if (createTask.fulfilled.match(result)) {
        toast.success("Task created!");
        setAddTaskModalOpen(false);
      } else {
        toast.error(result.payload || "Failed to create task");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setSubmittingTask(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const result = await dispatch(updateTaskStatus({ id: taskId, status: newStatus }));
      if (updateTaskStatus.fulfilled.match(result)) {
        toast.success(`Moved to ${newStatus.replace("_", " ")}`);
      } else {
        toast.error(result.payload || "Failed to move task");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const handleInviteUser = async (targetUserId) => {
    try {
      const result = await dispatch(inviteBoardMember({ boardId, userId: targetUserId }));
      if (inviteBoardMember.fulfilled.match(result)) {
        toast.success("Member added to board!");
        setMemberSearchQuery("");
        setSearchResults([]);
      } else {
        toast.error(result.payload || "Failed to add member");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const handleRemoveUser = async (targetUserId) => {
    if (!window.confirm("Remove this member from the board?")) return;
    try {
      const result = await dispatch(removeBoardMember({ boardId, userId: targetUserId }));
      if (removeBoardMember.fulfilled.match(result)) {
        toast.success("Member removed");
      } else {
        toast.error(result.payload || "Failed to remove member");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case "critical":
        return "badge-red";
      case "high":
        return "badge-yellow";
      case "medium":
        return "badge-blue";
      default:
        return "badge-gray";
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Board Header ─── */}
      <div className="flex flex-col gap-4 border-b border-slate-200/60 pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-display text-xl font-extrabold text-slate-800 md:text-2xl">{currentBoard.title}</h2>
            {currentBoard.image?.url && (
              <img src={currentBoard.image.url} className="h-8 w-8 rounded-lg object-cover border" alt="" />
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500 max-w-xl">{currentBoard.description || "Manage columns and drag cards to configure progress."}</p>
        </div>

        {/* Board actions */}
        <div className="flex items-center gap-3">
          {/* Members Button with mini avatar list */}
          <button
            onClick={() => setMembersDrawerOpen(true)}
            className="btn-secondary !w-auto flex items-center gap-2 py-2.5 px-4"
          >
            <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="font-semibold text-slate-700">Members ({members.length})</span>
          </button>
        </div>
      </div>

      {/* ─── Filters & Search Toolbar ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search tasks by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 shrink-0">Priority:</label>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-500"
          >
            <option value="">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* ─── Kanban Grid ─── */}
      {tasksLoading && tasks.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 items-start overflow-x-auto pb-4">
          {statuses.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.key);

            return (
              <div key={col.key} className="flex flex-col rounded-2xl bg-slate-50 border border-slate-100 p-4 min-h-[500px]">
                {/* Column Title */}
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/50">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} />
                    <h3 className="font-display text-sm font-bold text-slate-800">{col.label}</h3>
                    <span className="rounded-md bg-slate-200/60 px-1.5 py-0.5 text-xs font-bold text-slate-600">
                      {colTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => handleOpenAddTask(col.key)}
                    className="rounded-lg p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                    title="Add task to column"
                  >
                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                {/* Tasks List */}
                <div className="flex-1 space-y-3">
                  {colTasks.map((task) => {
                    const isTaskOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";

                    return (
                      <div
                        key={task._id}
                        onClick={() => setSelectedTaskId(task._id)}
                        className="group flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className={`badge ${getPriorityBadgeClass(task.priority)} uppercase text-[9px] tracking-wide`}>
                            {task.priority}
                          </span>

                          {/* Quick Move Status Selector */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={task.status}
                              onChange={(e) => handleStatusChange(task._id, e.target.value)}
                              className="rounded bg-slate-100 px-1 py-0.5 text-[10px] font-semibold text-slate-600 border-0 hover:bg-slate-200 cursor-pointer"
                            >
                              <option value="todo">To Do</option>
                              <option value="in_progress">In Progress</option>
                              <option value="review">Review</option>
                              <option value="done">Done</option>
                            </select>
                          </div>
                        </div>

                        <h4 className="mt-2 text-sm font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-brand-600 transition">
                          {task.title}
                        </h4>

                        {task.description && (
                          <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        {/* Card Footer */}
                        <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3 text-[10px] text-slate-400">
                          {/* Left: Due Date */}
                          <div className="flex items-center gap-1">
                            {task.dueDate ? (
                              <span className={`inline-flex items-center gap-1 font-semibold ${isTaskOverdue ? "text-red-500" : "text-slate-400"}`}>
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            ) : (
                              <span>No due date</span>
                            )}
                          </div>

                          {/* Right: Comments, Attachments & Assignee */}
                          <div className="flex items-center gap-2">
                            {/* Comments Count */}
                            {(task.commentsCount > 0 || (task.comments && task.comments.length > 0)) && (
                              <span className="flex items-center gap-0.5" title="Comments">
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                {task.commentsCount || task.comments.length}
                              </span>
                            )}

                            {/* Attachments Count */}
                            {task.attachments && task.attachments.length > 0 && (
                              <span className="flex items-center gap-0.5" title="Attachments">
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                                {task.attachments.length}
                              </span>
                            )}

                            {/* Assignee Avatar */}
                            {task.assignedTo && (
                              <div className="h-5 w-5 overflow-hidden rounded-full border border-slate-100 bg-brand-100 flex items-center justify-center text-[9px] font-bold text-brand-700">
                                {task.assignedTo.avatar?.url ? (
                                  <img src={task.assignedTo.avatar.url} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <span>{task.assignedTo.name?.charAt(0).toUpperCase()}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {colTasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl p-6 text-center text-xs text-slate-400">
                      Empty column
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Members Drawer (Sidebar Overlay) ─── */}
      {membersDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMembersDrawerOpen(false)} />
          <div className="relative w-full max-w-md bg-white p-6 shadow-2xl animate-in slide-in-from-right duration-250 flex flex-col h-full">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-display text-lg font-bold text-slate-800">Board Members</h3>
              <button onClick={() => setMembersDrawerOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Invite New Users (PM/Admin only) */}
            {isManagerOrAdmin && (
              <div className="mt-6 border-b border-slate-100 pb-6">
                <h4 className="text-sm font-semibold text-slate-800">Add Team Member</h4>
                <div className="mt-3 relative">
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    className="input-field"
                  />
                  {searchingUsers && (
                    <span className="absolute right-3 top-3.5">
                      <Spinner size="sm" />
                    </span>
                  )}

                  {/* Auto-suggest dropdown */}
                  {searchResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                      <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Search Results</p>
                      <ul className="mt-1 divide-y divide-slate-50 max-h-48 overflow-y-auto">
                        {searchResults.map((searchUser) => (
                          <li
                            key={searchUser._id}
                            onClick={() => handleInviteUser(searchUser._id)}
                            className="flex items-center justify-between px-2 py-2 hover:bg-slate-50 rounded-lg cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-brand-50 flex items-center justify-center text-xs font-semibold text-brand-700">
                                {searchUser.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="text-xs">
                                <p className="font-bold text-slate-800">{searchUser.name}</p>
                                <p className="text-slate-400">{searchUser.email}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-semibold text-brand-600 hover:underline">Add</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Active Members List */}
            <div className="mt-6 flex-1 overflow-y-auto">
              <h4 className="text-sm font-semibold text-slate-800">Active Board Members</h4>
              <ul className="mt-3 divide-y divide-slate-100">
                {members.map((m) => {
                  const isUserCreator = currentBoard.createdBy?._id === m._id;
                  const isCurrentUser = m._id === user?._id;

                  return (
                    <li key={m._id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-700">
                          {m.avatar?.url ? (
                            <img src={m.avatar.url} alt="" className="h-full w-full object-cover rounded-full" />
                          ) : (
                            m.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {m.name} {isCurrentUser && <span className="text-xs font-normal text-slate-400">(you)</span>}
                          </p>
                          <p className="text-xs text-slate-400">{m.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isUserCreator ? (
                          <span className="rounded bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 text-[9px] font-bold text-indigo-700">
                            Creator
                          </span>
                        ) : (
                          <span className="rounded bg-slate-50 border border-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500">
                            {m.role === "project_manager" ? "PM" : "Member"}
                          </span>
                        )}

                        {/* Remove Member option (PM/Admin owner only, cannot remove creator) */}
                        {isManagerOrAdmin && !isUserCreator && (
                          <button
                            onClick={() => handleRemoveUser(m._id)}
                            className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            title="Remove from board"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ─── Add Task Modal ─── */}
      {addTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setAddTaskModalOpen(false)} />
          <div className="card relative w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <h3 className="font-display text-lg font-bold text-slate-800">Add Task to {addTaskStatus.replace("_", " ")}</h3>
              <button onClick={() => setAddTaskModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-700">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="label">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement Oauth"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Summarize details or checklist"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="input-field resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="input-field"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="label">Due Date</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="label">Assign Member (Optional)</label>
                <select
                  value={taskAssignedTo}
                  onChange={(e) => setTaskAssignedTo(e.target.value)}
                  className="input-field"
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setAddTaskModalOpen(false)} className="btn-secondary !w-auto py-2 px-4">
                  Cancel
                </button>
                <button type="submit" disabled={submittingTask} className="btn-primary !w-auto py-2 px-5 flex items-center gap-2">
                  {submittingTask && <Spinner size="sm" color="white" />}
                  {submittingTask ? "Adding..." : "Add Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Task Details Modal Component ─── */}
      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          boardMembers={members}
          onClose={() => {
            setSelectedTaskId(null);
            // Refresh tasks list to sync changes
            dispatch(fetchTasksByBoard({ boardId }));
          }}
        />
      )}
    </div>
  );
};

export default BoardDetails;
