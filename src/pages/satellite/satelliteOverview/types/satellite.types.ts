export interface SatelliteSubsystem {
	id: number;
	name: string;
	satellite_id: number;
	hex_code: string;
	description: string;
	mode: string;
	created_at: string;
	updated_at: string;
}

export interface SatelliteData {
	id: number;
	norad_id: number;
	name: string;
	cospar_id: string;
	owner_country: string;
	status: string;
	launch_date: string;
	description: string;
	created_at: string;
	updated_at: string;
	subsystems: SatelliteSubsystem[];
}
