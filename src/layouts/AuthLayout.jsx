import { motion } from "framer-motion";
import { Outlet } from "react-router-dom";

/** Decorative floating orb */
const Orb = ({ className }) => (
  <div aria-hidden className={`orb ${className}`} />
);

/** Feature bullet shown on the decorative left panel */
const Feature = ({ icon, text }) => (
  <div className="flex items-start gap-3">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-base">
      {icon}
    </div>
    <p className="text-sm text-white/80 leading-snug">{text}</p>
  </div>
);

const AuthLayout = () => {
  return (
    <div className="auth-gradient relative flex min-h-screen">
      {/* ── Decorative orbs ── */}
      <Orb className="left-[-10%] top-[-10%] h-96 w-96 bg-brand-400/30" />
      <Orb className="right-[-5%] bottom-[-5%] h-80 w-80 bg-accent-500/20" />
      <Orb className="left-[30%] top-[60%] h-64 w-64 bg-brand-300/15" />

      {/* ── Left branding panel (hidden on mobile) ── */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 hidden lg:flex lg:w-[45%] xl:w-[42%] flex-col justify-between p-12"
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 shadow-lg">
            <span className="text-base font-black text-white font-display">TF</span>
          </div>
          <span className="text-xl font-bold text-white font-display tracking-tight">TaskFlow</span>
        </div>

        {/* Hero copy */}
        <div className="space-y-6">
          <div>
            <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.1] font-display">
              Ship faster,<br />
              <span className="text-brand-300">together.</span>
            </h2>
            <p className="mt-4 text-base text-white/70 max-w-xs leading-relaxed">
              TaskFlow gives your team one place to plan, track, and collaborate — from sprint boards to release day.
            </p>
          </div>

          <div className="space-y-4">
            <Feature icon="✦" text="Kanban boards with real-time drag & drop" />
            <Feature icon="✦" text="Role-based access for teams of any size" />
            <Feature icon="✦" text="Instant notifications and activity feeds" />
            <Feature icon="✦" text="Detailed analytics and burndown charts" />
          </div>
        </div>

        {/* Social proof */}
        <div className="rounded-2xl border border-white/15 bg-white/8 backdrop-blur-sm p-5">
          <p className="text-sm text-white/80 italic leading-relaxed">
            "TaskFlow cut our sprint planning time in half. Our engineers love it."
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-300 to-accent-400 flex items-center justify-center text-xs font-bold text-white">
              AS
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Alex Stevens</p>
              <p className="text-xs text-white/50">CTO, Luminary Labs</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Right form panel ── */}
      <div className="relative z-10 flex flex-1 items-center justify-center p-4 sm:p-8 lg:bg-white/5 lg:backdrop-blur-none">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
