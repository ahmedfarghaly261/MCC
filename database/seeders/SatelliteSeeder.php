<?php

namespace Database\Seeders;

use App\Models\Satellite;
use Illuminate\Database\Seeder;

class SatelliteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Satellite::updateOrCreate(
            ['norad_id' => 39444], 
            [
                'name'          => 'FUNcube-1 (AO-73)',
                'cospar_id'     => '2013-066B',
                'owner_country' => 'United Kingdom',
                'status'        => 'active',
                'launch_date'   => '2013-11-21',
                'description'   => 'An educational CubeSat designed to reach schools and colleges globally.',
            ]
        );

        Satellite::updateOrCreate(
            ['norad_id' => 39222], 
            [
                'name'          => 'EGSACUB-ED',
                'cospar_id'     => '2013-066C',
                'owner_country' => 'United Kingdom',
                'status'        => 'active',
                'launch_date'   => '2025-11-21',
                'description'   => 'A Graduation project CubeSat',
            ]
        );

    
        $this->command->info('Satellite 39444 (FUNcube-1) seeded successfully.');
        $this->command->info('Satellite 39222 (EGSACUB-ED) seeded successfully.');
    }
}