<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Command;

class CommandSeeder extends Seeder
{
    public function run(): void
    {
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
                'allowed_sources' => [$subsystems['OBC'], $subsystems['EPS'], $subsystems['UHF'], $subsystems['S-Band'], $subsystems['ADCS'], $subsystems['PL']],
                'allowed_destinations' => [$subsystems['Broadcast']],
                'expected_data_len' => 0,
                'requires_ack' => false,
                'required_data_fields' => [],
            ],
            [
                'name' => 'ACK',
                'cmd_id' => 0x02,
                'description' => 'Acknowledge reply',
                'allowed_sources' => [$subsystems['OBC'], $subsystems['EPS'], $subsystems['ADCS'], $subsystems['PL'], $subsystems['S-Band'], $subsystems['UHF']],
                'allowed_destinations' => [$subsystems['GCS'], $subsystems['OBC']],
                'expected_data_len' => 1,
                'requires_ack' => false,
                'required_data_fields' => [],
            ],
            [
                'name' => 'NACK',
                'cmd_id' => 0x03,
                'description' => 'No acknowledge reply',
                'allowed_sources' => [$subsystems['OBC'], $subsystems['EPS'], $subsystems['ADCS'], $subsystems['PL'], $subsystems['S-Band'], $subsystems['UHF']],
                'allowed_destinations' => [$subsystems['GCS'], $subsystems['OBC']],
                'expected_data_len' => 1,
                'requires_ack' => false,
                'required_data_fields' => [],
            ],
            [
                'name' => 'Ping',
                'cmd_id' => 0x04,
                'description' => 'Check subsystem status',
                'allowed_sources' => [$subsystems['OBC'], $subsystems['GCS']],
                'allowed_destinations' => [$subsystems['Broadcast'], $subsystems['OBC'], $subsystems['EPS'], $subsystems['ADCS'], $subsystems['PL']],
                'expected_data_len' => 0,
                'requires_ack' => true,
                'required_data_fields' => [],
            ],
            [
                'name' => 'STIME',
                'cmd_id' => 0x05,
                'description' => 'Set satellite time',
                'allowed_sources' => [$subsystems['OBC'], $subsystems['GCS']],
                'allowed_destinations' => [$subsystems['Broadcast'], $subsystems['OBC'], $subsystems['EPS'], $subsystems['ADCS'], $subsystems['PL']],
                'expected_data_len' => 8,
                'requires_ack' => true,
                'required_data_fields' => ['timer_value'],
            ],
            [
                'name' => 'SMODE',
                'cmd_id' => 0x06,
                'description' => 'Set subsystem mode of operation',
                'allowed_sources' => [$subsystems['OBC'], $subsystems['GCS']],
                'allowed_destinations' => [$subsystems['Broadcast'], $subsystems['OBC'], $subsystems['EPS'], $subsystems['ADCS'], $subsystems['PL']],
                'expected_data_len' => 1,
                'requires_ack' => true,
                'required_data_fields' => ['mode_id'],
            ],
            [
                'name' => 'GOTLM',
                'cmd_id' => 0x07,
                'description' => 'Get online subsystem telemetry',
                'allowed_sources' => [$subsystems['OBC'], $subsystems['GCS']],
                'allowed_destinations' => [$subsystems['OBC'], $subsystems['EPS'], $subsystems['ADCS'], $subsystems['PL']],
                'expected_data_len' => 0,
                'requires_ack' => true,
                'required_data_fields' => [],
            ],
            [
                'name' => 'GSTLM',
                'cmd_id' => 0x08,
                'description' => 'Get stored telemetry',
                'allowed_sources' => [$subsystems['GCS']],
                'allowed_destinations' => [$subsystems['OBC']],
                'expected_data_len' => 3,
                'requires_ack' => true,
                'required_data_fields' => ['subsystem_addr', 'tlm_frame_seq_no'],
            ],
            [
                'name' => 'SON',
                'cmd_id' => 0x09,
                'description' => 'Switch ON subsystem power line',
                'allowed_sources' => [$subsystems['OBC'], $subsystems['GCS']],
                'allowed_destinations' => [$subsystems['EPS']],
                'expected_data_len' => 1,
                'requires_ack' => true,
                'required_data_fields' => ['pwrl_id'],
            ],
            [
                'name' => 'SOFF',
                'cmd_id' => 0x0A,
                'description' => 'Switch OFF subsystem power line',
                'allowed_sources' => [$subsystems['OBC'], $subsystems['GCS']],
                'allowed_destinations' => [$subsystems['EPS']],
                'expected_data_len' => 1,
                'requires_ack' => true,
                'required_data_fields' => ['pwrl_id'],
            ],
            [
                'name' => 'CIMG',
                'cmd_id' => 0x0C,
                'description' => 'Capture image',
                'allowed_sources' => [$subsystems['OBC'], $subsystems['GCS']],
                'allowed_destinations' => [$subsystems['PL']],
                'expected_data_len' => 1,
                'requires_ack' => true,
                'required_data_fields' => ['capture_params'],
            ],
            [
                'name' => 'DIMG',
                'cmd_id' => 0x0D,
                'description' => 'Delete image',
                'allowed_sources' => [$subsystems['OBC'], $subsystems['GCS']],
                'allowed_destinations' => [$subsystems['PL']],
                'expected_data_len' => 2,
                'requires_ack' => true,
                'required_data_fields' => ['image_id'],
            ],
            [
                'name' => 'GIMG',
                'cmd_id' => 0x0E,
                'description' => 'Get image',
                'allowed_sources' => [$subsystems['OBC'], $subsystems['GCS']],
                'allowed_destinations' => [$subsystems['PL']],
                'expected_data_len' => 8,
                'requires_ack' => true,
                'required_data_fields' => ['img_id', 'sequence_number', 'window_size'],
            ],
        ];

        foreach ($commands as $command) {
            Command::updateOrCreate(['cmd_id' => $command['cmd_id']], $command);
        }
    }
}