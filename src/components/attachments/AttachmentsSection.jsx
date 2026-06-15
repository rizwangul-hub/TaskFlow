import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { uploadFiles, deleteFile, setAttachments } from "../../features/attachments/attachmentSlice.js";
import { useAuth } from "../../hooks/useAuth.js";
import toast from "react-hot-toast";
import Spinner from "../common/Spinner.jsx";

// ─── Constants ───────────────────────────────────────────────────────────────

const ACCEPTED_TYPES = {
  "image/jpeg": "Image",
  "image/png": "Image",
  "image/gif": "Image",
  "image/webp": "Image",
  "application/pdf": "PDF",
  "application/msword": "Word",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word",
};
const MAX_FILES = 5;
const MAX_SIZE_MB = 10;

// ─── Utility Helpers ─────────────────────────────────────────────────────────

const getFileIcon = (mimeType) => {
  if (!mimeType) return "📎";
  if (mimeType.startsWith("image/")) return "🖼️";
  if (mimeType === "application/pdf") return "📄";
  return "📝";
};

const formatBytes = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const isImage = (mimeType) => mimeType?.startsWith("image/");
const isPdf = (mimeType) => mimeType === "application/pdf";

// ─── FilePreviewModal ────────────────────────────────────────────────────────

const FilePreviewModal = ({ file, onClose }) => {
  if (!file) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.93 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.93 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <div>
              <p className="text-sm font-bold text-slate-800 truncate max-w-[400px]">
                {file.fileName}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {ACCEPTED_TYPES[file.mimeType] || "File"} •{" "}
                {new Date(file.uploadedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={file.fileUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3.5 py-1.5 text-[11px] font-bold text-white transition hover:bg-violet-700"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </a>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Preview body */}
          <div className="overflow-auto max-h-[75vh] flex items-center justify-center bg-slate-50 p-4">
            {isImage(file.mimeType) ? (
              <img
                src={file.fileUrl}
                alt={file.fileName}
                className="max-h-[68vh] w-auto max-w-full rounded-lg object-contain shadow-md"
              />
            ) : isPdf(file.mimeType) ? (
              <iframe
                src={file.fileUrl}
                title={file.fileName}
                className="h-[68vh] w-full rounded-lg border border-slate-200"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 py-20">
                <span className="text-6xl">{getFileIcon(file.mimeType)}</span>
                <p className="text-sm text-slate-500 font-medium">{file.fileName}</p>
                <a
                  href={file.fileUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-violet-700"
                >
                  Download File
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── UploadDropzone ──────────────────────────────────────────────────────────

const UploadDropzone = ({ taskId, existingCount }) => {
  const dispatch = useDispatch();
  const { uploading, uploadProgress } = useSelector((s) => s.attachments);
  const [isDragging, setIsDragging] = useState(false);
  const [queuedFiles, setQueuedFiles] = useState([]);
  const inputRef = useRef(null);

  const validateFiles = (files) => {
    const errors = [];
    const remaining = MAX_FILES - existingCount;
    const accepted = [];

    Array.from(files).forEach((f) => {
      if (!ACCEPTED_TYPES[f.type]) {
        errors.push(`"${f.name}" has an unsupported type.`);
      } else if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        errors.push(`"${f.name}" exceeds ${MAX_SIZE_MB} MB.`);
      } else {
        accepted.push(f);
      }
    });

    if (accepted.length + existingCount > MAX_FILES) {
      errors.push(`Max ${MAX_FILES} files allowed. Only ${remaining} slot(s) remaining.`);
      accepted.splice(remaining);
    }

    return { accepted, errors };
  };

  const processFiles = (files) => {
    const { accepted, errors } = validateFiles(files);
    errors.forEach((e) => toast.error(e));
    setQueuedFiles(accepted);
  };

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      processFiles(e.dataTransfer.files);
    },
    [existingCount]
  );

  const handleInputChange = (e) => {
    processFiles(e.target.files);
    e.target.value = "";
  };

  const handleUpload = async () => {
    if (!queuedFiles.length) return;
    const formData = new FormData();
    queuedFiles.forEach((f) => formData.append("files", f));

    const result = await dispatch(uploadFiles({ taskId, formData }));
    if (uploadFiles.fulfilled.match(result)) {
      toast.success(`${queuedFiles.length} file(s) uploaded`);
      setQueuedFiles([]);
    } else {
      toast.error(result.payload || "Upload failed");
    }
  };

  const removeQueued = (name) =>
    setQueuedFiles((prev) => prev.filter((f) => f.name !== name));

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed px-6 py-8 text-center transition ${
          isDragging
            ? "border-violet-400 bg-violet-50"
            : "border-slate-200 bg-slate-50 hover:border-violet-300 hover:bg-violet-50/30"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={Object.keys(ACCEPTED_TYPES).join(",")}
          className="hidden"
          onChange={handleInputChange}
        />
        <div className="flex flex-col items-center gap-2 pointer-events-none">
          <div className={`rounded-xl p-3 transition ${isDragging ? "bg-violet-100" : "bg-slate-100"}`}>
            <svg className={`h-6 w-6 transition ${isDragging ? "text-violet-500" : "text-slate-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-600">
            {isDragging ? "Drop files here" : "Drag & drop or click to browse"}
          </p>
          <p className="text-xs text-slate-400">
            PNG, JPG, GIF, PDF, DOC, DOCX up to {MAX_SIZE_MB} MB · Max {MAX_FILES} files
          </p>
        </div>
      </div>

      {/* Queued files preview */}
      <AnimatePresence>
        {queuedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {queuedFiles.map((f) => (
              <div
                key={f.name}
                className="flex items-center justify-between rounded-xl bg-white border border-slate-100 px-4 py-2 shadow-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg">{getFileIcon(f.type)}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{f.name}</p>
                    <p className="text-[10px] text-slate-400">{formatBytes(f.size)}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeQueued(f.name); }}
                  className="ml-3 text-slate-400 hover:text-red-500 transition"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}

            {/* Progress bar */}
            {uploading && (
              <div className="w-full rounded-full bg-slate-100 overflow-hidden h-1.5">
                <motion.div
                  className="h-full rounded-full bg-violet-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ ease: "linear" }}
                />
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full rounded-xl bg-violet-600 py-2 text-xs font-bold text-white transition hover:bg-violet-700 disabled:opacity-60"
            >
              {uploading ? `Uploading… ${uploadProgress}%` : `Upload ${queuedFiles.length} File(s)`}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── FileCard ────────────────────────────────────────────────────────────────

const FileCard = ({ file, taskId, currentUser, onPreview }) => {
  const dispatch = useDispatch();
  const { deleting } = useSelector((s) => s.attachments);
  const isOwner = file.uploadedBy === currentUser?._id || currentUser?.role === "admin";
  const icon = getFileIcon(file.mimeType);
  const canPreview = isImage(file.mimeType) || isPdf(file.mimeType);

  const handleDelete = async () => {
    if (!window.confirm("Permanently delete this attachment?")) return;
    const result = await dispatch(deleteFile({ taskId, fileId: file._id }));
    if (deleteFile.fulfilled.match(result)) {
      toast.success("File deleted");
    } else {
      toast.error(result.payload || "Failed to delete file");
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.93 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -2 }}
      className="group relative flex flex-col rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-violet-200 hover:shadow-md"
    >
      {/* Thumbnail or icon */}
      <div className="mb-3 flex h-16 w-full items-center justify-center overflow-hidden rounded-xl bg-slate-50">
        {isImage(file.mimeType) ? (
          <img
            src={file.fileUrl}
            alt={file.fileName}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-4xl">{icon}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className="truncate text-xs font-bold text-slate-800"
          title={file.fileName}
        >
          {file.fileName}
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5">
          {ACCEPTED_TYPES[file.mimeType] || "File"} •{" "}
          {new Date(file.uploadedAt).toLocaleDateString()}
        </p>
      </div>

      {/* Actions */}
      <div className="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-3">
        {canPreview && (
          <button
            onClick={() => onPreview(file)}
            className="flex-1 rounded-lg py-1 text-[10px] font-semibold text-slate-600 transition hover:bg-violet-50 hover:text-violet-600"
          >
            Preview
          </button>
        )}
        <a
          href={file.fileUrl}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-lg py-1 text-center text-[10px] font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
        >
          Download
        </a>
        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg px-2 py-1 text-[10px] font-semibold text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
          >
            {deleting ? "…" : "Delete"}
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ─── Main AttachmentsSection ─────────────────────────────────────────────────

const AttachmentsSection = ({ taskId, attachments = [] }) => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { uploading } = useSelector((s) => s.attachments);
  const [previewFile, setPreviewFile] = useState(null);

  // Sync attachments from currentTask into the attachments slice on mount
  const { attachments: sliceAttachments } = useSelector((s) => s.attachments);

  // Use slice data if available (after upload/delete), fallback to prop
  const displayAttachments =
    sliceAttachments.length > 0 || uploading ? sliceAttachments : attachments;

  return (
    <div className="space-y-5">
      {/* Upload area */}
      <UploadDropzone taskId={taskId} existingCount={displayAttachments.length} />

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-100" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {displayAttachments.length} {displayAttachments.length === 1 ? "File" : "Files"}
        </span>
        <div className="flex-1 h-px bg-slate-100" />
      </div>

      {/* Files grid */}
      {displayAttachments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-500">No attachments yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Upload files using the area above.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <AnimatePresence initial={false}>
            {displayAttachments.map((file) => (
              <FileCard
                key={file._id}
                file={file}
                taskId={taskId}
                currentUser={user}
                onPreview={(f) => setPreviewFile(f)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
      )}
    </div>
  );
};

export default AttachmentsSection;
