<?php

namespace App\Services;

use App\Models\Command;
use App\Models\CommandLog;
use App\Models\CommandReply;
use App\Models\SatelliteSubsystem;
use Illuminate\Support\Facades\Log;
use WebSocket\Client;
use App\Jobs\DecodeTelemetryJob;
use Exception;


class CommandService
{
    const FLAG = 0xC0;
    private const SRC_GCS = 0xB0;
    const TYPE_ACK = 0x02;
    const TYPE_NACK = 0x03;
    const TYPE_TLM = 0x47;

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
            // response will be a single string (ACK/NACK) or an array of strings (for GSTLM) and no responce for Hi cmd
            $response = $this->sendToGateway($binaryFrame, $command->name);
            if ($response=="Hi Sent Successfully") {
                $log->update(['status' => 'sent']);
                return $log;
            }

            if ($response) {
                // Normalize response to an array so we can use the same logic for all commands
                $responseFrames = is_array($response) ? $response : [$response];

                // 5. Update Log with the primary response (usually the first frame/ACK)
                $primaryResponseHex = bin2hex($responseFrames[0]);
                $log->update([
                    'status'     => 'received',
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

                    if (strlen($frameHex) <= 18) {
                        $decoded = $this->decode($frameHex);

                        if ($decoded) {
                            $log->update([
                                'status' => $decoded['is_ack'] ? 'ack' : 'nack',
                            ]);
                        }
                        continue;
                    }

                    // 7. Dispatch decoding job for each frame
                    Log::info("Dispatching DecodeTelemetryJob for command log ID: {$log->id}, frame index: {$index}, data: {$frameHex}");
                    DecodeTelemetryJob::dispatch($frameHex, $satelliteId, $log->id);
                    $log->update([
                        'status'     => 'telemetry_received',
                    ]);
                }
                return $log;
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
    public function buildCsspFrame(int $cmdId, int $dest, array $data): string
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

    public function decode(string $hex): ?array
    {
        $binary = hex2bin(str_replace(' ', '', $hex));
        $bytes = array_values(unpack('C*', $binary));

        // 1. Minimum check: Flag + Dest + Src + Type + Len + Data + CRC + CRC + Flag = 9 bytes
        if (count($bytes) < 9 || $bytes[0] !== 0xC0) {
            return null;
        }

        $type = $bytes[3]; // Byte 4 is the Identifier

        // 2. Strict Filter: If it's not ACK (02) or NACK (03), ignore it
        if ($type !== self::TYPE_ACK && $type !== self::TYPE_NACK) {
            return null;
        }

        return [
            'is_ack'     => ($type === self::TYPE_ACK),
            'command_id' => $bytes[5],
            'source'     => sprintf('0x%02x', $bytes[1]),
            'destination' => sprintf('0x%02x', $bytes[2]),
            'is_valid'   => $this->validateCRC($binary)
        ];
    }

    public function validateCRC(string $binary): bool
    {
        $len = strlen($binary);
        $payload = substr($binary, 1, 5);

        $calculated = $this->calculateCRC16($payload);

        // Per your ICD: CRC_0 is LSB, CRC_1 is MSB
        $lsb = ord($binary[$len - 3]);
        $msb = ord($binary[$len - 2]);
        $received = ($msb << 8) | $lsb;

        return $calculated === $received;
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
    public function sendToGateway(string $binary, string $commandName)
    {
        Log::info("MCC SENDING CSSP FRAME: " . bin2hex($binary));
        $url = "ws://host.docker.internal:8081/ws/radio";

        try {
            $client = new Client($url, ['timeout' => 5]);
            $client->send($binary, 'binary');

            if ($commandName == 'Hi') {
                $client->close();
                return "Hi Sent Successfully";
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

    public function getAllCommands()
    {
        return Command::all();
    }

    public function getAllCommandsWithSubsystems()
    {
        $commands = $this->getAllCommands();
        // Load subsystems from allowed destinations and get subsystem name only
        $allDestinations = $commands->pluck('allowed_destinations')->flatten()->unique()->filter();
        $subsystems = SatelliteSubsystem::whereIn('hex_code', $allDestinations)->get(['hex_code', 'name']);
        $subsystemMap = $subsystems->keyBy('hex_code');
        $commands->transform(function ($command) use ($subsystemMap) {
            $command->subsystems = collect($command->allowed_destinations)->map(function ($id) use ($subsystemMap) {
                return $subsystemMap->get($id)?->only(['hex_code', 'name']);
            })->filter()->values();
            return $command;
        });
        return $commands;
    }

    public function getCommandById($id)
    {
        $command = Command::where('id', $id)->first();
        if (!$command) {
            throw new \Exception("Command with ID $id not found.");
        }
        return $command;
    }


    public function getAllReplies()
    {
        return CommandReply::with(['commandLog.command:id,name', 'commandLog'])
            ->whereHas('commandLog.command')
            ->orderBy('created_at', 'desc')
            ->paginate(30);
    }
}
