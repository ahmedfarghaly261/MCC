<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\CommandLog;

class AnomalyExplaination extends Model
{
    protected $table = 'anomaly_explainations';

    protected $fillable = [
        'command_log_id',
        'explaination',
        'root_cause',
        'top_3_anomalies',
    ];

    protected $casts = [
        'explaination' => 'array',
        'top_3_anomalies' => 'array',
    ];
    
    public function commandLog(): BelongsTo
    {
        return $this->belongsTo(CommandLog::class, 'command_log_id');
    }
}
