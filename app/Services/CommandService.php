<?php

namespace App\Services;

use App\Models\Command;
use App\Models\CommandLog;
use App\Models\CommandReply;
use Illuminate\Support\Facades\Log;
use WebSocket\Client;
use App\Jobs\DecodeTelemetryJob;
use Exception;


class CommandService
{
    private const FLAG = 0xC0;
    private const SRC_GCS = 0xB0;

    /**
     * Entry point to dispatch a command
     */
    public function dispatch(int $commandId, int $dest, array $data = [])
    {
        // 1. Fetch command metadata
        $command = Command::where('id', $commandId)->first();
        if (!$command) {
            throw new \Exception("Command $commandId not found in registry.");
        }

        try {
            // 2. Build the CSSP Frame
            $binaryFrame = $this->buildCsspFrame($command->cmd_id, $dest, $data);

            // 3. Log to database as 'pending'
            $log = CommandLog::create([
                'command_id'      => $command->id,
                'dest_address'    => sprintf("0x%02X", $dest),
                'src_address'     => sprintf("0x%02X", self::SRC_GCS),
                'raw_binary_sent' => bin2hex($binaryFrame),
                'status'          => 'pending',
                'sent_at'         => now(),
            ]);

            // 4. Send to Gateway
            // response will be a single string (ACK/NACK) or an array of strings (for GSTLM)
            $response = $this->sendToGateway($binaryFrame, $command->name);

            if ($response) {
                // Normalize response to an array so we can use the same logic for all commands
                $responseFrames = is_array($response) ? $response : [$response];

                // 5. Update Log with the primary response (usually the first frame/ACK)
                $primaryResponseHex = bin2hex($responseFrames[0]);
                $log->update([
                    'status'     => 'telemetry_received', // will update this to 'ack'/'nack' after decoding
                    'replied_at' => now(),
                ]);

                // 6. Save each frame as a CommandReply and dispatch decoding
                $satelliteId = 1; // Placeholder

                foreach ($responseFrames as $index => $frameBinary) {
                    $frameHex = bin2hex($frameBinary);

                    CommandReply::create([
                        'command_log_id' => $log->id,
                        'reply_data'     => $frameHex,
                    ]);

                    // 7. Dispatch decoding job for each frame
                    Log::info("Dispatching DecodeTelemetryJob for command log ID: {$log->id}, frame index: {$index}, data: {$frameHex}");
                    DecodeTelemetryJob::dispatch($frameHex, $satelliteId, $log->id);
                }

                return ["log" => $log, "responses" => $responseFrames];
            }

            return $log;
        } catch (\Exception $e) {
            Log::error("Gateway error: " . $e->getMessage());
            if (isset($log)) {
                $log->update(['status' => 'error']);
            }
            throw $e;
        }
    }

    /**
     * Formats the 9-field CSSP frame 
     */
    private function buildCsspFrame(int $cmdId, int $dest, array $data): string
    {
        $len = count($data);

        // Field 2-5: DEST, SRC, CMD_ID, LEN 
        $headerAndData = pack('CCCC', $dest, self::SRC_GCS, $cmdId, $len);

        foreach ($data as $byte) {
            $headerAndData .= pack('C', $byte);
        }

        // Field 7-8: CRC_0 (LSB) and CRC_1 (MSB) 
        $crc = $this->calculateCRC16($headerAndData);
        $crc0 = $crc & 0xFF;
        $crc1 = ($crc >> 8) & 0xFF;

        // Field 1 & 9: Flags 
        return pack('C', self::FLAG) . $headerAndData . pack('CCC', $crc0, $crc1, self::FLAG);
    }

    /**
     * CRC-16/IBM-3740: X^16 + X^12 + X^5 + 1 
     */
    private function calculateCRC16(string $data): int
    {
        $crc = 0xFFFF;
        $bytes = unpack('C*', $data);
        foreach ($bytes as $byte) {
            $crc ^= ($byte << 8);
            for ($i = 0; $i < 8; $i++) {
                if ($crc & 0x8000) {
                    $crc = ($crc << 1) ^ 0x1021;
                } else {
                    $crc <<= 1;
                }
            }
        }
        return $crc & 0xFFFF;
    }

    /**
     * Sends the binary frame to the local Python gateway and returns the raw binary response
     */
    private function sendToGateway(string $binary, string $commandName)
    {
        Log::info("MCC SENDING CSSP FRAME: " . bin2hex($binary));
        $url = "ws://127.0.0.1:8081/ws/radio";

        try {
            $client = new Client($url, ['timeout' => 5]);
            $client->send($binary, 'binary');

            if ($commandName == 'Hi') {
                $client->close();
                return null;
            }

            // 1. Receive the ACK/NACK first
            $firstResponse = $client->receive();
            Log::info("Initial ACK/NACK: " . bin2hex($firstResponse));

            if ($commandName == 'GSTLM') {
                $allFrames = [$firstResponse];
                for ($i = 0; $i < 8; $i++) {
                    try {
                        $telemetryFrame = $client->receive();
                        Log::info("Received Stored TLM " . ($i + 1) . ": " . bin2hex($telemetryFrame));
                        $allFrames[] = $telemetryFrame;
                    } catch (\Exception $e) {
                        Log::warning("Timed out or failed waiting for frame $i");
                    }
                }
                $client->close();
                return $allFrames;
            }

            $client->close();
            return $firstResponse;
        } catch (\Exception $e) {
            Log::error("Gateway connection failed: " . $e->getMessage());
            return null;
        }
    }
}
