import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import commentService from "./commentService.js";

const initialState = {
  comments: [],
  totalComments: 0,
  currentPage: 1,
  totalPages: 1,
  loading: false,
  submitting: false,
  error: null,
};

// ─── Thunks ─────────────────────────────────────────────────────────────────

export const getComments = createAsyncThunk(
  "comments/getAll",
  async ({ taskId, page = 1, limit = 10 }, thunkAPI) => {
    try {
      const data = await commentService.getComments(taskId, page, limit);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch comments";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const createComment = createAsyncThunk(
  "comments/create",
  async ({ taskId, text }, thunkAPI) => {
    try {
      const data = await commentService.createComment(taskId, text);
      return data.comment;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to add comment";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateComment = createAsyncThunk(
  "comments/update",
  async ({ commentId, text }, thunkAPI) => {
    try {
      const data = await commentService.updateComment(commentId, text);
      return data.comment;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update comment";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deleteComment = createAsyncThunk(
  "comments/delete",
  async (commentId, thunkAPI) => {
    try {
      await commentService.deleteComment(commentId);
      return commentId;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete comment";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const commentSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    clearComments: (state) => {
      state.comments = [];
      state.totalComments = 0;
      state.currentPage = 1;
      state.totalPages = 1;
      state.error = null;
    },
    clearCommentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── getComments ──────────────────────────────────────────────────────
      .addCase(getComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getComments.fulfilled, (state, action) => {
        state.loading = false;
        const { comments, total, page, pages } = action.payload;
        state.comments = comments ?? action.payload.comments ?? [];
        state.totalComments = total ?? state.totalComments;
        state.currentPage = page ?? state.currentPage;
        state.totalPages = pages ?? state.totalPages;
      })
      .addCase(getComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── createComment ────────────────────────────────────────────────────
      .addCase(createComment.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.submitting = false;
        state.comments.unshift(action.payload);
        state.totalComments += 1;
      })
      .addCase(createComment.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // ── updateComment ────────────────────────────────────────────────────
      .addCase(updateComment.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        state.submitting = false;
        const updated = action.payload;
        state.comments = state.comments.map((c) =>
          c._id === updated._id ? updated : c
        );
      })
      .addCase(updateComment.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // ── deleteComment ────────────────────────────────────────────────────
      .addCase(deleteComment.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.comments = state.comments.filter((c) => c._id !== deletedId);
        state.totalComments = Math.max(0, state.totalComments - 1);
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearComments, clearCommentError } = commentSlice.actions;
export default commentSlice.reducer;
