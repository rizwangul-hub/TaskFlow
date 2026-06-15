import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ROUTES } from "../../utils/constants.js";

const ServerError = () => {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="text-center"
      >
        {/* Animated Icon */}
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
        >
          <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </motion.div>

        {/* Error Code */}
        <h1 className="mt-6 font-display text-8xl font-black tracking-tight text-slate-300 dark:text-slate-800">
          500
        </h1>

        {/* Title */}
        <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 sm:text-3xl">
          Something Went Wrong
        </h2>

        {/* Message */}
        <p className="mx-auto mt-3 max-w-md text-sm text-slate-500 dark:text-slate-400">
          An unexpected error occurred on our server. We are looking into it right now. Please try again or head back to the dashboard.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 active:scale-98"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.22 8.567m-11.19.869L9 9v5l5-5" />
            </svg>
            Reload Page
          </button>
          
          <Link
            to={ROUTES.HOME}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/30 active:scale-98"
          >
            Back Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ServerError;
