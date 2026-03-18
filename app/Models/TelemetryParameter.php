<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TelemetryParameter extends Model
{
    
        protected $fillable = [
           'satellite_id', 'subsystem_id', 'parameter_index', 'parameter_name', 
            'description', 'unit'
        ];
    
        public $timestamps = true; 
    
        
        public function telemetryLogs()
        {
            return $this->hasMany(TelemetryLog::class, 'parameter_id');
        }

        public function subsystem()
        {
            return $this->belongsTo(SatelliteSubsystem::class, 'subsystem_id');
        }
        
        public function satellite()
        {
            return $this->belongsTo(Satellite::class, 'satellite_id');
        }
}
