import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import attachmentService from "./attachmentService.js";

const initialState = {
  attachments: [],
  uploadProgress: 0,
  uploading: false,
  deleting: false,
  error: null,
};

// ─── Thunks ─────────────────────────────────────────────────────────────────

export const uploadFiles = createAsyncThunk(
  "attachments/upload",
  async ({ taskId, formData }, thunkAPI) => {
    try {
      const data = await attachmentService.uploadFiles(
        taskId,
        formData,
        (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          thunkAPI.dispatch(setUploadProgress(percent));
        }
      );
      return data.attachments;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to upload files";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deleteFile = createAsyncThunk(
  "attachments/delete",
  async ({ taskId, fileId }, thunkAPI) => {
    try {
      await attachmentService.deleteFile(taskId, fileId);
      return fileId;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete file";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const attachmentSlice = createSlice({
  name: "attachments",
  initialState,
  reducers: {
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    setAttachments: (state, action) => {
      state.attachments = action.payload;
    },
    clearAttachments: (state) => {
      state.attachments = [];
      state.uploadProgress = 0;
      state.error = null;
    },
    clearAttachmentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── uploadFiles ──────────────────────────────────────────────────────
      .addCase(uploadFiles.pending, (state) => {
        state.uploading = true;
        state.uploadProgress = 0;
        state.error = null;
      })
      .addCase(uploadFiles.fulfilled, (state, action) => {
        state.uploading = false;
        state.uploadProgress = 100;
        state.attachments = action.payload ?? state.attachments;
      })
      .addCase(uploadFiles.rejected, (state, action) => {
        state.uploading = false;
        state.uploadProgress = 0;
        state.error = action.payload;
      })

      // ── deleteFile ───────────────────────────────────────────────────────
      .addCase(deleteFile.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.deleting = false;
        const deletedId = action.payload;
        state.attachments = state.attachments.filter(
          (a) => a._id !== deletedId
        );
      })
      .addCase(deleteFile.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      });
  },
});

export const {
  setUploadProgress,
  setAttachments,
  clearAttachments,
  clearAttachmentError,
} = attachmentSlice.actions;
export default attachmentSlice.reducer;
