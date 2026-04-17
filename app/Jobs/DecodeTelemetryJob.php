<?php

namespace App\Jobs;

use App\Models\CommandLog;
use App\Services\TelemetryService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DecodeTelemetryJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $rawHex;
    protected $satelliteId;
    protected $commandLogId;

    public function __construct($rawHex, $satelliteId, $commandLogId)
    {
        $this->rawHex = $rawHex;
        $this->satelliteId = $satelliteId;
        $this->commandLogId = $commandLogId;
    }

    public function handle()
    {
        Log::info("Starting telemetry decoding for command log ID: {$this->commandLogId}, raw data: {$this->rawHex}");
        try {
            $response = Http::timeout(30)->post('http://host.docker.internal:8082/decode', [
                'hex_frame' => $this->rawHex,
                'satellite_id' => $this->satelliteId
            ]);

            if ($response->failed()) {
                throw new \Exception("Python Decoder Error: " . $response->body());
            }

            $decodedData = $response->json();
            if (strlen($this->rawHex) < 112) {
                Log::info("Skipping short frame (ACK/NACK): " . $this->rawHex);
                CommandLog::where('id', $this->commandLogId)->update(['status' => 'received']);
                return;
            }

            // 1. If it's just an ACK (0x02) or NACK (0x03), don't log telemetry, just update status
            if (isset($decodedData['type']) && in_array($decodedData['type'], ['ACK', 'NACK'])) {
                CommandLog::where('id', $this->commandLogId)->update([
                    'status' => 'telemetry_received',
                    'replied_at' => now()
                ]);
                return;
            }

            Log::info("Decoded telemetry data received for command log ID: {$this->commandLogId}, data: " . json_encode($decodedData));

            // 2. Store decoded telemetry in the database
            $telemetryService = new TelemetryService($this->satelliteId, $this->commandLogId);
            $telemetryService->storeDecodedFrame($decodedData);
            Log::info("Telemetry decoding and storage completed for command log ID: {$this->commandLogId}");

        } catch (\Exception $e) {
            Log::error("Telemetry Decoding Failed: " . $e->getMessage());
            CommandLog::where('id', $this->commandLogId)->update(['status' => 'nacked']);
            $this->fail($e);
        }
    }
}
