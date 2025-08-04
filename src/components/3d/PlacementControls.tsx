import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { TexturePlacement } from "@/types";

interface PlacementControlsProps {
  placement: TexturePlacement;
  onPlacementChange: (placement: TexturePlacement) => void;
}

export function PlacementControls({
  placement,
  onPlacementChange,
}: PlacementControlsProps) {
  return (
    <div className="flex justify-center">
      <ToggleGroup
        type="single"
        value={placement}
        onValueChange={value => {
          if (value) onPlacementChange(value as TexturePlacement);
        }}
        variant="outline"
        size="sm"
        className="grid grid-cols-3"
      >
        <ToggleGroupItem 
          value="front" 
          className="px-3 py-1.5 text-xs font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
          Front
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="back" 
          className="px-3 py-1.5 text-xs font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
          Back
        </ToggleGroupItem>
        <ToggleGroupItem
          value="full-shirt"
          className="px-3 py-1.5 text-xs font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
          Full Shirt
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
