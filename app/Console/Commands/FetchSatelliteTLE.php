<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\SatelliteTle;
use Carbon\Carbon;

class FetchSatelliteTLE extends Command
{
    /**
     * The name and signature of the console command.
     * {norad?} allows you to pass an ID, or it defaults to the one in your Python config.
     */
    protected $signature = 'satellite:get-tle {norad=39444}';

    /**
     * The console command description.
     */
    protected $description = 'Fetch the latest TLE data from the Python FastAPI service';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $noradId = $this->argument('norad');
        $baseUrl = 'http://127.0.0.1:8080'; // Ensure this matches your Uvicorn port

        $this->info("Fetching TLE for NORAD ID: {$noradId}...");

        try {
            // Sending the GET request to your Python API
            $response = Http::timeout(5)->get("{$baseUrl}/tle", [
                'norad' => $noradId
            ]);

            if ($response->successful()) {
                $data = $response->json();

                $this->newLine();
                $this->table(
                    ['Field', 'Value'],
                    [
                        ['Satellite', $data['satellite_name']],
                        ['Line 1', $data['tle_line1']],
                        ['Line 2', $data['tle_line2']],
                        ['Fetched At', $data['fetched_utc']],
                        ['Source', $data['source']],
                    ]
                );


                // Store the record in the database
                SatelliteTle::create([
                    'norad_id'       => $data['norad_id'],
                    'satellite_name' => $data['satellite_name'],
                    'line1'          => $data['tle_line1'],
                    'line2'          => $data['tle_line2'],
                    'source'         => $data['source'],
                    'fetched_at'     => Carbon::parse($data['fetched_utc']),
                ]);

                $this->info("Successfully stored TLE for " . $data['satellite_name']);

                // Tip: This is where you would save to your database
                // Satellite::updateOrCreate(['norad_id' => $noradId], [...]);


            } else {
                $this->error("Failed to fetch data. Server responded with status: " . $response->status());
                $this->error($response->body());
            }
        } catch (\Exception $e) {
            $this->error("Could not connect to Python API. Is Uvicorn running?");
            $this->line("Error: " . $e->getMessage());
        }
    }
}
