<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TelemetryParameterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // IDs based on Section 6.1.4 Satellite identification addresses
        $subsystems = [
            'EPS'  => 0xA2,
            'OBC'  => 0xA1,
            'ADCS' => 0xA3,
            'PL'   => 0xA4,
            'COMM' => 0xA6, 
        ];

        $satelliteId = 1; // Assuming a default satellite ID , placeholder
        $telemetryData = [];

        // --- 7.1 EPS TELEMETRY [cite: 443, 444] ---
        $epsParams = [
            ['index' => 0, 'name' => 'Address', 'desc' => 'Subsystem address'],
            ['index' => 1, 'name' => 'Mode', 'desc' => 'Subsystem mode'],
            ['index' => 2, 'name' => 'Time', 'desc' => 'Subsystem time'],
            ['index' => 3, 'name' => 'RTC', 'desc' => 'Subsystem RTC counter'],
            ['index' => 4, 'name' => 'Solar_1 V', 'desc' => 'Solar panel NO.1 voltage'],
            ['index' => 5, 'name' => 'Solar 1 C', 'desc' => 'Solar panel NO.1 current'],
            ['index' => 6, 'name' => 'Solar 2 V', 'desc' => 'Solar panel NO.2 voltage'],
            ['index' => 7, 'name' => 'Solar 2 C', 'desc' => 'Solar panel NO.2 current'],
            ['index' => 8, 'name' => 'Solar 3 V', 'desc' => 'Solar panel NO.3 voltage'],
            ['index' => 9, 'name' => 'Solar 3 C', 'desc' => 'Solar panel NO.3 current'],
            ['index' => 10, 'name' => 'VBAT', 'desc' => 'Battery voltage'],
            ['index' => 11, 'name' => 'IBAT', 'desc' => 'Battery current'],
            ['index' => 12, 'name' => 'BUS_1_V', 'desc' => 'Satellite BUS 1 voltage'],
            ['index' => 13, 'name' => 'BUS_1_C', 'desc' => 'Satellite BUS 1 current'],
            ['index' => 14, 'name' => 'BUS_2_V', 'desc' => 'Satellite BUS 2 voltage'],
            ['index' => 15, 'name' => 'BUS_2_C', 'desc' => 'Satellite BUS 2 current'],
            ['index' => 16, 'name' => 'Line Status', 'desc' => 'Power lines status ON/OFF'],
            ['index' => 17, 'name' => 'Temp', 'desc' => 'EPS Temperature value'],
        ];

        // --- 7.2 OBC TELEMETRY [cite: 450, 451] ---
        $obcParams = [
            ['index' => 0, 'name' => 'Address', 'desc' => 'Subsystem address'],
            ['index' => 1, 'name' => 'Mode', 'desc' => 'Subsystem mode'],
            ['index' => 2, 'name' => 'Time', 'desc' => 'Subsystem time'],
            ['index' => 3, 'name' => 'RTC', 'desc' => 'Subsystem RTC counter'],
            ['index' => 4, 'name' => 'Longitude', 'desc' => 'GPS longitude'],
            ['index' => 5, 'name' => 'Latitude', 'desc' => 'GPS Latitude'],
            ['index' => 6, 'name' => 'velN', 'desc' => 'North velocity in cm/s'],
            ['index' => 7, 'name' => 'velE', 'desc' => 'East velocity in cm/s'],
            ['index' => 8, 'name' => 'velD', 'desc' => 'Down velocity in cm/s'],
            ['index' => 9, 'name' => 'ITOW', 'desc' => 'GPS time of week in ms'],
            ['index' => 10, 'name' => 'RX CMD counts', 'desc' => 'Number of received commands'],
            ['index' => 11, 'name' => 'TX CMD counts', 'desc' => 'Number of transmitted Command'],
            ['index' => 12, 'name' => 'Last CMD', 'desc' => 'Last received command'],
            ['index' => 13, 'name' => 'EPS SRecords', 'desc' => 'EPS stored TLM Records'],
            ['index' => 15, 'name' => 'OBC SRecords', 'desc' => 'OBC stored TLM Records'],
            ['index' => 16, 'name' => 'ADCS SRecords', 'desc' => 'ADCS stored TLM Records'],
            ['index' => 17, 'name' => 'COMM SRecords', 'desc' => 'COMM stored TLM Records'],
            ['index' => 18, 'name' => 'PL SRecords', 'desc' => 'Payload stored TLM Records'],
        ];

        // --- 7.3 ADCS TELEMETRY [cite: 456, 457] ---
        $adcsParams = [
            ['index' => 0, 'name' => 'Address', 'desc' => 'Subsystem address'],
            ['index' => 1, 'name' => 'Mode', 'desc' => 'Subsystem mode'],
            ['index' => 2, 'name' => 'Time', 'desc' => 'Subsystem time'],
            ['index' => 3, 'name' => 'RTC', 'desc' => 'Subsystem RTC counter'],
            ['index' => 4, 'name' => 'accel_x', 'desc' => 'Acceleration in X direction'],
            ['index' => 5, 'name' => 'accel_y', 'desc' => 'Acceleration in Y direction'],
            ['index' => 6, 'name' => 'accel_z', 'desc' => 'Acceleration in Z direction'],
            ['index' => 7, 'name' => 'Gyro X', 'desc' => 'Gyro readings in X'],
            ['index' => 8, 'name' => 'Gyro Y', 'desc' => 'Gyro readings in Y'],
            ['index' => 9, 'name' => 'Gyro Z', 'desc' => 'Gyro readings in Z'],
            ['index' => 10, 'name' => 'MM X', 'desc' => 'Magnetometer in X'],
            ['index' => 11, 'name' => 'MM Y', 'desc' => 'Magnetometer in Y'],
            ['index' => 12, 'name' => 'MM Z', 'desc' => 'Magnetometer in Z'],
            ['index' => 13, 'name' => 'RW RPM', 'desc' => 'Reaction Wheel RPM'],
        ];

        // --- 7.4 COMM TELEMETRY [cite: 463, 464] ---
        $commParams = [
            ['index' => 0, 'name' => 'Address', 'desc' => 'Subsystem address'],
            ['index' => 1, 'name' => 'Mode', 'desc' => 'Subsystem mode'],
            ['index' => 2, 'name' => 'Time', 'desc' => 'Subsystem time'],
            ['index' => 3, 'name' => 'RTC', 'desc' => 'Subsystem RTC counter'],
            ['index' => 4, 'name' => 'Total RX frames', 'desc' => 'Total Number of received frames'],
            ['index' => 5, 'name' => 'Correct RX frames', 'desc' => 'Number of correct received frames'],
            ['index' => 6, 'name' => 'Last CMD', 'desc' => 'Last received command'],
            ['index' => 7, 'name' => 'Rate', 'desc' => 'Transceiver data rate'],
            ['index' => 8, 'name' => 'RF Power level', 'desc' => 'Transmitter output power'],
        ];

        // --- 7.5 PAYLOAD TELEMETRY [cite: 470, 471] ---
        $plParams = [
            ['index' => 0, 'name' => 'Address', 'desc' => 'Subsystem address'],
            ['index' => 1, 'name' => 'Mode', 'desc' => 'Subsystem mode'],
            ['index' => 2, 'name' => 'Time', 'desc' => 'Subsystem time'],
            ['index' => 3, 'name' => 'RTC', 'desc' => 'Subsystem RTC counter'],
            ['index' => 4, 'name' => 'NO of IMGS', 'desc' => 'Number or captured images'],
            ['index' => 5, 'name' => 'image NO_1', 'desc' => 'Image No.1 Identifier'],
            ['index' => 6, 'name' => 'IMG size', 'desc' => 'Size of Image No.1 in bytes'],
            ['index' => 7, 'name' => 'IMG parameters', 'desc' => 'IMG No. 1 parameter'],
            ['index' => 11, 'name' => 'Rate', 'desc' => 'Transceiver data rate'],
            ['index' => 12, 'name' => 'RF Power level', 'desc' => 'Transmitter output power'],
            ['index' => 13, 'name' => 'Total frames', 'desc' => 'Total frames of transmitted IMG'],
            ['index' => 14, 'name' => 'TX frames', 'desc' => 'Actual transmitted frames'],
            ['index' => 15, 'name' => 'GStation', 'desc' => 'Number of ground stations in relay communication'],
            ['index' => 16, 'name' => 'Relay Mode', 'desc' => 'Relay communication mode'],
        ];

        $allSubsystems = [
            'EPS' => $epsParams,
            'OBC' => $obcParams,
            'ADCS' => $adcsParams,
            'COMM' => $commParams,
            'PL' => $plParams,
        ];

        foreach ($allSubsystems as $key => $params) {
            foreach ($params as $param) {
                $telemetryData[] = [
                    'satellite_id' => $satelliteId,
                    'subsystem_id' => $subsystems[$key],
                    'parameter_index' => $param['index'],
                    'parameter_name' => $param['name'],
                    'description' => $param['desc'],
                    'unit' => null, // Units not explicitly defined in the provided tables
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        DB::table('telemetry_parameters')->insert($telemetryData);
    }
}