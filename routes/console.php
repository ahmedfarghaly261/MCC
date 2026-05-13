<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Jobs\RetryDecodingErrorsJob;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');



Schedule::job(new RetryDecodingErrorsJob())
    ->everyTenMinutes() 
    ->withoutOverlapping();

Schedule::command('satellite:get-tle')->Hourly();
Schedule::command('satellite:get-tle 39444')->Hourly();
Schedule::command('app:detect-anomalies-command')->Hourly();
