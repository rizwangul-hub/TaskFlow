import { motion } from "framer-motion";
import Loader from "./Loader.jsx";

const PageLoader = ({ message = "Loading TaskFlow..." }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-md dark:bg-slate-950/80"
    >
      <div className="flex flex-col items-center gap-4">
        {/* Floating app icon look */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 font-display text-2xl font-black text-white shadow-xl shadow-brand-500/20"
        >
          TF
        </motion.div>

        {/* Custom Loader */}
        <Loader size="md" color="brand" className="mt-2" />

        {/* Text loading message */}
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="font-display text-sm font-semibold tracking-wide text-slate-600 dark:text-slate-300"
        >
          {message}
        </motion.p>
      </div>
    </motion.div>
  );
};

export default PageLoader;
