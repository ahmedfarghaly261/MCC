import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import NavBar from "@/components/layout/navBar";
import SatelliteLoading from "@/components/shared/SatelliteLoading";
import { LayoutLoadingContext } from "./layoutLoadingContext";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [isGlobalLoading, setGlobalLoading] = useState(false);

  return (
    <LayoutLoadingContext.Provider value={{ isGlobalLoading, setGlobalLoading }}>
      <div className="flex min-h-screen bg-background">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
        <main
          className={`flex-1 p-6 transition-all duration-300 ${
            collapsed ? "ml-18" : "ml-64"
          }`}
        >
          <NavBar />

          <div className="relative min-h-[calc(100vh-8rem)]">
            <Outlet />

            {isGlobalLoading && (
              <div className="absolute inset-0 z-50 flex items-center justify-center rounded-xl bg-background/85 backdrop-blur-sm">
                <SatelliteLoading />
              </div>
            )}
          </div>
        </main>
      </div>
    </LayoutLoadingContext.Provider>
  );
}
