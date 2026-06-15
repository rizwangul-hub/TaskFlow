import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  clearComments,
} from "../../features/comments/commentSlice.js";
import { useAuth } from "../../hooks/useAuth.js";
import toast from "react-hot-toast";
import Spinner from "../common/Spinner.jsx";

// ─── Sub Components ─────────────────────────────────────────────────────────

const MAX_CHARS = 500;
const PAGE_SIZE = 10;

/** Auto-resize textarea with character counter */
const AddCommentForm = ({ taskId, submitting }) => {
  const dispatch = useDispatch();
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const handleChange = (e) => {
    if (e.target.value.length <= MAX_CHARS) {
      setText(e.target.value);
      autoResize();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const result = await dispatch(createComment({ taskId, text: text.trim() }));
    if (createComment.fulfilled.match(result)) {
      setText("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      toast.success("Comment added");
    } else {
      toast.error(result.payload || "Failed to add comment");
    }
  };

  const remaining = MAX_CHARS - text.length;
  const isNearLimit = remaining <= 50;

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="relative">
        <textarea
          ref={textareaRef}
          rows={2}
          value={text}
          onChange={handleChange}
          placeholder="Write a comment..."
          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder-slate-400 shadow-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          style={{ minHeight: "64px", maxHeight: "240px", overflow: "hidden" }}
        />
        <span
          className={`absolute bottom-2 right-3 text-[10px] font-medium transition ${
            isNearLimit ? "text-amber-500" : "text-slate-400"
          }`}
        >
          {remaining}/{MAX_CHARS}
        </span>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2 text-xs font-bold text-white shadow transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (
            <>
              <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Posting…
            </>
          ) : (
            "Post Comment"
          )}
        </button>
      </div>
    </form>
  );
};

/** Single comment card */
const CommentCard = ({ comment, currentUser, taskId }) => {
  const dispatch = useDispatch();
  const { submitting } = useSelector((s) => s.comments);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const textareaRef = useRef(null);

  const isOwner =
    comment.author?._id === currentUser?._id || currentUser?.role === "admin";
  const avatar = comment.author?.avatar?.url;
  const initials = comment.author?.name?.charAt(0)?.toUpperCase() || "?";
  const dateStr = new Date(comment.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing]);

  const handleSaveEdit = async () => {
    if (!editText.trim() || editText.trim() === comment.text) {
      setIsEditing(false);
      return;
    }
    const result = await dispatch(
      updateComment({ commentId: comment._id, text: editText.trim() })
    );
    if (updateComment.fulfilled.match(result)) {
      toast.success("Comment updated");
      setIsEditing(false);
    } else {
      toast.error(result.payload || "Failed to update comment");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this comment?")) return;
    const result = await dispatch(deleteComment(comment._id));
    if (deleteComment.fulfilled.match(result)) {
      toast.success("Comment deleted");
    } else {
      toast.error(result.payload || "Failed to delete comment");
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22 }}
      className="group relative rounded-2xl border border-slate-100 bg-slate-50/50 p-4 backdrop-blur-sm transition hover:border-slate-200 hover:shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {/* Avatar */}
          <div className="h-8 w-8 flex-shrink-0 rounded-full overflow-hidden ring-2 ring-white shadow-sm bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
            {avatar ? (
              <img src={avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 leading-none">
              {comment.author?.name || "Unknown"}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">{dateStr}</p>
          </div>
        </div>

        {/* Actions – only visible on hover, only for owner */}
        {isOwner && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => {
                setEditText(comment.text);
                setIsEditing(true);
              }}
              title="Edit"
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-violet-50 hover:text-violet-600"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6.768-6.768a2 2 0 112.828 2.828L11.828 13.83a4 4 0 01-1.414.94l-3.536.884.884-3.536A4 4 0 019 11z" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              title="Delete"
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="mt-3">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              ref={textareaRef}
              value={editText}
              onChange={(e) => {
                if (e.target.value.length <= MAX_CHARS) setEditText(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              className="w-full resize-none rounded-xl border border-violet-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-2 ring-violet-100 transition"
              style={{ minHeight: "64px" }}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                disabled={submitting}
                className="rounded-lg bg-violet-600 px-4 py-1.5 text-[11px] font-bold text-white transition hover:bg-violet-700 disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="rounded-lg border border-slate-200 px-4 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
            {comment.text}
          </p>
        )}
      </div>
    </motion.div>
  );
};

// ─── Main CommentsSection ────────────────────────────────────────────────────

const CommentsSection = ({ taskId }) => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { comments, loading, submitting, totalComments, currentPage, totalPages } =
    useSelector((s) => s.comments);

  useEffect(() => {
    if (taskId) {
      dispatch(getComments({ taskId, page: 1, limit: PAGE_SIZE }));
    }
    return () => {
      dispatch(clearComments());
    };
  }, [dispatch, taskId]);

  const loadMore = () => {
    dispatch(getComments({ taskId, page: currentPage + 1, limit: PAGE_SIZE }));
  };

  return (
    <div className="space-y-5">
      {/* Add Comment Form */}
      <AddCommentForm taskId={taskId} submitting={submitting} />

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-100" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {totalComments} {totalComments === 1 ? "Comment" : "Comments"}
        </span>
        <div className="flex-1 h-px bg-slate-100" />
      </div>

      {/* Comments List */}
      {loading && comments.length === 0 ? (
        <div className="flex justify-center py-10">
          <Spinner size="md" />
        </div>
      ) : comments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-500">No comments yet</p>
          <p className="text-xs text-slate-400 mt-1">Be the first to add a comment above.</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {comments.map((comment) => (
              <CommentCard
                key={comment._id}
                comment={comment}
                currentUser={user}
                taskId={taskId}
              />
            ))}
          </AnimatePresence>

          {/* Load More */}
          {currentPage < totalPages && (
            <div className="flex justify-center pt-2">
              <button
                onClick={loadMore}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                {loading ? <Spinner size="xs" /> : null}
                Load more comments
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
