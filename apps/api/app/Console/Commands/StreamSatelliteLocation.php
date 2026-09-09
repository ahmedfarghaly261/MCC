<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\SatelliteService;
use App\Events\SatelliteLocationUpdated;

class StreamSatelliteLocation extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:stream-satellite-location';
    protected $description = 'Fetch and broadcast satellite location data every second';

    public function handle(SatelliteService $service)
    {
        $this->info("Streaming started...");

        while (true) {
            try {
                $data = $service->getTelemetryForBroadcast();

                if ($data['lat'] !== null) {
                    event(new SatelliteLocationUpdated($data));
                    $this->info("Broadcasted: Lat {$data['lat']}, Lng {$data['lng']}");
                } else {
                    $this->warn("Python service unavailable, skipping broadcast.");
                }
            } catch (\Exception $e) {
                $this->error("Error: " . $e->getMessage());
            }

            sleep(60);
        }
    }
}
