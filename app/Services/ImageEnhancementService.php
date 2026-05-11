<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Client\ConnectionException;

class ImageEnhancementService
{
    protected string $Url;

    public function __construct()
    {
        $this->Url = config('services.enhancement_api.url');
    }

    public function enhanceInternalFile(string $relativePath)
    {
        // 1. Locate the file in your storage/app/public
        if (!Storage::disk('public')->exists($relativePath)) {
            throw new \Exception("Source image not found: " . $relativePath);
        }

        // 2. Get the physical path for the stream
        $fullPath = Storage::disk('public')->path($relativePath);
        $fileStream = fopen($fullPath, 'r');

        try {
            // 3. Perform the internal upload to FastAPI
            $response = Http::timeout(120) // Satellite processing takes time
                ->attach(
                    'file',           // The key FastAPI expects
                    $fileStream,      // The file resource
                    basename($relativePath)
                )
                ->post("{$this->Url}/enhance");

            if ($response->successful()) {
                return $response->body(); // The enhanced PNG binary
            }

            throw new \Exception("FastAPI Processing Error: " . $response->status());
        } catch (ConnectionException $e) {
            throw new \Exception("FastAPI service is unreachable on port 8001.");
        } finally {
            if (is_resource($fileStream)) {
                fclose($fileStream);
            }
        }
    }
}
