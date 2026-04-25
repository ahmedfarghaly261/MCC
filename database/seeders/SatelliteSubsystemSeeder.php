<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SatelliteSubsystemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * * Based on EGSACUBE-ED SYSTEM ICD DOCUMENT Ver 3.2
     */
    public function run(): void
    {
        // Assuming a satellite with ID 1 already exists in the 'satellites' table
        $satelliteId = 1;

        $subsystems = [
            [
                'name' => 'OBC',
                'satellite_id' => $satelliteId,
                'hex_code' => '0xA1',
                'description' => 'Core subsystem responsible for supervising the collection, processing, storage, and routing of data within the platform.',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'EPS',
                'satellite_id' => $satelliteId,
                'hex_code' => '0xA2',
                'description' => 'Responsible for generating, storing, regulating, and distributing electrical power to all satellite subsystems.',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'ADCS',
                'satellite_id' => $satelliteId,
                'hex_code' => '0xA3',
                'description' => 'Determines satellite orientation and provides corrective control torques and orbital stabilization.',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'PL',
                'satellite_id' => $satelliteId,
                'hex_code' => '0xA4',
                'description' => 'Mission-oriented part of the satellite responsible for performing the primary operational tasks (sensors/instruments).',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'S-Band Communication',
                'satellite_id' => $satelliteId,
                'hex_code' => '0xA5',
                'description' => 'External communication interface used for high-speed data downlink and telemetry.',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],  [
                'name' => 'Broadcast',
                'satellite_id' => $satelliteId,
                'hex_code' => '0xFF',
                'description' => 'Broadcast subsystem',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'COMM',
                'satellite_id' => $satelliteId,
                'hex_code' => '0xA6',
                'description' => 'Primary communication link for receiving ground commands (uplink) and transmitting health telemetry.',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
           
        ];

        DB::table('satellite_subsystems')->insert($subsystems);
    }
}