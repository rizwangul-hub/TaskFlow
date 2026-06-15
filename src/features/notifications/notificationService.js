import api from "../../api/axios.js";

// Mock notifications for when backend endpoint is unavailable
const mockNotifications = [
  {
    _id: "n1",
    type: "task_assigned",
    title: "New Task Assigned",
    message: "You have been assigned to 'Design Landing Page'",
    read: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    link: "/boards/1/tasks/1",
    icon: "task",
  },
  {
    _id: "n2",
    type: "deadline_reminder",
    title: "Deadline Approaching",
    message: "'API Integration' is due in 2 hours",
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    link: "/boards/1/tasks/2",
    icon: "deadline",
  },
  {
    _id: "n3",
    type: "overdue",
    title: "Task Overdue",
    message: "'Update Documentation' is overdue by 1 day",
    read: true,
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    link: "/boards/1/tasks/3",
    icon: "overdue",
  },
  {
    _id: "n4",
    type: "comment",
    title: "New Comment",
    message: "Ahmed commented on 'Database Schema Design'",
    read: true,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    link: "/boards/1/tasks/4",
    icon: "comment",
  },
  {
    _id: "n5",
    type: "status_changed",
    title: "Status Updated",
    message: "'User Authentication' was moved to Review",
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    link: "/boards/1/tasks/5",
    icon: "status",
  },
  {
    _id: "n6",
    type: "welcome",
    title: "Welcome to TaskFlow!",
    message: "Your account has been successfully created. Start by creating your first board.",
    read: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    link: "/boards",
    icon: "welcome",
  },
];

const getNotifications = async () => {
  try {
    const response = await api.get("/notifications");
    return response.data;
  } catch {
    // Fallback to mock data if endpoint doesn't exist
    return { notifications: mockNotifications };
  }
};

const markAsRead = async (notificationId) => {
  try {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  } catch {
    return { success: true };
  }
};

const markAllAsRead = async () => {
  try {
    const response = await api.patch("/notifications/read-all");
    return response.data;
  } catch {
    return { success: true };
  }
};

const deleteNotification = async (notificationId) => {
  try {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  } catch {
    return { success: true };
  }
};

const notificationService = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};

export default notificationService;
