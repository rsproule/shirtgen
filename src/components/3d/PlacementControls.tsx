import { Button } from "@/components/ui/button";
import type { TexturePlacement } from "@/types";

interface PlacementControlsProps {
  placement: TexturePlacement;
  onPlacementChange: (placement: TexturePlacement) => void;
}

export function PlacementControls({ placement, onPlacementChange }: PlacementControlsProps) {
  return (
    <div className="flex justify-center mb-4">
      <div className="flex space-x-2">
        <Button
          variant={placement === "front" ? "default" : "outline"}
          size="sm"
          onClick={() => onPlacementChange("front")}
          className="px-4 py-2"
        >
          Front
        </Button>
        <Button
          variant={placement === "back" ? "default" : "outline"}
          size="sm"
          onClick={() => onPlacementChange("back")}
          className="px-4 py-2"
        >
          Back
        </Button>
        <Button
          variant={placement === "full-shirt" ? "default" : "outline"}
          size="sm"
          onClick={() => onPlacementChange("full-shirt")}
          className="px-4 py-2"
        >
          Full Shirt
        </Button>
      </div>
    </div>
  );
}