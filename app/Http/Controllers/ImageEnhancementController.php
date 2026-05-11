<?php

namespace App\Http\Controllers;

use App\Services\ImageEnhancementService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ImageEnhancementController extends Controller
{
    /**
     * @group Image Processing
     * 
     * Enhance an image
     * 
     * This endpoint takes a path to an existing image and processes it.
     */
    public function enhanceImage(Request $request,  ImageEnhancementService $service)
    {
        // Expecting JSON: { "image_path": "uploads/2026/satellite_01.jpg" }
        $request->validate([
            'image_path' => 'required|string'
        ]);

        try {
            // 1. Send the internal file to the Python service
            $enhancedBinary = $service->enhanceInternalFile($request->image_path);

            // 2. Prepare the new filename
            $originalName = pathinfo($request->image_path, PATHINFO_FILENAME);
            $savePath = 'enhanced/' . $originalName . '_processed.png';

            // 3. Store the result
            Storage::disk('public')->put($savePath, $enhancedBinary);

            return response()->json([
                'status' => 'success',
                'original_path' => $request->image_path,
                'enhanced_path' => $savePath,
                'download_url' => asset('storage/' . $savePath)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
