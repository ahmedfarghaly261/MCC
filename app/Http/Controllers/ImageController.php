<?php

namespace App\Http\Controllers;

use App\Models\Image;
use App\Services\ImageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Jobs\DetectObjectsJob;


class ImageController extends Controller
{
    /**
     * @group Image Processing
     *
     * Enhance an image
     *
     * This endpoint takes a path to an existing image and processes it.
     */
    public function enhanceImage(Request $request, ImageService $service)
    {
        $request->validate([
            'image_path' => 'required|string'
        ]);

        try {
            $enhancedBinary = $service->enhanceInternalFile($request->image_path);

            $originalName = pathinfo($request->image_path, PATHINFO_FILENAME);
            $savePath = 'satellite_images/enhanced/' . $originalName . '_processed.png';

            Storage::disk('public')->put($savePath, $enhancedBinary);

            return response()->json([
                'status'        => 'success',
                'original_path' => $request->image_path,
                'enhanced_path' => $savePath,
                'download_url'  => asset('storage/' . ltrim($savePath, '/')),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @group Image Processing
     *
     * List all images
     *
     * Returns every image record with its original path and metadata.
     */
    public function index(Request $request)
    {
        $images = Image::query()
            ->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 20));

        return response()->json([
            'status' => 'success',
            'data'   => $images->map(fn($img) => $this->formatImage($img)),
            'meta'   => [
                'total'        => $images->total(),
                'per_page'     => $images->perPage(),
                'current_page' => $images->currentPage(),
                'last_page'    => $images->lastPage(),
            ],
        ]);
    }

    /**
     * @group Image Processing
     *
     * Get a single image by ID
     */
    public function show(int $id)
    {
        $image = Image::findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data'   => $this->formatImage($image),
        ]);
    }

    /**
     * @group Image Processing
     *
     * Get all images for a command log
     *
     * Returns every image linked to the given command_log_id.
     */
    public function byCommandLog(int $logId)
    {
        $images = Image::where('command_log_id', $logId)
            ->orderBy('created_at', 'desc')
            ->get();

        if ($images->isEmpty()) {
            return response()->json([
                'status'  => 'error',
                'message' => "No images found for command log #{$logId}",
            ], 404);
        }

        return response()->json([
            'status'          => 'success',
            'command_log_id'  => $logId,
            'count'           => $images->count(),
            'data'            => $images->map(fn($img) => $this->formatImage($img)),
        ]);
    }

    /**
     * @group Image Processing
     *
     * Delete an image record and its files from disk
     */
    public function destroy(int $id)
    {
        $image = Image::findOrFail($id);

        // Remove physical files if they exist
        foreach (['original_path'] as $field) {
            if ($image->$field && file_exists($image->$field)) {
                unlink($image->$field);
            }
        }

        $image->delete();

        return response()->json([
            'status'  => 'success',
            'message' => "Image #{$id} deleted.",
        ]);
    }

    // Private helpers

    private function formatImage(Image $image): array
    {
        return [
            'id'              => $image->id,
            'command_log_id'  => $image->command_log_id,
            'original_path'   => $image->original_path,
            'download_url'    => $this->resolveDownloadUrl($image->original_path),
            'created_at'      => $image->created_at?->toISOString(),
        ];
    }

    private function resolveDownloadUrl(?string $path): ?string
    {
        if (!$path) return null;

        return asset('storage/' . ltrim($path, '/'));
    }

    /**
     * @group Image Processing
     *
     * Detect objects in an image (Async Job)
     *
     * Dispatches a background job that sends the image to FastAPI,
     * processing DOTA and building detection models.
     */
    public function detectObjects(Request $request, int $id)
    {
        // 1. Ensure image asset exists
        $image = Image::findOrFail($id);

        // 2. Optional parameters to overwrite confidence scales on-demand
        $request->validate([
            'run_dota'      => 'nullable|string|in:true,false',
            'run_buildings' => 'nullable|string|in:true,false',
            'dota_conf'     => 'nullable|numeric|between:0,1',
            'building_conf' => 'nullable|numeric|between:0,1',
        ]);

        $options = array_filter([
            'run_dota'      => $request->input('run_dota'),
            'run_buildings' => $request->input('run_buildings'),
            'dota_conf'     => $request->input('dota_conf'),
            'building_conf' => $request->input('building_conf'),
        ], fn($value) => !is_null($value));

        // 3. Dispatch Background processing job
        DetectObjectsJob::dispatch($image->id, $options);

        return response()->json([
            'status'  => 'success',
            'message' => "Object detection job has been successfully dispatched for image #{$id}.",
            'target'  => $this->formatImage($image)
        ], 202); // 202 Accepted means request received for asynchronous batch handling
    }

    /**
     * @group Image Processing
     *
     * Get detections by Image ID
     *
     * Returns the annotated image download URL and raw detection breakdown data.
     */
    public function getDetections(int $id)
    {
        $image = Image::findOrFail($id);

        // Check if the background job has written any data yet
        if (!$image->detected_obj_path && !$image->detections) {
            return response()->json([
                'status'  => 'processing',
                'message' => 'Object detection analysis is still running in the background or failed.'
            ], 202);
        }

        return response()->json([
            'status' => 'success',
            'data'   => [
                'id'                 => $image->id,
                'command_log_id'     => $image->command_log_id,
                'original_path'      => $image->original_path,
                'original_url'       => $this->resolveDownloadUrl($image->original_path),
                'enhanced_path'      => $image->enhanced_path,
                'enhanced_url'       => $this->resolveDownloadUrl($image->enhanced_path),
                'detected_obj_path'   => $image->detected_obj_path,
                'detected_obj_url'    => $this->resolveDownloadUrl($image->detected_obj_path),
                'elapsed_seconds'    => $image->detections['elapsed_seconds'] ?? null,
                'description'        => $image->detections['description'] ?? '',
                'summary'            => $image->detections['summary'] ?? null,
                'detections'         => $image->detections['detections'] ?? null,
                'created_at'         => $image->created_at?->toISOString(),
            ]
        ]);
    }
}