<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SatelliteTle extends Model
{
    protected $fillable = [
        'norad_id',
        'satellite_name',
        'line1',
        'line2',
        'source',
        'fetched_at'
    ];
    
}
