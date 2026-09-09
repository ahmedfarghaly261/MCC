<?php

namespace App\Jobs;

use App\Models\Image;
use App\Services\ImageService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use ZipArchive;

class DetectObjectsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected int $imageId;
    protected array $options;

    public function __construct(int $imageId, array $options = [])
    {
        $this->imageId = $imageId;
        $this->options = $options;
    }

    public function handle(ImageService $imageService): void
    {
        $image = Image::find($this->imageId);

        if (!$image || !$image->original_path) {
            return;
        }

        try {
            // 1. Fetch the raw ZIP archive binary payload from FastAPI
            $zipBinary = $imageService->detectObjects($image->original_path, $this->options);

            $originalName = pathinfo($image->original_path, PATHINFO_FILENAME);

            // 2. Optional: If you still want to save the complete .zip file itself to storage
            $zipStoragePath = 'satellite_images/detections/' . $originalName . '_results.zip';
            Storage::disk('public')->put($zipStoragePath, $zipBinary);

            // 3. Open the zip from a temporary local folder to pull individual files
            $tempZipFile = tempnam(sys_get_temp_dir(), 'sat_zip_');
            file_put_contents($tempZipFile, $zipBinary);

            $zip = new ZipArchive;
            if ($zip->open($tempZipFile) === TRUE) {
                $jsonPayload = null;
                $annotatedBinary = null;

                for ($i = 0; $i < $zip->numFiles; $i++) {
                    $filename = $zip->getNameIndex($i);

                    // Grab the raw JSON structure
                    if (str_ends_with($filename, '_detections.json')) {
                        $jsonPayload = json_decode($zip->getFromIndex($i), true);
                    } 
                    // Grab the raw annotated photo bytes
                    elseif (str_ends_with($filename, '_annotated.png')) {
                        $annotatedBinary = $zip->getFromIndex($i);
                    }
                }
                $zip->close();
                unlink($tempZipFile); // Clean up temp file

                $detectedobjPath = null;

                // 4. Save the annotated image asset to public storage disk
                if ($annotatedBinary) {
                    $detectedobjPath = 'satellite_images/detections/' . $originalName . '_annotated.png';
                    Storage::disk('public')->put($detectedobjPath, $annotatedBinary);
                }

                // 5. Update Database Record with your new schema columns
                $image->update([
                    'detected_obj_path' => $detectedobjPath, // Path to the annotated image
                    'detections'       => $jsonPayload,     // Stores the whole payload dictionary
                ]);
            }
        } catch (\Exception $e) {
            logger()->error("Failed processing object detection for Image #{$this->imageId}: " . $e->getMessage());
            throw $e;
        }
    }
}