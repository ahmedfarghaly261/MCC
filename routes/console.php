<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Jobs\RetryDecodingErrorsJob;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');



Schedule::job(new RetryDecodingErrorsJob())
    ->everyMinute() 
    ->withoutOverlapping();

Schedule::command('satellite:get-tle')->everyMinute();
Schedule::command('satellite:get-tle 39444')->everyMinute();
Schedule::command('app:detect-anomalies-command')->everyMinute();
