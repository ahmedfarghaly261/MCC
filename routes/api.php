<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TelemetryParameterController;
use App\Http\Controllers\CommandController;
use App\Http\Controllers\TelemetryController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::apiResource('telemetry-parameters', TelemetryParameterController::class);

Route::prefix('mcc/command')->group(function () {
    Route::get('/history', [CommandController::class, 'history']);
    Route::post('/send', [CommandController::class, 'send']);
    Route::get('/log/{id}', [CommandController::class, 'getCommandLog']);
    Route::get('/replies', [CommandController::class, 'getReplies']);
    Route::get('/', [CommandController::class, 'index']);
    Route::get('/{id}', [CommandController::class, 'show']);
});

Route::prefix('mcc/telemetry')->group(function () {
Route::get('/command-log/{commandLog}', [TelemetryController::class, 'showTelemetryByCommandLog']);
Route::get('/last', [TelemetryController::class, 'GetLastTelemetry']);
}); 