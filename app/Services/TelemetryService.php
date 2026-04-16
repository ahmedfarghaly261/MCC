<?php

namespace App\Services;

use App\Models\TelemetryLog;
use App\Models\TelemetryParameter;
use App\Models\SatelliteSubsystem;
use App\Models\CommandLog;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class TelemetryService
{
    protected $satelliteId;
    protected $commandLogId;
    protected $subsystems = [];

    public function __construct($satelliteId, $commandLogId = null)
    {
        $this->satelliteId = $satelliteId;
        $this->commandLogId = $commandLogId;
        $this->loadSubsystems();
    }

    /**
     * Cache subsystems to avoid repeated DB queries during high-volume telemetry processing.
     */
    protected function loadSubsystems()
    {
        $this->subsystems = Cache::remember("sat_{$this->satelliteId}_subsystems", 3600, function () {
            return SatelliteSubsystem::where('satellite_id', $this->satelliteId)
                ->get()
                ->keyBy('name')
                ->toArray();
        });
    }

    /**
     * Logic to store decoded telemetry into the EAV log table.
     */
    public function storeDecodedFrame(array $decoded)
    {
        try {
            // 1. Identify which JSON keys are NOT subsystems
            $metaKeys = ['status', 'captured_at', 'station', 'raw_hex', 'meta'];

            $meta = $decoded['meta'] ?? [];
            $frameType = $meta['frame_type'] ?? 0;
            $satTime   = $meta['subsystem_time'] ?? null;
            $rtc       = $meta['subsystem_rtc'] ?? null;

            // 2. Loop through every key in the decoded JSON
            foreach ($decoded as $key => $boardData) {
                // Skip top-level metadata keys
                if (in_array($key, $metaKeys) || !is_array($boardData)) {
                    continue;
                }

                $subsystem = SatelliteSubsystem::firstOrCreate(
                    [
                        'satellite_id'   => $this->satelliteId,
                        'name' => $key 
                    ],
                    [
                        'hex_code' => '0x00', // Default placeholder
                        'status'   => 'active'
                    ]
                );

                Log::info("Processing Subsystem: {$key} (DB ID: {$subsystem->id})");

                foreach ($boardData as $paramName => $data) {
                    // Normalize data: handling cases where data is an array or a single value
                    $rawValue       = is_array($data) ? ($data['raw'] ?? 0) : $data;
                    $convertedValue = is_array($data) ? ($data['converted'] ?? $rawValue) : $rawValue;
                    $unit           = is_array($data) ? ($data['unit'] ?? null) : null;

                    $parameter =TelemetryParameter::firstOrCreate(
                        [
                            'satellite_id'   => $this->satelliteId,
                            'subsystem_id'   => $subsystem->id,
                            'parameter_name' => $paramName
                        ],
                        ['unit' => $unit]
                    );

                    // 5. SAVE TELEMETRY LOG
                    TelemetryLog::create([
                        'satellite_id'      => $this->satelliteId,
                        'command_log_id'    => $this->commandLogId,
                        'subsystem_id'      => $subsystem->id,
                        'subsystem_address' => hexdec($subsystem->hex_code ?? '0x00'),
                        'subsystem_mode'    => $frameType,
                        'subsystem_time'    => $satTime,
                        'subsystem_rtc'     => $rtc,
                        'parameter_id'      => $parameter->id,
                        'raw_value'         => is_bool($rawValue) ? (int)$rawValue : $rawValue,
                        'converted_value'   => (float)$convertedValue,
                        'unit'              => $unit,
                        'sampled_at'        => now(),
                    ]);
                }
                Log::info("Saved " . count($boardData) . " parameters for {$key}");
            }

            Cache::forget("sat_{$this->satelliteId}_subsystems");
            Cache::forget("sat_{$this->satelliteId}_params");
        } catch (\Exception $e) {
            Log::error("CRITICAL TELEMETRY ERROR: " . $e->getMessage());
        }
    }
}
