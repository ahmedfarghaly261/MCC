import { Image } from "lucide-react";

export default function ImageIndexHeader() {
	return (
		<div className="flex items-center gap-4">
			<div className="w-14 h-14 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
				<Image className="w-7 h-7 text-blue-400" />
			</div>

			<div>
				<h1 className="text-white text-lg font-semibold">Images &amp; Received Data</h1>
				<p className="text-gray-400 text-sm">Satellite imagery, signals, and processed data</p>
			</div>
		</div>
	);
}
