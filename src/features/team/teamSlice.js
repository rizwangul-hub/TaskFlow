import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import teamService from "./teamService.js";

const initialState = {
  members: [],
  loading: false,
  error: null,
};

export const fetchTeamMembers = createAsyncThunk(
  "team/fetchMembers",
  async (boardId, thunkAPI) => {
    try {
      const data = await teamService.getBoardMembers(boardId);
      return data.members;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch board members";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const inviteTeamMember = createAsyncThunk(
  "team/inviteMember",
  async ({ boardId, userId }, thunkAPI) => {
    try {
      const data = await teamService.inviteMember(boardId, userId);
      return data.invitedUser;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to invite member";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const removeTeamMember = createAsyncThunk(
  "team/removeMember",
  async ({ boardId, userId }, thunkAPI) => {
    try {
      await teamService.removeMember(boardId, userId);
      return userId;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to remove member";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const teamSlice = createSlice({
  name: "team",
  initialState,
  reducers: {
    clearTeamError: (state) => {
      state.error = null;
    },
    resetTeamState: (state) => {
      state.members = [];
      state.loading = false;
      state.error = null;
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
      // fetchTeamMembers
      .addCase(fetchTeamMembers.pending, setPending)
      .addCase(fetchTeamMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload || [];
      })
      .addCase(fetchTeamMembers.rejected, setRejected)

      // inviteTeamMember
      .addCase(inviteTeamMember.pending, setPending)
      .addCase(inviteTeamMember.fulfilled, (state, action) => {
        state.loading = false;
        state.members.push(action.payload);
      })
      .addCase(inviteTeamMember.rejected, setRejected)

      // removeTeamMember
      .addCase(removeTeamMember.pending, setPending)
      .addCase(removeTeamMember.fulfilled, (state, action) => {
        state.loading = false;
        state.members = state.members.filter((m) => m._id !== action.payload);
      })
      .addCase(removeTeamMember.rejected, setRejected);
  },
});

export const { clearTeamError, resetTeamState } = teamSlice.actions;
export default teamSlice.reducer;
