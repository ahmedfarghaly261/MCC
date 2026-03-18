<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TelemetryFrame extends Model
{
    protected $fillable = [
        'norad_id',
        'frame_index',
        'captured_at',
        'station_name',
        'grid_locator',
        'frequency_info',
        'hex_frame',
        'byte_count',
        'streamed_at',
    ];
    
}
