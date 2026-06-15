import { motion } from "framer-motion";

/**
 * AuthCard — glass-morphism card wrapping all auth forms.
 * Adds entrance animation, branded logo mark, title & subtitle.
 */
const AuthCard = ({ title, subtitle, children, footer }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="card w-full max-w-md"
    >
      {/* Brand mark */}
      <div className="mb-7 flex flex-col items-center text-center">
        <div
          className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg shadow-brand-600/25"
          style={{
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          }}
        >
          {/* Checkmark icon */}
          <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="white" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 text-sm text-slate-500 max-w-xs">{subtitle}</p>
        )}
      </div>

      {/* Form content */}
      {children}

      {/* Footer */}
      {footer && (
        <div className="mt-6 border-t border-slate-100 pt-5 text-center text-sm">
          {footer}
        </div>
      )}
    </motion.div>
  );
};

export default AuthCard;
