import api from "../../api/axios.js";

const registerUser = async (userData) => {
  const { data } = await api.post("/auth/register", userData);
  return data;
};

const loginUser = async (credentials) => {
  const { data } = await api.post("/auth/login", credentials);
  return data;
};

const logoutUser = async () => {
  const { data } = await api.post("/auth/logout");
  return data;
};

const getCurrentUser = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};

const forgotPassword = async (email) => {
  const { data } = await api.post("/auth/forgot-password", { email });
  return data;
};

const resetPassword = async ({ token, password }) => {
  const { data } = await api.post("/auth/reset-password", { token, password });
  return data;
};

const updateProfile = async (profileData) => {
  const { data } = await api.put("/v1/users/profile", profileData);
  return data;
};

const updateAvatar = async (avatarFormData) => {
  const { data } = await api.put("/v1/users/avatar", avatarFormData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

const authService = {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  updateProfile,
  updateAvatar,
};

export default authService;

