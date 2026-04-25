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
	dest_address: string;
	src_address: string;
	status: TelemetryStatus;
	sent_at: string;
	replied_at: string | null;
	response_time_ms: number | null;
	subsystem_id: number;
	subsystem_address: number;
	subsystem_mode: number;
	subsystem_time: string | null;
	subsystem_rtc: string | null;
	telemetry_count: number;
	telemetry: TelemetryReading[];
}
