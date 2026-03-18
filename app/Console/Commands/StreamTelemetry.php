<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\TelemetryService;
use App\Models\TelemetryFrame;
use Illuminate\Support\Carbon;
use WebSocket\Client;
use Illuminate\Support\Facades\Http;
use App\Models\Satellite;


class StreamTelemetry extends Command
{
    protected $signature = 'satellite:stream';
    protected $description = 'Connect to FastAPI WebSocket and receive telemetry frames';


    public function handle()
    {
        $url = "ws://127.0.0.1:8080/ws/telemetry?reset=true";
        $client = new Client($url);

        $this->info("Connected to Satellite API...");

        $client->text(json_encode([
            "type" => "start_stream",
            "interval" => 1.0
        ]));


        while (true) {
            try {
                $message = $client->receive();
                $data = json_decode($message, true);

                if ($data['type'] === 'frame') {
                    $this->info("Received Frame index: " . $data['cursor']);
                    $this->line("Hex Data: " . $data['frame']['hex_frame']);
                    $this->line("Station: " . $data['frame']['station']['name']);
                    $this->newLine();

                    if ($data['type'] === 'frame') {
                        $frameData = $data['frame'];

                        TelemetryFrame::create([
                            'norad_id'       => 39444,
                            'frame_index'    => $data['cursor'],
                            'captured_at'    => $frameData['captured_at'],
                            'station_name'   => $frameData['station']['name'],
                            'grid_locator'   => $frameData['station']['grid_locator'],
                            'frequency_info' => $frameData['frequency_info'],
                            'hex_frame'      => $frameData['hex_frame'],
                            'byte_count'     => $frameData['hex_byte_count'],
                            'streamed_at'    => Carbon::parse($data['streamed_at']),
                        ]);

                        // get sat id using norad id 
                        $satellite = Satellite::where('norad_id', 39444)->first();

                        $this->info("Saved Frame #{$data['cursor']} to database.");
                        $response = Http::post("http://127.0.0.1:8081/decode", ['hex_frame' => $frameData['hex_frame']]);
                        // $response->json()['satellite_id'] = $satellite->id;
                        if ($response->successful()) {
                            $telemetryService = new TelemetryService($satellite->id);
                            $telemetryService->logDecodedData($response->json());
                            // $this->info("Decoded Data: " . json_encode($response->json()));
                            $this->info("Frame saved and decoded successfully.");
                        }
                    }
                } elseif ($data['type'] === 'ack') {
                    $this->comment("Server Ack: " . $data['message']);
                } elseif ($data['type'] === 'error') {
                    $this->error("Server Error: " . $data['message']);
                }
            } catch (\Exception $e) {
                $this->error("Disconnected: " . $e->getMessage());
                break;
            }
        }
    }
}
