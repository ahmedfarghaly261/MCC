<?php
namespace Database\Seeders;

use App\Models\Satellite;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SatelliteSubsystemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Fetch all seeded satellites to ensure we attach subsystems to each
        $satellites = Satellite::all();

        if ($satellites->isEmpty()) {
            $this->command->error('No satellites found. Please run SatelliteSeeder first!');
            return;
        }

        // Subsystem definitions with their official EgSA/FUNcube hex addresses
        $subsystems = [
            ['name' => 'On-Board Computer',            'code' => 'OBC',    'hex' => '0xA1'],
            ['name' => 'Electrical Power System',      'code' => 'EPS',    'hex' => '0xA2'],
            ['name' => 'Attitude Determination & Control', 'code' => 'ADCS', 'hex' => '0xA3'],
            ['name' => 'Payload (MSE Experiment)',     'code' => 'PL',     'hex' => '0xA4'],
            ['name' => 'S-Band Transceiver',           'code' => 'S_BAND', 'hex' => '0xA5'],
            ['name' => 'UHF Transceiver',              'code' => 'UHF',    'hex' => '0xA6'],
        ];

        foreach ($satellites as $satellite) {
            foreach ($subsystems as $sub) {
                DB::table('satellite_subsystems')->updateOrInsert(
                    [
                        'satellite_id'   => $satellite->id, 
                        'subsystem_name' => $sub['code']
                    ], 
                    [
                        'status'     => 'unknown',
                        'hex_code'   => $sub['hex'], 
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
            $this->command->info("Subsystems seeded for: {$satellite->name}");
        }
    }
}