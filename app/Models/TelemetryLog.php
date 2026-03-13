<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Model;
use App\Models\TelemetryParameter;

class TelemetryLog extends Model 
{
    protected $fillable = [
        'subsystem_id', 'parameter_index', 'parameter_id', 
        'subsystem_address', 'subsystem_mode', 'subsystem_time', 'subsystem_rtc',
        'raw_value', 'converted_value', 'unit', 'sampled_at'
    ];

    public $timestamps = false; // We use sampled_at instead

    // Helper to get Subsystem Name from Hex ID (ICD Spec)
    public function getSubsystemNameAttribute()
    {
        return match($this->subsystem_id) {
            0xA1 => 'OBC',
            0xA2 => 'EPS',
            0xA3 => 'ADCS',
            0xA4 => 'PL',
            0xA5 => 'S-Band',
            0xA7 => 'COMM',
            0xA6 => 'UHF',
            0xB0 => 'GCS',
            0xFF => 'Broadcast',
            default => 'Unknown',
        };
    }

    /**
     * The telemetry parameter this log refers to.
     */
    public function parameter()
    {
        return $this->belongsTo(TelemetryParameter::class, 'parameter_id');
    }
}