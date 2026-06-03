<?php

namespace App\Enums;

enum HtnGoalType: string
{
    case MAP_CRATER_X = 'MAP_CRATER_X';
    case DOWNLOAD_MISSION_TELEMETRY = 'DOWNLOAD_MISSION_TELEMETRY';
    case SAFE_MODE_RECOVERY = 'SAFE_MODE_RECOVERY';
    case DOWNLINK_IMAGE_DATA = 'DOWNLINK_IMAGE_DATA';

    /**
     * Get a user-friendly label for the UI.
     */
    public function label(): string
    {
        return match($this) {
            self::MAP_CRATER_X => 'Map Crater X',
            self::DOWNLOAD_MISSION_TELEMETRY => 'Download Mission Telemetry',
            self::SAFE_MODE_RECOVERY => 'Safe Mode Recovery',
            self::DOWNLINK_IMAGE_DATA => 'Downlink Image Data',
        };
    }

    /**
     * Get a detailed description of what the high-level goal accomplishes.
     */
    public function description(): string
    {
        return match($this) {
            self::MAP_CRATER_X => 'Powers up the payload subsystem, transitions the ADCS to normal operation mode, captures a localized visual map, and spins down power lines.',
            self::DOWNLOAD_MISSION_TELEMETRY => 'Commands the On-Board Computer (OBC) to extract historical telemetry windows from active flash memory storage layers.',
            self::SAFE_MODE_RECOVERY => 'Runs loopback ping diagnostic health checks, isolates systemic anomalies, and transitions critical arrays into emergency safe/detumbling states.',
            self::DOWNLINK_IMAGE_DATA => 'Spins up the high-rate S-Band communication transmitter rails to stream captured image packets down to Earth.',
        };
    }

    /**
     * Define expected parameter keys or schemas for validation rules.
     */
    public function expectedParameters(): array
    {
        return match($this) {
            self::MAP_CRATER_X => [
                'image_id' => ['type' => 'integer', 'required' => false, 'default' => 1]
            ],
            self::DOWNLOAD_MISSION_TELEMETRY => [
                'subsystem_addr' => ['type' => 'hex', 'required' => false, 'default' => '0xA2'],
                'sequence_no' => ['type' => 'integer', 'required' => false, 'default' => 1]
            ],
            self::SAFE_MODE_RECOVERY => [],
            self::DOWNLINK_IMAGE_DATA => [
                'image_id' => ['type' => 'integer', 'required' => true],
                'sequence_number' => ['type' => 'integer', 'required' => false, 'default' => 0],
                'window_size' => ['type' => 'integer', 'required' => false, 'default' => 10]
            ],
        };
    }
}