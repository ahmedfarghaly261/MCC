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

    /**
     * Get all TLE history for this satellite.
     */
    public function tles(): HasMany
    {
        return $this->hasMany(SatelliteTle::class, 'norad_id', 'norad_id');
    }
}
