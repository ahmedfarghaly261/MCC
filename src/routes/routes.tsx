import { Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import CreateCommand from "@/pages/command/sendCommand/createCommand";
import LogPage from "@/pages/logPage/logpage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />

        {/* Command Center */}
        <Route path="/commands/create" element={<CreateCommand />} />
        <Route path="/logs" element={<LogPage />} />

        {/* Future routes */}

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
