import { Image } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import SatelliteImagesSection from "../index/composables/SatelliteImagesSection";
import type { ImageRecord } from "../index/types/images.types";

interface ImageCenterTabsViewProps {
	activeTab: string;
	onTabChange: (value: string) => void;
	images: ImageRecord[];
	loading: boolean;
	onView: (image: ImageRecord) => void;
	onDownload: (image: ImageRecord) => void;
}

export default function ImageCenterTabsView({
	activeTab,
	onTabChange,
	images,
	loading,
	onView,
	onDownload,
}: ImageCenterTabsViewProps) {
	return (
		<Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
			<TabsList className="bg-[#1F2937] border border-gray-700/50 mb-6">
				<TabsTrigger
					value="images"
					className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
				>
					Satellite Images
				</TabsTrigger>
				<TabsTrigger
					value="enhanced"
					className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
				>
					Enhanced Images
				</TabsTrigger>
				<TabsTrigger
					value="object-detection"
					className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
				>
					Object Detection
				</TabsTrigger>
			</TabsList>

			<TabsContent value="images">
				<SatelliteImagesSection
					images={images}
					loading={loading}
					onView={onView}
					onDownload={onDownload}
				/>
			</TabsContent>

			<TabsContent value="enhanced">
				<div className="text-center py-12">
					<Image className="w-16 h-16 text-gray-500 mx-auto mb-4" />
					<p className="text-gray-400">Enhanced images will appear here</p>
				</div>
			</TabsContent>

			<TabsContent value="object-detection">
				<div className="text-center py-12">
					<Image className="w-16 h-16 text-gray-500 mx-auto mb-4" />
					<p className="text-gray-400">Object detection results will appear here</p>
				</div>
			</TabsContent>
		</Tabs>
	);
}
