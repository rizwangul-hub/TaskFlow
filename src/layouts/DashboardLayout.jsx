import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar.jsx";
import Navbar from "../components/dashboard/Navbar.jsx";
import { AnimatePresence, motion } from "framer-motion";

const DashboardLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">
      {/* ─── Desktop Fixed Sidebar ─── */}
      <aside className="hidden w-64 md:block h-full shrink-0">
        <Sidebar />
      </aside>

      {/* ─── Mobile Sidebar Drawer ─── */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={toggleMobileSidebar}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Sidebar panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", ease: "easeInOut", duration: 0.25 }}
              className="relative flex w-full max-w-xs flex-col"
            >
              {/* Close Button Inside Drawer Header */}
              <div className="absolute right-4 top-4 z-10">
                <button
                  onClick={toggleMobileSidebar}
                  className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus:outline-none"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <Sidebar onClose={toggleMobileSidebar} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Main Viewport ─── */}
      <div className="flex flex-1 flex-col overflow-hidden h-full">
        {/* Sticky Header Navbar */}
        <Navbar onMenuToggle={toggleMobileSidebar} />

        {/* Dynamic Page Scroll Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full w-full max-w-7xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
