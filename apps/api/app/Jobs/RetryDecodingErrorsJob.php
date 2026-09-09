<?php

namespace App\Jobs;

use App\Models\CommandLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class RetryDecodingErrorsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle()
    {
        Log::info("Starting retry decoding errors job");

        $failedLogs = CommandLog::where('status', 'decoding_error')
            ->where('decoding_retry_count', '<', 3) // Max 3 retries
            ->where('created_at', '>', now()->subDays(7))
            ->get();

        foreach ($failedLogs as $log) {
            try {
                // Get the raw hex data from command replies
                $reply = $log->replies()->first();
                $rawHex = $reply ? $reply->reply_data : null;
                
                if (!$rawHex) {
                    Log::warning("No reply data found for command log ID: {$log->id}, skipping retry.");
                    continue;
                }
                
                if (strlen($rawHex) < 18) {
                    Log::info("Skipping retry for short frame (ACK/NACK) for command log ID: {$log->id}, raw data: {$rawHex}");
                    continue;
                }

                // For now, satellite ID is hardcoded to 1 (as in your current system)
                // TODO: Add satellite_id to commands table and command_logs table
                $satelliteId = 1;
                
                Log::info("Retrying decoding for command log ID: {$log->id}");

                // Update retry tracking
                $log->update([
                    'decoding_retry_count' => $log->decoding_retry_count + 1,
                    'last_decoding_retry_at' => now(),
                    'status' => 'retrying_decoding'
                ]);

                // Dispatch the original decoding job
                DecodeTelemetryJob::dispatch($rawHex, $satelliteId, $log->id);
                
            } catch (\Exception $e) {
                Log::error("Failed to retry decoding for command log {$log->id}: " . $e->getMessage());
            }
        }

        Log::info("Completed retry decoding errors job. Processed {$failedLogs->count()} failed logs.");
    }
}
