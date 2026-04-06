import { Position } from "@/types/polymarketPosition";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function PositionSelect({
  address,
  selectedPosition,
  onPositionSelect,
}: {
  address: string;
  selectedPosition: Position | null;
  onPositionSelect: (position: Position | null) => void;
}) {
  const { data: positions, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const r = await fetch(
        `https://data-api.polymarket.com/positions?user=${address}`
      );
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json() as Promise<Position[]>;
    },
    staleTime: 60_000,
  });

  return (
    <div className="grid gap-3">
      <Label htmlFor="position">Position</Label>
      <Select
        value={selectedPosition?.asset.toString() ?? undefined}
        onValueChange={(value) => {
          const position =
            positions?.find(
              (position) => position.asset.toString() === value
            ) ?? null;
          onPositionSelect(position);
        }}
      >
        <SelectTrigger className="w-full min-w-0 overflow-hidden *:data-[slot=select-value]:min-w-0">
          <SelectValue placeholder="Select Position" />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="loading" disabled>
              Loading...
            </SelectItem>
          ) : positions && positions.length > 0 ? (
            positions.map((position) => (
              <SelectItem
                key={position.asset.toString()}
                value={position.asset.toString()}
                className="flex items-center gap-2"
              >
                <img
                  src={position.icon}
                  alt={position.title}
                  className="w-8 h-8 rounded-full shrink-0"
                />
                <p className="text-sm font-medium truncate min-w-0">
                  {position.title}
                </p>
                <p className="text-sm text-gray-500 shrink-0">
                  {position.currentValue.toFixed(2)}
                </p>
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-positions" disabled>
              No positions available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
