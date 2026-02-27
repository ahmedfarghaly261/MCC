import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />
      <main
        className={`flex-1 p-6 transition-all duration-300 ${
          collapsed ? "ml-[72px]" : "ml-64"
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
}
