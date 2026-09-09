<?php

namespace App\Http\Controllers;

use App\Models\Command;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\CommandLog;
use App\Services\TelemetryService;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelemetryController extends Controller
{
    protected string $decoderUrl;

    public function __construct(
        private readonly TelemetryService $telemetryService
    ) {
        $this->decoderUrl = config('services.decoder.url');
    }

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


    /**
     * Single frame decoding.
     */
    public function decode(Request $request)
    {
        $validated = $request->validate([
            'hex_frame'   => 'required|string|min:112', // Minimum 112 hex chars
            'frame_index' => 'integer|min:0',
            'captured_at' => 'nullable|string',
            'station'     => 'nullable|string',
        ]);

        try {
            $response = Http::post("{$this->decoderUrl}/decode", $validated);

            if ($response->failed()) {
                return response()->json([
                    'error' => 'Decoder service error',
                    'details' => $response->json()
                ], $response->status());
            }

            return $response->json();
        } catch (\Exception $e) {
            Log::error("Telemetry Decode Failed: " . $e->getMessage());
            return response()->json(['error' => 'Could not connect to decoder service'], 503);
        }
    }

    /**
     *  Batch decoding.
     */
    public function decodeBatch(Request $request)
    {
        $request->validate([
            'frames'               => 'required|array|max:500', // Max 500 frames
            'frames.*.hex_frame'   => 'required|string|min:112',
            'frames.*.frame_index' => 'required|integer',
        ]);

        try {
            $response = Http::post("{$this->decoderUrl}/decode/batch", [
                'frames' => $request->input('frames')
            ]);

            return $response->json();
        } catch (\Exception $e) {
            Log::error("Telemetry Batch Failed: " . $e->getMessage());
            return response()->json(['error' => 'Batch processing unavailable'], 503);
        }
    }
}
