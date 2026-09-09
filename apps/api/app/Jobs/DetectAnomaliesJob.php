<?php

namespace App\Jobs;

use App\Models\CommandLog;
use App\Services\DetectAnomaliesService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class DetectAnomaliesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $commandLog;
    protected $DetectAnomaliesService;

    /**
     * Create a new job instance.
     */
    public function __construct(CommandLog $commandLog)
    {
        $this->commandLog = $commandLog;
        $this->DetectAnomaliesService = new DetectAnomaliesService();
    }

    /**
     * Execute the job.
     */
    public function handle(DetectAnomaliesService $service): void
    {
        $result = $service->detect($this->commandLog);

        if ($result && !isset($result['error'])) {
            // The job updates the 'parent' summary record
            $this->commandLog->update([
                'anomaly_score' => $result['anomaly_ratio'], // Total ratio for this batch
                'is_anomaly'    => $result['has_anomaly'],
                'processed_at'  => now(),
            ]);

            if ($result['has_anomaly']) {
                Log::warning("Satellite Anomaly Detected: CommandLog #{$this->commandLog->id}");
                // Optional: Trigger a Real-time notification/Event here for the MCC Dashboard
            }
        } else {
            Log::error("AI Job Failed for Log #{$this->commandLog->id}: " . ($result['message'] ?? 'Unknown error'));
        }  
    }
}
