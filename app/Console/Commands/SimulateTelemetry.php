<?php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\TelemetryLog;
use App\Events\TelemetryReceived;

class SimulateTelemetry extends Command
{
    protected $signature = 'telemetry:simulate {--subsystem=1}';
    protected $description = 'Simulates incoming CSSP satellite telemetry frames';

    public function handle()
    {
        $subsystemId = $this->option('subsystem');
        $this->info("Starting mock telemetry stream for Subsystem #{$subsystemId}...");

        while (true) {
            // 1. Simulate "Parsing" a CSSP Frame
            $rawData = rand(3000, 4200); // e.g., Raw battery voltage in mV
            $converted = $rawData / 1000; // e.g., 3.7V
            
            // 2. Create the Database Record
            $telemetry = TelemetryLog::create([
                'subsystem_id'      => $subsystemId,
                'subsystem_address' => 0x01,
                'subsystem_mode'    => 1,
                'subsystem_time'    => now()->timestamp,
                'subsystem_rtc'     => now()->timestamp,
                'parameter_id'      => 1, // Ensure this ID exists in telemetry_parameters!
                'raw_value'         => $rawData,
                'converted_value'   => $converted,
                'unit'              => 'V',
                'sampled_at'        => now(),
            ]);

            // 3. Dispatch the WebSocket Event
            event(new TelemetryReceived($telemetry));

            $this->line("Sent: {$converted}V (Raw: {$rawData}) at " . now()->toTimeString());

            // Wait 2 seconds before the next "frame"
            sleep(2); 
        }
    }
}