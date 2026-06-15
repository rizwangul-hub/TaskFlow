import api from "../../api/axios.js";

const getTaskActivity = async (taskId) => {
  const response = await api.get(`/tasks/${taskId}/activity`);
  return response.data;
};

const activityService = {
  getTaskActivity,
};

export default activityService;
