import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { inviteTeamMember } from "../../features/team/teamSlice.js";
import { fetchBoardById } from "../../features/boards/boardSlice.js";
import api from "../../api/axios.js";
import Spinner from "../common/Spinner.jsx";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const InviteMemberModal = ({ boardId, existingMembers, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [invitingId, setInvitingId] = useState(null);

  // Search users based on query
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      try {
        const { data } = await api.get(`/v1/users?search=${searchQuery}`);
        // Filter out users who are already members of this board
        const filtered = (data.users || []).filter(
          (user) => !existingMembers.some((member) => member._id === user._id)
        );
        setSearchResults(filtered);
      } catch (error) {
        console.error("Failed to search users:", error);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, existingMembers]);

  const handleInvite = async (userId) => {
    setInvitingId(userId);
    try {
      const result = await dispatch(inviteTeamMember({ boardId, userId }));
      if (inviteTeamMember.fulfilled.match(result)) {
        toast.success("User invited successfully!");
        // Refresh board in redux to keep members list synced
        dispatch(fetchBoardById(boardId));
        onClose();
      } else {
        toast.error(result.payload || "Failed to invite member");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setInvitingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        {/* Backdrop motion */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0"
          onClick={onClose}
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="card relative w-full max-w-md bg-white border border-slate-100 overflow-hidden shadow-2xl z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <h3 className="font-display text-lg font-bold text-slate-800">Invite Team Member</h3>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition"
            >
              <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search Box */}
          <div className="space-y-4">
            <div>
              <label className="label">Search by email or name</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. alex@example.com"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pr-10"
                  autoFocus
                />
                {searching && (
                  <span className="absolute right-3 top-3.5">
                    <Spinner size="sm" />
                  </span>
                )}
              </div>
            </div>

            {/* Search Results */}
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 rounded-xl border border-slate-100">
              {searchQuery.trim().length < 2 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Type at least 2 characters to search for users...
                </div>
              ) : searching && searchResults.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Searching...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No matching users found or all matches are already members.
                </div>
              ) : (
                searchResults.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      {user.avatar?.url ? (
                        <img
                          src={user.avatar.url}
                          alt={user.name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-brand-50 flex items-center justify-center text-xs font-bold text-brand-700">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{user.name}</h4>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleInvite(user._id)}
                      disabled={invitingId !== null}
                      className="btn-primary !w-auto !py-1.5 !px-3.5 text-xs font-medium"
                    >
                      {invitingId === user._id ? (
                        <Spinner size="sm" color="white" />
                      ) : (
                        "Invite"
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary !w-auto py-2.5 px-4 text-xs"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InviteMemberModal;
