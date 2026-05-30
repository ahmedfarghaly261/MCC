import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import Tooltip from "../shared/Tooltip";
import {
  Home,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FilePlus,
  Clock,
  History,
  LayoutTemplate,
  BrainCircuit,
  AlertTriangle,
  TerminalIcon,
  SatelliteDish,
  Satellite,
  FileText,
  Activity,
  Code,
} from "lucide-react";

interface NavItem {
  label: string;
  path?: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    label: "Home",
    path: "/",
    icon: <Home size={20} />,
  },
  {
    label: "Command Center",
    icon: <TerminalIcon size={20} />,
    children: [
      {
        label: "Create Command",
        path: "/commands/create",
        icon: <FilePlus size={18} />,
      },
      {
        label: "Scheduled Commands",
        path: "/commands/scheduled",
        icon: <Clock size={18} />,
      },
      {
        label: "Command History",
        path: "/commands/history",
        icon: <History size={18} />,
      },
      {
        label: "Command Templates",
        path: "/commands/templates",
        icon: <LayoutTemplate size={18} />,
      },
      {
        label: "Command Dictionary",
        path: "/commands/dictionary",
        icon: <LayoutTemplate size={18} />,
      }
      , {
        label: "Command Responses",
        path: "/commands/responses",
        icon: <FileText size={18} />,
      }
    ],
  },
  {
   label: "Telemetry Center",
    icon: <Activity size={20} />,
    children: [
      {
        label: "Telemetry Replies",
        path: "/telemetry/replies",
        icon: <FilePlus size={18} />,
      },
    ]
  },
  {
    label: "Satellites",
    icon: <Satellite size={20} />,
    children: [
      {
        label: "Overview",
        path: "/satellites/overview",
        icon: <Satellite size={18} />,
      },
    ],
  },
	{
		label: "Image Center",
		path: "/images",
		icon: <FileText size={20} />,
	},
      {
        label: "Manual Decoder",
        path: "/manual-decoder",
        icon: <Code size={18} />,
      },
  {
    label: "AI Insights",
    path: "/ai-insights",
    icon: <BrainCircuit size={20} />,
  },
  {
    label: "Faults & Diagnostics",
    path: "/faults",
    icon: <AlertTriangle size={20} />,
  },
  {
    label: "Logs",
    path: "/logs",
    icon: <FileText size={20} />,
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >(() =>
    navItems.reduce<Record<string, boolean>>((acc, item) => {
      if (!item.children) {
        return acc;
      }

      acc[item.label] = item.children.some(
        (child) => child.path && location.pathname.startsWith(child.path),
      );

      return acc;
    }, {}),
  );

  const toggleSection = (label: string) => {
    if (collapsed) {
      onToggle();
      setExpandedSections((prev) => ({
        ...prev,
        [label]: true,
      }));
      return; 
    }
    setExpandedSections((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const linkBaseClasses =
    "flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-medium transition-all duration-300 relative group border border-transparent";
  const linkInactiveClasses =
    "text-slate-400 hover:text-slate-100 hover:border-slate-800/60 hover:bg-slate-800/40";
  const linkActiveClasses =
    "text-blue-400 bg-blue-500/10 border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]";

  const subLinkBaseClasses =
    "flex items-center gap-3 pl-11 pr-4 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 border border-transparent";
  const subLinkInactiveClasses =
    "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40";
  const subLinkActiveClasses =
    "text-cyan-400 bg-cyan-500/10 border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]";

  return (
    <aside
      className={`bg-card fixed top-0 left-0 z-40 flex h-screen flex-col border-r border-slate-800/80 shadow-2xl transition-all duration-300 ease-in-out ${
        collapsed ? "w-20 overflow-visible" : "w-65"
      }`}
    >
      {/* Logo  */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-slate-800/80 bg-slate-900/20">
        <div className="flex h-10 w-10 min-w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-transform hover:scale-105">
          <SatelliteDish className="text-blue-400" size={22} />
        </div>
        <div
          className={`flex flex-col justify-center overflow-hidden transition-all duration-300 ${
            collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
          }`}
        >
          <h1 className="text-base font-bold tracking-wider text-slate-100 whitespace-nowrap leading-tight">
            MCCS
          </h1>
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest whitespace-nowrap">
            Mission Control
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav
        className={`flex-1 px-4 py-5 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800/80 hover:scrollbar-thumb-slate-700 ${collapsed ? "overflow-visible" : "overflow-y-auto overflow-x-hidden"}`}
      >
        {navItems.map((item) => {
          if (item.children) {
            const isExpanded =
              !collapsed && (expandedSections[item.label] ?? false);
            const hasActiveChild = item.children.some(
              (child) => child.path && location.pathname.startsWith(child.path),
            );

            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleSection(item.label)}
                  className={`${linkBaseClasses} w-full ${
                    collapsed ? "justify-center px-0" : "justify-between"
                  } ${
                    hasActiveChild
                      ? linkActiveClasses
                      : linkInactiveClasses
                  }`}
                >
                  {/* Left border indicator for active link */}
                  {hasActiveChild && (
                    <span className="absolute left-0 top-1/2 -mt-4 h-8 w-1 rounded-r-lg bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
                  )}
                  <span
                    className={`flex items-center ${collapsed ? "" : "gap-3"}`}
                  >
                    <span className={`min-w-5 flex justify-center transition-colors ${hasActiveChild ? "text-blue-400" : ""}`}>
                      {item.icon}
                    </span>
                    <span
                      className={`overflow-hidden transition-all duration-300 font-medium whitespace-nowrap ${
                        collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                      }`}
                    >
                      {item.label}
                    </span>
                  </span>
                  {!collapsed && (
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  )}
                  {collapsed && <Tooltip label={item.label} />}
                </button>

                {/* Sub-items (hidden when collapsed) */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isExpanded
                      ? "max-h-96 opacity-100 mt-2"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="space-y-1 ml-4 border-l-2 border-slate-800 py-1 pl-3">
                    {item.children.map((child) => (
                      <NavLink
                         key={child.label}
                         to={child.path!}
                         className={({ isActive }) =>
                           `${subLinkBaseClasses} relative ${
                             isActive
                               ? subLinkActiveClasses
                               : subLinkInactiveClasses
                           }`
                         }
                       >
                         {({ isActive }) => (
                           <>
                             {/* Indicator dot for active link */}
                             <span
                               className={`absolute -left-3.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full transition-all duration-300 ${
                                 isActive ? "bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)] opacity-100 scale-100" : "opacity-0 scale-0"
                               }`}
                             />
                             <span className="min-w-4 flex justify-center text-slate-500">
                                {child.icon}
                             </span>
                             {child.label}
                           </>
                         )}
                       </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            );
          }

          // Regular item
          return (
            <NavLink
              key={item.label}
              to={item.path!}
              end={item.path === "/"}
              className={({ isActive }) =>
                `${linkBaseClasses} ${
                  collapsed ? "justify-center px-0" : ""
                } ${isActive ? linkActiveClasses : linkInactiveClasses}`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Left border indicator for active link */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -mt-4 h-8 w-1 rounded-r-lg bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
                  )}
                  <span className={`min-w-5 flex justify-center transition-colors ${isActive ? "text-blue-400" : ""}`}>
                    {item.icon}
                  </span>
                  <span
                    className={`overflow-hidden transition-all duration-300 font-medium whitespace-nowrap ${
                      collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                    }`}
                  >
                    {item.label}
                  </span>
                  {collapsed && <Tooltip label={item.label} />}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Toggle Button */}
      <div className="p-4 bg-slate-900/10 backdrop-blur-sm border-t border-slate-800/80">
        <button
          onClick={onToggle}
          className="group flex w-full items-center justify-center rounded-xl p-3 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/20 transition-all duration-300"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
             <ChevronRight size={20} className="transition-transform group-hover:scale-125 group-hover:translate-x-1" />
          ) : (
             <div className="flex items-center gap-3">
               <ChevronLeft size={20} className="transition-transform group-hover:scale-125 group-hover:-translate-x-1" />
               <span className="text-[13px] font-semibold tracking-wide uppercase">Collapse</span>
             </div>
          )}
        </button>
      </div>

      {/* Subtle bottom gradient line */}
      <div className="h-0.5 bg-linear-to-r from-transparent via-blue-500/30 to-transparent" />
    </aside>
  );
}
