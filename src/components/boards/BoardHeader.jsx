import { Link, useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { ROUTES } from "../../utils/constants.js";

const BoardHeader = () => {
  const { boardId } = useParams();
  const location = useLocation();
  const { currentBoard } = useSelector((state) => state.boards);

  if (!currentBoard) return null;

  const tabs = [
    {
      id: "kanban",
      label: "Kanban Board",
      path: `/boards/${boardId}`,
      icon: (
        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
      ),
    },
    {
      id: "tasks",
      label: "Tasks List",
      path: `/boards/${boardId}/tasks`,
      icon: (
        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
    },
    {
      id: "team",
      label: "Team Members",
      path: `/boards/${boardId}/team`,
      icon: (
        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-4 border-b border-slate-200/60 pb-1 mb-6 bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
      {/* ─── Breadcrumbs & Board Meta ─── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Link to={ROUTES.BOARDS} className="hover:text-brand-600 transition">
              Boards
            </Link>
            <span>/</span>
            <span className="text-slate-600 truncate max-w-[150px]">{currentBoard.title}</span>
          </div>

          <div className="flex items-center gap-3 pt-1">
            {currentBoard.image?.url && (
              <img
                src={currentBoard.image.url}
                className="h-9 w-9 rounded-xl object-cover border border-slate-100 shadow-sm"
                alt=""
              />
            )}
            <h2 className="font-display text-xl font-extrabold text-slate-800 md:text-2xl tracking-tight">
              {currentBoard.title}
            </h2>
          </div>

          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
            {currentBoard.description || "Manage tasks, columns, and team members to track project milestones."}
          </p>
        </div>

        {/* Board Info (e.g. Creator details) */}
        <div className="flex items-center gap-2 text-xs text-slate-400 self-start md:self-center">
          <span className="bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 text-slate-500 font-medium">
            Owner: <strong className="font-bold text-slate-700">{currentBoard.createdBy?.name || "System"}</strong>
          </span>
          <span className="bg-brand-50 border border-brand-100 rounded-lg px-2.5 py-1 text-brand-700 font-medium">
            Members: <strong className="font-bold text-brand-800">{currentBoard.members?.length || 0}</strong>
          </span>
        </div>
      </div>

      {/* ─── Navigation Tabs ─── */}
      <div className="flex border-b border-slate-100 pt-2 w-full">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path || 
            (tab.id === "tasks" && location.pathname.includes("/tasks") && !location.pathname.endsWith("/members") && !location.pathname.endsWith("/team"));
          
          return (
            <Link
              key={tab.id}
              to={tab.path}
              className={`flex items-center gap-2 py-3 px-4 text-sm font-bold border-b-2 -mb-[2px] transition-all duration-150 ${
                isActive
                  ? "border-brand-600 text-brand-600 font-extrabold"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BoardHeader;
