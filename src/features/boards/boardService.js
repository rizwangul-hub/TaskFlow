import api from "../../api/axios.js";

const getBoards = async (page = 1, limit = 10) => {
  const response = await api.get(`/v1/boards?page=${page}&limit=${limit}`);
  return response.data;
};

const getBoardById = async (id) => {
  const response = await api.get(`/v1/boards/${id}`);
  return response.data;
};

const createBoard = async (formData) => {
  const response = await api.post("/v1/boards", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

const updateBoard = async (id, formData) => {
  const response = await api.put(`/v1/boards/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

const deleteBoard = async (id) => {
  const response = await api.delete(`/v1/boards/${id}`);
  return response.data;
};

const inviteUser = async (boardId, userId) => {
  const response = await api.post(`/v1/boards/${boardId}/invite`, { userId });
  return response.data;
};

const removeUser = async (boardId, userId) => {
  const response = await api.delete(`/v1/boards/${boardId}/remove-user`, {
    data: { userId },
  });
  return response.data;
};

const getBoardMembers = async (boardId) => {
  const response = await api.get(`/v1/boards/${boardId}/members`);
  return response.data;
};

const boardService = {
  getBoards,
  getBoardById,
  createBoard,
  updateBoard,
  deleteBoard,
  inviteUser,
  removeUser,
  getBoardMembers,
};

export default boardService;
