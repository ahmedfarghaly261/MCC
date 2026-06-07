<?php

namespace App\Services;

use App\Models\Command;
use App\Models\CommandLog;
use Carbon\Carbon;
use Exception;
use InvalidArgumentException;
use App\Enums\PowerLine;
use App\Enums\HtnGoalType;
use App\Enums\SatelliteMode;

class AutonomousMissionService
{
    public function __construct(
        protected CommandService $commandService
    ) {}

    /**
     * 1. HTN Layer: Expand high-level operations into specific primitives
     */
    public function decomposeGoal(HtnGoalType $goal, Carbon $startTime, array $parameters): array
    {
        $primitives = [];

        switch ($goal) {
            case HtnGoalType::MAP_CRATER_X:
                // Task A: Apply power to Payload via EPS 
                $primitives[] = [
                    'cmd_name' => 'SON',
                    'dest'     => 0xA2, // EPS Subsystem address 
                    'execute'  => $startTime->copy(),
                    'data'     => ['pwrl_id' => PowerLine::PWRL5] // Pass Enum Case Directly 
                ];

                // Task B: Transition satellite to Normal operation mode 
                $primitives[] = [
                    'cmd_name' => 'SMODE',
                    'dest'     => 0xA3, // ADCS Subsystem address 
                    'execute'  => $startTime->copy()->addSeconds(10),
                
                    'data'     => ['mode_id' => SatelliteMode::Normal->value]
                ];

                // Task C: Execute optical image capture
                $primitives[] = [
                    'cmd_name' => 'CIMG',
                    'dest'     => 0xA4, // PL Subsystem address 
                    'execute'  => $startTime->copy()->addSeconds(25),
                    'data'     => [
                        'image_id' => $parameters['image_id'] ?? 1
                    ]
                ];

                // Task D: Power off Payload line to conserve power 
                $primitives[] = [
                    'cmd_name' => 'SOFF',
                    'dest'     => 0xA2, // EPS Subsystem address 
                    'execute'  => $startTime->copy()->addSeconds(45),
                    'data'     => ['pwrl_id' => PowerLine::PWRL5] // Pass Enum Case Directly 
                ];
                break;

            case HtnGoalType::DOWNLOAD_MISSION_TELEMETRY:
                $rawSubsystem = $parameters['subsystem_addr'] ?? 0xA2;

                $targetSubsystem = is_string($rawSubsystem) && str_starts_with($rawSubsystem, '0x')
                    ? hexdec($rawSubsystem)
                    : (int) $rawSubsystem;

                $sequenceStart = $parameters['sequence_no'] ?? 0x0001;

                // Task A: Ensure OBC 5V Rail is explicitly ON (PWRL2) 
                $primitives[] = [
                    'cmd_name' => 'SON',
                    'dest'     => 0xA2,
                    'execute'  => $startTime->copy(),
                    'data'     => ['pwrl_id' => PowerLine::PWRL2]
                ];

                // Task B: Get Stored Telemetry Window from OBC memory (0x08) 
                $primitives[] = [
                    'cmd_name' => 'GSTLM',
                    'dest'     => 0xA1,
                    'execute'  => $startTime->copy()->addSeconds(15),
                    'data'     => [
                        'subsystem_addr'   => $targetSubsystem,
                        'tlm_frame_seq_no' => $sequenceStart
                    ]
                ];
                break;

            case HtnGoalType::SAFE_MODE_RECOVERY:
                // Task A: Check ADCS status via Ping 
                $primitives[] = [
                    'cmd_name' => 'Ping',
                    'dest'     => 0xA3,
                    'execute'  => $startTime->copy(),
                    'data'     => []
                ];

                // Task B: Force ADCS into safe Detumbling state 
                $primitives[] = [
                    'cmd_name' => 'SMODE',
                    'dest'     => 0xA3,
                    'execute'  => $startTime->copy()->addSeconds(5),
                    'data'     => ['mode_id' => SatelliteMode::DeTumbling->value]
                ];

                // Task C: Kill power to Payload 5V rail (PWRL6)
                $primitives[] = [
                    'cmd_name' => 'SOFF',
                    'dest'     => 0xA2,
                    'execute'  => $startTime->copy()->addSeconds(15),
                    'data'     => ['pwrl_id' => \App\Enums\PowerLine::PWRL6] // Pass Enum Case Directly 
                ];
                break;

            case HtnGoalType::DOWNLINK_IMAGE_DATA:
                if (!isset($parameters['image_id'])) {
                    throw new InvalidArgumentException("Downlink goals require a specific 'image_id' context parameter.");
                }

                // Task A: Power on the S-Band transmitter (PWRL4 - 5V Comm) 
                $primitives[] = [
                    'cmd_name' => 'SON',
                    'dest'     => 0xA2,
                    'execute'  => $startTime->copy(),
                    'data'     => ['pwrl_id' => \App\Enums\PowerLine::PWRL4] // Pass Enum Case Directly 
                ];

                // Task B: Command the S-Band transmitter to stream data down
                $primitives[] = [
                    'cmd_name' => 'GIMG',
                    'dest'     => 0xA5,
                    'execute'  => $startTime->copy()->addSeconds(20),
                    'data'     => [
                        'image_id'        => $parameters['image_id'],
                        'sequence_number' => $parameters['sequence_number'] ?? 0,
                        'window_size'     => $parameters['window_size'] ?? 10
                    ]
                ];
                break;

            default:
                throw new Exception("The HTN Goal [{$goal->name}] is missing structural primitive mappings.");
        }

        return $primitives;
    }
    /**
     * 2. Digital Twin Layer: Validate power, communication segments, and logical constraints
     */

    public function runDigitalTwinSimulation(array $primitives): array
    {
        // Sandbox environmental state tracking
        $simulatedVbat    = 4150; // Starting voltage representation (mV)
        $payloadIsOn      = false;
        $commsSegmentIsOn = false;

        foreach ($primitives as $primitive) {
            $name = $primitive['cmd_name'];
            $data = $primitive['data'];

            $pwrlId = $data['pwrl_id'] ?? null;
            if ($pwrlId instanceof PowerLine) {
                $pwrlId = $pwrlId->value;
            }

            // Track Payload line status
            // (Replaced magic numbers with clean Enum definitions)
            if ($name === 'SON' && $pwrlId === PowerLine::PWRL5->value) {
                $payloadIsOn = true;
                $simulatedVbat -= 60; // Predict typical startup transient draw drop
            }
            if ($name === 'SOFF' && $pwrlId === PowerLine::PWRL5->value) {
                $payloadIsOn = false;
            }

            // Track S-Band/Comm line status
            if ($name === 'SON' && $pwrlId === PowerLine::PWRL4->value) {
                $commsSegmentIsOn = true;
                $simulatedVbat -= 80; // High transient drop for radio transmitters
            }
            if ($name === 'SOFF' && $pwrlId === PowerLine::PWRL4->value) {
                $commsSegmentIsOn = false;
            }

            // Logical Safeguard: Image capturing 
            if ($name === 'CIMG') {
                if (!$payloadIsOn) {
                    return [
                        'isValid' => false,
                        'reason'  => "Simulation Error: CIMG scheduled at {$primitive['execute']} but Payload power line (PWRL5) is OFF."
                    ];
                }
                $simulatedVbat -= 150; // Heavy sensor frame compilation load draw
            }

            // Logical Safeguard: Image Downlinking
            if ($name === 'GIMG') {
                if (!$commsSegmentIsOn) {
                    return [
                        'isValid' => false,
                        'reason'  => "Simulation Error: GIMG scheduled at {$primitive['execute']} but High-Rate Comms line (PWRL4) is OFF."
                    ];
                }
                $simulatedVbat -= 250; // Predict continuous amplifier transmission consumption load
            }

            // General power drops for standard communication commands 
            if (in_array($name, ['GSTLM', 'SMODE', 'Ping'])) {
                $simulatedVbat -= 20; // Minor CPU/OBC consumption spike
            }

            // Anomaly safety boundary limit check
            if ($simulatedVbat < 3600) {
                return [
                    'isValid' => false,
                    'reason'  => "Simulation Aborted: Planned sequence drops battery below absolute safe margin ({$simulatedVbat}mV) at task '{$name}'."
                ];
            }
        }

        return ['isValid' => true, 'reason' => 'Simulation completed successfully. No anomalies predicted.'];
    }
}
