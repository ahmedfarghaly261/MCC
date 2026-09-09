<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

use App\Models\CommandLog;
use App\Jobs\DetectAnomaliesJob;
use Illuminate\Support\Facades\Log;

class DetectAnomaliesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:detect-anomalies-command';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $unprocessedLogs = CommandLog::whereNull('processed_at')
            ->whereHas('telemetryLogs') 
            ->get();

        if ($unprocessedLogs->isEmpty()) {
            $this->info('No new telemetry frames to process.');
            return;
        }

        $this->info("Dispatching detection jobs for {$unprocessedLogs->count()} frames...");

        foreach ($unprocessedLogs as $log) {
            DetectAnomaliesJob::dispatch($log);
        }

        $this->info('All jobs have been dispatched to the queue.');
    }
}
