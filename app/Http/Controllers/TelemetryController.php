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

    //Get telemetry data by satellite ID

    /**
     * Get last telemetry data for a satellite
     *  */
    public function GetLastTelemetry(): JsonResponse
    {
        try {
            $satelliteId = 1; //placeholder for now, will be dynamic later
            $commandLog = CommandLog::whereHas('telemetryLogs', function ($query) use ($satelliteId) {
                $query->where('satellite_id', $satelliteId);
            })->latest()->first();
            if (!$commandLog) {
                return response()->json([
                    'message' => 'No telemetry data found for the satellite.',
                ], 404);
            }
            $data = $this->telemetryService->getTelemetryByCommandLog($commandLog, $satelliteId);
            return response()->json($data);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch telemetry data: ' . $e->getMessage(),
            ], 400);
        }
    }
}
