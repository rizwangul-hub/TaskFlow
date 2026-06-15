import api from "../../api/axios.js";

// POST /api/tasks/:id/upload  (multipart/form-data)
const uploadFiles = async (taskId, formData, onUploadProgress) => {
  const response = await api.post(`/tasks/${taskId}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });
  return response.data;
};

// DELETE /api/tasks/:id/file/:fileId
const deleteFile = async (taskId, fileId) => {
  const response = await api.delete(`/tasks/${taskId}/file/${fileId}`);
  return response.data;
};

const attachmentService = {
  uploadFiles,
  deleteFile,
};

export default attachmentService;
