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
  { label: "Small", value: 0.5 },
  { label: "Medium", value: 0.8 },
  { label: "Large", value: 1.2 },
  { label: "Extra Large", value: 1.5 },
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

  return (
    <div className="space-y-3 rounded-lg border border-border bg-background p-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Design Size</Label>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={disabled}
            className="h-6 px-2 text-xs"
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            Reset
          </Button>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="flex justify-center">
        <ToggleGroup
          type="single"
          value={scale.toString()}
          onValueChange={handlePresetChange}
          variant="outline"
          size="sm"
          className="flex-row"
          disabled={disabled}
        >
          {PRESET_SCALES.map((preset) => (
            <ToggleGroupItem
              key={preset.value}
              value={preset.value.toString()}
              className="px-2 py-1 text-xs"
            >
              {preset.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {/* Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Minimize2 className="h-3 w-3" />
            <span>Small</span>
          </div>
          <span className="font-medium">{Math.round(scale * 100)}%</span>
          <div className="flex items-center gap-1">
            <span>Large</span>
            <Maximize2 className="h-3 w-3" />
          </div>
        </div>
        <Slider
          value={[scale]}
          onValueChange={handleScaleChange}
          min={0.3}
          max={2.0}
          step={0.1}
          disabled={disabled}
          className="w-full"
        />
      </div>

      {/* Scale Info */}
      <div className="text-center text-xs text-muted-foreground">
        {scale < 0.8 && "Small design - good for subtle prints"}
        {scale >= 0.8 && scale <= 1.2 && "Standard size - balanced design"}
        {scale > 1.2 && "Large design - bold statement piece"}
      </div>
    </div>
  );
} 