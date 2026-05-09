import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { useLayoutLoading } from "@/components/layout/layoutLoadingContext";
import SatelliteOverviewHeader from "./composables/SatelliteOverviewHeader";
import SatelliteOverviewStats from "./composables/SatelliteOverviewStats";
import SatelliteOverviewList from "./composables/SatelliteOverviewList";
import { getSatellites } from "./services/satellite.service";
import type { SatelliteData } from "./types/satellite.types";

export default function SatelliteOverviewView() {
	const { setGlobalLoading } = useLayoutLoading();
	const [satellites, setSatellites] = useState<SatelliteData[]>([]);
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] =
		useState<string | null>(null);

	const loadSatellites = useCallback(async () => {
		setLoading(true);
		setGlobalLoading(true);
		setErrorMessage(null);

		try {
			const data = await getSatellites();
			setSatellites(data);
		} catch (error) {
			if (isAxiosError(error)) {
				setErrorMessage(
					error.response?.data?.message ??
						"Failed to load satellites.",
				);
			} else {
				setErrorMessage("Failed to load satellites.");
			}
		} finally {
			setLoading(false);
			setGlobalLoading(false);
		}
	}, [setGlobalLoading]);

	useEffect(() => {
		void loadSatellites();
	}, [loadSatellites]);

	return (
		<div className="p-8 space-y-6">
			<SatelliteOverviewHeader />

			{errorMessage && (
				<div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3">
					<p className="text-sm text-red-300">{errorMessage}</p>
				</div>
			)}

			{!loading && <SatelliteOverviewStats satellites={satellites} />}

			{loading && satellites.length === 0 ? (
				<div className="rounded-lg border border-slate-700/50 bg-[#1F2937] p-8 text-center text-sm text-slate-400">
					Loading satellites...
				</div>
			) : (
				<SatelliteOverviewList satellites={satellites} />
			)}
		</div>
	);
}
