<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommandLog extends Model
{
    protected $fillable = [
        'command_id', 'dest_address', 'src_address', 
        'raw_binary_sent', 'status', 'sent_at', 'replied_at', 'response_time_ms', 
        'decoding_retry_count', 'last_decoding_retry_at'
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'replied_at' => 'datetime',
        'response_time_ms' => 'float',
    ];

    public function commandDefinition(): BelongsTo
    {
        return $this->belongsTo(Command::class, 'command_id');
    }

    public function replies()
    {
        return $this->hasMany(CommandReply::class, 'command_log_id');
    }

    public function Reply()
    {
        return $this->hasOne(CommandReply::class, 'command_log_id');
    }

    public function telemetryLogs()
    {
        return $this->hasMany(TelemetryLog::class, 'command_log_id');
    }
}