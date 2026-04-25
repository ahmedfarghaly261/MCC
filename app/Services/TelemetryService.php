<?php

namespace App\Services;

use App\Models\TelemetryLog;
use App\Models\TelemetryParameter;
use App\Models\SatelliteSubsystem;
use App\Models\CommandLog;
use Carbon\Carbon;

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

        // Pre-load subsystems into memory to reduce DB hits
        $this->loadSubsystems($satelliteId);

        try {
            // 1. Define keys that are NOT subsystems
            $metaKeys = ['status', 'captured_at', 'station', 'raw_hex', 'meta', 'SW'];

            // 2. Extract Global Metadata Fallbacks
            $meta      = $decoded['meta'] ?? [];
            $frameType = $meta['frame_type'] ?? 0;
            $satTime   = $meta['subsystem_time'] ?? null;
            $rtc       = $meta['subsystem_rtc'] ?? null;

            // Use the 'captured_at' from response, otherwise use server time
            $timestamp = isset($decoded['captured_at']) ? Carbon::parse($decoded['captured_at']) : now();
            // 3. Loop through every key in the decoded JSON (Subsystems)
            foreach ($decoded as $key => $boardData) {

                // Skip top-level metadata or non-subsystem entries
                if (in_array($key, $metaKeys) || !is_array($boardData)) {
                    continue;
                }

                // 4. Retrieve or create the Subsystem
                // Attempt to find the specific address (e.g., "EPS_Address")
                $detectedHex = $boardData[$key . '_Address'] ?? '0x00';

                $subsystem = SatelliteSubsystem::firstOrCreate(
                    [
                        'satellite_id' => $this->satelliteId,
                        'name'         => (string)$key
                    ],
                    [
                        'hex_code' => $detectedHex,
                        'status'   => 'active'
                    ]
                );

                // Extract subsystem-level metadata if it exists inside the board data
                $currentMode = $boardData[$key . '_Mode'] ?? $frameType;
                $currentTime = $boardData[$key . '_Time'] ?? $satTime;
                $currentRTC  = $boardData[$key . '_RTC']  ?? $rtc;

                Log::info("Processing Subsystem: {$key} (DB ID: {$subsystem->id})");

                // 5. Loop through parameters within the board
                foreach ($boardData as $paramName => $data) {

                    // Skip redundant/internal fields that aren't telemetry values
                    if (str_ends_with($paramName, '_Address') || str_ends_with($paramName, '_Frame') || str_ends_with($paramName, '_Name')) {
                        continue;
                    }

                    // Normalize data structure (handle array objects or flat values)
                    if (is_array($data)) {
                        $rawValue       = $data['raw'] ?? '0';
                        $convertedValue = $data['converted'] ?? 0;
                        $unit           = $data['unit'] ?? null;
                    } else {
                        $rawValue       = $data ?? '0';
                        $convertedValue = $data ?? 0;
                        $unit           = null;
                    }

                    // Format raw_value as string (handles hex strings, booleans, and nulls)
                    if (is_bool($rawValue)) {
                        $finalRaw = $rawValue ? '1' : '0';
                    } elseif (is_null($rawValue) || $rawValue === '') {
                        $finalRaw = '0';
                    } else {
                        $finalRaw = (string)$rawValue;
                    }

                    // Ensure converted value is a float
                    $finalConverted = is_numeric($convertedValue) ? (float)$convertedValue : 0;

                    // 6. Find or Create the Parameter definition
                    $parameter = TelemetryParameter::firstOrCreate(
                        [
                            'satellite_id'   => $this->satelliteId,
                            'subsystem_id'   => $subsystem->id,
                            'parameter_name' => (string)$paramName
                        ],
                        ['unit' => $unit]
                    );

                    // 7. SAVE TELEMETRY LOG
                    TelemetryLog::create([
                        'satellite_id'      => $this->satelliteId,
                        'command_log_id'    => $this->commandLogId,
                        'subsystem_id'      => $subsystem->id,
                        'subsystem_address' => hexdec($subsystem->hex_code ?? '0x00'),
                        'subsystem_mode'    => $currentMode,
                        'subsystem_time'    => $currentTime,
                        'subsystem_rtc'     => $currentRTC,
                        'parameter_id'      => $parameter->id,
                        'raw_value'         => $finalRaw,
                        'converted_value'   => $finalConverted,
                        'unit'              => $unit,
                        'sampled_at'        => $timestamp,
                    ]);
                }
            }

            // 8. Clear cache so the dashboard sees the new parameters/subsystems immediately
            Cache::forget("sat_{$this->satelliteId}_subsystems");
            Cache::forget("sat_{$this->satelliteId}_params");
        } catch (\Exception $e) {
            Log::error("CRITICAL TELEMETRY ERROR: " . $e->getMessage(), [
                'satellite_id' => $satelliteId,
                'trace' => $e->getTraceAsString()
            ]);
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
                    'is_anomaly'      => $log->is_anomaly,
                    'anomaly_score'   => $log->anomaly_score,
                    'sampled_at'      => $log->sampled_at?->toIso8601String(),
                ])->values()->all(),
            ];
        } catch (\Exception $e) {
            Log::error("Error fetching telemetry for CommandLog ID {$commandLog->id}: " . $e->getMessage());
            return ['error' => 'Failed to retrieve telemetry data'];
        }
    }
}
