<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Command extends Model
{
    protected $fillable = [
        'name', 'cmd_id', 'description', 
        'allowed_sources', 'allowed_destinations', 
        'expected_data_len', 'requires_ack'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'allowed_sources' => 'array',
        'allowed_destinations' => 'array',
        'cmd_id' => 'integer', 
    ];

    public function commandLogs()
    {
        return $this->hasMany(CommandLog::class, 'command_id');
    }
    
}