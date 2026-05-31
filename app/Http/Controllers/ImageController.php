<?php

namespace App\Http\Controllers;

use App\Models\Image;
use App\Services\ImageService;
use Illuminate\Http\Request;
use App\Jobs\DetectObjectsJob;
use Illuminate\Support\Facades\Storage;
use Exception;

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
    public function index(Request $request, ImageService $service)
    {
        $images = $service->listImages($request->integer('per_page', 20));

        return response()->json([
            'status' => 'success',
            'data'   => $images->map(fn($img) => $service->formatImage($img)),
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
    public function show($id, ImageService $service)
    {
        try {
            $image = $service->findImage($id);

            return response()->json([
                'status' => 'success',
                'data'   => $service->formatImage($image),
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status'  => 'error',
                'message' => "Image with ID {$id} not found."
            ], 404);
        }
    }

    /**
     * @group Image Processing
     *
     * Get all images for a command log
     *
     * Returns every image linked to the given command_log_id.
     */
    public function byCommandLog($logId, ImageService $service)
    {
        $images = $service->getImagesByCommandLog($logId);

        if ($images->isEmpty()) {
            return response()->json([
                'status'  => 'error',
                'message' => "No images found for command log #{$logId}",
            ], 404);
        }

        return response()->json([
            'status'         => 'success',
            'command_log_id' => $logId,
            'count'          => $images->count(),
            'data'           => $images->map(fn($img) => $service->formatImage($img)),
        ]);
    }

    /**
     * @group Image Processing
     *
     * Delete an image record and its files from disk
     */
    public function destroy($id, ImageService $service)
    {
        $service->deleteImage($id);

        return response()->json([
            'status'  => 'success',
            'message' => "Image #{$id} deleted.",
        ]);
    }

    /**
     * @group Image Processing
     *
     * Detect objects in an image (Async Job)
     *
     * Dispatches a background job that sends the image to FastAPI,
     * processing DOTA and building detection models.
     */
    public function detectObjects(Request $request, $id, ImageService $service)
    {
        $image = $service->findImage($id);

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

        DetectObjectsJob::dispatch($image->id, $options);

        return response()->json([
            'status'  => 'success',
            'message' => "Object detection job has been successfully dispatched for image #{$id}.",
            'target'  => $service->formatImage($image),
        ], 202);
    }

    /**
     * @group Image Processing
     *
     * Get detections by Image ID
     *
     * Returns the annotated image download URL and raw detection breakdown data.
     */
    public function getDetections($id, ImageService $service)
    {
        $image = $service->findImage($id);

        if (!$image->detected_obj_path && !$image->detections) {
            return response()->json([
                'status'  => 'processing',
                'message' => 'Object detection analysis is still running in the background or failed.',
            ], 202);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $service->formatDetections($image),
        ]);
    }

    /**
     * @group Image Processing
     *
     * Generate an automated panorama from a single seed image ID.
     */
    public function generateAutomationPanorama(Request $request, ImageService $service)
    {
        $request->validate([
            'image_id' => 'required|integer|exists:images,id'
        ]);

        try {
            $result = $service->generatePanorama($request->input('image_id'));

            return response()->json([
                'status'       => 'success',
                'message'      => $result['message'],
                'panorama_id'  => $result['panorama_id'],
                'download_url' => $result['download_url'],
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @group Image Processing
     *
     * Get all panorama images
     *
     * Returns every panorama image record with pagination.
     */
    public function getPanoramas(Request $request, ImageService $service)
    {
        $panoramas = $service->getPanoramas($request->integer('per_page', 20));

        if ($panoramas->isEmpty()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'No panorama images found.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $panoramas->map(fn($img) => $service->formatPanorama($img)),
            'meta'   => [
                'total'        => $panoramas->total(),
                'per_page'     => $panoramas->perPage(),
                'current_page' => $panoramas->currentPage(),
                'last_page'    => $panoramas->lastPage(),
            ],
        ]);
    }
}
