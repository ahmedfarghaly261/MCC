export interface TelemetryParameter {
	id: number;
	name: string;
	unit: string | null;
}

export interface TelemetryReading {
	id: number;
	parameter: TelemetryParameter;
	raw_value: number;
	converted_value: number;
	unit: string | null;
	sampled_at: string;
	is_anomaly: boolean;
	anomaly_score: number | null;
}

export type TelemetryStatus =
	| "telemetry_received"
	| "pending"
	| "error"
	| "timeout"
	| string;

export interface TelemetryResponse {
	command_log_id: number;
	command_id: number;
	dest_address: string | number;
	src_address: string | number;
	status: TelemetryStatus;
	sent_at: string;
	replied_at: string | null;
	response_time_ms: number | null;
	is_anomaly: boolean;
	anomaly_score: number | null;
	subsystem_id: number;
	subsystem_address: number;
	subsystem_mode: number;
	subsystem_time: string | number | null;
	subsystem_rtc: string | number | null;
	telemetry_count: number;
	telemetry: TelemetryReading[];
}
