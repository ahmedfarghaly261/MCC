<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use App\Models\Image;
use Exception;

class ImageService
{
    protected string $enhancementUrl;
    protected string $detectionUrl;
    protected string $panoramaUrl;
    protected string $disk;

    public function __construct()
    {
        $this->enhancementUrl = config('services.enhancement_api.url');
        $this->detectionUrl   = config('services.object_detection_api.url');
        $this->panoramaUrl    = config('services.panorama_api.url');
        $this->disk           = 'public'; // Abstracted disk config
    }

    // -------------------------------------------------------------------------
    // Image CRUD
    // -------------------------------------------------------------------------

    public function listImages(int $perPage = 20): LengthAwarePaginator
    {
        return Image::query()
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function findImage($id): Image
    {
        return Image::findOrFail($id);
    }

    public function getImagesByCommandLog(int $logId): Collection
    {
        return Image::where('command_log_id', $logId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Safely delete the image record and its physical file using Storage drivers.
     */
    public function deleteImage($id): void
    {
        $image = Image::findOrFail($id);

        if ($image->original_path && Storage::disk($this->disk)->exists($image->original_path)) {
            Storage::disk($this->disk)->delete($image->original_path);
        }

        // Clean up enhanced/detected files if they exist
        if ($image->enhanced_path && Storage::disk($this->disk)->exists($image->enhanced_path)) {
            Storage::disk($this->disk)->delete($image->enhanced_path);
        }

        $image->delete();
    }

    // -------------------------------------------------------------------------
    // Enhancement
    // -------------------------------------------------------------------------

    public function enhanceInternalFile(string $relativePath): string
    {
        if (!Storage::disk($this->disk)->exists($relativePath)) {
            throw new Exception("Source image not found: " . $relativePath);
        }

        $fullPath = Storage::disk($this->disk)->path($relativePath);
        $fileStream = fopen($fullPath, 'r');

        try {
            $response = Http::timeout(120) 
                ->attach('file', $fileStream, basename($relativePath))
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

    // -------------------------------------------------------------------------
    // Object Detection
    // -------------------------------------------------------------------------

    public function detectObjects(string $relativePath, array $options = []): string
    {
        if (!Storage::disk($this->disk)->exists($relativePath)) {
            throw new Exception("Satellite image not found: " . $relativePath);
        }

        $fullPath   = Storage::disk($this->disk)->path($relativePath);
        $fileStream = fopen($fullPath, 'r');

        $queryParams = array_merge([
            'run_dota'      => 'true',
            'run_buildings' => 'true',
            'dota_conf'     => 0.2,
            'building_conf' => 0.25,
        ], $options);

        try {
            $response = Http::timeout(180)
                ->attach('file', $fileStream, basename($relativePath))
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

    // -------------------------------------------------------------------------
    // Panorama
    // -------------------------------------------------------------------------

    public function generatePanorama($seedImageId): array
    {
        $seedImage = Image::findOrFail($seedImageId);
        $seedMeta  = $seedImage->meta_data;

        if (empty($seedMeta) || !isset($seedMeta['image_source'])) {
            throw new Exception('The selected seed image does not have an "image_source" identifier.');
        }

        $sourceSession = $seedMeta['image_source'];
        $siblingImages = Image::where('meta_data->image_source', $sourceSession)->get();

        if ($siblingImages->count() < 2) {
            throw new Exception("Only found {$siblingImages->count()} tile. Need >= 2 to stitch.");
        }

        $imagesData  = [];
        $collectedIds = [];

        foreach ($siblingImages as $imageRecord) {
            $pixelBounds = $imageRecord->meta_data['pixel'] ?? null;

            if (!$pixelBounds || !isset($pixelBounds['x1'], $pixelBounds['y1'], $pixelBounds['x2'], $pixelBounds['y2'])) {
                Log::warning("Skipping image #{$imageRecord->id}: missing nested pixel bounds.");
                continue;
            }

            $imagesData[] = [
                'image_path' => $imageRecord->original_path,
                'x1'         => (int) $pixelBounds['x1'],
                'y1'         => (int) $pixelBounds['y1'],
                'x2'         => (int) $pixelBounds['x2'],
                'y2'         => (int) $pixelBounds['y2'],
            ];

            $collectedIds[] = $imageRecord->id;
        }

        $stitchedBinary = $this->stitchPanorama($imagesData);

        $filename = 'panorama_' . $sourceSession . '_' . time() . '.jpg';
        $savePath = 'satellite_images/panoramas/' . $filename;
        
        Storage::disk($this->disk)->put($savePath, $stitchedBinary);

        $panoramaImage = Image::create([
            'original_path'  => $savePath,
            'command_log_id' => null,
            'meta_data'      => [
                'type'            => 'automated_panorama',
                'image_source'    => $sourceSession,
                'component_tiles' => $collectedIds,
                'tiles_count'     => count($collectedIds),
            ],
        ]);

        return [
            'message'      => "Successfully auto-collected " . count($collectedIds) . " tiles and stitched panorama.",
            'panorama_id'  => $panoramaImage->id,
            'download_url' => $this->resolveDownloadUrl($savePath),
        ];
    }

    /**
     * Completely rewritten using uniform Laravel HTTP attachments instead of raw Guzzle handles.
     */
    public function stitchPanorama(array $imagesData): string
    {
        $metadataArray = [];
        $fileHandles   = [];
        
        // Build the native HTTP client builder
        $request = Http::timeout(300);

        foreach ($imagesData as $item) {
            $metadataArray[] = [
                'x1' => (int) $item['x1'], 'y1' => (int) $item['y1'],
                'x2' => (int) $item['x2'], 'y2' => (int) $item['y2'],
            ];

            $imagePath = $item['image_path'];
            if (!Storage::disk($this->disk)->exists($imagePath)) {
                throw new Exception("Source tile image not found: " . $imagePath);
            }

            $fullPath      = Storage::disk($this->disk)->path($imagePath);
            $handle        = fopen($fullPath, 'r');
            $fileHandles[] = $handle;

            // Build sequential multi-file payload matching FastAPI standard array notation
            $request->attach('files', $handle, basename($imagePath));
        }

        // Attach metadata string payload
        $request->attach('metadata', json_encode($metadataArray));

        try {
            $response = $request->post("{$this->panoramaUrl}/stitch");
            $body     = $response->body();

            if (str_contains($response->header('Content-Type'), 'application/json')) {
                $errData = $response->json();
                if (isset($errData['error'])) {
                    throw new Exception("FastAPI Processing Rejected: " . $errData['error']);
                }
            }

            if (!$response->successful()) {
                throw new Exception("FastAPI Engine Error: Status Code " . $response->status());
            }

            return $body;
        } catch (ConnectionException $e) {
            throw new Exception("FastAPI Panorama Service unreachable: " . $this->panoramaUrl);
        } finally {
            foreach ($fileHandles as $handle) {
                if (is_resource($handle)) {
                    fclose($handle);
                }
            }
        }
    }

    public function getPanoramas(int $perPage = 20): LengthAwarePaginator
    {
        return Image::where('meta_data->type', 'automated_panorama')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    // -------------------------------------------------------------------------
    // Formatters
    // -------------------------------------------------------------------------

    public function formatImage(Image $image): array
    {
        return [
            'id'                => $image->id,
            'command_log_id'    => $image->command_log_id,
            'original_path'     => $image->original_path,
            'download_url'      => $this->resolveDownloadUrl($image->original_path),
            'enhanced_path'     => $image->enhanced_path,
            'enhanced_url'      => $this->resolveDownloadUrl($image->enhanced_path),
            'detected_obj_path' => $image->detected_obj_path,
            'detected_obj_url'  => $this->resolveDownloadUrl($image->detected_obj_path),
            'detections'        => $image->detections,
            'meta_data'         => $image->meta_data,
            'created_at'        => $image->created_at?->toISOString(),
        ];
    }

    public function formatDetections(Image $image): array
    {
        return [
            'id'               => $image->id,
            'command_log_id'   => $image->command_log_id,
            'original_path'    => $image->original_path,
            'original_url'     => $this->resolveDownloadUrl($image->original_path),
            'enhanced_path'    => $image->enhanced_path,
            'enhanced_url'     => $this->resolveDownloadUrl($image->enhanced_path),
            'detected_obj_path'=> $image->detected_obj_path,
            'detected_obj_url' => $this->resolveDownloadUrl($image->detected_obj_path),
            'elapsed_seconds'  => $image->detections['elapsed_seconds'] ?? null,
            'description'      => $image->detections['description']     ?? '',
            'summary'          => $image->detections['summary']         ?? null,
            'detections'       => $image->detections['detections']      ?? null,
            'created_at'       => $image->created_at?->toISOString(),
        ];
    }

    public function formatPanorama(Image $image): array
    {
        $meta = $image->meta_data ?? [];

        return [
            'id'              => $image->id,
            'download_url'    => $this->resolveDownloadUrl($image->original_path),
            'original_path'   => $image->original_path,
            'image_source'    => $meta['image_source']    ?? null,
            'component_tiles' => $meta['component_tiles'] ?? [],
            'tiles_count'     => $meta['tiles_count']     ?? 0,
            'created_at'      => $image->created_at?->toISOString(),
        ];
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private function resolveDownloadUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        // Fallback safety if full URL already persists inside path string
        if (filter_var($path, FILTER_VALIDATE_URL)) {
            return $path;
        }

        /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk($this->disk);

        return $disk->url($path);
    }
}