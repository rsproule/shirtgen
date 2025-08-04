import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Maximize2, Minimize2, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";

interface ImageResizeControlsProps {
  onResizeChange: (scale: number) => void;
  onReset: () => void;
  currentScale: number;
  disabled?: boolean;
}

const PRESET_SCALES = [
  { label: "Small", value: 0.4 },
  { label: "Medium", value: 0.6 },
  { label: "Large", value: 1.0 },
];

export function ImageResizeControls({
  onResizeChange,
  onReset,
  currentScale,
  disabled = false,
}: ImageResizeControlsProps) {
  const [scale, setScale] = useState(currentScale);
  const [debouncedScale, setDebouncedScale] = useState(currentScale);

  useEffect(() => {
    setScale(currentScale);
    setDebouncedScale(currentScale);
  }, [currentScale]);

  // Debounce the scale changes for smoother updates
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedScale(scale);
    }, 50); // 50ms debounce

    return () => clearTimeout(timer);
  }, [scale]);

  // Call the parent callback when debounced scale changes
  useEffect(() => {
    if (debouncedScale !== currentScale) {
      onResizeChange(debouncedScale);
    }
  }, [debouncedScale, currentScale, onResizeChange]);

  const handleScaleChange = (newScale: number[]) => {
    const value = newScale[0];
    setScale(value);
  };

  const handlePresetChange = (presetValue: string) => {
    const value = parseFloat(presetValue);
    setScale(value);
    setDebouncedScale(value);
    onResizeChange(value);
  };

  const handleReset = () => {
    setScale(1.0);
    setDebouncedScale(1.0);
    onReset();
  };

  // Find the closest preset value for the current scale
  const getCurrentPresetValue = () => {
    const closest = PRESET_SCALES.reduce((prev, curr) => {
      return Math.abs(curr.value - scale) < Math.abs(prev.value - scale) ? curr : prev;
    });
    return closest.value.toString();
  };

  return (
    <div className="rounded-lg border bg-card p-2 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs font-medium text-foreground">Size</Label>
        
        <ToggleGroup
          type="single"
          value={getCurrentPresetValue()}
          onValueChange={handlePresetChange}
          variant="outline"
          size="sm"
          className="grid grid-cols-3"
          disabled={disabled}
        >
          {PRESET_SCALES.map((preset) => (
            <ToggleGroupItem
              key={preset.value}
              value={preset.value.toString()}
              className="px-2 py-1 text-xs font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              {preset.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <div className="flex items-center gap-1">
          <span className="text-xs font-medium text-foreground min-w-[2.5rem] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={disabled}
            className="h-6 w-6 p-0 text-xs hover:bg-muted"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
} 