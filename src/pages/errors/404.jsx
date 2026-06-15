import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ROUTES } from "../../utils/constants.js";

const PageNotFound = () => {
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
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-brand-50 text-brand-600 dark:bg-brand-950/30 dark:text-brand-400"
        >
          <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </motion.div>

        {/* Error Code */}
        <h1 className="mt-6 font-display text-8xl font-black tracking-tight text-slate-300 dark:text-slate-800">
          404
        </h1>

        {/* Title */}
        <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 sm:text-3xl">
          Page Not Found
        </h2>

        {/* Message */}
        <p className="mx-auto mt-3 max-w-md text-sm text-slate-500 dark:text-slate-400">
          The page you are looking for doesn't exist or has been moved to another URL. Let's get you back on track.
        </p>

        {/* Action Button */}
        <div className="mt-8">
          <Link
            to={ROUTES.HOME}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/30 active:scale-98"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default PageNotFound;
