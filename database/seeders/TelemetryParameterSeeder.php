<?php 
namespace Database\Seeders;

use App\Models\Satellite;
use App\Models\SatelliteSubsystem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TelemetryParameterSeeder extends Seeder
{
    public function run(): void
    {
        // Target both FUNcube-1 and your Graduation Project satellite
        $satellites = Satellite::whereIn('norad_id', [39444, 39222])->get();

        foreach ($satellites as $sat) {
            $parameters = $this->getActualFrameParameters($sat->id);

            foreach ($parameters as $param) {
                // Find the subsystem ID for this specific satellite/code combo
                $subsystemId = DB::table('satellite_subsystems')
                    ->where('satellite_id', $sat->id)
                    ->where('subsystem_name', $param['sub_code'])
                    ->value('id');

                if ($subsystemId) {
                    DB::table('telemetry_parameters')->updateOrInsert(
                        [
                            'satellite_id'    => $sat->id,
                            'subsystem_id'    => $subsystemId,
                            'parameter_name'  => $param['name'] // Matching the JSON key exactly
                        ],
                        [
                            'parameter_index' => $param['index'],
                            'unit'           => $param['unit'],
                            'description'    => $param['desc'],
                            'created_at'     => now(),
                            'updated_at'     => now(),
                        ]
                    );
                }
            }
        }
    }

    private function getActualFrameParameters($satId): array
    {
        return [
            // --- EPS (Electrical Power System) ---
            ['sub_code' => 'EPS', 'index' => 1, 'name' => 'EPS_Solar_Panel_Voltage_X', 'unit' => 'mV', 'desc' => 'Solar panel X voltage'],
            ['sub_code' => 'EPS', 'index' => 2, 'name' => 'EPS_Battery_Voltage', 'unit' => 'mV', 'desc' => 'Main battery bus voltage'],
            ['sub_code' => 'EPS', 'index' => 3, 'name' => 'EPS_Total_System_Current', 'unit' => 'mA', 'desc' => 'Total current consumption'],
            ['sub_code' => 'EPS', 'index' => 4, 'name' => 'EPS_Battery_Temp', 'unit' => '°C', 'desc' => 'Battery pack temperature'],

            // --- RF / UHF (Radio) ---
            ['sub_code' => 'UHF', 'index' => 10, 'name' => 'RF_Receiver_RSSI', 'unit' => 'dBm', 'desc' => 'Received Signal Strength Indication'],
            ['sub_code' => 'UHF', 'index' => 11, 'name' => 'RF_Temperature', 'unit' => '°C', 'desc' => 'Radio board temperature'],

            // --- PA (Power Amplifier) ---
            ['sub_code' => 'UHF', 'index' => 20, 'name' => 'PA_Forward_Power', 'unit' => 'mW', 'desc' => 'Transmitted forward power'],
            ['sub_code' => 'UHF', 'index' => 21, 'name' => 'PA_Reverse_Power', 'unit' => 'mW', 'desc' => 'Reflected power'],

            // --- ANTS (Antennas) ---
            ['sub_code' => 'OBC', 'index' => 30, 'name' => 'ANTS_Antenna_0_Deployed', 'unit' => 'bool', 'desc' => 'Deployment status of antenna 0'],
            ['sub_code' => 'OBC', 'index' => 31, 'name' => 'ANTS_Antenna_1_Deployed', 'unit' => 'bool', 'desc' => 'Deployment status of antenna 1'],

            // --- SW (Software Status) ---
            ['sub_code' => 'OBC', 'index' => 40, 'name' => 'SW_Sequence_Number', 'unit' => 'cnt', 'desc' => 'Total frames transmitted'],
            ['sub_code' => 'OBC', 'index' => 41, 'name' => 'SW_In_Eclipse', 'unit' => 'bool', 'desc' => 'Satellite eclipse status'],
        ];
    }
}