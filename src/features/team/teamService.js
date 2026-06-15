import api from "../../api/axios.js";

const getBoardMembers = async (boardId) => {
  const response = await api.get(`/v1/boards/${boardId}/members`);
  return response.data;
};

const inviteMember = async (boardId, userId) => {
  const response = await api.post(`/v1/boards/${boardId}/invite`, { userId });
  return response.data;
};

const removeMember = async (boardId, userId) => {
  const response = await api.delete(`/v1/boards/${boardId}/remove-user`, {
    data: { userId },
  });
  return response.data;
};

const teamService = {
  getBoardMembers,
  inviteMember,
  removeMember,
};

export default teamService;
