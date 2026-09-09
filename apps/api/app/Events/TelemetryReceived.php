<?php
namespace App\Events;

use App\Models\TelemetryLog;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TelemetryReceived implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $telemetry;

    public function __construct(TelemetryLog $telemetry)
    {
        // Load the relationship so the frontend knows the parameter name/unit
        $this->telemetry = $telemetry->load('parameter');
    }

    public function broadcastOn()
    {
        // Broadcast to a specific subsystem channel or a general telemetry feed
        return new Channel('telemetry' . $this->telemetry->subsystem_id);
    }

    public function broadcastAs()
    {
        return 'data.updated';
    }
}