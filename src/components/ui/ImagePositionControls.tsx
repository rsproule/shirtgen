import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Move, RotateCcw } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface ImagePositionControlsProps {
  onPositionChange: (position: { x: number; y: number }) => void;
  onReset: () => void;
  currentPosition: { x: number; y: number };
  disabled?: boolean;
}

export function ImagePositionControls({
  onPositionChange,
  onReset,
  currentPosition,
  disabled = false,
}: ImagePositionControlsProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - currentPosition.x * 100,
      y: e.clientY - currentPosition.y * 100,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || disabled) return;

    const newX = (e.clientX - dragStart.x) / 100;
    const newY = (e.clientY - dragStart.y) / 100;

    // Clamp values to reasonable bounds (-1 to 1)
    const clampedX = Math.max(-1, Math.min(1, newX));
    const clampedY = Math.max(-1, Math.min(1, newY));

    onPositionChange({ x: clampedX, y: clampedY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, currentPosition, disabled]);

  const handleReset = () => {
    onReset();
  };

  return (
    <div className="space-y-3 rounded-lg border border-border bg-background p-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Design Position</Label>
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

      {/* Drag Area */}
      <div className="space-y-2">
        <div className="text-center text-xs text-muted-foreground">
          Drag to position your design
        </div>
        
        <div
          ref={containerRef}
          className="relative h-32 w-full cursor-move rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:border-gray-400"
          onMouseDown={handleMouseDown}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          {/* Design indicator dot */}
          <div
            className="absolute h-4 w-4 rounded-full bg-primary shadow-lg"
            style={{
              left: `${((currentPosition.x + 1) / 2) * 100}%`,
              top: `${((currentPosition.y + 1) / 2) * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
          
          {/* Center crosshair */}
          <div className="absolute left-1/2 top-1/2 h-full w-px bg-gray-300" />
          <div className="absolute left-1/2 top-1/2 h-px w-full bg-gray-300" />
          
          {/* Corner indicators */}
          <div className="absolute left-2 top-2 text-xs text-gray-400">↖</div>
          <div className="absolute right-2 top-2 text-xs text-gray-400">↗</div>
          <div className="absolute left-2 bottom-2 text-xs text-gray-400">↙</div>
          <div className="absolute right-2 bottom-2 text-xs text-gray-400">↘</div>
        </div>

        {/* Position coordinates */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>X: {currentPosition.x.toFixed(2)}</span>
          <span>Y: {currentPosition.y.toFixed(2)}</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center text-xs text-muted-foreground">
        <Move className="mx-auto mb-1 h-4 w-4" />
        Click and drag to move your design around the shirt
      </div>
    </div>
  );
} 