import UserMenu from "./UserMenu.jsx";

const Navbar = ({ onMenuToggle }) => {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md md:px-8">
      {/* Left: Mobile Menu Toggler & Search */}
      <div className="flex items-center gap-4 flex-1">
        <button
          type="button"
          onClick={onMenuToggle}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-50 md:hidden focus:outline-none"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Search Input Placeholder */}
        <div className="relative hidden max-w-xs w-full sm:block">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search boards or tasks..."
            disabled
            className="w-full rounded-xl border border-slate-100 bg-slate-50/50 py-2 pl-9 pr-4 text-xs text-slate-600 outline-none transition focus:border-brand-500 focus:bg-white placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right: Notifications & UserMenu dropdown */}
      <div className="flex items-center gap-4">
        {/* Notification Icon */}
        <button
          type="button"
          className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-50 focus:outline-none"
        >
          <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {/* Notification Badge dot */}
          <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-brand-500 border border-white" />
        </button>

        {/* Vertical divider */}
        <span className="h-6 w-[1px] bg-slate-100" />

        {/* Profile User Menu Dropdown */}
        <UserMenu />
      </div>
    </header>
  );
};

export default Navbar;
