<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Client\ConnectionException;

class ImageService
{
    protected string $Url;

    public function __construct()
    {
        $this->Url = config('services.enhancement_api.url');
    }

    public function enhanceInternalFile(string $relativePath)
    {
        if (!Storage::disk('public')->exists($relativePath)) {
            throw new \Exception("Source image not found: " . $relativePath);
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
                ->post("{$this->Url}/enhance");

            if ($response->successful()) {
                return $response->body(); 
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
