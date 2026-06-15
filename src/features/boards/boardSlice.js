import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import boardService from "./boardService.js";

const initialState = {
  boards: [],
  currentBoard: null,
  members: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  loading: false,
  error: null,
};

export const fetchBoards = createAsyncThunk(
  "boards/fetchBoards",
  async ({ page, limit } = {}, thunkAPI) => {
    try {
      return await boardService.getBoards(page, limit);
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch boards";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchBoardById = createAsyncThunk(
  "boards/fetchBoardById",
  async (id, thunkAPI) => {
    try {
      return await boardService.getBoardById(id);
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch board details";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const createBoard = createAsyncThunk(
  "boards/createBoard",
  async (formData, thunkAPI) => {
    try {
      return await boardService.createBoard(formData);
    } catch (error) {
      const message = error.response?.data?.message || "Failed to create board";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateBoard = createAsyncThunk(
  "boards/updateBoard",
  async ({ id, formData }, thunkAPI) => {
    try {
      return await boardService.updateBoard(id, formData);
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update board";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deleteBoard = createAsyncThunk(
  "boards/deleteBoard",
  async (id, thunkAPI) => {
    try {
      await boardService.deleteBoard(id);
      return id;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete board";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const inviteBoardMember = createAsyncThunk(
  "boards/inviteMember",
  async ({ boardId, userId }, thunkAPI) => {
    try {
      return await boardService.inviteUser(boardId, userId);
    } catch (error) {
      const message = error.response?.data?.message || "Failed to invite member";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const removeBoardMember = createAsyncThunk(
  "boards/removeMember",
  async ({ boardId, userId }, thunkAPI) => {
    try {
      await boardService.removeUser(boardId, userId);
      return userId;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to remove member";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchBoardMembers = createAsyncThunk(
  "boards/fetchMembers",
  async (boardId, thunkAPI) => {
    try {
      return await boardService.getBoardMembers(boardId);
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch board members";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const boardSlice = createSlice({
  name: "boards",
  initialState,
  reducers: {
    clearBoardError: (state) => {
      state.error = null;
    },
    clearCurrentBoard: (state) => {
      state.currentBoard = null;
      state.members = [];
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
      // Fetch Boards
      .addCase(fetchBoards.pending, setPending)
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.loading = false;
        state.boards = action.payload.boards;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchBoards.rejected, setRejected)

      // Fetch Board By ID
      .addCase(fetchBoardById.pending, setPending)
      .addCase(fetchBoardById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBoard = action.payload.board;
        state.members = action.payload.board.members || [];
      })
      .addCase(fetchBoardById.rejected, setRejected)

      // Create Board
      .addCase(createBoard.pending, setPending)
      .addCase(createBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.boards.unshift(action.payload.board);
      })
      .addCase(createBoard.rejected, setRejected)

      // Update Board
      .addCase(updateBoard.pending, setPending)
      .addCase(updateBoard.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.board;
        state.boards = state.boards.map((b) => (b._id === updated._id ? updated : b));
        if (state.currentBoard?._id === updated._id) {
          state.currentBoard = updated;
          state.members = updated.members || [];
        }
      })
      .addCase(updateBoard.rejected, setRejected)

      // Delete Board
      .addCase(deleteBoard.pending, setPending)
      .addCase(deleteBoard.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload;
        state.boards = state.boards.filter((b) => b._id !== deletedId);
        if (state.currentBoard?._id === deletedId) {
          state.currentBoard = null;
          state.members = [];
        }
      })
      .addCase(deleteBoard.rejected, setRejected)

      // Invite Member
      .addCase(inviteBoardMember.pending, setPending)
      .addCase(inviteBoardMember.fulfilled, (state, action) => {
        state.loading = false;
        const invited = action.payload.invitedUser;
        state.members.push(invited);
        if (state.currentBoard) {
          state.currentBoard.members = state.members;
        }
      })
      .addCase(inviteBoardMember.rejected, setRejected)

      // Remove Member
      .addCase(removeBoardMember.pending, setPending)
      .addCase(removeBoardMember.fulfilled, (state, action) => {
        state.loading = false;
        const removedUserId = action.payload;
        state.members = state.members.filter((m) => m._id !== removedUserId);
        if (state.currentBoard) {
          state.currentBoard.members = state.members;
        }
      })
      .addCase(removeBoardMember.rejected, setRejected)

      // Fetch Board Members
      .addCase(fetchBoardMembers.pending, setPending)
      .addCase(fetchBoardMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload.members;
      })
      .addCase(fetchBoardMembers.rejected, setRejected);
  },
});

export const { clearBoardError, clearCurrentBoard } = boardSlice.actions;
export default boardSlice.reducer;
