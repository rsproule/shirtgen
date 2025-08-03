import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useShirtData } from "@/context/ShirtDataContext";

const SHIRT_COLORS = [
  { name: "White", color: "#f8f8f8", description: "Off-white" },
  { name: "Shadow", color: "#2a2a2a", description: "Charcoal black" },
  { name: "Oatmeal", color: "#d2b48c", description: "Warm oatmeal" },
  { name: "Cream", color: "#f5f5dc", description: "Warm cream" },
];

export function ShirtColorPicker() {
  const { shirtColor, setShirtColor } = useShirtData();

  const handleColorClick = (color: string) => {
    setShirtColor(color);
  };

  return (
    <div className="flex justify-center">
      <TooltipProvider>
        <div className="flex gap-1">
          {SHIRT_COLORS.map(colorOption => (
            <Tooltip key={colorOption.color}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => handleColorClick(colorOption.color)}
                  className={`h-8 w-8 rounded transition-all ${
                    shirtColor === colorOption.color
                      ? "ring-2 ring-gray-800 ring-offset-1"
                      : ""
                  }`}
                  style={{ backgroundColor: colorOption.color }}
                  aria-label={`Select ${colorOption.name} shirt color`}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>{colorOption.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
}
