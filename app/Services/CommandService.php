<?php

namespace App\Services;

use App\Models\Command;
use App\Models\CommandLog;
use App\Models\CommandReply;
use App\Models\Image;
use App\Models\SatelliteSubsystem;
use App\Enums\PowerLine;
use App\Enums\SatelliteMode;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
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
     * The command ID byte used by the OBC when sending back image chunks.
     * Matches 0x0E in command2.py's GIMG handler.
     */
    const TYPE_IMG_CHUNK = 0x0E;

    protected string $commandUrl;

    public function __construct(
        private readonly TelemetryService $telemetryService
    ) {
        $this->commandUrl = config('services.command.url');
    }


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
                            $payload .= pack('J', $value);
                            $byteCount += 8;
                            break;
                        case 'sequence_number':
                            $payload .= pack('N', $value);
                            $byteCount += 4;
                            break;
                        case 'image_id':
                        case 'tlm_frame_seq_no':
                        case 'window_size':
                            $payload .= pack('n', $value);
                            $byteCount += 2;
                            break;
                        default:
                            $payload .= pack('C', $value);
                            $byteCount += 1;
                            break;
                    }
                }
            }
        }

        $realId = $command->getRawOriginal('cmd_id');
        $headerAndData = pack('CCCC', $dest, self::SRC_GCS, $realId, $byteCount);
        $headerAndData .= $payload;

        $crc = $this->calculateCRC16IBM($headerAndData);

        return pack('C', self::FLAG) . $headerAndData . pack('nC', $crc, self::FLAG);
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

        if (count($bytes) < 9 || $bytes[0] !== 0xC0) {
            return null;
        }

        $type = $bytes[3];

        if ($type !== self::TYPE_ACK && $type !== self::TYPE_NACK) {
            return null;
        }

        return [
            'is_ack'      => ($type === self::TYPE_ACK),
            'command_id'  => $bytes[5],
            'source'      => sprintf('0x%02x', $bytes[1]),
            'destination' => sprintf('0x%02x', $bytes[2]),
            'is_valid'    => $this->validateCRC($binary),
        ];
    }

    public function validateCRC(string $binary): bool
    {
        $len = strlen($binary);
        $payloadForCrc = substr($binary, 1, $len - 4);
        $calculated = $this->calculateCRC16IBM($payloadForCrc);

        $msb = ord($binary[$len - 3]);
        $lsb = ord($binary[$len - 2]);
        $received = ($msb << 8) | $lsb;

        return $calculated === $received;
    }

    public function sendToGateway(string $binary, string $commandName): mixed
    {
        Log::info("MCC SENDING CSSP FRAME: " . bin2hex($binary));
        $commandUrl = "ws://host.docker.internal:8081/ws/radio";

        $timeout = ($commandName === 'GIMG') ? 1000: 10;

        try {
            $client = new Client($commandUrl, ['timeout' => $timeout]);
            $client->send($binary, 'binary');

            // HI: fire-and-forget
            if ($commandName === 'Hi') {
                $client->close();
                return "Hi Sent Successfully";
            }

            // Receive the first frame — always ACK or NACK
            $firstResponse = $client->receive();
            Log::info("Initial ACK/NACK: " . bin2hex($firstResponse));

            //GSTLM: ACK + up to 7 stored telemetry frames 
            if ($commandName === 'GSTLM') {
                $allFrames = [$firstResponse];
                for ($i = 0; $i < 8; $i++) {
                    try {
                        $telemetryFrame = $client->receive();
                        Log::info("Received Stored TLM " . ($i + 1) . ": " . bin2hex($telemetryFrame));
                        $allFrames[] = $telemetryFrame;
                    } catch (\Exception $e) {
                        Log::warning("Timed out or failed waiting for TLM frame $i — stopping.");
                        break;
                    }
                }
                $client->close();
                return $allFrames;
            }

            //  GIMG: ACK + variable-length image chunk stream 
            if ($commandName === 'GIMG') {
                $firstBytes = array_values(unpack('C*', $firstResponse));
                $isAck      = isset($firstBytes[3]) && $firstBytes[3] === self::TYPE_ACK;

                if (!$isAck) {
                    Log::warning("GIMG: NACK on first frame — aborting chunk collection.");
                    $client->close();
                    return ['image_chunks' => [], 'ack_frame' => $firstResponse];
                }

                Log::info("GIMG: ACK received — starting chunk collection on SAME connection.");
                $chunks = [];

                $client->setTimeout(5);

                while (true) {
                    try {
                        $chunkFrame = $client->receive();
                        $chunkBytes = array_values(unpack('C*', $chunkFrame));

                        if (
                            count($chunkBytes) >= 5 &&
                            $chunkBytes[0] === 0xC0 &&
                            $chunkBytes[3] === self::TYPE_IMG_CHUNK
                        ) {
                            $dataLen  = $chunkBytes[4];
                            $payload  = substr($chunkFrame, 5, $dataLen);
                            $chunks[] = $payload;

                            if (count($chunks) % 500 === 0) {
                                Log::info("GIMG: collected " . count($chunks) . " chunks so far…");
                            }
                        } else {
                            Log::warning(
                                "GIMG: unexpected frame cmd_id=0x" .
                                    sprintf('%02X', $chunkBytes[3] ?? 0xFF) .
                                    " after " . count($chunks) . " chunks — stopping."
                            );
                            break;
                        }
                    } catch (\WebSocket\ConnectionException $e) {
                        // OBC closed the connection after last chunk — normal end-of-stream.
                        Log::info("GIMG: connection closed by OBC after " . count($chunks) . " chunk(s).");
                        break;
                    } catch (\Exception $e) {
                        // 2s read timeout = OBC finished streaming. Expected exit path.
                        Log::info("GIMG: stream ended after " . count($chunks) . " chunk(s) (2s idle timeout).");
                        break;
                    }
                }

                $client->close();

                Log::info("GIMG: total chunks collected: " . count($chunks));

                return [
                    'ack_frame'    => $firstResponse,
                    'image_chunks' => $chunks,
                ];
            }

            $client->close();
            return $firstResponse;
        } catch (\Exception $e) {
            Log::error("Gateway connection failed: " . $e->getMessage());
            return null;
        }
    }


    //  Image reconstruction 

    public function reconstructAndSaveImage(array $chunks, int $imageId, int $logId, array $metaData = []): ?Image
    {
        if (empty($chunks)) {
            Log::warning("GIMG: no chunks to reconstruct for image_id={$imageId}, log_id={$logId}");
            return null;
        }

        // ── 1. Concatenate all chunk payloads in order ────────────────────────
        $rawBytes = implode('', $chunks);
        $totalBytes = strlen($rawBytes);

        Log::info("GIMG: Reconstructing — {$totalBytes} B, first 16 B: " . bin2hex(substr($rawBytes, 0, 16)));

        // ── 2. Strip any non-image prefix (e.g. metadata JSON leaked through) ─
        // Scan for the first recognised image magic byte sequence.
        $jpegOffset = strpos($rawBytes, "ÿØÿ");
        $pngOffset  = strpos($rawBytes, "PNG"); // PNG

        if ($jpegOffset === false && $pngOffset === false) {
            Log::error(
                "GIMG: No JPEG/PNG magic found in {$totalBytes} B for log #{$logId}. " .
                "First 64 B: " . bin2hex(substr($rawBytes, 0, 64))
            );
            // Save the raw bytes anyway so we can inspect the file manually.
            Storage::disk('public')->makeDirectory('/satellite_images/original');
            $debugPath = "satellite_images/original/image_{$imageId}_log_{$logId}_RAW.bin";
            Storage::disk('public')->put($debugPath, $rawBytes);
            Log::warning("GIMG: Raw bytes saved for manual inspection → {$debugPath}");
            return null;
        }

        // Pick the earliest magic (JPEG wins on a tie).
        if ($jpegOffset !== false && $pngOffset !== false) {
            $startOffset = min($jpegOffset, $pngOffset);
        } elseif ($jpegOffset !== false) {
            $startOffset = $jpegOffset;
        } else {
            $startOffset = $pngOffset;
        }
        $isJpeg = ($jpegOffset !== false && $startOffset === $jpegOffset);

        if ($startOffset > 0) {
            Log::warning(
                "GIMG: Stripping {$startOffset} leading non-image byte(s) for log #{$logId}. " .
                "Prefix hex: " . bin2hex(substr($rawBytes, 0, min($startOffset, 64)))
            );
            $rawBytes = substr($rawBytes, $startOffset);
        }

        // ── 3. Prepare storage directory ─────────────────────────────────────
        Storage::disk('public')->makeDirectory('/satellite_images/original');

        $ext  = $isJpeg ? 'jpg' : 'png';
        $path = "satellite_images/original/image_{$imageId}_log_{$logId}.{$ext}";

        // ── 4. Try GD first; fall back to Imagick if available ───────────────
        $saved = false;

        // 4a. GD — works for baseline JPEG, PNG, GIF, WebP
        $gdImage = @imagecreatefromstring($rawBytes);
        if ($gdImage !== false) {
            $pngPath = "satellite_images/original/image_{$imageId}_log_{$logId}.png";
            ob_start();
            imagepng($gdImage);
            $pngData = ob_get_clean();
            Storage::disk('public')->put($pngPath, $pngData);
            imagedestroy($gdImage);
            $path  = $pngPath;
            $saved = true;
            Log::info("GIMG: GD decoded → PNG saved: {$path}");
        }

        // 4b. Imagick — handles CMYK JPEG, progressive JPEG, TIFF, WebP, etc.
        if (!$saved && class_exists('\Imagick')) {
            try {
                $im = new \Imagick();
                $im->readImageBlob($rawBytes);
                $im->setImageFormat('png');
                // Flatten in case of CMYK or multi-layer
                $im = $im->mergeImageLayers(\Imagick::LAYERMETHOD_FLATTEN);
                $im->transformImageColorspace(\Imagick::COLORSPACE_SRGB);
                $pngPath = "satellite_images/original/image_{$imageId}_log_{$logId}.png";
                Storage::disk('public')->put($pngPath, $im->getImageBlob());
                $im->destroy();
                $path  = $pngPath;
                $saved = true;
                Log::info("GIMG: Imagick decoded → PNG saved: {$path}");
            } catch (\Throwable $e) {
                Log::warning("GIMG: Imagick also failed for log #{$logId}: " . $e->getMessage());
            }
        }

        // 4c. Last resort — save raw bytes under the detected extension.
        //     The file is still usable: a browser / viewer that knows the format
        //     can open it, and it can be re-processed later.
        if (!$saved) {
            Storage::disk('public')->put($path, $rawBytes);
            Log::warning(
                "GIMG: Both GD and Imagick failed; raw {$ext} saved: {$path} ({$totalBytes} B). " .
                "Magic offset was {$startOffset}."
            );
        }

        // ── 5. Persist to `images` table ─────────────────────────────────────
        $imageRecord = Image::create([
            'original_path'  => $path,
            'command_log_id' => $logId,
            'meta_data'     => $metaData,
        ]);

        Log::info("GIMG: Image record #{$imageRecord->id} created for log #{$logId}.");
        return $imageRecord;
    }


    // ── Repository helpers ───────────────────────────────────────────────────

    public function getAllCommands()
    {
        return Command::all();
    }

    public function getAllCommandsWithSubsystems()
    {
        $commands = $this->getAllCommands();
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
            'SON'   => ['pwrl_id'],
            'SOFF'  => ['pwrl_id'],
            'GSTLM' => ['tlm_frame_seq_no'],
            'DIMG'  => ['image_id'],
            'GIMG'  => ['image_id', 'sequence_number', 'window_size'],
            'STIME' => ['timer_value'],
            'SMODE' => ['mode_id'],
        ];

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