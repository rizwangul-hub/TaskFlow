import api from "../../api/axios.js";

// GET /api/tasks/:id/comments
const getComments = async (taskId, page = 1, limit = 10) => {
  const response = await api.get(`/tasks/${taskId}/comments`, {
    params: { page, limit },
  });
  return response.data;
};

// POST /api/tasks/:id/comments
const createComment = async (taskId, text) => {
  const response = await api.post(`/tasks/${taskId}/comments`, { text });
  return response.data;
};

// PUT /api/comments/:id
const updateComment = async (commentId, text) => {
  const response = await api.put(`/comments/${commentId}`, { text });
  return response.data;
};

// DELETE /api/comments/:id
const deleteComment = async (commentId) => {
  const response = await api.delete(`/comments/${commentId}`);
  return response.data;
};

const commentService = {
  getComments,
  createComment,
  updateComment,
  deleteComment,
};

export default commentService;
