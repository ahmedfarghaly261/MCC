<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CommandReply extends Model
{
    
    protected $fillable = [
        'command_log_id',
        'reply_data',
    ];

    protected $casts = [
        'reply_data' => 'array',
    ];

    protected $hidden = ['updated_at'];

    public function commandLog()
    {
        return $this->belongsTo(CommandLog::class, 'command_log_id');
    }
}
