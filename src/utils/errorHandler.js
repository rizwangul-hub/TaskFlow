/**
 * Extract a user-friendly message from API / network errors.
 */
export const getErrorMessage = (error) => {
  if (!error) return "Something went wrong. Please try again.";

  if (typeof error === "string") return error;

  if (error.response) {
    const { data, status } = error.response;

    if (data?.errors?.length) {
      return data.errors.map((e) => e.message).join(", ");
    }

    if (data?.message) return data.message;

    switch (status) {
      case 400:
        return "Invalid request. Please check your input.";
      case 401:
        return "Invalid credentials. Please try again.";
      case 403:
        return "You do not have permission to perform this action.";
      case 404:
        return "The requested resource was not found.";
      case 409:
        return "This resource already exists.";
      case 429:
        return "Too many requests. Please wait and try again.";
      case 500:
        return "Server error. Please try again later.";
      default:
        return "Something went wrong. Please try again.";
    }
  }

  if (error.message) return error.message;

  return "Network error. Please check your connection and try again.";
};

export default getErrorMessage;
