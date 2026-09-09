<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\CommandSchedule;
use App\Models\CommandLog;
use App\Jobs\SendCommandJob;
use App\Services\CommandService;

class ProcessSatelliteTimeline extends Command
{
    protected $signature = 'mcc:process-atc';
    protected $description = 'Pops active schedules and creates matching runtime entries on-demand';


    public function handle()
    {
        $this->info("ATC Loop checking timeline...");

        // A quick local in-memory array to track batch parents across loop runs
        $activeBatchParents = [];

        while (true) {
            $jobsDue = CommandSchedule::where('status', 'pending')
                ->where('execute_at', '<=', now())
                ->orderBy('execute_at', 'asc')
                ->get();

            foreach ($jobsDue as $schedule) {
                $schedule->update(['status' => 'executed']);

                $commandService = app(CommandService::class);
                $binaryFrame    = $commandService->buildCsspFrame($schedule->command, $schedule->dest_address, $schedule->data);

                // Determine if this command has an active parent within its batch group
                $parentId = null;
                if ($schedule->batch_uuid) {
                    if (isset($activeBatchParents[$schedule->batch_uuid])) {
                        // Link directly to the first command's log ID
                        $parentId = $activeBatchParents[$schedule->batch_uuid];
                    }
                }

                // Create our immutable log entry on-demand
                $log = CommandLog::create([
                    'command_id'      => $schedule->command_id,
                    'parent_id'       => $parentId, // Null for the first item, integer for children
                    'dest_address'    => sprintf('0x%02X', $schedule->dest_address),
                    'src_address'     => sprintf('0x%02X', 0xB0),
                    'raw_binary_sent' => bin2hex($binaryFrame),
                    'status'          => 'pending',
                    'data'            => $schedule->data,
                    'sent_at'         => now(),
                ]);

                // If this is the first command in a batch, register its ID as the parent for the rest
                if ($schedule->batch_uuid && !isset($activeBatchParents[$schedule->batch_uuid])) {
                    $activeBatchParents[$schedule->batch_uuid] = $log->id;
                }

                // Dispatch using your traditional job pipeline
                $job = new SendCommandJob(
                    $schedule->command_id,
                    $schedule->dest_address,
                    $schedule->data,
                    $log->id,
                    $schedule->command->name
                );

                if ($schedule->command->name === 'GIMG') {
                    $job->onQueue('images');
                }

                dispatch($job);
            }

            // Periodically clear old cache entries to maintain optimal performance
            if (rand(1, 100) === 50) {
                $activeBatchParents = [];
            }

            usleep(500000);
        }
    }
}
