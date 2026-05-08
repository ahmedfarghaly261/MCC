<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TelemetryParameterController;
use App\Http\Controllers\CommandController;
use App\Http\Controllers\TelemetryController;
use App\Http\Controllers\AnomalyExplainationController;
use App\Http\Controllers\SatelliteController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Route::apiResource('telemetry-parameters', TelemetryParameterController::class);

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
    Route::post('/decode', [TelemetryController::class, 'decode']);
    Route::post('/decode/batch', [TelemetryController::class, 'decodeBatch']);
});

Route::prefix('mcc/ai-insights/anomalies')->group(function () {
    Route::get('/', [AnomalyExplainationController::class, 'index']);
    Route::get('/command-log/{commandLog}', [AnomalyExplainationController::class, 'showByCommandLog']);
});

Route::prefix('mcc/satellite')->group(function () {
    Route::get('/', [SatelliteController::class, 'index']);
    Route::get('/status', [SatelliteController::class, 'getStatus']);
    Route::get('/next-pass', [SatelliteController::class, 'getNextPass']);
    Route::get('/visibility-check', [SatelliteController::class, 'checkVisibility']);
});