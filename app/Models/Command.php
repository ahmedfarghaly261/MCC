<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Command extends Model
{
    protected $fillable = [
        'name',
        'cmd_id',
        'description',
        'allowed_sources',
        'allowed_destinations',
        'required_data_fields',
        'expected_data_len',
        'requires_ack'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'allowed_sources' => 'array',
        'allowed_destinations' => 'array',
        'required_data_fields' => 'array',
    ];

    public function commandLogs()
    {
        return $this->hasMany(CommandLog::class, 'command_id');
    }


    protected function cmdId(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                return '0x' . str_pad(dechex($value), 2, '0', STR_PAD_LEFT);
            },
            set: fn($value) => is_string($value) ? hexdec($value) : $value,
        );
    }
}
