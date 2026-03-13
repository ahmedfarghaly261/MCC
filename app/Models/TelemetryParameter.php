<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TelemetryParameter extends Model
{
    
        protected $fillable = [
            'subsystem_id', 'parameter_index', 'parameter_name', 
            'description', 'unit'
        ];
    
        public $timestamps = true; 
    
        
        public function telemetryLogs()
        {
            return $this->hasMany(TelemetryLog::class, 'parameter_id');
        }
}
