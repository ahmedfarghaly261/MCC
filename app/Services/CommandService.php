<?php

namespace App\Services;

use App\Models\Command;
use App\Models\CommandLog;
use App\Models\CommandReply;
use App\Models\SatelliteSubsystem;
use App\Enums\PowerLine;
use App\Enums\SatelliteMode;
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

    protected string $commandUrl;

    public function __construct(
        private readonly TelemetryService $telemetryService
    ) {
        $this->commandUrl = config('services.command.url');
    }


    /**
     * Formats the 9-field CSSP frame by extracting only command-specific fields
     */
    /**
     * Formats the 9-field CSSP frame according to ICD Rev 2.0
     */
    public function buildCsspFrame(Command $command, int $dest, array $data): string
    {
        $requiredFieldsByCommand = [
            'SON'   => ['pwrl_id'],
            'SOFF'  => ['pwrl_id'],
            'GSTLM' => ['subsystem_addr', 'tlm_frame_seq_no'],
            'DIMG'  => ['image_id'],
            'GIMG'  => ['image_id', 'sequence_number', 'window_size'],
            'STIME' => ['timer_value'],
            'SMODE' => ['mode_id'],
        ];

        $payload = '';
        $byteCount = 0;

        if (isset($requiredFieldsByCommand[$command->name])) {
            foreach ($requiredFieldsByCommand[$command->name] as $field) {
                if (isset($data[$field])) {
                    $value = $data[$field];

                    switch ($field) {
                        case 'timer_value':
                            // Issue 6: Using Big-Endian (Network Byte Order) for consistency
                            $payload .= pack('J', $value);
                            $byteCount += 8;
                            break;
                        case 'sequence_number':
                            // standardizing to Big-Endian 'N'
                            $payload .= pack('N', $value);
                            $byteCount += 4;
                            break;
                        case 'image_id':
                        case 'tlm_frame_seq_no':
                        case 'window_size':
                            // standardizing to Big-Endian 'n'
                            $payload .= pack('n', $value);
                            $byteCount += 2;
                            break;
                        default:
                            // 1-byte fields
                            $payload .= pack('C', $value);
                            $byteCount += 1;
                            break;
                    }
                }
            }
        }

        // Field 2-5: DEST, SRC, CMD_ID, LEN
        $realId = $command->getRawOriginal('cmd_id');
        // Ensure self::SRC_GCS is 0xB0 per Issue 3
        $headerAndData = pack('CCCC', $dest, self::SRC_GCS, $realId, $byteCount);
        $headerAndData .= $payload;

        // Issue 1: Proper CRC-16/IBM-3740
        $crc = $this->calculateCRC16IBM($headerAndData);

        // Issue 2: Field 7 is LSB, Field 8 is MSB
        return pack('C', self::FLAG) . $headerAndData . pack('vC', $crc, self::FLAG);
    }

    /**
     * CRC-16/IBM-3740 Implementation
     * Poly: 0x1021 (X^16 + X^12 + X^5 + 1), Init: 0xFFFF
     */
    private function calculateCRC16IBM(string $data): int
    {
        $crc = 0xFFFF;
        for ($i = 0; $i < strlen($data); $i++) {
            $crc ^= (ord($data[$i]) << 8);
            for ($j = 0; $j < 8; $j++) {
                if ($crc & 0x8000) {
                    $crc = ($crc << 1) ^ 0x1021;
                } else {
                    $crc <<= 1;
                }
            }
        }
        return $crc & 0xFFFF;
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
        // The ICD specifies CRC is calculated on Fields 2 through 6 (Dest, Src, CmdID, Len, and Data)
        // This is everything between the first Flag (index 0) and the CRC_0 (index len-3)
        $payloadForCrc = substr($binary, 1, $len - 4);

        $calculated = $this->calculateCRC16IBM($payloadForCrc);

        $lsb = ord($binary[$len - 3]);
        $msb = ord($binary[$len - 2]);
        $received = ($msb << 8) | $lsb;

        return $calculated === $received;
    }


    /**
     * Sends the binary frame to the local Python gateway and returns the raw binary response
     */
    public function sendToGateway(string $binary, string $commandName)
    {
        Log::info("MCC SENDING CSSP FRAME: " . bin2hex($binary));
        $commandUrl = "ws://host.docker.internal:8081/ws/radio";

        try {
            $client = new Client($commandUrl, ['timeout' => 5]);
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


    public function validateCommandData(int $commandId, array $data): bool
    {
        $command = Command::findOrFail($commandId);

        $requiredFieldsByCommand = [
            'SON' => ['pwrl_id'],
            'SOFF' => ['pwrl_id'],
            'GSTLM' => ['tlm_frame_seq_no'],
            'DIMG' => ['image_id'],
            'GIMG' => ['image_id', 'sequence_number', 'window_size'],
            'STIME' => ['timer_value'],
            'SMODE' => ['mode_id'],
        ];

        //then validate theat  pwrl_id , mode_id is valid and exist in the enum files
        if (isset($data['pwrl_id']) && !PowerLine::tryFrom($data['pwrl_id'])) {
            throw new \InvalidArgumentException("Invalid pwrl_id: {$data['pwrl_id']}. Must be a valid PowerLine enum value.");
        }
        if (isset($data['mode_id']) && !SatelliteMode::tryFrom($data['mode_id'])) {
            throw new \InvalidArgumentException("Invalid mode_id: {$data['mode_id']}. Must be a valid SatelliteMode enum value.");
        }
        if (isset($requiredFieldsByCommand[$command->name])) {
            foreach ($requiredFieldsByCommand[$command->name] as $field) {
                if (!array_key_exists($field, $data) || $data[$field] === null) {
                    throw new \InvalidArgumentException("{$field} is required for the {$command->name} command.");
                }
            }
        }

        return true;
    }
}
