<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SatelliteService
{
    protected $baseUrl;
    protected $noradId = 39444;

    // Ground Station Coordinates (Cairo, Egypt example)
    protected $gsLat = 30.0444;
    protected $gsLng = 31.2357;
    protected $gsAlt = 20; // Meters above sea level

    public function __construct()
    {
        $this->baseUrl = config('services.satellite.url', 'http://host.docker.internal:8080');
    }

    /**
     * Fetches current Lat/Lng/Alt of the satellite.
     */
    public function getLatestPosition()
    {
        try {
            $response = Http::get("{$this->baseUrl}/telemetry", [
                'norad' => $this->noradId
            ]);

            return $response->successful() ? $response->json() : null;
        } catch (\Exception $e) {
            Log::error("Satellite Telemetry Error: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Checks if the satellite is above the minimum elevation (e.g., 10 degrees).
     */
    public function isCurrentlyVisible()
    {
        try {
            $response = Http::get("{$this->baseUrl}/visibility", [
                'norad' => $this->noradId,
                'lat'   => $this->gsLat,
                'lng'   => $this->gsLng,
                'alt'   => $this->gsAlt,
            ]);

            if ($response->successful()) {
                // The API should return { "visible": true, "elevation": 45.2 }
                return $response->json('visible', false);
            }

            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Predicts the wait time until the next AOS (Acquisition of Signal).
     */
    public function getSecondsUntilNextWindow()
    {
        $response = Http::get("{$this->baseUrl}/next-pass", [
            'norad' => $this->noradId,
            'lat'   => $this->gsLat,
            'lng'   => $this->gsLng,
        ]);

        if ($response->successful()) {
            $seconds = $response->json('seconds_until');

            // If no pass found in 24h, retry in 1 hour
            if ($seconds === null) {
                return 3600;
            }

            // Return the seconds, but add a 5-second "safety buffer" 
            // to ensure the satellite is actually above the horizon when the job wakes up.
            return (int)$seconds + 5;
        }

        return 60; // Retry after 1 min if API fails
    }

    public function getLookAngles()
    {
        $response = Http::get("{$this->baseUrl}/visibility", [
            'norad' => $this->noradId,
            'lat'   => $this->gsLat,
            'lng'   => $this->gsLng,
        ]);

        if ($response->successful()) {
            return [
                'visible'   => $response->json('visible'),
                'elevation' => $response->json('elevation_deg'),
                'azimuth'   => $response->json('azimuth_deg'),
                'range'     => $response->json('range_km'),
            ];
        }

        return null;
    }

    public function getAosTime()
    {
        $response = Http::get("{$this->baseUrl}/next-pass", [
            'norad' => $this->noradId,
            'lat'   => $this->gsLat,
            'lng'   => $this->gsLng,
        ]);

        return $response->json('aos_utc'); // Returns ISO8601 string
    }
}
