<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SatelliteSubsystemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $satelliteId = 1; 

        $subsystems = [
            [
                'satellite_id'   => $satelliteId,
                'name' => 'EPS', // Matches Decoder Key
                'description'    => 'Electrical Power System',
                'hex_code'       => '0xA2',
                'status'         => 'active',
            ],
            [
                'satellite_id'   => $satelliteId,
                'name' => 'ASIB', // Matches Decoder Key
                'description'    => 'Interface Board / Sensors',
                'hex_code'       => '0xA4', 
                'status'         => 'active',
            ],
            [
                'satellite_id'   => $satelliteId,
                'name' => 'RF', // Matches Decoder Key
                'description'    => 'Radio Frequency Module',
                'hex_code'       => '0xA5',
                'status'         => 'active',
            ],
            [
                'satellite_id'   => $satelliteId,
                'name' => 'PA', // Matches Decoder Key
                'description'    => 'Power Amplifier',
                'hex_code'       => '0xA5', // Often shares address with RF or sub-addressed
                'status'         => 'active',
            ],
            [
                'satellite_id'   => $satelliteId,
                'name' => 'ANTS', // Matches Decoder Key
                'description'    => 'Antenna Deployment System',
                'hex_code'       => '0xA6', 
                'status'         => 'active',
            ],
            [
                'satellite_id'   => $satelliteId,
                'name' => 'SW', // Matches Decoder Key
                'description'    => 'Software/System Status',
                'hex_code'       => '0xA1', 
                'status'         => 'active',
            ],
            [
                'satellite_id'   => $satelliteId,
                'name' => 'GCS', 
                'description'    => 'Ground Control Station',
                'hex_code'       => '0xB0', 
                'status'         => 'active',
            ],
            [
                'satellite_id'   => $satelliteId,
                'name' => 'Broadcast', 
                'description'    => 'Broadcast Address',
                'hex_code'       => '0xFF',
                'status'         => 'system',
            ],
        ];

        foreach ($subsystems as $subsystem) {
            // We use subsystem_name as the unique key to match the Decoder
            DB::table('satellite_subsystems')->updateOrInsert(
                [
                    'satellite_id'   => $subsystem['satellite_id'], 
                    'name' => $subsystem['name']
                ],
                array_merge($subsystem, [
                    'created_at' => now(), 
                    'updated_at' => now()
                ])
            );
        }
    }
}