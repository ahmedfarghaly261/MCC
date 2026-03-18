<?php

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Schedule;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Schedule::command('satellite:get-tle')->everyMinute();
Schedule::command('satellite:get-tle 39444')->everyMinute();
