<?php

namespace App\Http\Controllers;

use App\Models\AnomalyExplaination;
use Illuminate\Http\JsonResponse;
use Exception;

class AnomalyExplainationController extends Controller
{
    /**
     * Get all anomaly explanations.
     */
    public function index(): JsonResponse
    {
        try {
            $explanations = AnomalyExplaination::with('commandLog')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($explanations);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch anomaly explanations: ' . $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get anomaly explanation by command log id.
     */
    public function showByCommandLog(int $commandLog): JsonResponse
    {
        try {
            $explanation = AnomalyExplaination::with('commandLog')
                ->where('command_log_id', $commandLog)
                ->firstOrFail();

            return response()->json($explanation);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch anomaly explanation: ' . $e->getMessage(),
            ], 400);
        }
    }
}
