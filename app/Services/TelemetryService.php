<?php
namespace App\Services;

use App\Models\TelemetryLog;
use App\Models\TelemetryParameter;
use App\Models\SatelliteSubsystem;

class TelemetryService
{
    protected $satelliteId;
    protected $subsystems = [];

    public function __construct($satelliteId)
    {
        $this->satelliteId = $satelliteId;
        $this->loadSubsystems();
    }

    protected function loadSubsystems()
    {
        $subsystems = SatelliteSubsystem::where('satellite_id', $this->satelliteId)->get();
        foreach ($subsystems as $subsystem) {
            $this->subsystems[$subsystem->subsystem_name] = $subsystem;
        }
    }

    public function logDecodedData(array $decoded)
    {
        foreach ($this->subsystems as $name => $subsystem) {
            $boardData = $decoded[$name] ?? null;

            if ($boardData) {
                foreach ($boardData as $paramName => $rawValue) {
                    
                    $parameter = TelemetryParameter::firstOrCreate([
                        'satellite_id'    => $this->satelliteId,
                        'subsystem_id'    => $subsystem->id,
                        'parameter_name'  => $paramName
                    ]);

                    TelemetryLog::create([
                        'satellite_id'      => $this->satelliteId,
                        'subsystem_id'      => $subsystem->id,
                        'subsystem_address' => hexdec($subsystem->hex_code), // Convert hex string to int
                        'subsystem_mode'    => $decoded['meta']['frame_type'],
                        'parameter_id'      => $parameter->id,
                        'raw_value'         => is_bool($rawValue) ? (int)$rawValue : $rawValue,
                        'converted_value'   => $rawValue, 
                        'sampled_at'        => now(),
                    ]);
                }
            }
        }
    }
}