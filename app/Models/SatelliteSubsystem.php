<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SatelliteSubsystem extends Model
{
    protected $fillable = [
        'satellite_id',
        'hex_code',
        'name',
        'description',
        'mode',
    ];

    public function satellite()
    {
        return $this->belongsTo(Satellite::class);
    }

    public function telemetryParameters()
    {
        return $this->hasMany(TelemetryParameter::class, 'subsystem_id');
    }

    public function telemetryLogs()
    {
        return $this->hasMany(TelemetryLog::class, 'subsystem_id');
    }
}
