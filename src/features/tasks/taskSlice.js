import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import taskService from "./taskService.js";

const initialState = {
  tasks: [],
  overdueTasks: [],
  currentTask: null,
  comments: [],
  activity: [],
  analytics: null,
  loading: false,
  commentsLoading: false,
  attachmentsLoading: false,
  activityLoading: false,
  error: null,
};

// Tasks Thunks
export const fetchTasksByBoard = createAsyncThunk(
  "tasks/fetchByBoard",
  async ({ boardId, priority }, thunkAPI) => {
    try {
      const data = await taskService.getTasksByBoard(boardId, priority);
      return data.tasks;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch tasks";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchSingleTask = createAsyncThunk(
  "tasks/fetchSingle",
  async (id, thunkAPI) => {
    try {
      const data = await taskService.getSingleTask(id);
      return data.task;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch task details";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const createTask = createAsyncThunk(
  "tasks/create",
  async (taskData, thunkAPI) => {
    try {
      const data = await taskService.createTask(taskData);
      return data.task;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to create task";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateTask = createAsyncThunk(
  "tasks/update",
  async ({ id, taskData }, thunkAPI) => {
    try {
      const data = await taskService.updateTask(id, taskData);
      return data.task;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update task";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateTaskStatus = createAsyncThunk(
  "tasks/updateStatus",
  async ({ id, status }, thunkAPI) => {
    try {
      const data = await taskService.updateTaskStatus(id, status);
      return data.task;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update status";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateTaskPriority = createAsyncThunk(
  "tasks/updatePriority",
  async ({ id, priority }, thunkAPI) => {
    try {
      const data = await taskService.updateTaskPriority(id, priority);
      return data.task;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update priority";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deleteTask = createAsyncThunk(
  "tasks/delete",
  async (id, thunkAPI) => {
    try {
      await taskService.deleteTask(id);
      return id;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete task";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchOverdueTasks = createAsyncThunk(
  "tasks/fetchOverdue",
  async (_, thunkAPI) => {
    try {
      const data = await taskService.getOverdueTasks();
      return data.tasks;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch overdue tasks";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Comments Thunks
export const fetchComments = createAsyncThunk(
  "tasks/fetchComments",
  async (taskId, thunkAPI) => {
    try {
      const data = await taskService.getComments(taskId);
      return data.comments;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch comments";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const addComment = createAsyncThunk(
  "tasks/addComment",
  async ({ taskId, text }, thunkAPI) => {
    try {
      const data = await taskService.addComment(taskId, text);
      return data.comment;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to add comment";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const editComment = createAsyncThunk(
  "tasks/editComment",
  async ({ commentId, text }, thunkAPI) => {
    try {
      const data = await taskService.editComment(commentId, text);
      return data.comment;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to edit comment";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deleteComment = createAsyncThunk(
  "tasks/deleteComment",
  async (commentId, thunkAPI) => {
    try {
      await taskService.deleteComment(commentId);
      return commentId;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete comment";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Attachments Thunks
export const uploadAttachment = createAsyncThunk(
  "tasks/uploadAttachment",
  async ({ taskId, formData }, thunkAPI) => {
    try {
      const data = await taskService.uploadAttachment(taskId, formData);
      return data.attachments; // returns updated attachments array
    } catch (error) {
      const message = error.response?.data?.message || "Failed to upload attachment";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deleteAttachment = createAsyncThunk(
  "tasks/deleteAttachment",
  async ({ taskId, fileId }, thunkAPI) => {
    try {
      await taskService.deleteAttachment(taskId, fileId);
      return fileId;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete attachment";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Activity Thunks
export const fetchTaskActivity = createAsyncThunk(
  "tasks/fetchActivity",
  async (taskId, thunkAPI) => {
    try {
      const data = await taskService.getTaskActivity(taskId);
      return data.activities;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch activity log";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Analytics Thunks
export const fetchDashboardAnalytics = createAsyncThunk(
  "tasks/fetchAnalytics",
  async (_, thunkAPI) => {
    try {
      const data = await taskService.getDashboardAnalytics();
      return data.analytics;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch analytics";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    clearTaskError: (state) => {
      state.error = null;
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
      state.comments = [];
      state.activity = [];
    },
  },
  extraReducers: (builder) => {
    const setPending = (state) => {
      state.loading = true;
      state.error = null;
    };
    const setRejected = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };

    builder
      // Fetch tasks by board
      .addCase(fetchTasksByBoard.pending, setPending)
      .addCase(fetchTasksByBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasksByBoard.rejected, setRejected)

      // Fetch single task
      .addCase(fetchSingleTask.pending, setPending)
      .addCase(fetchSingleTask.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload;
      })
      .addCase(fetchSingleTask.rejected, setRejected)

      // Create task
      .addCase(createTask.pending, setPending)
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.push(action.payload);
      })
      .addCase(createTask.rejected, setRejected)

      // Update task
      .addCase(updateTask.pending, setPending)
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        state.tasks = state.tasks.map((t) => (t._id === updated._id ? updated : t));
        if (state.currentTask?._id === updated._id) {
          state.currentTask = updated;
        }
      })
      .addCase(updateTask.rejected, setRejected)

      // Update task status
      .addCase(updateTaskStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        state.tasks = state.tasks.map((t) => (t._id === updated._id ? updated : t));
        if (state.currentTask?._id === updated._id) {
          state.currentTask = updated;
        }
      })
      .addCase(updateTaskStatus.rejected, setRejected)

      // Update task priority
      .addCase(updateTaskPriority.pending, (state) => {
        state.error = null;
      })
      .addCase(updateTaskPriority.fulfilled, (state, action) => {
        const updated = action.payload;
        state.tasks = state.tasks.map((t) => (t._id === updated._id ? updated : t));
        if (state.currentTask?._id === updated._id) {
          state.currentTask = updated;
        }
      })
      .addCase(updateTaskPriority.rejected, setRejected)

      // Delete task
      .addCase(deleteTask.pending, setPending)
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload;
        state.tasks = state.tasks.filter((t) => t._id !== deletedId);
        if (state.currentTask?._id === deletedId) {
          state.currentTask = null;
        }
      })
      .addCase(deleteTask.rejected, setRejected)

      // Fetch overdue tasks
      .addCase(fetchOverdueTasks.pending, setPending)
      .addCase(fetchOverdueTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.overdueTasks = action.payload;
      })
      .addCase(fetchOverdueTasks.rejected, setRejected)

      // Fetch comments
      .addCase(fetchComments.pending, (state) => {
        state.commentsLoading = true;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.commentsLoading = false;
        state.comments = action.payload;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.commentsLoading = false;
        state.error = action.payload;
      })

      // Add comment
      .addCase(addComment.fulfilled, (state, action) => {
        state.comments.unshift(action.payload);
      })

      // Edit comment
      .addCase(editComment.fulfilled, (state, action) => {
        const updated = action.payload;
        state.comments = state.comments.map((c) => (c._id === updated._id ? updated : c));
      })

      // Delete comment
      .addCase(deleteComment.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.comments = state.comments.filter((c) => c._id !== deletedId);
      })

      // Upload attachment
      .addCase(uploadAttachment.pending, (state) => {
        state.attachmentsLoading = true;
      })
      .addCase(uploadAttachment.fulfilled, (state, action) => {
        state.attachmentsLoading = false;
        if (state.currentTask) {
          state.currentTask.attachments = action.payload;
        }
        // Update task list representation too
        const taskId = state.currentTask?._id;
        if (taskId) {
          state.tasks = state.tasks.map((t) => 
            t._id === taskId ? { ...t, attachments: action.payload } : t
          );
        }
      })
      .addCase(uploadAttachment.rejected, (state, action) => {
        state.attachmentsLoading = false;
        state.error = action.payload;
      })

      // Delete attachment
      .addCase(deleteAttachment.fulfilled, (state, action) => {
        const deletedFileId = action.payload;
        if (state.currentTask) {
          state.currentTask.attachments = state.currentTask.attachments.filter(
            (a) => a._id !== deletedFileId
          );
          const taskId = state.currentTask._id;
          state.tasks = state.tasks.map((t) => 
            t._id === taskId ? { ...t, attachments: state.currentTask.attachments } : t
          );
        }
      })

      // Fetch Activity
      .addCase(fetchTaskActivity.pending, (state) => {
        state.activityLoading = true;
      })
      .addCase(fetchTaskActivity.fulfilled, (state, action) => {
        state.activityLoading = false;
        state.activity = action.payload;
      })
      .addCase(fetchTaskActivity.rejected, (state, action) => {
        state.activityLoading = false;
        state.error = action.payload;
      })

      // Fetch Analytics
      .addCase(fetchDashboardAnalytics.pending, setPending)
      .addCase(fetchDashboardAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchDashboardAnalytics.rejected, setRejected);
  },
});

export const { clearTaskError, clearCurrentTask } = taskSlice.actions;
export default taskSlice.reducer;
