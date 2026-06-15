const SkeletonCard = ({ className = "" }) => {
  return (
    <div className={`animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}>
      {/* Badge or Meta row */}
      <div className="flex gap-2">
        <div className="h-5 w-16 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-5 w-10 rounded bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* Title */}
      <div className="mt-3.5 h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />

      {/* Description lines */}
      <div className="mt-3 space-y-2">
        <div className="h-3.5 w-full rounded bg-slate-100 dark:bg-slate-800/60" />
        <div className="h-3.5 w-5/6 rounded bg-slate-100 dark:bg-slate-800/60" />
      </div>

      {/* Footer divider */}
      <div className="my-4 border-t border-slate-100 dark:border-slate-800/50" />

      {/* Assignee / Dates Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="h-3.5 w-20 rounded bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
};

export default SkeletonCard;
