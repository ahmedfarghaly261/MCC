<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Command;

class CommandSeeder extends Seeder
{
    /**
     * Run the database seeds based on EGSACUB ICD Table 10.
     */
    public function run(): void
    {
        // Subsystem Address mapping from Table 7 
        $subsystems = [
            'OBC'       => '0xA1',
            'EPS'       => '0xA2',
            'ADCS'      => '0xA3',
            'PL'        => '0xA4',
            'S-Band'    => '0xA5',
            'UHF'       => '0xA6',
            'GCS'       => '0xB0',
            'Broadcast' => '0xFF',
        ];

        $commands = [
            [
                'name' => 'Hi',
                'cmd_id' => 0x01,
                'description' => 'A broadcast command issued at subsystem startup',
                'allowed_sources' => [$subsystems['OBC'], $subsystems['EPS'], $subsystems['UHF'], $subsystems['S-Band'], $subsystems['ADCS'], $subsystems['PL']], // ALL 
                'allowed_destinations' => [$subsystems['Broadcast']],
                'expected_data_len' => 0,
                'requires_ack' => false, // No reply for this command 
            ],
            [
                'name' => 'ACK',
                'cmd_id' => 0x02,
                'description' => 'Acknowledge reply',
                'allowed_sources' => [$subsystems['OBC'], $subsystems['EPS'], $subsystems['ADCS'], $subsystems['PL'], $subsystems['S-Band'], $subsystems['UHF']],
                'allowed_destinations' => [$subsystems['GCS'], $subsystems['OBC']],
                'expected_data_len' => 1, // Data field is the CMD_ID of issued command
                'requires_ack' => false,
            ],
            [
                'name' => 'NACK',
                'cmd_id' => 0x03,
                'description' => 'No acknowledge reply',
                'allowed_sources' => [$subsystems['OBC'], $subsystems['EPS'], $subsystems['ADCS'], $subsystems['PL'], $subsystems['S-Band'], $subsystems['UHF']],
                'allowed_destinations' => [$subsystems['GCS'], $subsystems['OBC']],
                'expected_data_len' => 1, // Data field is the CMD_ID of issued command 
                'requires_ack' => false,
            ],
            [
                'name' => 'Ping',
                'cmd_id' => 0x04,
                'description' => 'Check subsystem status',
                'allowed_sources' => [$subsystems['OBC'], $subsystems['GCS']],
                'allowed_destinations' => [$subsystems['Broadcast'], $subsystems['OBC'], $subsystems['EPS'], $subsystems['ADCS'], $subsystems['PL']], // ALL 
                'expected_data_len' => 0,
                'requires_ack' => true,
            ],
            [
                'name' => 'STIME',
                'cmd_id' => 0x05,
                'description' => 'Set satellite time',
                'allowed_sources' => [$subsystems['OBC'], $subsystems['GCS']],
                'allowed_destinations' => [$subsystems['Broadcast'], $subsystems['OBC'], $subsystems['EPS'], $subsystems['ADCS'], $subsystems['PL']],
                'expected_data_len' => 8, // New Timer value is 8 bytes 
                'requires_ack' => true,
            ],
            [
                'name' => 'SMODE',
                'cmd_id' => 0x06,
                'description' => 'Set subsystem mode of operation',
                'allowed_sources' => [$subsystems['OBC'], $subsystems['GCS']],
                'allowed_destinations' => [$subsystems['Broadcast'], $subsystems['OBC'], $subsystems['EPS'], $subsystems['ADCS'], $subsystems['PL']],
                'expected_data_len' => 1, // Data field is the Mode_ID
                'requires_ack' => true,
            ],
            [
                'name' => 'GOTLM',
                'cmd_id' => 0x07,
                'description' => 'Get online subsystem telemetry',
                'allowed_sources' => [$subsystems['OBC'], $subsystems['GCS']],
                'allowed_destinations' => [$subsystems['OBC'], $subsystems['EPS'], $subsystems['ADCS'], $subsystems['PL']],
                'expected_data_len' => 0, // Data field is null
                'requires_ack' => true, // Destination replies with telemetry
            ],
            [
                'name' => 'GSTLM',
                'cmd_id' => 0x08,
                'description' => 'Get stored telemetry',
                'allowed_sources' => [$subsystems['GCS']],
                'allowed_destinations' => [$subsystems['OBC']],
                'expected_data_len' => 3, // Subsystem_Addr (1 byte) + Tlm_Frame_Seq_No (2 bytes) 
                'requires_ack' => true, // Reply is a window of 8 frames 
            ],
            [
                'name' => 'SON',
                'cmd_id' => 0x09,
                'description' => 'Switch ON subsystem power line',
                'allowed_sources' => [$subsystems['OBC'], $subsystems['GCS']],
                'allowed_destinations' => [$subsystems['EPS']],
                'expected_data_len' => 1, // Data field is PWRL_ID 
                'requires_ack' => true,
            ],
            [
                'name' => 'SOFF',
                'cmd_id' => 0x0A,
                'description' => 'Switch OFF subsystem power line',
                'allowed_sources' => [$subsystems['OBC'], $subsystems['GCS']],
                'allowed_destinations' => [$subsystems['EPS']],
                'expected_data_len' => 1, // Data field is PWRL_ID 
                'requires_ack' => true,
            ],
            [
                'name' => 'CIMG',
                'cmd_id' => 0x0C,
                'description' => 'Capture image',
                'allowed_sources' => [$subsystems['OBC'], $subsystems['GCS']],
                'allowed_destinations' => [$subsystems['PL']],
                'expected_data_len' => 1, // Variable size based on parameters
                'requires_ack' => true,
            ],
            [
                'name' => 'DIMG',
                'cmd_id' => 0x0D,
                'description' => 'Delete image',
                'allowed_sources' => [$subsystems['OBC'], $subsystems['GCS']],
                'allowed_destinations' => [$subsystems['PL']],
                'expected_data_len' => 2, // Data field consists of two bytes (image ID) 
                'requires_ack' => true,
            ],
            [
                'name' => 'GIMG',
                'cmd_id' => 0x0E,
                'description' => 'Get image',
                'allowed_sources' => [$subsystems['OBC'], $subsystems['GCS']],
                'allowed_destinations' => [$subsystems['PL']],
                'expected_data_len' => 8, // IMG_ID (2) + Seq_No (4) + Window (2)
                'requires_ack' => true,
            ],
        ];

        foreach ($commands as $command) {
            Command::updateOrCreate(['cmd_id' => $command['cmd_id']], $command);
        }
    }
}