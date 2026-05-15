<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Image extends Model
{
    
    protected $fillable = [
        'command_log_id',
        'original_path',
        'enhanced_path',
    ];

    public function commandLog()
    {
        return $this->belongsTo(CommandLog::class, 'command_log_id');
    }
}
