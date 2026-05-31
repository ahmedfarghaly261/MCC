<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Client\ConnectionException;
use Exception;
use App\Models\Image;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Exception\ConnectException;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class ImageService
{
    protected string $enhancementUrl;
    protected string $detectionUrl;
    protected string $panoramaUrl;

    public function __construct()
    {
        $this->enhancementUrl = config('services.enhancement_api.url');
        $this->detectionUrl   = config('services.object_detection_api.url');
        $this->panoramaUrl    = config('services.panorama_api.url');
    }

    // -------------------------------------------------------------------------
    // Image CRUD
    // -------------------------------------------------------------------------

    /**
     * Paginate all images ordered by newest first.
     */
    public function listImages(int $perPage = 20): \Illuminate\Pagination\LengthAwarePaginator
    {
        return Image::query()
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Find a single image by ID or throw ModelNotFoundException.
     */
    public function findImage($id): Image
    {
        return Image::findOrFail($id);
    }

    /**
     * Return all images linked to a given command log, newest first.
     */
    public function getImagesByCommandLog(int $logId): \Illuminate\Database\Eloquent\Collection
    {
        return Image::where('command_log_id', $logId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Delete the image record and its physical file from disk.
     */
    public function deleteImage($id): void
    {
        $image = Image::findOrFail($id);

        if ($image->original_path && file_exists($image->original_path)) {
            unlink($image->original_path);
        }

        $image->delete();
    }

    // -------------------------------------------------------------------------
    // Enhancement
    // -------------------------------------------------------------------------

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

    // -------------------------------------------------------------------------
    // Object Detection
    // -------------------------------------------------------------------------

    /**
     * Call FastAPI to run object detection.
     * Returns the raw ZIP archive binary payload.
     */
    public function detectObjects(string $relativePath, array $options = []): string
    {
        if (!Storage::disk('public')->exists($relativePath)) {
            throw new Exception("Satellite image not found: " . $relativePath);
        }

        $fullPath   = Storage::disk('public')->path($relativePath);
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

    /**
     * Collect sibling tiles for the given seed image, stitch them via FastAPI,
     * persist the result, and record it in the database.
     *
     * @return array{message: string, panorama_id: int, download_url: string}
     * @throws Exception
     */
    public function generatePanorama($seedImageId): array
    {
        $seedImage = Image::findOrFail($seedImageId);
        $seedMeta  = $seedImage->meta_data;

        if (empty($seedMeta) || !isset($seedMeta['image_source'])) {
            throw new Exception(
                'The selected seed image does not have an "image_source" identifier in its metadata.'
            );
        }

        $sourceSession = $seedMeta['image_source'];

        $siblingImages = Image::where('meta_data->image_source', $sourceSession)->get();

        if ($siblingImages->count() < 2) {
            throw new Exception(
                "Only found {$siblingImages->count()} tile for source '{$sourceSession}'. " .
                    "At least 2 tiles are required to stitch a panorama."
            );
        }

        $imagesData    = [];
        $collectedIds  = [];

        foreach ($siblingImages as $imageRecord) {
            $meta        = $imageRecord->meta_data;
            $pixelBounds = $meta['pixel'] ?? null;

            if (!$pixelBounds || !isset($pixelBounds['x1'], $pixelBounds['y1'], $pixelBounds['x2'], $pixelBounds['y2'])) {
                Log::warning("Skipping image #{$imageRecord->id} during panorama creation: missing nested pixel bounds.");
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
        Storage::disk('public')->put($savePath, $stitchedBinary);

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
            'message'      => "Successfully auto-collected " . count($collectedIds) . " tiles for session '{$sourceSession}' and stitched panorama.",
            'panorama_id'  => $panoramaImage->id,
            'download_url' => asset('storage/' . ltrim($savePath, '/')),
        ];
    }

    /**
     * Send tile files to the FastAPI stitching endpoint and return the raw image binary.
     */
    public function stitchPanorama(array $imagesData): string
    {
        $metadataArray = [];
        $multipart     = [];
        $openHandles   = [];

        foreach ($imagesData as $item) {
            $metadataArray[] = [
                'x1' => (int) $item['x1'],
                'y1' => (int) $item['y1'],
                'x2' => (int) $item['x2'],
                'y2' => (int) $item['y2'],
            ];
        }

        $multipart[] = [
            'name'     => 'metadata',
            'contents' => json_encode($metadataArray),
        ];

        foreach ($imagesData as $item) {
            $imagePath = $item['image_path'];

            if (!Storage::disk('public')->exists($imagePath)) {
                throw new Exception("Source tile image not found: " . $imagePath);
            }

            $fullPath      = Storage::disk('public')->path($imagePath);
            $handle        = fopen($fullPath, 'r');
            $openHandles[] = $handle;

            $multipart[] = [
                'name'     => 'files',
                'contents' => $handle,
                'filename' => basename($imagePath),
            ];
        }

        try {
            $client   = new Client(['timeout' => 300]);
            $response = $client->post("{$this->panoramaUrl}/stitch", ['multipart' => $multipart]);

            $body        = (string) $response->getBody();
            $contentType = $response->getHeaderLine('Content-Type');

            if (str_contains($contentType, 'application/json')) {
                $errData = json_decode($body, true);
                if (isset($errData['error'])) {
                    throw new Exception("FastAPI Processing Rejected: " . $errData['error']);
                }
            }

            return $body;
        } catch (ConnectException $e) {
            throw new Exception("FastAPI Panorama Service unreachable: " . $this->panoramaUrl);
        } catch (RequestException $e) {
            $responseBody = $e->hasResponse()
                ? (string) $e->getResponse()->getBody()
                : $e->getMessage();

            throw new Exception(
                "FastAPI Panorama Engine Error: " . $e->getResponse()->getStatusCode() . " - " . $responseBody
            );
        } finally {
            foreach ($openHandles as $handle) {
                if (is_resource($handle)) {
                    fclose($handle);
                }
            }
        }
    }

    /**
     * Paginate panorama images ordered by newest first.
     */
    public function getPanoramas(int $perPage = 20): \Illuminate\Pagination\LengthAwarePaginator
    {
        return Image::where('meta_data->type', 'automated_panorama')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    // -------------------------------------------------------------------------
    // Formatters  (public so the controller can call them)
    // -------------------------------------------------------------------------

    public function formatImage(Image $image): array
    {
        return [
            'id'                => $image->id,
            'command_log_id'    => $image->command_log_id,
            'original_path'     => $image->original_path,
            'original_url'      => $this->resolveDownloadUrl($image->original_path),
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
            'detected_obj_path' => $image->detected_obj_path,
            'detected_obj_url'  => $this->resolveDownloadUrl($image->detected_obj_path),
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
        if (!$path) return null;

        return asset('storage/' . ltrim($path, '/'));
    }
}
