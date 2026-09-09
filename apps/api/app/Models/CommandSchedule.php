<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CommandSchedule extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'command_schedules';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'parent_goal_id',
        'macro_name',
        'command_id',
        'dest_address',
        'data',
        'execute_at',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'data'       => 'array',    
        'execute_at' => 'datetime', 
    ];

    /**
     * Get the specific ICD Command definition template that this schedule uses.
     */
    public function command(): BelongsTo
    {
        return $this->belongsTo(Command::class, 'command_id');
    }

    /**
     * Relationship to track the parent macro-goal row if it is stored in command_logs.
     */
    public function parentGoal(): BelongsTo
    {
        return $this->belongsTo(CommandLog::class, 'parent_goal_id');
    }

    /**
     * Scope utility to filter tasks that are ready for execution windows.
     */
    public function scopeDue($query)
    {
        return $query->where('status', 'pending')
            ->where('execute_at', '<=', now());
    }

    public function getHexDestAddressAttribute(): string
    {
        return sprintf('0x%02X', $this->dest_address);
    }
}
