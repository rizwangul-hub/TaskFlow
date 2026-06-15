import api from "../../api/axios.js";

// Tasks
const getTasksByBoard = async (boardId, priority = "") => {
  const url = priority ? `/tasks/${boardId}?priority=${priority}` : `/tasks/${boardId}`;
  const response = await api.get(url);
  return response.data;
};

const getSingleTask = async (id) => {
  const response = await api.get(`/task/${id}`);
  return response.data;
};

const createTask = async (taskData) => {
  const response = await api.post("/tasks", taskData);
  return response.data;
};

const updateTask = async (id, taskData) => {
  const response = await api.put(`/task/${id}`, taskData);
  return response.data;
};

const updateTaskStatus = async (id, status) => {
  const response = await api.patch(`/tasks/${id}/status`, { status });
  return response.data;
};

const updateTaskPriority = async (id, priority) => {
  const response = await api.patch(`/tasks/${id}/priority`, { priority });
  return response.data;
};

const deleteTask = async (id) => {
  const response = await api.delete(`/task/${id}`);
  return response.data;
};

const getOverdueTasks = async () => {
  const response = await api.get("/tasks/overdue");
  return response.data;
};

// Comments
const getComments = async (taskId) => {
  const response = await api.get(`/tasks/${taskId}/comments`);
  return response.data;
};

const addComment = async (taskId, text) => {
  const response = await api.post(`/tasks/${taskId}/comments`, { text });
  return response.data;
};

const editComment = async (commentId, text) => {
  const response = await api.put(`/comments/${commentId}`, { text });
  return response.data;
};

const deleteComment = async (commentId) => {
  const response = await api.delete(`/comments/${commentId}`);
  return response.data;
};

// Attachments
const uploadAttachment = async (taskId, formData) => {
  const response = await api.post(`/tasks/${taskId}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

const deleteAttachment = async (taskId, fileId) => {
  const response = await api.delete(`/tasks/${taskId}/file/${fileId}`);
  return response.data;
};

// Activity log
const getTaskActivity = async (taskId) => {
  const response = await api.get(`/tasks/${taskId}/activity`);
  return response.data;
};

// Analytics
const getDashboardAnalytics = async () => {
  const response = await api.get("/analytics/dashboard");
  return response.data;
};

const taskService = {
  getTasksByBoard,
  getSingleTask,
  createTask,
  updateTask,
  updateTaskStatus,
  updateTaskPriority,
  deleteTask,
  getOverdueTasks,
  getComments,
  addComment,
  editComment,
  deleteComment,
  uploadAttachment,
  deleteAttachment,
  getTaskActivity,
  getDashboardAnalytics,
};

export default taskService;
