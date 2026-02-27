import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  CalendarRange,
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
    label: "Mission Planning",
    path: "/mission-planning",
    icon: <CalendarRange size={20} />,
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
    ],
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
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  const commandCenterItem = navItems.find((item) => item.children);
  const isCommandChildActive = commandCenterItem?.children?.some(
    (child) => child.path && location.pathname.startsWith(child.path),
  );

  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    "Command Center": isCommandChildActive ?? false,
  });

  const toggleSection = (label: string) => {
    if (collapsed) return; 
    setExpandedSections((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const linkBaseClasses =
    "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 relative group";
  const linkInactiveClasses =
    "text-slate-400 hover:text-white hover:bg-white/5";
  const linkActiveClasses =
    "text-white bg-primary/20 border border-primary/30 shadow-[0_0_12px_rgba(59,130,246,0.15)]";

  const subLinkBaseClasses =
    "flex items-center gap-3 pl-11 pr-4 py-2.5 rounded-lg text-sm transition-all duration-200";
  const subLinkInactiveClasses =
    "text-slate-400 hover:text-white hover:bg-white/5";
  const subLinkActiveClasses =
    "text-white bg-primary/20 border border-primary/30 shadow-[0_0_12px_rgba(59,130,246,0.15)]";

  // Tooltip component
  const Tooltip = ({ label }: { label: string }) => (
    <div className="absolute left-full ml-3 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg shadow-xl border border-white/10 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
      {label}
      <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 border-l border-b border-white/10 rotate-45" />
    </div>
  );

  return (
    <aside
      className={`fixed top-0 left-0 z-40 flex h-screen flex-col border-r border-white/5 bg-[#0a0f1e] transition-all duration-300 ease-in-out ${
        collapsed ? "w-[72px] overflow-visible" : "w-64"
      }`}
    >
      {/* Logo  */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-white/5">
        <div className="flex h-10 w-10 min-w-[40px] items-center justify-center rounded-xl bg-primary/20 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
          <SatelliteDish  className="text-primary" size={22} />
        </div>
        <div
          className={`overflow-hidden transition-all duration-300 ${
            collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
          }`}
        >
          <h1 className="text-base font-bold tracking-wide text-white whitespace-nowrap">
            MCCS
          </h1>
          <p className="text-xs text-slate-400 whitespace-nowrap">
            Mission Control
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav
        className={`flex-1 px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-white/10 ${collapsed ? "overflow-visible" : "overflow-y-auto overflow-x-hidden"}`}
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
                      ? "text-white"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span
                    className={`flex items-center ${collapsed ? "" : "gap-3"}`}
                  >
                    <span className="min-w-[20px] flex justify-center">
                      {item.icon}
                    </span>
                    <span
                      className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${
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
                      ? "max-h-96 opacity-100 mt-1"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="space-y-0.5 ml-1 border-l border-white/10 pl-2">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.label}
                        to={child.path!}
                        className={({ isActive }) =>
                          `${subLinkBaseClasses} ${
                            isActive
                              ? subLinkActiveClasses
                              : subLinkInactiveClasses
                          }`
                        }
                      >
                        {child.icon}
                        {child.label}
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
              <span className="min-w-[20px] flex justify-center">
                {item.icon}
              </span>
              <span
                className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${
                  collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                }`}
              >
                {item.label}
              </span>
              {collapsed && <Tooltip label={item.label} />}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Toggle Button */}
      <div className="border-t border-white/5 p-3">
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center rounded-lg py-2.5 text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </aside>
  );
}
