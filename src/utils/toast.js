import toast from "react-hot-toast";

/**
 * Centered Toast Notification Utilities
 */
export const successToast = (message) => {
  return toast.success(message, {
    style: {
      background: "#10b981", // Emerald 500 for success
      color: "#ffffff",
      fontWeight: "500",
    },
    iconTheme: {
      primary: "#ffffff",
      secondary: "#10b981",
    },
  });
};

export const errorToast = (message) => {
  return toast.error(message, {
    style: {
      background: "#ef4444", // Red 500 for error
      color: "#ffffff",
      fontWeight: "500",
    },
    iconTheme: {
      primary: "#ffffff",
      secondary: "#ef4444",
    },
  });
};

export const warningToast = (message) => {
  return toast(message, {
    icon: "⚠️",
    style: {
      background: "#f59e0b", // Amber 500 for warning
      color: "#ffffff",
      fontWeight: "500",
    },
  });
};

export const infoToast = (message) => {
  return toast(message, {
    icon: "ℹ️",
    style: {
      background: "#3b82f6", // Blue 500 for info
      color: "#ffffff",
      fontWeight: "500",
    },
  });
};

const toastService = {
  success: successToast,
  error: errorToast,
  warning: warningToast,
  info: infoToast,
};

export default toastService;
