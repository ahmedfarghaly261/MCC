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

    public function __construct() {}

    /**
     * Cache subsystems to avoid repeated DB queries during high-volume telemetry processing.
     */
    protected function loadSubsystems(int $satelliteId): void
    {
        $this->subsystems = Cache::remember("sat_{$satelliteId}_subsystems", 3600, function () use ($satelliteId) {
            return SatelliteSubsystem::where('satellite_id', $satelliteId)
                ->get()
                ->keyBy('name')
                ->toArray();
        });
    }

    /**
     * Logic to store decoded telemetry into the EAV log table.
     */
    public function storeDecodedFrame(array $decoded, int $satelliteId, ?int $commandLogId = null): void
    {
        $this->satelliteId  = $satelliteId;
        $this->commandLogId = $commandLogId;
        $this->loadSubsystems($satelliteId);

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
                    $rawValue       = is_array($data) ? ($data['raw'] ?? 0) : $data; //put 0 if null  
                    $convertedValue = is_array($data) ? ($data['converted'] ?? $rawValue) : $rawValue;
                    $unit           = is_array($data) ? ($data['unit'] ?? null) : null;

                    $parameter = TelemetryParameter::firstOrCreate(
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

    public function getTelemetryByCommandLog(CommandLog $commandLog, int $satelliteId): array
    {
        try {
            $this->loadSubsystems($satelliteId);

            $commandLog->load(['telemetryLogs.parameter']);
            $firstLog = $commandLog->telemetryLogs->first();

            return [
                'command_log_id'   => $commandLog->id,
                'command_id'       => $commandLog->command_id,
                'dest_address'     => $commandLog->dest_address,
                'src_address'      => $commandLog->src_address,
                'status'           => $commandLog->status,
                'sent_at'          => $commandLog->sent_at?->toIso8601String(),
                'replied_at'       => $commandLog->replied_at?->toIso8601String(),
                'response_time_ms' => $commandLog->response_time_ms,

                'subsystem_id'      => $firstLog?->subsystem_id,
                'subsystem_address' => $firstLog?->subsystem_address,
                'subsystem_mode'    => $firstLog?->subsystem_mode,
                'subsystem_time'    => $firstLog?->subsystem_time,
                'subsystem_rtc'     => $firstLog?->subsystem_rtc,

                'telemetry_count'  => $commandLog->telemetryLogs->count(),

                'telemetry' => $commandLog->telemetryLogs->map(fn($log) => [
                    'id'             => $log->id,
                    'parameter'      => [
                        'id'   => $log->parameter?->id,
                        'name' => $log->parameter?->parameter_name,
                        'unit' => $log->parameter?->unit,
                    ],
                    'raw_value'       => $log->raw_value,
                    'converted_value' => $log->converted_value,
                    'unit'            => $log->unit,
                    'sampled_at'      => $log->sampled_at?->toIso8601String(),
                ])->values()->all(),
            ];
        } catch (\Exception $e) {
            Log::error("Error fetching telemetry for CommandLog ID {$commandLog->id}: " . $e->getMessage());
            return ['error' => 'Failed to retrieve telemetry data'];
        }
    }
}
