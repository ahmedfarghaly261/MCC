<?php

namespace App\Http\Controllers;

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
    public function showTelemetryByCommandLog(CommandLog $commandLog): JsonResponse
    {
        $data = $this->telemetryService->getByCommandLog($commandLog);

        return response()->json($data);
    }

}
