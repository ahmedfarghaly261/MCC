<?php

namespace App\Services;

use App\Models\AnomalyExplaination;
use App\Models\CommandLog;
use App\Models\TelemetryLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Request;

class DetectAnomaliesService
{
    protected const AI_FEATURE_LIST = [
        'EPS_Solar_1_V',
        'EPS_Solar_2_V',
        'EPS_Solar_3_V',
        'EPS_Solar_1_C',
        'EPS_Solar_2_C',
        'EPS_Solar_3_C',
        'EPS_VBAT',
        'EPS_IBAT',
        'EPS_BUS_1_V',
        'EPS_BUS_2_V',
        'EPS_BUS_1_C',
        'EPS_BUS_2_C',
        'EPS_Temp',
        'OBC_Latitude',
        'OBC_Longitude',
        'OBC_velN',
        'OBC_velE',
        'OBC_velD',
        'OBC_RX_CMD_Count',
        'OBC_TX_CMD_Count',
        'OBC_EPS_SRecords',
        'OBC_ADCS_SRecords',
        'ADCS_Sun_X',
        'ADCS_Sun_Y',
        'ADCS_Sun_Z',
        'ADCS_accel_x',
        'ADCS_accel_y',
        'ADCS_accel_z',
        'ADCS_Gyro_X',
        'ADCS_Gyro_Y',
        'ADCS_Gyro_Z',
        'ADCS_MM_X',
        'ADCS_MM_Y',
        'ADCS_MM_Z',
        'ADCS_RW_RPM',
        'COMM_Total_RX',
        'COMM_Correct_RX',
        'COMM_RF_Power',
        'COMM_RSSI',
        'COMM_RF_Temp',
        'COMM_RX_Current',
        'COMM_TX_I_3V3',
        'COMM_TX_I_5V',
    ];

    /**
     * Transforms EAV telemetry logs into the telemetry array the FastAPI expects.
     * Each telemetry item carries its parameter_id, parameter_name, and converted_value.
     * Missing features default to 0.0 as required by the model.
     */
    public function prepareDataForAI(CommandLog $commandLog): array
    {
        // Seed every feature with 0.0 so missing ones are filled
        $flatData = array_fill_keys(self::AI_FEATURE_LIST, 0.0);

        $commandLog->load(['telemetryLogs.parameter']);

        foreach ($commandLog->telemetryLogs as $log) {
            $paramName = $log->parameter?->parameter_name;

            if ($paramName && array_key_exists($paramName, $flatData)) {
                $flatData[$paramName] = (float) $log->converted_value;
            }
        }

        // Build the telemetry array the API expects:
        // one item per feature, preserving parameter_id from the log
        $telemetry = [];
        foreach ($commandLog->telemetryLogs as $log) {
            $paramName = $log->parameter?->parameter_name;
            if (!$paramName || !array_key_exists($paramName, $flatData)) {
                continue;
            }

            $telemetry[] = [
                'parameter_id'    => $log->parameter?->id,
                'parameter_name'  => $paramName,
                'unit'            => $log->parameter?->unit ?? null,
                'raw_value'       => $log->raw_value !== null ? (float) $log->raw_value : null,
                'converted_value' => $flatData[$paramName],
                'sampled_at'      => $log->sampled_at?->toIso8601String(),
            ];
        }

        // If no telemetry logs matched our feature list, still send all features
        // as zero-padded entries so the model always receives a full record
        if (empty($telemetry)) {
            foreach (self::AI_FEATURE_LIST as $index => $featureName) {
                $telemetry[] = [
                    'parameter_id'    => $index + 1,
                    'parameter_name'  => $featureName,
                    'unit'            => null,
                    'raw_value'       => 0.0,
                    'converted_value' => 0.0,
                    'sampled_at'      => null,
                ];
            }
        }

        return $telemetry;
    }

    /**
     * Calls the FastAPI anomaly detection service and returns the full response.
     *
     * Expected response shape:
     * [
     *   'command_log_id' => int,
     *   'has_anomaly'    => bool,
     *   'anomaly_count'  => int,
     *   'anomaly_ratio'  => float,
     *   'predictions'    => [...],
     *   'model_version'  => string,
     * ]
     */
    public function detect(CommandLog $commandLog): array
    {
        try {
            $telemetry = $this->prepareDataForAI($commandLog);

            $payload = [
                'command_log_id' => $commandLog->id,
                'telemetry'      => $telemetry,
            ];

            $response = Http::withHeaders([
                'X-API-Key' => config('services.anomaly_api.key'),
            ])
                ->timeout(config('services.anomaly_api.timeout', 15))
                ->post(config('services.anomaly_api.url') . '/detect', $payload);

            $response->throw();

            $result = $response->json();

            if (!empty($result['predictions']) && is_array($result['predictions'])) {
                $this->persistTelemetryAnomalyPredictions($commandLog, $result['predictions']);
            }

            if (!empty($result['explanation']) && is_array($result['explanation'])) {
                $this->persistAnomalyExplanation($commandLog, $result['explanation']);
            }

            return $result;
        } catch (RequestException $e) {
            $status = $e->response->status();
            $body   = $e->response->json();

            Log::error('Anomaly API HTTP error', [
                'command_log_id' => $commandLog->id,
                'status'         => $status,
                'detail'         => $body['detail'] ?? 'unknown',
            ]);

            return [
                'error'          => true,
                'message'        => $body['detail'] ?? "API returned HTTP {$status}",
                'command_log_id' => $commandLog->id,
            ];
        } catch (\Exception $e) {
            Log::error('Anomaly API call failed', [
                'command_log_id' => $commandLog->id,
                'message'        => $e->getMessage(),
            ]);

            return [
                'error'          => true,
                'message'        => $e->getMessage(),
                'command_log_id' => $commandLog->id,
            ];
        }
    }

    public function storeAnomalyResults(Request $request)
    {
        $data = $request->validate([
            'command_log_id' => 'required|integer|exists:command_logs,id',
            'predictions' => 'required|array',
            'explanation' => 'nullable|array',
            'explanation.method' => 'nullable|string',
            'explanation.subsystem' => 'nullable|string',
            'explanation.root_cause' => 'nullable|string',
            'explanation.current_val' => 'nullable',
            'explanation.confidence' => 'nullable|numeric',
            'explanation.top_3_features' => 'nullable|array',
            'explanation.top_3_features.*.feature' => 'nullable|string',
            'explanation.top_3_features.*.value' => 'nullable',
            'explanation.top_3_features.*.shap' => 'nullable|numeric',
        ]);

        DB::transaction(function () use ($data) {
            foreach ($data['predictions'] as $prediction) {
                if (! isset($prediction['parameter_id'], $prediction['is_anomaly'], $prediction['anomaly_score'])) {
                    continue;
                }

                TelemetryLog::where('parameter_id', $prediction['parameter_id'])
                    ->where('command_log_id', $data['command_log_id'])
                    ->update([
                        'is_anomaly' => (bool) $prediction['is_anomaly'],
                        'anomaly_score' => is_numeric($prediction['anomaly_score']) ? (float) $prediction['anomaly_score'] : null,
                    ]);
            }

            if (! empty($data['explanation']) && is_array($data['explanation'])) {
                $commandLog = CommandLog::findOrFail($data['command_log_id']);
                $this->persistAnomalyExplanation($commandLog, $data['explanation']);
            }
        });

        return response()->json(['message' => 'Telemetry updated with anomaly scores']);
    }

    protected function persistAnomalyExplanation(CommandLog $commandLog, array $explanation): void
    {
        AnomalyExplaination::updateOrCreate(
            ['command_log_id' => $commandLog->id],
            [
                'explaination' => [
                    'message' => $this->buildExplanationMessage($explanation)
                ],
                'root_cause' => $explanation['root_cause'] ?? null,
                'top_3_anomalies' => $explanation['top_3_features'] ?? $explanation['top_3_anomalies'] ?? [],
            ]
        );
    }

    protected function buildExplanationMessage(array $explanation): string
    {
        $subsystem = $explanation['subsystem'] ?? 'unknown';
        $rootCause = $explanation['root_cause'] ?? 'unknown';
        $currentVal = $explanation['current_val'] ?? ($explanation['current_value'] ?? 'unknown');
        $confidence = $explanation['confidence'] ?? null;

        if (is_numeric($confidence)) {
            $confidence = number_format((float) $confidence, 2);
            if ((float) $confidence <= 1 && $confidence !== '0.00') {
                $confidence = number_format((float) $confidence * 100, 2);
            }
            $confidence = "{$confidence}%";
        } elseif ($confidence === null) {
            $confidence = 'unknown%';
        }

        return sprintf(
            'Alert: Anomaly detected in %s subsystem. The root cause is identified as %s with a reading of %s. Detection confidence: %s.',
            $subsystem,
            $rootCause,
            $currentVal,
            $confidence,
        );
    }

    protected function persistTelemetryAnomalyPredictions(CommandLog $commandLog, array $predictions): void
    {
        DB::transaction(function () use ($commandLog, $predictions) {
            foreach ($predictions as $prediction) {
                if (! isset($prediction['parameter_id'], $prediction['is_anomaly'], $prediction['anomaly_score'])) {
                    continue;
                }

                TelemetryLog::where('command_log_id', $commandLog->id)
                    ->where('parameter_id', $prediction['parameter_id'])
                    ->update([
                        'is_anomaly' => (bool) $prediction['is_anomaly'],
                        'anomaly_score' => is_numeric($prediction['anomaly_score']) ? (float) $prediction['anomaly_score'] : null,
                    ]);
            }
        });
    }
}
