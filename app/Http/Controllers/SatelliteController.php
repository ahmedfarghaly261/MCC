<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\SatelliteService;

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
}
