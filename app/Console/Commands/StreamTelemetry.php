<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use WebSocket\Client;

class StreamTelemetry extends Command
{
    protected $signature = 'satellite:stream';
    protected $description = 'Connect to FastAPI WebSocket and receive telemetry frames';


    public function handle()
    {
        $url = "ws://127.0.0.1:8080/ws/telemetry?reset=true";
        $client = new \WebSocket\Client($url);

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
