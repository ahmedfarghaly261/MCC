import { Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import CreateCommand from "@/pages/command/sendCommand/createCommand";
import LogPage from "@/pages/logPage/logpage";
import CommandDictionary from "@/pages/command/commandDictionary/CommandDictionary";
import CommandResponses from "@/pages/command/commandResponses/CommandResponses";
import CommandHistoryView from "@/pages/command/commandHistory/commandHistoryView";
import TelemetryRepliesView from "@/pages/telemetry/telemetryReplies/telemetryRepliesView";
import ManualDecoder from "@/pages/ManualDecoder/manualDecoderView";
import SatelliteOverviewView from "@/pages/satellite/satelliteOverview/satelliteOverview.view";
import NotFound from "@/components/layout/NotFound";
import FaultsDiagnosticsView from "@/pages/faults-diagnostics/FaultsDiagnosticsView";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />

        {/* Command Center */}
        <Route path="/commands/create" element={<CreateCommand />} />
        <Route path="/commands/history" element={<CommandHistoryView />} />
        <Route path="/commands/dictionary" element={<CommandDictionary />} />
        <Route path="/commands/responses" element={<CommandResponses />} />

        {/* Telemetry */}
        <Route path="/telemetry/replies" element={<TelemetryRepliesView />} />
        <Route path="/telemetry-replies/:commandLogId" element={<TelemetryRepliesView />} />

        {/* Manual Decoder */}
        <Route path="/manual-decoder" element={<ManualDecoder />} />

        {/* Satellites */}
        <Route path="/satellites/overview" element={<SatelliteOverviewView />} />
        
        {/* Logs */}
        <Route path="/logs" element={<LogPage />} />
        {/* Faults & Diagnostics */}
        <Route path="/faults" element={<FaultsDiagnosticsView />} />
        {/* Future routes */}

        {/* <Route path="/commands/scheduled" element={<ScheduledCommands />} /> */}
        {/* <Route path="/commands/templates" element={<CommandTemplates />} /> */}
        {/* <Route path="/ai-insights" element={<AIInsights />} /> */}
        {/* <Route path="/faults" element={<Faults />} /> */}

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
