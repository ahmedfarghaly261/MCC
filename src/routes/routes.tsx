import { Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />

        {/* Future routes */}
        {/* <Route path="/telemetry" element={<TelemetryMonitoring />} /> */}
        {/* <Route path="/mission-planning" element={<MissionPlanning />} /> */}
        {/* <Route path="/commands/create" element={<CreateCommand />} /> */}
        {/* <Route path="/commands/scheduled" element={<ScheduledCommands />} /> */}
        {/* <Route path="/commands/history" element={<CommandHistory />} /> */}
        {/* <Route path="/commands/templates" element={<CommandTemplates />} /> */}
        {/* <Route path="/ai-insights" element={<AIInsights />} /> */}
        {/* <Route path="/faults" element={<Faults />} /> */}

        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Route>
    </Routes>
  );
}
