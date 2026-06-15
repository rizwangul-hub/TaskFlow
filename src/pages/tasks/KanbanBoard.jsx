import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { fetchBoardById, fetchBoardMembers } from "../../features/boards/boardSlice.js";
import { fetchTasksByBoard, updateTaskStatus, deleteTask } from "../../features/tasks/taskSlice.js";
import { useAuth } from "../../hooks/useAuth.js";
import BoardHeader from "../../components/boards/BoardHeader.jsx";
import CreateTaskModal from "../../components/tasks/CreateTaskModal.jsx";
import EditTaskModal from "../../components/tasks/EditTaskModal.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const KanbanBoard = () => {
  const { boardId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { currentBoard, members, loading: boardLoading } = useSelector((state) => state.boards);
  const { tasks, loading: tasksLoading } = useSelector((state) => state.tasks);

  // Local state for tasks (for optimistic drag-and-drop updates)
  const [localTasks, setLocalTasks] = useState([]);

  // Modal & Edit States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] = useState("todo");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  // Search & Priority Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const columns = [
    { id: "todo", label: "To Do", dot: "bg-slate-400" },
    { id: "in_progress", label: "In Progress", dot: "bg-blue-500" },
    { id: "review", label: "Review", dot: "bg-purple-500" },
    { id: "done", label: "Done", dot: "bg-emerald-500" },
  ];

  useEffect(() => {
    dispatch(fetchBoardById(boardId));
    dispatch(fetchBoardMembers(boardId));
    dispatch(fetchTasksByBoard({ boardId }));
  }, [dispatch, boardId]);

  // Sync Redux tasks with local state
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const isManagerOrAdmin = user?.role === "admin" || user?.role === "project_manager";

  // Filter local tasks
  const filteredTasks = localTasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter ? t.priority === priorityFilter : true;
    return matchesSearch && matchesPriority;
  });

  // Handle Drag End
  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    // No destination or dropped in the same place
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Save previous state in case we need to roll back
    const previousTasks = [...localTasks];

    // Optimistically update the status locally
    const updatedTasks = localTasks.map((t) =>
      t._id === draggableId ? { ...t, status: destination.droppableId } : t
    );
    setLocalTasks(updatedTasks);

    // Call API
    try {
      const response = await dispatch(
        updateTaskStatus({ id: draggableId, status: destination.droppableId })
      );
      if (updateTaskStatus.fulfilled.match(response)) {
        toast.success(`Task moved to ${destination.droppableId.replace("_", " ")}`);
      } else {
        // Rollback
        setLocalTasks(previousTasks);
        toast.error(response.payload || "Failed to update task status");
      }
    } catch (err) {
      // Rollback
      setLocalTasks(previousTasks);
      toast.error("An error occurred while moving the task");
    }
  };

  const handleOpenCreateTask = (status) => {
    setCreateDefaultStatus(status);
    setCreateModalOpen(true);
  };

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

  if (boardLoading && !currentBoard) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BoardHeader />

      {/* Toolbar */}
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
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 shrink-0">
            Priority:
          </label>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/10"
          >
            <option value="">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* DragDropContext */}
      {tasksLoading && localTasks.length === 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {columns.map((col) => (
            <div key={col.id} className="flex flex-col rounded-2xl bg-slate-50 border border-slate-100 p-4 min-h-[400px] animate-pulse">
              <div className="h-6 w-24 bg-slate-200 rounded-md mb-4" />
              <div className="space-y-3">
                <div className="h-28 bg-white rounded-xl border border-slate-200" />
                <div className="h-28 bg-white rounded-xl border border-slate-200" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 items-start overflow-x-auto pb-4">
            {columns.map((col) => {
              const colTasks = filteredTasks.filter((t) => t.status === col.id);

              return (
                <div
                  key={col.id}
                  className="flex flex-col rounded-2xl bg-slate-50 border border-slate-100 p-4 min-h-[500px]"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/50">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} />
                      <h3 className="font-display text-sm font-bold text-slate-800">
                        {col.label}
                      </h3>
                      <span className="rounded-md bg-slate-200/60 px-1.5 py-0.5 text-xs font-bold text-slate-600">
                        {colTasks.length}
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenCreateTask(col.id)}
                      className="rounded-lg p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition"
                      title="Add task to column"
                    >
                      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  {/* Droppable Columns */}
                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 space-y-3 transition-colors rounded-xl p-1 ${
                          snapshot.isDraggingOver ? "bg-slate-100/50" : ""
                        }`}
                      >
                        {colTasks.map((task, index) => {
                          const isTaskOverdue =
                            task.dueDate &&
                            new Date(task.dueDate) < new Date() &&
                            task.status !== "done";

                          return (
                            <Draggable
                              key={task._id}
                              draggableId={task._id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() =>
                                    navigate(`/boards/${boardId}/tasks/${task._id}`)
                                  }
                                  style={{
                                    ...provided.draggableProps.style,
                                  }}
                                  className={`group flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 cursor-pointer ${
                                    snapshot.isDragging
                                      ? "shadow-xl ring-2 ring-brand-500/20 rotate-1"
                                      : "hover:shadow-md hover:border-slate-300"
                                  }`}
                                >
                                  {/* Task Card Header */}
                                  <div className="flex items-start justify-between gap-2">
                                    <span
                                      className={`badge ${getPriorityBadgeClass(
                                        task.priority
                                      )} uppercase text-[9px] tracking-wide font-extrabold`}
                                    >
                                      {task.priority}
                                    </span>

                                    {/* Action Buttons */}
                                    <div
                                      className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <button
                                        onClick={() => handleOpenEditTask(task)}
                                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                                        title="Edit Task"
                                      >
                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeleteTask(task._id, task.title)
                                        }
                                        className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                                        title="Delete Task"
                                      >
                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>

                                  {/* Task Title */}
                                  <h4 className="mt-2 text-sm font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-brand-600 transition">
                                    {task.title}
                                  </h4>

                                  {/* Description Snippet */}
                                  {task.description && (
                                    <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                      {task.description}
                                    </p>
                                  )}

                                  {/* Task Card Footer */}
                                  <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3 text-[10px] text-slate-400">
                                    {/* Left: Due Date */}
                                    <div className="flex items-center gap-1 font-semibold">
                                      {task.dueDate ? (
                                        <span
                                          className={`inline-flex items-center gap-1 ${
                                            isTaskOverdue
                                              ? "text-red-500 font-bold"
                                              : "text-slate-400"
                                          }`}
                                        >
                                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                          </svg>
                                          {new Date(
                                            task.dueDate
                                          ).toLocaleDateString(undefined, {
                                            month: "short",
                                            day: "numeric",
                                          })}
                                        </span>
                                      ) : (
                                        <span>No due date</span>
                                      )}
                                    </div>

                                    {/* Right: Comments, Files & Avatars */}
                                    <div className="flex items-center gap-2">
                                      {/* Comments */}
                                      {(task.commentsCount > 0 ||
                                        (task.comments &&
                                          task.comments.length > 0)) && (
                                        <span className="flex items-center gap-0.5">
                                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                          </svg>
                                          {task.commentsCount ||
                                            task.comments.length}
                                        </span>
                                      )}

                                      {/* Files */}
                                      {task.attachments &&
                                        task.attachments.length > 0 && (
                                          <span className="flex items-center gap-0.5">
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
                                            <img
                                              src={task.assignedTo.avatar.url}
                                              alt=""
                                              className="h-full w-full object-cover"
                                            />
                                          ) : (
                                            <span>
                                              {(
                                                task.assignedTo.name ||
                                                task.assignedTo
                                              )
                                                .charAt(0)
                                                .toUpperCase()}
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}

                        {colTasks.length === 0 && (
                          <div className="flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400 select-none bg-slate-50/50">
                            No tasks
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        boardId={boardId}
        boardMembers={members}
        defaultStatus={createDefaultStatus}
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

export default KanbanBoard;
