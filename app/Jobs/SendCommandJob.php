<?php

namespace App\Jobs;

use App\Models\Command;
use App\Models\CommandLog;
use App\Models\CommandReply;
use App\Services\CommandService;
use App\Services\SatelliteService;
use App\Jobs\DecodeTelemetryJob;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendCommandJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;   // We handle retries manually via re-dispatch
    public int $timeout = 30;

    public function __construct(
        public readonly int $commandId,
        public readonly int $dest,
        public readonly array $data,
        public readonly int $logId,
    ) {}

    public function handle(CommandService $commandService, SatelliteService $satelliteService): void
    {
        $log = CommandLog::findOrFail($this->logId);
        $command = Command::findOrFail($this->commandId);

        // // --- Visibility Check ---
        // if (!$satelliteService->isCurrentlyVisible()) {
        //     $secondsUntilWindow = $satelliteService->getSecondsUntilNextWindow();

        //     Log::info("Satellite not visible. Command log #{$log->id} will retry in {$secondsUntilWindow}s.");

        //     $log->update(['status' => 'waiting_for_aos']);

        //     // Re-dispatch itself after the next AOS window
        //     self::dispatch(
        //         $this->commandId,
        //         $this->dest,
        //         $this->data,
        //         $this->logId,
        //     )->delay(now()->addSeconds($secondsUntilWindow));

        //     return;
        // }

        // --- Satellite is visible, proceed ---
        try {
            $binaryFrame = $commandService->buildCsspFrame($command->cmd_id, $this->dest, $this->data);

            $log->update([
                'raw_binary_sent' => bin2hex($binaryFrame),
                'status'          => 'pending',
                'sent_at'         => now(),
            ]);

            $response = $commandService->sendToGateway($binaryFrame, $command->name);

            if ($response === 'Hi Sent Successfully') {
                $log->update(['status' => 'sent']);
                return;
            }

            if (!$response) {
                $log->update(['status' => 'error']);
                return;
            }

            $log->update(['status' => 'received', 'replied_at' => now()]);

            $frames = is_array($response) ? $response : [$response];
            $satelliteId = 1;

            foreach ($frames as $index => $frameBinary) {
                $frameHex = bin2hex($frameBinary);

                CommandReply::create([
                    'command_log_id' => $log->id,
                    'reply_data'     => $frameHex,
                ]);

                if (strlen($frameHex) <= 18) {
                    $decoded = $commandService->decode($frameHex);
                    if ($decoded) {
                        $log->update(['status' => $decoded['is_ack'] ? 'ack' : 'nack']);
                    }
                    continue;
                }

                Log::info("Dispatching DecodeTelemetryJob for log #{$log->id}, frame {$index}: {$frameHex}");
                DecodeTelemetryJob::dispatch($frameHex, $satelliteId, $log->id);
                $log->update(['status' => 'telemetry_received']);
            }
        } catch (\Throwable $e) {
            Log::error("SendCommandJob failed for log #{$log->id}: " . $e->getMessage());
            $log->update(['status' => 'error']);
            throw $e;
        }
    }
}