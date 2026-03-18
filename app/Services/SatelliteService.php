<?php
namespace App\Services;

use Illuminate\Support\Facades\Http;

class SatelliteService
{
    protected $baseUrl;

    public function __construct()
    {
        $this->baseUrl = config('services.satellite.url', 'http://127.0.0.1:8000');
    }

    public function getLatestPosition(int $noradId = 39444)
    {
        $response = Http::get("{$this->baseUrl}/telemetry", ['norad' => $noradId]);
        return $response->json(); // Returns the position and TLE source
    }
}