import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchBoards, createBoard, deleteBoard, updateBoard } from "../features/boards/boardSlice.js";
import { useAuth } from "../hooks/useAuth.js";
import Spinner from "../components/common/Spinner.jsx";
import toast from "react-hot-toast";

const BoardsList = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { boards, pagination, loading } = useSelector((state) => state.boards);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [boardToEdit, setBoardToEdit] = useState(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchBoards({ page: currentPage, limit: 12 }));
  }, [dispatch, currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setImageFile(null);
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Board title is required");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const result = await dispatch(createBoard(formData));
      if (createBoard.fulfilled.match(result)) {
        toast.success("Board created successfully!");
        setCreateModalOpen(false);
        resetForm();
      } else {
        toast.error(result.payload || "Failed to create board");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditBoard = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Board title is required");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const result = await dispatch(updateBoard({ id: boardToEdit._id, formData }));
      if (updateBoard.fulfilled.match(result)) {
        toast.success("Board updated successfully!");
        setEditModalOpen(false);
        setBoardToEdit(null);
        resetForm();
      } else {
        toast.error(result.payload || "Failed to update board");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBoard = async (id) => {
    if (!window.confirm("Are you sure you want to delete this board? This action will delete all associated tasks, columns, and attachments!")) {
      return;
    }

    try {
      const result = await dispatch(deleteBoard(id));
      if (deleteBoard.fulfilled.match(result)) {
        toast.success("Board deleted successfully");
      } else {
        toast.error(result.payload || "Failed to delete board");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const openCreateModal = () => {
    resetForm();
    setCreateModalOpen(true);
  };

  const openEditModal = (board) => {
    resetForm();
    setBoardToEdit(board);
    setTitle(board.title);
    setDescription(board.description || "");
    setEditModalOpen(true);
  };

  const isManagerOrAdmin = user?.role === "admin" || user?.role === "project_manager";

  // Gradient fallbacks for board covers
  const fallbacks = [
    "from-indigo-500 to-purple-600",
    "from-blue-500 to-indigo-600",
    "from-violet-500 to-fuchsia-600",
    "from-pink-500 to-rose-600",
  ];

  return (
    <div className="space-y-8">
      {/* ─── Top Header Action ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Manage your workspaces and boards</p>
        </div>
        {isManagerOrAdmin && (
          <button onClick={openCreateModal} className="btn-primary !w-auto gap-2 px-5 py-3">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create New Board
          </button>
        )}
      </div>

      {loading && boards.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : boards.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-400">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-800">No boards available</h3>
          <p className="mt-1 text-sm text-slate-400 max-w-md">
            {isManagerOrAdmin
              ? "You haven't created any boards yet. Click the button above to launch your first board!"
              : "You aren't invited to any boards. Ask your manager or administrator to invite you."}
          </p>
          {isManagerOrAdmin && (
            <button onClick={openCreateModal} className="btn-secondary mt-6 gap-2">
              Create Board
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Boards Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((board, idx) => {
              const bgGradient = fallbacks[idx % fallbacks.length];
              const isOwner = board.createdBy?._id === user?._id || user?.role === "admin";

              return (
                <div
                  key={board._id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
                >
                  {/* Board Cover */}
                  {board.image?.url ? (
                    <div className="h-32 w-full overflow-hidden bg-slate-100">
                      <img
                        src={board.image.url}
                        alt={board.title}
                        className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className={`h-32 w-full bg-gradient-to-r ${bgGradient} flex items-end p-4`}>
                      <span className="font-display text-2xl font-black text-white/20 select-none">TASKFLOW</span>
                    </div>
                  )}

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-start justify-between gap-2">
                      <Link to={`/boards/${board._id}`} className="font-display text-base font-bold text-slate-800 hover:text-brand-600 transition">
                        {board.title}
                      </Link>

                      {/* Dropdown / Edit Actions (Only if Owner/Admin) */}
                      {isOwner && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(board)}
                            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            title="Edit Board"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteBoard(board._id)}
                            className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            title="Delete Board"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="mt-2 line-clamp-2 text-xs text-slate-400 flex-1 leading-relaxed">
                      {board.description || "No description provided."}
                    </p>

                    {/* Member & Creator summary */}
                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-2">
                        {/* Member avatars */}
                        <div className="flex -space-x-2">
                          {(board.members || []).slice(0, 3).map((member) => (
                            <div key={member._id} className="relative group">
                              {member.avatar?.url ? (
                                <img
                                  src={member.avatar.url}
                                  alt={member.name}
                                  className="h-6 w-6 rounded-full border-2 border-white object-cover shadow-sm"
                                  title={member.name}
                                />
                              ) : (
                                <div
                                  className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-bold text-slate-600"
                                  title={member.name}
                                >
                                  {member.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        {(board.members || []).length > 3 && (
                          <span className="text-[10px] font-semibold text-slate-400">
                            +{(board.members || []).length - 3} more
                          </span>
                        )}
                        {(board.members || []).length === 0 && (
                          <span className="text-[10px] font-medium text-slate-400">No members</span>
                        )}
                      </div>

                      <span className="text-[10px] font-medium text-slate-400 bg-slate-50 border border-slate-100 rounded-md px-1.5 py-0.5">
                        Created by: {board.createdBy?.name?.split(" ")[0]}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="btn-secondary !py-2 !px-3 disabled:opacity-30 disabled:pointer-events-none"
              >
                Previous
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold border ${
                    currentPage === p
                      ? "bg-brand-600 border-brand-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={currentPage === pagination.totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="btn-secondary !py-2 !px-3 disabled:opacity-30 disabled:pointer-events-none"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── Create Board Modal ─── */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setCreateModalOpen(false)} />
          <div className="card relative w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <h3 className="font-display text-lg font-bold text-slate-800">Create New Board</h3>
              <button onClick={() => setCreateModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-700">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateBoard} className="space-y-5">
              <div>
                <label className="label">Board Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mobile App Redesign"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Description (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Summarize the board purpose or list goals"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field resize-none"
                />
              </div>

              <div>
                <label className="label">Board Cover Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setCreateModalOpen(false)} className="btn-secondary !w-auto py-2.5 px-4">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary !w-auto py-2.5 px-5 flex items-center gap-2">
                  {submitting && <Spinner size="sm" color="white" />}
                  {submitting ? "Creating..." : "Create Board"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Edit Board Modal ─── */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setEditModalOpen(false)} />
          <div className="card relative w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <h3 className="font-display text-lg font-bold text-slate-800">Edit Board Details</h3>
              <button onClick={() => setEditModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-700">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditBoard} className="space-y-5">
              <div>
                <label className="label">Board Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Description (Optional)</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field resize-none"
                />
              </div>

              <div>
                <label className="label">Replace Cover Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setEditModalOpen(false)} className="btn-secondary !w-auto py-2.5 px-4">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary !w-auto py-2.5 px-5 flex items-center gap-2">
                  {submitting && <Spinner size="sm" color="white" />}
                  {submitting ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardsList;
