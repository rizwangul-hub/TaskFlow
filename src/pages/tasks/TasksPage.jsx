import { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchBoardById, fetchBoardMembers } from "../../features/boards/boardSlice.js";
import { fetchTasksByBoard, deleteTask } from "../../features/tasks/taskSlice.js";
import { useAuth } from "../../hooks/useAuth.js";
import BoardHeader from "../../components/boards/BoardHeader.jsx";
import CreateTaskModal from "../../components/tasks/CreateTaskModal.jsx";
import EditTaskModal from "../../components/tasks/EditTaskModal.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import SearchBar from "../../components/filters/SearchBar.jsx";
import TaskFilters from "../../components/filters/TaskFilters.jsx";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const TasksPage = () => {
  const { boardId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const { currentBoard, members } = useSelector((state) => state.boards);
  const { tasks, loading } = useSelector((state) => state.tasks);

  // Layout & View States
  const [isListView, setIsListView] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // URL-driven filter params
  const searchQuery = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "";
  const priorityFilter = searchParams.get("priority") || "";
  const assignedTo = searchParams.get("assignedTo") || "";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const order = searchParams.get("order") || "desc";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const tasksPerPage = 10;

  useEffect(() => {
    dispatch(fetchBoardById(boardId));
    dispatch(fetchBoardMembers(boardId));
    dispatch(fetchTasksByBoard({ boardId }));
  }, [dispatch, boardId]);

  const handleOpenEditTask = (task) => {
    setTaskToEdit(task);
    setEditModalOpen(true);
  };

  const handleDeleteTask = async (taskId, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete task: "${title}"?`)) {
      return;
    }

    try {
      const result = await dispatch(deleteTask(taskId));
      if (deleteTask.fulfilled.match(result)) {
        toast.success("Task deleted successfully");
      } else {
        toast.error(result.payload || "Failed to delete task");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  // Filter Tasks (client-side using URL params)
  const filteredTasks = tasks
    .filter((t) => {
      const matchesSearch =
        !searchQuery ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter ? t.status === statusFilter : true;
      const matchesPriority = priorityFilter ? t.priority === priorityFilter : true;
      const matchesAssignee = assignedTo
        ? t.assignedTo?._id === assignedTo || t.assignedTo === assignedTo
        : true;
      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
    })
    .sort((a, b) => {
      let aVal, bVal;
      if (sortBy === "priority") {
        const order2 = { critical: 4, high: 3, medium: 2, low: 1 };
        aVal = order2[a.priority] || 0;
        bVal = order2[b.priority] || 0;
      } else if (sortBy === "dueDate") {
        aVal = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        bVal = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      } else {
        aVal = new Date(a.createdAt).getTime();
        bVal = new Date(b.createdAt).getTime();
      }
      return order === "asc" ? aVal - bVal : bVal - aVal;
    });

  // Paginated Tasks
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

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

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "done":
        return "badge-green";
      case "review":
        return "badge-purple";
      case "in_progress":
        return "badge-blue";
      default:
        return "badge-gray";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "todo":
        return "To Do";
      case "in_progress":
        return "In Progress";
      case "review":
        return "Review";
      case "done":
        return "Done";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <BoardHeader />

      {/* Toolbar */}
      <div className="flex flex-col gap-3">
        {/* Search Row */}
        <div className="flex items-center gap-3">
          <SearchBar
            placeholder="Search tasks by title or description..."
            className="flex-1 max-w-lg"
          />
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
              showFilters
                ? "border-brand-300 bg-brand-50 text-brand-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            {(statusFilter || priorityFilter || assignedTo) && (
              <span className="ml-0.5 rounded-full bg-brand-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {[statusFilter, priorityFilter, assignedTo].filter(Boolean).length}
              </span>
            )}
          </button>

          {/* Grid/List Toggle */}
          <div className="flex rounded-xl border border-slate-200 bg-slate-50/50 p-1 shrink-0">
            <button
              onClick={() => setIsListView(true)}
              className={`rounded-lg p-1.5 transition ${
                isListView
                  ? "bg-white text-brand-600 shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
              title="List View"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setIsListView(false)}
              className={`rounded-lg p-1.5 transition ${
                !isListView
                  ? "bg-white text-brand-600 shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
              title="Grid View"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
            </button>
          </div>

          {/* Add Task Button */}
          <button
            onClick={() => setCreateModalOpen(true)}
            className="btn-primary !w-auto gap-2 px-4 py-2 text-xs font-bold shrink-0"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Task
          </button>
        </div>

        {/* Expandable Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <TaskFilters members={members} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Task Content */}
      {loading && tasks.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-white border border-slate-100 rounded-2xl py-16 text-center shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="mt-4 text-sm font-bold text-slate-800">No tasks found</h3>
          <p className="mt-1 text-xs text-slate-400 max-w-xs leading-relaxed">
            Create a task using the "Add Task" button or adjust your search filters to find what you're looking for.
          </p>
        </div>
      ) : isListView ? (
        /* List View */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="overflow-x-auto bg-white border border-slate-150 rounded-2xl shadow-sm"
        >
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="py-4 px-6">Task Title</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Priority</th>
                <th className="py-4 px-6">Due Date</th>
                <th className="py-4 px-6">Assignee</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {currentTasks.map((task) => {
                const isOverdue =
                  task.dueDate &&
                  new Date(task.dueDate) < new Date() &&
                  task.status !== "done";

                return (
                  <tr
                    key={task._id}
                    onClick={() => navigate(`/boards/${boardId}/tasks/${task._id}`)}
                    className="hover:bg-slate-50/50 transition cursor-pointer group"
                  >
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-800 group-hover:text-brand-600 transition truncate max-w-[240px]">
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="text-xs text-slate-400 truncate max-w-[280px]">
                          {task.description}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`badge ${getStatusBadgeClass(task.status)} text-[10px] uppercase font-bold tracking-wide`}>
                        {getStatusLabel(task.status)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`badge ${getPriorityBadgeClass(task.priority)} text-[10px] uppercase font-bold tracking-wide`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs font-semibold">
                      {task.dueDate ? (
                        <span className={isOverdue ? "text-red-500" : "text-slate-500"}>
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">No due date</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {task.assignedTo ? (
                        <div className="flex items-center gap-2">
                          {task.assignedTo.avatar?.url ? (
                            <img
                              src={task.assignedTo.avatar.url}
                              alt=""
                              className="h-6 w-6 rounded-full object-cover border"
                            />
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-brand-50 flex items-center justify-center text-[10px] font-bold text-brand-700">
                              {(task.assignedTo.name || task.assignedTo)
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          )}
                          <span className="text-xs text-slate-600">
                            {task.assignedTo.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Unassigned</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditTask(task)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                          title="Edit Task"
                        >
                          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task._id, task.title)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                          title="Delete Task"
                        >
                          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      ) : (
        /* Grid View */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {currentTasks.map((task) => {
            const isOverdue =
              task.dueDate &&
              new Date(task.dueDate) < new Date() &&
              task.status !== "done";

            return (
              <div
                key={task._id}
                onClick={() => navigate(`/boards/${boardId}/tasks/${task._id}`)}
                className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition cursor-pointer"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className={`badge ${getStatusBadgeClass(task.status)} text-[9px] uppercase font-bold tracking-wide`}>
                    {getStatusLabel(task.status)}
                  </span>
                  <span className={`badge ${getPriorityBadgeClass(task.priority)} text-[9px] uppercase font-bold tracking-wide`}>
                    {task.priority}
                  </span>
                </div>

                {/* Title */}
                <h4 className="mt-4 text-sm font-bold text-slate-800 group-hover:text-brand-600 transition line-clamp-2">
                  {task.title}
                </h4>

                {/* Description */}
                {task.description && (
                  <p className="mt-2 text-xs text-slate-400 line-clamp-2 flex-1 leading-relaxed">
                    {task.description}
                  </p>
                )}

                {/* Footer info */}
                <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
                  {/* Due Date */}
                  <div className="text-[10px] font-semibold flex items-center gap-1">
                    {task.dueDate ? (
                      <span className={isOverdue ? "text-red-500 font-bold" : "text-slate-400"}>
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-slate-300 font-normal">No due date</span>
                    )}
                  </div>

                  {/* Assignee & Actions */}
                  <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    {task.assignedTo && (
                      <div className="h-6 w-6 overflow-hidden rounded-full border border-slate-100 bg-brand-50 flex items-center justify-center text-[10px] font-bold text-brand-700">
                        {task.assignedTo.avatar?.url ? (
                          <img
                            src={task.assignedTo.avatar.url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span>
                            {(task.assignedTo.name || task.assignedTo)
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center border-l border-slate-100 pl-2">
                      <button
                        onClick={() => handleOpenEditTask(task)}
                        className="rounded p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task._id, task.title)}
                        className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="btn-secondary !py-2 !px-3 disabled:opacity-30 disabled:pointer-events-none"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold border ${
                currentPage === page
                  ? "bg-brand-600 border-brand-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="btn-secondary !py-2 !px-3 disabled:opacity-30 disabled:pointer-events-none"
          >
            Next
          </button>
        </div>
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        boardId={boardId}
        boardMembers={members}
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      {/* Edit Task Modal */}
      <EditTaskModal
        task={taskToEdit}
        boardMembers={members}
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setTaskToEdit(null);
        }}
      />
    </div>
  );
};

export default TasksPage;
