import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchBoardById } from "../../features/boards/boardSlice.js";
import { fetchTeamMembers, removeTeamMember } from "../../features/team/teamSlice.js";
import { useAuth } from "../../hooks/useAuth.js";
import BoardHeader from "../../components/boards/BoardHeader.jsx";
import InviteMemberModal from "../../components/team/InviteMemberModal.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const TeamPage = () => {
  const { boardId } = useParams();
  const dispatch = useDispatch();
  const { user } = useAuth();

  const { currentBoard, loading: boardLoading } = useSelector((state) => state.boards);
  const { members, loading: teamLoading } = useSelector((state) => state.team);

  // Search & Modal States
  const [searchQuery, setSearchQuery] = useState("");
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);

  useEffect(() => {
    dispatch(fetchBoardById(boardId));
    dispatch(fetchTeamMembers(boardId));
  }, [dispatch, boardId]);

  const isManagerOrAdmin = user?.role === "admin" || user?.role === "project_manager";

  // Filter members based on local search query
  const filteredMembers = members.filter((member) => {
    const query = searchQuery.toLowerCase();
    return (
      member.name?.toLowerCase().includes(query) ||
      member.email?.toLowerCase().includes(query)
    );
  });

  const handleRemoveMember = async (targetMember) => {
    if (currentBoard?.createdBy?._id === targetMember._id) {
      toast.error("Board owner cannot be removed from the board!");
      return;
    }

    if (!window.confirm(`Are you sure you want to remove ${targetMember.name} from this board?`)) {
      return;
    }

    try {
      const result = await dispatch(removeTeamMember({ boardId, userId: targetMember._id }));
      if (removeTeamMember.fulfilled.match(result)) {
        toast.success(`${targetMember.name} removed from board`);
        // Refresh board in redux to keep members list synced
        dispatch(fetchBoardById(boardId));
      } else {
        toast.error(result.payload || "Failed to remove member");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const getRoleBadgeClass = (memberRole, isOwner) => {
    if (isOwner) return "badge-purple";
    switch (memberRole) {
      case "admin":
        return "badge-red";
      case "project_manager":
        return "badge-yellow";
      default:
        return "badge-blue";
    }
  };

  const getRoleLabel = (memberRole, isOwner) => {
    if (isOwner) return "Owner / Creator";
    switch (memberRole) {
      case "admin":
        return "Admin";
      case "project_manager":
        return "Project Manager";
      default:
        return "Team Member";
    }
  };

  if ((boardLoading && !currentBoard) || (teamLoading && members.length === 0)) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BoardHeader />

      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search members by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        {/* Invite Trigger */}
        {isManagerOrAdmin && (
          <button
            onClick={() => setInviteModalOpen(true)}
            className="btn-primary !w-auto gap-2 px-5 py-2.5"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Invite Member
          </button>
        )}
      </div>

      {/* Members Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-x-auto bg-white border border-slate-150 rounded-2xl shadow-sm"
      >
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-bold uppercase tracking-wider text-slate-400">
              <th className="py-4.5 px-6">Member Details</th>
              <th className="py-4.5 px-6">Role</th>
              <th className="py-4.5 px-6">Joined Board</th>
              {isManagerOrAdmin && <th className="py-4.5 px-6 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={isManagerOrAdmin ? 4 : 3} className="py-12 text-center text-slate-400">
                  {searchQuery ? "No members match your search criteria." : "No team members found."}
                </td>
              </tr>
            ) : (
              filteredMembers.map((member) => {
                const isOwner = currentBoard?.createdBy?._id === member._id;
                const isCurrentUser = member._id === user?._id;

                return (
                  <tr key={member._id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {member.avatar?.url ? (
                          <img
                            src={member.avatar.url}
                            alt={member.name}
                            className="h-10 w-10 rounded-full border border-slate-200 object-cover shadow-sm"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center text-sm font-semibold text-brand-700">
                            {member.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-800 flex items-center gap-1.5">
                            {member.name}
                            {isCurrentUser && (
                              <span className="text-[10px] bg-slate-100 border px-1.5 py-0.5 rounded text-slate-500 font-semibold uppercase tracking-wide">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400">{member.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className={`badge ${getRoleBadgeClass(member.role, isOwner)} text-[10px] font-semibold uppercase tracking-wider`}>
                        {getRoleLabel(member.role, isOwner)}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-400 font-medium">
                      {member.createdAt ? new Date(member.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : "N/A"}
                    </td>

                    {isManagerOrAdmin && (
                      <td className="py-4 px-6 text-right">
                        {!isOwner && (
                          <button
                            onClick={() => handleRemoveMember(member)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                            title="Remove Member"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </motion.div>

      {/* Invite Member Modal */}
      <InviteMemberModal
        boardId={boardId}
        existingMembers={members}
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
      />
    </div>
  );
};

export default TeamPage;
