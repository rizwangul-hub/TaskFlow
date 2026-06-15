const SkeletonTable = ({ rows = 5, cols = 4, className = "" }) => {
  return (
    <div className={`w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}>
      {/* Table Header */}
      <div className="flex border-b border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/60">
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={i}
            className="flex-1"
            style={{ marginRight: i === cols - 1 ? 0 : "24px" }}
          >
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        ))}
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex px-6 py-4.5 items-center">
            {Array.from({ length: cols }).map((_, c) => (
              <div
                key={c}
                className="flex-1"
                style={{ marginRight: c === cols - 1 ? 0 : "24px" }}
              >
                {c === 0 ? (
                  /* Leading content with circle indicator */
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                  </div>
                ) : c === cols - 1 ? (
                  /* Trailing action loader */
                  <div className="ml-auto h-7 w-16 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
                ) : (
                  /* Muted metadata loader */
                  <div className="h-3.5 w-20 animate-pulse rounded bg-slate-100 dark:bg-slate-800/60" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonTable;
