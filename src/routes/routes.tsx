import { Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import CreateCommand from "@/pages/command/sendCommand/createCommand";
import LogPage from "@/pages/logPage/logpage";
import CommandDictionary from "@/pages/command/commandDictionary/CommandDictionary";
import CommandResponses from "@/pages/command/commandResponses/CommandResponses";
import CommandHistoryView from "@/pages/command/commandHistory/commandHistoryView";
import TelemetryRepliesView from "@/pages/telemetry/telemetryReplies/telemetryRepliesView";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />

        {/* Command Center */}
        <Route path="/commands/create" element={<CreateCommand />} />
        <Route path="/commands/history" element={<CommandHistoryView />} />
        <Route path="/logs" element={<LogPage />} />
        <Route path="/commands/dictionary" element={<CommandDictionary />} />
        <Route path="/commands/responses" element={<CommandResponses />} />
        <Route path="/telemetry/replies" element={<TelemetryRepliesView />} />


        {/* Future routes */}

        {/* <Route path="/commands/scheduled" element={<ScheduledCommands />} /> */}
        {/* <Route path="/commands/templates" element={<CommandTemplates />} /> */}
        {/* <Route path="/ai-insights" element={<AIInsights />} /> */}
        {/* <Route path="/faults" element={<Faults />} /> */}

        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Route>
    </Routes>
  );
}
