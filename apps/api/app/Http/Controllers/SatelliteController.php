<?php

namespace App\Http\Controllers;
use App\Services\SatelliteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Exception;

class SatelliteController extends Controller
{
    protected SatelliteService $satelliteService;

    public function __construct(SatelliteService $satelliteService)
    {
        $this->satelliteService = $satelliteService;
    }

    /**
     * Get the list of satellite with their subsystems
     */

    public function index()
    {
        try {
            $satellite = $this->satelliteService->getSatelliteWithSubsystems();

            return response()->json([
                'data' => $satellite,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch satellite subsystems: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the current status, position, and visibility of the satellite.
     */
    public function getStatus(): JsonResponse
    {
        $position = $this->satelliteService->getLatestPosition();
        $lookAngles = $this->satelliteService->getLookAngles();

        if (!$position) {
            return response()->json([
                'status' => 'error',
                'message' => 'Could not retrieve satellite telemetry.'
            ], 503);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'norad_id' => 39444, // Keeping consistent with service
                'position' => $position,
                'visibility' => $lookAngles,
                'is_visible' => $lookAngles['visible'] ?? false,
                'timestamp' => now()->toIso8601String(),
            ]
        ]);
    }

    /**
     * Get prediction for the next available communication window.
     */
    public function getNextPass(): JsonResponse
    {
        try {
            $secondsUntil = $this->satelliteService->getSecondsUntilNextWindow();
            $aosTime = $this->satelliteService->getAosTime();

            return response()->json([
                'status' => 'success',
                'seconds_until_aos' => $secondsUntil,
                'aos_utc' => $aosTime,
                'readable_wait' => now()->addSeconds($secondsUntil)->diffForHumans()
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to predict next pass window.'
            ], 500);
        }
    }

    /**
     * Quick check for real-time visibility (useful for automated tasks).
     */
    public function checkVisibility(): JsonResponse
    {
        $isVisible = $this->satelliteService->isCurrentlyVisible();

        return response()->json([
            'visible' => $isVisible,
            'action' => $isVisible ? 'READY_FOR_UPLINK' : 'WAITING_FOR_AOS'
        ]);
    }
}
