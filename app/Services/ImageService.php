<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Client\ConnectionException;
use Exception;

class ImageService
{
    protected string $enhancementUrl;
    protected string $detectionUrl;

    public function __construct()
    {
        $this->enhancementUrl = config('services.enhancement_api.url'); 
        $this->detectionUrl = config('services.object_detection_api.url', 'http://127.0.0.1:8000');
    }
    public function enhanceInternalFile(string $relativePath)
    {
        if (!Storage::disk('public')->exists($relativePath)) {
            throw new Exception("Source image not found: " . $relativePath);
        }
        $fullPath = Storage::disk('public')->path($relativePath);
        $fileStream = fopen($fullPath, 'r');

        try {
            $response = Http::timeout(120) 
                ->attach(
                    'file',          
                    $fileStream,     
                    basename($relativePath)
                )
                ->post("{$this->enhancementUrl}/enhance");

            if ($response->successful()) {
                return $response->body(); 
            }

            throw new Exception("FastAPI Processing Error: " . $response->status());
        } catch (ConnectionException $e) {
            throw new Exception("FastAPI service is unreachable on port 8001.");
        } finally {
            if (is_resource($fileStream)) {
                fclose($fileStream);
            }
        }
    }

    /**
     * Call FastAPI to run object detection.
     * Returns the raw ZIP archive binary payload.
     */
    public function detectObjects(string $relativePath, array $options = []): string
    {
        if (!Storage::disk('public')->exists($relativePath)) {
            throw new Exception("Satellite image not found: " . $relativePath);
        }

        $fullPath = Storage::disk('public')->path($relativePath);
        $fileStream = fopen($fullPath, 'r');

        // Setup query flags matching your FastAPI spec
        $queryParams = array_merge([
            'run_dota'      => 'true',
            'run_buildings' => 'true',
            'dota_conf'     => 0.2,
            'building_conf' => 0.25,
        ], $options);

        try {
            $response = Http::timeout(180)
                ->attach(
                    'file', 
                    $fileStream,
                    basename($relativePath)
                )
                ->post("{$this->detectionUrl}/predict", $queryParams);

            if ($response->successful()) {
                return $response->body(); 
            }

            throw new Exception("FastAPI Detection Error Code: " . $response->status());
        } catch (ConnectionException $e) {
            throw new Exception("FastAPI Object Detection Service unreachable on " . $this->detectionUrl);
        } finally {
            if (is_resource($fileStream)) {
                fclose($fileStream);
            }
        }
    }
}
