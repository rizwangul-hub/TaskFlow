import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSingleTask,
  updateTask,
  updateTaskStatus,
  updateTaskPriority,
  deleteTask,
  fetchComments,
  addComment,
  deleteComment,
  uploadAttachment,
  deleteAttachment,
  fetchTaskActivity,
  clearCurrentTask,
} from "../../features/tasks/taskSlice.js";
import Spinner from "../common/Spinner.jsx";
import toast from "react-hot-toast";

const TaskDetailModal = ({ taskId, boardMembers, onClose }) => {
  const dispatch = useDispatch();
  const {
    currentTask,
    comments,
    activity,
    loading,
    commentsLoading,
    attachmentsLoading,
    activityLoading,
  } = useSelector((state) => state.tasks);

  const { user } = useAuth();

  // Tab State
  const [activeTab, setActiveTab] = useState("comments"); // comments, attachments, activity

  // Editing States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [savingDetails, setSavingDetails] = useState(false);

  // Comments & Attachments States
  const [newComment, setNewComment] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);

  useEffect(() => {
    dispatch(fetchSingleTask(taskId));
    dispatch(fetchComments(taskId));
    dispatch(fetchTaskActivity(taskId));
    return () => {
      dispatch(clearCurrentTask());
    };
  }, [dispatch, taskId]);

  // Sync loaded task with local state
  useEffect(() => {
    if (currentTask) {
      setTitle(currentTask.title || "");
      setDescription(currentTask.description || "");
      setPriority(currentTask.priority || "medium");
      setStatus(currentTask.status || "todo");
      setDueDate(currentTask.dueDate ? new Date(currentTask.dueDate).toISOString().split("T")[0] : "");
      setAssignedTo(currentTask.assignedTo?._id || currentTask.assignedTo || "");
    }
  }, [currentTask]);

  if (loading && !currentTask) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <div className="card w-full max-w-lg flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (!currentTask) return null;

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Task title cannot be empty");
      return;
    }
    setSavingDetails(true);
    try {
      const payload = {
        title,
        description,
        status,
        priority,
        assignedTo: assignedTo || null,
        dueDate: dueDate ? new Date(dueDate) : null,
      };

      const result = await dispatch(updateTask({ id: taskId, taskData: payload }));
      if (updateTask.fulfilled.match(result)) {
        toast.success("Task details saved successfully!");
        dispatch(fetchTaskActivity(taskId)); // Refresh activity log
      } else {
        toast.error(result.payload || "Failed to save details");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setSavingDetails(false);
    }
  };

  const handleQuickStatusChange = async (newStatus) => {
    setStatus(newStatus);
    try {
      const result = await dispatch(updateTaskStatus({ id: taskId, status: newStatus }));
      if (updateTaskStatus.fulfilled.match(result)) {
        toast.success(`Moved to ${newStatus.replace("_", " ")}`);
        dispatch(fetchTaskActivity(taskId));
      } else {
        toast.error(result.payload || "Failed to update status");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const handleQuickPriorityChange = async (newPriority) => {
    setPriority(newPriority);
    try {
      const result = await dispatch(updateTaskPriority({ id: taskId, priority: newPriority }));
      if (updateTaskPriority.fulfilled.match(result)) {
        toast.success(`Priority set to ${newPriority}`);
        dispatch(fetchTaskActivity(taskId));
      } else {
        toast.error(result.payload || "Failed to update priority");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this task?")) return;
    try {
      const result = await dispatch(deleteTask(taskId));
      if (deleteTask.fulfilled.match(result)) {
        toast.success("Task deleted successfully");
        onClose();
      } else {
        toast.error(result.payload || "Failed to delete task");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommentSubmitting(true);
    try {
      const result = await dispatch(addComment({ taskId, text: newComment }));
      if (addComment.fulfilled.match(result)) {
        setNewComment("");
        toast.success("Comment added!");
        dispatch(fetchTaskActivity(taskId));
      } else {
        toast.error(result.payload || "Failed to post comment");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Remove this comment?")) return;
    try {
      const result = await dispatch(deleteComment(commentId));
      if (deleteComment.fulfilled.match(result)) {
        toast.success("Comment removed");
        dispatch(fetchTaskActivity(taskId));
      } else {
        toast.error(result.payload || "Failed to delete comment");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const handleUploadAttachment = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await dispatch(uploadAttachment({ taskId, formData }));
      if (uploadAttachment.fulfilled.match(result)) {
        toast.success("Attachment uploaded successfully!");
        dispatch(fetchTaskActivity(taskId));
      } else {
        toast.error(result.payload || "Failed to upload file");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const handleDeleteAttachment = async (fileId) => {
    if (!window.confirm("Delete this attachment?")) return;
    try {
      const result = await dispatch(deleteAttachment({ taskId, fileId }));
      if (deleteAttachment.fulfilled.match(result)) {
        toast.success("Attachment deleted");
        dispatch(fetchTaskActivity(taskId));
      } else {
        toast.error(result.payload || "Failed to delete attachment");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="card relative w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200 bg-white grid grid-cols-1 md:grid-cols-3 gap-6 max-h-[90vh]">
        
        {/* Left 2 Columns: Edit Details Form */}
        <div className="md:col-span-2 overflow-y-auto pr-2 flex flex-col justify-between h-full max-h-[80vh]">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="font-display text-lg font-bold text-slate-800">Task Workspace</h3>
              <button onClick={onClose} className="md:hidden rounded-lg p-1 text-slate-400 hover:bg-slate-50">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveDetails} className="space-y-4">
              <div>
                <label className="label">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  rows={4}
                  placeholder="Task details and instructions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field resize-none text-slate-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Status</label>
                  <select
                    value={status}
                    onChange={(e) => handleQuickStatusChange(e.target.value)}
                    className="input-field"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">In Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div>
                  <label className="label">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => handleQuickPriorityChange(e.target.value)}
                    className="input-field"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="label">Assignee</label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Unassigned</option>
                    {boardMembers.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={handleDeleteTask}
                  className="btn-danger !w-auto py-2.5 px-4 text-xs font-semibold gap-1.5"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Task
                </button>

                <div className="flex gap-2">
                  <button type="button" onClick={onClose} className="btn-secondary !w-auto py-2.5 px-4 text-xs">
                    Cancel
                  </button>
                  <button type="submit" disabled={savingDetails} className="btn-primary !w-auto py-2.5 px-5 text-xs flex items-center gap-1.5">
                    {savingDetails && <Spinner size="sm" color="white" />}
                    Save Details
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Comments, Attachments & History tabs */}
        <div className="border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-6 overflow-y-auto h-full max-h-[80vh] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex border-b border-slate-100 w-full mb-4">
              {[
                { id: "comments", label: `Comments (${comments.length})` },
                { id: "attachments", label: `Files (${currentTask.attachments?.length || 0})` },
                { id: "activity", label: "History" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-3 text-xs font-bold border-b-2 -mb-[2px] transition ${
                    activeTab === tab.id
                      ? "border-brand-600 text-brand-600 font-extrabold"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            <button onClick={onClose} className="hidden md:block rounded-lg p-1 text-slate-400 hover:bg-slate-50 -mt-4">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto min-h-[300px]">
            {/* ─── Comments Panel ─── */}
            {activeTab === "comments" && (
              <div className="space-y-4 h-full flex flex-col justify-between">
                {/* List Comments */}
                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                  {commentsLoading ? (
                    <div className="flex justify-center py-6"><Spinner size="sm" /></div>
                  ) : comments.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-10">No comments yet. Write the first one below!</p>
                  ) : (
                    comments.map((comment) => {
                      const isOwner = comment.author?._id === user?._id || user?.role === "admin";
                      return (
                        <div key={comment._id} className="rounded-xl bg-slate-50 border border-slate-100 p-3 relative group">
                          <div className="flex items-center gap-2 mb-1 justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-800 text-xs">{comment.author?.name}</span>
                              <span className="text-[9px] text-slate-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                            </div>
                            {isOwner && (
                              <button
                                onClick={() => handleDeleteComment(comment._id)}
                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 rounded p-0.5 transition"
                                title="Delete comment"
                              >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed break-words">{comment.text}</p>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Add Comment Input */}
                <form onSubmit={handleAddComment} className="pt-3 border-t border-slate-100 mt-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask a question or share updates..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="input-field py-2 text-xs"
                    />
                    <button
                      type="submit"
                      disabled={commentSubmitting || !newComment.trim()}
                      className="btn-primary !w-auto py-2 px-3 text-xs shrink-0"
                    >
                      Post
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ─── Attachments Panel ─── */}
            {activeTab === "attachments" && (
              <div className="space-y-4">
                {/* Upload File Input */}
                <div>
                  <label className="label text-xs">Upload New Attachment</label>
                  <input
                    type="file"
                    disabled={attachmentsLoading}
                    onChange={handleUploadAttachment}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                  />
                  {attachmentsLoading && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                      <Spinner size="sm" />
                      <span>Uploading file...</span>
                    </div>
                  )}
                </div>

                {/* List Attachments */}
                <div className="space-y-2 mt-4 max-h-[300px] overflow-y-auto pr-1">
                  {(currentTask.attachments || []).length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-10">No attachments uploaded yet.</p>
                  ) : (
                    currentTask.attachments.map((file) => {
                      const isOwner = file.uploadedBy === user?._id || user?.role === "admin";
                      return (
                        <div key={file._id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                          <div className="min-w-0 flex-1">
                            <a
                              href={file.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block truncate text-xs font-bold text-slate-800 hover:text-brand-600 hover:underline"
                            >
                              {file.fileName}
                            </a>
                            <span className="text-[9px] text-slate-400">Uploaded {new Date(file.uploadedAt).toLocaleDateString()}</span>
                          </div>

                          <div className="flex items-center gap-1 pl-2">
                            <a
                              href={file.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                              title="Download File"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                            {isOwner && (
                              <button
                                onClick={() => handleDeleteAttachment(file._id)}
                                className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                title="Delete Attachment"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* ─── Activity Log Panel ─── */}
            {activeTab === "activity" && (
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Status History & Logs</h4>
                
                {activityLoading ? (
                  <div className="flex justify-center py-6"><Spinner size="sm" /></div>
                ) : activity.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-10">No activity logged.</p>
                ) : (
                  <div className="relative border-l border-slate-200 pl-4 ml-2 space-y-5">
                    {activity.map((act, index) => (
                      <div key={act._id || index} className="relative text-xs">
                        {/* Timeline node dot */}
                        <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-brand-500 border border-white" />
                        
                        <div className="flex justify-between">
                          <strong className="font-semibold text-slate-800">{act.user?.name || "System"}</strong>
                          <span className="text-[10px] text-slate-400">{new Date(act.createdAt || act.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-500 mt-0.5 leading-relaxed">{act.action || act.details}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple Hook wrapper because useAuth isn't in scope unless imported
import { useAuth } from "../../hooks/useAuth.js";

export default TaskDetailModal;
