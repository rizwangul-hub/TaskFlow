import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import activityService from "./activityService.js";

const initialState = {
  activities: [],
  loading: false,
  error: null,
  taskId: null,
};

export const fetchActivity = createAsyncThunk(
  "activity/fetchByTask",
  async (taskId, thunkAPI) => {
    try {
      const data = await activityService.getTaskActivity(taskId);
      return { activities: data.activities || [], taskId };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch activity";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const activitySlice = createSlice({
  name: "activity",
  initialState,
  reducers: {
    clearActivity: (state) => {
      state.activities = [];
      state.taskId = null;
      state.error = null;
    },
    clearActivityError: (state) => {
      state.error = null;
    },
    prependActivity: (state, action) => {
      state.activities.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload.activities;
        state.taskId = action.payload.taskId;
      })
      .addCase(fetchActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearActivity, clearActivityError, prependActivity } = activitySlice.actions;
export default activitySlice.reducer;
