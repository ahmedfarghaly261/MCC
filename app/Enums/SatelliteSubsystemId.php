<?php


// namespace App\Enums;    

// // Define an enum for satellite subsystem IDs based on the ICD specification
// enum SatelliteSubsystemId: int
// {
//     case OBC = 0xA1; // On-Board Computer
//     case EPS = 0xA2; // Electrical Power System
//     case ADCS = 0xA3; // Attitude Determination and Control System
//     case PL = 0xA4; // Payload
//     case S_BAND = 0xA5; // S-Band Communication
//     case UHF = 0xA6; // UHF Communication
//     //case COMM = 0xA7; // General Communication
//     case GCS = 0xB0; // Ground Control Station
//     case BROADCAST = 0xFF; // Broadcast/Unknown

//     public function label(): string
//     {
//         return match($this) {
//             self::OBC => 'OBC',
//             self::EPS => 'EPS',
//             self::ADCS => 'ADCS',
//             self::PL => 'Payload',
//             self::S_BAND => 'S-Band',
//             self::UHF => 'UHF',
//             //self::COMM => 'COMM',
//             self::GCS => 'GCS',
//             self::BROADCAST => 'Broadcast',
//         };
//     }
// }