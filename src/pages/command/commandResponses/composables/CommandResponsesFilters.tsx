import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCcw } from "lucide-react";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  onRefresh: () => void;
}

export default function CommandResponsesFilters({
  search,
  setSearch,
  onRefresh,
}: Props) {
  return (
    <Card className="bg-[#1A2333] border border-gray-700">
      <CardContent className="p-4 flex flex-col md:flex-row gap-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

          <Input
            placeholder="Search reply ID..."
            className="pl-9 bg-[#0B1220] border-gray-700"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <Button
          onClick={onRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCcw size={16} />
          Refresh
        </Button>
      </CardContent>
    </Card>
  );
}