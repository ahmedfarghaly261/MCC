<?php

namespace App\Http\Controllers;

use App\Models\Command;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\CommandLog;
use App\Services\TelemetryService;

class TelemetryController extends Controller
{
    public function __construct(
        private readonly TelemetryService $telemetryService
    ) {}

    /**
     * Get telemetry data by command log
     *  */
    public function showTelemetryByCommandLog(int  $commandLog): JsonResponse
    {
        $commandLog = CommandLog::find($commandLog);
        if (!$commandLog) {
            return response()->json([
                'message' => 'Command log not found.',
            ], 404);
        }
        $satelliteId = $commandLog->telemetryLogs()->value('satellite_id');
        if (!$satelliteId) {
            return response()->json([
                'message'        => 'No telemetry data available yet.',
                'command_log_id' => $commandLog->id,
            ], 404);
        }
        $data = $this->telemetryService->getTelemetryByCommandLog($commandLog, $satelliteId);
        return response()->json($data);
    }
}
