import { Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import DashboardView from "@/pages/dashboard/dashboardView";
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
import ImageIndexView from "@/pages/imageCenter/index/imageIndex.view";
import DetectionResultsView from "@/pages/imageCenter/objectDetection/composables/DetectionResultsView";
import PanoramaResultsView from "@/pages/imageCenter/panorama/composables/PanoramaResultsView";
import EnhancedResultView from "@/pages/imageCenter/enhancedImages/composables/EnhancedResultView";
import ScheduledCommandsView from "@/pages/command/scheduledCommands/scheduledCommandsView";
import AtcCommandView from "@/pages/command/atcCommand/Atccommandview";
import RegistrationView from "@/pages/auth/registration/registrationView";
import TwoFactorView from "@/pages/auth/twoFactor/twoFactorView";
import LoginView from "@/pages/auth/login/loginView";
import ProfileView from "@/pages/profile/profileView";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/auth/Registration" element={<RegistrationView />} />
      <Route path="/auth/login" element={<LoginView />} />
      <Route path="/2fa-setup" element={<TwoFactorView />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardView />} />
          <Route path="/profile" element={<ProfileView />} />

        {/* Command Center */}
        <Route path="/command-center" element={<CreateCommand />} />
        <Route path="/commands/create" element={<CreateCommand />} />
        <Route path="/commands/history" element={<CommandHistoryView />} />
        <Route path="/dictionary" element={<CommandDictionary />} />
        <Route path="/commands/dictionary" element={<CommandDictionary />} />
        <Route path="/command-responses" element={<CommandResponses />} />
        <Route path="/commands/responses" element={<CommandResponses />} />

        {/* Telemetry */}
        <Route path="/telemetry" element={<TelemetryRepliesView />} />
        <Route path="/telemetry-replies" element={<TelemetryRepliesView />} />
        <Route path="/telemetry/replies" element={<TelemetryRepliesView />} />
        <Route
          path="/telemetry-replies/:commandLogId"
          element={<TelemetryRepliesView />}
        />

        {/* Manual Decoder */}
        <Route path="/manual-decoder" element={<ManualDecoder />} />

        {/* Satellites */}
        <Route
          path="/satellites/overview"
          element={<SatelliteOverviewView />}
        />

        {/* Image Center */}
        <Route path="/images" element={<ImageIndexView />} />
        <Route
          path="/images/detection/:id"
          element={<DetectionResultsView />}
        />
        <Route path="/images/enhanced/:id" element={<EnhancedResultView />} />
        <Route path="/images/panoramas" element={<PanoramaResultsView />} />

        {/* Logs */}
        <Route path="/mission-logs" element={<LogPage />} />
        <Route path="/logs" element={<LogPage />} />
        {/* Faults & Diagnostics */}
        <Route path="/anomaly-detection" element={<FaultsDiagnosticsView />} />
        <Route path="/faults" element={<FaultsDiagnosticsView />} />
        {/* Future routes */}
        <Route path="/commands/scheduled" element={<ScheduledCommandsView />} />
        <Route path="/commands/atc" element={<AtcCommandView />} />
        {/* <Route path="/commands/scheduled" element={<ScheduledCommands />} /> */}
        {/* <Route path="/commands/templates" element={<CommandTemplates />} /> */}
        {/* <Route path="/ai-insights" element={<AIInsights />} /> */}
        {/* <Route path="/faults" element={<Faults />} /> */}

        <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}
