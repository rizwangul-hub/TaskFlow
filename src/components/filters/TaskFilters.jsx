import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const STATUS_OPTIONS = [
  { value: "todo", label: "To Do", color: "bg-slate-100 text-slate-700 border-slate-200" },
  { value: "in_progress", label: "In Progress", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "review", label: "Review", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "done", label: "Done", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low", color: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" },
  { value: "medium", label: "Medium", color: "bg-sky-50 text-sky-700 border-sky-200", dot: "bg-sky-500" },
  { value: "high", label: "High", color: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  { value: "critical", label: "Critical", color: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" },
];

const SORT_OPTIONS = [
  { value: "createdAt", label: "Created Date" },
  { value: "dueDate", label: "Due Date" },
  { value: "priority", label: "Priority" },
];

const ORDER_OPTIONS = [
  { value: "desc", label: "Descending", icon: "↓" },
  { value: "asc", label: "Ascending", icon: "↑" },
];

const FilterChip = ({ label, color, active, onClick }) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    type="button"
    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
      active
        ? color + " shadow-sm ring-1 ring-offset-1"
        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800"
    }`}
  >
    {label}
    {active && (
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    )}
  </motion.button>
);

const TaskFilters = ({ members = [], className = "" }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);

  const currentStatus = searchParams.get("status") || "";
  const currentPriority = searchParams.get("priority") || "";
  const currentAssignee = searchParams.get("assignedTo") || "";
  const currentSort = searchParams.get("sortBy") || "createdAt";
  const currentOrder = searchParams.get("order") || "desc";

  const setParam = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      next.delete("page");
      return next;
    });
  };

  const toggleStatus = (value) => setParam("status", currentStatus === value ? "" : value);
  const togglePriority = (value) => setParam("priority", currentPriority === value ? "" : value);

  const clearAllFilters = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("status");
      next.delete("priority");
      next.delete("assignedTo");
      next.delete("sortBy");
      next.delete("order");
      next.delete("page");
      return next;
    });
  };

  const hasActiveFilters = currentStatus || currentPriority || currentAssignee || currentSort !== "createdAt" || currentOrder !== "desc";

  const selectedMember = members.find((m) => m._id === currentAssignee);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}
    >
      <div className="flex flex-wrap items-start gap-6">
        {/* Status Filter */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Status</p>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <FilterChip
                key={opt.value}
                label={opt.label}
                color={opt.color}
                active={currentStatus === opt.value}
                onClick={() => toggleStatus(opt.value)}
              />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="hidden h-auto w-px self-stretch bg-slate-100 md:block" />

        {/* Priority Filter */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Priority</p>
          <div className="flex flex-wrap gap-2">
            {PRIORITY_OPTIONS.map((opt) => (
              <FilterChip
                key={opt.value}
                label={
                  <span className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${opt.dot}`} />
                    {opt.label}
                  </span>
                }
                color={opt.color}
                active={currentPriority === opt.value}
                onClick={() => togglePriority(opt.value)}
              />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="hidden h-auto w-px self-stretch bg-slate-100 md:block" />

        {/* Assignee Filter */}
        {members.length > 0 && (
          <div className="relative">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Assigned To</p>
            <button
              type="button"
              id="assignee-filter-btn"
              onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-all ${
                currentAssignee
                  ? "border-brand-300 bg-brand-50 text-brand-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {selectedMember ? (
                <>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                    {selectedMember.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate">{selectedMember.name}</span>
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Any Member</span>
                </>
              )}
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <AnimatePresence>
              {showAssigneeDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full z-20 mt-1 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
                >
                  <div
                    className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm text-slate-500 hover:bg-slate-50"
                    onClick={() => { setParam("assignedTo", ""); setShowAssigneeDropdown(false); }}
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-slate-300 text-slate-400">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    Any Member
                  </div>
                  {members.map((member) => (
                    <div
                      key={member._id}
                      className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => { setParam("assignedTo", member._id); setShowAssigneeDropdown(false); }}
                    >
                      {member.avatar?.url ? (
                        <img src={member.avatar.url} alt={member.name} className="h-7 w-7 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                          {member.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="truncate">{member.name}</span>
                      {currentAssignee === member._id && (
                        <svg className="ml-auto h-4 w-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Divider */}
        <div className="hidden h-auto w-px self-stretch bg-slate-100 md:block" />

        {/* Sort Options */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Sort By</p>
          <div className="flex flex-wrap gap-2">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setParam("sortBy", opt.value)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                  currentSort === opt.value
                    ? "border-brand-300 bg-brand-50 text-brand-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
            {/* Order toggle */}
            <button
              type="button"
              onClick={() => setParam("order", currentOrder === "asc" ? "desc" : "asc")}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-all hover:bg-slate-50"
            >
              {currentOrder === "asc" ? "↑ Ascending" : "↓ Descending"}
            </button>
          </div>
        </div>
      </div>

      {/* Active filters summary + Clear */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400">Active filters:</span>
              {currentStatus && (
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  Status: {STATUS_OPTIONS.find(s => s.value === currentStatus)?.label}
                </span>
              )}
              {currentPriority && (
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  Priority: {PRIORITY_OPTIONS.find(p => p.value === currentPriority)?.label}
                </span>
              )}
              {currentAssignee && selectedMember && (
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  Assigned: {selectedMember.name}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs font-medium text-rose-500 hover:text-rose-700 transition-colors"
            >
              Clear all
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside handler */}
      {showAssigneeDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowAssigneeDropdown(false)}
        />
      )}
    </motion.div>
  );
};

export default TaskFilters;
