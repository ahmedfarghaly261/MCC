<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Satellite extends Model
{
    protected $fillable = [
        'norad_id',
        'name',
        'cospar_id',
        'owner_country',
        'status',
        'launch_date',
        'description'
    ];

    // /**
    //  * Get all TLE history for this satellite.
    //  */
    // public function tles(): HasMany
    // {
    //     return $this->hasMany(SatelliteTle::class, 'satellite_id', 'id');
    // }

    /**
     * Get all subsystems for this satellite.
     */
    public function subsystems(): HasMany
    {
        return $this->hasMany(SatelliteSubsystem::class, 'satellite_id', 'id');
    }

    /**
     * Get all telemetry parameters for this satellite.
     */
    public function telemetryParameters(): HasMany
    {
        return $this->hasMany(TelemetryParameter::class, 'satellite_id', 'id');
    }

    /**
     * Get all telemetry logs for this satellite.
     */
    public function telemetryLogs(): HasMany
    {
        return $this->hasMany(TelemetryLog::class, 'satellite_id', 'id');
    }   
}
